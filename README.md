# McCannics website (Pages)

Clean multi-page company site for McCannics (Gisborne). Parallel to the live Shopify store at [mccannics.co.nz](https://mccannics.co.nz) — this does **not** replace Shopify checkout.

Static HTML only. No build step. Tailwind via CDN.

## Deploy (GitHub Pages)

- **Branch:** `main`
- **Build command:** none (leave blank)
- **Output / publish directory:** `/` (site root)
- Custom domain optional later

After push, enable Pages in repo settings → Pages → Deploy from branch `main` / `/ (root)`.

## Site map

| Path | Page |
|------|------|
| `/` | Home — uncluttered pathways |
| `/solar/` | Solar — estimator + quote wizard |
| `/hire/` | Equipment hire (enquiry) |
| `/shop/` | Workshop supplies (enquiry cards) |
| `/services/` | Grouped services overview |
| `/about/` | About — since 1981, Gisborne |
| `/contact/` | Contact / quote form (local JS only) |

## Brand

- Charcoal `#1F1F21`, contrast `#2B2B2E`
- Red CTA `#F10808` (white label)
- Cyan accent `#00FCED`
- Paper / soft / border / muted as on mccannics.co.nz
- Fonts: Source Sans 3 + Source Serif 4
- Logo: white wordmark + red wrench-C — dark backgrounds only

## Brand assets

PNG logo and favicon live in the repo root. If GitHub MCP cannot push binaries, `_brand_chunks/` + `.github/workflows/apply-brand-assets.yml` decode them on push. Run **Apply brand assets** (workflow_dispatch) if PNGs are missing after a text-only push.

## Local preview

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8080 --directory .
```

Then visit http://localhost:8080/
