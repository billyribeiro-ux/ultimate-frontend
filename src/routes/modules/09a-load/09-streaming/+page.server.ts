// Lesson 9A.9 — server load that returns a fast awaited value and a slow
// un-awaited promise. SvelteKit streams the slow one after the HTML starts.

import type { PageServerLoad } from './$types';

interface Fast {
	message: string;
	at: string;
}

interface Slow {
	computed: number;
	sleptMs: number;
}

export const load: PageServerLoad = (): { fast: Fast; slow: Promise<Slow> } => {
	const fast: Fast = {
		message: 'this part is instant — it was in the first HTML chunk',
		at: new Date().toISOString()
	};

	const sleptMs = 1200;
	const slow: Promise<Slow> = new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				computed: Math.round(Math.random() * 1000),
				sleptMs
			});
		}, sleptMs);
	});

	return { fast, slow };
};
