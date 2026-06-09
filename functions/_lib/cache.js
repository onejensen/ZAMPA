// Cache-Control values from zampa-og-images-claude-code-prompt.md section 5.
// Short max-age for "missing" responses so a later-created entity becomes
// visible to scrapers within ~1 minute. Long max-age for "exists" responses
// because real content changes rarely (esp. restaurants).

const CACHE_OFFER_EXISTS = 'public, max-age=300';
const CACHE_OFFER_MISSING = 'public, max-age=60';
const CACHE_RESTAURANT_EXISTS = 'public, max-age=3600';
const CACHE_RESTAURANT_MISSING = 'public, max-age=60';

// The same /o and /r URL serves different HTML per User-Agent (bot vs human
// shell) and per Accept-Language (locale). Any shared cache must key on both
// or it can serve the bare bot page to a human, or the wrong language.
export const VARY_SHARE_PAGES = 'User-Agent, Accept-Language';

export function cacheControlForOffer({ exists }) {
  return exists ? CACHE_OFFER_EXISTS : CACHE_OFFER_MISSING;
}

export function cacheControlForRestaurant({ exists }) {
  return exists ? CACHE_RESTAURANT_EXISTS : CACHE_RESTAURANT_MISSING;
}
