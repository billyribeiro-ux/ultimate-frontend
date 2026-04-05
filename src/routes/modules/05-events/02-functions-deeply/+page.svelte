<!--
    Lesson 5.2 — JavaScript functions deeply.
    Mini-build: a function playground where three different function shapes
    (declaration, expression, arrow) all live in a Record<string, Operation>
    lookup and drive a live counter.
-->
<script lang="ts">
	type Operation = (n: number) => number;

	// Shape 1 — declaration.
	function double(n: number): number {
		return n * 2;
	}

	// Shape 2 — expression.
	const increment: Operation = function (n) {
		return n + 1;
	};

	// Shape 3 — arrow (expression body).
	const square: Operation = (n) => n * n;

	// Extra — arrow (block body).
	const halve: Operation = (n) => {
		return Math.round(n / 2);
	};

	const operations: Record<string, Operation> = {
		double,
		increment,
		square,
		halve
	};

	let value: number = $state(1);
	let history: string[] = $state([]);

	function apply(name: string): void {
		const op: Operation | undefined = operations[name];
		if (op === undefined) return;
		const before: number = value;
		value = op(value);
		history = [`${name}(${before}) → ${value}`, ...history].slice(0, 5);
	}

	function reset(): void {
		value = 1;
		history = [];
	}
</script>

<svelte:head>
	<title>Lesson 5.2 · Functions deeply · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 5.2: a function playground demonstrating first-class functions as event handlers."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/05-events">← Module 5</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 5.2 · Mini-build</p>
		<h1>Functions are values you can run</h1>
		<p class="lede">
			Declaration, expression, arrow — all three are values of the same type
			<code>(n: number) =&gt; number</code>. Pick one with a button.
		</p>
	</header>

	<article class="playground">
		<p class="playground__label">Current value</p>
		<p class="playground__value" aria-live="polite">{value}</p>

		<div class="playground__actions">
			<button type="button" class="btn" onclick={() => apply('double')}>double()</button>
			<button type="button" class="btn" onclick={() => apply('increment')}>increment()</button>
			<button type="button" class="btn" onclick={() => apply('square')}>square()</button>
			<button type="button" class="btn" onclick={() => apply('halve')}>halve()</button>
			<button type="button" class="btn btn--ghost" onclick={reset}>reset</button>
		</div>
	</article>

	<section aria-labelledby="history-heading" class="history">
		<h2 id="history-heading">Last 5 operations</h2>
		{#if history.length === 0}
			<p class="history__empty">No operations yet. Press a button.</p>
		{:else}
			<ol class="history__list">
				{#each history as entry, i (i + '-' + entry)}
					<li><code>{entry}</code></li>
				{/each}
			</ol>
		{/if}
	</section>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.18 50);
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

	.playground {
		display: grid;
		gap: var(--space-sm);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.playground__label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0;
	}

	.playground__value {
		font-size: var(--text-hero);
		font-weight: 700;
		color: var(--color-brand);
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.playground__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.btn {
		min-block-size: 44px;
		min-inline-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: oklch(15% 0.02 270);
		font-weight: 600;
		font-family: ui-monospace, monospace;
		transition: background var(--dur-fast) var(--ease-out);
	}

	.btn:hover {
		background: oklch(from var(--color-brand) calc(l - 0.05) c h);
	}

	.btn--ghost {
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.btn--ghost:hover {
		border-color: var(--color-brand);
		background: transparent;
	}

	.history {
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);

		& h2 {
			font-size: var(--text-lg);
			margin-block-end: var(--space-sm);
		}
	}

	.history__empty {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.history__list {
		margin: 0;
		padding-inline-start: var(--space-md);
	}

	.history__list li + li {
		margin-block-start: var(--space-xs);
	}

	@media (prefers-reduced-motion: reduce) {
		.btn {
			transition: none;
		}
	}
</style>
