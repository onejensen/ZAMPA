# Carrusel "Restaurantes en Zampa" — diseño

**Fecha:** 2026-06-12
**Estado:** aprobado por Juanjo (brainstorming con companion visual)

## Objetivo

Añadir a la landing una franja de social proof con restaurantes ya adheridos
a Zampa, en formato marquee continuo, dirigida sobre todo a captar nuevos
comercios ("únete como ellos").

## Decisiones tomadas (con el usuario)

| Decisión | Elección |
|---|---|
| Fuente de datos | Lista curada a mano, inline en el HTML |
| Enlace de tarjeta | Ficha pública `/r/{merchantId}` |
| Posición | Entre `#invite-customers` y `#benefits` |
| Movimiento | Marquee continuo (CSS puro), pausa en hover/focus |
| Tarjeta | Foto + nombre + ciudad (variante A del mockup) |
| Imágenes | Resizer existente `https://share.getzampa.com/i/m/{merchantId}` |

## Estructura

Nueva sección en `index.html`:

```html
<section id="featured-restaurants" class="section section--white featured-section">
  <div class="container">
    <h2 class="section__title" data-i18n="featured.title">Ya están en Zampa</h2>
    <p class="section__subtitle" data-i18n="featured.subtitle">…</p>
  </div>
  <div class="marquee" aria-label="Restaurantes en Zampa">
    <ul class="marquee__track">
      <!-- Para añadir un restaurante: copiar un <li>, cambiar id, nombre y ciudad -->
      <li><a href="/r/{merchantId}">
        <img src="https://share.getzampa.com/i/m/{merchantId}" alt="{nombre}"
             width="300" height="190" loading="lazy">
        <span class="marquee__name">{nombre}</span>
        <span class="marquee__city">{ciudad}</span>
      </a></li>
      …
    </ul>
    <ul class="marquee__track" aria-hidden="true"><!-- copia para el bucle --></ul>
  </div>
</section>
```

- La sección va a ancho completo (el marquee se sale del `.container` para
  desbordar por los lados); título y subtítulo sí van en `.container`.
- Arranque con 6 restaurantes. Los `merchantId` reales los aporta Juanjo
  (o se sacan del admin por nombre). Hasta tenerlos, IDs placeholder
  claramente marcados con comentario `<!-- TODO: id real -->`.
- La segunda `<ul>` es una copia exacta de la primera, generada a mano,
  con `aria-hidden="true"`.

## CSS (en `styles.css`)

- `.marquee { overflow: hidden; display: flex; }`
- `.marquee__track { display: flex; gap; width: max-content; animation:
  marquee-scroll ~30s linear infinite; }` — `translateX(0) → translateX(-100%)`
  sobre cada pista (las dos pistas en fila producen el bucle sin salto).
- Pausa: `.marquee:hover .marquee__track, .marquee:focus-within
  .marquee__track { animation-play-state: paused; }`
- Tarjeta: ~150 px de ancho en móvil, ~190 px en desktop; foto 300×190
  (ratio fijado con `width`/`height` + `aspect-ratio` para evitar CLS),
  `border-radius` y sombra coherentes con las cards existentes de la landing.
- `@media (prefers-reduced-motion: reduce)`: sin animación;
  `.marquee { overflow-x: auto; }` → franja scrollable manualmente.
- Velocidad: una vuelta ≈ 30 s con 6 tarjetas; duración fija (no depende
  del número de tarjetas; si se duplica la lista, revisar que no quede
  demasiado rápida).

## Imágenes

- URL: `https://share.getzampa.com/i/m/{merchantId}` (JPEG 1200×630,
  cache 24h, <300 KB). El resizer hace fallback interno si el comercio no
  tiene foto de perfil → no hay imágenes rotas.
- `loading="lazy"` en todas (sección bajo el fold). La pista duplicada
  reutiliza las mismas URLs → 6 descargas reales, no 12.

## i18n

- Claves nuevas: `featured.title`, `featured.subtitle` en `i18n/es.json`
  y los 11 locales restantes (en, ca, gl, eu, fr, it, de, pt, fi, sv, no),
  insertadas en la misma posición relativa en todos.
- Texto es de partida: título "Ya están en Zampa", subtítulo en la línea de
  "Bares y restaurantes que publican su menú del día cada mañana".
  Ajustable en implementación.
- Los nombres y ciudades de las tarjetas no se traducen.

## Accesibilidad

- Marquee pausable con hover y focus (`:focus-within`).
- `prefers-reduced-motion` → estático scrollable.
- Copia duplicada con `aria-hidden="true"`; `aria-label` en el contenedor.
- Cada tarjeta es un enlace normal, tabulable, con texto visible.

## Verificación

- Harness local + Chrome headless (mismo método que el pass mobile del
  admin): capturas a 390/768/1280 px y detector de overflow horizontal
  (el marquee debe desbordar solo dentro de su `overflow: hidden`).
- Check manual de `prefers-reduced-motion` (emulación headless con
  `--force-prefers-reduced-motion` o DevTools).
- Verificar que las URLs del resizer responden 200 con los IDs reales
  antes de publicar.

## Fuera de alcance

- Endpoint dinámico de comercios destacados (descartado: lista curada).
- Flag "destacado" en el admin.
- Carrusel con flechas/JS (descartado: marquee CSS).
- Tracking de clics en las tarjetas (se puede añadir GA después si interesa).
