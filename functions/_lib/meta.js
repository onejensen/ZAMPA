import { escapeHtml } from './html.js';

const SITE_NAME = 'Zampa';
const TWITTER_HANDLE = '@getzampa';
const THEME_COLOR = '#FAAF32';
const FALLBACK_IMAGE = 'https://www.getzampa.com/assets/og-image-v2.png';

function inferImageType(url) {
  if (!url) return 'image/jpeg';
  const lower = url.toLowerCase().split('?')[0];
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

// Picks the best available image following the chain from the brief (section C):
// offer photo → restaurant cover → restaurant logo → branded fallback.
export function pickOgImage({ offerImage, restaurantCover, restaurantLogo } = {}) {
  return offerImage || restaurantCover || restaurantLogo || FALLBACK_IMAGE;
}

export function buildMetaTags({ url, title, description, imageUrl, imageAlt, ogLocale }) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeImg = escapeHtml(imageUrl);
  const safeAlt = escapeHtml(imageAlt);
  const safeUrl = escapeHtml(url);
  const safeLocale = escapeHtml(ogLocale);
  const imageType = inferImageType(imageUrl);

  return [
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${safeUrl}">`,
    `<meta property="og:title" content="${safeTitle}">`,
    `<meta property="og:description" content="${safeDesc}">`,
    `<meta property="og:image" content="${safeImg}">`,
    `<meta property="og:image:secure_url" content="${safeImg}">`,
    `<meta property="og:image:type" content="${imageType}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${safeAlt}">`,
    `<meta property="og:locale" content="${safeLocale}">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:site" content="${TWITTER_HANDLE}">`,
    `<meta name="twitter:title" content="${safeTitle}">`,
    `<meta name="twitter:description" content="${safeDesc}">`,
    `<meta name="twitter:image" content="${safeImg}">`,
    `<meta name="twitter:image:alt" content="${safeAlt}">`,
    `<meta name="description" content="${safeDesc}">`,
    `<meta name="theme-color" content="${THEME_COLOR}">`,
  ].join('\n  ');
}
