---
module: 19
lesson: 19.8
title: i18n SEO and performance
duration: 55 minutes
prerequisites:
  - "19.4 — Locale routing strategies"
  - "13.2 — <svelte:head>"
  - "13.3 — Reusable typed SEO component"
  - "13.8 — Dynamic sitemap generation"
learning_objectives:
  - Generate hreflang link elements for all locale variants of every page in a SvelteKit layout
  - Build a locale-aware sitemap.xml that includes all localized URLs with xhtml:link alternates
  - Set the correct lang and dir attributes on the html element dynamically per locale
  - Implement locale-based code splitting to minimize initial bundle size for multi-locale sites
  - Explain how search engines use hreflang to serve the correct locale to users in different regions
status: ready
---

# Lesson 19.8 — i18n SEO and performance

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Making search engines understand your languages

### 1.1 The problem: Google does not know which page to show

You have three versions of your pricing page: `/en/pricing`, `/pt-BR/pricing`, `/ar/pricing`. Without any signals, Google treats these as three separate pages that happen to have similar content. It might show the English version to a Brazilian user, or flag the Portuguese version as duplicate content and exclude it from the index entirely. Neither outcome is what you want.

Search engines need explicit signals to understand that these pages are locale variants of the same content. Without those signals, you lose traffic in every market except the one Google guesses is "primary."

### 1.2 How hreflang solves it

The `hreflang` attribute tells search engines which language and region each URL serves. You add `<link>` elements to the `<head>` of every page, one for each locale variant:

```html
<link rel="alternate" hreflang="en" href="https://example.com/en/pricing" />
<link rel="alternate" hreflang="pt-BR" href="https://example.com/pt-BR/pricing" />
<link rel="alternate" hreflang="ar" href="https://example.com/ar/pricing" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/pricing" />
```

The `x-default` value tells search engines which URL to use when no specific locale matches the user's language. It is typically the source locale or a language selection page.

Every locale variant must link to every other locale variant, including itself. If the English page links to Portuguese and Arabic but the Portuguese page only links to English, Google sees an inconsistency and may ignore the hreflang entirely.

### 1.3 Implementing hreflang in SvelteKit

In a SvelteKit layout, you generate hreflang links dynamically using `<svelte:head>`:

```svelte
<script lang="ts">
  import { page } from '$app/state';

  const locales: string[] = ['en', 'pt-BR', 'ar'];
  const baseUrl: string = 'https://example.com';

  let hreflangs: Array<{ lang: string; href: string }> = $derived(
    locales.map(locale => {
      const pathWithoutLocale = page.url.pathname.replace(/^\/(en|pt-BR|ar)/, '');
      return {
        lang: locale,
        href: `${baseUrl}/${locale}${pathWithoutLocale}`
      };
    })
  );
</script>

<svelte:head>
  {#each hreflangs as { lang, href }}
    <link rel="alternate" hreflang={lang} {href} />
  {/each}
  <link rel="alternate" hreflang="x-default" href={hreflangs[0].href} />
</svelte:head>
```

This code runs in the `[locale]/+layout.svelte` so it applies to every page automatically. Every page, regardless of the active locale, outputs links to all locale variants.

### 1.4 Locale-aware sitemaps

Google also reads hreflang from sitemaps, and for large sites, the sitemap approach is more reliable than HTML link elements. A locale-aware sitemap uses the `xhtml:link` element:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://example.com/en/pricing</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/pricing"/>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="https://example.com/pt-BR/pricing"/>
    <xhtml:link rel="alternate" hreflang="ar" href="https://example.com/ar/pricing"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/pricing"/>
  </url>
  <!-- Repeat for each locale variant -->
</urlset>
```

In SvelteKit, generate this as a server route at `/sitemap.xml`:

```typescript
// src/routes/sitemap.xml/+server.ts
import type { RequestHandler } from './$types';

const locales: string[] = ['en', 'pt-BR', 'ar'];
const pages: string[] = ['', '/pricing', '/blog'];
const baseUrl: string = 'https://example.com';

