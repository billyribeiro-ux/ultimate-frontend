import { db } from '$lib/server/db';
import { notes } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allNotes = await db.query.notes.findMany({
		orderBy: [desc(notes.createdAt)],
		with: {
			user: true
		}
	});

	return {
		notes: allNotes,
		totalCount: allNotes.length
	};
};
