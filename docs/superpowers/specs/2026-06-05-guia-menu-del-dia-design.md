# Spec — Guía cornerstone "Menú del día" (GEO Fase 4)

> Fecha: 2026-06-05
> Parte de: [Plan GEO](../plans/2026-06-05-geo-generative-engine-optimization.md), Fase 4.

## Objetivo

Crear una página de contenido cornerstone, indexable y rica en datos
estructurados, que responda las consultas de mayor intención sobre el "menú del
día" en España, para que los motores generativos (ChatGPT, Perplexity, Gemini,
Google AI Overviews, Copilot) **citen a Zampa** como fuente. Es la primera pieza
de contenido-respuesta del sitio.

## No-objetivos (YAGNI)

- **No** landings por ciudad (riesgo de contenido thin; necesitan datos reales
  por ciudad → depende de Fase 3/backend).
- **No** traducir el cuerpo de la guía a los 12 idiomas (Spain-only, audiencia
  en español; los crawlers indexan el HTML por defecto = español).
- **No** crear un hub `/guias/` todavía (una sola guía no lo justifica).
- **No** propagar el enlace a los footers de las 5 páginas existentes (se enlaza
  desde el landing + sitemap; footer global queda como mejora futura).

## Página, URL e integración

- **Archivo**: `/menu-del-dia.html` en la raíz, replicando el esqueleto de
  `privacy.html`/`terms.html` (mismo `<head>` con GA4, `styles.css`, header y
  footer estándar).
- **URL canónica**: `https://www.getzampa.com/menu-del-dia.html` (keyword en la
  URL). Indexable — **sin** `noindex`.
- **Header/footer**: reutilizar el mismo markup que las otras páginas
  (header con logo + nav `data-i18n` Clientes/Comercios/FAQ; footer con
  `data-i18n`). El chrome se traduce client-side; el cuerpo no.

## Idioma

- **Cuerpo de la guía: español, sin `data-i18n`.** Es el texto que indexan los
  crawlers (sobre todo los de IA, que no ejecutan JS) y la audiencia es España.
- El header/footer conservan sus claves `data-i18n` existentes (se traducen).
- Consecuencia aceptada: un usuario no-español ve el chrome traducido y el
  cuerpo en español.

## Estructura de contenido

H1 + ~900-1200 palabras, tono informativo y útil (no comercial). Cada `<h2>` se
redacta como una pregunta/consulta que un motor generativo podría responder
citándonos. Secciones:

1. **H1**: *El menú del día en España: qué es y cómo encontrar los mejores cerca de ti*
2. **Intro** (2-3 frases): define la entidad y para quién es la guía.
3. **¿Qué es el menú del día?** — definición; qué suele incluir (primero,
   segundo, postre o café, pan y bebida) a **precio cerrado**; que es una
   tradición de la restauración española y una opción económica al mediodía.
4. **¿Cómo encontrar el menú del día cerca de ti?** — métodos prácticos (pasar
   por la zona, redes, y **apps que muestran menús del día de bares cercanos**).
   Aquí entra Zampa de forma natural: descubrir ofertas y menús del día cercanos,
   ver foto/precio/descripción, y contactar directamente con el local.
5. **Cómo filtrar por preferencias dietéticas** — vegetariano, vegano, sin
   gluten, sin lactosa, sin frutos secos, sin carne, sin pescado (lista real de
   filtros de Zampa).
6. **Consejos para aprovechar el menú del día** — horarios típicos de mediodía,
   llamar antes para confirmar disponibilidad, que no suele requerir reserva.
7. **Preguntas frecuentes** — 4 Q&A (ver abajo), **distintas** de las del
   landing para no duplicar; alimentan el `FAQPage` schema.
8. **CTA discreto** a `/download.html` (descargar Zampa).

### Restricciones factuales (sin fabricar)

