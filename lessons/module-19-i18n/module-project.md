# Module 19 Project — Multi-language Marketing Site

## Overview

Build a marketing site that serves three locales (English, Brazilian Portuguese, and Arabic) with full RTL support, locale-prefixed routing, formatted dates and numbers, pluralized strings, hreflang SEO tags, and a locale switcher component.

## Requirements

### Functional

1. **Three locales:** `en`, `pt-BR`, `ar` — all content fully translated.
2. **Locale routing:** URL prefix strategy (`/en/pricing`, `/pt-BR/pricing`, `/ar/pricing`). Root `/` detects via Accept-Language and redirects.
3. **RTL support:** Arabic locale renders with `dir="rtl"` and all layout adapts via logical CSS properties.
4. **Formatted dates/numbers:** At least one page shows locale-aware date formatting, currency formatting, and relative time.
5. **Pluralized strings:** Use ICU-style plural rules for item counts, messages with gender-select, and nested plural+select.
6. **SEO:** Every page includes `<link rel="alternate" hreflang>` tags for all locale variants, plus `x-default`. Sitemap includes all locale URLs.
7. **Locale switcher:** A component that switches locale while preserving the current page path.

### Technical

- Svelte 5 runes (`$state`, `$derived`, `$effect`) — no legacy stores.
- TypeScript strict mode. All message keys are typed. No `any`.
- PE7 CSS tokens for all styling. No raw color values. Mobile-first with `min-width` breakpoints.
- `prefers-reduced-motion` respected in any animation (e.g., locale switcher dropdown).
- Tree-shaking: only the active locale's messages are loaded on initial page load.

### Pages

| Route pattern            | Content                                          |
| ------------------------ | ------------------------------------------------ |
| `/[locale]`              | Hero with welcome message, formatted date        |
| `/[locale]/pricing`      | Pricing cards with locale-formatted currencies   |
| `/[locale]/blog`         | Blog listing with relative dates, item counts    |

### Components

| Component         | Purpose                                                       |
| ----------------- | ------------------------------------------------------------- |
| `LocaleSwitcher`  | Dropdown/buttons to switch locale, updates URL prefix         |
| `FormattedDate`   | Renders date using Intl.DateTimeFormat for current locale      |
| `FormattedNumber` | Renders number using Intl.NumberFormat for current locale      |
| `PluralMessage`   | Renders ICU-style plural string for current locale            |
| `SEOHead`         | Outputs hreflang links and lang attribute                     |

### Stretch goals

- Persist locale preference in a cookie so return visits auto-select.
- Add a fourth locale (Japanese `ja`) to prove the architecture scales.
- Prerender all locale variants as static HTML for deployment on edge CDNs.

## Evaluation criteria

| Criterion               | Weight |
| ----------------------- | ------ |
| Correct locale routing  | 20%    |
| RTL layout quality      | 20%    |
| Formatting correctness  | 15%    |
| Pluralization accuracy  | 15%    |
| SEO hreflang output     | 15%    |
| Type safety & DX        | 10%    |
| Performance (tree-shake) | 5%    |

## Submission

Push to a branch named `module-19-project`. Run `pnpm build` to verify all locale variants prerender without error. The site must serve correct HTML for each locale and pass Lighthouse accessibility at 100.
