import { isBot } from '../_lib/botDetect.js';
import { resolveLocale, toOgLocale, toIntlLocale } from '../_lib/locale.js';
import { fetchOffer } from '../_lib/apiClient.js';
import { buildMetaTags, pickOgImage, truncateDescription } from '../_lib/meta.js';
import { cacheControlForOffer } from '../_lib/cache.js';
import { escapeHtml } from '../_lib/html.js';
import { renderShell } from '../_lib/pageShell.js';
import { t } from '../_lib/i18n.js';

export async function onRequest({ request, params }) {
  const id = (params.id || '').trim();
  const userAgent = request.headers.get('User-Agent') || '';
  const canonicalUrl = `https://www.getzampa.com/o/${encodeURIComponent(id)}`;
  const locale = resolveLocale(request);
  const data = await fetchOffer(id);

  if (isBot(userAgent)) {
    return renderBotResponse({ canonicalUrl, locale, data, id });
  }

  return renderBrowserResponse({ canonicalUrl, locale, id, data });
}

function renderBotResponse({ canonicalUrl, locale, data, id }) {
  const offerExists = Boolean(data?.exists);
  const offer = data?.offer || null;
  const restaurant = data?.restaurant || null;
  const ogLocale = toOgLocale(locale);

  let title;
  let description;
  let imageAlt;

  if (offerExists && offer) {
    const rName = restaurant?.name || '';
    title = rName
      ? t(locale, 'share.offer.title_with_restaurant', {
          offer_title: offer.title,
          restaurant_name: rName,
        })
      : offer.title;
    description = offer.description
      ? truncateDescription(offer.description, 200)
      : t(locale, 'share.offer.fallback_description');
    imageAlt = offer.title;
  } else if (restaurant) {
    title = t(locale, 'share.restaurant.in_zampa', { name: restaurant.name });
    description = t(locale, 'share.offer.expired_with_known_restaurant_meta_desc');
    imageAlt = restaurant.name;
  } else {
    title = t(locale, 'share.brand.tagline');
    description = t(locale, 'share.brand.description');
    imageAlt = 'Zampa';
  }

  const imageUrl = pickOgImage({
    offerId: id,
    offerHasImage: Boolean(offerExists && offer?.imageUrl),
    merchantId: restaurant?.id,
  });

  const metaTags = buildMetaTags({
    url: canonicalUrl,
    title,
    description,
    imageUrl,
    imageAlt,
    ogLocale,
  });

  const htmlLang = ogLocale.split('_')[0];
  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(htmlLang)}">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  ${metaTags}
</head>
<body>
  <a href="${escapeHtml(canonicalUrl)}">${escapeHtml(title)}</a>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': cacheControlForOffer({ exists: offerExists }),
    },
  });
}

function renderBrowserResponse({ canonicalUrl, locale, id, data }) {
  const offerExists = Boolean(data?.exists);
  const offer = data?.offer || null;
  const restaurant = data?.restaurant || null;

  let title;
  let mainContent;

  if (offerExists && offer) {
    title = restaurant?.name
      ? t(locale, 'share.offer.title_with_restaurant', {
          offer_title: offer.title,
          restaurant_name: restaurant.name,
        })
      : offer.title;
    mainContent = renderOfferExistsMain({ locale, id, offer, restaurant });
  } else if (restaurant) {
    title = t(locale, 'share.offer.expired_with_name', { name: restaurant.name });
    mainContent = renderOfferExpiredMain({ locale, restaurant });
  } else {
    title = t(locale, 'share.offer.expired_with_name', { name: 'Zampa' });
    mainContent = renderOfferMissingMain({ locale });
  }

  const html = renderShell({ title, canonicalUrl, mainContent, locale });

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': cacheControlForOffer({ exists: offerExists }),
    },
  });
}

