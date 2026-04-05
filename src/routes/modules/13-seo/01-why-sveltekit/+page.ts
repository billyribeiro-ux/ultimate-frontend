import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	const renderedAt: string = new Date().toISOString();
	return { renderedAt };
};
