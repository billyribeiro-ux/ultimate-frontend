// Lesson 9A.2 — server-only load. Returns a string that only the server
// could have produced (it uses Node's process.pid, which does not exist in
// the browser).

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return {
		fromServer: `server load · pid=${process.pid} · ${new Date().toISOString()}`
	};
};