function renderOfferExistsMain({ locale, id, offer, restaurant }) {
  // Route the visible hero through the same resizer used for og:image so
  // scrapers and humans see byte-identical 1200×630 JPEGs and share the 24h
  // resizer cache. The resizer 302-falls-back internally if the entity has
  // no photo.
  const imageUrl = pickOgImage({
    offerId: id,
    offerHasImage: Boolean(offer.imageUrl),
    merchantId: restaurant?.id,
  });
  const priceText = formatPrice(offer.price, offer.currency, locale);

  const priceBlock = priceText
    ? `<p class="share-price">${escapeHtml(priceText)}</p>`
    : '';
  const descriptionBlock = offer.description
    ? `<p class="share-description">${escapeHtml(offer.description)}</p>`
    : '';

  // Subtitle "{connector} {name_link} · {city}" is built with the
  // share.offer.in_restaurant_subtitle template. {name_link} is pre-built
  // escaped HTML; {city} is pre-escaped plain text. The template is
  // interpolated raw into the page, so any user data must be pre-escaped.
  let restaurantBlock = '';
  if (restaurant?.id) {
    const nameLink = `<a href="/r/${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</a>`;
    const cityText = restaurant.city ? escapeHtml(restaurant.city) : '';
    let subtitleHtml = t(locale, 'share.offer.in_restaurant_subtitle', {
      name_link: nameLink,
      city: cityText,
    });
    // If the locale's template ends with " · {city}" and city is empty, the
    // result has a trailing " · " — strip it for visual cleanliness.
    if (!cityText) subtitleHtml = subtitleHtml.replace(/\s·\s*$/, '').trimEnd();
    restaurantBlock = `<p class="share-restaurant">${subtitleHtml}</p>`;
  }

  return `
    <img class="share-hero" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(offer.title)}" loading="eager">
    <h1 class="share-title">${escapeHtml(offer.title)}</h1>
    ${priceBlock}
    ${descriptionBlock}
    ${restaurantBlock}
    <div class="share-ctas">
      <a class="share-cta share-cta--primary" href="zampa://o/${escapeHtml(id)}">${escapeHtml(t(locale, 'share.cta.open_in_zampa'))}</a>
      <a class="share-cta share-cta--secondary" href="/download.html">${escapeHtml(t(locale, 'footer.download'))}</a>
    </div>
  `;
}

function renderOfferExpiredMain({ locale, restaurant }) {
  // Same resizer rationale as renderOfferExistsMain.
  const cardImage = pickOgImage({ merchantId: restaurant.id });
  const cityLine = restaurant.city
    ? `<span class="share-card-meta">${escapeHtml(restaurant.city)}</span>`
    : '';

  return `
    <h1 class="share-title">${escapeHtml(t(locale, 'share.offer.expired_title'))}</h1>
    <p class="share-description">${escapeHtml(t(locale, 'share.offer.expired_explanation'))}</p>
    <div class="share-card">
      <img class="share-card-image" src="${escapeHtml(cardImage)}" alt="" loading="lazy">
      <div class="share-card-text">
        <span class="share-card-name">${escapeHtml(restaurant.name)}</span>
        ${cityLine}
      </div>
    </div>
    <div class="share-ctas">
      <a class="share-cta share-cta--primary" href="/r/${escapeHtml(restaurant.id)}">${escapeHtml(t(locale, 'share.cta.view_restaurant_profile'))}</a>
      <a class="share-cta share-cta--secondary" href="/download.html">${escapeHtml(t(locale, 'footer.download'))}</a>
    </div>
  `;
}

function renderOfferMissingMain({ locale }) {
  return `
    <h1 class="share-title">${escapeHtml(t(locale, 'share.offer.expired_title'))}</h1>
    <p class="share-description">${escapeHtml(t(locale, 'share.offer.missing_explanation'))}</p>
    <div class="share-ctas">
      <a class="share-cta share-cta--primary" href="/download.html">${escapeHtml(t(locale, 'share.cta.download_zampa'))}</a>
    </div>
  `;
}

function formatPrice(price, currency, locale) {
  if (price === null || price === undefined || price === '') return null;
  const numeric = parseFloat(price);
  if (!Number.isFinite(numeric)) return null;
  try {
    return new Intl.NumberFormat(toIntlLocale(locale), {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(numeric);
  } catch {
    return null;
  }
}
