import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { findUserByEmail } from '$lib/auth/users';
import { verifyPassword } from '$lib/auth/password';
import { createSession } from '$lib/auth/session';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/modules/15-auth/05-protected-routes');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData: FormData = await request.formData();
		const email: string = (formData.get('email') as string ?? '').trim().toLowerCase();
		const password: string = formData.get('password') as string ?? '';

		if (!email || !password) {
			return fail(400, { error: 'Please fill in all fields', email });
		}

		const user = findUserByEmail(email);

		if (!user) {
			return fail(400, { error: 'Invalid email or password', email });
		}

		const isValid: boolean = await verifyPassword(password, user.passwordHash);

		if (!isValid) {
			return fail(400, { error: 'Invalid email or password', email });
		}

		const session = createSession(user.id);

		cookies.set('session_id', session.id, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24
		});

		redirect(302, '/modules/15-auth/05-protected-routes');
	}
};
