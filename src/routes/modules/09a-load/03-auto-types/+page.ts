// Lesson 9A.3 — a strongly typed load. The TypeDemo interface is local to
// this file; the component will pick it up via the generated PageProps.

import type { PageLoad } from './$types';

interface TypeDemo {
	name: string;
	tags: readonly string[];
	size: number;
}

export const load: PageLoad = (): { demo: TypeDemo } => {
	return {
		demo: {
			name: 'auto-generated $types',
			tags: ['sveltekit', 'typescript', 'load'],
			size: 42
		}
	};
};
