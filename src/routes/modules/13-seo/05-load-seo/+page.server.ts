import type { PageServerLoad } from './$types';
import type { SEOData } from '$lib/types/seo';

interface Post {
	slug: string;
	title: string;
	excerpt: string;
	body: string;
	coverImage: string;
}

export const load: PageServerLoad = () => {
	// In a real app this would hit a database or CMS.
	const post: Post = {
		slug: 'why-load-seo',
		title: 'Why SEO data belongs in load()',
		excerpt:
			'Hard-coded titles and descriptions do not scale past six pages. load() is the only sustainable place for SEO metadata in SvelteKit.',
		body: 'Full article body would live here. The SEO tags above came from this same server round trip.',
		coverImage: 'https://ultimate-frontend.dev/og/why-load-seo.png'
	};

	const seo: SEOData = {
		title: `${post.title} · Ultimate Frontend`,
		description: post.excerpt,
		ogImage: post.coverImage,
		ogType: 'article'
	};

	return { post, seo };
};
