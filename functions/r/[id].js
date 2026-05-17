import { isBot } from '../_lib/botDetect.js';
import { resolveLocale, toOgLocale } from '../_lib/locale.js';
import { fetchRestaurant } from '../_lib/apiClient.js';
import { buildMetaTags, pickOgImage, truncateDescription } from '../_lib/meta.js';
import { cacheControlForRestaurant } from '../_lib/cache.js';
import { escapeHtml } from '../_lib/html.js';
import { renderShell } from '../_lib/pageShell.js';
import { t } from '../_lib/i18n.js';

export async function onRequest({ request, params }) {
  const id = (params.id || '').trim();
  const userAgent = request.headers.get('User-Agent') || '';
  const canonicalUrl = `https://www.getzampa.com/r/${encodeURIComponent(id)}`;
  const locale = resolveLocale(request);
  const data = await fetchRestaurant(id);

  if (isBot(userAgent)) {
    return renderBotResponse({ canonicalUrl, locale, data });
  }

  return renderBrowserResponse({ canonicalUrl, locale, id, data });
}

function renderBotResponse({ canonicalUrl, locale, data }) {
  const exists = Boolean(data?.exists);
  const restaurant = data?.restaurant || null;
  const ogLocale = toOgLocale(locale);

  let title;
  let description;
  let imageAlt;

  if (exists && restaurant?.name) {
    title = t(locale, 'share.restaurant.title', { name: restaurant.name });
    description = buildRestaurantDescription(locale, restaurant);
    imageAlt = restaurant.name;
  } else {
    title = t(locale, 'share.brand.tagline');
    description = t(locale, 'share.brand.description');
    imageAlt = 'Zampa';
  }

  const imageUrl = pickOgImage(
    exists && restaurant?.id ? { merchantId: restaurant.id } : {}
  );

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
      'Cache-Control': cacheControlForRestaurant({ exists }),
    },
  });
}

// Builds the bot-path description. Priority:
//   1. restaurant.description (truncated to 200 chars, no translation —
//      it's user content from Firestore)
//   2. localized "Restaurant in {city} · {cuisines}" template, falling
//      through fallback_city / fallback_cuisines / fallback_zampa
//      depending on which pieces are present.
function buildRestaurantDescription(locale, restaurant) {
  if (restaurant.description) {
    return truncateDescription(restaurant.description, 200);
  }
  const city = restaurant.city || null;
  const cuisines = formatCuisines(restaurant.cuisineTypes);
  if (city && cuisines) return t(locale, 'share.restaurant.fallback_full', { city, cuisines });
  if (city) return t(locale, 'share.restaurant.fallback_city', { city });
  if (cuisines) return t(locale, 'share.restaurant.fallback_cuisines', { cuisines });
  return t(locale, 'share.restaurant.fallback_zampa');
}

// First two cuisine types only (keeps the meta tag short), joined by " · ".
// Capitalize-first-letter is applied defensively: idempotent on existing
// PascalCase seed data ("Italiana", "Street Food") and normalizes any
// hypothetical lowercase entries to title-case.
function formatCuisines(types) {
  if (!Array.isArray(types) || types.length === 0) return null;
  const cleaned = types
    .filter((c) => typeof c === 'string' && c.trim())
    .slice(0, 2)
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1));
  return cleaned.length ? cleaned.join(' · ') : null;
}

function renderBrowserResponse({ canonicalUrl, locale, id, data }) {
  const exists = Boolean(data?.exists);
  const restaurant = data?.restaurant || null;

  let title;
  let mainContent;

  if (exists && restaurant?.name) {
    title = t(locale, 'share.restaurant.title', { name: restaurant.name });
    mainContent = renderRestaurantExistsMain({ locale, id, restaurant });
  } else {
    // "{not_found_title} · Zampa" — brand suffix is hardcoded because Zampa
    // doesn't translate and · is locale-neutral.
    title = `${t(locale, 'share.restaurant.not_found_title')} · Zampa`;
    mainContent = renderRestaurantMissingMain({ locale });
  }

  const html = renderShell({ title, canonicalUrl, mainContent, locale });

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': cacheControlForRestaurant({ exists }),
    },
  });
}

function renderRestaurantExistsMain({ locale, id, restaurant }) {
  // Route the visible hero through the same resizer used for og:image so
  // scrapers and humans see byte-identical 1200×630 JPEGs and share the 24h
  // resizer cache. The resizer 302-falls-back internally if the entity has
  // no photo.
  const heroImage = pickOgImage({ merchantId: restaurant.id });

  const subtitleText = buildSubtitle(restaurant);
  const subtitleBlock = subtitleText
    ? `<p class="share-restaurant">${escapeHtml(subtitleText)}</p>`
    : '';

  const descriptionBlock = restaurant.description
    ? `<p class="share-description">${escapeHtml(restaurant.description)}</p>`
    : '';

  return `
    <img class="share-hero" src="${escapeHtml(heroImage)}" alt="${escapeHtml(restaurant.name)}" loading="eager">
    <h1 class="share-title">${escapeHtml(restaurant.name)}</h1>
    ${subtitleBlock}
    ${descriptionBlock}
    <div class="share-ctas">
      <a class="share-cta share-cta--primary" href="zampa://r/${escapeHtml(id)}">${escapeHtml(t(locale, 'share.cta.open_in_zampa'))}</a>
      <a class="share-cta share-cta--secondary" href="/download.html">${escapeHtml(t(locale, 'footer.download'))}</a>
    </div>
  `;
}

function renderRestaurantMissingMain({ locale }) {
  return `
    <h1 class="share-title">${escapeHtml(t(locale, 'share.restaurant.not_found_title'))}</h1>
    <p class="share-description">${escapeHtml(t(locale, 'share.restaurant.missing_explanation'))}</p>
    <div class="share-ctas">
      <a class="share-cta share-cta--primary" href="/download.html">${escapeHtml(t(locale, 'share.cta.download_zampa'))}</a>
    </div>
  `;
}

// "City · Cuisine1 · Cuisine2" — degrades gracefully if either is missing.
// Returns null when nothing usable is present so callers can omit the line.
function buildSubtitle(restaurant) {
  const parts = [];
  if (restaurant.city) parts.push(restaurant.city);
  const cuisines = formatCuisines(restaurant.cuisineTypes);
  if (cuisines) parts.push(cuisines);
  return parts.length ? parts.join(' · ') : null;
}
