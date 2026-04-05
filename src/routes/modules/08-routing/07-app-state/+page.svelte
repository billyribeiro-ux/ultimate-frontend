<!--
	Lesson 8.7 — $app/state router dashboard.
	Every displayed value is a $derived from the reactive page object.
-->
<script lang="ts">
	import { page, navigating } from '$app/state';

	const pathname: string = $derived(page.url.pathname);
	const search: string = $derived(page.url.search || '(none)');
	const hash: string = $derived(page.url.hash || '(none)');
	const routeId: string = $derived(page.route.id ?? '(none)');
	const status: number = $derived(page.status);
	const isNavigating: boolean = $derived(navigating.to !== null);
</script>

<svelte:head>
	<title>Lesson 8.7 · $app/state · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 8.7 mini-build — a router dashboard that displays every field of the reactive page object."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing">← Module 8</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 8.7 · Mini-build</p>
		<h1>Router dashboard</h1>
		<p class="lede">
			Every row reads a field from <code>page</code> (imported from <code>$app/state</code>)
			through <code>$derived</code>. Try adding <code>?foo=bar</code> to the URL in your browser.
		</p>
	</header>

	<dl class="panel">
		<div class="panel__row">
			<dt>page.url.pathname</dt>
			<dd>{pathname}</dd>
		</div>
		<div class="panel__row">
			<dt>page.url.search</dt>
			<dd>{search}</dd>
		</div>
		<div class="panel__row">
			<dt>page.url.hash</dt>
			<dd>{hash}</dd>
		</div>
		<div class="panel__row">
			<dt>page.route.id</dt>
			<dd>{routeId}</dd>
		</div>
		<div class="panel__row">
			<dt>page.status</dt>
			<dd>{status}</dd>
		</div>
		<div class="panel__row">
			<dt>navigating.to</dt>
			<dd>{isNavigating ? 'navigation in progress' : 'idle'}</dd>
		</div>
	</dl>

	<aside class="hint">
		<p>
			<strong>Deprecated note.</strong> Old tutorials import <code>page</code> from
			<code>$app/stores</code> and read <code>$page.url</code>. That API still exists for
			backwards compatibility but is deprecated since SvelteKit 2.12. Always use
			<code>$app/state</code>.
		</p>
	</aside>
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

	.hint {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
