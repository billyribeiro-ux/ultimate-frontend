// Lesson 8.9 — server load that reads values a hooks.server.ts handle() hook
// would normally populate. Because the repository does not guarantee a
// project-wide hook for requestId, we fall back to a safe computed value.

import type { PageServerLoad } from './$types';

interface LessonData {
	method: string;
	pathname: string;
	accept: string;
	requestId: string;
}

export const load: PageServerLoad = ({ request, url, locals }): LessonData => {
	const maybeId = (locals as unknown as Record<string, unknown>).requestId;
	const requestId =
		typeof maybeId === 'string' && maybeId.length > 0 ? maybeId : crypto.randomUUID();

	return {
		method: request.method,
		pathname: url.pathname,
		accept: request.headers.get('accept-language') ?? 'unknown',
		requestId
	};
};