- **Nada de estadísticas/cifras inventadas.** El precio del menú del día se
  describe **cualitativamente** ("opción económica, a precio cerrado que varía
  según ciudad y zona") — **no** dar un número fijo que pueda ser falso o
  quedar obsoleto.
- Origen/historia: mención **general** ("tradición de la restauración española")
  sin afirmaciones históricas específicas potencialmente discutibles.
- Datos de Zampa, solo los reales y ya verificados en este repo: cliente gratis;
  sin reservas; sin comisiones; contacto directo (llamar / cómo llegar);
  disponible en toda España; iOS + Android; filtros dietéticos listados arriba.

### FAQ de la guía (texto visible = texto del schema)

1. **¿Qué suele incluir el menú del día?** — Normalmente un primero, un segundo,
   postre o café, pan y bebida, a un precio cerrado.
2. **¿Cómo encuentro menús del día cerca de mí?** — Apps como Zampa muestran
   ofertas y menús del día de bares y restaurantes cercanos, con foto, precio y
   filtros por preferencias.
3. **¿Puedo encontrar menús del día vegetarianos o sin gluten?** — Sí; en apps
   con filtros dietéticos como Zampa puedes filtrar por vegetariano, vegano, sin
   gluten, sin lactosa y más.
4. **¿Hay que reservar para el menú del día?** — Normalmente no. Con Zampa
   contactas directamente con el local para llamar o ver cómo llegar.

## Schema (JSON-LD)

Tres bloques en `<head>`, serializados como objetos JS inline (sin import
attributes), validados con `JSON.parse`.

### Article
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "El menú del día en España: qué es y cómo encontrar los mejores cerca de ti",
  "description": "(misma cadena exacta que el <meta name=\"description\"> de la página)",
  "inLanguage": "es",
  "datePublished": "2026-06-05",
  "dateModified": "2026-06-05",
  "image": "https://www.getzampa.com/assets/og-image-v2.png",
  "author": { "@type": "Organization", "name": "Zampa", "url": "https://www.getzampa.com" },
  "publisher": {
    "@type": "Organization",
    "name": "Sozo Labs",
    "logo": { "@type": "ImageObject", "url": "https://www.getzampa.com/assets/favicon-512x512.png" }
  },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://www.getzampa.com/menu-del-dia.html" }
}
```

### FAQPage
Las 4 Q&A de arriba, con `@type` Question/Answer, **idénticas** al texto visible.

### BreadcrumbList
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.getzampa.com/" },
    { "@type": "ListItem", "position": 2, "name": "Menú del día", "item": "https://www.getzampa.com/menu-del-dia.html" }
  ]
}
```

## Wiring SEO/GEO

- `<title>`: *Menú del día: qué es y cómo encontrarlo cerca de ti | Zampa* (≤ ~60 car.).
- `<meta name="description">`: 150-160 caracteres, con keyword y propuesta de valor.
- `<link rel="canonical">` self.
- OG (`og:type=article`, url, title, description, `image=og-image-v2.png`,
  `site_name=Zampa`, `locale=es_ES`) + Twitter `summary_large_image`.
- `theme-color #2D3436`, favicons e iconos como las otras páginas.
- **hreflang**: solo canonical self (no hay URLs por idioma; cuerpo es-only).
- `sitemap.xml`: añadir entrada (`priority` 0.7, `changefreq` monthly).

## Enlazado interno (descubribilidad)

- **Sitemap** (discovery primario).
- **Un enlace contextual desde `index.html`**, en/junto a la sección FAQ
  (ej.: una línea "¿Quieres saber más? Lee nuestra guía sobre el menú del día"),
  con una nueva clave `data-i18n` traducida en los **12** archivos de `i18n/`
  (es una sola frase corta → esfuerzo bajo, consistencia con el resto del
  chrome). El `href` apunta a `/menu-del-dia.html`.

## Criterios de aceptación / verificación

1. La página renderiza con header, footer y `styles.css` (mismo look que privacy/terms).
2. Los **3 bloques JSON-LD parsean** (`JSON.parse`) — verificación con node como
   en fases anteriores.
3. El texto de las 4 FAQ **coincide** carácter a carácter entre HTML visible y
   `FAQPage` schema.
4. `/menu-del-dia.html` está en `sitemap.xml`.
5. Existe el enlace interno desde `index.html` y resuelve a la guía.
6. Sin `noindex`; canonical correcto; meta description 150-160 car.
7. La clave `data-i18n` del enlace existe en los 12 locales.
8. Cero cifras/estadísticas inventadas; afirmaciones de Zampa = solo datos reales.

## Conjunto de cambios (archivos)

- **Nuevo**: `menu-del-dia.html`.
- **Editar**: `sitemap.xml` (entrada nueva); `index.html` (enlace contextual);
  los 12 `i18n/*.json` (1 clave nueva para el enlace).
