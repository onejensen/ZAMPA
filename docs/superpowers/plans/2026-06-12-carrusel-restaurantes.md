# Carrusel "Restaurantes en Zampa" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir a la landing una sección de social proof con marquee CSS continuo de restaurantes adheridos, entre `#invite-customers` y `#benefits`.

**Architecture:** Sección estática en `index.html` con lista curada inline (6 restaurantes), dos pistas `<ul>` duplicadas animadas con `translateX(-100%)` para el bucle, imágenes vía el resizer `share.getzampa.com/i/m/{id}`. Sin JS. La sección se commitea con `hidden` y IDs placeholder; se activa en la última tarea cuando Juanjo aporte los merchantIds reales (el push auto-despliega, así que nunca se publica a medias).

**Tech Stack:** HTML + CSS puro (styles.css), i18n vía `data-i18n` + JSON por locale, verificación con Chrome headless.

**Spec:** `docs/superpowers/specs/2026-06-12-carrusel-restaurantes-design.md`

**Contexto del repo (léelo antes de empezar):**
- Sitio estático Cloudflare Pages; **cada push a `main` despliega a producción**.
- Convenciones CSS de la landing: `.section { padding: 100px 0 }`, `.container { max-width: var(--max-width); padding: 0 24px }`, breakpoint móvil `@media (max-width: 767px)`, vars `--text`, `--muted`, `--white`, `--radius-md`, fuentes `--font-heading`/`--font-body`. Las clases `fade-up` las anima un IntersectionObserver de `main.js` — no requieren nada más.
- Commits: `feat(landing): …` / `feat(i18n): …`, imperativo, body con el porqué, push tras cada commit.

---

### Task 1: Sección HTML + CSS del marquee (oculta)

**Files:**
- Modify: `index.html` (insertar justo antes de `<section id="benefits"` — línea ~514)
- Modify: `styles.css` (añadir al final del fichero)

- [ ] **Step 1: Insertar la sección en `index.html`**

Localiza `<section id="benefits"` y pega ESTE bloque inmediatamente antes:

```html
  <!-- ===== Featured: restaurantes adheridos (marquee) =====
       Para añadir/quitar un restaurante: edita el <li> en AMBAS pistas (la
       segunda <ul> es la copia aria-hidden que cierra el bucle) cambiando
       el id de /r/ y de /i/m/, el nombre y la ciudad.
       El atributo hidden se quita cuando los IDs placeholder sean reales. -->
  <section id="featured-restaurants" class="section section--white featured-section" hidden>
    <div class="container">
      <h2 class="section__title fade-up" data-i18n="featured.title">Ya están en Zampa</h2>
      <p class="section__subtitle fade-up" data-i18n="featured.subtitle">Bares y restaurantes que publican su menú del día cada mañana. Toca uno y echa un vistazo a su ficha.</p>
    </div>
    <div class="marquee" aria-label="Restaurantes en Zampa">
      <ul class="marquee__track">
        <li><a class="marquee__card" href="/r/MERCHANT_ID_1">
          <img src="https://share.getzampa.com/i/m/MERCHANT_ID_1" alt="Restaurante 1" width="300" height="190" loading="lazy">
          <span class="marquee__name">Restaurante 1</span>
          <span class="marquee__city">Ciudad</span>
        </a></li>
        <li><a class="marquee__card" href="/r/MERCHANT_ID_2">
          <img src="https://share.getzampa.com/i/m/MERCHANT_ID_2" alt="Restaurante 2" width="300" height="190" loading="lazy">
          <span class="marquee__name">Restaurante 2</span>
          <span class="marquee__city">Ciudad</span>
        </a></li>
        <li><a class="marquee__card" href="/r/MERCHANT_ID_3">
          <img src="https://share.getzampa.com/i/m/MERCHANT_ID_3" alt="Restaurante 3" width="300" height="190" loading="lazy">
          <span class="marquee__name">Restaurante 3</span>
          <span class="marquee__city">Ciudad</span>
        </a></li>
        <li><a class="marquee__card" href="/r/MERCHANT_ID_4">
          <img src="https://share.getzampa.com/i/m/MERCHANT_ID_4" alt="Restaurante 4" width="300" height="190" loading="lazy">
          <span class="marquee__name">Restaurante 4</span>
          <span class="marquee__city">Ciudad</span>
        </a></li>
        <li><a class="marquee__card" href="/r/MERCHANT_ID_5">
          <img src="https://share.getzampa.com/i/m/MERCHANT_ID_5" alt="Restaurante 5" width="300" height="190" loading="lazy">
          <span class="marquee__name">Restaurante 5</span>
          <span class="marquee__city">Ciudad</span>
        </a></li>
        <li><a class="marquee__card" href="/r/MERCHANT_ID_6">
          <img src="https://share.getzampa.com/i/m/MERCHANT_ID_6" alt="Restaurante 6" width="300" height="190" loading="lazy">
          <span class="marquee__name">Restaurante 6</span>
          <span class="marquee__city">Ciudad</span>
        </a></li>
      </ul>
      <ul class="marquee__track" aria-hidden="true">
        <!-- Copia EXACTA de la pista de arriba (mismos 6 <li>) -->
        <li><a class="marquee__card" href="/r/MERCHANT_ID_1" tabindex="-1">
          <img src="https://share.getzampa.com/i/m/MERCHANT_ID_1" alt="" width="300" height="190" loading="lazy">
          <span class="marquee__name">Restaurante 1</span>
          <span class="marquee__city">Ciudad</span>
        </a></li>
        <li><a class="marquee__card" href="/r/MERCHANT_ID_2" tabindex="-1">
          <img src="https://share.getzampa.com/i/m/MERCHANT_ID_2" alt="" width="300" height="190" loading="lazy">
          <span class="marquee__name">Restaurante 2</span>
          <span class="marquee__city">Ciudad</span>
        </a></li>
        <li><a class="marquee__card" href="/r/MERCHANT_ID_3" tabindex="-1">
          <img src="https://share.getzampa.com/i/m/MERCHANT_ID_3" alt="" width="300" height="190" loading="lazy">
          <span class="marquee__name">Restaurante 3</span>
          <span class="marquee__city">Ciudad</span>
        </a></li>
        <li><a class="marquee__card" href="/r/MERCHANT_ID_4" tabindex="-1">
          <img src="https://share.getzampa.com/i/m/MERCHANT_ID_4" alt="" width="300" height="190" loading="lazy">
          <span class="marquee__name">Restaurante 4</span>
          <span class="marquee__city">Ciudad</span>
        </a></li>
        <li><a class="marquee__card" href="/r/MERCHANT_ID_5" tabindex="-1">
          <img src="https://share.getzampa.com/i/m/MERCHANT_ID_5" alt="" width="300" height="190" loading="lazy">
          <span class="marquee__name">Restaurante 5</span>
          <span class="marquee__city">Ciudad</span>
        </a></li>
        <li><a class="marquee__card" href="/r/MERCHANT_ID_6" tabindex="-1">
          <img src="https://share.getzampa.com/i/m/MERCHANT_ID_6" alt="" width="300" height="190" loading="lazy">
          <span class="marquee__name">Restaurante 6</span>
          <span class="marquee__city">Ciudad</span>
        </a></li>
      </ul>
    </div>
  </section>

```

Notas de la copia `aria-hidden`: lleva `tabindex="-1"` en los enlaces (que el teclado no recorra duplicados) y `alt=""` (que los lectores no anuncien imágenes duplicadas).

- [ ] **Step 2: Añadir el CSS al final de `styles.css`**

