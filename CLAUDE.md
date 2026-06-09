# CLAUDE.md — Zampa (sitio web + admin)

Repo de la web pública de Zampa (`www.getzampa.com`) más el panel de
operaciones interno (`/admin`). Es un sitio **estático** servido por
Cloudflare Pages, con dos **Pages Functions** para OG/SEO de rutas
compartibles.

> Importante: este repo **no** contiene el backend de la app. Las Cloud
> Functions viven en otro proyecto (`eatout-70b8b`) y se llaman desde aquí
> por HTTPS.

---

## Estructura

```
/                       — landing, download, privacy, terms, delete-account
/admin/index.html       — panel admin (Firebase Auth + Cloud Functions allowlist)
/functions/             — Cloudflare Pages Functions (SSR para crawlers)
  /_lib/                — apiClient, locale, i18n, meta, pageShell, cache, botDetect, html
  /o/[id].js            — Open Graph + página para /o/{offerId} (oferta compartida)
  /r/[id].js            — Open Graph + página para /r/{merchantId} (restaurante)
/i18n/                  — JSON de traducciones por locale (es, en, ca, gl, eu, fr, it, de, pt, fi, sv, no)
/.well-known/           — apple-app-site-association + assetlinks.json (deep links)
/assets/                — imágenes, logo, mockups
```

---

## Backend (separado)

Cloud Functions **v2** (`firebase-functions/v2/{https,firestore,scheduler,pubsub}`),
expuestas en `us-central1-eatout-70b8b.cloudfunctions.net`.

Repo del backend: `/Users/onejensen/Documents/MIS APPS/Zampa/functions/`
(proyecto Firebase `eatout-70b8b`).

### Endpoints públicos (consumidos por las Pages Functions)
- `GET publicOffer?id={offerId}` → `{ exists, offer, restaurant }`
- `GET publicRestaurant?id={merchantId}` → datos de restaurante

### Endpoints admin (consumidos por `/admin/index.html`)
Todos requieren `Authorization: Bearer <Firebase ID token>` y allowlist.

| Endpoint | Método | Uso |
|---|---|---|
| `adminListPendingVerifications` | GET | Tab Verificaciones |
| `adminApproveVerification` | POST | Aprobar comercio + backfill `dailyOffers` |
| `adminRejectVerification` | POST | Rechazar comercio |
| `adminSearchMerchants?q=` | GET | Buscador compartido (Planes/Stats/Publicaciones) |
| `adminExtendMerchantPlan` | POST | Tab Planes — extender trial |
| `adminMerchantStats?merchantId=&days=` | GET | Tab Stats — métricas diarias |
| `adminListMerchantOffers?merchantId=&includeExpired=&limit=` | GET | Tab Publicaciones — listar `dailyOffers` |
| `adminDeleteMerchantOffer` | POST | Tab Publicaciones — moderar contenido |

Esquema Firestore relevante (cuidado con los nombres reales — diferentes de lo que el endpoint serializa al frontend):
- `businesses/{uid}` — comercios; campos: `name`, `isVerified`, `trialEndsAt`, `subscriptionActiveUntil`, `subscriptionStatus`, `verificationStatus`, `coverPhotoUrl`, `profilePhotoUrl`…
- `dailyOffers/{offerId}` — publicaciones de comercios. Campos: **`businessId`** (NO `merchantId`), `title`, `description`, **`priceTotal`** (number, NO `price`), `currency`, **`photoUrls[]`** (array, primer elemento = imagen principal, NO `imageUrl`), `createdAt` (Timestamp), `isActive`, `isPermanent`, `offerType`. **No hay campo `expiresAt`** — la expiración se calcula con `isOfferExpired(offer, now)` (helper en `functions/index.js`) basándose en `createdAt` + día Madrid + `isPermanent`.
- `metrics/{merchantId}/daily/{YYYY-MM-DD}` — agregados pre-calculados por los clientes iOS/Android en TZ Madrid. Campos: `impressions`, `clicks: { call, directions, share }`, `favorites` (delta neto del día).
- `favorites/{userId}_{businessId}` — estado actual de favorito (idempotente por docId determinístico). Campos: `customerId`, `businessId`, `createdAt`, `notificationsEnabled`.
- `userHistory/{userId}_{businessId}_{action}` — última interacción por tupla `(user, business, action)`. Solo guarda `action ∈ {call, directions}` (share NO se persiste aquí). Mergea por docId → solo el último timestamp sobrevive → útil para "usuarios únicos lifetime", no para series temporales.
- `adminAuditLogs/` (**plural**) — registro de acciones admin. Endpoints que mutan llaman al helper `writeAdminAuditLog(db, payload)`.

