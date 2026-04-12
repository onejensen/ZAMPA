# Privacy Policy & Terms of Use Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `privacy.html` and `terms.html` pages with full i18n support in 9 languages, matching the existing Zampa landing page look & feel, to provide App Store Connect with valid Privacy Policy and Marketing URLs.

**Architecture:** Two standalone HTML pages sharing the same `styles.css` and `main.js` as `index.html`. Legal content rendered via the existing i18n system with new keys added to all 9 locale JSON files. Nav links point back to `index.html#section`. The i18n fetch path in `main.js` is updated to use a base path so it works from both root and subpage URLs.

**Tech Stack:** HTML, CSS, vanilla JS, static hosting on GitHub Pages (getzampa.com)

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `privacy.html` | Privacy policy page — same header/footer as index, legal content section |
| Create | `terms.html` | Terms of use page — same header/footer as index, legal content section |
| Modify | `styles.css` | Add `.legal` section styles for legal text layout |
| Modify | `main.js:24-39` | Fix anchor link handler to skip cross-page links; fix i18n fetch path for subpages |
| Modify | `index.html:429` | Update footer privacy link `href` to `privacy.html` |
| Modify | `index.html:430` | Update footer terms link `href` to `terms.html` |
| Modify | `i18n/es.json` | Add `privacy.*` and `terms.*` keys (Spanish) |
| Modify | `i18n/en.json` | Add `privacy.*` and `terms.*` keys (English) |
| Modify | `i18n/ca.json` | Add `privacy.*` and `terms.*` keys (Catalan) |
| Modify | `i18n/eu.json` | Add `privacy.*` and `terms.*` keys (Basque) |
| Modify | `i18n/gl.json` | Add `privacy.*` and `terms.*` keys (Galician) |
| Modify | `i18n/pt.json` | Add `privacy.*` and `terms.*` keys (Portuguese) |
| Modify | `i18n/de.json` | Add `privacy.*` and `terms.*` keys (German) |
| Modify | `i18n/fr.json` | Add `privacy.*` and `terms.*` keys (French) |
| Modify | `i18n/it.json` | Add `privacy.*` and `terms.*` keys (Italian) |

---

### Task 1: Add legal page CSS styles

**Files:**
- Modify: `styles.css` (append before the final responsive media query at line ~1297)

- [ ] **Step 1: Add `.legal` section styles to `styles.css`**

Append before the `/* ===== Responsive ===== */` comment at line 1297:

```css
/* ===== Legal Pages (Privacy & Terms) ===== */
.legal {
  padding-top: 120px;
  padding-bottom: 80px;
  min-height: 60vh;
}

.legal__inner {
  max-width: 760px;
  margin: 0 auto;
}

.legal__title {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 8px;
}

.legal__updated {
  font-size: 0.875rem;
  color: var(--muted);
  margin-bottom: 40px;
}

.legal__body h2 {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  margin-top: 32px;
  margin-bottom: 12px;
}

.legal__body p {
  font-size: 0.975rem;
  color: var(--muted);
  line-height: 1.75;
  margin-bottom: 16px;
}

.legal__body ul {
  list-style: disc;
  padding-left: 24px;
  margin-bottom: 16px;
}

.legal__body ul li {
  font-size: 0.975rem;
  color: var(--muted);
  line-height: 1.75;
  margin-bottom: 6px;
}

.legal__body a {
  color: var(--primary-dark);
  font-weight: 600;
  text-decoration: underline;
}
```

And inside the existing `@media (max-width: 767px)` block at line 1298, add:

```css
  .legal {
    padding-top: 100px;
  }

  .legal__title {
    font-size: 1.6rem;
  }
```

- [ ] **Step 2: Commit**

```bash
git add styles.css
git commit -m "style: add legal page layout styles for privacy and terms pages"
```

---

### Task 2: Create `privacy.html`

**Files:**
- Create: `privacy.html`

- [ ] **Step 1: Create `privacy.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Política de privacidad de Zampa — cómo recopilamos, usamos y protegemos tus datos.">
  <meta name="theme-color" content="#FAAF32">
  <title>Zampa - Política de privacidad</title>
  <link rel="icon" type="image/png" href="assets/logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- ===== Header ===== -->
  <header class="header">
    <div class="container header__inner">
      <a href="/" class="header__logo">
        <img src="assets/logo.png" alt="Zampa logo">
        <span>Zampa</span>
      </a>

      <nav class="header__nav">
        <a href="index.html#customers" data-i18n="nav.customers">Clientes</a>
        <a href="index.html#merchants" data-i18n="nav.merchants">Comercios</a>
        <a href="index.html#faq" data-i18n="nav.faq">FAQ</a>
      </nav>

      <div class="header__right">
        <div class="lang-selector">
          <button class="lang-selector__btn" aria-label="Seleccionar idioma">
            <span class="lang-selector__label">ES</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="lang-selector__dropdown">
            <button data-lang="ES" class="active">Espa&ntilde;ol</button>
            <button data-lang="CA">Catal&agrave;</button>
            <button data-lang="EU">Euskara</button>
            <button data-lang="GL">Galego</button>
            <button data-lang="EN">English</button>
            <button data-lang="PT">Portugu&ecirc;s</button>
            <button data-lang="DE">Deutsch</button>
            <button data-lang="FR">Fran&ccedil;ais</button>
            <button data-lang="IT">Italiano</button>
          </div>
        </div>

        <button class="burger" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>

  <!-- ===== Privacy Policy Content ===== -->
  <section class="legal section--white">
    <div class="container legal__inner">
      <h1 class="legal__title" data-i18n="privacy.title">Política de privacidad</h1>
      <p class="legal__updated" data-i18n="privacy.updated">Última actualización: 12 de abril de 2026</p>

      <div class="legal__body">
        <h2 data-i18n="privacy.s1.title">1. Responsable del tratamiento</h2>
        <p data-i18n="privacy.s1.body">Sozo Labs es responsable del tratamiento de los datos personales recogidos a través de la aplicación Zampa. Para cualquier consulta relacionada con la privacidad, puedes escribirnos a soporte@getzampa.com.</p>

        <h2 data-i18n="privacy.s2.title">2. Datos que recopilamos</h2>
        <p data-i18n="privacy.s2.intro">Recopilamos los siguientes datos según el uso que hagas de Zampa:</p>
        <ul>
          <li data-i18n="privacy.s2.d1">Datos de cuenta: email, nombre y teléfono (opcional para comercios) al registrarte con email, Apple Sign-In o Google Sign-In.</li>
          <li data-i18n="privacy.s2.d2">Ubicación: posición aproximada mientras usas la app para mostrarte restaurantes cercanos. Solo se accede cuando la app está en uso.</li>
          <li data-i18n="privacy.s2.d3">Fotos: imágenes que subes voluntariamente para tu perfil o para publicar ofertas (cámara o galería).</li>
          <li data-i18n="privacy.s2.d4">Notificaciones push: token de dispositivo (FCM) para enviarte avisos sobre nuevas ofertas de restaurantes que sigues.</li>
          <li data-i18n="privacy.s2.d5">Métricas de uso: impresiones y clics en ofertas, usados para estadísticas de comercios. No utilizamos servicios de analítica de terceros.</li>
          <li data-i18n="privacy.s2.d6">Datos de negocio (comercios): dirección, horarios, tipo de cocina y foto de portada de tu establecimiento.</li>
        </ul>

        <h2 data-i18n="privacy.s3.title">3. Base legal</h2>
        <p data-i18n="privacy.s3.body">Tratamos tus datos con base en tu consentimiento al crear una cuenta y en la ejecución del servicio que proporcionamos. Puedes retirar tu consentimiento en cualquier momento eliminando tu cuenta.</p>

        <h2 data-i18n="privacy.s4.title">4. Servicios de terceros</h2>
        <p data-i18n="privacy.s4.intro">Zampa utiliza los siguientes servicios de terceros para su funcionamiento:</p>
        <ul>
          <li data-i18n="privacy.s4.t1">Firebase (Google): autenticación, base de datos, almacenamiento de archivos y mensajería push.</li>
          <li data-i18n="privacy.s4.t2">Google Sign-In y Apple Sign-In: inicio de sesión con cuentas existentes.</li>
          <li data-i18n="privacy.s4.t3">Firebase Crashlytics (Android): informes de errores para mejorar la estabilidad de la app.</li>
        </ul>

        <h2 data-i18n="privacy.s5.title">5. Tus derechos</h2>
        <p data-i18n="privacy.s5.body">De acuerdo con el Reglamento General de Protección de Datos (RGPD), tienes derecho a acceder, rectificar, suprimir y portar tus datos personales. Para ejercer cualquiera de estos derechos, escríbenos a soporte@getzampa.com.</p>

        <h2 data-i18n="privacy.s6.title">6. Eliminación de cuenta</h2>
        <p data-i18n="privacy.s6.body">Puedes solicitar la eliminación de tu cuenta desde la propia app. Una vez solicitada, tus datos se conservarán durante un periodo de gracia de 30 días, tras el cual se eliminarán de forma automática y permanente, incluyendo datos de perfil, favoritos, historial, notificaciones y archivos almacenados.</p>

        <h2 data-i18n="privacy.s7.title">7. Seguridad</h2>
        <p data-i18n="privacy.s7.body">Aplicamos medidas técnicas para proteger tus datos: reglas de acceso en base de datos que garantizan que cada usuario solo pueda acceder a su propia información, comunicaciones cifradas y almacenamiento seguro.</p>

        <h2 data-i18n="privacy.s8.title">8. Menores</h2>
        <p data-i18n="privacy.s8.body">Zampa no está dirigida a menores de 16 años. No recopilamos datos de menores de forma intencionada. Si detectamos que un menor ha creado una cuenta, la eliminaremos.</p>

        <h2 data-i18n="privacy.s9.title">9. Modificaciones</h2>
        <p data-i18n="privacy.s9.body">Podemos actualizar esta política de privacidad. En caso de cambios relevantes, lo notificaremos a través de la app. Te recomendamos consultar esta página periódicamente.</p>

        <h2 data-i18n="privacy.s10.title">10. Contacto</h2>
        <p data-i18n="privacy.s10.body">Para cualquier consulta sobre privacidad, escríbenos a soporte@getzampa.com.</p>
      </div>
    </div>
  </section>

  <!-- Wave: content -> footer -->
  <div class="wave-divider">
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
      <path d="M0,40 C360,100 1080,0 1440,60 L1440,100 L0,100 Z" fill="#2D3436"/>
    </svg>
  </div>

  <!-- ===== Footer ===== -->
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__logo">
        <img src="assets/logo.png" alt="Zampa logo">
        <span>Zampa</span>
      </div>
      <p class="footer__tagline" data-i18n="footer.tagline">Descubre los mejores menus del dia</p>

      <div class="store-wrap store-wrap--footer">
        <div class="store-buttons">
          <a href="#" class="store-btn" aria-disabled="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <div class="store-btn__text">
              <small data-i18n="footer.appstore.label">Disponible en</small>
              <strong>App Store</strong>
            </div>
          </a>
          <a href="#" class="store-btn" aria-disabled="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.73c-.36-.17-.68-.52-.68-1.09V1.36c0-.57.32-.92.68-1.09l11.2 11.73L3.18 23.73zM15.74 15.37l-2.56-2.67L15.74 10l3.64 2.04c.82.46.82 1.2 0 1.66l-3.64 2.04-.01-.01.01-.36zM13.18 12.7L5.11 21.2l10.63-5.96-2.56-2.54zM5.11 2.8l8.07 8.5 2.56-2.54L5.11 2.8z"/></svg>
            <div class="store-btn__text">
              <small data-i18n="footer.playstore.label">Disponible en</small>
              <strong>Google Play</strong>
            </div>
          </a>
        </div>
        <div class="coming-soon-sign coming-soon-sign--small" aria-label="Próximamente">
          <span class="coming-soon-sign__text" data-i18n="common.coming_soon">PRÓXIMAMENTE</span>
        </div>
      </div>

      <nav class="footer__links">
        <a href="mailto:soporte@getzampa.com" data-i18n="footer.contact">Contacto</a>
        <a href="privacy.html" data-i18n="footer.privacy">Politica de privacidad</a>
        <a href="terms.html" data-i18n="footer.terms">Terminos de uso</a>
      </nav>

      <p class="footer__copy" data-i18n="footer.copyright">&copy; 2026 Sozo Labs. Todos los derechos reservados.</p>
    </div>
  </footer>

  <script src="main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add privacy.html
git commit -m "feat: add privacy policy page with i18n support"
```

