// Static i18n loader for the share-landing Pages Functions.
//
// All 12 language packs are imported at build time by Cloudflare Pages
// (esbuild bundles JSON natively). Total ~72KB across all locales — well
// within the per-function bundle budget — and zero request-time latency.

import es from '../../i18n/es.json';
import ca from '../../i18n/ca.json';
import gl from '../../i18n/gl.json';
import eu from '../../i18n/eu.json';
import en from '../../i18n/en.json';
import pt from '../../i18n/pt.json';
import fr from '../../i18n/fr.json';
import it from '../../i18n/it.json';
import de from '../../i18n/de.json';
import fi from '../../i18n/fi.json';
import sv from '../../i18n/sv.json';
import no from '../../i18n/no.json';

const TRANSLATIONS = { es, ca, gl, eu, en, pt, fr, it, de, fi, sv, no };
const DEFAULT_LOCALE = 'es';

// Looks up `key` in the locale's pack, falling back to DEFAULT_LOCALE if
// missing in the requested locale, and finally to the key itself as a
// development sentinel. Substitutes {var} placeholders with values from
// `vars`.
//
// IMPORTANT: substitution is NOT auto-escaped. Callers must pre-escape any
// user-supplied content destined for raw-HTML insertion. Values destined
// for escapeHtml() at the output stage can be passed unescaped (the final
// escape catches them once, no double-escape).
//
// The one key that intentionally receives pre-built escaped HTML is
// share.offer.in_restaurant_subtitle — its {name_link} placeholder is
// substituted with a full <a>...</a> element that the caller builds with
// escapeHtml on user data first.
export function t(locale, key, vars) {
  const pack = TRANSLATIONS[locale] || TRANSLATIONS[DEFAULT_LOCALE];
  const fallback = TRANSLATIONS[DEFAULT_LOCALE];
  const template = pack[key] ?? fallback[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : match
  );
}
