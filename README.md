# McCannics website (Pages)

Bold multi-page marketing site for McCannics (Gisborne) — Patton-inspired section rhythm and industrial typography, McCannics brand and copy only. Parallel to the live Shopify store at [mccannics.co.nz](https://mccannics.co.nz) — this does **not** replace Shopify checkout.

Static HTML only. No build step. Tailwind via CDN.

## Deploy

- **GitHub:** `cortenliving/mccannics-web` · branch `main`
- **Cloudflare Pages:** auto-deploys from `main` → https://mccannics-web.pages.dev
- Build command: none · Output directory: `/` (site root)

## Site map

| Path | Page |
|------|------|
| `/` | Home — Patton-style engineering rhythm |
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
- Soft `#F5F5F5` / white
- Fonts: Barlow Condensed (display) + Source Sans 3 + Source Serif 4
- Logo: white wordmark + red wrench-C — dark backgrounds only

## Brand assets

PNG logo and favicon live in the repo root. If GitHub MCP cannot push binaries, `_brand_chunks/` + `.github/workflows/apply-brand-assets.yml` decode them on push. Run **Apply brand assets** (workflow_dispatch) if PNGs are missing after a text-only push.

## Local preview

```bash
python3 -m http.server 8080 --directory .
```

Then visit http://localhost:8080/
