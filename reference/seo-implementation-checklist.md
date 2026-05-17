# SEO Implementation Checklist

## &lt;svelte:head&gt; Requirements Per Page Type

### Every Page (minimum)

```svelte
<svelte:head>
  <title>{pageTitle} | Site Name</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
</svelte:head>
```

### Article/Blog Page

```svelte
<svelte:head>
  <title>{post.title} | Blog</title>
  <meta name="description" content={post.excerpt} />
  <meta name="author" content={post.author} />
  <meta name="published_time" content={post.publishedAt} />
  <link rel="canonical" href={`https://example.com/blog/${post.slug}`} />
</svelte:head>
```

### Product Page — add price, availability, reviews structured data.

### Home Page — add Organization schema + site name.

## Open Graph Tags

| Tag | Required | Example |
|-----|----------|---------|
| `og:title` | Yes | Page title (may differ from `<title>`) |
| `og:description` | Yes | 1-2 sentence summary |
| `og:image` | Yes | Absolute URL, 1200x630px minimum |
| `og:url` | Yes | Canonical URL |
| `og:type` | Yes | `website`, `article`, `product` |
| `og:site_name` | Optional | Brand name |
| `og:locale` | Optional | `en_US` |
| `article:published_time` | Optional | ISO 8601 date |
| `article:author` | Optional | Author URL or name |

```svelte
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={`https://example.com/og/${slug}.png`} />
<meta property="og:url" content={canonicalUrl} />
<meta property="og:type" content="article" />
```

## Twitter Card Configuration

```svelte
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImageUrl} />
<meta name="twitter:site" content="@yourbrand" />
<meta name="twitter:creator" content="@authorhandle" />
```

| Card Type | Image Size | Use |
|-----------|-----------|-----|
| `summary` | 120x120px min | Short posts, profiles |
| `summary_large_image` | 1200x630px | Articles, products, landing pages |

## JSON-LD Schemas by Page Type

### Article

```svelte
{@html `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "image": ogImage,
  "datePublished": publishedAt,
  "dateModified": updatedAt,
  "author": { "@type": "Person", "name": authorName }
})}</script>`}
```

### Course

```json
{ "@type": "Course", "name": "", "description": "", "provider": { "@type": "Organization", "name": "" } }
```

### FAQ

```json
{ "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "?", "acceptedAnswer": { "@type": "Answer", "text": "" } }] }
```

### Organization

```json
{ "@type": "Organization", "name": "", "url": "", "logo": "", "sameAs": ["twitter", "github"] }
```

### BreadcrumbList

```json
{ "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com" }] }
```

### Product

```json
{ "@type": "Product", "name": "", "image": "", "offers": { "@type": "Offer", "price": "", "priceCurrency": "USD" } }
```

## Sitemap Requirements

```xml
<!-- static/sitemap.xml or generated via +server.ts -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

| Priority | Pages |
|----------|-------|
| 1.0 | Home |
| 0.8 | Category/section pages |
| 0.6 | Individual content pages |
| 0.4 | Archive, tag pages |
| 0.2 | Legal, privacy |

### Dynamic Sitemap (src/routes/sitemap.xml/+server.ts)

```ts
export const GET = async () => {
  const posts = await db.posts.findMany();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts.map(p => `<url><loc>https://example.com/blog/${p.slug}</loc><lastmod>${p.updatedAt}</lastmod></url>`).join('')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
```

## robots.txt Template

```txt
# static/robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /preview/

Sitemap: https://example.com/sitemap.xml
```

## Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s–4.0s | > 4.0s |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1–0.25 | > 0.25 |
| **INP** (Interaction to Next Paint) | < 200ms | 200ms–500ms | > 500ms |

### Optimization Checklist

- [ ] Preload LCP image: `<link rel="preload" as="image" href={heroImg} />`
- [ ] Set explicit dimensions on images/video (prevents CLS)
- [ ] Use `loading="lazy"` on below-fold images
- [ ] Use `fetchpriority="high"` on hero image
- [ ] Minimize main-thread blocking JS (code-split, defer)
- [ ] Avoid layout shifts from web fonts (use `font-display: swap` + size-adjust)

## Prerender vs SSR Decision Tree

| Condition | Use |
|-----------|-----|
| Content same for all users | `prerender = true` (SSG) |
| Content changes per user/request | SSR (default) |
| Content changes rarely (< daily) | SSG + rebuild trigger |
| Page has form actions | SSR (actions need server) |
| Page is behind auth | SSR with `ssr = true` or CSR with `ssr = false` |
| Marketing/docs/blog | `prerender = true` |

## Canonical URL Rules

1. Always include `<link rel="canonical">` on every page
2. Self-referencing canonical on unique pages
3. Point paginated pages to the main page (or use `rel="next"/"prev"`)
4. HTTPS version is always canonical
5. Choose trailing slash or not — be consistent (`trailingSlash` config)
6. Parameters like `?utm_source` should NOT change canonical

```ts
// Helper in +layout.server.ts
export const load = async ({ url }) => {
  const canonical = `https://example.com${url.pathname}`;
  return { canonical };
};
```

## Google Search Console Setup

1. Verify ownership (DNS TXT record, HTML file, or meta tag)
2. Submit sitemap URL
3. Check Coverage report for errors
4. Monitor Core Web Vitals report
5. Set preferred domain (www vs non-www)
6. Set international targeting (if applicable)
7. Monitor Manual Actions (penalties)
8. Use URL Inspection for individual page indexing status

## Common Mistakes

- **Duplicate `<title>` tags** — SvelteKit layouts and pages can both set title; only one should.
- **Missing canonical on paginated content** — search engines see duplicates.
- **`og:image` with relative URL** — must be absolute (`https://...`); relative paths won't render previews.
- **Blocking CSS/JS in robots.txt** — Googlebot needs to render the page; only block private routes.
- **No `description` meta** — Google may auto-generate one, but it's usually worse.
- **JSON-LD syntax errors** — validate with Google Rich Results Test before deploy.
- **Prerendering dynamic content** — stale data if content changes; use SSR or rebuild hooks.
- **Ignoring mobile rendering** — Google uses mobile-first indexing; test mobile viewport.
