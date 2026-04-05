import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { query } from '$app/server';

export interface Post {
	readonly id: string;
	readonly title: string;
	readonly body: string;
	readonly tags: Map<string, number>;
	readonly publishedAt: Date;
}

// In-memory store. In production, replace with a database.
const store: Map<string, Post> = new Map([
	[
		'welcome',
		{
			id: 'welcome',
			title: 'Welcome to remote functions',
			body: 'A short post demonstrating a parameterized query.',
			tags: new Map([
				['intro', 3],
				['svelte', 7]
			]),
			publishedAt: new Date('2026-04-01T09:00:00Z')
		}
	],
	[
		'devalue',
		{
			id: 'devalue',
			title: 'Why devalue beats JSON',
			body: 'Dates, Maps, and BigInts all survive the trip.',
			tags: new Map([
				['serialisation', 5],
				['advanced', 2]
			]),
			publishedAt: new Date('2026-04-03T14:30:00Z')
		}
	],
	[
		'valibot',
		{
			id: 'valibot',
			title: 'Valibot in 100 lines',
			body: 'Schema-first thinking for parameterized queries.',
			tags: new Map([
				['validation', 9],
				['typescript', 4]
			]),
			publishedAt: new Date('2026-04-04T11:15:00Z')
		}
	]
]);

const idSchema = v.pipe(v.string(), v.minLength(1), v.maxLength(64));

export type PostId = v.InferInput<typeof idSchema>;

export const getPost = query(idSchema, async (id): Promise<Post> => {
	const post = store.get(id);
	if (!post) error(404, `No post with id "${id}"`);
	return post;
});

export const listIds = query(async (): Promise<string[]> => {
	return [...store.keys()];
});
