import type { PageLoad } from './$types';

export const prerender = true;

interface MarketingData {
	headline: string;
	subhead: string;
	builtAt: string;
}

export const load: PageLoad = () => {
	const data: MarketingData = {
		headline: 'Prerendered at build time',
		subhead:
			'This page is a static HTML file. No server runs for your request — the CDN edge ships the exact bytes the build produced.',
		builtAt: new Date().toISOString()
	};
	return data;
};
