---
chunk: sitemap-endpoint
level: 3
penalty: high
---

# Dynamic Sitemap Endpoint — Level 3 Code Reveal

**`src/routes/sitemap.xml/+server.ts`**

```ts
import type { RequestHandler } from './$types';

interface SitemapEntry {
	loc: string;
	lastmod: string;
	changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority: string;
}

const STATIC_PAGES: { path: string; changefreq: SitemapEntry['changefreq']; priority: string }[] = [
	{ path: '/', changefreq: 'weekly', priority: '1.0' },
	{ path: '/dashboard', changefreq: 'daily', priority: '0.8' },
	{ path: '/contact', changefreq: 'monthly', priority: '0.5' }
];

function toISODate(date: Date): string {
	return date.toISOString().split('T')[0];
}

function escapeXml(str: string): string {
	return str
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function renderEntry(entry: SitemapEntry): string {
	return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
}

export const GET: RequestHandler = async ({ url, fetch }) => {
	const origin = url.origin;
	const now = toISODate(new Date());

	// Static pages
	const staticEntries: SitemapEntry[] = STATIC_PAGES.map((page) => ({
		loc: `${origin}${page.path}`,
		lastmod: now,
		changefreq: page.changefreq,
		priority: page.priority
	}));

	// Dynamic pages — fetch from internal API
	let dynamicEntries: SitemapEntry[] = [];
	try {
		const res = await fetch('/api/pages');
		if (res.ok) {
			const pages: { slug: string; updatedAt: string }[] = await res.json();
			dynamicEntries = pages.map((page) => ({
				loc: `${origin}/blog/${page.slug}`,
				lastmod: toISODate(new Date(page.updatedAt)),
				changefreq: 'weekly' as const,
				priority: '0.6'
			}));
		}
	} catch {
		// If dynamic data fails, serve sitemap with static pages only.
	}

	const allEntries = [...staticEntries, ...dynamicEntries];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.map(renderEntry).join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

export const prerender = false;
```

**`src/routes/robots.txt/+server.ts`**

```ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const origin = url.origin;

	const body = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${origin}/sitemap.xml`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain'
		}
	});
};
```
