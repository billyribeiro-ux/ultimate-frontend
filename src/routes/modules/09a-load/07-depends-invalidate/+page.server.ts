// Lesson 9A.7 — server load that registers a custom dependency key.
// Call invalidate('app:lesson-9a-7') from the page to re-run this function
// without a full page reload.

import type { PageServerLoad } from './$types';

interface RandomPayload {
	value: number;
	at: string;
}

export const load: PageServerLoad = ({ depends }): RandomPayload => {
	depends('app:lesson-9a-7');
	return {
		value: Math.random(),
		at: new Date().toISOString()
	};
};
