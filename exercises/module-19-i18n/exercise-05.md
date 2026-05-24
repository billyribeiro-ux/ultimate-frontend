---
module: 19
exercise: 5
title: Hreflang SEO
difficulty: principal
estimated_time: 60
skills_tested:
  - hreflang link elements
  - x-default annotation
  - canonical URL management
  - sitemap generation for multilingual sites
  - meta tag management in SvelteKit
---

# Exercise 19.5 — Hreflang SEO

## Brief

Implement proper SEO for a multilingual SvelteKit site by generating `hreflang` alternate link tags, canonical URLs, and a multilingual XML sitemap. Search engines use these signals to serve the correct language version to users. This exercise teaches the technical SEO requirements for international websites.

## Requirements

1. Create `src/routes/exercises/19-i18n/05/[locale]/+page.svelte` with localized content for `en`, `es`, `fr`
2. In the page's `<svelte:head>`, add `<link rel="alternate" hreflang="..." href="...">` for each supported locale
3. Add a `<link rel="alternate" hreflang="x-default" href="...">` pointing to the English version
4. Add a `<link rel="canonical" href="...">` pointing to the current page's full URL
5. Set the `<html lang="...">` attribute via `<svelte:head>` or a layout
6. Create `src/routes/exercises/19-i18n/05/sitemap.xml/+server.ts` that generates a multilingual XML sitemap
7. The sitemap must use `<xhtml:link>` elements to declare alternate language versions for each URL
8. Create a server endpoint that returns proper `Content-Type: application/xml`
9. Display the generated meta tags on the page for educational purposes
10. Show what search engines see: a visualization of the hreflang graph
11. Style with PE7 tokens

## Constraints

- All URLs must be absolute (include protocol and domain)
- The sitemap must be valid XML
- TypeScript strict mode
- Every page must have exactly one canonical URL

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Hreflang tags tell search engines: "This page in English is also available in Spanish at this URL." Each page needs a `<link>` for every language version, including itself. The `x-default` value points to the default/fallback version (usually English). Place these in `<svelte:head>`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

