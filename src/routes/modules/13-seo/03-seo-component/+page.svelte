<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';

	const title: string = 'Reusable SEO component · Lesson 13.3';
	const description: string =
		'A typed SEO component centralises every tag a page needs so you never repeat twelve metas by hand again.';
</script>

<SEO {title} {description} ogType="article" />

<section class="page stack">
	<p class="eyebrow">Lesson 13.3 · Mini-build</p>
	<h1>Reusable, typed, one-line SEO</h1>
	<p>
		This page uses the <code>&lt;SEO&gt;</code> component from
		<code>$lib/components/SEO.svelte</code>.
	</p>
	<p>Right-click → View Source to see every tag it emitted.</p>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 300);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
</style>
