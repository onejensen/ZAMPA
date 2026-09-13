// Sirve las Pages Functions de /functions desde una Cloud Function detrás de
// Firebase Hosting, sin tocarlas. Ellas reciben `{ request, params }` con la API
// web estándar (Request/Response); aquí sólo se traduce la petición de Express
// a un Request y la Response de vuelta.
//
// Existe porque Cloudflare comparte IPs con webs de fútbol pirata y en día de
// partido los operadores españoles las bloquean por orden de LaLiga: con ellas
// caía getzampa.com. Firebase Hosting va por IPs de Google.

// Cloudflare enruta `functions/o/[id].js` a `/o/:id`, un único segmento.
const ROUTE_RE = /^\/(o|r)\/([^/]+)\/?$/;

export function routeFor(path) {
  const match = ROUTE_RE.exec(path || '');
  if (!match) return null;
  try {
    return { kind: match[1], id: decodeURIComponent(match[2]) };
  } catch {
    // Un %zz malformado no es un id: 404, no 500.
    return null;
  }
}

export function toFetchRequest(req) {
  // Detrás de Hosting, `host` es el de la función; el dominio que pidió el
  // usuario viene en `x-forwarded-host`. `locale.js` lee `?lang=` de la URL.
  const host = req.get('x-forwarded-host') || req.get('host') || 'www.getzampa.com';
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (value == null) continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
  }
  return new Request(`https://${host}${req.originalUrl || req.url || '/'}`, {
    method: req.method === 'HEAD' ? 'HEAD' : 'GET',
    headers,
  });
}

export async function sendFetchResponse(res, response) {
  res.status(response.status);
  response.headers.forEach((value, key) => res.set(key, value));
  res.send(Buffer.from(await response.arrayBuffer()));
}
