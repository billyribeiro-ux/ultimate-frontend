import * as v from 'valibot';
import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { addNote, deleteNote, listNotes, updateNote } from './_lib/notes-store';

const noteSchema = v.object({
	title: v.pipe(
		v.string(),
		v.minLength(1, 'Title is required'),
		v.maxLength(100, 'Title must be 100 characters or fewer')
	),
	body: v.pipe(
		v.string(),
		v.minLength(1, 'Body is required'),
		v.maxLength(1000, 'Body must be 1000 characters or fewer')
	)
});

function collectIssues(issues: readonly v.BaseIssue<unknown>[]): { field: string; message: string }[] {
	return issues.map((i) => ({
		field: String(i.path?.[0]?.key ?? '_form'),
		message: i.message
	}));
}

export const load: ServerLoad = async () => {
	return { notes: listNotes() };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const raw = {
			title: typeof data.get('title') === 'string' ? (data.get('title') as string) : '',
			body: typeof data.get('body') === 'string' ? (data.get('body') as string) : ''
		};
		const parsed = v.safeParse(noteSchema, raw);
		if (!parsed.success) {
			return fail(400, {
				which: 'create' as const,
				values: raw,
				issues: collectIssues(parsed.issues)
			});
		}
		addNote(parsed.output.title, parsed.output.body);
		return { which: 'create' as const, ok: true };
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		const raw = {
			title: typeof data.get('title') === 'string' ? (data.get('title') as string) : '',
			body: typeof data.get('body') === 'string' ? (data.get('body') as string) : ''
		};
		if (typeof id !== 'string') {
			return fail(400, {
				which: 'update' as const,
				id: '',
				values: raw,
				issues: [{ field: '_form', message: 'Missing note id' }]
			});
		}
		const parsed = v.safeParse(noteSchema, raw);
		if (!parsed.success) {
			return fail(400, {
				which: 'update' as const,
				id,
				values: raw,
				issues: collectIssues(parsed.issues)
			});
		}
		const updated = updateNote(id, parsed.output.title, parsed.output.body);
		if (!updated) {
			return fail(404, {
				which: 'update' as const,
				id,
				values: raw,
				issues: [{ field: '_form', message: 'Note not found' }]
			});
		}
		return { which: 'update' as const, ok: true, id };
	},

	remove: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		if (typeof id !== 'string') {
			return fail(400, { which: 'remove' as const, issues: [{ field: 'id', message: 'Id required' }] });
		}
		deleteNote(id);
		return { which: 'remove' as const, ok: true };
	}
};
