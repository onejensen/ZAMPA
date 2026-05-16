import { escapeHtml } from './html.js';

const SITE_NAME = 'Zampa';
const TWITTER_HANDLE = '@getzampa';
const THEME_COLOR = '#FAAF32';
const FALLBACK_IMAGE = 'https://www.getzampa.com/assets/og-image-v2.png';
const RESIZER_BASE = 'https://share.getzampa.com/i';

function inferImageType(url) {
  if (!url) return 'image/jpeg';
  const lower = url.toLowerCase().split('?')[0];
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

// Returns a 1200×630 JPEG URL via the share.getzampa.com resizer when the
// entity has a photo, otherwise the static branded fallback. The cover-photo
// step of the original brief's fallback chain is skipped: the resizer only
// exposes /i/o/{offerId} (offer photo) and /i/m/{merchantId} (merchant
// profile photo) — there is no endpoint for businesses.coverPhotoUrl.
//
// The resizer itself 302-redirects to the same static fallback when the
// offer/merchant has no photo or any internal step fails, so this function
// only needs to decide which endpoint family to hit.
export function pickOgImage({ offerId, offerHasImage, merchantId } = {}) {
  if (offerHasImage && offerId) {
    return `${RESIZER_BASE}/o/${encodeURIComponent(offerId)}`;
  }
  if (merchantId) {
    return `${RESIZER_BASE}/m/${encodeURIComponent(merchantId)}`;
  }
  return FALLBACK_IMAGE;
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
