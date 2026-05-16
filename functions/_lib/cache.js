// Cache-Control values from zampa-og-images-claude-code-prompt.md section 5.
// Short for offers (data changes often); 1h for restaurants (rarely change).

const CACHE_OFFER_EXISTS = 'public, max-age=300';
const CACHE_OFFER_MISSING = 'public, max-age=60';
const CACHE_RESTAURANT = 'public, max-age=3600';

export function cacheControlForOffer({ exists }) {
  return exists ? CACHE_OFFER_EXISTS : CACHE_OFFER_MISSING;
}

export function cacheControlForRestaurant() {
  return CACHE_RESTAURANT;
}