---

### Task 3: Create `terms.html`

**Files:**
- Create: `terms.html`

- [ ] **Step 1: Create `terms.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Términos de uso de Zampa — condiciones del servicio para clientes y comercios.">
  <meta name="theme-color" content="#FAAF32">
  <title>Zampa - Términos de uso</title>
  <link rel="icon" type="image/png" href="assets/logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- ===== Header ===== -->
  <header class="header">
    <div class="container header__inner">
      <a href="/" class="header__logo">
        <img src="assets/logo.png" alt="Zampa logo">
        <span>Zampa</span>
      </a>

      <nav class="header__nav">
        <a href="index.html#customers" data-i18n="nav.customers">Clientes</a>
        <a href="index.html#merchants" data-i18n="nav.merchants">Comercios</a>
        <a href="index.html#faq" data-i18n="nav.faq">FAQ</a>
      </nav>

      <div class="header__right">
        <div class="lang-selector">
          <button class="lang-selector__btn" aria-label="Seleccionar idioma">
            <span class="lang-selector__label">ES</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="lang-selector__dropdown">
            <button data-lang="ES" class="active">Espa&ntilde;ol</button>
            <button data-lang="CA">Catal&agrave;</button>
            <button data-lang="EU">Euskara</button>
            <button data-lang="GL">Galego</button>
            <button data-lang="EN">English</button>
            <button data-lang="PT">Portugu&ecirc;s</button>
            <button data-lang="DE">Deutsch</button>
            <button data-lang="FR">Fran&ccedil;ais</button>
            <button data-lang="IT">Italiano</button>
          </div>
        </div>

        <button class="burger" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>

  <!-- ===== Terms of Use Content ===== -->
  <section class="legal section--white">
    <div class="container legal__inner">
      <h1 class="legal__title" data-i18n="terms.title">Términos de uso</h1>
      <p class="legal__updated" data-i18n="terms.updated">Última actualización: 12 de abril de 2026</p>

      <div class="legal__body">
        <h2 data-i18n="terms.s1.title">1. Objeto</h2>
        <p data-i18n="terms.s1.body">Zampa es una plataforma que conecta a comensales con restaurantes y bares que publican sus ofertas y menús del día. Estos términos regulan el uso de la aplicación móvil y el sitio web getzampa.com, operados por Sozo Labs.</p>

        <h2 data-i18n="terms.s2.title">2. Registro y cuenta</h2>
        <p data-i18n="terms.s2.body">Para usar ciertas funcionalidades de Zampa es necesario crear una cuenta. Te comprometes a proporcionar datos verídicos y a mantener la confidencialidad de tus credenciales. Eres responsable de toda la actividad que se realice desde tu cuenta.</p>

        <h2 data-i18n="terms.s3.title">3. Uso aceptable</h2>
        <p data-i18n="terms.s3.body">Te comprometes a no utilizar Zampa para publicar contenido falso, ofensivo o engañoso; enviar spam o publicidad no solicitada; suplantar la identidad de otros usuarios o comercios; ni realizar cualquier acción que perjudique el funcionamiento de la plataforma.</p>

        <h2 data-i18n="terms.s4.title">4. Contenido de comercios</h2>
        <p data-i18n="terms.s4.body">Los comercios son responsables de la veracidad de las ofertas, precios, fotos y descripciones que publican. Zampa no verifica ni garantiza la exactitud de dicho contenido.</p>

        <h2 data-i18n="terms.s5.title">5. Planes y suscripciones</h2>
        <p data-i18n="terms.s5.body">Zampa ofrece un plan gratuito con funcionalidades básicas para comercios y un Plan Pro con notificaciones push y estadísticas avanzadas. Los detalles y precios del Plan Pro se comunican dentro de la app. Sozo Labs se reserva el derecho de modificar los planes y precios con previo aviso.</p>

        <h2 data-i18n="terms.s6.title">6. Propiedad intelectual</h2>
        <p data-i18n="terms.s6.body">La marca Zampa, el logotipo y el contenido original del sitio web y la app son propiedad de Sozo Labs. No está permitido copiar, modificar ni distribuir estos elementos sin autorización previa.</p>

        <h2 data-i18n="terms.s7.title">7. Limitación de responsabilidad</h2>
        <p data-i18n="terms.s7.body">Zampa actúa como intermediario entre comensales y restaurantes. No somos parte en ninguna transacción entre ambos. No nos hacemos responsables de la calidad, precio o disponibilidad de las ofertas publicadas por los comercios.</p>

        <h2 data-i18n="terms.s8.title">8. Suspensión y cancelación</h2>
        <p data-i18n="terms.s8.body">Sozo Labs se reserva el derecho de suspender o cancelar cuentas que incumplan estos términos, sin necesidad de previo aviso. El usuario puede eliminar su cuenta en cualquier momento desde la app.</p>

        <h2 data-i18n="terms.s9.title">9. Legislación aplicable</h2>
        <p data-i18n="terms.s9.body">Estos términos se rigen por la legislación española. Cualquier disputa se someterá a los juzgados y tribunales competentes.</p>

        <h2 data-i18n="terms.s10.title">10. Contacto</h2>
        <p data-i18n="terms.s10.body">Para cualquier consulta sobre estos términos, escríbenos a soporte@getzampa.com.</p>
      </div>
    </div>
  </section>

  <!-- Wave: content -> footer -->
  <div class="wave-divider">
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
      <path d="M0,40 C360,100 1080,0 1440,60 L1440,100 L0,100 Z" fill="#2D3436"/>
    </svg>
  </div>

  <!-- ===== Footer ===== -->
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__logo">
        <img src="assets/logo.png" alt="Zampa logo">
        <span>Zampa</span>
      </div>
      <p class="footer__tagline" data-i18n="footer.tagline">Descubre los mejores menus del dia</p>

      <div class="store-wrap store-wrap--footer">
        <div class="store-buttons">
          <a href="#" class="store-btn" aria-disabled="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <div class="store-btn__text">
              <small data-i18n="footer.appstore.label">Disponible en</small>
              <strong>App Store</strong>
            </div>
          </a>
          <a href="#" class="store-btn" aria-disabled="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.73c-.36-.17-.68-.52-.68-1.09V1.36c0-.57.32-.92.68-1.09l11.2 11.73L3.18 23.73zM15.74 15.37l-2.56-2.67L15.74 10l3.64 2.04c.82.46.82 1.2 0 1.66l-3.64 2.04-.01-.01.01-.36zM13.18 12.7L5.11 21.2l10.63-5.96-2.56-2.54zM5.11 2.8l8.07 8.5 2.56-2.54L5.11 2.8z"/></svg>
            <div class="store-btn__text">
              <small data-i18n="footer.playstore.label">Disponible en</small>
              <strong>Google Play</strong>
            </div>
          </a>
        </div>
        <div class="coming-soon-sign coming-soon-sign--small" aria-label="Próximamente">
          <span class="coming-soon-sign__text" data-i18n="common.coming_soon">PRÓXIMAMENTE</span>
        </div>
      </div>

      <nav class="footer__links">
        <a href="mailto:soporte@getzampa.com" data-i18n="footer.contact">Contacto</a>
        <a href="privacy.html" data-i18n="footer.privacy">Politica de privacidad</a>
        <a href="terms.html" data-i18n="footer.terms">Terminos de uso</a>
      </nav>

      <p class="footer__copy" data-i18n="footer.copyright">&copy; 2026 Sozo Labs. Todos los derechos reservados.</p>
    </div>
  </footer>

  <script src="main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add terms.html
git commit -m "feat: add terms of use page with i18n support"
```

---

### Task 4: Fix `main.js` for subpage compatibility

**Files:**
- Modify: `main.js:24-39` (anchor link handler)
- Modify: `main.js:161-163` (i18n fetch path)

- [ ] **Step 1: Update anchor link handler to skip cross-page links**

In `main.js`, replace lines 24-40 (the smooth scroll block):

```js
  // ----- Smooth Scroll for Anchor Links -----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });

        // Close mobile nav if open
        if (burger) burger.classList.remove('active');
        if (nav) nav.classList.remove('open');
      }
    });
  });
```

With this (only change: selector excludes links that contain a path before the `#`):

```js
  // ----- Smooth Scroll for Same-Page Anchor Links -----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });

        // Close mobile nav if open
        if (burger) burger.classList.remove('active');
        if (nav) nav.classList.remove('open');
      }
    });
  });
```

Note: The selector `a[href^="#"]` already only matches `#`-prefixed hrefs, so links like `index.html#customers` won't be intercepted. No functional change needed here — the existing code is already correct. However, update the comment for clarity.

- [ ] **Step 2: Fix i18n fetch path to work from subpages**

The current fetch at line 163 uses a relative path:

```js
      const resp = await fetch(`i18n/${lang}.json`);
```

Since all pages are at the same directory level, this relative path already works correctly for `privacy.html` and `terms.html`. No change needed.

Verify: `privacy.html` lives at root level alongside `i18n/` folder, so `i18n/es.json` resolves correctly from both `index.html` and `privacy.html`.

- [ ] **Step 3: Commit**

```bash
git add main.js
git commit -m "docs: clarify smooth scroll comment for subpage compatibility"
```

---

### Task 5: Update footer links in `index.html`

**Files:**
- Modify: `index.html:429-430`

- [ ] **Step 1: Update privacy and terms links**

In `index.html`, change the footer links from `href="#"` to actual page paths:

Line 429: `<a href="#" data-i18n="footer.privacy">` → `<a href="privacy.html" data-i18n="footer.privacy">`
Line 430: `<a href="#" data-i18n="footer.terms">` → `<a href="terms.html" data-i18n="footer.terms">`

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "fix: link footer privacy and terms to their new pages"
```

---

### Task 6: Add i18n keys — Spanish (es.json)

**Files:**
- Modify: `i18n/es.json`

- [ ] **Step 1: Add privacy and terms keys to `i18n/es.json`**

Add the following keys after `"common.coming_soon"`:

```json
  "privacy.title": "Política de privacidad",
  "privacy.updated": "Última actualización: 12 de abril de 2026",
  "privacy.s1.title": "1. Responsable del tratamiento",
  "privacy.s1.body": "Sozo Labs es responsable del tratamiento de los datos personales recogidos a través de la aplicación Zampa. Para cualquier consulta relacionada con la privacidad, puedes escribirnos a soporte@getzampa.com.",
  "privacy.s2.title": "2. Datos que recopilamos",
  "privacy.s2.intro": "Recopilamos los siguientes datos según el uso que hagas de Zampa:",
  "privacy.s2.d1": "Datos de cuenta: email, nombre y teléfono (opcional para comercios) al registrarte con email, Apple Sign-In o Google Sign-In.",
  "privacy.s2.d2": "Ubicación: posición aproximada mientras usas la app para mostrarte restaurantes cercanos. Solo se accede cuando la app está en uso.",
  "privacy.s2.d3": "Fotos: imágenes que subes voluntariamente para tu perfil o para publicar ofertas (cámara o galería).",
  "privacy.s2.d4": "Notificaciones push: token de dispositivo (FCM) para enviarte avisos sobre nuevas ofertas de restaurantes que sigues.",
  "privacy.s2.d5": "Métricas de uso: impresiones y clics en ofertas, usados para estadísticas de comercios. No utilizamos servicios de analítica de terceros.",
  "privacy.s2.d6": "Datos de negocio (comercios): dirección, horarios, tipo de cocina y foto de portada de tu establecimiento.",
  "privacy.s3.title": "3. Base legal",
  "privacy.s3.body": "Tratamos tus datos con base en tu consentimiento al crear una cuenta y en la ejecución del servicio que proporcionamos. Puedes retirar tu consentimiento en cualquier momento eliminando tu cuenta.",
  "privacy.s4.title": "4. Servicios de terceros",
  "privacy.s4.intro": "Zampa utiliza los siguientes servicios de terceros para su funcionamiento:",
  "privacy.s4.t1": "Firebase (Google): autenticación, base de datos, almacenamiento de archivos y mensajería push.",
  "privacy.s4.t2": "Google Sign-In y Apple Sign-In: inicio de sesión con cuentas existentes.",
  "privacy.s4.t3": "Firebase Crashlytics (Android): informes de errores para mejorar la estabilidad de la app.",
  "privacy.s5.title": "5. Tus derechos",
  "privacy.s5.body": "De acuerdo con el Reglamento General de Protección de Datos (RGPD), tienes derecho a acceder, rectificar, suprimir y portar tus datos personales. Para ejercer cualquiera de estos derechos, escríbenos a soporte@getzampa.com.",
  "privacy.s6.title": "6. Eliminación de cuenta",
  "privacy.s6.body": "Puedes solicitar la eliminación de tu cuenta desde la propia app. Una vez solicitada, tus datos se conservarán durante un periodo de gracia de 30 días, tras el cual se eliminarán de forma automática y permanente, incluyendo datos de perfil, favoritos, historial, notificaciones y archivos almacenados.",
  "privacy.s7.title": "7. Seguridad",
  "privacy.s7.body": "Aplicamos medidas técnicas para proteger tus datos: reglas de acceso en base de datos que garantizan que cada usuario solo pueda acceder a su propia información, comunicaciones cifradas y almacenamiento seguro.",
  "privacy.s8.title": "8. Menores",
  "privacy.s8.body": "Zampa no está dirigida a menores de 16 años. No recopilamos datos de menores de forma intencionada. Si detectamos que un menor ha creado una cuenta, la eliminaremos.",
  "privacy.s9.title": "9. Modificaciones",
  "privacy.s9.body": "Podemos actualizar esta política de privacidad. En caso de cambios relevantes, lo notificaremos a través de la app. Te recomendamos consultar esta página periódicamente.",
  "privacy.s10.title": "10. Contacto",
  "privacy.s10.body": "Para cualquier consulta sobre privacidad, escríbenos a soporte@getzampa.com.",
  "terms.title": "Términos de uso",
  "terms.updated": "Última actualización: 12 de abril de 2026",
  "terms.s1.title": "1. Objeto",
  "terms.s1.body": "Zampa es una plataforma que conecta a comensales con restaurantes y bares que publican sus ofertas y menús del día. Estos términos regulan el uso de la aplicación móvil y el sitio web getzampa.com, operados por Sozo Labs.",
  "terms.s2.title": "2. Registro y cuenta",
  "terms.s2.body": "Para usar ciertas funcionalidades de Zampa es necesario crear una cuenta. Te comprometes a proporcionar datos verídicos y a mantener la confidencialidad de tus credenciales. Eres responsable de toda la actividad que se realice desde tu cuenta.",
  "terms.s3.title": "3. Uso aceptable",
  "terms.s3.body": "Te comprometes a no utilizar Zampa para publicar contenido falso, ofensivo o engañoso; enviar spam o publicidad no solicitada; suplantar la identidad de otros usuarios o comercios; ni realizar cualquier acción que perjudique el funcionamiento de la plataforma.",
  "terms.s4.title": "4. Contenido de comercios",
  "terms.s4.body": "Los comercios son responsables de la veracidad de las ofertas, precios, fotos y descripciones que publican. Zampa no verifica ni garantiza la exactitud de dicho contenido.",
  "terms.s5.title": "5. Planes y suscripciones",
  "terms.s5.body": "Zampa ofrece un plan gratuito con funcionalidades básicas para comercios y un Plan Pro con notificaciones push y estadísticas avanzadas. Los detalles y precios del Plan Pro se comunican dentro de la app. Sozo Labs se reserva el derecho de modificar los planes y precios con previo aviso.",
  "terms.s6.title": "6. Propiedad intelectual",
  "terms.s6.body": "La marca Zampa, el logotipo y el contenido original del sitio web y la app son propiedad de Sozo Labs. No está permitido copiar, modificar ni distribuir estos elementos sin autorización previa.",
  "terms.s7.title": "7. Limitación de responsabilidad",
  "terms.s7.body": "Zampa actúa como intermediario entre comensales y restaurantes. No somos parte en ninguna transacción entre ambos. No nos hacemos responsables de la calidad, precio o disponibilidad de las ofertas publicadas por los comercios.",
  "terms.s8.title": "8. Suspensión y cancelación",
  "terms.s8.body": "Sozo Labs se reserva el derecho de suspender o cancelar cuentas que incumplan estos términos, sin necesidad de previo aviso. El usuario puede eliminar su cuenta en cualquier momento desde la app.",
  "terms.s9.title": "9. Legislación aplicable",
  "terms.s9.body": "Estos términos se rigen por la legislación española. Cualquier disputa se someterá a los juzgados y tribunales competentes.",
  "terms.s10.title": "10. Contacto",
  "terms.s10.body": "Para cualquier consulta sobre estos términos, escríbenos a soporte@getzampa.com."
```

- [ ] **Step 2: Commit**

```bash
git add i18n/es.json
git commit -m "i18n: add Spanish privacy and terms translations"
```

---

### Task 7: Add i18n keys — English (en.json)

**Files:**
- Modify: `i18n/en.json`

- [ ] **Step 1: Add privacy and terms keys to `i18n/en.json`**

Add after `"common.coming_soon"`:

```json
  "privacy.title": "Privacy Policy",
  "privacy.updated": "Last updated: April 12, 2026",
  "privacy.s1.title": "1. Data Controller",
  "privacy.s1.body": "Sozo Labs is the data controller for personal data collected through the Zampa app. For any privacy-related enquiries, you can contact us at soporte@getzampa.com.",
  "privacy.s2.title": "2. Data We Collect",
  "privacy.s2.intro": "We collect the following data depending on how you use Zampa:",
  "privacy.s2.d1": "Account data: email, name, and phone number (optional for merchants) when you sign up with email, Apple Sign-In, or Google Sign-In.",
  "privacy.s2.d2": "Location: approximate position while using the app to show you nearby restaurants. Only accessed when the app is in use.",
  "privacy.s2.d3": "Photos: images you voluntarily upload for your profile or to publish offers (camera or gallery).",
  "privacy.s2.d4": "Push notifications: device token (FCM) to send you alerts about new offers from restaurants you follow.",
  "privacy.s2.d5": "Usage metrics: impressions and clicks on offers, used for merchant statistics. We do not use third-party analytics services.",
  "privacy.s2.d6": "Business data (merchants): address, opening hours, cuisine type, and cover photo of your establishment.",
  "privacy.s3.title": "3. Legal Basis",
  "privacy.s3.body": "We process your data based on your consent when creating an account and on the performance of the service we provide. You may withdraw your consent at any time by deleting your account.",
  "privacy.s4.title": "4. Third-Party Services",
  "privacy.s4.intro": "Zampa uses the following third-party services:",
  "privacy.s4.t1": "Firebase (Google): authentication, database, file storage, and push messaging.",
  "privacy.s4.t2": "Google Sign-In and Apple Sign-In: sign in with existing accounts.",
  "privacy.s4.t3": "Firebase Crashlytics (Android): crash reports to improve app stability.",
  "privacy.s5.title": "5. Your Rights",
  "privacy.s5.body": "Under the General Data Protection Regulation (GDPR), you have the right to access, rectify, delete, and port your personal data. To exercise any of these rights, contact us at soporte@getzampa.com.",
  "privacy.s6.title": "6. Account Deletion",
  "privacy.s6.body": "You can request account deletion from within the app. Once requested, your data will be retained for a 30-day grace period, after which it will be automatically and permanently deleted, including profile data, favourites, history, notifications, and stored files.",
  "privacy.s7.title": "7. Security",
  "privacy.s7.body": "We apply technical measures to protect your data: database access rules that ensure each user can only access their own information, encrypted communications, and secure storage.",
  "privacy.s8.title": "8. Children",
  "privacy.s8.body": "Zampa is not intended for children under 16 years of age. We do not knowingly collect data from minors. If we discover that a minor has created an account, we will delete it.",
  "privacy.s9.title": "9. Changes",
  "privacy.s9.body": "We may update this privacy policy. If we make significant changes, we will notify you through the app. We recommend checking this page periodically.",
  "privacy.s10.title": "10. Contact",
  "privacy.s10.body": "For any privacy-related enquiries, contact us at soporte@getzampa.com.",
  "terms.title": "Terms of Use",
  "terms.updated": "Last updated: April 12, 2026",
  "terms.s1.title": "1. Purpose",
  "terms.s1.body": "Zampa is a platform that connects diners with restaurants and bars that publish their daily offers and menus. These terms govern the use of the mobile app and the website getzampa.com, operated by Sozo Labs.",
  "terms.s2.title": "2. Registration and Account",
  "terms.s2.body": "To use certain features of Zampa, you need to create an account. You agree to provide accurate information and to keep your credentials confidential. You are responsible for all activity that occurs under your account.",
  "terms.s3.title": "3. Acceptable Use",
  "terms.s3.body": "You agree not to use Zampa to publish false, offensive, or misleading content; send spam or unsolicited advertising; impersonate other users or businesses; or take any action that harms the platform.",
  "terms.s4.title": "4. Merchant Content",
  "terms.s4.body": "Merchants are responsible for the accuracy of the offers, prices, photos, and descriptions they publish. Zampa does not verify or guarantee the accuracy of such content.",
  "terms.s5.title": "5. Plans and Subscriptions",
  "terms.s5.body": "Zampa offers a free plan with basic features for merchants and a Pro Plan with push notifications and advanced statistics. Pro Plan details and pricing are communicated within the app. Sozo Labs reserves the right to modify plans and pricing with prior notice.",
  "terms.s6.title": "6. Intellectual Property",
  "terms.s6.body": "The Zampa brand, logo, and original content of the website and app are the property of Sozo Labs. Copying, modifying, or distributing these elements without prior authorisation is not permitted.",
  "terms.s7.title": "7. Limitation of Liability",
  "terms.s7.body": "Zampa acts as an intermediary between diners and restaurants. We are not a party to any transaction between them. We are not responsible for the quality, price, or availability of offers published by merchants.",
  "terms.s8.title": "8. Suspension and Cancellation",
  "terms.s8.body": "Sozo Labs reserves the right to suspend or cancel accounts that violate these terms, without prior notice. Users may delete their account at any time from within the app.",
  "terms.s9.title": "9. Governing Law",
  "terms.s9.body": "These terms are governed by Spanish law. Any disputes shall be submitted to the competent courts.",
  "terms.s10.title": "10. Contact",
  "terms.s10.body": "For any enquiries about these terms, contact us at soporte@getzampa.com."