```css
/* ===== Featured restaurants (marquee) ===== */
.featured-section {
  overflow: hidden;
}

.marquee {
  display: flex;
  overflow: hidden;
  margin-top: 48px;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
}

.marquee__track {
  display: flex;
  flex-shrink: 0;
  gap: 20px;
  width: max-content;
  margin: 0;
  padding: 8px 20px 8px 0; /* derecho = gap visual entre pista y su copia; vertical deja respirar la sombra */
  list-style: none;
  animation: marquee-scroll 30s linear infinite;
}

@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

/* Pausa para leer o clicar (ratón y teclado) */
.marquee:hover .marquee__track,
.marquee:focus-within .marquee__track {
  animation-play-state: paused;
}

.marquee__card {
  display: block;
  width: 190px;
  background: var(--white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(45, 52, 54, 0.12);
  text-decoration: none;
  transition: transform 0.15s ease;
}

.marquee__card:hover {
  transform: translateY(-3px);
}

.marquee__card img {
  width: 100%;
  height: auto;
  aspect-ratio: 300 / 190;
  object-fit: cover;
  display: block;
}

.marquee__name {
  display: block;
  padding: 10px 12px 2px;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text);
}

.marquee__city {
  display: block;
  padding: 0 12px 12px;
  font-size: 0.85rem;
  color: var(--muted);
}

@media (max-width: 767px) {
  .marquee__card { width: 150px; }
  .marquee { margin-top: 32px; }
}

/* Sin animación: franja scrollable a mano, y la copia del bucle sobra */
@media (prefers-reduced-motion: reduce) {
  .marquee {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .marquee__track { animation: none; }
  .marquee__track[aria-hidden="true"] { display: none; }
}
```

- [ ] **Step 3: Comprobar que renderiza en local**

```bash
cd "/Users/onejensen/Documents/MIS WEBS/Zampa" && python3 -m http.server 8741 &
sleep 1
curl -s http://localhost:8741/ | grep -c "marquee__card"   # esperado: 12 (6 + 6 copia)
curl -s http://localhost:8741/ | grep -c 'id="featured-restaurants"'   # esperado: 1
```

- [ ] **Step 4: Commit y push**

```bash
git add index.html styles.css
git commit -m "feat(landing): sección featured-restaurants con marquee (oculta)

Marquee CSS puro de restaurantes adheridos entre #invite-customers y
#benefits. Se commitea con hidden e IDs placeholder: el push despliega
a producción y la sección no debe verse hasta tener los merchantIds
reales (se activa en un commit posterior)."
git push
```

---

### Task 2: Claves i18n en los 12 locales

**Files:**
- Modify: `i18n/es.json`, `i18n/en.json`, `i18n/ca.json`, `i18n/gl.json`, `i18n/eu.json`, `i18n/fr.json`, `i18n/it.json`, `i18n/de.json`, `i18n/pt.json`, `i18n/fi.json`, `i18n/sv.json`, `i18n/no.json`

- [ ] **Step 1: Añadir las claves**

Insertar `featured.title` y `featured.subtitle` justo después de `invite.image_alt` en cada locale (misma posición relativa en los 12). Valores exactos:

| Locale | featured.title | featured.subtitle |
|---|---|---|
| es | Ya están en Zampa | Bares y restaurantes que publican su menú del día cada mañana. Toca uno y echa un vistazo a su ficha. |
| en | Already on Zampa | Bars and restaurants publishing their daily menu every morning. Tap one and take a look at their profile. |
| ca | Ja són a Zampa | Bars i restaurants que publiquen el seu menú del dia cada matí. Toca'n un i fes una ullada a la seva fitxa. |
| gl | Xa están en Zampa | Bares e restaurantes que publican o seu menú do día cada mañá. Toca un e bótalle unha ollada á súa ficha. |
| eu | Zampan daude jada | Eguneroko menua goizero argitaratzen duten taberna eta jatetxeak. Sakatu bat eta begiratu bere fitxa. |
| fr | Ils sont déjà sur Zampa | Bars et restaurants qui publient leur menu du jour chaque matin. Touchez-en un pour découvrir sa fiche. |
| it | Sono già su Zampa | Bar e ristoranti che pubblicano il loro menù del giorno ogni mattina. Toccane uno e dai un'occhiata alla sua scheda. |
| de | Schon auf Zampa | Bars und Restaurants, die jeden Morgen ihr Tagesmenü veröffentlichen. Tippe auf eines und sieh dir das Profil an. |
| pt | Já estão na Zampa | Bares e restaurantes que publicam o seu menu do dia todas as manhãs. Toca num e espreita a sua ficha. |
| fi | Jo Zampassa | Baarit ja ravintolat, jotka julkaisevat päivän menunsa joka aamu. Napauta yhtä ja katso sen profiilia. |
| sv | Redan på Zampa | Barer och restauranger som publicerar sin dagens meny varje morgon. Tryck på en och titta på dess profil. |
| no | Allerede på Zampa | Barer og restauranter som publiserer dagens meny hver morgen. Trykk på en og se profilen. |

