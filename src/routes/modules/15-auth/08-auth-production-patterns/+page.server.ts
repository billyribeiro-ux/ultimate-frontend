import type { PageServerLoad } from './$types';
import { getSession } from '$lib/auth/session';

const MAX_ATTEMPTS: number = 5;

export const load: PageServerLoad = async ({ locals, cookies, getClientAddress }) => {
	let sessionExpiresAt: string | null = null;

	const sessionId: string | undefined = cookies.get('session_id');
	if (sessionId) {
		const session = getSession(sessionId);
		if (session) {
			sessionExpiresAt = session.expiresAt.toISOString();
		}
	}

	return {
		user: locals.user,
		sessionExpiresAt,
		loginAttemptsRemaining: MAX_ATTEMPTS, // Fresh page load = no failed attempts tracked here
		maxAttempts: MAX_ATTEMPTS,
		csrfProtected: true
	};
};
