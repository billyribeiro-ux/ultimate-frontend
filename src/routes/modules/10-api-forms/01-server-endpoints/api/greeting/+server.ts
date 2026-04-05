import { json, error, type RequestHandler } from '@sveltejs/kit';

interface GreetingResponse {
	readonly message: string;
	readonly at: string;
}

export const GET: RequestHandler = async ({ url }) => {
	const name = url.searchParams.get('name');
	if (!name || name.trim().length === 0) {
		error(400, 'Query parameter "name" is required.');
	}
	const body: GreetingResponse = {
		message: `Hello, ${name}!`,
		at: new Date().toISOString()
	};
	return json(body);
};
