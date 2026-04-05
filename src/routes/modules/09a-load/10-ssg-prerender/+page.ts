// Lesson 9A.10 — prerender = true turns this route into a static HTML file
// during pnpm build. In dev the load runs normally; in a production build
// it runs once and the result is baked into the file.

import type { PageLoad } from './$types';

export const prerender = true;

interface SsgData {
	builtAt: string;
	note: string;
}

export const load: PageLoad = (): SsgData => {
	return {
		builtAt: new Date().toISOString(),
		note: 'This route is prerenderable. Run pnpm build && pnpm preview to see the frozen HTML.'
	};
};
