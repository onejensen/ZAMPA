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

Cloud Functions v1 en `us-central1-eatout-70b8b.cloudfunctions.net`.

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

Esquema Firestore relevante:
- `businesses/{uid}` — comercios; campos: `name`, `isVerified`, `trialEndsAt`, `subscriptionStatus`…
- `dailyOffers/{offerId}` — publicaciones de comercios (con `merchantId`, `title`, `description`, `price`, `currency`, `imageUrl`, `createdAt`, `expiresAt`).
- `metrics/{merchantId}/daily/{YYYY-MM-DD}` — agregados en TZ Madrid.
- `favorites/`, `userHistory/` — interacciones de usuarios.
- `adminAuditLog/` — registro de acciones admin (motivo + snapshot).

---

## Admin panel (`/admin/index.html`)

Una sola página, Firebase Web SDK + `fetch` a las Cloud Functions. Tabs:

1. **Verificaciones** — bandeja de comercios pendientes de revisión.
2. **Planes** — buscar comercio y extender su plan gratuito (acciones rápidas o personalizado).
3. **Stats** — buscar comercio y ver KPIs (impresiones, llamadas, cómo llegar, compartir, favoritos) con gráfico diario.
4. **Publicaciones** — buscar comercio y moderar sus `dailyOffers` (ver / eliminar con motivo).

Estado de UI persistido en query string (`?tab=`, `?status=`, `?q=`, `?view=`).
Cada tab que filtra comercios reusa `adminSearchMerchants`.

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

## Histórico rápido

- **mayo 2026** — añadido tab "Publicaciones" en admin (moderación de
  `dailyOffers`). Backend requiere `adminListMerchantOffers` +
  `adminDeleteMerchantOffer` (en repo separado).
- **mayo 2026** — i18n integrado en `/o/[id]` y `/r/[id]` Pages Functions.
- **mayo 2026** — tab "Stats" consumiendo `adminMerchantStats`.
