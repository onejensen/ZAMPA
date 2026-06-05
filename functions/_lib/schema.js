// JSON-LD (schema.org) builders for the shareable entity pages /o and /r.
//
// GEO (Generative Engine Optimization): these structured-data nodes let
// Google AI Overviews, Bing/Copilot, ChatGPT, Perplexity and Gemini recognize
// each offer and restaurant as a real entity instead of guessing from prose.
//
// Field discipline: emit ONLY what publicOffer / publicRestaurant actually
// serialize (see backend buildPublicOffer / buildPublicRestaurant). The public
// endpoints deliberately withhold street address, geo coordinates, telephone
// and opening hours for privacy — so this module never fabricates them. Every
// optional property is omitted when its source is missing rather than guessed.
//
// No imports on purpose: keeps the module trivially testable in isolation and
// independent of the Cloudflare/esbuild bundle.

const SITE = 'https://www.getzampa.com';

// Builds the Restaurant node shared by /r (standalone) and /o (as the offer's
// seller). Returns null when the minimum identity (id + name) is missing.
// The stable @id (`{url}#restaurant`) lets the offer graph reference the same
// entity by id instead of duplicating it.
function restaurantNode(restaurant) {
  if (!restaurant || !restaurant.id || !restaurant.name) return null;

  const url = `${SITE}/r/${encodeURIComponent(restaurant.id)}`;
  const node = {
    '@type': 'Restaurant',
    '@id': `${url}#restaurant`,
    name: restaurant.name,
    url,
  };

  const image = restaurant.coverImageUrl || restaurant.logoUrl;
  if (image) node.image = image;
  if (restaurant.description) node.description = restaurant.description;
  if (restaurant.city) {
    node.address = {
      '@type': 'PostalAddress',
      addressLocality: restaurant.city,
      addressCountry: 'ES',
    };
  }

  const cuisines = Array.isArray(restaurant.cuisineTypes)
    ? restaurant.cuisineTypes.filter((c) => typeof c === 'string' && c.trim())
    : [];
  if (cuisines.length) node.servesCuisine = cuisines;

  return node;
}

// Restaurant schema for /r/{id}. Returns null when there is no usable
// restaurant (caller should then emit nothing).
export function buildRestaurantSchema(restaurant) {
  const node = restaurantNode(restaurant);
  if (!node) return null;
  return { '@context': 'https://schema.org', ...node };
}

// Offer schema for /o/{id}: a Product (the dish/menu) carrying an Offer
// (price + availability), with the restaurant included in the same @graph and
// referenced as the Offer's seller. Returns null when there is no offer to
// describe. validThrough/priceValidUntil are intentionally absent: the public
// endpoint does not serialize the offer's expiry, and publicOffer only returns
// non-expired offers, so availability is InStock at fetch time.
export function buildOfferSchema({ canonicalUrl, offer, restaurant }) {
  if (!offer || !offer.title) return null;

  const product = {
    '@type': 'Product',
    name: offer.title,
  };
  if (offer.description) product.description = offer.description;
  if (offer.imageUrl) product.image = offer.imageUrl;

  const offerNode = {
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    url: canonicalUrl,
  };
  if (offer.price !== null && offer.price !== undefined && offer.price !== '') {
    offerNode.price = offer.price;
    offerNode.priceCurrency = offer.currency || 'EUR';
  }

  const rNode = restaurantNode(restaurant);
  if (rNode) offerNode.seller = { '@id': rNode['@id'] };
  product.offers = offerNode;

  const graph = rNode ? [product, rNode] : [product];
  return { '@context': 'https://schema.org', '@graph': graph };
}

// Serializes a schema object into a ready-to-inline <script> tag. Returns ''
// for a null/empty object so callers can interpolate unconditionally. The
// `<` → < escape is the standard JSON-in-HTML guard: it neutralizes any
// "</script>" or "<!--" sequence hiding inside user content (titles,
// descriptions) without corrupting the JSON the way HTML-entity escaping would.
export function renderJsonLd(schema) {
  if (!schema) return '';
  const json = JSON.stringify(schema).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}