Método (mismo patrón que el bloque `invite.*` de junio 2026): script python con `json.load(object_pairs_hook=OrderedDict)`, insertar tras `invite.image_alt`, `json.dump(ensure_ascii=False, indent=2)` + newline final.

- [ ] **Step 2: Verificar paridad de claves**

```bash
cd "/Users/onejensen/Documents/MIS WEBS/Zampa" && python3 -c "
import json
ref = set(json.load(open('i18n/es.json')))
for loc in ['en','ca','gl','eu','fr','it','de','pt','fi','sv','no']:
    ks = set(json.load(open(f'i18n/{loc}.json')))
    assert ks == ref, (loc, ref ^ ks)
print('key sets OK')"
```

Esperado: `key sets OK`.

- [ ] **Step 3: Commit y push**

```bash
git add i18n/
git commit -m "feat(i18n): claves featured.* del carrusel en los 12 locales"
git push
```

---

### Task 3: Verificación responsive y reduced-motion

**Files:**
- Create (temporal, NO commitear): `_test_featured.html`, `_test_wrap.html` en la raíz

- [ ] **Step 1: Crear harness con la sección visible**

`_test_featured.html` = copia de `index.html` con (a) el `hidden` de `#featured-restaurants` quitado y (b) este script antes de `</body>` (detector de overflow + estado de la animación):

```html
<script>
window.addEventListener('load', () => setTimeout(() => {
  const vw = document.documentElement.clientWidth;
  const out = ['viewport=' + vw + ' docScrollW=' + document.documentElement.scrollWidth];
  document.querySelectorAll('#featured-restaurants *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 && !el.closest('.marquee')) out.push('OVERFLOW ' + el.className);
  });
  const tr = document.querySelector('.marquee__track');
  const cs = getComputedStyle(tr);
  out.push('animation=' + cs.animationName + ' duration=' + cs.animationDuration);
  const pre = document.createElement('pre');
  pre.id = 'overflow-report'; pre.textContent = out.join('\n');
  document.body.appendChild(pre);
}, 500));
</script>
```

`_test_wrap.html` (el headless de Chrome tiene ancho mínimo 500px; el iframe da el viewport exacto — patrón ya usado en el pass mobile del admin):

```html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>body{margin:0}iframe{border:0;display:block}</style></head>
<body><iframe id="f" height="2400"></iframe>
<script>
const q = new URLSearchParams(location.search);
const f = document.getElementById('f');
f.width = q.get('w') || 390;
f.src = '/_test_featured.html';
const t = setInterval(() => {
  const rep = f.contentDocument && f.contentDocument.getElementById('overflow-report');
  if (rep) { clearInterval(t); const c = rep.cloneNode(true); c.id = 'parent-report'; document.body.appendChild(c); }
}, 100);
</script></body></html>
```

- [ ] **Step 2: Detector a 390/768/1280**

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for w in 390 768 1280; do
  echo "=== ${w}px:"
  "$CHROME" --headless --disable-gpu --window-size=1400,2400 --virtual-time-budget=6000 \
    --dump-dom "http://localhost:8741/_test_wrap.html?w=$w" 2>/dev/null | \
    python3 -c "import sys,re; m=re.search(r'<pre id=\"parent-report\">(.*?)</pre>', sys.stdin.read(), re.S); print(m.group(1) if m else 'NO REPORT')"
done
```

Esperado por cada ancho: `docScrollW` == viewport, ninguna línea `OVERFLOW`, `animation=marquee-scroll duration=30s`.

- [ ] **Step 3: Reduced motion**

```bash
"$CHROME" --headless --disable-gpu --window-size=1400,2400 --virtual-time-budget=6000 \
  --force-prefers-reduced-motion \
  --dump-dom "http://localhost:8741/_test_wrap.html?w=390" 2>/dev/null | \
  python3 -c "import sys,re; m=re.search(r'<pre id=\"parent-report\">(.*?)</pre>', sys.stdin.read(), re.S); print(m.group(1) if m else 'NO REPORT')"
