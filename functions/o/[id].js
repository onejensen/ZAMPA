import { isBot } from '../_lib/botDetect.js';
import { resolveLocale, toOgLocale } from '../_lib/locale.js';
import { fetchOffer } from '../_lib/apiClient.js';
import { buildMetaTags, pickOgImage, truncateDescription } from '../_lib/meta.js';
import { cacheControlForOffer } from '../_lib/cache.js';
import { escapeHtml } from '../_lib/html.js';
import { renderShell } from '../_lib/pageShell.js';

export async function onRequest({ request, params }) {
  const id = (params.id || '').trim();
  const userAgent = request.headers.get('User-Agent') || '';
  const canonicalUrl = `https://www.getzampa.com/o/${encodeURIComponent(id)}`;
  const data = await fetchOffer(id);

  if (isBot(userAgent)) {
    const ogLocale = toOgLocale(resolveLocale(request));
    return renderBotResponse({ canonicalUrl, ogLocale, data, id });
  }

  return renderBrowserResponse({ canonicalUrl, id, data });
}

function renderBotResponse({ canonicalUrl, ogLocale, data, id }) {
  const offerExists = Boolean(data?.exists);
  const offer = data?.offer || null;
  const restaurant = data?.restaurant || null;

  let title;
  let description;
  let imageAlt;

  if (offerExists && offer) {
    const rName = restaurant?.name || '';
    title = rName ? `${offer.title} · ${rName}` : offer.title;
    description = offer.description
      ? truncateDescription(offer.description, 200)
      : 'Descubre ofertas y menús del día cerca de ti en Zampa.';
    imageAlt = rName ? `${offer.title} en ${rName}` : offer.title;
  } else if (restaurant) {
    title = `${restaurant.name} en Zampa`;
    description = 'Esta oferta ya no está disponible, pero el restaurante sigue en Zampa.';
    imageAlt = `${restaurant.name} en Zampa`;
  } else {
    title = 'Zampa — descubre ofertas y menús del día';
    description = 'Encuentra ofertas y menús del día en bares y restaurantes cerca de ti.';
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

function renderBrowserResponse({ canonicalUrl, id, data }) {
  const offerExists = Boolean(data?.exists);
  const offer = data?.offer || null;
  const restaurant = data?.restaurant || null;

  let title;
  let mainContent;

  if (offerExists && offer) {
    title = restaurant?.name ? `${offer.title} · ${restaurant.name}` : offer.title;
    mainContent = renderOfferExistsMain({ id, offer, restaurant });
  } else if (restaurant) {
    title = `Esta oferta ya no está disponible · ${restaurant.name}`;
    mainContent = renderOfferExpiredMain({ restaurant });
  } else {
    title = 'Esta oferta ya no está disponible · Zampa';
    mainContent = renderOfferMissingMain();
  }

  const html = renderShell({ title, canonicalUrl, mainContent });

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': cacheControlForOffer({ exists: offerExists }),
    },
  });
}

function renderOfferExistsMain({ id, offer, restaurant }) {
  // Route the visible hero through the same resizer used for og:image so
  // scrapers and humans see byte-identical 1200×630 JPEGs and share the 24h
  // resizer cache. The resizer 302-falls-back internally if the entity has
  // no photo.
  const imageUrl = pickOgImage({
    offerId: id,
    offerHasImage: Boolean(offer.imageUrl),
    merchantId: restaurant?.id,
  });
  const priceText = formatPrice(offer.price, offer.currency);

  const priceBlock = priceText
    ? `<p class="share-price">${escapeHtml(priceText)}</p>`
    : '';
  const descriptionBlock = offer.description
    ? `<p class="share-description">${escapeHtml(offer.description)}</p>`
    : '';
  const restaurantBlock = restaurant?.id
    ? `<p class="share-restaurant">en <a href="/r/${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</a>${
        restaurant.city ? ` · ${escapeHtml(restaurant.city)}` : ''
      }</p>`
    : '';

  return `
    <img class="share-hero" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(offer.title)}" loading="eager">
    <h1 class="share-title">${escapeHtml(offer.title)}</h1>
    ${priceBlock}
    ${descriptionBlock}
    ${restaurantBlock}
    <div class="share-ctas">
      <a class="share-cta share-cta--primary" href="zampa://o/${escapeHtml(id)}">Abrir en Zampa</a>
      <a class="share-cta share-cta--secondary" href="/download.html">Descargar app</a>
    </div>
  `;
}

function renderOfferExpiredMain({ restaurant }) {
  // Same resizer rationale as renderOfferExistsMain.
  const cardImage = pickOgImage({ merchantId: restaurant.id });
  const cityLine = restaurant.city
    ? `<span class="share-card-meta">${escapeHtml(restaurant.city)}</span>`
    : '';

  return `
    <h1 class="share-title">Esta oferta ya no está disponible</h1>
    <p class="share-description">El restaurante puede haber actualizado su carta. Echa un vistazo a su perfil para ver qué propone hoy.</p>
    <div class="share-card">
      <img class="share-card-image" src="${escapeHtml(cardImage)}" alt="" loading="lazy">
      <div class="share-card-text">
        <span class="share-card-name">${escapeHtml(restaurant.name)}</span>
        ${cityLine}
      </div>
    </div>
    <div class="share-ctas">
      <a class="share-cta share-cta--primary" href="/r/${escapeHtml(restaurant.id)}">Ver perfil del restaurante</a>
      <a class="share-cta share-cta--secondary" href="/download.html">Descargar app</a>
    </div>
  `;
}

function renderOfferMissingMain() {
  return `
    <h1 class="share-title">Esta oferta ya no está disponible</h1>
    <p class="share-description">El enlace puede haber caducado o la oferta ya no está activa. Descubre más ofertas en Zampa.</p>
    <div class="share-ctas">
      <a class="share-cta share-cta--primary" href="/download.html">Descargar Zampa</a>
    </div>
  `;
}

// Hardcoded 'es-ES' for now. The end-of-session i18n pass will replace this
// with the dynamic locale resolved from the request.
function formatPrice(price, currency) {
  if (price === null || price === undefined || price === '') return null;
  const numeric = parseFloat(price);
  if (!Number.isFinite(numeric)) return null;
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(numeric);
  } catch {
    return null;
  }
}
