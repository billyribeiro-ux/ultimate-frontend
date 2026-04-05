// Lesson 9A.2 — universal load. Receives the server load's return as
// `data` and merges it with its own field. On the initial request this
// still runs on the server; on client navigations it runs in the browser.

import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => {
	return {
		...data,
		fromUniversal: `universal load · ${new Date().toISOString()}`
	};
};