```

- [ ] **Step 2: Commit**

```bash
git add i18n/en.json
git commit -m "i18n: add English privacy and terms translations"
```

---

### Task 8: Add i18n keys — Catalan (ca.json)

**Files:**
- Modify: `i18n/ca.json`

- [ ] **Step 1: Add privacy and terms keys to `i18n/ca.json`**

Add after `"common.coming_soon"`:

```json
  "privacy.title": "Política de privadesa",
  "privacy.updated": "Darrera actualització: 12 d'abril de 2026",
  "privacy.s1.title": "1. Responsable del tractament",
  "privacy.s1.body": "Sozo Labs és responsable del tractament de les dades personals recollides a través de l'aplicació Zampa. Per a qualsevol consulta relacionada amb la privadesa, pots escriure'ns a soporte@getzampa.com.",
  "privacy.s2.title": "2. Dades que recopilem",
  "privacy.s2.intro": "Recopilem les dades següents segons l'ús que facis de Zampa:",
  "privacy.s2.d1": "Dades de compte: email, nom i telèfon (opcional per a comerços) en registrar-te amb email, Apple Sign-In o Google Sign-In.",
  "privacy.s2.d2": "Ubicació: posició aproximada mentre uses l'app per mostrar-te restaurants propers. Només s'hi accedeix quan l'app està en ús.",
  "privacy.s2.d3": "Fotos: imatges que puges voluntàriament per al teu perfil o per publicar ofertes (càmera o galeria).",
  "privacy.s2.d4": "Notificacions push: token de dispositiu (FCM) per enviar-te avisos sobre noves ofertes de restaurants que segueixes.",
  "privacy.s2.d5": "Mètriques d'ús: impressions i clics en ofertes, usats per a estadístiques de comerços. No utilitzem serveis d'analítica de tercers.",
  "privacy.s2.d6": "Dades de negoci (comerços): adreça, horaris, tipus de cuina i foto de portada del teu establiment.",
  "privacy.s3.title": "3. Base legal",
  "privacy.s3.body": "Tractem les teves dades amb base en el teu consentiment en crear un compte i en l'execució del servei que proporcionem. Pots retirar el teu consentiment en qualsevol moment eliminant el teu compte.",
  "privacy.s4.title": "4. Serveis de tercers",
  "privacy.s4.intro": "Zampa utilitza els serveis de tercers següents per al seu funcionament:",
  "privacy.s4.t1": "Firebase (Google): autenticació, base de dades, emmagatzematge d'arxius i missatgeria push.",
  "privacy.s4.t2": "Google Sign-In i Apple Sign-In: inici de sessió amb comptes existents.",
  "privacy.s4.t3": "Firebase Crashlytics (Android): informes d'errors per millorar l'estabilitat de l'app.",
  "privacy.s5.title": "5. Els teus drets",
  "privacy.s5.body": "D'acord amb el Reglament General de Protecció de Dades (RGPD), tens dret a accedir, rectificar, suprimir i portar les teves dades personals. Per exercir qualsevol d'aquests drets, escriu-nos a soporte@getzampa.com.",
  "privacy.s6.title": "6. Eliminació de compte",
  "privacy.s6.body": "Pots sol·licitar l'eliminació del teu compte des de la mateixa app. Un cop sol·licitada, les teves dades es conservaran durant un període de gràcia de 30 dies, després del qual s'eliminaran de forma automàtica i permanent, incloent-hi dades de perfil, favorits, historial, notificacions i arxius emmagatzemats.",
  "privacy.s7.title": "7. Seguretat",
  "privacy.s7.body": "Apliquem mesures tècniques per protegir les teves dades: regles d'accés a base de dades que garanteixen que cada usuari només pugui accedir a la seva pròpia informació, comunicacions xifrades i emmagatzematge segur.",
  "privacy.s8.title": "8. Menors",
  "privacy.s8.body": "Zampa no està dirigida a menors de 16 anys. No recopilem dades de menors de forma intencionada. Si detectem que un menor ha creat un compte, l'eliminarem.",
  "privacy.s9.title": "9. Modificacions",
  "privacy.s9.body": "Podem actualitzar aquesta política de privadesa. En cas de canvis rellevants, ho notificarem a través de l'app. Et recomanem consultar aquesta pàgina periòdicament.",
  "privacy.s10.title": "10. Contacte",
  "privacy.s10.body": "Per a qualsevol consulta sobre privadesa, escriu-nos a soporte@getzampa.com.",
  "terms.title": "Termes d'ús",
  "terms.updated": "Darrera actualització: 12 d'abril de 2026",
  "terms.s1.title": "1. Objecte",
  "terms.s1.body": "Zampa és una plataforma que connecta comensals amb restaurants i bars que publiquen les seves ofertes i menús del dia. Aquests termes regulen l'ús de l'aplicació mòbil i el lloc web getzampa.com, operats per Sozo Labs.",
  "terms.s2.title": "2. Registre i compte",
  "terms.s2.body": "Per utilitzar certes funcionalitats de Zampa cal crear un compte. Et compromets a proporcionar dades verídiques i a mantenir la confidencialitat de les teves credencials. Ets responsable de tota l'activitat que es realitzi des del teu compte.",
  "terms.s3.title": "3. Ús acceptable",
  "terms.s3.body": "Et compromets a no utilitzar Zampa per publicar contingut fals, ofensiu o enganyós; enviar spam o publicitat no sol·licitada; suplantar la identitat d'altres usuaris o comerços; ni realitzar cap acció que perjudiqui el funcionament de la plataforma.",
  "terms.s4.title": "4. Contingut de comerços",
  "terms.s4.body": "Els comerços són responsables de la veracitat de les ofertes, preus, fotos i descripcions que publiquen. Zampa no verifica ni garanteix l'exactitud d'aquest contingut.",
  "terms.s5.title": "5. Plans i subscripcions",
  "terms.s5.body": "Zampa ofereix un pla gratuït amb funcionalitats bàsiques per a comerços i un Pla Pro amb notificacions push i estadístiques avançades. Els detalls i preus del Pla Pro es comuniquen dins l'app. Sozo Labs es reserva el dret de modificar els plans i preus amb previ avís.",
  "terms.s6.title": "6. Propietat intel·lectual",
  "terms.s6.body": "La marca Zampa, el logotip i el contingut original del lloc web i l'app són propietat de Sozo Labs. No està permès copiar, modificar ni distribuir aquests elements sense autorització prèvia.",
  "terms.s7.title": "7. Limitació de responsabilitat",
  "terms.s7.body": "Zampa actua com a intermediari entre comensals i restaurants. No som part en cap transacció entre ambdós. No ens fem responsables de la qualitat, preu o disponibilitat de les ofertes publicades pels comerços.",
  "terms.s8.title": "8. Suspensió i cancel·lació",
  "terms.s8.body": "Sozo Labs es reserva el dret de suspendre o cancel·lar comptes que incompleixin aquests termes, sense necessitat de previ avís. L'usuari pot eliminar el seu compte en qualsevol moment des de l'app.",
  "terms.s9.title": "9. Legislació aplicable",
  "terms.s9.body": "Aquests termes es regeixen per la legislació espanyola. Qualsevol disputa se sotmetrà als jutjats i tribunals competents.",
  "terms.s10.title": "10. Contacte",
  "terms.s10.body": "Per a qualsevol consulta sobre aquests termes, escriu-nos a soporte@getzampa.com."
