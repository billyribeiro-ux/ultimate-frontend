<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<SEO
	title="Trailing slashes and canonical · Lesson 13.13"
	description="How to pick a trailing-slash convention, redirect legacy URLs with a 301, and collapse tracking-param variants with rel=canonical."
	canonical="https://ultimate-frontend.dev/modules/13-seo/13-canonical"
/>

<section class="page stack">
	<p class="eyebrow">Lesson 13.13 · Mini-build</p>
	<h1>Canonical URL pinned</h1>
	<p>
		The canonical URL for this page is the clean one, regardless of the <code>ref</code>
		query parameter you may see in the address bar.
	</p>
	{#if data.ref}
		<p class="muted">You arrived with ref={data.ref}. The canonical tag ignores it.</p>
	{/if}
	<p>
		Try visiting <a href="?legacy=1">?legacy=1</a> — the load function redirects you back here
		with a 301.
	</p>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 80);
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
