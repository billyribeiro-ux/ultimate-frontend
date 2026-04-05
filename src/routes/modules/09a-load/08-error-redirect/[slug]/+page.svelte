<!--
	Lesson 9A.8 — success page for a valid slug. If the slug is missing, this
	component never renders — the sibling +error.svelte takes over instead.
-->
<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Lesson 9A.8 · {data.post.title} · Ultimate Frontend</title>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09a-load/08-error-redirect">← Back to lesson</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9A.8 · Success</p>
		<h1>{data.post.title}</h1>
	</header>

	<article class="body">
		<p>{data.post.body}</p>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.16 150);
	}

	.crumbs a {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.body {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}
</style>
