import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { addNote, deleteNote, listNotes } from './_lib/notes-store';

export const load: ServerLoad = async () => {
	return { notes: listNotes() };
};

export const actions: Actions = {
	create: async ({ request }) => {
		// Simulate a little latency so students can see the pending state.
		await new Promise((r) => setTimeout(r, 300));
		const data = await request.formData();
		const title = data.get('title');
		const body = data.get('body');
		if (typeof title !== 'string' || title.trim().length === 0) {
			return fail(400, {
				which: 'create' as const,
				title: '',
				body: typeof body === 'string' ? body : '',
				error: 'Title is required'
			});
		}
		const note = addNote(title.trim(), typeof body === 'string' ? body.trim() : '');
		return { which: 'create' as const, ok: true, title: note.title };
	},

	remove: async ({ request }) => {
		await new Promise((r) => setTimeout(r, 200));
		const data = await request.formData();
		const id = data.get('id');
		if (typeof id !== 'string') {
			return fail(400, { which: 'remove' as const, error: 'Id is required' });
		}
		deleteNote(id);
		return { which: 'remove' as const, ok: true };
	}
};
