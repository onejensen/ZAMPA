# Download Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `download.html` — a minimal centered page at `getzampa.com/download` with iOS and Android download buttons (marked "próximamente"), optimized for QR code scanning on mobile.

**Architecture:** Static HTML page following the same pattern as `delete-account.html`. Reuses `styles.css` classes (`.store-btn`, `.store-wrap`, `.coming-soon-sign`). Adds a small `.download-page` layout class for full-viewport centering. i18n handled by `main.js` exactly as all other pages.

**Tech Stack:** HTML, CSS (existing `styles.css`), vanilla JS (`main.js`), JSON i18n files.

---

## Files

| Action | File | What |
|--------|------|------|
| Create | `download.html` | The new download page |
| Modify | `styles.css` | Add `.download-page` centering styles |
| Modify | `i18n/es.json` | Add `download.tagline`, `footer.download` keys |
| Modify | `i18n/en.json` | Same keys in English |
| Modify | `i18n/ca.json` | Same keys (defaults to ES/EN text) |
| Modify | `i18n/eu.json` | Same keys |
| Modify | `i18n/gl.json` | Same keys |
| Modify | `i18n/pt.json` | Same keys |
| Modify | `i18n/de.json` | Same keys |
| Modify | `i18n/fr.json` | Same keys |
| Modify | `i18n/it.json` | Same keys |
| Modify | `index.html` | Add `footer.download` link in footer nav |
| Modify | `privacy.html` | Same footer nav link |
| Modify | `terms.html` | Same footer nav link |
| Modify | `delete-account.html` | Same footer nav link |

---

### Task 1: Add CSS layout for download page

**Files:**
- Modify: `styles.css` (add after the existing `.legal` section styles, around line 1200)

- [ ] **Step 1: Add `.download-page` styles to `styles.css`**

Find the comment `/* ===== Footer =====` in `styles.css` and insert the following block immediately before it:

```css
/* ===== Download Page ===== */
.download-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  background: var(--white);
}

.download-page__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  text-decoration: none;
  color: var(--text);
}

.download-page__logo img {
  width: 52px;
  height: 52px;
}

.download-page__logo span {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 800;
  color: var(--text);
}

.download-page__tagline {
  font-size: 1.15rem;
  color: var(--muted);
  max-width: 380px;
  margin-bottom: 40px;
  line-height: 1.5;
}

.download-page__store {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.download-page__store .store-buttons {
  flex-direction: column;
  align-items: center;
}

@media (min-width: 480px) {
  .download-page__store .store-buttons {
    flex-direction: row;
    justify-content: center;
  }
}

.download-page__copy {
  margin-top: 48px;
  font-size: 0.8rem;
  color: var(--muted);
  opacity: 0.7;
}
```

- [ ] **Step 2: Commit**

```bash
git add styles.css
git commit -m "feat: add download page CSS layout styles"
```

---

### Task 2: Add i18n keys to all language files

**Files:**
- Modify: `i18n/es.json`, `i18n/en.json`, `i18n/ca.json`, `i18n/eu.json`, `i18n/gl.json`, `i18n/pt.json`, `i18n/de.json`, `i18n/fr.json`, `i18n/it.json`

- [ ] **Step 1: Add keys to `i18n/es.json`**

In `es.json`, add the following two keys after `"common.coming_soon"`:

```json
"download.tagline": "Descarga Zampa y descubre menús del día cerca de ti",
"footer.download": "Descarga la app"
```

- [ ] **Step 2: Add keys to `i18n/en.json`**

In `en.json`, add after `"common.coming_soon"`:

```json
"download.tagline": "Download Zampa and discover daily menus near you",
"footer.download": "Download the app"
```

- [ ] **Step 3: Add keys to `i18n/ca.json`**

In `ca.json`, add after `"common.coming_soon"`:

```json
"download.tagline": "Descarrega Zampa i descobreix menús del dia prop teu",
"footer.download": "Descarrega l'app"
```

- [ ] **Step 4: Add keys to `i18n/eu.json`**

In `eu.json`, add after `"common.coming_soon"`:

```json
"download.tagline": "Deskargatu Zampa eta aurkitu eguneroko menuak zure inguruan",
"footer.download": "Deskargatu aplikazioa"
```

- [ ] **Step 5: Add keys to `i18n/gl.json`**

In `gl.json`, add after `"common.coming_soon"`:

```json
"download.tagline": "Descarga Zampa e descobre menús do día preto de ti",
"footer.download": "Descarga a app"
```

- [ ] **Step 6: Add keys to `i18n/pt.json`**

In `pt.json`, add after `"common.coming_soon"`:

```json
"download.tagline": "Baixa Zampa e descobre menus do dia perto de ti",
"footer.download": "Baixar a app"
```

- [ ] **Step 7: Add keys to `i18n/de.json`**

In `de.json`, add after `"common.coming_soon"`:

