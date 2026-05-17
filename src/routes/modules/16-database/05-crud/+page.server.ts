import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { notes } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allNotes = db.select().from(notes).orderBy(desc(notes.createdAt)).all();
	return { notes: allNotes };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title');
		const content = formData.get('content');

		if (typeof title !== 'string' || title.trim().length === 0) {
			return fail(400, {
				error: 'Title is required',
				title: typeof title === 'string' ? title : '',
				content: typeof content === 'string' ? content : ''
			});
		}

		const inserted = db.insert(notes).values({
			title: title.trim(),
			content: typeof content === 'string' ? content.trim() : '',
			userId: 1
		}).returning().get();

		return { success: true, noteId: inserted.id };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		if (Number.isNaN(id)) {
			return fail(400, { error: 'Invalid note ID' });
		}

		db.delete(notes).where(eq(notes.id, id)).run();
		return { deleted: true };
	}
};
