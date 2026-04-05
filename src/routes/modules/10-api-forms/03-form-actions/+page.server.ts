import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { addNote, listNotes } from './_lib/notes-store';

export const load: ServerLoad = async () => {
	return { notes: listNotes() };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const title = data.get('title');
		const body = data.get('body');

		if (typeof title !== 'string' || title.trim().length === 0) {
			return fail(400, {
				title: typeof title === 'string' ? title : '',
				body: typeof body === 'string' ? body : '',
				missing: 'title' as const
			});
		}
		if (typeof body !== 'string') {
			return fail(400, { title, body: '', missing: 'body' as const });
		}

		const note = addNote(title.trim(), body.trim());
		return { created: note.id, title: note.title };
	}
};
