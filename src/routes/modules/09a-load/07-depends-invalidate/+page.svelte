<!--
	Lesson 9A.7 — refreshable server value via depends + invalidate.
-->
<script lang="ts">
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';

	let { data }: PageProps = $props();
	let refreshing: boolean = $state(false);

	async function refresh(): Promise<void> {
		refreshing = true;
		await invalidate('app:lesson-9a-7');
		refreshing = false;
	}
</script>

<svelte:head>
	<title>Lesson 9A.7 · depends + invalidate · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 9A.7 mini-build — fine-grained cache invalidation with depends() and invalidate()."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09a-load">← Module 9A</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9A.7 · Mini-build</p>
		<h1>A server value you can refresh without a reload</h1>
		<p class="lede">
			The server load called <code>depends('app:lesson-9a-7')</code>. Clicking refresh calls
			<code>invalidate('app:lesson-9a-7')</code>, which re-runs the load in place.
		</p>
	</header>

	<article class="panel">
		<dl>
			<dt>data.value</dt>
			<dd>{data.value.toFixed(6)}</dd>
			<dt>data.at</dt>
			<dd>{data.at}</dd>
		</dl>
		<button class="btn" type="button" onclick={refresh} disabled={refreshing}>
			{refreshing ? 'Refreshing…' : 'Refresh this load only'}
		</button>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.18 65);
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
		gap: var(--space-md);
	}

	dl {
		display: grid;
		gap: var(--space-sm);
		margin: 0;

		@media (min-width: 480px) {
			grid-template-columns: 8rem 1fr;
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
		color: var(--color-brand);
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: oklch(20% 0.02 270);
		border-radius: var(--radius-md);
		font-weight: 600;
		justify-self: start;

		&:disabled {
			opacity: 0.6;
			cursor: progress;
		}
	}
</style>