```

- [ ] **Step 2: Commit**

```bash
git add i18n/ca.json
git commit -m "i18n: add Catalan privacy and terms translations"
```

---

### Task 9: Add i18n keys — Basque (eu.json)

**Files:**
- Modify: `i18n/eu.json`

- [ ] **Step 1: Add privacy and terms keys to `i18n/eu.json`**

Add after `"common.coming_soon"`:

```json
  "privacy.title": "Pribatutasun politika",
  "privacy.updated": "Azken eguneratzea: 2026ko apirilaren 12a",
  "privacy.s1.title": "1. Tratamenduaren arduraduna",
  "privacy.s1.body": "Sozo Labs da Zampa aplikazioaren bidez bildutako datu pertsonalen tratamenduaren arduraduna. Pribatutasunari buruzko edozein kontsultarako, idatzi iezaguzu soporte@getzampa.com helbidera.",
  "privacy.s2.title": "2. Biltzen ditugun datuak",
  "privacy.s2.intro": "Datu hauek biltzen ditugu Zampa nola erabiltzen duzunaren arabera:",
  "privacy.s2.d1": "Kontu datuak: emaila, izena eta telefonoa (aukerakoa merkataritzentzat) emailarekin, Apple Sign-In edo Google Sign-In bidez erregistratzean.",
  "privacy.s2.d2": "Kokapena: gutxi gorabeherako posizioa aplikazioa erabiltzen duzun bitartean, gertuko jatetxeak erakusteko. Aplikazioa erabiltzen ari zarenean soilik.",
  "privacy.s2.d3": "Argazkiak: zure profilean edo eskaintzak argitaratzeko borondatez igotzen dituzun irudiak (kamera edo galeria).",
  "privacy.s2.d4": "Push jakinarazpenak: gailuaren tokena (FCM) jarraitzen dituzun jatetxeen eskaintza berrien abisuak bidaltzeko.",
  "privacy.s2.d5": "Erabilera metrikak: eskaintzen inpresioak eta klikak, merkataritzen estatistiketarako erabiltzen direnak. Ez dugu hirugarrenen analitika zerbitzurik erabiltzen.",
  "privacy.s2.d6": "Negozio datuak (merkatariak): zure establezimenduaren helbidea, ordutegiak, sukaldaritza mota eta azaleko argazkia.",
  "privacy.s3.title": "3. Oinarri legala",
  "privacy.s3.body": "Zure datuak tratatzen ditugu kontua sortzean emandako baimenean eta eskaintzen dugun zerbitzuaren exekuzioan oinarrituta. Zure baimena edozein unetan atzera egin dezakezu kontua ezabatuz.",
  "privacy.s4.title": "4. Hirugarrenen zerbitzuak",
  "privacy.s4.intro": "Zampak hirugarrenen zerbitzu hauek erabiltzen ditu bere funtzionamendurako:",
  "privacy.s4.t1": "Firebase (Google): autentifikazioa, datu basea, fitxategien biltegiratzea eta push mezularitza.",
  "privacy.s4.t2": "Google Sign-In eta Apple Sign-In: lehendik dauden kontuekin saioa hastea.",
  "privacy.s4.t3": "Firebase Crashlytics (Android): errore txostenak aplikazioaren egonkortasuna hobetzeko.",
  "privacy.s5.title": "5. Zure eskubideak",
  "privacy.s5.body": "Datuak Babesteko Erregelamendu Orokorraren (DBEO) arabera, zure datu pertsonalak atzitzeko, zuzentzeko, ezabatzeko eta eramateko eskubidea duzu. Eskubide hauetakoren bat gauzatzeko, idatzi iezaguzu soporte@getzampa.com helbidera.",
  "privacy.s6.title": "6. Kontua ezabatzea",
  "privacy.s6.body": "Zure kontuaren ezabaketa eskatu dezakezu aplikaziotik bertatik. Behin eskatuta, zure datuak 30 eguneko grazia aldian gordeko dira, eta ondoren automatikoki eta betirako ezabatuko dira, profil datuak, gogokoak, historiala, jakinarazpenak eta gordetako fitxategiak barne.",
  "privacy.s7.title": "7. Segurtasuna",
  "privacy.s7.body": "Neurri teknikoak aplikatzen ditugu zure datuak babesteko: datu basean sarbide arauak erabiltzaile bakoitzak bere informaziora soilik sarbidea izatea bermatzen dutenak, komunikazio zifratuak eta biltegiratze segurua.",
  "privacy.s8.title": "8. Adingabeak",
  "privacy.s8.body": "Zampa ez dago 16 urtetik beherako adingabeei zuzenduta. Ez ditugu adingabeen datuak nahita biltzen. Adingabe batek kontua sortu duela detektatzen badugu, ezabatuko dugu.",
  "privacy.s9.title": "9. Aldaketak",
  "privacy.s9.body": "Pribatutasun politika hau eguneratu dezakegu. Aldaketa garrantzitsuen kasuan, aplikazioaren bidez jakinaraziko dizugu. Orri hau aldizka kontsultatzea gomendatzen dizugu.",
  "privacy.s10.title": "10. Kontaktua",
  "privacy.s10.body": "Pribatutasunari buruzko edozein kontsultarako, idatzi iezaguzu soporte@getzampa.com helbidera.",
  "terms.title": "Erabilera baldintzak",
  "terms.updated": "Azken eguneratzea: 2026ko apirilaren 12a",
  "terms.s1.title": "1. Xedea",
  "terms.s1.body": "Zampa eguneko eskaintzak eta menuak argitaratzen dituzten jatetxe eta tabernekin bazkaltiarrak lotzen dituen plataforma da. Baldintza hauek aplikazio mugikorraren eta getzampa.com webgunearen erabilera arautzen dute, Sozo Labs-ek kudeatuak.",
  "terms.s2.title": "2. Erregistroa eta kontua",
  "terms.s2.body": "Zamparen funtzionalitate jakin batzuk erabiltzeko kontua sortu behar da. Konpromisoa hartzen duzu datu egiazkoak emateko eta zure kredentzialak konfidentzialtasunez gordetzeko. Zure kontutik egiten den jarduera guztien arduraduna zara.",
  "terms.s3.title": "3. Erabilera onargarria",
  "terms.s3.body": "Konpromisoa hartzen duzu Zampa ez erabiltzeko eduki faltsuak, iraingarriak edo engainagarriak argitaratzeko; spam edo eskatu gabeko publizitatea bidaltzeko; beste erabiltzaile edo merkatarien identitatea ordezkatzeko; edo plataformaren funtzionamenduari kalte egiten dion ekintzarik burutzeko.",
  "terms.s4.title": "4. Merkataritzen edukia",
  "terms.s4.body": "Merkatariak dira argitaratzen dituzten eskaintzen, prezioen, argazkien eta deskribapenen egiazkotasunaren arduradun. Zampak ez du eduki horren zehaztasuna egiaztatzen ez bermatzen.",
  "terms.s5.title": "5. Planak eta harpidetzak",
  "terms.s5.body": "Zampak doako plana eskaintzen du merkatarientzat oinarrizko funtzionalitateekin eta Pro Plana push jakinarazpenekin eta estatistika aurreratuekin. Pro Planaren xehetasunak eta prezioak aplikazioaren barruan jakinarazten dira. Sozo Labs-ek planak eta prezioak aldatzeko eskubidea gordetzen du aldez aurretik jakinarazita.",
  "terms.s6.title": "6. Jabetza intelektuala",
  "terms.s6.body": "Zampa marka, logotipoa eta webgunearen eta aplikazioaren jatorrizko edukia Sozo Labs-en jabetza dira. Ez dago baimenduta elementu hauek kopiatzea, aldatzea edo banatzea aldez aurreko baimenik gabe.",
  "terms.s7.title": "7. Erantzukizunaren mugaketa",
  "terms.s7.body": "Zampak bitartekari gisa jarduten du bazkaltiarren eta jatetxeen artean. Ez gara bien arteko transakzio baten parte. Ez gara arduratzen merkatariek argitaratutako eskaintzen kalitateaz, prezioaz edo eskuragarritasunaz.",
  "terms.s8.title": "8. Etendura eta baliogabetzea",
  "terms.s8.body": "Sozo Labs-ek baldintza hauek betetzen ez dituzten kontuak eteteko edo baliogabetzeko eskubidea gordetzen du, aldez aurretik jakinarazi beharrik gabe. Erabiltzaileak bere kontua edozein unetan ezabatu dezake aplikaziotik.",
  "terms.s9.title": "9. Aplikatu beharreko legeria",
  "terms.s9.body": "Baldintza hauek Espainiako legeriaren arabera arautzen dira. Edozein eztabaida auzitegi eta epaitegi eskudunei aurkeztuko zaie.",
  "terms.s10.title": "10. Kontaktua",
  "terms.s10.body": "Baldintza hauei buruzko edozein kontsultarako, idatzi iezaguzu soporte@getzampa.com helbidera."
```

- [ ] **Step 2: Commit**

```bash
git add i18n/eu.json
git commit -m "i18n: add Basque privacy and terms translations"
```

---

### Task 10: Add i18n keys — Galician (gl.json)

**Files:**
- Modify: `i18n/gl.json`

- [ ] **Step 1: Add privacy and terms keys to `i18n/gl.json`**

Add after `"common.coming_soon"`:

```json
  "privacy.title": "Política de privacidade",
  "privacy.updated": "Última actualización: 12 de abril de 2026",
  "privacy.s1.title": "1. Responsable do tratamento",
  "privacy.s1.body": "Sozo Labs é responsable do tratamento dos datos persoais recollidos a través da aplicación Zampa. Para calquera consulta relacionada coa privacidade, podes escribirnos a soporte@getzampa.com.",
  "privacy.s2.title": "2. Datos que recompilamos",
  "privacy.s2.intro": "Recompilamos os seguintes datos segundo o uso que fagas de Zampa:",
  "privacy.s2.d1": "Datos de conta: email, nome e teléfono (opcional para comercios) ao rexistrarte con email, Apple Sign-In ou Google Sign-In.",
  "privacy.s2.d2": "Ubicación: posición aproximada mentres usas a app para amosarche restaurantes próximos. Só se accede cando a app está en uso.",
  "privacy.s2.d3": "Fotos: imaxes que sobes voluntariamente para o teu perfil ou para publicar ofertas (cámara ou galería).",
  "privacy.s2.d4": "Notificacións push: token de dispositivo (FCM) para enviarche avisos sobre novas ofertas de restaurantes que segues.",
  "privacy.s2.d5": "Métricas de uso: impresións e clics en ofertas, usados para estatísticas de comercios. Non utilizamos servizos de analítica de terceiros.",
  "privacy.s2.d6": "Datos de negocio (comercios): enderezo, horarios, tipo de cociña e foto de portada do teu establecemento.",
  "privacy.s3.title": "3. Base legal",
  "privacy.s3.body": "Tratamos os teus datos con base no teu consentimento ao crear unha conta e na execución do servizo que proporcionamos. Podes retirar o teu consentimento en calquera momento eliminando a túa conta.",
  "privacy.s4.title": "4. Servizos de terceiros",
  "privacy.s4.intro": "Zampa utiliza os seguintes servizos de terceiros para o seu funcionamento:",
  "privacy.s4.t1": "Firebase (Google): autenticación, base de datos, almacenamento de ficheiros e mensaxería push.",
  "privacy.s4.t2": "Google Sign-In e Apple Sign-In: inicio de sesión con contas existentes.",
  "privacy.s4.t3": "Firebase Crashlytics (Android): informes de erros para mellorar a estabilidade da app.",
  "privacy.s5.title": "5. Os teus dereitos",
  "privacy.s5.body": "De acordo co Regulamento Xeral de Protección de Datos (RXPD), tes dereito a acceder, rectificar, suprimir e portar os teus datos persoais. Para exercer calquera destes dereitos, escríbenos a soporte@getzampa.com.",
  "privacy.s6.title": "6. Eliminación de conta",
  "privacy.s6.body": "Podes solicitar a eliminación da túa conta dende a propia app. Unha vez solicitada, os teus datos conservaranse durante un período de graza de 30 días, tras o cal eliminaranse de forma automática e permanente, incluíndo datos de perfil, favoritos, historial, notificacións e ficheiros almacenados.",
  "privacy.s7.title": "7. Seguridade",
  "privacy.s7.body": "Aplicamos medidas técnicas para protexer os teus datos: regras de acceso en base de datos que garanten que cada usuario só poida acceder á súa propia información, comunicacións cifradas e almacenamento seguro.",
  "privacy.s8.title": "8. Menores",
  "privacy.s8.body": "Zampa non está dirixida a menores de 16 anos. Non recompilamos datos de menores de forma intencionada. Se detectamos que un menor creou unha conta, eliminarémola.",
  "privacy.s9.title": "9. Modificacións",
  "privacy.s9.body": "Podemos actualizar esta política de privacidade. En caso de cambios relevantes, notificarémolo a través da app. Recomendámosche consultar esta páxina periodicamente.",
  "privacy.s10.title": "10. Contacto",
  "privacy.s10.body": "Para calquera consulta sobre privacidade, escríbenos a soporte@getzampa.com.",
  "terms.title": "Termos de uso",
  "terms.updated": "Última actualización: 12 de abril de 2026",
  "terms.s1.title": "1. Obxecto",
  "terms.s1.body": "Zampa é unha plataforma que conecta comensais con restaurantes e bares que publican as súas ofertas e menús do día. Estes termos regulan o uso da aplicación móbil e o sitio web getzampa.com, operados por Sozo Labs.",
  "terms.s2.title": "2. Rexistro e conta",
  "terms.s2.body": "Para usar certas funcionalidades de Zampa é necesario crear unha conta. Comprométeste a proporcionar datos verídicos e a manter a confidencialidade das túas credenciais. Es responsable de toda a actividade que se realice dende a túa conta.",
  "terms.s3.title": "3. Uso aceptable",
  "terms.s3.body": "Comprométeste a non utilizar Zampa para publicar contido falso, ofensivo ou enganoso; enviar spam ou publicidade non solicitada; suplantar a identidade doutros usuarios ou comercios; nin realizar calquera acción que prexudique o funcionamento da plataforma.",
  "terms.s4.title": "4. Contido de comercios",
  "terms.s4.body": "Os comercios son responsables da veracidade das ofertas, prezos, fotos e descricións que publican. Zampa non verifica nin garante a exactitude de dito contido.",
  "terms.s5.title": "5. Plans e subscricións",
  "terms.s5.body": "Zampa ofrece un plan gratuíto con funcionalidades básicas para comercios e un Plan Pro con notificacións push e estatísticas avanzadas. Os detalles e prezos do Plan Pro comunícanse dentro da app. Sozo Labs resérvase o dereito de modificar os plans e prezos con previo aviso.",
  "terms.s6.title": "6. Propiedade intelectual",
  "terms.s6.body": "A marca Zampa, o logotipo e o contido orixinal do sitio web e a app son propiedade de Sozo Labs. Non está permitido copiar, modificar nin distribuír estes elementos sen autorización previa.",
  "terms.s7.title": "7. Limitación de responsabilidade",
  "terms.s7.body": "Zampa actúa como intermediario entre comensais e restaurantes. Non somos parte en ningunha transacción entre ambos. Non nos facemos responsables da calidade, prezo ou dispoñibilidade das ofertas publicadas polos comercios.",
  "terms.s8.title": "8. Suspensión e cancelación",
  "terms.s8.body": "Sozo Labs resérvase o dereito de suspender ou cancelar contas que incumplan estes termos, sen necesidade de previo aviso. O usuario pode eliminar a súa conta en calquera momento dende a app.",
  "terms.s9.title": "9. Lexislación aplicable",
  "terms.s9.body": "Estes termos réxense pola lexislación española. Calquera disputa someterase aos xulgados e tribunais competentes.",
  "terms.s10.title": "10. Contacto",
  "terms.s10.body": "Para calquera consulta sobre estes termos, escríbenos a soporte@getzampa.com."
