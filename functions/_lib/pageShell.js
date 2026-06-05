import { escapeHtml } from './html.js';
import { t } from './i18n.js';

// Minimalist "share landing" CSS — scoped to .share-* so it does not affect
// the main marketing site. Brand tokens (--share-primary etc.) mirror the
// values in /styles.css so the landing feels Zampa without pulling the
// full marketing layout (nav, hero, mascot, etc.).
const SHARE_CSS = `
  :root {
    --share-primary: #FAAF32;
    --share-primary-dark: #E89B1C;
    --share-surface: #FFF7E0;
    --share-text: #2D3436;
    --share-text-muted: #636E72;
    --share-card: #ffffff;
    --share-border: rgba(0, 0, 0, 0.08);
    --share-radius: 14px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Sora', system-ui, -apple-system, sans-serif;
    background: var(--share-surface);
    color: var(--share-text);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  img { display: block; max-width: 100%; }
  a { color: inherit; }
  .share-header {
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: center;
  }
  .share-brand {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--share-text);
  }
  .share-brand-icon { width: 28px; height: 28px; border-radius: 6px; }
  .share-brand-word { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.01em; }
  .share-main {
    flex: 1;
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    padding: 0.5rem 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .share-hero {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: var(--share-radius);
    background: #eee;
  }
  .share-title {
    font-size: 1.65rem;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: -0.015em;
  }
  .share-price {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--share-primary-dark);
  }
  .share-description {
    font-size: 1rem;
    color: var(--share-text);
    white-space: pre-line;
  }
  .share-restaurant { font-size: 0.95rem; color: var(--share-text-muted); }
  .share-restaurant a {
    color: var(--share-text);
    font-weight: 600;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }
  .share-card {
    display: flex;
    gap: 0.875rem;
    align-items: center;
    padding: 0.875rem;
    border-radius: var(--share-radius);
    background: var(--share-card);
    border: 1px solid var(--share-border);
  }
  .share-card-image {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    object-fit: cover;
    flex-shrink: 0;
    background: #eee;
  }
  .share-card-text { display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; }
  .share-card-name { font-weight: 600; font-size: 1rem; }
  .share-card-meta { font-size: 0.875rem; color: var(--share-text-muted); }
  .share-ctas { display: flex; flex-direction: column; gap: 0.625rem; margin-top: 0.5rem; }
  .share-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.95rem 1.25rem;
    border-radius: 999px;
    font-weight: 600;
    font-size: 1rem;
    text-decoration: none;
    transition: transform 0.05s ease, background 0.15s ease;
  }
  .share-cta:active { transform: scale(0.98); }
  .share-cta--primary { background: var(--share-primary); color: #1A1A2E; }
  .share-cta--primary:hover { background: var(--share-primary-dark); }
  .share-cta--secondary {
    background: transparent;
    color: var(--share-text);
    border: 1.5px solid var(--share-border);
  }
  .share-footer {
    padding: 1.5rem 1.5rem 2rem;
    text-align: center;
    font-size: 0.875rem;
    color: var(--share-text-muted);
  }
  .share-footer p { margin: 0; }
  .share-footer a {
    color: var(--share-text-muted);
    text-decoration: none;
    margin: 0 0.4rem;
  }
  .share-footer a:hover { color: var(--share-text); }
  .share-footer-copy { margin-top: 0.5rem; font-size: 0.8125rem; }
`;

export function renderShell({ title, canonicalUrl, mainContent, locale = 'es', jsonLd = '' }) {
  return `<!DOCTYPE html>
<html lang="${escapeHtml(locale)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192x192.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
  <style>${SHARE_CSS}</style>
  ${jsonLd}
</head>
<body>
  <header class="share-header">
    <a href="/" class="share-brand" aria-label="Zampa">
      <img src="/assets/favicon-192x192.png" alt="" class="share-brand-icon">
      <span class="share-brand-word">Zampa</span>
    </a>
  </header>
  <main class="share-main">
    ${mainContent}
  </main>
  <footer class="share-footer">
    <p>
      <a href="/privacy.html">${escapeHtml(t(locale, 'footer.privacy'))}</a>·
      <a href="/terms.html">${escapeHtml(t(locale, 'footer.terms'))}</a>·
      <a href="/download.html">${escapeHtml(t(locale, 'footer.download'))}</a>
    </p>
    <p class="share-footer-copy">© 2026 Sozo Labs</p>
  </footer>
</body>
</html>`;
}
