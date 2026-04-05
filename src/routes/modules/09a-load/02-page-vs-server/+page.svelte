<!--
	Lesson 9A.2 — displays values from both the server and universal load,
	merged into a single typed data prop.
-->
<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Lesson 9A.2 · page.ts vs page.server.ts · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 9A.2 mini-build — running universal and server loads side by side for the same route."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09a-load">← Module 9A</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9A.2 · Mini-build</p>
		<h1>Two loads, one data prop</h1>
		<p class="lede">
			This page has both a <code>+page.server.ts</code> (server-only) and a
			<code>+page.ts</code> (universal). Server load runs first; universal load merges its result.
		</p>
	</header>

	<dl class="panel">
		<div class="panel__row">
			<dt>data.fromServer</dt>
			<dd>{data.fromServer}</dd>
		</div>
		<div class="panel__row">
			<dt>data.fromUniversal</dt>
			<dd>{data.fromUniversal}</dd>
		</div>
	</dl>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.16 180);
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

	.panel {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-sm);
		margin: 0;
	}

	.panel__row {
		display: grid;
		gap: var(--space-xs);

		@media (min-width: 480px) {
			grid-template-columns: 14rem 1fr;
			align-items: baseline;
		}
	}

	dt {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
	}

	dd {
		margin: 0;
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-sm);
		color: var(--color-brand);
		word-break: break-all;
	}
</style>
