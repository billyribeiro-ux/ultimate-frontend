import { query } from '$app/server';

export interface Post {
	readonly id: string;
	readonly title: string;
	readonly author: string;
	readonly publishedAt: Date;
}

// In-memory data. In production, replace with a database query.
const posts: Post[] = [
	{
		id: 'a',
		title: 'Hello remote world',
		author: 'Ada',
		publishedAt: new Date('2026-04-01T09:00:00Z')
	},
	{
		id: 'b',
		title: 'query() in five minutes',
		author: 'Linus',
		publishedAt: new Date('2026-04-03T14:30:00Z')
	},
	{
		id: 'c',
		title: 'Why devalue beats JSON.stringify',
		author: 'Grace',
		publishedAt: new Date('2026-04-04T11:15:00Z')
	}
];

export const getPosts = query(async (): Promise<Post[]> => {
	// Sort by newest first. Dates survive the round trip thanks to devalue.
	return [...posts].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
});
