// Lesson 9A.5 — layout load that provides shared "preferences" data.

import type { LayoutLoad } from './$types';

interface Preferences {
	accent: string;
	locale: string;
}

export const load: LayoutLoad = (): { preferences: Preferences } => {
	return {
		preferences: {
			accent: 'oklch(70% 0.2 15)',
			locale: 'en-GB'
		}
	};
};
