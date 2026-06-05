# Plan GEO — getzampa.com (Generative Engine Optimization)

> Fecha: 2026-06-05
> Objetivo: que ChatGPT, Perplexity, Gemini y Google AI Overviews **entiendan,
> confíen y citen** a Zampa para consultas tipo *"dónde comer cerca de mí",
> "menú del día barato en [ciudad]", "apps de ofertas de restaurantes en España"*.

**Principio rector**: los motores generativos premian (1) entidades bien
definidas con datos estructurados, (2) contenido que responde preguntas de forma
directa, y (3) señales de confianza/consistencia entre fuentes.

## Estado de partida (auditoría 2026-06-05) — ~30%

Ya hecho (juega a favor):
- `index.html` con structured data: `SoftwareApplication`, `FAQPage` (7 Q&A),
  `Organization` (publisher = "Sozo Labs").
- Meta completos: `description`, OG, Twitter cards, `canonical`, **hreflang** (9 idiomas).
- `robots.txt` NO bloquea bots de IA (`User-agent: * Allow: /`).
- SSR para crawlers en `/o/{oferta}` y `/r/{restaurante}`.
- `sitemap.xml` presente.

Huecos (por impacto):
1. Las páginas `/o` y `/r` NO emiten JSON-LD (solo OG/Twitter).
2. No hay `llms.txt`.
3. `Organization` mínima (sin `logo`, `sameAs`, `contactPoint`).
4. Ningún `Restaurant`/`LocalBusiness` en todo el dominio.
5. `sitemap.xml` solo 5 URLs estáticas (no descubre `/o` ni `/r`).
6. Sin capa de contenido-respuesta (guías/landings).
7. FAQ en futuro ("estará disponible") → puede transmitir "aún no existe".

---

## Fase 1 — Schema en las páginas de entidad `/o` y `/r` 🔥
**Mayor retorno. Los datos ya se piden, solo hay que serializarlos.**

- `/r/{merchantId}` → JSON-LD `Restaurant`/`FoodEstablishment`: `name`, `image`,
  `address` (`PostalAddress`), `geo` (`GeoCoordinates`), `telephone`, `url`,
  `servesCuisine`, `priceRange`, `openingHoursSpecification`.
- `/o/{offerId}` → `Offer`/`Product`/`MenuItem`: `name`(title), `description`,
  `image`, `price`(`priceTotal`), `priceCurrency`, `availability`, `validThrough`
  (lógica existente `createdAt`+día Madrid / `isPermanent`), y `offeredBy`/`seller`
  → enlazado por `@id` al restaurante.
- Dónde: helper nuevo `functions/_lib/schema.js`, inyectado en HTML de bots y en
  `renderShell()`. Respetar i18n y la regla de **no `with { type: 'json' }`**
  (objeto JS + `JSON.stringify`, escapando `</script>`).
- Dependencia: confirmar nombres reales de campos de `publicOffer`/`publicRestaurant`.
- Esfuerzo: M · Impacto: Alto · Riesgo: Bajo.

## Fase 2 — Entidad raíz: `llms.txt` + `Organization` rica 🔥
- `/llms.txt` en raíz: markdown con descripción, propuesta de valor, páginas clave.
- Enriquecer `Organization` en `index.html`: `logo`, `sameAs`, `contactPoint`,
  `areaServed: España`, `foundingDate`; nodo con `@id` referenciado desde
  `SoftwareApplication`. Añadir `WebSite` schema.
- Esfuerzo: S · Impacto: Medio-Alto · Riesgo: Muy bajo.

## Fase 3 — Descubribilidad: sitemap dinámico
- Priorizar restaurantes (estables) sobre ofertas (expiran a diario).
- Pages Function `/sitemap-restaurants.xml` que liste IDs públicos.
- Dependencia fuerte: endpoint nuevo en backend (`eatout-70b8b`) que liste IDs
  públicos. Bloqueada hasta tenerlo.
- Esfuerzo: M (+ backend) · Impacto: Medio · Riesgo: Bajo.

## Fase 4 — Capa de contenido-respuesta (E-E-A-T)
- Páginas-guía que responden consultas reales.
- (Opcional) landings por ciudad/categoría solo con datos reales.
- Corregir FAQ en futuro cuando se confirme lanzamiento.
- Esfuerzo: L · Impacto: Alto (medio plazo) · Riesgo: Medio.

## Fase 5 — Medición y mantenimiento
- Rastrear bots de IA (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended).
- Validar schema tras cada fase (Rich Results Test / validador schema.org).
- Decidir política `Google-Extended` y crawlers de entrenamiento.
- Monitorizar citas en ChatGPT/Perplexity para queries de marca.
- Esfuerzo: S continuo · Impacto: Indirecto.

---

### Orden recomendado
1 → 2 (sin tocar backend) → 3 (con backend) → 4 (fondo) · 5 en paralelo desde el inicio.
