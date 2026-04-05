import * as v from 'valibot';
import { form } from '$app/server';

const schema = v.object({
	caption: v.pipe(v.string(), v.maxLength(120, 'Caption must be 120 characters or fewer')),
	photo: v.pipe(
		v.file('A photo is required'),
		v.mimeType(
			['image/jpeg', 'image/png', 'image/webp'],
			'Only JPEG, PNG, or WebP images are allowed'
		),
		v.maxSize(5 * 1024 * 1024, 'Photo must be under 5 MB')
	)
});

export interface UploadRecord {
	readonly id: string;
	readonly caption: string;
	readonly bytes: number;
	readonly type: string;
	readonly uploadedAt: Date;
}

// Module-level log. Resets on dev reload. Replace with object storage in production.
const uploads: UploadRecord[] = [];

export const uploadPhoto = form(schema, async ({ caption, photo }) => {
	// Simulate a little server-side work.
	await new Promise((r) => setTimeout(r, 300));
	const record: UploadRecord = {
		id: crypto.randomUUID(),
		caption,
		bytes: photo.size,
		type: photo.type,
		uploadedAt: new Date()
	};
	uploads.push(record);
	return { ok: true as const, count: uploads.length, last: record };
});