```

Esperado: `animation=none`.

- [ ] **Step 4: Captura visual a 390 y 1280 y revisarlas**

```bash
for w in 390 1280; do
  "$CHROME" --headless --disable-gpu --hide-scrollbars --window-size=1400,2400 --virtual-time-budget=6000 \
    --screenshot="/tmp/featured-$w.png" "http://localhost:8741/_test_wrap.html?w=$w" 2>/dev/null
done
```

Abrir/leer ambas: tarjetas alineadas, fade en los bordes del marquee, sin saltos de layout bajo la sección.

- [ ] **Step 5: Limpiar y commitear solo si hubo fixes**

```bash
rm _test_featured.html _test_wrap.html
pkill -f "http.server 8741"
git status --short   # debe estar limpio salvo fixes de CSS hechos en este task
# si hubo fixes: git add styles.css index.html && git commit -m "fix(landing): ajustes del marquee tras verificación responsive" && git push
```

---

### Task 4: Activar con los merchantIds reales (BLOQUEADA por datos de Juanjo)

**Files:**
- Modify: `index.html` (los 12 `<li>` y el atributo `hidden`)

**Prerequisito:** lista de 6 restaurantes (merchantId + nombre + ciudad) aportada por Juanjo. Si da nombres en vez de IDs, buscarlos con `adminSearchMerchants` desde el panel admin (requiere su sesión).

- [ ] **Step 1: Verificar que el resizer responde para cada ID**

```bash
for id in ID1 ID2 ID3 ID4 ID5 ID6; do
  echo "$id: $(/usr/bin/curl -s -o /dev/null -w '%{http_code}' "https://share.getzampa.com/i/m/$id")"
done
```

Esperado: 200 (o 302 hacia el fallback — aceptable pero avisa a Juanjo de qué comercio no tiene foto para que decida si lo cambia).

- [ ] **Step 2: Sustituir los placeholders**

En `index.html`, en AMBAS pistas: `MERCHANT_ID_N` → id real, `Restaurante N` → nombre real (también en el `alt` de la primera pista), `Ciudad` → ciudad real. Verificación de que no queda ninguno:

```bash
grep -c "MERCHANT_ID_" index.html   # esperado: 0
```

- [ ] **Step 3: Quitar el `hidden` de la sección**

`<section id="featured-restaurants" class="section section--white featured-section" hidden>` → sin `hidden`. Actualizar también el comentario HTML (quitar la frase del atributo hidden).

- [ ] **Step 4: Comprobación local rápida**

```bash
python3 -m http.server 8741 & sleep 1
curl -s http://localhost:8741/ | grep -c "MERCHANT_ID_"   # esperado: 0
curl -s http://localhost:8741/ | grep -c 'featured-restaurants" class="section section--white featured-section">'   # esperado: 1
pkill -f "http.server 8741"
```

- [ ] **Step 5: Commit, push y verificación en producción**

```bash
git add index.html
git commit -m "feat(landing): activa el carrusel de restaurantes con los comercios reales

Sustituye los placeholders por los 6 merchantIds curados y quita el
hidden: la sección queda visible en producción."
git push
# tras ~1 min de deploy:
curl -s https://www.getzampa.com/ | grep -c "marquee__card"   # esperado: 12
```

---

## Self-review del plan (hecho)

- Cobertura del spec: estructura HTML (T1), CSS+reduced-motion+pausa (T1), imágenes resizer (T1+T4), i18n 12 locales (T2), accesibilidad (T1: aria-hidden, tabindex, focus-within), verificación headless (T3), IDs reales (T4). Sin huecos.
- Sin placeholders de plan: todos los pasos llevan código/comandos completos. Los `MERCHANT_ID_N` son placeholders DEL PRODUCTO previstos por diseño (sección oculta hasta T4), no del plan.
- Consistencia de nombres: `.marquee`, `.marquee__track`, `.marquee__card`, `.marquee__name`, `.marquee__city`, `featured.title/subtitle` usados igual en T1, T2 y T3.
