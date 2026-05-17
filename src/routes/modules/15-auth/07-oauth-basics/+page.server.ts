import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createUser, findUserByEmail } from '$lib/auth/users';
import { createSession } from '$lib/auth/session';
import { toSafeUser } from '$lib/auth/types';

/**
 * Mock OAuth provider simulation.
 * In production, you would redirect to a real provider (Google, GitHub, etc.)
 * and handle the callback with the authorization code exchange.
 */

const MOCK_OAUTH_USER = {
	email: 'oauth-user@mock-provider.example',
	name: 'OAuth Demo User'
};

export const load: PageServerLoad = async ({ locals }) => {
	return {
		user: locals.user,
		oauthComplete: locals.user?.email === MOCK_OAUTH_USER.email
	};
};

export const actions: Actions = {
	initiate: async ({ cookies }) => {
		// In production: redirect to provider's authorization URL
		// For teaching: simulate the entire flow server-side

		// Step 1: Generate state parameter (CSRF protection)
		const state: string = crypto.randomUUID();
		cookies.set('oauth_state', state, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 10 // 10 minutes
		});

		// Steps 2-5: Simulated (in production these are separate HTTP calls)
		// The mock provider "returns" a user profile
		let user = findUserByEmail(MOCK_OAUTH_USER.email);

		if (!user) {
			user = await createUser({
				email: MOCK_OAUTH_USER.email,
				name: MOCK_OAUTH_USER.name,
				password: crypto.randomUUID() // Random password — OAuth users don't use passwords
			});
		}

		if (!user) {
			return fail(500, { error: 'Failed to create OAuth user' });
		}

		// Step 6: Create session (same as credential login)
		const session = createSession(user.id);

		cookies.set('session_id', session.id, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24
		});

		// Clean up the state cookie
		cookies.delete('oauth_state', { path: '/' });

		redirect(302, '/modules/15-auth/07-oauth-basics');
	}
};
