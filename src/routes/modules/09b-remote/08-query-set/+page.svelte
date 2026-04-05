<script lang="ts">
	import { getCount, increment, reset } from './counter.remote';

	let pulsing: boolean = $state(false);

	async function bump(delta: number): Promise<void> {
		await increment(delta);
		pulsing = true;
		setTimeout(() => {
			pulsing = false;
		}, 400);
	}
</script>

<svelte:head>
	<title>Lesson 9B.8 · query.set · Ultimate Frontend</title>
	<meta
		name="description"
		content="Single-flight mutations with query.set and query.refresh."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09b-remote">← Module 9B</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9B.8 · Single-flight</p>
		<h1><code>query.set</code> + <code>query.refresh</code></h1>
		<p class="lede">
			The server pushes the new value back on the same round trip as the mutation.
		</p>
	</header>

	<article class="counter" class:counter--pulse={pulsing}>
		<p class="counter__label">Current count</p>
		{#await getCount()}
			<p class="counter__value">—</p>
		{:then n}
			<p class="counter__value">{n}</p>
		{/await}
		<div class="counter__actions">
			<button onclick={() => bump(-1)}>−1</button>
			<button onclick={() => bump(1)}>+1</button>
			<button onclick={() => bump(5)}>+5</button>
			<button class="ghost" onclick={() => reset()}>reset</button>
		</div>
	</article>

	<aside class="explain">
		<h2>What's happening?</h2>
		<p>
			Each <code>+</code> button calls the <code>increment</code> command. On
			the server, it mutates state and calls <code>getCount().set(count)</code>
			— no second round trip. The <code>reset</code> button uses
			<code>refresh()</code> instead, which re-runs the query handler. Both
			land new data in the same response.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.18 200);
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
	.counter {
		padding: var(--space-xl);
		text-align: center;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		transition: box-shadow var(--dur-base) var(--ease-out);
	}
	.counter--pulse {
		box-shadow: 0 0 0 6px color-mix(in oklch, var(--color-brand) 40%, transparent);
	}
	.counter__label {
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: var(--text-sm);
		margin: 0;
	}
	.counter__value {
		font-size: var(--text-hero);
		font-weight: 800;
		color: var(--color-brand);
		margin: var(--space-sm) 0;
	}
	.counter__actions {
		display: flex;
		gap: var(--space-sm);
		justify-content: center;
		flex-wrap: wrap;
	}
	.counter__actions button {
		min-block-size: 44px;
		min-inline-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(20% 0.02 200);
		border-radius: var(--radius-md);
		font-weight: 700;
	}
	.counter__actions button.ghost {
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
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
	@media (prefers-reduced-motion: reduce) {
		.counter--pulse {
			box-shadow: none;
		}
	}
</style>
