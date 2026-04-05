<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<SEO
	title="Prerendered pages · Lesson 13.11"
	description="Static HTML at build time — the fastest LCP SvelteKit can ship."
/>

<section class="page stack">
	<p class="eyebrow">Lesson 13.11 · Mini-build</p>
	<h1>{data.headline}</h1>
	<p>{data.subhead}</p>
	<p class="muted">Built at <time datetime={data.builtAt}>{data.builtAt}</time>.</p>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 160);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.muted {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
</style>
