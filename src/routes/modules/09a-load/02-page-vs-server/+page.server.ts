// Lesson 9A.2 — server-only load. Returns a string that only the server
// could have produced (it uses crypto.randomUUID(), which proves this ran
// on the server, not in the browser).

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return {
		fromServer: `server load · id=${crypto.randomUUID()} · ${new Date().toISOString()}`
	};
};
