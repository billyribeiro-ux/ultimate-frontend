// Lesson 9A.8 — server load that throws a typed 404 when the slug is missing.

import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

interface Post {
	title: string;
	body: string;
}

const posts: Record<string, Post> = {
	hello: {
		title: 'Hello, world',
		body: 'This post exists in the in-memory store. Load returned normally.'
	},
	about: {
		title: 'About this lesson',
		body: 'Second post. Also found.'
	}
};

export const load: PageServerLoad = ({ params }): { post: Post } => {
	const post = posts[params.slug];
	if (!post) {
		throw error(404, `No post with slug "${params.slug}"`);
	}
	return { post };
};
