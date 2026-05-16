<script lang="ts">
	import { getArticle } from './article.remote';

	function formatDate(d: Date): string {
		return d.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Lesson 9B.9 · Async SSR · Ultimate Frontend</title>
	<meta
		name="description"
		content="Suspense boundaries and the conservative await pattern for async SSR with remote functions."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09b-remote">← Module 9B</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9B.9 · Suspense</p>
		<h1>Async SSR, the conservative way</h1>
		<p class="lede">
			<code>{'{#await}'}</code> inside a
			<code>&lt;svelte:boundary&gt;</code> with a
			<code>pending</code> snippet — stable today, forward-compatible with
			top-level <code>await</code> tomorrow.
		</p>
	</header>

	<svelte:boundary>
		{#snippet pending()}
			<article class="article article--skeleton" aria-busy="true">
				<span class="skeleton skeleton--title"></span>
				<span class="skeleton skeleton--meta"></span>
				<span class="skeleton skeleton--line"></span>
				<span class="skeleton skeleton--line"></span>
				<span class="skeleton skeleton--line"></span>
			</article>
		{/snippet}

		{#snippet failed(error)}
			<p class="error" role="alert">Could not load article: {(error as Error).message}</p>
		{/snippet}

		{#await getArticle() then article}
			<article class="article">
				<h2>{article.title}</h2>
				<p class="meta">Published {formatDate(article.publishedAt)}</p>
				<p>{article.body}</p>
			</article>
		{/await}
	</svelte:boundary>

	<aside class="explain">
		<h2>The future (commented out)</h2>
		<pre><code>{`// svelte.config.js
compilerOptions: { experimental: { async: true } }

// +page.svelte
<script lang="ts">
  const article = await getArticle();
</script>
<h2>{article.title}</h2>`}</code></pre>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(65% 0.18 310);
	}
	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: var(--text-sm);
		min-block-size: 44px;
		display: inline-flex;
		align-items: center;
	}
	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.lede {
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		max-inline-size: var(--prose-max);
	}
	.article {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}
	.article h2 {
		font-size: var(--text-xl);
		margin: 0;
	}
	.meta {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: var(--space-xs) 0 var(--space-md);
	}
	.article--skeleton {
		display: grid;
		gap: var(--space-sm);
	}
	.skeleton {
		display: block;
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		animation: shimmer 1.6s var(--ease-in-out) infinite;
	}
	.skeleton--title {
		block-size: 1.8rem;
		inline-size: 60%;
	}
	.skeleton--meta {
		block-size: 0.9rem;
		inline-size: 30%;
	}
	.skeleton--line {
		block-size: 1rem;
		inline-size: 100%;
	}
	.error {
		color: var(--color-error);
		padding: var(--space-md);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
	}
	.explain {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}
	.explain h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}
	pre {
		overflow-x: auto;
		padding: var(--space-sm);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
	}
	@keyframes shimmer {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.skeleton {
			animation: none;
		}
	}
</style>