In the load function, compute the full URLs for each locale version of the current page. Pass them to the page component. In `<svelte:head>`, iterate over the locales and render `<link>` tags. The sitemap endpoint uses the same URL-building logic but outputs XML. Use `url.origin` from the load function to build absolute URLs.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<svelte:head>
  {#each data.alternates as alt}
    <link rel="alternate" hreflang={alt.locale} href={alt.url} />
  {/each}
  <link rel="alternate" hreflang="x-default" href={data.alternates.find(a => a.locale === 'en')?.url} />
  <link rel="canonical" href={data.canonical} />
</svelte:head>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/19-i18n/05/[locale]/+page.server.ts`**

```typescript
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const SUPPORTED_LOCALES = ['en', 'es', 'fr'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const content: Record<Locale, { title: string; description: string; body: string }> = {
  en: {
    title: 'International SEO Demo',
    description: 'Learn how to implement hreflang tags for multilingual SEO.',
    body: 'This page demonstrates the correct implementation of hreflang alternate links, canonical URLs, and multilingual sitemaps for search engine optimization.'
  },
  es: {
    title: 'Demo de SEO Internacional',
    description: 'Aprende a implementar etiquetas hreflang para SEO multilingue.',
    body: 'Esta pagina demuestra la implementacion correcta de enlaces alternos hreflang, URLs canonicas y sitemaps multilingues para la optimizacion de motores de busqueda.'
  },
  fr: {
    title: 'Demo SEO International',
    description: 'Apprenez a implementer les balises hreflang pour le SEO multilingue.',
    body: 'Cette page demontre la bonne implementation des liens alternatifs hreflang, des URL canoniques et des sitemaps multilingues pour le referencement.'
  }
};

export const load: PageServerLoad = async ({ params, url }) => {
  const locale = params.locale as Locale;

  if (!SUPPORTED_LOCALES.includes(locale)) {
    redirect(303, '/exercises/19-i18n/05/en');
  }

  const basePath = '/exercises/19-i18n/05';
  const origin = url.origin;

  const alternates = SUPPORTED_LOCALES.map((loc) => ({
    locale: loc,
    url: `${origin}${basePath}/${loc}`
  }));

  return {
    locale,
    content: content[locale],
    alternates,
    canonical: `${origin}${basePath}/${locale}`,
    xDefault: `${origin}${basePath}/en`
  };
};
```

**`src/routes/exercises/19-i18n/05/[locale]/+page.svelte`**

```svelte
<script lang="ts">
  interface Alternate {
    locale: string;
    url: string;
  }

  interface Props {
    data: {
      locale: string;
      content: { title: string; description: string; body: string };
      alternates: Alternate[];
      canonical: string;
      xDefault: string;
    };
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>{data.content.title}</title>
  <meta name="description" content={data.content.description} />
  <link rel="canonical" href={data.canonical} />
  {#each data.alternates as alt}
    <link rel="alternate" hreflang={alt.locale} href={alt.url} />
  {/each}
  <link rel="alternate" hreflang="x-default" href={data.xDefault} />
</svelte:head>

<main class="page">
  <h1>{data.content.title}</h1>

  <div class="locale-nav">
    {#each data.alternates as alt}
      <a href={alt.url} class:active={alt.locale === data.locale}>{alt.locale.toUpperCase()}</a>
    {/each}
  </div>

  <p class="body-text">{data.content.body}</p>

  <section class="seo-preview">
    <h2>Generated SEO Tags</h2>
    <div class="tag-list">
      <div class="tag-item">
        <span class="tag-label">Canonical</span>
        <code>&lt;link rel="canonical" href="{data.canonical}" /&gt;</code>
      </div>
      {#each data.alternates as alt}
        <div class="tag-item">
          <span class="tag-label">hreflang={alt.locale}</span>
          <code>&lt;link rel="alternate" hreflang="{alt.locale}" href="{alt.url}" /&gt;</code>
        </div>
      {/each}
      <div class="tag-item">
        <span class="tag-label">x-default</span>
        <code>&lt;link rel="alternate" hreflang="x-default" href="{data.xDefault}" /&gt;</code>
      </div>
    </div>
  </section>

  <section class="graph-section">
    <h2>Hreflang Relationship Graph</h2>
    <p class="graph-intro">Every locale page points to every other locale page, creating a complete graph:</p>
    <div class="graph">
      {#each data.alternates as from}
        <div class="graph-row">
          <span class="graph-node" class:current={from.locale === data.locale}>{from.locale.toUpperCase()}</span>
          <span class="graph-arrows">
            {#each data.alternates as to}
              {#if to.locale !== from.locale}
                <span class="graph-edge">&#8594; {to.locale.toUpperCase()}</span>
              {/if}
            {/each}
          </span>
        </div>
      {/each}
    </div>
  </section>

  <section class="sitemap-section">
    <h2>Sitemap</h2>
    <p>View the generated multilingual sitemap: <a href="/exercises/19-i18n/05/sitemap.xml" class="sitemap-link">/sitemap.xml</a></p>
  </section>
</main>

<style>
  .page { max-inline-size: var(--content-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }

  .locale-nav { display: flex; gap: var(--space-sm); margin-block-end: var(--space-xl); }
  .locale-nav a { font-size: var(--text-sm); font-weight: 700; padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); text-decoration: none; color: var(--color-text-muted); border: 1px solid var(--color-border); }
  .locale-nav a.active { background: var(--color-brand); color: var(--color-surface); border-color: transparent; }

  .body-text { font-size: var(--text-base); color: var(--color-text-muted); line-height: 1.7; margin-block-end: var(--space-2xl); }

  .seo-preview { margin-block-end: var(--space-2xl); }
  .tag-list { display: grid; gap: var(--space-xs); }
  .tag-item { display: grid; grid-template-columns: 8rem 1fr; gap: var(--space-sm); align-items: center; padding: var(--space-xs) var(--space-sm); background: var(--color-surface-2); border-radius: var(--radius-sm); }
  .tag-label { font-size: var(--text-xs); font-weight: 600; color: var(--color-brand); }
  code { font-size: var(--text-xs); word-break: break-all; }

  .graph-section { margin-block-end: var(--space-2xl); }
  .graph-intro { font-size: var(--text-sm); color: var(--color-text-muted); margin-block-end: var(--space-md); }
  .graph { display: grid; gap: var(--space-sm); background: var(--color-surface-2); border-radius: var(--radius-md); padding: var(--space-md); }
  .graph-row { display: flex; align-items: center; gap: var(--space-md); }
  .graph-node { font-weight: 700; font-size: var(--text-sm); min-inline-size: 2rem; }
  .graph-node.current { color: var(--color-brand); }
  .graph-arrows { display: flex; gap: var(--space-sm); }
  .graph-edge { font-size: var(--text-xs); color: var(--color-text-muted); }

  .sitemap-section { margin-block-end: var(--space-xl); }
  .sitemap-link { color: var(--color-brand); font-family: monospace; font-size: var(--text-sm); }
</style>
```

**`src/routes/exercises/19-i18n/05/sitemap.xml/+server.ts`**

```typescript
import type { RequestHandler } from './$types';

const SUPPORTED_LOCALES = ['en', 'es', 'fr'];
const PAGES = [''];  // Add more page paths as needed

export const GET: RequestHandler = async ({ url }) => {
  const origin = url.origin;
  const basePath = '/exercises/19-i18n/05';

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  for (const page of PAGES) {
    for (const locale of SUPPORTED_LOCALES) {
      const pageUrl = `${origin}${basePath}/${locale}${page}`;

      xml += '  <url>\n';
      xml += `    <loc>${pageUrl}</loc>\n`;

      for (const altLocale of SUPPORTED_LOCALES) {
        const altUrl = `${origin}${basePath}/${altLocale}${page}`;
        xml += `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${altUrl}" />\n`;
      }

      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${basePath}/en${page}" />\n`;
      xml += '    <lastmod>2026-01-01</lastmod>\n';
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600'
    }
  });
};
```

### Explanation

Hreflang is how you tell search engines "this page exists in multiple languages." Without it, Google might index the wrong language version or consider the translations as duplicate content (hurting your SEO). The rules: (1) every page must link to itself and every other language version; (2) the relationship must be bidirectional (EN points to ES AND ES points to EN); (3) `x-default` tells search engines which version to show when no other locale matches. The canonical URL (`<link rel="canonical">`) ensures each page has exactly one authoritative URL — this prevents duplicate content issues. The XML sitemap with `<xhtml:link>` elements provides the same information in a machine-readable format that search engines can crawl efficiently. The hreflang values must be valid BCP 47 language tags (e.g., `en`, `es`, `fr`, or more specific like `en-US`, `zh-Hans`). In production, you would generate the sitemap dynamically from your page routes and include pagination for large sites.
</details>
