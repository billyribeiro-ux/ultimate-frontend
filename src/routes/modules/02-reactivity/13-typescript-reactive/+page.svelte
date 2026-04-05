<script lang="ts">
	interface Counter {
		readonly value: number;
		readonly isPositive: boolean;
		increment: () => void;
		decrement: () => void;
		reset: () => void;
	}

	function createCounter(initial: number = 0): Counter {
		let count = $state(initial);
		return {
			get value() {
				return count;
			},
			get isPositive() {
				return count > 0;
			},
			increment: () => {
				count++;
			},
			decrement: () => {
				count--;
			},
			reset: () => {
				count = initial;
			}
		};
	}

	const counter: Counter = createCounter(3);
	const doubled: number = $derived(counter.value * 2);

	interface LogEntry {
		id: string;
		message: string;
	}

	const log: LogEntry[] = $state([
		{ id: 'seed', message: 'Counter initialised at 3' }
	]);

	function record(action: string): void {
		log.push({
			id: crypto.randomUUID(),
			message: `${action} → value is now ${counter.value}`
		});
		if (log.length > 6) log.shift();
	}
</script>

<svelte:head>
	<title>Lesson 2.13 · Typed reactive state · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 2.13 mini-build: a strongly typed counter helper using the getter pattern."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/02-reactivity">← Module 2</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 2.13 · Mini-build</p>
		<h1>Typed counter helper</h1>
		<p class="lede">
			A factory function returns a <code>Counter</code> with a read-only <code>value</code>
			getter. Under the hood, each read is a signal subscription.
		</p>
	</header>

	<article class="card">
		<p class="card__value" class:card__value--positive={counter.isPositive}>
			{counter.value}
		</p>
		<p class="card__derived">Doubled: {doubled}</p>
		<div class="card__controls">
			<button type="button" onclick={() => { counter.decrement(); record('decrement'); }}>
				−1
			</button>
			<button type="button" onclick={() => { counter.reset(); record('reset'); }}>
				Reset
			</button>
			<button type="button" onclick={() => { counter.increment(); record('increment'); }}>
				+1
			</button>
		</div>
	</article>

	<section class="log" aria-label="Action log">
		<h2>Action log</h2>
		<ol>
			{#each log as entry (entry.id)}
				<li>{entry.message}</li>
			{/each}
		</ol>
	</section>
</section>

<style>
	section.page {
		--color-brand: oklch(70% 0.2 190);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;

			&:hover {
				color: var(--color-brand);
			}
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

	.card {
		padding: var(--space-xl);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	.card__value {
		font-size: var(--text-hero);
		font-weight: 800;
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
		margin: 0;
	}

	.card__value--positive {
		color: var(--color-brand);
	}

	.card__derived {
		font-size: var(--text-base);
		color: var(--color-text-muted);
		margin-block: var(--space-sm);
	}

	.card__controls {
		display: flex;
		gap: var(--space-sm);
		justify-content: center;
		flex-wrap: wrap;
	}

	.card__controls button {
		min-inline-size: 44px;
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: var(--color-surface);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.log {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
	}

	.log h2 {
		font-size: var(--text-base);
		margin-block-end: var(--space-sm);
	}

	.log ol {
		padding-inline-start: var(--space-lg);
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
