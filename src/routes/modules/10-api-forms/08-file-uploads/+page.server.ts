import { fail, type Actions } from '@sveltejs/kit';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED: ReadonlySet<string> = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const caption = data.get('caption');
		const photo = data.get('photo');

		const captionStr = typeof caption === 'string' ? caption : '';

		if (!(photo instanceof File) || photo.size === 0) {
			return fail(400, { caption: captionStr, error: 'Photo is required' });
		}
		if (photo.size > MAX_BYTES) {
			return fail(400, { caption: captionStr, error: 'Photo must be under 5 MB' });
		}
		if (!ALLOWED.has(photo.type)) {
			return fail(400, { caption: captionStr, error: 'Only JPEG, PNG, or WebP images are allowed' });
		}

		// In production, stream the file to storage here via photo.stream().
		// await saveToBlobStorage(photo.name, photo.stream());

		return {
			ok: true as const,
			caption: captionStr,
			uploaded: {
				name: photo.name,
				size: photo.size,
				type: photo.type
			}
		};
	}
};