```

- [ ] **Step 2: Commit**

```bash
git add i18n/gl.json
git commit -m "i18n: add Galician privacy and terms translations"
```

---

### Task 11: Add i18n keys — Portuguese (pt.json)

**Files:**
- Modify: `i18n/pt.json`

- [ ] **Step 1: Add privacy and terms keys to `i18n/pt.json`**

Add after `"common.coming_soon"`:

```json
  "privacy.title": "Política de privacidade",
  "privacy.updated": "Última atualização: 12 de abril de 2026",
  "privacy.s1.title": "1. Responsável pelo tratamento",
  "privacy.s1.body": "A Sozo Labs é responsável pelo tratamento dos dados pessoais recolhidos através da aplicação Zampa. Para qualquer questão relacionada com a privacidade, pode contactar-nos em soporte@getzampa.com.",
  "privacy.s2.title": "2. Dados que recolhemos",
  "privacy.s2.intro": "Recolhemos os seguintes dados conforme a utilização que faz do Zampa:",
  "privacy.s2.d1": "Dados de conta: email, nome e telefone (opcional para comerciantes) ao registar-se com email, Apple Sign-In ou Google Sign-In.",
  "privacy.s2.d2": "Localização: posição aproximada enquanto usa a app para mostrar restaurantes próximos. Apenas acedida quando a app está em uso.",
  "privacy.s2.d3": "Fotos: imagens que carrega voluntariamente para o seu perfil ou para publicar ofertas (câmara ou galeria).",
  "privacy.s2.d4": "Notificações push: token de dispositivo (FCM) para enviar avisos sobre novas ofertas de restaurantes que segue.",
  "privacy.s2.d5": "Métricas de utilização: impressões e cliques em ofertas, usados para estatísticas de comerciantes. Não utilizamos serviços de análise de terceiros.",
  "privacy.s2.d6": "Dados de negócio (comerciantes): morada, horários, tipo de cozinha e foto de capa do seu estabelecimento.",
  "privacy.s3.title": "3. Base legal",
  "privacy.s3.body": "Tratamos os seus dados com base no seu consentimento ao criar uma conta e na execução do serviço que fornecemos. Pode retirar o seu consentimento a qualquer momento eliminando a sua conta.",
  "privacy.s4.title": "4. Serviços de terceiros",
  "privacy.s4.intro": "O Zampa utiliza os seguintes serviços de terceiros para o seu funcionamento:",
  "privacy.s4.t1": "Firebase (Google): autenticação, base de dados, armazenamento de ficheiros e mensagens push.",
  "privacy.s4.t2": "Google Sign-In e Apple Sign-In: início de sessão com contas existentes.",
  "privacy.s4.t3": "Firebase Crashlytics (Android): relatórios de erros para melhorar a estabilidade da app.",
  "privacy.s5.title": "5. Os seus direitos",
  "privacy.s5.body": "De acordo com o Regulamento Geral de Proteção de Dados (RGPD), tem o direito de aceder, retificar, apagar e portar os seus dados pessoais. Para exercer qualquer destes direitos, contacte-nos em soporte@getzampa.com.",
  "privacy.s6.title": "6. Eliminação de conta",
  "privacy.s6.body": "Pode solicitar a eliminação da sua conta a partir da própria app. Uma vez solicitada, os seus dados serão conservados durante um período de 30 dias, após o qual serão eliminados de forma automática e permanente, incluindo dados de perfil, favoritos, histórico, notificações e ficheiros armazenados.",
  "privacy.s7.title": "7. Segurança",
  "privacy.s7.body": "Aplicamos medidas técnicas para proteger os seus dados: regras de acesso na base de dados que garantem que cada utilizador só pode aceder à sua própria informação, comunicações encriptadas e armazenamento seguro.",
  "privacy.s8.title": "8. Menores",
  "privacy.s8.body": "O Zampa não se destina a menores de 16 anos. Não recolhemos dados de menores intencionalmente. Se detetarmos que um menor criou uma conta, eliminaremos a mesma.",
  "privacy.s9.title": "9. Alterações",
  "privacy.s9.body": "Podemos atualizar esta política de privacidade. Em caso de alterações relevantes, notificaremos através da app. Recomendamos consultar esta página periodicamente.",
  "privacy.s10.title": "10. Contacto",
  "privacy.s10.body": "Para qualquer questão sobre privacidade, contacte-nos em soporte@getzampa.com.",
  "terms.title": "Termos de utilização",
  "terms.updated": "Última atualização: 12 de abril de 2026",
  "terms.s1.title": "1. Objeto",
  "terms.s1.body": "O Zampa é uma plataforma que liga clientes a restaurantes e bares que publicam as suas ofertas e menus do dia. Estes termos regulam a utilização da aplicação móvel e do site getzampa.com, operados pela Sozo Labs.",
  "terms.s2.title": "2. Registo e conta",
  "terms.s2.body": "Para utilizar certas funcionalidades do Zampa é necessário criar uma conta. Compromete-se a fornecer dados verídicos e a manter a confidencialidade das suas credenciais. É responsável por toda a atividade realizada a partir da sua conta.",
  "terms.s3.title": "3. Utilização aceitável",
  "terms.s3.body": "Compromete-se a não utilizar o Zampa para publicar conteúdo falso, ofensivo ou enganoso; enviar spam ou publicidade não solicitada; fazer-se passar por outros utilizadores ou comerciantes; nem realizar qualquer ação que prejudique o funcionamento da plataforma.",
  "terms.s4.title": "4. Conteúdo de comerciantes",
  "terms.s4.body": "Os comerciantes são responsáveis pela veracidade das ofertas, preços, fotos e descrições que publicam. O Zampa não verifica nem garante a exatidão desse conteúdo.",
  "terms.s5.title": "5. Planos e subscrições",
  "terms.s5.body": "O Zampa oferece um plano gratuito com funcionalidades básicas para comerciantes e um Plano Pro com notificações push e estatísticas avançadas. Os detalhes e preços do Plano Pro são comunicados dentro da app. A Sozo Labs reserva-se o direito de modificar os planos e preços com aviso prévio.",
  "terms.s6.title": "6. Propriedade intelectual",
  "terms.s6.body": "A marca Zampa, o logótipo e o conteúdo original do site e da app são propriedade da Sozo Labs. Não é permitido copiar, modificar ou distribuir estes elementos sem autorização prévia.",
  "terms.s7.title": "7. Limitação de responsabilidade",
  "terms.s7.body": "O Zampa atua como intermediário entre clientes e restaurantes. Não somos parte em nenhuma transação entre ambos. Não nos responsabilizamos pela qualidade, preço ou disponibilidade das ofertas publicadas pelos comerciantes.",
  "terms.s8.title": "8. Suspensão e cancelamento",
  "terms.s8.body": "A Sozo Labs reserva-se o direito de suspender ou cancelar contas que incumpram estes termos, sem necessidade de aviso prévio. O utilizador pode eliminar a sua conta a qualquer momento a partir da app.",
  "terms.s9.title": "9. Legislação aplicável",
  "terms.s9.body": "Estes termos são regidos pela legislação espanhola. Qualquer litígio será submetido aos tribunais competentes.",
  "terms.s10.title": "10. Contacto",
  "terms.s10.body": "Para qualquer questão sobre estes termos, contacte-nos em soporte@getzampa.com."
