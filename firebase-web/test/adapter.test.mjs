// Tests del adaptador Express ↔ Request/Response. Lo que protegen: que un enlace
// compartido de Zampa llegue a la Pages Function con el mismo id, idioma y
// navegador que llegaba en Cloudflare — de eso dependen la vista previa de
// WhatsApp (robot) y la página en el idioma del usuario (humano).
import test from 'node:test';
import assert from 'node:assert/strict';
import { routeFor, toFetchRequest, sendFetchResponse } from '../src/adapter.mjs';

function fakeReq({ path = '/o/abc', originalUrl = path, headers = {}, method = 'GET' } = {}) {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return { path, originalUrl, method, headers: lower, get: (name) => lower[name.toLowerCase()] };
}

test('/o/{id} y /r/{id} se enrutan con su id, como functions/o/[id].js en Cloudflare', () => {
  assert.deepEqual(routeFor('/o/ext_can_pep_2026-09-13'), { kind: 'o', id: 'ext_can_pep_2026-09-13' });
  assert.deepEqual(routeFor('/r/abc123'), { kind: 'r', id: 'abc123' });
  assert.deepEqual(routeFor('/o/abc/'), { kind: 'o', id: 'abc' });
  assert.deepEqual(routeFor('/o/caf%C3%A9'), { kind: 'o', id: 'café' });
});

test('lo que no es un único segmento no llega a la función', () => {
  for (const path of ['/o/', '/o', '/o/a/b', '/x/abc', '/', '', undefined]) {
    assert.equal(routeFor(path), null, String(path));
  }
});

test('un id mal codificado es un 404, no un error 500', () => {
  assert.equal(routeFor('/o/%zz'), null);
});

test('la petición conserva navegador, idioma y ?lang=, que deciden qué página se pinta', () => {
  const request = toFetchRequest(fakeReq({
    path: '/o/abc',
    originalUrl: '/o/abc?lang=ca',
    headers: {
      'X-Forwarded-Host': 'www.getzampa.com',
      Host: 'websharepage-xyz.a.run.app',
      'User-Agent': 'WhatsApp/2.23.20.0',
      'Accept-Language': 'ca-ES,ca;q=0.9',
    },
  }));
  assert.equal(request.url, 'https://www.getzampa.com/o/abc?lang=ca');
  assert.equal(request.headers.get('user-agent'), 'WhatsApp/2.23.20.0');
  assert.equal(request.headers.get('accept-language'), 'ca-ES,ca;q=0.9');
  assert.equal(request.method, 'GET');
});

test('sin x-forwarded-host se usa el host, y un HEAD sigue siendo HEAD', () => {
  const request = toFetchRequest(fakeReq({ method: 'HEAD', headers: { Host: 'getzampa.web.app' } }));
  assert.equal(request.url, 'https://getzampa.web.app/o/abc');
  assert.equal(request.method, 'HEAD');
});

test('la respuesta sale con su estado, su caché y su Vary', async () => {
  // Sin `Vary: User-Agent, Accept-Language` la CDN de Firebase podría servir la
  // página de robot a una persona, o el idioma equivocado.
  const sent = { headers: {} };
  const res = {
    status(code) { sent.status = code; return this; },
    set(key, value) { sent.headers[key.toLowerCase()] = value; return this; },
    send(body) { sent.body = body; return this; },
  };
  await sendFetchResponse(res, new Response('<h1>hola</h1>', {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
      Vary: 'User-Agent, Accept-Language',
    },
  }));
  assert.equal(sent.status, 404);
  assert.equal(sent.headers['cache-control'], 'public, max-age=60');
  assert.equal(sent.headers.vary, 'User-Agent, Accept-Language');
  assert.equal(sent.body.toString('utf8'), '<h1>hola</h1>');
});
