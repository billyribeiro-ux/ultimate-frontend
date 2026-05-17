import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createUser } from '$lib/auth/users';

interface ValidationErrors {
	email?: string;
	name?: string;
	password?: string;
}

function validateRegistration(email: string, name: string, password: string): ValidationErrors {
	const errors: ValidationErrors = {};

	if (!name || name.trim().length < 2) {
		errors.name = 'Name must be at least 2 characters';
	}

	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errors.email = 'Please enter a valid email address';
	}

	if (!password || password.length < 8) {
		errors.password = 'Password must be at least 8 characters';
	}

	return errors;
}

export const load: PageServerLoad = async ({ locals }) => {
	return { user: locals.user };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData: FormData = await request.formData();
		const email: string = (formData.get('email') as string ?? '').trim().toLowerCase();
		const name: string = (formData.get('name') as string ?? '').trim();
		const password: string = formData.get('password') as string ?? '';

		const errors: ValidationErrors = validateRegistration(email, name, password);

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, email, name });
		}

		const user = await createUser({ email, name, password });

		if (!user) {
			return fail(400, {
				error: 'An account with that email already exists',
				email,
				name
			});
		}

		return { success: true };
	}
};
