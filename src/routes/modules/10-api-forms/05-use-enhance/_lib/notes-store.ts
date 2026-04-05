export interface Note {
	readonly id: string;
	readonly title: string;
	readonly body: string;
	readonly createdAt: Date;
}

let store: Note[] = [
	{
		id: 'seed-enh',
		title: 'Use enhance',
		body: 'Progressive enhancement without losing the no-JS baseline.',
		createdAt: new Date('2026-04-03T10:00:00Z')
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
