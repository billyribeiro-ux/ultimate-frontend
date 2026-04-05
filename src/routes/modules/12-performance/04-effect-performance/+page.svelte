<!--
	Lesson 12.4 — $effect performance
	Mini-build: two counters whose increments are tracked by a "bad" effect
	that depends on both and a "good" effect that untracks the irrelevant one.
-->
<script lang="ts">
	import { untrack } from 'svelte';

	let a = $state<number>(0);
	let b = $state<number>(0);
	let badFireCount = $state<number>(0);
	let goodFireCount = $state<number>(0);

	$effect(() => {
		// Bad: reads both a and b, so fires on every change to either.
		const _ = a + b;
		badFireCount += 1;
	});

	$effect(() => {
		// Good: only depends on a; reads b untracked.
		const x = a;
		const y = untrack(() => b);
		void (x + y);
		goodFireCount += 1;
	});

	function reset(): void {
		a = 0;
		b = 0;
		badFireCount = 0;
		goodFireCount = 0;
	}
</script>

<svelte:head>
	<title>Lesson 12.4 · $effect performance · Ultimate Frontend</title>
	<meta
		name="description"
		content="A live demo of a bad effect that fires on every unrelated change and a good effect that uses untrack to avoid it."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/12-performance">← Module 12</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 12.4 · Mini-build</p>
		<h1>Only fire when it matters</h1>
		<p class="lede">
			Click the buttons and watch the fire counts. The bad effect re-runs for every change;
			the good effect only re-runs when <code>a</code> changes, because it reads
			<code>b</code> inside <code>untrack</code>.
		</p>
	</header>

	<div class="controls">
		<div class="counter">
			<h2>Counter A</h2>
			<p class="value">{a}</p>
			<button type="button" onclick={() => (a += 1)}>Increment A</button>
		</div>
		<div class="counter">
			<h2>Counter B</h2>
			<p class="value">{b}</p>
			<button type="button" onclick={() => (b += 1)}>Increment B</button>
		</div>
	</div>

	<div class="metrics">
		<div class="metric bad">
			<p class="metric__label">Bad effect (reads both)</p>
			<p class="metric__value">{badFireCount}</p>
		</div>
		<div class="metric good">
			<p class="metric__label">Good effect (untrack b)</p>
			<p class="metric__value">{goodFireCount}</p>
		</div>
	</div>

	<button type="button" class="reset" onclick={reset}>Reset</button>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 100);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
		}
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

	.controls {
		display: grid;
		gap: var(--space-md);
		grid-template-columns: 1fr;

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.counter {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-sm);
	}

	.counter h2 {
		font-size: var(--text-lg);
		margin: 0;
	}

	.value {
		font-size: var(--text-2xl);
		font-family: ui-monospace, monospace;
		font-weight: 700;
		margin: 0;
	}

	.counter button,
	.reset {
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: var(--color-brand);
		color: oklch(15% 0.02 100);
		border-radius: var(--radius-md);
		font-weight: 700;
	}

	.reset {
		justify-self: start;
		background: var(--color-surface-2);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.metrics {
		display: grid;
		gap: var(--space-md);
		grid-template-columns: 1fr;

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.metric {
		padding: var(--space-md);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.metric.bad {
		background: oklch(from var(--color-error) 96% 0.03 h);
		border-color: var(--color-error);
	}

	.metric.good {
		background: oklch(from var(--color-success) 96% 0.03 h);
		border-color: var(--color-success);
	}

	.metric__label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 var(--space-xs) 0;
	}

	.metric__value {
		font-size: var(--text-2xl);
		font-family: ui-monospace, monospace;
		font-weight: 700;
		margin: 0;
	}
</style>
