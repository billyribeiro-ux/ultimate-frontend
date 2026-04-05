// Lesson 9A.1 — the simplest possible universal load function.
// Inline data only. No fetch, no server-only code.

import type { PageLoad } from './$types';

interface Post {
	title: string;
	body: string;
	publishedAt: string;
}

export const load: PageLoad = (): { post: Post } => {
	const post: Post = {
		title: 'Load functions, explained',
		body: 'This post was returned from +page.ts. Because the load function is universal, SvelteKit ran it on the server for the first render and will run it in the browser on client-side navigations.',
		publishedAt: '2026-04-05'
	};

	return { post };
};
