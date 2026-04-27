# Phone Mockups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar las imágenes de las secciones `#customers` y `#merchants` por mockups realistas de iPhone con capturas de pantalla de la app.

**Architecture:** SVG inline con `<clipPath>` para recortar la captura dentro del frame del teléfono. El SVG se coloca donde antes estaba el `<img>` en cada `.split__image`. Se añade la clase `.phone-mockup` en CSS para tamaño y sombra.

**Tech Stack:** HTML5 (SVG inline), CSS3

---

## Files to modify

| File | Change |
|---|---|
| `styles.css` | Añadir clase `.phone-mockup` |
| `index.html` | Reemplazar `<img>` en `#customers` con SVG iPhone + `01-feed.png` |
| `index.html` | Reemplazar `<img>` en `#merchants` con SVG iPhone + `05-dashboard-restaurante.png` |

---

### Task 1: Añadir clase `.phone-mockup` en styles.css

**Files:**
- Modify: `styles.css` (después de la línea con `.split__image img`, aprox. línea 878)

- [ ] **Step 1: Abrir `styles.css` y localizar la sección del split**

Buscar el bloque:
```css
.split__image img {
  width: 100%;
  height: 420px;
  object-fit: cover;
  display: block;
  border-radius: var(--radius-xl);
  position: relative;
  z-index: 1;
}
```
Está en la línea ~870.

- [ ] **Step 2: Añadir `.phone-mockup` justo después de ese bloque**

Insertar después de la llave de cierre de `.split__image img`:

```css
.phone-mockup {
  width: 100%;
  max-width: 220px;
  margin: 0 auto;
  display: block;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 24px 48px rgba(0, 0, 0, 0.35));
}
```

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: add .phone-mockup CSS class"
```

---

### Task 2: Reemplazar imagen en sección `#customers`

**Files:**
- Modify: `index.html` líneas 159–164

- [ ] **Step 1: Localizar el bloque a reemplazar en `index.html`**

El bloque actual (líneas ~159–164):
```html
<div class="split__image split__image--teal fade-left">
  <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80" alt="Platos de restaurante" loading="lazy">
  <div class="decorative-dots decorative-dots--teal" aria-hidden="true">
    <span></span><span></span><span></span><span></span><span></span>
  </div>
</div>
```

- [ ] **Step 2: Reemplazar el `<img>` con el SVG del iPhone**

El bloque queda así (solo cambia el `<img>`, los dots se conservan):
```html
<div class="split__image split__image--teal fade-left">
  <svg class="phone-mockup" viewBox="0 0 300 608" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <clipPath id="screen-clip-customers">
        <rect x="18" y="12" width="264" height="584" rx="34"/>
      </clipPath>
    </defs>
    <!-- Phone body -->
    <rect x="10" y="4" width="280" height="600" rx="40" fill="#1C1C1E"/>
    <!-- Screenshot -->
    <image href="assets/screenshots/01-feed.png"
           x="18" y="12" width="264" height="584"
           clip-path="url(#screen-clip-customers)"
           preserveAspectRatio="xMidYMid slice"/>
    <!-- Dynamic Island -->
    <rect x="102" y="24" width="96" height="30" rx="15" fill="#000000"/>
    <!-- Frame highlight -->
    <rect x="10" y="4" width="280" height="600" rx="40" fill="none" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5"/>
    <!-- Side buttons: mute, vol+, vol- -->
    <rect x="3" y="112" width="10" height="22" rx="3" fill="#2C2C2E"/>
    <rect x="3" y="144" width="10" height="38" rx="3" fill="#2C2C2E"/>
    <rect x="3" y="192" width="10" height="38" rx="3" fill="#2C2C2E"/>
    <!-- Power button -->
    <rect x="287" y="162" width="10" height="52" rx="3" fill="#2C2C2E"/>
  </svg>
  <div class="decorative-dots decorative-dots--teal" aria-hidden="true">
    <span></span><span></span><span></span><span></span><span></span>
  </div>
</div>
```

- [ ] **Step 3: Abrir `index.html` en el navegador y verificar**

- El teléfono aparece en la columna izquierda de la sección "¿Cómo funciona para ti?"
- La captura `01-feed.png` (feed de ofertas) se ve dentro del frame
- El Dynamic Island se superpone correctamente sobre la parte superior de la captura
- La sombra teal del `::before` aparece detrás del teléfono
- Los dots decorativos son visibles

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: replace customers section image with iPhone mockup (01-feed)"
```

---

### Task 3: Reemplazar imagen en sección `#merchants`

**Files:**
- Modify: `index.html` líneas 207–212

- [ ] **Step 1: Localizar el bloque a reemplazar**

El bloque actual (líneas ~207–212):
```html
<div class="split__image split__image--coral fade-right">
  <img src="assets/bar-owner.png" alt="Restauradora con pizarra de menú del día" loading="lazy">
  <div class="decorative-dots decorative-dots--coral" aria-hidden="true">
    <span></span><span></span><span></span><span></span><span></span>
  </div>
</div>
```

- [ ] **Step 2: Reemplazar el `<img>` con el SVG del iPhone**

```html
<div class="split__image split__image--coral fade-right">
  <svg class="phone-mockup" viewBox="0 0 300 608" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <clipPath id="screen-clip-merchants">
        <rect x="18" y="12" width="264" height="584" rx="34"/>
      </clipPath>
    </defs>
    <!-- Phone body -->
    <rect x="10" y="4" width="280" height="600" rx="40" fill="#1C1C1E"/>
    <!-- Screenshot -->
    <image href="assets/screenshots/05-dashboard-restaurante.png"
           x="18" y="12" width="264" height="584"
           clip-path="url(#screen-clip-merchants)"
           preserveAspectRatio="xMidYMid slice"/>
    <!-- Dynamic Island -->
    <rect x="102" y="24" width="96" height="30" rx="15" fill="#000000"/>
    <!-- Frame highlight -->
    <rect x="10" y="4" width="280" height="600" rx="40" fill="none" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5"/>
    <!-- Side buttons: mute, vol+, vol- -->
    <rect x="3" y="112" width="10" height="22" rx="3" fill="#2C2C2E"/>
    <rect x="3" y="144" width="10" height="38" rx="3" fill="#2C2C2E"/>
    <rect x="3" y="192" width="10" height="38" rx="3" fill="#2C2C2E"/>
    <!-- Power button -->
    <rect x="287" y="162" width="10" height="52" rx="3" fill="#2C2C2E"/>
  </svg>
  <div class="decorative-dots decorative-dots--coral" aria-hidden="true">
    <span></span><span></span><span></span><span></span><span></span>
  </div>
</div>
```

- [ ] **Step 3: Verificar en el navegador**

- El teléfono aparece en la columna derecha (`.split--reverse`) de la sección "¿Tienes un restaurante?"
- La captura `05-dashboard-restaurante.png` se ve dentro del frame
- La sombra coral del `::before` aparece detrás del teléfono
- En mobile (viewport <768px) el layout es 1 columna y el teléfono queda centrado

- [ ] **Step 4: Commit final**

```bash
git add index.html
git commit -m "feat: replace merchants section image with iPhone mockup (05-dashboard)"
```
