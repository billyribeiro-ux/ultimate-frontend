import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { notes, notesTags } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allNotes = db.query.notes.findMany({
		orderBy: [desc(notes.createdAt)],
		with: {
			user: true,
			notesTags: {
				with: { tag: true }
			}
		}
	});

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

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const title = formData.get('title');
		const content = formData.get('content');

		if (Number.isNaN(id)) {
			return fail(400, { error: 'Invalid note ID' });
		}

		if (typeof title !== 'string' || title.trim().length === 0) {
			return fail(400, { error: 'Title is required' });
		}

		db.update(notes)
			.set({
				title: title.trim(),
				content: typeof content === 'string' ? content.trim() : '',
				updatedAt: new Date().toISOString()
			})
			.where(eq(notes.id, id))
			.run();

		return { updated: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		if (Number.isNaN(id)) {
			return fail(400, { error: 'Invalid note ID' });
		}

		// Transaction: delete junction rows first, then the note
		db.transaction((tx) => {
			tx.delete(notesTags).where(eq(notesTags.noteId, id)).run();
			tx.delete(notes).where(eq(notes.id, id)).run();
		});

		return { deleted: true };
	}
};
