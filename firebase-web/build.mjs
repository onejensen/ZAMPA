// Empaqueta la función con esbuild, como hace Cloudflare Pages con /functions:
// `i18n.js` importa los JSON de idiomas sin `with { type: 'json' }`, algo que
// Node no carga a pelo pero esbuild resuelve e incrusta.
import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.mjs'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  outfile: 'lib/index.js',
  external: ['firebase-functions', 'firebase-admin'],
  logLevel: 'warning',
});