```json
"download.tagline": "Lade Zampa herunter und entdecke Tagesmenüs in deiner Nähe",
"footer.download": "App herunterladen"
```

- [ ] **Step 8: Add keys to `i18n/fr.json`**

In `fr.json`, add after `"common.coming_soon"`:

```json
"download.tagline": "Télécharge Zampa et découvre les menus du jour près de toi",
"footer.download": "Télécharger l'app"
```

- [ ] **Step 9: Add keys to `i18n/it.json`**

In `it.json`, add after `"common.coming_soon"`:

```json
"download.tagline": "Scarica Zampa e scopri i menù del giorno vicino a te",
"footer.download": "Scarica l'app"
```

- [ ] **Step 10: Commit**

```bash
git add i18n/
git commit -m "feat: add download page i18n keys for all 9 languages"
```

---

### Task 3: Create `download.html`

**Files:**
- Create: `download.html`

- [ ] **Step 1: Create `download.html`**

Create the file with the following content:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Descarga Zampa en iOS y Android">
  <meta name="theme-color" content="#FAAF32">
  <title>Zampa - Descarga la app</title>
  <link rel="icon" type="image/png" href="assets/logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <main class="download-page">

    <a href="/" class="download-page__logo">
      <img src="assets/logo.png" alt="Zampa logo">
      <span>Zampa</span>
    </a>

    <p class="download-page__tagline" data-i18n="download.tagline">
      Descarga Zampa y descubre menús del día cerca de ti
    </p>

    <div class="download-page__store">
      <div class="store-wrap">
        <div class="store-buttons">
          <a href="#" class="store-btn" aria-disabled="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <div class="store-btn__text">
              <small data-i18n="hero.appstore.label">Disponible en</small>
              <strong>App Store</strong>
            </div>
          </a>
          <a href="#" class="store-btn" aria-disabled="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.73c-.36-.17-.68-.52-.68-1.09V1.36c0-.57.32-.92.68-1.09l11.2 11.73L3.18 23.73zM15.74 15.37l-2.56-2.67L15.74 10l3.64 2.04c.82.46.82 1.2 0 1.66l-3.64 2.04-.01-.01.01-.36zM13.18 12.7L5.11 21.2l10.63-5.96-2.56-2.54zM5.11 2.8l8.07 8.5 2.56-2.54L5.11 2.8z"/></svg>
            <div class="store-btn__text">
              <small data-i18n="hero.playstore.label">Disponible en</small>
              <strong>Google Play</strong>
            </div>
          </a>
        </div>
        <div class="coming-soon-sign" aria-label="Próximamente">
          <span class="coming-soon-sign__text" data-i18n="common.coming_soon">PRÓXIMAMENTE</span>
        </div>
      </div>
    </div>

    <p class="download-page__copy" data-i18n="footer.copyright">&copy; 2026 Sozo Labs. Todos los derechos reservados.</p>

  </main>

  <script src="main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Open in browser and verify**

Open `download.html` in a browser (double-click or use a local server). Verify:
- Logo and "Zampa" text appear centered
- Tagline appears below the logo
- Both store buttons are visible and dimmed (opacity 0.55)
- "PRÓXIMAMENTE" badge overlaps the buttons
- Page looks good on mobile viewport (DevTools → 390px width)

- [ ] **Step 3: Commit**

```bash
git add download.html
git commit -m "feat: add download page for QR code landing"
```

---

### Task 4: Add footer download link to all existing pages

**Files:**
- Modify: `index.html`, `privacy.html`, `terms.html`, `delete-account.html`

Each footer has a `<nav class="footer__links">` section. Add the download link as the first item.

- [ ] **Step 1: Update footer in `index.html`**

Find this block in `index.html`:
```html
      <nav class="footer__links">
        <a href="mailto:soporte@getzampa.com" data-i18n="footer.contact">Contacto</a>
```

Replace with:
```html
      <nav class="footer__links">
        <a href="download.html" data-i18n="footer.download">Descarga la app</a>
        <a href="mailto:soporte@getzampa.com" data-i18n="footer.contact">Contacto</a>
```

- [ ] **Step 2: Update footer in `privacy.html`**

Find the same `<nav class="footer__links">` block and add the same link as first item:
```html
      <nav class="footer__links">
        <a href="download.html" data-i18n="footer.download">Descarga la app</a>
        <a href="mailto:soporte@getzampa.com" data-i18n="footer.contact">Contacto</a>
```

- [ ] **Step 3: Update footer in `terms.html`**

Same change — add `download.html` link as first item in `footer__links`.

- [ ] **Step 4: Update footer in `delete-account.html`**

Same change — add `download.html` link as first item in `footer__links`.

- [ ] **Step 5: Verify links in browser**

Open `index.html`. Scroll to footer. Confirm "Descarga la app" link appears and clicking it opens `download.html`.

- [ ] **Step 6: Commit**

```bash
git add index.html privacy.html terms.html delete-account.html
git commit -m "feat: add download page link to all page footers"
```
