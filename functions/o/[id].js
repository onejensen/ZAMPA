import { isBot } from '../_lib/botDetect.js';
import { resolveLocale, toOgLocale } from '../_lib/locale.js';
import { fetchOffer } from '../_lib/apiClient.js';
import { buildMetaTags, pickOgImage } from '../_lib/meta.js';
import { cacheControlForOffer } from '../_lib/cache.js';
import { escapeHtml } from '../_lib/html.js';

export async function onRequestGet({ request, params }) {
  const id = (params.id || '').trim();
  const userAgent = request.headers.get('User-Agent') || '';

  if (isBot(userAgent)) {
    const ogLocale = toOgLocale(resolveLocale(request));
    const canonicalUrl = `https://www.getzampa.com/o/${encodeURIComponent(id)}`;
    const data = await fetchOffer(id);
    return renderBotResponse({ canonicalUrl, ogLocale, data });
  }

  // TODO(sub-commit 2): replace this stub with the full minimalist browser landing.
  return renderBrowserStub();
}

function renderBotResponse({ canonicalUrl, ogLocale, data }) {
  const offerExists = Boolean(data?.exists);
  const offer = data?.offer || null;
  const restaurant = data?.restaurant || null;

  let title;
  let description;
  let imageAlt;

  if (offerExists && offer) {
    const rName = restaurant?.name || '';
    title = rName ? `${offer.title} · ${rName}` : offer.title;
    description = offer.description || 'Descubre ofertas y menús del día cerca de ti en Zampa.';
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
    offerImage: offer?.imageUrl,
    restaurantCover: restaurant?.coverImageUrl,
    restaurantLogo: restaurant?.logoUrl,
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
    body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; max-width: 480px; margin: 0 auto; text-align: center; color: #1A1A2E; }
    a { color: #FAAF32; font-weight: 600; text-decoration: none; }
  </style>
</head>
<body>
  <p>Esta página se está construyendo.</p>
  <p><a href="/download">Descarga la app de Zampa</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
