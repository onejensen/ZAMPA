// Thin client for the public Cloud Functions in the `eatout-70b8b` Firebase project.
// Returns parsed JSON on success, null on any failure (timeout, non-2xx, bad JSON).
// The Pages Functions in /o and /r must tolerate null and render a fallback page.

const BASE_URL = 'https://us-central1-eatout-70b8b.cloudfunctions.net';
const TIMEOUT_MS = 5000;

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function fetchOffer(id) {
  if (!id) return Promise.resolve(null);
  return fetchWithTimeout(`${BASE_URL}/publicOffer?id=${encodeURIComponent(id)}`);
}

export function fetchRestaurant(id) {
  if (!id) return Promise.resolve(null);
  return fetchWithTimeout(`${BASE_URL}/publicRestaurant?id=${encodeURIComponent(id)}`);
}
