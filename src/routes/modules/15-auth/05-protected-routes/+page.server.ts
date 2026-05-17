import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSession } from '$lib/auth/session';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	if (!locals.user) {
		redirect(302, '/modules/15-auth/04-login');
	}

	const sessionId: string | undefined = cookies.get('session_id');
	let sessionExpiresAt: string = 'Unknown';

	if (sessionId) {
		const session = getSession(sessionId);
		if (session) {
			sessionExpiresAt = session.expiresAt.toISOString();
		}
	}

	return {
		user: locals.user,
		sessionExpiresAt
	};
};
