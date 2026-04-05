<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<SEO {...data.seo} />

<section class="page stack">
	<p class="eyebrow">Lesson 13.5 · Mini-build</p>
	<h1>{data.post.title}</h1>
	<p class="lede">{data.post.excerpt}</p>
	<article>{data.post.body}</article>
	<p class="muted">
		Everything in the head — title, description, OG image — came from the same load() function
		that produced this article body.
	</p>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 130);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
	}

	.muted {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
</style>
