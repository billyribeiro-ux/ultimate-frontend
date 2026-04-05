// Shared in-memory store for the Module 10 Notes app.
// In production, put this in src/lib/server and import from every lesson.
export interface Note {
	readonly id: string;
	readonly title: string;
	readonly body: string;
	readonly createdAt: Date;
}

let store: Note[] = [
	{
		id: 'seed-a',
		title: 'Two forms, one page',
		body: 'Named actions let create and delete coexist.',
		createdAt: new Date('2026-04-02T10:00:00Z')
	}
];

export function listNotes(): Note[] {
	return [...store].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function addNote(title: string, body: string): Note {
	const note: Note = { id: crypto.randomUUID(), title, body, createdAt: new Date() };
	store = [note, ...store];
	return note;
}

export function deleteNote(id: string): boolean {
	const before = store.length;
	store = store.filter((n) => n.id !== id);
	return store.length < before;
}
