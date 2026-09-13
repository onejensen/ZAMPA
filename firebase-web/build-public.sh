#!/usr/bin/env bash
# Copia de la web que publica Firebase Hosting.
#
# Sale del último commit (`git archive HEAD`), no del disco: `firebase deploy`
# sube la carpeta tal cual, y en el disco hay cosas que nunca deben publicarse
# (.claude/, .superpowers/, borradores sin versionar). Lo que no está en git no
# se publica, y lo interno que sí está en git se quita aquí.
#
# Cloudflare Pages publicaba también CLAUDE.md, mempalace.yaml, docs/ y scripts/.
set -euo pipefail

cd "$(dirname "$0")/.."
OUT=.firebase-public

rm -rf "$OUT"
mkdir -p "$OUT"
git archive --format=tar HEAD | tar -x -C "$OUT"

# Notas y planes internos, código de funciones y ficheros de otros alojamientos.
rm -rf "$OUT/docs" "$OUT/scripts" "$OUT/functions" "$OUT/firebase-web"
rm -f "$OUT/CLAUDE.md" "$OUT/mempalace.yaml" "$OUT/_headers" "$OUT/CNAME" \
      "$OUT/.nojekyll" "$OUT/.gitignore" "$OUT/firebase.json" "$OUT/.firebaserc"

# Sin esto no hay web, ni Universal Links / App Links.
for required in index.html 404.html admin/index.html \
                .well-known/apple-app-site-association .well-known/assetlinks.json; do
  test -f "$OUT/$required" || { echo "falta $required en la copia pública" >&2; exit 1; }
done

echo "copia pública: $(find "$OUT" -type f | wc -l | tr -d ' ') archivos desde $(git rev-parse --short HEAD)"