export const GET: RequestHandler = () => {
  const urls = pages.flatMap(pagePath =>
    locales.map(locale => ({
      loc: `${baseUrl}/${locale}${pagePath}`,
      alternates: locales.map(l => ({
        hreflang: l,
        href: `${baseUrl}/${l}${pagePath}`
      }))
    }))
  );

  const xml = generateSitemapXml(urls);
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
};
```

### 1.5 Performance: loading only the active locale

The biggest performance pitfall of i18n is shipping all locale data to every user. With Paraglide's compile-time approach, only the active locale's messages are in the initial bundle. But other resources — fonts, date formatting data, RTL stylesheets — also need locale-aware loading.

Arabic requires a different font stack because system-ui fonts for Latin scripts often lack Arabic glyphs. Load the Arabic font only when the locale is Arabic:

```svelte
<svelte:head>
  {#if locale === 'ar'}
    <link rel="preload" as="font" href="/fonts/noto-arabic.woff2" crossorigin />
  {/if}
</svelte:head>
```

For RTL styles, if you use logical properties throughout (as PE7 mandates), you need no additional CSS. But if third-party components use physical properties, conditionally load an RTL override stylesheet.

### Deep Dive — Validating hreflang implementation and common search engine pitfalls

Hreflang is one of the most commonly misconfigured SEO features. Google Search Console reports hreflang errors in the "International targeting" section. Common issues:

**Missing return links.** Every hreflang link must be reciprocal. If `/en/pricing` links to `/pt-BR/pricing`, then `/pt-BR/pricing` must link back to `/en/pricing`. Our SvelteKit layout approach guarantees reciprocity because the same code generates links on every locale variant.

**Inconsistent canonical and hreflang.** If a page has `<link rel="canonical" href="/en/pricing">` and also has hreflang links, the canonical URL must be one of the hreflang URLs. If the canonical points to a URL not in the hreflang set, Google ignores the hreflang entirely.

**Wrong locale codes.** Hreflang uses ISO 639-1 language codes optionally followed by ISO 3166-1 region codes: `en`, `pt-BR`, `ar`. Using `pt_BR` (underscore) or `portuguese` is invalid and Google ignores it.

**Mixing sitemap and HTML hreflang.** Google reads hreflang from both sources and merges them. If they conflict (HTML says three locales, sitemap says two), Google uses the intersection. Keep both sources consistent.

For validation, use Google's URL Inspection tool in Search Console. Enter a locale URL, click "Test Live URL," and check the HTML output for correct hreflang links. Tools like `hreflang.org` and Screaming Frog also validate hreflang across your entire site.

Performance monitoring for i18n sites should track Core Web Vitals per locale. Arabic pages may have different LCP because of font loading. Japanese pages may have different CLS because of character-width differences. Set up separate Lighthouse CI runs for each locale to catch per-locale regressions.

The `x-default` URL is often debated. Some sites point it to the root (`/`) which redirects to the detected locale. Others point it to the English version. Google's official recommendation is to use `x-default` for a locale selector page or for the most common locale. If you use a redirect from `/` to `/{locale}`, `x-default` should point to `/` so Google knows about the detection mechanism.

## 2. Style it — PE7 applied to the hreflang visualizer mini-build

The mini-build is an hreflang link visualizer. Each locale column uses `var(--color-surface-2)` cards showing the URL and its hreflang links. Reciprocal links are connected with lines using `var(--color-brand)`. Missing or invalid links display with `var(--color-error)` borders. The `x-default` link uses a distinct `var(--color-warning)` badge.

The layout uses a CSS Grid with `auto-fill` columns at `minmax(min(100%, 15rem), 1fr)` for responsive locale columns. Each card uses `var(--text-xs)` for URLs and `var(--text-sm)` for locale labels.

## 3. Interact — building an hreflang link generator and validator

```typescript
interface PageRoute {
  path: string;
  title: string;
}

let pages: PageRoute[] = $state([
  { path: '/', title: 'Home' },
  { path: '/pricing', title: 'Pricing' },
  { path: '/blog', title: 'Blog' }
]);

let locales: string[] = $state(['en', 'pt-BR', 'ar']);
let baseUrl: string = $state('https://example.com');

interface HreflangLink {
  page: string;
  locale: string;
  url: string;
  alternates: Array<{ hreflang: string; href: string }>;
  hasReturnLinks: boolean;
}

let links: HreflangLink[] = $derived(
  pages.flatMap(page =>
    locales.map(locale => ({
      page: page.path,
      locale,
      url: `${baseUrl}/${locale}${page.path === '/' ? '' : page.path}`,
      alternates: [
        ...locales.map(l => ({
          hreflang: l,
          href: `${baseUrl}/${l}${page.path === '/' ? '' : page.path}`
        })),
        { hreflang: 'x-default', href: `${baseUrl}/en${page.path === '/' ? '' : page.path}` }
      ],
      hasReturnLinks: true
    }))
  )
);
```

The student adds pages and locales, and the hreflang links generate automatically. A validation indicator shows green for correct reciprocal links.

## 4. Mini-build — Hreflang link generator and SEO validator

**File path:** `src/routes/modules/19-i18n/08-i18n-seo-performance/+page.svelte`

A tool that generates hreflang `<link>` elements and sitemap XML for a multi-locale site. The student configures pages, locales, and base URL. The tool outputs the HTML head links and the sitemap XML, validates reciprocity, and flags missing links. A "Copy HTML" button copies the hreflang links to the clipboard.

**DevTools moment:** Right-click the current page and "View Page Source." Search for `hreflang`. In a production i18n site, you would see the alternates listed in the head. Open Google's Rich Results Test and enter a locale URL to verify that structured data and hreflang are both correct.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why must every locale variant page link to every other locale variant, including itself?</summary>

Google requires reciprocal hreflang links to confirm the relationship between locale variants. If page A links to page B but page B does not link back to page A, Google cannot verify the relationship and may ignore the hreflang entirely. Including a self-referencing link confirms the page's own locale identity.
</details>

<details>
<summary><strong>Q2.</strong> What is hreflang="x-default" and when should you use it?</summary>

The `x-default` value tells search engines which URL to show when no locale variant matches the user's language. It is typically pointed at the source locale (e.g., English) or at a language selection page. It ensures that users whose language is not covered by any specific hreflang still get directed to a sensible page.
</details>

<details>
<summary><strong>Q3.</strong> How does Paraglide's compile-time approach benefit i18n performance compared to runtime dictionaries?</summary>

Paraglide compiles message patterns into direct function calls and includes only the active locale's functions in the bundle. Runtime dictionaries ship all translations as JSON and look up keys at runtime. The compile-time approach results in smaller bundles (only used messages, only one locale), zero lookup overhead, and full tree-shaking by Vite.
</details>

<details>
<summary><strong>Q4.</strong> Why should you track Core Web Vitals separately for each locale?</summary>

Different locales can have different performance profiles. Arabic pages may have slower LCP due to custom font loading. Japanese text may cause different CLS due to character-width variations. RTL layouts may trigger different paint patterns. Tracking per-locale metrics lets you detect and fix regressions that affect only specific language users.
</details>

<details>
<summary><strong>Q5.</strong> What happens if the canonical URL and hreflang URLs conflict?</summary>

If a page's canonical URL points to a URL that is not in the hreflang set, Google ignores the hreflang entirely. The canonical must be one of the hreflang URLs (typically the self-referencing one). Conflicting signals confuse search engines and can result in the wrong locale version being indexed or locale variants being treated as duplicate content.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Missing x-default.** Without `x-default`, search engines have no fallback for users whose language is not covered. Always include it, even if it points to the same URL as your source locale.

2. **Using underscores in locale codes.** Hreflang requires `pt-BR` (hyphen), not `pt_BR` (underscore). Google silently ignores invalid codes without reporting an error in Search Console.

3. **Generating hreflang only in the source locale layout.** If only `/en/pricing` outputs hreflang links but `/pt-BR/pricing` does not, the reciprocity check fails. Generate hreflang in the `[locale]/+layout.svelte` so it appears on every locale variant.

4. **Loading all locale fonts on every page.** Preloading fonts for Arabic, Japanese, and Latin scripts on every page wastes bandwidth. Conditionally load fonts based on the active locale using `{#if}` inside `<svelte:head>`.

## 7. What's next — one sentence

With Module 19 complete, you can build production-ready multilingual applications — next you will learn how to test every layer of your SvelteKit application in Module 20.