```

- [ ] **Step 2: Commit**

```bash
git add i18n/pt.json
git commit -m "i18n: add Portuguese privacy and terms translations"
```

---

### Task 12: Add i18n keys — German (de.json)

**Files:**
- Modify: `i18n/de.json`

- [ ] **Step 1: Add privacy and terms keys to `i18n/de.json`**

Add after `"common.coming_soon"`:

```json
  "privacy.title": "Datenschutzerklärung",
  "privacy.updated": "Letzte Aktualisierung: 12. April 2026",
  "privacy.s1.title": "1. Verantwortlicher",
  "privacy.s1.body": "Sozo Labs ist für die Verarbeitung der über die Zampa-App erhobenen personenbezogenen Daten verantwortlich. Bei Fragen zum Datenschutz kannst du uns unter soporte@getzampa.com kontaktieren.",
  "privacy.s2.title": "2. Daten, die wir erheben",
  "privacy.s2.intro": "Wir erheben folgende Daten je nach Nutzung von Zampa:",
  "privacy.s2.d1": "Kontodaten: E-Mail, Name und Telefonnummer (optional für Händler) bei der Registrierung mit E-Mail, Apple Sign-In oder Google Sign-In.",
  "privacy.s2.d2": "Standort: ungefähre Position während der App-Nutzung, um Restaurants in der Nähe anzuzeigen. Nur bei aktiver Nutzung der App.",
  "privacy.s2.d3": "Fotos: Bilder, die du freiwillig für dein Profil oder zum Veröffentlichen von Angeboten hochlädst (Kamera oder Galerie).",
  "privacy.s2.d4": "Push-Benachrichtigungen: Geräte-Token (FCM) zum Senden von Benachrichtigungen über neue Angebote von Restaurants, denen du folgst.",
  "privacy.s2.d5": "Nutzungsmetriken: Impressionen und Klicks auf Angebote, die für Händlerstatistiken verwendet werden. Wir verwenden keine Analysedienste von Drittanbietern.",
  "privacy.s2.d6": "Geschäftsdaten (Händler): Adresse, Öffnungszeiten, Küchentyp und Titelbild deines Betriebs.",
  "privacy.s3.title": "3. Rechtsgrundlage",
  "privacy.s3.body": "Wir verarbeiten deine Daten auf Grundlage deiner Einwilligung bei der Kontoerstellung und der Durchführung des von uns angebotenen Dienstes. Du kannst deine Einwilligung jederzeit durch Löschung deines Kontos widerrufen.",
  "privacy.s4.title": "4. Drittanbieter-Dienste",
  "privacy.s4.intro": "Zampa nutzt folgende Drittanbieter-Dienste:",
  "privacy.s4.t1": "Firebase (Google): Authentifizierung, Datenbank, Dateispeicherung und Push-Nachrichten.",
  "privacy.s4.t2": "Google Sign-In und Apple Sign-In: Anmeldung mit bestehenden Konten.",
  "privacy.s4.t3": "Firebase Crashlytics (Android): Absturzberichte zur Verbesserung der App-Stabilität.",
  "privacy.s5.title": "5. Deine Rechte",
  "privacy.s5.body": "Gemäß der Datenschutz-Grundverordnung (DSGVO) hast du das Recht auf Auskunft, Berichtigung, Löschung und Übertragbarkeit deiner personenbezogenen Daten. Um eines dieser Rechte auszuüben, kontaktiere uns unter soporte@getzampa.com.",
  "privacy.s6.title": "6. Kontolöschung",
  "privacy.s6.body": "Du kannst die Löschung deines Kontos direkt in der App beantragen. Nach der Anfrage werden deine Daten 30 Tage aufbewahrt und anschließend automatisch und dauerhaft gelöscht, einschließlich Profildaten, Favoriten, Verlauf, Benachrichtigungen und gespeicherter Dateien.",
  "privacy.s7.title": "7. Sicherheit",
  "privacy.s7.body": "Wir setzen technische Maßnahmen zum Schutz deiner Daten ein: Datenbankzugriffsregeln, die sicherstellen, dass jeder Nutzer nur auf seine eigenen Informationen zugreifen kann, verschlüsselte Kommunikation und sichere Speicherung.",
  "privacy.s8.title": "8. Minderjährige",
  "privacy.s8.body": "Zampa richtet sich nicht an Minderjährige unter 16 Jahren. Wir erheben nicht wissentlich Daten von Minderjährigen. Wenn wir feststellen, dass ein Minderjähriger ein Konto erstellt hat, werden wir es löschen.",
  "privacy.s9.title": "9. Änderungen",
  "privacy.s9.body": "Wir können diese Datenschutzerklärung aktualisieren. Bei wesentlichen Änderungen werden wir dich über die App benachrichtigen. Wir empfehlen, diese Seite regelmäßig zu überprüfen.",
  "privacy.s10.title": "10. Kontakt",
  "privacy.s10.body": "Bei Fragen zum Datenschutz kontaktiere uns unter soporte@getzampa.com.",
  "terms.title": "Nutzungsbedingungen",
  "terms.updated": "Letzte Aktualisierung: 12. April 2026",
  "terms.s1.title": "1. Gegenstand",
  "terms.s1.body": "Zampa ist eine Plattform, die Gäste mit Restaurants und Bars verbindet, die ihre Tagesangebote und Menüs veröffentlichen. Diese Bedingungen regeln die Nutzung der mobilen App und der Website getzampa.com, betrieben von Sozo Labs.",
  "terms.s2.title": "2. Registrierung und Konto",
  "terms.s2.body": "Zur Nutzung bestimmter Funktionen von Zampa ist ein Konto erforderlich. Du verpflichtest dich, wahrheitsgemäße Angaben zu machen und deine Zugangsdaten vertraulich zu behandeln. Du bist für alle Aktivitäten unter deinem Konto verantwortlich.",
  "terms.s3.title": "3. Akzeptable Nutzung",
  "terms.s3.body": "Du verpflichtest dich, Zampa nicht zu nutzen, um falsche, beleidigende oder irreführende Inhalte zu veröffentlichen; Spam oder unaufgeforderte Werbung zu versenden; die Identität anderer Nutzer oder Händler vorzutäuschen; oder Handlungen vorzunehmen, die den Betrieb der Plattform beeinträchtigen.",
  "terms.s4.title": "4. Händlerinhalte",
  "terms.s4.body": "Händler sind für die Richtigkeit der von ihnen veröffentlichten Angebote, Preise, Fotos und Beschreibungen verantwortlich. Zampa überprüft oder garantiert die Genauigkeit dieser Inhalte nicht.",
  "terms.s5.title": "5. Pläne und Abonnements",
  "terms.s5.body": "Zampa bietet einen kostenlosen Plan mit Grundfunktionen für Händler und einen Pro-Plan mit Push-Benachrichtigungen und erweiterten Statistiken. Details und Preise des Pro-Plans werden in der App mitgeteilt. Sozo Labs behält sich das Recht vor, Pläne und Preise mit vorheriger Ankündigung zu ändern.",
  "terms.s6.title": "6. Geistiges Eigentum",
  "terms.s6.body": "Die Marke Zampa, das Logo und die Originalinhalte der Website und App sind Eigentum von Sozo Labs. Das Kopieren, Ändern oder Verbreiten dieser Elemente ohne vorherige Genehmigung ist nicht gestattet.",
  "terms.s7.title": "7. Haftungsbeschränkung",
  "terms.s7.body": "Zampa fungiert als Vermittler zwischen Gästen und Restaurants. Wir sind nicht Partei einer Transaktion zwischen beiden. Wir haften nicht für die Qualität, den Preis oder die Verfügbarkeit der von Händlern veröffentlichten Angebote.",
  "terms.s8.title": "8. Sperrung und Kündigung",
  "terms.s8.body": "Sozo Labs behält sich das Recht vor, Konten, die gegen diese Bedingungen verstoßen, ohne vorherige Ankündigung zu sperren oder zu kündigen. Nutzer können ihr Konto jederzeit über die App löschen.",
  "terms.s9.title": "9. Anwendbares Recht",
  "terms.s9.body": "Diese Bedingungen unterliegen spanischem Recht. Streitigkeiten werden den zuständigen Gerichten vorgelegt.",
  "terms.s10.title": "10. Kontakt",
  "terms.s10.body": "Bei Fragen zu diesen Bedingungen kontaktiere uns unter soporte@getzampa.com."
```

- [ ] **Step 2: Commit**

```bash
git add i18n/de.json
git commit -m "i18n: add German privacy and terms translations"
```

---

### Task 13: Add i18n keys — French (fr.json)

**Files:**
- Modify: `i18n/fr.json`

- [ ] **Step 1: Add privacy and terms keys to `i18n/fr.json`**

Add after `"common.coming_soon"`:

```json
  "privacy.title": "Politique de confidentialité",
  "privacy.updated": "Dernière mise à jour : 12 avril 2026",
  "privacy.s1.title": "1. Responsable du traitement",
  "privacy.s1.body": "Sozo Labs est responsable du traitement des données personnelles collectées via l'application Zampa. Pour toute question relative à la confidentialité, vous pouvez nous écrire à soporte@getzampa.com.",
  "privacy.s2.title": "2. Données que nous collectons",
  "privacy.s2.intro": "Nous collectons les données suivantes selon votre utilisation de Zampa :",
  "privacy.s2.d1": "Données de compte : email, nom et numéro de téléphone (optionnel pour les commerçants) lors de l'inscription par email, Apple Sign-In ou Google Sign-In.",
  "privacy.s2.d2": "Localisation : position approximative pendant l'utilisation de l'app pour afficher les restaurants à proximité. Accessible uniquement lorsque l'app est en cours d'utilisation.",
  "privacy.s2.d3": "Photos : images que vous téléchargez volontairement pour votre profil ou pour publier des offres (appareil photo ou galerie).",
  "privacy.s2.d4": "Notifications push : jeton d'appareil (FCM) pour vous envoyer des alertes sur les nouvelles offres des restaurants que vous suivez.",
  "privacy.s2.d5": "Métriques d'utilisation : impressions et clics sur les offres, utilisés pour les statistiques des commerçants. Nous n'utilisons pas de services d'analyse tiers.",
  "privacy.s2.d6": "Données commerciales (commerçants) : adresse, horaires, type de cuisine et photo de couverture de votre établissement.",
  "privacy.s3.title": "3. Base juridique",
  "privacy.s3.body": "Nous traitons vos données sur la base de votre consentement lors de la création d'un compte et de l'exécution du service que nous fournissons. Vous pouvez retirer votre consentement à tout moment en supprimant votre compte.",
  "privacy.s4.title": "4. Services tiers",
  "privacy.s4.intro": "Zampa utilise les services tiers suivants pour son fonctionnement :",
  "privacy.s4.t1": "Firebase (Google) : authentification, base de données, stockage de fichiers et messagerie push.",
  "privacy.s4.t2": "Google Sign-In et Apple Sign-In : connexion avec des comptes existants.",
  "privacy.s4.t3": "Firebase Crashlytics (Android) : rapports d'erreurs pour améliorer la stabilité de l'app.",
  "privacy.s5.title": "5. Vos droits",
  "privacy.s5.body": "Conformément au Règlement Général sur la Protection des Données (RGPD), vous avez le droit d'accéder, de rectifier, de supprimer et de porter vos données personnelles. Pour exercer l'un de ces droits, écrivez-nous à soporte@getzampa.com.",
  "privacy.s6.title": "6. Suppression de compte",
  "privacy.s6.body": "Vous pouvez demander la suppression de votre compte depuis l'app. Une fois demandée, vos données seront conservées pendant une période de grâce de 30 jours, après quoi elles seront supprimées automatiquement et définitivement, y compris les données de profil, favoris, historique, notifications et fichiers stockés.",
  "privacy.s7.title": "7. Sécurité",
  "privacy.s7.body": "Nous appliquons des mesures techniques pour protéger vos données : des règles d'accès en base de données garantissant que chaque utilisateur ne peut accéder qu'à ses propres informations, des communications chiffrées et un stockage sécurisé.",
  "privacy.s8.title": "8. Mineurs",
  "privacy.s8.body": "Zampa ne s'adresse pas aux mineurs de moins de 16 ans. Nous ne collectons pas intentionnellement de données de mineurs. Si nous détectons qu'un mineur a créé un compte, nous le supprimerons.",
  "privacy.s9.title": "9. Modifications",
  "privacy.s9.body": "Nous pouvons mettre à jour cette politique de confidentialité. En cas de modifications importantes, nous vous en informerons via l'app. Nous vous recommandons de consulter cette page régulièrement.",
  "privacy.s10.title": "10. Contact",
  "privacy.s10.body": "Pour toute question relative à la confidentialité, écrivez-nous à soporte@getzampa.com.",
  "terms.title": "Conditions d'utilisation",
  "terms.updated": "Dernière mise à jour : 12 avril 2026",
  "terms.s1.title": "1. Objet",
  "terms.s1.body": "Zampa est une plateforme qui met en relation les convives avec les restaurants et bars qui publient leurs offres et menus du jour. Ces conditions régissent l'utilisation de l'application mobile et du site web getzampa.com, exploités par Sozo Labs.",
  "terms.s2.title": "2. Inscription et compte",
  "terms.s2.body": "Pour utiliser certaines fonctionnalités de Zampa, il est nécessaire de créer un compte. Vous vous engagez à fournir des informations véridiques et à maintenir la confidentialité de vos identifiants. Vous êtes responsable de toute activité effectuée depuis votre compte.",
  "terms.s3.title": "3. Utilisation acceptable",
  "terms.s3.body": "Vous vous engagez à ne pas utiliser Zampa pour publier du contenu faux, offensant ou trompeur ; envoyer du spam ou de la publicité non sollicitée ; usurper l'identité d'autres utilisateurs ou commerçants ; ni effectuer toute action nuisant au fonctionnement de la plateforme.",
  "terms.s4.title": "4. Contenu des commerçants",
  "terms.s4.body": "Les commerçants sont responsables de la véracité des offres, prix, photos et descriptions qu'ils publient. Zampa ne vérifie ni ne garantit l'exactitude de ce contenu.",
  "terms.s5.title": "5. Plans et abonnements",
  "terms.s5.body": "Zampa propose un plan gratuit avec des fonctionnalités de base pour les commerçants et un Plan Pro avec notifications push et statistiques avancées. Les détails et tarifs du Plan Pro sont communiqués dans l'app. Sozo Labs se réserve le droit de modifier les plans et tarifs avec préavis.",
  "terms.s6.title": "6. Propriété intellectuelle",
  "terms.s6.body": "La marque Zampa, le logo et le contenu original du site web et de l'app sont la propriété de Sozo Labs. Il est interdit de copier, modifier ou distribuer ces éléments sans autorisation préalable.",
  "terms.s7.title": "7. Limitation de responsabilité",
  "terms.s7.body": "Zampa agit en tant qu'intermédiaire entre les convives et les restaurants. Nous ne sommes partie à aucune transaction entre les deux. Nous ne sommes pas responsables de la qualité, du prix ou de la disponibilité des offres publiées par les commerçants.",
  "terms.s8.title": "8. Suspension et résiliation",
  "terms.s8.body": "Sozo Labs se réserve le droit de suspendre ou de résilier les comptes ne respectant pas ces conditions, sans préavis. L'utilisateur peut supprimer son compte à tout moment depuis l'app.",
  "terms.s9.title": "9. Droit applicable",
  "terms.s9.body": "Ces conditions sont régies par le droit espagnol. Tout litige sera soumis aux tribunaux compétents.",
  "terms.s10.title": "10. Contact",
  "terms.s10.body": "Pour toute question concernant ces conditions, écrivez-nous à soporte@getzampa.com."
