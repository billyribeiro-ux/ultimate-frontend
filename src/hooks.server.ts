import type { Handle } from '@sveltejs/kit';
import { getSession } from '$lib/auth/session';
import { findUserById } from '$lib/auth/users';
import { toSafeUser } from '$lib/auth/types';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId: string | undefined = event.cookies.get('session_id');

	if (sessionId) {
		const session = getSession(sessionId);
		if (session) {
			const user = findUserById(session.userId);
			if (user) {
				event.locals.user = toSafeUser(user);
			}
		}
	}

	if (!event.locals.user) {
		event.locals.user = null;
	}

	return resolve(event);
};
