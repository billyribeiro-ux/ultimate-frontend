import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	if (url.searchParams.has('legacy')) {
		redirect(301, '/modules/13-seo/13-canonical');
	}
	return { ref: url.searchParams.get('ref') };
};
