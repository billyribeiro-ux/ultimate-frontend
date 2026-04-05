<!--
	Lesson 9A.1 — mini-build for load functions.
	Reads data from the colocated +page.ts via the typed PageProps prop.
-->
<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Lesson 9A.1 · What is load · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 9A.1 mini-build — a universal +page.ts load function returning a typed post to the page."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09a-load">← Module 9A</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9A.1 · Mini-build</p>
		<h1>A page that reads data from load</h1>
		<p class="lede">
			The data below did not come from a fetch inside the component — it came from a
			<code>+page.ts</code> load function that ran before the component mounted. View Source
			confirms the title is already in the HTML on first paint.
		</p>
	</header>

	<article class="post">
		<h2>{data.post.title}</h2>
		<p class="post__meta">
			Published <time datetime={data.post.publishedAt}>{data.post.publishedAt}</time>
		</p>
		<p class="post__body">{data.post.body}</p>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.18 250);
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

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.post {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}

	.post h2 {
		font-size: var(--text-xl);
		color: var(--color-brand);
		margin-block-end: var(--space-sm);
	}

	.post__meta {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-end: var(--space-md);
	}

	.post__body {
		font-size: var(--text-base);
		max-inline-size: 60ch;
	}
</style>
