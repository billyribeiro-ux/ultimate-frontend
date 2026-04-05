import type { RequestHandler } from './$types';

const SITE_ORIGIN = 'https://ultimate-frontend.dev';

const body: string = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth
Disallow: /api

User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;

export const GET: RequestHandler = () => {
	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, must-revalidate'
		}
	});
};