---

## Admin panel (`/admin/index.html`)

Una sola página, Firebase Web SDK + `fetch` a las Cloud Functions. Tabs:

1. **Verificaciones** — bandeja de comercios pendientes de revisión.
2. **Planes** — buscar comercio y extender su plan gratuito (acciones rápidas o personalizado).
3. **Stats** — buscar comercio y ver KPIs (impresiones, llamadas, cómo llegar, compartir, favoritos) con gráfico diario.
4. **Publicaciones** — buscar comercio y moderar sus `dailyOffers` (ver / eliminar con motivo).

Estado de UI persistido en query string (`?tab=`, `?status=`, `?q=`, `?view=`).
Cada tab que filtra comercios reusa `adminSearchMerchants`.

**Flujo picker → detalle (Stats y Publicaciones):**
- Buscador → `adminSearchMerchants` → picker con hasta 30 filas.
- Click en una fila → `selectMerchantFor{Stats,Posts}()` oculta el picker y muestra el detalle.
- Helper `alignDetailToAnchor()` lleva el header del detalle al top del viewport tras el reflow (rAF + `scrollIntoView smooth`).
- Botón **"← Volver a la lista"** o tecla **Esc** vuelven al picker y scrollean al input de búsqueda. Helper compartido: `returnToList(tab)`.
- Esc tiene 3 niveles de prioridad: (1) cierra modal de Verificaciones, (2) si hay foco en input/textarea → solo `blur()`, (3) vuelve a la lista en el tab activo.

---

## Pages Functions (`/o`, `/r`)

Renderizan SSR distinto según UA:
- **Bots/scrapers** (Facebook, Twitter, WhatsApp, Slack…) → HTML minimal con meta tags OG/Twitter, sin layout.
- **Humanos** → `renderShell()` con layout completo, CTA a deep link `zampa://` o `/download.html`.

Imágenes OG van por el resizer (`/i/o/{offerId}`, `/i/m/{merchantId}`) que
sirve JPEG 1200×630 con cache 24h.

i18n: `resolveLocale(request)` lee `Accept-Language`, mapea a uno de los locales en `/i18n/`, y `t(locale, key, vars)` interpola.

---

## Convenciones técnicas

### Imports en Pages Functions
- **NUNCA** usar `with { type: 'json' }` ni `assert { type: 'json' }` en
  `functions/**/*.js`. El esbuild de Cloudflare Pages los rechaza. Si
  necesitas JSON, cárgalo en runtime (fetch al CDN o KV) o inline el
  objeto en JS.

### Gotchas de CSS en `/admin/index.html`
- La regla global `input, textarea { width: 100%; padding: 15px 16px }`
  también aplica a `<input type="checkbox|radio">` → los estira y descompone
  cualquier label inline. Hay un override puntual
  (`input[type="checkbox"], input[type="radio"] { width: auto; padding: 0; ... }`)
  pero si añades un campo nuevo, recuérdalo.
- `.stats-picker { display: grid }` y `[hidden]` UA tienen misma especificidad
  → sin override, `element.hidden = true` no oculta. Existe la regla
  `.stats-picker[hidden] { display: none !important }`. Si creas otra clase
  con `display: *` y la togglas con `hidden`, replica el patrón.

### Deep links
- Universal Links iOS + App Links Android están **live** para `/o/{id}` y
  `/r/{id}`. Mantén `.well-known/apple-app-site-association` y
  `assetlinks.json` sincronizados con bundle IDs reales.
