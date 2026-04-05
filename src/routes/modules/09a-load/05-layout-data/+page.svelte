<!--
	Lesson 9A.5 — the page receives layout data + its own data, merged.
	data.preferences comes from +layout.ts; data.greeting comes from +page.ts.
-->
<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';

	let { data }: PageProps = $props();

	const locale: string = $derived(page.data.preferences?.locale ?? 'unknown');
</script>

<svelte:head>
	<title>Lesson 9A.5 · Layout data · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 9A.5 mini-build — a layout load providing shared preferences to descendant pages."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09a-load">← Module 9A</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9A.5 · Mini-build</p>
		<h1>Layout data, shared with every page below</h1>
		<p class="lede">
			The accent color and locale below came from the sibling <code>+layout.ts</code>. The
			greeting came from this page's own <code>+page.ts</code>, which read the layout data via
			<code>parent()</code>.
		</p>
	</header>

	<dl class="panel">
		<div class="panel__row">
			<dt>data.preferences.accent</dt>
			<dd>{data.preferences.accent}</dd>
		</div>
		<div class="panel__row">
			<dt>data.preferences.locale</dt>
			<dd>{data.preferences.locale}</dd>
		</div>
		<div class="panel__row">
			<dt>data.greeting (from page load)</dt>
			<dd>{data.greeting}</dd>
		</div>
		<div class="panel__row">
			<dt>page.data.preferences.locale via $app/state</dt>
			<dd>{locale}</dd>
		</div>
	</dl>
</section>

<style>
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
			grid-template-columns: 18rem 1fr;
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
		font-size: var(--text-sm);
		color: var(--color-brand);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		word-break: break-all;
	}
</style>
