# Download Page Design

**Date:** 2026-04-24  
**Status:** Approved

## Goal

Create a dedicated download page at `getzampa.com/download` optimized for QR code scanning. Users arrive on mobile and need to quickly find the iOS or Android download button.

## Approach

Minimal centered page (Option A) — no full nav header, no complex footer. Single screen, vertically and horizontally centered content, mobile-first.

## Structure

- **File:** `download.html` in project root
- **URL:** `https://www.getzampa.com/download`

### Page elements (top to bottom)

1. Zampa logo + wordmark
2. Short tagline (i18n key: `download.tagline`)
3. Two store buttons stacked vertically on mobile, side-by-side on desktop — App Store and Google Play
4. "PRÓXIMAMENTE" badge (reuses existing `.coming-soon-sign` component)
5. Minimal copyright line at the bottom

### Store button state

Both buttons use `href="#"` and `aria-disabled="true"` until real store URLs are available. When the app ships, only the `href` values need updating.

## Styles

Reuses existing `styles.css`. Classes `.store-btn`, `.coming-soon-sign`, `.store-wrap` already defined. New styles added inline in `<style>` tag or as a small addition to `styles.css`:
- `.download-page` wrapper: `min-height: 100vh`, flexbox column, centered
- Responsive: buttons stacked on mobile, side-by-side on ≥480px

## i18n

New keys added to all 9 language files (`es`, `en`, `ca`, `eu`, `gl`, `pt`, `de`, `fr`, `it`):

| Key | ES value |
|-----|----------|
| `download.tagline` | `Descarga Zampa y descubre menús del día cerca de ti` |
| `download.coming_soon` | reuse `common.coming_soon` |

Non-Spanish languages default to Spanish text initially (same pattern as rest of site).

## Footer link

All pages (index, privacy, terms, delete-account) get a new footer link pointing to `download.html`, labeled via i18n key `footer.download`.

| Key | ES value |
|-----|----------|
| `footer.download` | `Descarga la app` |

## Out of scope

- Email waitlist / notification form
- Full header navigation
- Real store URLs (added later when app ships)
