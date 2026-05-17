---
chunk: sitemap-endpoint
level: 2
penalty: medium
---

# Dynamic Sitemap Endpoint — Level 2 Concept Reveal

A sitemap tells search engines which URLs exist, when they last changed, and how important they are relative to each other. It is an XML document following the sitemap.org protocol.

### The +server.ts pattern

SvelteKit's `+server.ts` files export HTTP verb functions (`GET`, `POST`, etc.) that return raw `Response` objects. For a sitemap, you export a `GET` function that returns XML:

```
export async function GET({ url }: RequestEvent): Promise<Response> {
    const origin = url.origin; // e.g. "https://pe7saas.com"
    const xml = buildSitemap(origin);
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600'
        }
    });
}
```

### Building the XML

The sitemap protocol requires:

- An `<urlset>` root element with the sitemap namespace.
- One `<url>` child per page, containing `<loc>` (full absolute URL), `<lastmod>` (ISO date), optional `<changefreq>`, and optional `<priority>` (0.0 to 1.0).

Static pages have known paths. Dynamic pages require a server-side query to discover slugs and modification dates.

### Pseudocode for combining static + dynamic pages

```
function buildSitemap(origin: string, dynamicPages: { slug: string; updatedAt: Date }[]): string {
    const staticPages = [
        { path: '/', priority: '1.0', changefreq: 'weekly' },
        { path: '/dashboard', priority: '0.8', changefreq: 'daily' },
        { path: '/contact', priority: '0.5', changefreq: 'monthly' }
    ];

    const urls = [
        ...staticPages.map(p => urlEntry(origin + p.path, new Date(), p.changefreq, p.priority)),
        ...dynamicPages.map(p => urlEntry(origin + '/blog/' + p.slug, p.updatedAt, 'weekly', '0.6'))
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}
```

### Robots.txt companion

A robots.txt file tells crawlers where the sitemap lives and which paths to avoid. It is another `+server.ts` endpoint at `src/routes/robots.txt/+server.ts` returning plain text:

```
User-agent: *
Allow: /
Sitemap: https://pe7saas.com/sitemap.xml
```

### Prerendering

If all data is available at build time, you can add `export const prerender = true` to the `+server.ts` file. SvelteKit will generate the XML at build time and serve it as a static file. For truly dynamic sites, omit `prerender` and let the server generate it on each request (cached by the `Cache-Control` header).

### Connecting to the capstone

The `seo-component` chunk defines canonical URLs that must match the sitemap `<loc>` values exactly. The `page-routing-setup` chunk establishes the route structure. The `load-function-typing` chunk provides typed server queries for dynamic page data.
