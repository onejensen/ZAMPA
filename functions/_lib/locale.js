// Locale resolution: ?lang query → Accept-Language header → 'es' default.
// Supported set mirrors the 12 i18n JSON files in /i18n/.

const SUPPORTED = ['es', 'ca', 'gl', 'eu', 'en', 'pt', 'fr', 'it', 'de', 'fi', 'sv', 'no'];
const DEFAULT_LOCALE = 'es';

function normalize(tag) {
  if (!tag) return null;
  const lower = tag.toLowerCase().trim();
  if (SUPPORTED.includes(lower)) return lower;
  const primary = lower.split('-')[0];
  if (SUPPORTED.includes(primary)) return primary;
  return null;
}

export function resolveLocale(request) {
  const url = new URL(request.url);

  const queryLang = url.searchParams.get('lang');
  const fromQuery = normalize(queryLang);
  if (fromQuery) return fromQuery;

  const accept = request.headers.get('Accept-Language') || '';
  const candidates = accept.split(',').map((p) => p.trim().split(';')[0]);
  for (const candidate of candidates) {
    const matched = normalize(candidate);
    if (matched) return matched;
  }

  return DEFAULT_LOCALE;
}

const OG_LOCALE_MAP = {
  es: 'es_ES',
  ca: 'ca_ES',
  gl: 'gl_ES',
  eu: 'eu_ES',
  en: 'en_US',
  pt: 'pt_PT',
  fr: 'fr_FR',
  it: 'it_IT',
  de: 'de_DE',
  fi: 'fi_FI',
  sv: 'sv_SE',
  no: 'nb_NO',
};

export function toOgLocale(locale) {
  return OG_LOCALE_MAP[locale] || OG_LOCALE_MAP[DEFAULT_LOCALE];
}

// BCP-47 with hyphen, as accepted by Intl.NumberFormat / Intl.DateTimeFormat.
// Distinct from the underscore form used for og:locale.
const INTL_LOCALE_MAP = {
  es: 'es-ES',
  ca: 'ca-ES',
  gl: 'gl-ES',
  eu: 'eu-ES',
  en: 'en-US',
  pt: 'pt-PT',
  fr: 'fr-FR',
  it: 'it-IT',
  de: 'de-DE',
  fi: 'fi-FI',
  sv: 'sv-SE',
  no: 'nb-NO',
};

export function toIntlLocale(locale) {
  return INTL_LOCALE_MAP[locale] || INTL_LOCALE_MAP[DEFAULT_LOCALE];
}
