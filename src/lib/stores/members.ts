/**
 * Static sample dataset used by the Module 11 TanStack Table lessons
 * and by the Admin Dashboard module project. Typed with a single
 * `Member` interface that every table lesson imports.
 */

export interface Member {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'editor' | 'viewer';
	joined: string; // ISO date
	active: boolean;
	signals: number;
}

export const members: Member[] = [
	{ id: 'm-01', name: 'Ada Lovelace', email: 'ada@example.com', role: 'admin', joined: '2024-01-14', active: true, signals: 412 },
	{ id: 'm-02', name: 'Alan Turing', email: 'alan@example.com', role: 'admin', joined: '2024-02-03', active: true, signals: 389 },
	{ id: 'm-03', name: 'Grace Hopper', email: 'grace@example.com', role: 'editor', joined: '2024-03-21', active: true, signals: 302 },
	{ id: 'm-04', name: 'Linus Torvalds', email: 'linus@example.com', role: 'editor', joined: '2024-04-10', active: false, signals: 44 },
	{ id: 'm-05', name: 'Margaret Hamilton', email: 'maggie@example.com', role: 'editor', joined: '2024-05-02', active: true, signals: 278 },
	{ id: 'm-06', name: 'Tim Berners-Lee', email: 'tim@example.com', role: 'admin', joined: '2024-06-17', active: true, signals: 501 },
	{ id: 'm-07', name: 'Barbara Liskov', email: 'barbara@example.com', role: 'viewer', joined: '2024-07-25', active: true, signals: 120 },
	{ id: 'm-08', name: 'Ken Thompson', email: 'ken@example.com', role: 'viewer', joined: '2024-08-09', active: false, signals: 17 },
	{ id: 'm-09', name: 'Dennis Ritchie', email: 'dennis@example.com', role: 'viewer', joined: '2024-09-30', active: true, signals: 88 },
	{ id: 'm-10', name: 'Radia Perlman', email: 'radia@example.com', role: 'editor', joined: '2024-10-11', active: true, signals: 256 },
	{ id: 'm-11', name: 'Donald Knuth', email: 'don@example.com', role: 'viewer', joined: '2024-11-22', active: true, signals: 199 },
	{ id: 'm-12', name: 'Edsger Dijkstra', email: 'edsger@example.com', role: 'editor', joined: '2024-12-05', active: true, signals: 221 },
	{ id: 'm-13', name: 'Brian Kernighan', email: 'bwk@example.com', role: 'admin', joined: '2025-01-19', active: true, signals: 340 },
	{ id: 'm-14', name: 'Sophie Wilson', email: 'sophie@example.com', role: 'editor', joined: '2025-02-14', active: true, signals: 275 },
	{ id: 'm-15', name: 'Karen Spärck Jones', email: 'karen@example.com', role: 'viewer', joined: '2025-03-03', active: false, signals: 61 },
	{ id: 'm-16', name: 'Hedy Lamarr', email: 'hedy@example.com', role: 'viewer', joined: '2025-04-08', active: true, signals: 138 },
	{ id: 'm-17', name: 'Guido van Rossum', email: 'guido@example.com', role: 'admin', joined: '2025-05-15', active: true, signals: 423 },
	{ id: 'm-18', name: 'Ryan Dahl', email: 'ryan@example.com', role: 'editor', joined: '2025-06-20', active: true, signals: 190 },
	{ id: 'm-19', name: 'Rich Harris', email: 'rich@example.com', role: 'admin', joined: '2025-07-07', active: true, signals: 612 },
	{ id: 'm-20', name: 'Yuki Saito', email: 'yuki@example.com', role: 'viewer', joined: '2025-08-28', active: true, signals: 73 }
];
