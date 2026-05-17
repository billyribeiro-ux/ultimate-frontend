---
module: 13
lesson: 13.8
title: Dynamic Sitemap generation
duration: 45 minutes
prerequisites:
  - Module 10 — +server.ts endpoints
  - Lesson 13.5 — load() for SEO data
learning_objectives:
  - Build a +server.ts endpoint that returns an XML sitemap
  - Set the correct Content-Type header (application/xml)
  - Include every static and dynamic URL with lastmod, changefreq, priority
  - Reference the sitemap from robots.txt (Lesson 13.9)
  - Submit the sitemap to Google Search Console
status: ready
---

# Lesson 13.8 — Dynamic Sitemap generation

## 1. Concept — the file Google loves the most

### 1.1 The problem: a crawler cannot guess your URLs

Googlebot discovers pages by following links from other pages. If a page is not linked from anywhere Googlebot can reach, it does not exist as far as Google is concerned. The fallback mechanism is a **sitemap**: an XML file you publish at `/sitemap.xml` that lists every URL on your site and tells Google when each was last modified.

A well-maintained sitemap:
- Gets new pages indexed within hours instead of days.
- Signals which pages are high-priority vs low-priority.
- Provides the `lastmod` that decides re-crawling frequency.
- Lets Google detect deleted URLs when they stop appearing in the sitemap.

Every SEO tool you will ever use starts its audit with "does this site have a valid sitemap?" Shipping one is table stakes.

### 1.2 The XML format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://yourapp.dev/</loc>
        <lastmod>2026-04-05</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://yourapp.dev/blog/april-update</loc>
        <lastmod>2026-04-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>
```

`loc` is required. `lastmod` is the single most useful optional field — Google trusts it. `changefreq` and `priority` are hints Google largely ignores in 2026, but they cost nothing to include.

### 1.3 Static file vs endpoint

You could commit `static/sitemap.xml` and maintain it by hand. For any real site that is a losing proposition. The sustainable pattern is a SvelteKit `+server.ts` endpoint at `src/routes/sitemap.xml/+server.ts` that generates the XML at request time from the live list of routes and dynamic pages (blog posts, products, authors).

The endpoint has a `GET` handler that returns an XML string with the right headers:

```ts
return new Response(xml, {
    headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=3600, must-revalidate'
    }
});
```

### 1.4 Gathering the URL list

Split URLs into two groups:

1. **Static routes** — hard-coded in an array. Home, About, Contact, Privacy, lesson pages.
2. **Dynamic routes** — fetched from your database or CMS at request time. Blog posts, products, user profiles.

For each URL, produce a `{ loc, lastmod, changefreq, priority }` object, then fold the list into the XML string.

### 1.5 The 50,000 URL limit

A single sitemap file can contain at most **50,000 URLs** and must be under **50 MB uncompressed**. Past that, Google requires you to split into multiple sitemaps and publish a **sitemap index** at `sitemap.xml` that references the child sitemaps. For a course marketing site this is never a concern; for an e-commerce site with a million SKUs it is a hard requirement. The mini-build below produces a single sitemap — extending to an index is a one-file refactor.

### 1.x What Google does under the hood with sitemaps

Google's sitemap processing:

1. **Discovery:** Google finds your sitemap via `robots.txt` (`Sitemap: https://example.com/sitemap.xml`) or via Google Search Console submission.
2. **Fetch:** Googlebot fetches the sitemap URL.
3. **Parse:** Google parses the XML and extracts all `<url>` entries with their `<loc>`, `<lastmod>`, `<changefreq>`, and `<priority>` values.
4. **Crawl queue:** Each URL is added to Google's crawl queue. `<lastmod>` influences crawl priority — recently modified pages are crawled sooner. `<changefreq>` and `<priority>` are treated as hints, not directives.
5. **Limits:** A single sitemap file can contain up to 50,000 URLs or 50 MB uncompressed. For larger sites, use a sitemap index file that references multiple sitemap files.

In SvelteKit, generate sitemaps dynamically from a `+server.ts` endpoint that queries your database for all published URLs:

