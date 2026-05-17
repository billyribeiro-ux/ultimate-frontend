---
module: 13
exercise: 3
title: Dynamic Sitemap Generation
difficulty: advanced
estimated_time: 30
skills_tested:
  - server.ts endpoint
  - XML generation
  - dynamic route enumeration
  - lastmod and priority
---

# Exercise 13.3 — Dynamic Sitemap Generation

## Brief

Build a dynamic sitemap at `/sitemap.xml` that automatically includes all static and dynamic routes. The sitemap reads from a data source to enumerate dynamic routes (blog posts, products) and assigns appropriate `lastmod`, `changefreq`, and `priority` values.

## Requirements

1. Create `src/routes/sitemap.xml/+server.ts` that returns a valid XML sitemap
2. Include static routes (home, about, contact) with hardcoded entries
3. Include dynamic routes (blog posts) by importing from a data module
4. Each URL entry must include `<loc>`, `<lastmod>`, `<changefreq>`, and `<priority>`
5. Home page gets priority 1.0, section pages get 0.8, blog posts get 0.6
6. The response must have `Content-Type: application/xml` header
7. Create a page at `/seo-tools` that links to the sitemap and shows the URL count

## Constraints

- No XML libraries — build the XML string manually
- The endpoint must be a GET handler in `+server.ts`
- URLs must be absolute (include the domain)
- The sitemap must be valid per the sitemaps.org protocol

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A sitemap is an XML document with a `<urlset>` root element containing `<url>` entries. Each entry has `<loc>`, `<lastmod>`, `<changefreq>`, and `<priority>` children. Return it as a `Response` with the XML content type.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Build the XML as a template string. Map your static routes and dynamic data into `<url>` blocks. Return `new Response(xml, { headers: { 'Content-Type': 'application/xml' } })`. The `lastmod` should use ISO 8601 date format.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
export const GET: RequestHandler = async () => {
  const posts = getPosts();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.map(r => `<url><loc>${BASE}${r.path}</loc>...</url>`).join('\n')}
  ${posts.map(p => `<url><loc>${BASE}/blog/${p.slug}</loc>...</url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/routes/sitemap.xml/+server.ts
import type { RequestHandler } from './$types';

const BASE_URL = 'https://ultimate-frontend.dev';

interface SitemapEntry {
  path: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

const staticRoutes: SitemapEntry[] = [
  { path: '/', lastmod: '2026-05-15', changefreq: 'weekly', priority: 1.0 },
  { path: '/about', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.8 },
  { path: '/contact', lastmod: '2026-03-15', changefreq: 'monthly', priority: 0.6 },
  { path: '/blog', lastmod: '2026-05-15', changefreq: 'daily', priority: 0.9 }
];

const blogPosts = [
  { slug: 'svelte-5-runes', lastmod: '2026-05-10' },
  { slug: 'css-layers-guide', lastmod: '2026-04-20' },
  { slug: 'typescript-strict', lastmod: '2026-03-28' },
  { slug: 'sveltekit-streaming', lastmod: '2026-05-01' },
  { slug: 'oklch-colors', lastmod: '2026-05-12' }
];

function buildUrlEntry(entry: SitemapEntry): string {
  return `  <url>
    <loc>${BASE_URL}${entry.path}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
}

export const GET: RequestHandler = async () => {
  const dynamicRoutes: SitemapEntry[] = blogPosts.map((post) => ({
    path: `/blog/${post.slug}`,
    lastmod: post.lastmod,
    changefreq: 'monthly' as const,
    priority: 0.6
  }));

  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(buildUrlEntry).join('\n')}
</urlset>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600'
    }
  });
};
```

```svelte
<!-- src/routes/seo-tools/+page.svelte -->
<script lang="ts">
  const sitemapUrl = '/sitemap.xml';
  const expectedUrls = 4 + 5; // static + dynamic
</script>

<div class="seo-tools">
  <h1>SEO Tools</h1>

  <div class="card">
    <h2>Sitemap</h2>
    <p>Your sitemap contains <strong>{expectedUrls}</strong> URLs.</p>
    <a href={sitemapUrl} target="_blank" rel="noopener" class="sitemap-link">
      View sitemap.xml
    </a>
  </div>

  <div class="card">
    <h2>Validation Checklist</h2>
    <ul class="checklist">
      <li>All URLs use absolute paths with domain</li>
      <li>lastmod dates are in ISO 8601 format</li>
      <li>Content-Type is application/xml</li>
      <li>Home page has priority 1.0</li>
      <li>Dynamic routes are included</li>
    </ul>
  </div>
</div>

<style>
  .seo-tools { max-inline-size: 36rem; margin-inline: auto; padding: var(--space-lg); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-xl); }
  .card { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-lg); margin-block-end: var(--space-md); }
  .card h2 { font-size: var(--text-lg); margin-block-end: var(--space-sm); }
  .card p { color: var(--color-text-muted); margin-block-end: var(--space-md); }
  .sitemap-link { display: inline-block; padding: var(--space-xs) var(--space-md); background: oklch(55% 0.2 250); color: white; border-radius: var(--radius-sm); text-decoration: none; font-weight: 600; }
  .checklist { padding-inline-start: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-xs); font-size: var(--text-sm); color: var(--color-text-muted); }
</style>
```

### Explanation

A dynamic sitemap ensures search engines discover all your pages, including dynamically generated ones like blog posts and product pages. Building it as a `+server.ts` endpoint means it regenerates on every request (or can be cached with `Cache-Control`). The XML format follows the sitemaps.org protocol that all major search engines support. Priority values guide crawlers toward your most important pages, and `lastmod` helps them decide when to re-crawl. In production, you would import the blog posts from a database or CMS. For very large sites (50,000+ URLs), you would implement a sitemap index that points to multiple sitemap files.
</details>
