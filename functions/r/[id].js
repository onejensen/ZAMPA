import { isBot } from '../_lib/botDetect.js';
import { resolveLocale, toOgLocale } from '../_lib/locale.js';
import { fetchRestaurant } from '../_lib/apiClient.js';
import { buildMetaTags, pickOgImage, truncateDescription } from '../_lib/meta.js';
import { cacheControlForRestaurant } from '../_lib/cache.js';
import { escapeHtml } from '../_lib/html.js';
import { renderShell } from '../_lib/pageShell.js';

export async function onRequestGet({ request, params }) {
  const id = (params.id || '').trim();
  const userAgent = request.headers.get('User-Agent') || '';
  const canonicalUrl = `https://www.getzampa.com/r/${encodeURIComponent(id)}`;
  const data = await fetchRestaurant(id);

  if (isBot(userAgent)) {
    const ogLocale = toOgLocale(resolveLocale(request));
    return renderBotResponse({ canonicalUrl, ogLocale, data });
  }

  return renderBrowserResponse({ canonicalUrl, id, data });
}

function renderBotResponse({ canonicalUrl, ogLocale, data }) {
  const exists = Boolean(data?.exists);
  const restaurant = data?.restaurant || null;

  let title;
  let description;
  let imageAlt;

  if (exists && restaurant?.name) {
    title = `${restaurant.name} · Zampa`;
    description = buildRestaurantDescription(restaurant);
    imageAlt = `${restaurant.name} en Zampa`;
  } else {
    title = 'Zampa — descubre ofertas y menús del día';
    description = 'Encuentra ofertas y menús del día en bares y restaurantes cerca de ti.';
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
//   1. restaurant.description (truncated to 200 chars)
//   2. "Restaurante en {city} · {cuisines}" — falls back through whichever
//      pieces are present
//   3. "Restaurante en Zampa" — final fallback when nothing usable exists
function buildRestaurantDescription(restaurant) {
  if (restaurant.description) {
    return truncateDescription(restaurant.description, 200);
  }
  const city = restaurant.city || null;
  const cuisines = formatCuisines(restaurant.cuisineTypes);
  if (city && cuisines) return `Restaurante en ${city} · ${cuisines}`;
  if (city) return `Restaurante en ${city}`;
  if (cuisines) return `Restaurante en Zampa · ${cuisines}`;
  return 'Restaurante en Zampa';
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

function renderBrowserResponse({ canonicalUrl, id, data }) {
  const exists = Boolean(data?.exists);
  const restaurant = data?.restaurant || null;

  let title;
  let mainContent;

  if (exists && restaurant?.name) {
    title = `${restaurant.name} · Zampa`;
    mainContent = renderRestaurantExistsMain({ id, restaurant });
  } else {
    title = 'Restaurante no encontrado · Zampa';
    mainContent = renderRestaurantMissingMain();
  }

  const html = renderShell({ title, canonicalUrl, mainContent });

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': cacheControlForRestaurant({ exists }),
    },
  });
}

function renderRestaurantExistsMain({ id, restaurant }) {
  // Visible hero uses raw image URLs (cover then logo then static fallback),
  // following the same pattern as /o/[id]'s body images. The polish commit
  // may revisit this to route hero images through the /i/m/{id} resizer for
  // 1200×630 normalization + 24h cache.
  const heroImage =
    restaurant.coverImageUrl ||
    restaurant.logoUrl ||
    '/assets/og-image-v2.png';

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
      <a class="share-cta share-cta--primary" href="zampa://r/${escapeHtml(id)}">Abrir en Zampa</a>
      <a class="share-cta share-cta--secondary" href="/download.html">Descargar app</a>
    </div>
  `;
}

function renderRestaurantMissingMain() {
  return `
    <h1 class="share-title">No hemos encontrado este restaurante</h1>
    <p class="share-description">El enlace puede haber caducado o el restaurante ya no está disponible. Descubre más restaurantes y ofertas en Zampa.</p>
    <div class="share-ctas">
      <a class="share-cta share-cta--primary" href="/download.html">Explorar restaurantes en Zampa</a>
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