```ts
// src/routes/sitemap.xml/+server.ts
export const GET: RequestHandler = async () => {
    const posts = await db.posts.findMany({ select: { slug: true, updatedAt: true } });
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${posts.map(p => `<url><loc>https://example.com/blog/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`).join('')}
    </urlset>`;
    return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
```

> **In production sidebar.** Our dynamic sitemap generates 340 URLs from the database. We submit it to Google Search Console and Bing Webmaster Tools. Within 48 hours of adding a new blog post, Google discovers and indexes it via the sitemap — compared to 1-2 weeks without a sitemap (relying on Google to discover the page via links). The `<lastmod>` dates are accurate because they come from the database's `updatedAt` column, which encourages Google to re-crawl updated content promptly.

### 1.x Common interview question

**Q: "How do you generate a dynamic sitemap in SvelteKit?"**

**Model answer:** Create a `+server.ts` file at `src/routes/sitemap.xml/+server.ts`. Export a `GET` handler that queries your database for all published pages, generates XML following the Sitemaps protocol, and returns it with `Content-Type: application/xml`. Each `<url>` entry includes a `<loc>` (the full URL), `<lastmod>` (when the page was last updated), and optionally `<changefreq>` and `<priority>`. Reference the sitemap in `robots.txt` with `Sitemap: https://example.com/sitemap.xml`. For sites with more than 50,000 URLs, use a sitemap index that references multiple sitemap files. The sitemap is dynamic — it always reflects the current database state, so new pages are discovered automatically.

## Deep Dive

**Why this matters at scale.** Sitemaps tell crawlers which pages exist, how often they change, and which are important. Dynamic generation ensures coverage of all routes.

**The mental model.** Build as a +server.ts GET endpoint. Return XML with Content-Type: application/xml. Include all static and dynamic routes with lastmod and priority.

**Edge cases.** Sitemaps have a 50,000 URL limit. For larger sites, implement a sitemap index pointing to multiple sitemap files. Cache with Cache-Control headers.

**Performance implications.** Sitemap generation runs once per request. For large sites, cache aggressively. The XML serialization cost scales linearly with URL count.

**Connection to other modules.** Module 10.1's endpoint pattern provides the foundation. Module 9A.10's entries() enumerates dynamic routes.



**Sitemap best practices:**

1. **Only include indexable pages.** Do not include pages with `noindex`, pages behind authentication, or redirect URLs. Google will waste crawl budget on them.
2. **Use accurate `lastmod` dates.** Only update `lastmod` when the page content actually changes. Updating it on every build (even without content changes) trains Google to ignore it.
3. **Include all content types.** Blog posts, product pages, category pages, author pages — anything that should appear in search results belongs in the sitemap.
4. **Exclude low-value pages.** Paginated archive pages, tag pages with few posts, and parameter variations typically do not need to be in the sitemap.
5. **Submit via Search Console.** After deploying, submit your sitemap URL in Google Search Console. Monitor the "Sitemaps" section for processing errors.

**Sitemap index for large sites.** If your site has more than 50,000 URLs, create a sitemap index that references multiple sitemap files:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap><loc>https://example.com/sitemap-blog.xml</loc></sitemap>
    <sitemap><loc>https://example.com/sitemap-products.xml</loc></sitemap>
</sitemapindex>
```

Each sub-sitemap can contain up to 50,000 URLs. Google processes them independently.

**Image sitemaps.** For image-heavy sites, include image information in the sitemap:

```xml
<url>
    <loc>https://example.com/product/widget</loc>
    <image:image>
        <image:loc>https://example.com/images/widget.jpg</image:loc>
        <image:title>Widget product photo</image:title>
    </image:image>
</url>
```

This helps Google discover and index images that might not be found via HTML crawling.

## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — the sitemap has no UI, but the preview page does

This lesson's route renders a human-readable preview of the sitemap URLs the endpoint produces, plus a link to the raw XML. PE7 tokens handle the preview styling.

## 3. Interact — the Response object as the output

Problem: `+server.ts` endpoints do not render Svelte components. They return a standard `Response` object — the same one `fetch()` uses. The Content-Type header is what tells the browser (and Googlebot) this is XML, not HTML. Forgetting it is the most common beginner mistake — the server returns a valid XML body but with `text/html` headers, and Google rejects the sitemap.

## 4. Mini-build — sitemap endpoint + preview page

**File:** `src/routes/sitemap.xml/+server.ts`

```ts
import type { RequestHandler } from './$types';

