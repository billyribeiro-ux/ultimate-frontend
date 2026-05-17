import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteSession } from '$lib/auth/session';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		user: locals.user
	};
};

export const actions: Actions = {
	default: async ({ cookies }) => {
		const sessionId: string | undefined = cookies.get('session_id');

		if (sessionId) {
			deleteSession(sessionId);
		}

		cookies.delete('session_id', { path: '/' });

		redirect(302, '/modules/15-auth/04-login');
	}
};
