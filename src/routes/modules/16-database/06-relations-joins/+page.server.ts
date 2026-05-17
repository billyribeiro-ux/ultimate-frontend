import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { notes, tags, notesTags } from '$lib/server/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allNotes = db.query.notes.findMany({
		orderBy: [desc(notes.createdAt)],
		with: {
			user: true,
			notesTags: {
				with: {
					tag: true
				}
			}
		}
	});

	const allTags = db.select().from(tags).all();

	return { notes: allNotes, tags: allTags };
};

export const actions: Actions = {
	createTag: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name');

		if (typeof name !== 'string' || name.trim().length === 0) {
			return fail(400, { error: 'Tag name is required' });
		}

		try {
			db.insert(tags).values({ name: name.trim().toLowerCase() }).run();
		} catch {
			return fail(400, { error: 'Tag already exists' });
		}

		return { tagCreated: true };
	},

	assignTag: async ({ request }) => {
		const formData = await request.formData();
		const noteId = Number(formData.get('noteId'));
		const tagId = Number(formData.get('tagId'));

		if (Number.isNaN(noteId) || Number.isNaN(tagId)) {
			return fail(400, { error: 'Invalid note or tag ID' });
		}

		// Check if already assigned
		const existing = db.select().from(notesTags)
			.where(and(eq(notesTags.noteId, noteId), eq(notesTags.tagId, tagId)))
			.get();

		if (existing) {
			return fail(400, { error: 'Tag already assigned to this note' });
		}

		db.insert(notesTags).values({ noteId, tagId }).run();
		return { tagAssigned: true };
	}
};
