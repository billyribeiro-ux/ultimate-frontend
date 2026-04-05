import * as v from 'valibot';
import { query, command } from '$app/server';

export interface Note {
	readonly id: string;
	readonly text: string;
	readonly createdAt: Date;
}

// Module-level store. Resets on dev reload. Replace with a database in production.
let notes: Note[] = [
	{ id: 'seed-1', text: 'Commands are for JS-only mutations.', createdAt: new Date('2026-04-01') },
	{ id: 'seed-2', text: 'Prefer form when the user could submit without JS.', createdAt: new Date('2026-04-02') }
];

export const listNotes = query(async (): Promise<Note[]> => {
	return [...notes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
});

export const addNote = command(
	v.pipe(v.string(), v.minLength(1, 'Note cannot be empty'), v.maxLength(200, 'Keep it under 200 chars')),
	async (text): Promise<Note> => {
		const note: Note = {
			id: crypto.randomUUID(),
			text,
			createdAt: new Date()
		};
		notes = [note, ...notes];
		await listNotes().refresh();
		return note;
	}
);

export const deleteNote = command(v.string(), async (id): Promise<void> => {
	notes = notes.filter((n) => n.id !== id);
	await listNotes().refresh();
});
