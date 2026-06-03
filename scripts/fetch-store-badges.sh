#!/usr/bin/env bash
#
# fetch-store-badges.sh — descarga los badges oficiales de App Store y Google
# Play, localizados, para los 12 idiomas que soporta Zampa.
#
# Apple: API oficial de badges (SVG vectorial). Para eu/gl Apple no tiene
#        artwork propio y sirve el badge en inglés (comportamiento oficial).
# Google: badge generator oficial (PNG).
#
# Idempotente: vuelve a ejecutarlo cuando quieras refrescar el artwork.
# Uso:  bash scripts/fetch-store-badges.sh
set -euo pipefail

DEST="$(cd "$(dirname "$0")/.." && pwd)/assets/badges"
mkdir -p "$DEST"

# Idiomas soportados (mismos códigos que main.js / i18n/)
LANGS="es en ca eu gl pt de fr it fi sv no"

# Apple necesita locale con región. Mapeo lang -> locale Apple.
apple_locale() {
  case "$1" in
    es) echo "es-es" ;;
    en) echo "en-us" ;;
    ca) echo "ca-es" ;;
    eu) echo "eu-es" ;;  # -> fallback inglés (Apple no tiene euskera)
    gl) echo "gl-es" ;;  # -> fallback inglés (Apple no tiene galego)
    pt) echo "pt-pt" ;;
    de) echo "de-de" ;;
    fr) echo "fr-fr" ;;
    it) echo "it-it" ;;
    fi) echo "fi-fi" ;;
    sv) echo "sv-se" ;;
    no) echo "nb-no" ;;
  esac
}

APPLE_BASE="https://tools.applemediaservices.com/api/badges/download-on-the-app-store"
GOOGLE_BASE="https://play.google.com/intl"

for lang in $LANGS; do
  aloc="$(apple_locale "$lang")"

  # Apple — SVG vectorial. Variante "black" para fondos claros (heros) y
  # "white" para fondos oscuros (footer), según las guías de Apple.
  echo "Apple  $lang ($aloc) black + white ..."
  curl -fsSL "${APPLE_BASE}/black/${aloc}?size=250x83" -o "${DEST}/app-store-${lang}.svg"
  curl -fsSL "${APPLE_BASE}/white/${aloc}?size=250x83" -o "${DEST}/app-store-${lang}-white.svg"

  # Google — PNG (badge oficial único, sirve en claro y oscuro)
  echo "Google $lang ..."
  curl -fsSL "${GOOGLE_BASE}/${lang}/badges/static/images/badges/${lang}_badge_web_generic.png" \
    -o "${DEST}/google-play-${lang}.png"
done

# Los PNG oficiales de Google traen mucho padding transparente (y no es
# uniforme entre locales: en/eu/gl usan el genérico 564x168, el resto 646x192).
# Recortamos al bounding box alfa para que todos queden "tight"; así una misma
# altura CSS alinea Apple y Google y el clear space se recompone con CSS.
echo ""
echo "Recortando padding de los PNG de Google ..."
python3 - "$DEST" <<'PY'
import sys, glob
from PIL import Image
dest = sys.argv[1]
for f in sorted(glob.glob(f"{dest}/google-play-*.png")):
    im = Image.open(f).convert("RGBA")
    bbox = im.getbbox()
    if bbox:
        im.crop(bbox).save(f)
PY

echo ""
echo "Listo. Badges en: ${DEST}"
ls -1 "$DEST"
