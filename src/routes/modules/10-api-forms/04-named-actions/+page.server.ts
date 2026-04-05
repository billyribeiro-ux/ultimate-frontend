import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { addNote, deleteNote, listNotes } from './_lib/notes-store';

export const load: ServerLoad = async () => {
	return { notes: listNotes() };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const title = data.get('title');
		const body = data.get('body');
		if (typeof title !== 'string' || title.trim().length === 0) {
			return fail(400, {
				which: 'create' as const,
				title: typeof title === 'string' ? title : '',
				body: typeof body === 'string' ? body : '',
				error: 'Title is required'
			});
		}
		const note = addNote(title.trim(), typeof body === 'string' ? body.trim() : '');
		return { which: 'create' as const, ok: true, title: note.title };
	},

	remove: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		if (typeof id !== 'string') {
			return fail(400, { which: 'remove' as const, error: 'Id is required' });
		}
		const removed = deleteNote(id);
		if (!removed) {
			return fail(404, { which: 'remove' as const, error: 'Note not found' });
		}
		return { which: 'remove' as const, ok: true, id };
	}
};
