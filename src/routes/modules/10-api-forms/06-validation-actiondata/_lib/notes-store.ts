export interface Note {
	readonly id: string;
	readonly title: string;
	readonly body: string;
	readonly createdAt: Date;
}

let store: Note[] = [
	{
		id: 'seed-val',
		title: 'Edit me to see validation',
		body: 'Clear the title and click Save to see the Valibot errors flow back.',
		createdAt: new Date('2026-04-04T10:00:00Z')
	}
];

export function listNotes(): Note[] {
	return [...store].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getNote(id: string): Note | undefined {
	return store.find((n) => n.id === id);
}

export function addNote(title: string, body: string): Note {
	const note: Note = { id: crypto.randomUUID(), title, body, createdAt: new Date() };
	store = [note, ...store];
	return note;
}

export function updateNote(id: string, title: string, body: string): Note | undefined {
	const existing = store.find((n) => n.id === id);
	if (!existing) return undefined;
	const updated: Note = { ...existing, title, body };
	store = store.map((n) => (n.id === id ? updated : n));
	return updated;
}

export function deleteNote(id: string): boolean {
	const before = store.length;
	store = store.filter((n) => n.id !== id);
	return store.length < before;
}
