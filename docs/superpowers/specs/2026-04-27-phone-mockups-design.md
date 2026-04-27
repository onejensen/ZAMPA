# Phone Mockups en Secciones Clientes y Restaurantes

**Fecha:** 2026-04-27

## Objetivo

Reemplazar las imágenes actuales de las secciones `#customers` y `#merchants` por mockups realistas de iPhone mostrando capturas de pantalla de la app Zampa.

## Contexto

La landing page tiene dos secciones con layout `.split` (imagen + texto):
- `#customers`: foto Unsplash de restaurante a la izquierda
- `#merchants`: `assets/bar-owner.png` a la derecha (via `.split--reverse`)

Las capturas disponibles en `assets/screenshots/`:
- `01-feed.png` — feed de ofertas cercanas (para clientes)
- `02-mapa.png` — vista de mapa
- `03-detalle-oferta.png` — detalle de oferta
- `04-perfil-restaurante.png` — perfil del restaurante
- `05-dashboard-restaurante.png` — preferencias alimentarias (para restaurantes)

## Decisiones de diseño

| Decisión | Elección |
|---|---|
| Ubicación | Dentro de secciones existentes (#customers y #merchants) |
| Imágenes actuales | Reemplazadas por los mockups |
| Tipo de frame | SVG inline realista |
| Captura en #customers | `01-feed.png` |
| Captura en #merchants | `05-dashboard-restaurante.png` |

## Diseño del SVG iPhone

### Especificaciones del frame

- **ViewBox:** `0 0 296 606`
- **Cuerpo:** `rect` con `rx=40`, color `#1C1C1E` (iOS dark background), borde highlight `rgba(255,255,255,0.12)`
- **Screen area:** `rect` con `rx=34`, recortada con `<clipPath>` único por instancia
- **Screenshot:** `<image>` con `preserveAspectRatio="xMidYMid slice"` dentro del clipPath
- **Dynamic Island:** `rect` píldora centrada en la parte superior de la pantalla, color `#000`
- **Botones laterales:** volumen (izquierda, 2 botones), mute (izquierda), encendido (derecha) — color `#2C2C2E`
- **Sombra:** aplicada via CSS `filter: drop-shadow` en el contenedor, no como filtro SVG

### IDs únicos para clipPath

- Sección clientes: `id="screen-clip-customers"`
- Sección restaurantes: `id="screen-clip-merchants"`

## Cambios en index.html

### Sección `#customers`

**Antes:**
```html
<div class="split__image split__image--teal fade-left">
  <img src="https://images.unsplash.com/photo-..." alt="...">
  <div class="decorative-dots decorative-dots--teal" aria-hidden="true">
    <span></span>...<span></span>
  </div>
</div>
```

**Después:**
```html
<div class="split__image split__image--teal fade-left">
  <svg class="phone-mockup" viewBox="0 0 296 606" ...>
    <!-- frame + clipPath con 01-feed.png -->
  </svg>
  <div class="decorative-dots decorative-dots--teal" aria-hidden="true">
    <span></span>...<span></span>
  </div>
</div>
```

### Sección `#merchants`

Mismo patrón, reemplazando `<img src="assets/bar-owner.png">` con el SVG usando `05-dashboard-restaurante.png`.

## Cambios en styles.css

### Nueva clase `.phone-mockup`

```css
.phone-mockup {
  width: 100%;
  max-width: 220px;
  margin: 0 auto;
  display: block;
  filter: drop-shadow(0 24px 48px rgba(0,0,0,0.35));
}
```

### Override para `.split__image img` (ya no aplica al SVG)

El estilo `.split__image img { height: 420px; object-fit: cover; }` no afecta al SVG — no se necesita cambio. El SVG escala proporcionalmente via `max-width`.

### Mobile (≤768px)

El layout ya colapsa a 1 columna. El teléfono quedará centrado con `margin: 0 auto` y `max-width: 220px`. No se requiere override adicional.

## Archivos a modificar

1. `index.html` — reemplazar contenido de `.split__image` en ambas secciones
2. `styles.css` — agregar clase `.phone-mockup`

## Lo que NO cambia

- Las sombras coloreadas `::before` (teal y coral) se conservan — dan profundidad al mockup
- Los dots decorativos se conservan
- El layout `.split` y `.split--reverse` no se toca
- Las animaciones `fade-left` / `fade-right` no se tocan
- El resto de secciones no se modifica
