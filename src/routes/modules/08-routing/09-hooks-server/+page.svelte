<!--
	Lesson 8.9 — displays per-request data from the server load.
	The requestId changes on every reload because each request is new.
-->
<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Lesson 8.9 · hooks.server.ts · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 8.9 mini-build — read per-request data populated by a server hook / load function."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing">← Module 8</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 8.9 · Mini-build</p>
		<h1>Per-request data from the server</h1>
		<p class="lede">
			Every row below was produced on the server, inside a <code>+page.server.ts</code> load
			function, reading values that a real project's <code>hooks.server.ts</code> would set on
			<code>event.locals</code>. Reload to see <code>requestId</code> change.
		</p>
	</header>

	<dl class="panel">
		<div class="panel__row">
			<dt>request.method</dt>
			<dd>{data.method}</dd>
		</div>
		<div class="panel__row">
			<dt>url.pathname</dt>
			<dd>{data.pathname}</dd>
		</div>
		<div class="panel__row">
			<dt>Accept-Language</dt>
			<dd>{data.accept}</dd>
		</div>
		<div class="panel__row">
			<dt>locals.requestId</dt>
			<dd>{data.requestId}</dd>
		</div>
	</dl>
</section>

<style>
	section {
		--color-brand: oklch(55% 0.05 260);
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
		padding-block-end: var(--space-sm);
		border-block-end: 1px solid var(--color-border);

		@media (min-width: 480px) {
			grid-template-columns: 14rem 1fr;
			align-items: baseline;
		}

		&:last-child {
			border-block-end: 0;
			padding-block-end: 0;
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
		font-size: var(--text-base);
		color: var(--color-brand);
		word-break: break-all;
	}
</style>
