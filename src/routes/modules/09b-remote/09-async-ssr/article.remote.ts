import { query } from '$app/server';

export interface Article {
	readonly title: string;
	readonly body: string;
	readonly publishedAt: Date;
}

export const getArticle = query(async (): Promise<Article> => {
	// Simulate a real-world delay so the skeleton is visible on a fast connection.
	await new Promise((r) => setTimeout(r, 350));
	return {
		title: 'Async SSR in Svelte 5',
		body: 'When experimental.async is enabled, top-level await inside a component becomes a first-class citizen. SvelteKit suspends server-side rendering until the value resolves, then streams the HTML. Until the flag is stable, the {#await} block + <svelte:boundary pending={...}> combination is the conservative default — and the code in this component is exactly that.',
		publishedAt: new Date('2026-04-04T12:00:00Z')
	};
});