```

- [ ] **Step 2: Commit**

```bash
git add i18n/fr.json
git commit -m "i18n: add French privacy and terms translations"
```

---

### Task 14: Add i18n keys — Italian (it.json)

**Files:**
- Modify: `i18n/it.json`

- [ ] **Step 1: Add privacy and terms keys to `i18n/it.json`**

Add after `"common.coming_soon"`:

```json
  "privacy.title": "Informativa sulla privacy",
  "privacy.updated": "Ultimo aggiornamento: 12 aprile 2026",
  "privacy.s1.title": "1. Titolare del trattamento",
  "privacy.s1.body": "Sozo Labs è il titolare del trattamento dei dati personali raccolti tramite l'applicazione Zampa. Per qualsiasi domanda relativa alla privacy, puoi scriverci a soporte@getzampa.com.",
  "privacy.s2.title": "2. Dati che raccogliamo",
  "privacy.s2.intro": "Raccogliamo i seguenti dati in base all'uso che fai di Zampa:",
  "privacy.s2.d1": "Dati dell'account: email, nome e numero di telefono (facoltativo per i commercianti) al momento della registrazione con email, Apple Sign-In o Google Sign-In.",
  "privacy.s2.d2": "Posizione: posizione approssimativa durante l'uso dell'app per mostrarti ristoranti vicini. Accessibile solo quando l'app è in uso.",
  "privacy.s2.d3": "Foto: immagini che carichi volontariamente per il tuo profilo o per pubblicare offerte (fotocamera o galleria).",
  "privacy.s2.d4": "Notifiche push: token del dispositivo (FCM) per inviarti avvisi sulle nuove offerte dei ristoranti che segui.",
  "privacy.s2.d5": "Metriche di utilizzo: impressioni e clic sulle offerte, utilizzati per le statistiche dei commercianti. Non utilizziamo servizi di analisi di terze parti.",
  "privacy.s2.d6": "Dati aziendali (commercianti): indirizzo, orari, tipo di cucina e foto di copertina del tuo locale.",
  "privacy.s3.title": "3. Base giuridica",
  "privacy.s3.body": "Trattiamo i tuoi dati sulla base del tuo consenso al momento della creazione dell'account e dell'esecuzione del servizio che forniamo. Puoi revocare il consenso in qualsiasi momento eliminando il tuo account.",
  "privacy.s4.title": "4. Servizi di terze parti",
  "privacy.s4.intro": "Zampa utilizza i seguenti servizi di terze parti per il suo funzionamento:",
  "privacy.s4.t1": "Firebase (Google): autenticazione, database, archiviazione file e messaggistica push.",
  "privacy.s4.t2": "Google Sign-In e Apple Sign-In: accesso con account esistenti.",
  "privacy.s4.t3": "Firebase Crashlytics (Android): report di errori per migliorare la stabilità dell'app.",
  "privacy.s5.title": "5. I tuoi diritti",
  "privacy.s5.body": "In conformità con il Regolamento Generale sulla Protezione dei Dati (GDPR), hai il diritto di accedere, rettificare, cancellare e trasferire i tuoi dati personali. Per esercitare uno di questi diritti, scrivici a soporte@getzampa.com.",
  "privacy.s6.title": "6. Eliminazione dell'account",
  "privacy.s6.body": "Puoi richiedere l'eliminazione del tuo account direttamente dall'app. Una volta richiesta, i tuoi dati saranno conservati per un periodo di 30 giorni, dopo il quale saranno eliminati automaticamente e permanentemente, inclusi dati del profilo, preferiti, cronologia, notifiche e file archiviati.",
  "privacy.s7.title": "7. Sicurezza",
  "privacy.s7.body": "Applichiamo misure tecniche per proteggere i tuoi dati: regole di accesso al database che garantiscono che ogni utente possa accedere solo alle proprie informazioni, comunicazioni crittografate e archiviazione sicura.",
  "privacy.s8.title": "8. Minori",
  "privacy.s8.body": "Zampa non è destinata ai minori di 16 anni. Non raccogliamo intenzionalmente dati di minori. Se rileviamo che un minore ha creato un account, lo elimineremo.",
  "privacy.s9.title": "9. Modifiche",
  "privacy.s9.body": "Potremmo aggiornare questa informativa sulla privacy. In caso di modifiche significative, ti avviseremo tramite l'app. Ti consigliamo di consultare questa pagina periodicamente.",
  "privacy.s10.title": "10. Contatto",
  "privacy.s10.body": "Per qualsiasi domanda sulla privacy, scrivici a soporte@getzampa.com.",
  "terms.title": "Termini di utilizzo",
  "terms.updated": "Ultimo aggiornamento: 12 aprile 2026",
  "terms.s1.title": "1. Oggetto",
  "terms.s1.body": "Zampa è una piattaforma che mette in contatto i clienti con ristoranti e bar che pubblicano le loro offerte e menù del giorno. Questi termini regolano l'uso dell'applicazione mobile e del sito web getzampa.com, gestiti da Sozo Labs.",
  "terms.s2.title": "2. Registrazione e account",
  "terms.s2.body": "Per utilizzare alcune funzionalità di Zampa è necessario creare un account. Ti impegni a fornire dati veritieri e a mantenere la riservatezza delle tue credenziali. Sei responsabile di tutta l'attività svolta dal tuo account.",
  "terms.s3.title": "3. Uso accettabile",
  "terms.s3.body": "Ti impegni a non utilizzare Zampa per pubblicare contenuti falsi, offensivi o ingannevoli; inviare spam o pubblicità non richiesta; impersonare altri utenti o commercianti; né compiere azioni che danneggino il funzionamento della piattaforma.",
  "terms.s4.title": "4. Contenuti dei commercianti",
  "terms.s4.body": "I commercianti sono responsabili della veridicità delle offerte, dei prezzi, delle foto e delle descrizioni che pubblicano. Zampa non verifica né garantisce l'accuratezza di tali contenuti.",
  "terms.s5.title": "5. Piani e abbonamenti",
  "terms.s5.body": "Zampa offre un piano gratuito con funzionalità di base per i commercianti e un Piano Pro con notifiche push e statistiche avanzate. I dettagli e i prezzi del Piano Pro sono comunicati all'interno dell'app. Sozo Labs si riserva il diritto di modificare piani e prezzi con preavviso.",
  "terms.s6.title": "6. Proprietà intellettuale",
  "terms.s6.body": "Il marchio Zampa, il logo e i contenuti originali del sito web e dell'app sono di proprietà di Sozo Labs. Non è consentito copiare, modificare o distribuire questi elementi senza previa autorizzazione.",
  "terms.s7.title": "7. Limitazione di responsabilità",
  "terms.s7.body": "Zampa agisce come intermediario tra clienti e ristoranti. Non siamo parte di nessuna transazione tra i due. Non siamo responsabili della qualità, del prezzo o della disponibilità delle offerte pubblicate dai commercianti.",
  "terms.s8.title": "8. Sospensione e cancellazione",
  "terms.s8.body": "Sozo Labs si riserva il diritto di sospendere o cancellare gli account che violano questi termini, senza preavviso. L'utente può eliminare il proprio account in qualsiasi momento dall'app.",
  "terms.s9.title": "9. Legge applicabile",
  "terms.s9.body": "Questi termini sono regolati dalla legge spagnola. Qualsiasi controversia sarà sottoposta ai tribunali competenti.",
  "terms.s10.title": "10. Contatto",
  "terms.s10.body": "Per qualsiasi domanda su questi termini, scrivici a soporte@getzampa.com."
```

- [ ] **Step 2: Commit**

```bash
git add i18n/it.json
git commit -m "i18n: add Italian privacy and terms translations"
```

---

### Task 15: Final verification

- [ ] **Step 1: Open privacy.html and terms.html in browser**

```bash
open privacy.html
open terms.html
```

Verify:
- Header matches index.html (logo, nav, language selector)
- Legal content renders with correct styles
- Footer matches index.html
- Language switching works (try switching to EN, CA, DE)
- Nav links (Clientes, Comercios, FAQ) navigate back to index.html sections
- Footer privacy/terms links work across all three pages
- Mobile responsive layout (resize browser or use devtools)

- [ ] **Step 2: Verify index.html footer links**

Open `index.html` and click the privacy and terms links in the footer. They should navigate to the new pages.

- [ ] **Step 3: Final commit with all remaining changes**

If any files were missed:

```bash
git add -A
git commit -m "feat: add privacy policy and terms of use pages for App Store Connect"
```
