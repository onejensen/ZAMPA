import { isBot } from '../_lib/botDetect.js';
import { resolveLocale, toOgLocale } from '../_lib/locale.js';
import { fetchRestaurant } from '../_lib/apiClient.js';
import { buildMetaTags, pickOgImage, truncateDescription } from '../_lib/meta.js';
import { cacheControlForRestaurant } from '../_lib/cache.js';
import { escapeHtml } from '../_lib/html.js';

export async function onRequestGet({ request, params }) {
  const id = (params.id || '').trim();
  const userAgent = request.headers.get('User-Agent') || '';
  const canonicalUrl = `https://www.getzampa.com/r/${encodeURIComponent(id)}`;
  const data = await fetchRestaurant(id);

  if (isBot(userAgent)) {
    const ogLocale = toOgLocale(resolveLocale(request));
    return renderBotResponse({ canonicalUrl, ogLocale, data });
  }

  // TODO(sub-commit 2): replace this stub with the full minimalist browser landing.
  return renderBrowserStub();
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

function renderBrowserStub() {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <title>Zampa</title>
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; max-width: 480px; margin: 0 auto; text-align: center; color: #2D3436; }
    a { color: #FAAF32; font-weight: 600; text-decoration: none; }
  </style>
</head>
<body>
  <p>Esta página se está construyendo.</p>
  <p><a href="/download.html">Descarga la app de Zampa</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
