import type { RequestHandler } from './$types';

interface SitemapEntry {
	loc: string;
	lastmod: string;
	changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
	priority: number;
}

const SITE_ORIGIN = 'https://ultimate-frontend.dev';

const staticRoutes: ReadonlyArray<{
	path: string;
	lastmod: string;
	changefreq: SitemapEntry['changefreq'];
	priority: number;
}> = [
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