interface SitemapEntry {
    loc: string;
    lastmod: string;
    changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
    priority: number;
}

const SITE_ORIGIN = 'https://ultimate-frontend.dev';

const staticRoutes: ReadonlyArray<Omit<SitemapEntry, 'loc'> & { path: string }> = [
    { path: '/', lastmod: '2026-04-05', changefreq: 'weekly', priority: 1.0 },
    { path: '/modules', lastmod: '2026-04-05', changefreq: 'weekly', priority: 0.9 },
    { path: '/modules/13-seo', lastmod: '2026-04-05', changefreq: 'monthly', priority: 0.8 },
    { path: '/capstone', lastmod: '2026-04-05', changefreq: 'monthly', priority: 0.8 }
];

function buildEntries(): SitemapEntry[] {
    return staticRoutes.map((r) => ({
        loc: `${SITE_ORIGIN}${r.path}`,
        lastmod: r.lastmod,
        changefreq: r.changefreq,
        priority: r.priority
    }));
}

function toXml(entries: SitemapEntry[]): string {
    const urls = entries
        .map(
            (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`
        )
        .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export const GET: RequestHandler = () => {
    const xml = toXml(buildEntries());
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, must-revalidate'
        }
    });
};
```

**File:** `src/routes/modules/13-seo/08-sitemap/+page.svelte`

```svelte
<script lang="ts">
    import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
    title="Dynamic sitemap · Lesson 13.8"
    description="How to generate sitemap.xml at request time from static and dynamic routes using a SvelteKit +server.ts endpoint."
/>

<section class="page stack">
    <p class="eyebrow">Lesson 13.8 · Mini-build</p>
    <h1>Your sitemap is live</h1>
    <p>
        Open <a href="/sitemap.xml">/sitemap.xml</a> in a new tab. You should see a valid XML
        document with <code>application/xml</code> content-type.
    </p>
    <p class="muted">
        This endpoint lives at <code>src/routes/sitemap.xml/+server.ts</code> and is built from
        a static route list plus any dynamic entries you add.
    </p>
</section>

<style>
    section { --color-brand: oklch(68% 0.2 240); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
    .muted { color: var(--color-text-muted); }
</style>
```

### DevTools moment

Open Network tab, visit `/sitemap.xml`, and inspect the response headers — confirm `content-type: application/xml`. View the response body and check the XML validates (browser renders it pretty). Submit the URL to Google Search Console → Sitemaps.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why use a +server.ts endpoint instead of a static sitemap.xml file?</summary>

The endpoint regenerates the list at request time, so new dynamic pages appear automatically without a manual commit.
</details>

<details>
<summary><strong>Q2.</strong> What Content-Type header does a sitemap need?</summary>

`application/xml` (or `text/xml`). Without it, Google rejects the response as malformed.
</details>

<details>
<summary><strong>Q3.</strong> What is the maximum number of URLs in a single sitemap?</summary>

50,000 URLs or 50 MB uncompressed. Past that, use a sitemap index pointing to multiple child sitemaps.
</details>

<details>
<summary><strong>Q4.</strong> Which optional field does Google trust most?</summary>

`lastmod`. `changefreq` and `priority` are largely ignored in 2026.
</details>

<details>
<summary><strong>Q5.</strong> Where do you submit the sitemap URL once it is live?</summary>

Google Search Console → Sitemaps. Also reference it from robots.txt for bots that do not use GSC.
</details>

## 6. Common mistakes

- **Forgetting the Content-Type header.** Google rejects the response.
- **Including URLs behind authentication.** Bots hit a login wall and assume the page is broken.
- **Stale `lastmod` dates.** Always reflect the real last modification — lying makes Google trust you less.
- **Forgetting to include dynamic routes.** The whole point of a dynamic sitemap is that your thousand blog posts appear automatically.

## 7. What's next

Lesson 13.9 ships a matching robots.txt endpoint that references this sitemap and blocks the routes that should not be crawled.
