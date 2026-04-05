// Lesson 9A.5 — page load that reads layout data via parent()
// and returns an extra field merged into the final data prop.

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { preferences } = await parent();
	return {
		greeting: `Hello from the page load — your locale is ${preferences.locale}`
	};
};
