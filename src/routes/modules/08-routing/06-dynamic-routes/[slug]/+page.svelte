<!--
	Lesson 8.6 — Dynamic [slug] route.
	Reads page.params.slug via $derived so it stays reactive across
	shallow navigations between different slugs.
-->
<script lang="ts">
	import { page } from '$app/state';

	const slug: string = $derived(page.params.slug ?? '');
	const route: string = $derived(page.route.id ?? '');
</script>

<svelte:head>
	<title>Lesson 8.6 · /{slug} · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 8.6 dynamic route page — reads a slug from page.params."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing/06-dynamic-routes">← Lesson 8.6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 8.6 · Dynamic segment</p>
		<h1>Route parameter captured</h1>
	</header>

	<article class="panel">
		<dl>
			<dt>page.params.slug</dt>
			<dd><code>{slug}</code></dd>
			<dt>page.route.id</dt>
			<dd><code>{route}</code></dd>
		</dl>
		<p class="hint">
			Change the slug directly in the address bar. The page re-renders reactively because
			<code>page</code> from <code>$app/state</code> is a reactive object.
		</p>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.18 55);
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

	.panel {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}

	dl {
		display: grid;
		gap: var(--space-sm);
		margin: 0;

		@media (min-width: 480px) {
			grid-template-columns: 12rem 1fr;
			align-items: baseline;
		}
	}

	dt {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
	}

	dd {
		margin: 0;
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-base);
		color: var(--color-brand);
	}

	.hint {
		margin-block-start: var(--space-md);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
