<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import AuthorBio, { type Author } from '$lib/components/AuthorBio.svelte';

	const author: Author = {
		name: 'Jane Doe',
		role: 'Senior Frontend Engineer',
		bioUrl: 'https://ultimate-frontend.dev/authors/jane-doe',
		image: 'https://ultimate-frontend.dev/authors/jane-doe.jpg',
		sameAs: ['https://github.com/jane', 'https://www.linkedin.com/in/jane']
	};

	const datePublished: string = '2026-04-05';
	const dateModified: string = '2026-04-05';
</script>

<SEO
	title="E-E-A-T signals · Lesson 13.7"
	description="How to ship Experience, Expertise, Authoritativeness, and Trustworthiness signals in SvelteKit markup."
	ogType="article"
/>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules">Modules</a> › <a href="/modules/13-seo">Module 13</a> ›
		<span aria-current="page">Lesson 13.7</span>
	</nav>
	<p class="eyebrow">Lesson 13.7 · Mini-build</p>
	<h1>E-E-A-T signals in SvelteKit markup</h1>
	<p class="dates">
		Published <time datetime={datePublished}>{datePublished}</time> · Updated
		<time datetime={dateModified}>{dateModified}</time>
	</p>
	<AuthorBio {author} />
	<p>The author card above ships both a visible byline and a matching Person schema.</p>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 200);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.crumbs {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.crumbs a {
		color: inherit;
	}

	.dates {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