- AASA tiene un quirk pendiente menor con el `Content-Type`.

### Estilo de commits
- `feat(scope): …`, `fix(scope): …`, en imperativo, scope = `admin` / `functions` / `i18n` / etc.
- 1-2 frases en el body explicando el **por qué**.
- Una feature = un commit cuando el cambio es cohesivo; granular por
  paso/idioma cuando son tareas independientes.

### Workflow
- Tras cada commit, **push** al remoto sin preguntar.
- Si el usuario pide pausas o pasos granulares, respétalo aunque suponga
  más de un push.

### Despliegue
- El sitio se despliega automático en Cloudflare Pages al hacer push a `main`.
- El backend se despliega aparte (`firebase deploy --only functions:…` desde el repo de funciones).

---

## Conocidos / deferred

- **Warning cross-region** al desplegar funciones: `onMenuPublished` y
  `onBusinessCreated` están en `us-central1` pero su trigger Firestore vive
  en `eur3`. Cada evento hace round-trip eur3 → us-central1 → eur3 (~70-150
  ms extra). Fix requiere migrar a `europe-west1` con ventana planificada
  (borrar+desplegar pierde algún evento durante la transición). Baja
  prioridad. Para suprimir el warning sin migrar:
  `FIREBASE_SUPPRESS_REGION_WARNING=true` en `.env`.
- **AASA `Content-Type`** quirk pendiente (no bloqueante).
- **`adminMerchantStats`**: ver puntos #3-#6 del review de mayo 2026 (click
  keys hardcoded, info leak en error 500, mutación en `.map()`, fallback
  `.select()` puede facturar miles de reads si `.count()` falla). Conscious
  debt, no urgente.

---

## Histórico rápido

- **junio 2026** — auditoría completa de la web (16 commits). Deep links:
  `/r/*` añadido al AASA y al AndroidManifest (commit `6b7c857` en
  Zampa-App, pendiente de release), CTAs de `/o` y `/r` corregidas a los
  schemes reales `zampa://offer/` y `zampa://merchant/` (los `zampa://o|r/`
  no los parsea ninguna app), y `404.html` ya maneja `/r/`. SEO en Pages
  Functions: status 404 para entidades inexistentes, `Vary: User-Agent,
  Accept-Language`, descripciones visibles truncadas a 500 chars, y FAQ q1
  añadida al HTML (estaba en el JSON-LD pero no visible). i18n: bloque
  `invite.*` traducido a los 11 idiomas no-ES. Landing: botón newsletter
  reactivado tras éxito, `main.js?v=4` unificado en las 5 páginas, metas
  sociales de `download.html` completadas, colores de marca en
  `manifest.json`, nav de páginas legales con `/#anchor`. Admin:
  `data-action-btn` en acciones de Planes/Publicaciones (anti doble
  submit), `statsMessage` limpiado en auth change, código muerto de
  `expiresAt` eliminado. Nota: `publicOffer`/`adminListMerchantOffers`
  serializan `photoUrls[0]`→`imageUrl` y `priceTotal`→`price` (string), y
  `publicRestaurant` → `coverImageUrl`/`logoUrl` — leer esos nombres en el
  frontend es correcto, no un bug.
- **mayo 2026** — UX back-to-list en admin: botón "← Volver a la lista",
  scroll automático al picker, atajo Esc. Fixes CSS de specificity (picker
  `hidden`) y checkbox sizing (override sobre regla global de inputs).
- **mayo 2026** — `adminMerchantStats` revisado y fixeado: bug DST que
  duplicaba/omitía días al cambio de hora, y flag `truncated:boolean` en
  `uniqueUsersFromHistory` para señalar cuando se toca el cap de 5000.
  Deployed.
- **mayo 2026** — añadidos `adminListMerchantOffers` + `adminDeleteMerchantOffer`
  al backend. Deployed. Tab "Publicaciones" del admin ya funcional.
- **mayo 2026** — i18n integrado en `/o/[id]` y `/r/[id]` Pages Functions.
- **mayo 2026** — tab "Stats" consumiendo `adminMerchantStats`.
