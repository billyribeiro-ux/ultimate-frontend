<!--
    Lesson 5.6 — Closures in event handlers.
    Mini-build: a 3x3 grid of "add N" buttons, each handler produced by
    a factory that closes over its own N.
-->
<script lang="ts">
	let total: number = $state(0);
	let history: number[] = $state([]);

	function makeAdder(n: number): (event: MouseEvent) => void {
		return (event: MouseEvent): void => {
			total += n;
			history = [n, ...history].slice(0, 6);
			// event just proves we still have a typed MouseEvent in scope
			console.log('add', n, 'at', event.clientX);
		};
	}

	const amounts: readonly number[] = [1, 2, 3, 5, 10, 25, 50, 100, -10];
	const handlers: ReadonlyArray<(e: MouseEvent) => void> = amounts.map((n) => makeAdder(n));

	function reset(): void {
		total = 0;
		history = [];
	}
</script>

<svelte:head>
	<title>Lesson 5.6 · Closures · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 5.6: a grid of buttons whose handlers each close over their own number."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/05-events">← Module 5</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 5.6 · Mini-build</p>
		<h1>Each button remembers its own number</h1>
		<p class="lede">
			Every handler below was produced by the same factory function, but each one closes over
			its own value of <code>n</code>.
		</p>
	</header>

	<article class="demo">
		<p class="demo__label">Total</p>
		<p class="demo__value" aria-live="polite">{total}</p>

		<div class="grid">
			{#each amounts as n, i (i)}
				<button type="button" class="btn" onclick={handlers[i]}>
					{n > 0 ? '+' : ''}{n}
				</button>
			{/each}
		</div>

		<div class="actions">
			<button type="button" class="btn btn--ghost" onclick={reset}>Reset</button>
		</div>
	</article>

	<aside aria-label="Recent additions" class="history">
		<h2>Last 6 additions</h2>
		{#if history.length === 0}
			<p class="history__empty">None yet.</p>
		{:else}
			<ol class="history__list">
				{#each history as n, i (i + '-' + n)}
					<li>{n > 0 ? '+' : ''}{n}</li>
				{/each}
			</ol>
		{/if}
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.18 180);
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

	.demo {
		display: grid;
		gap: var(--space-sm);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border-radius: var(--radius-lg);
	}

	.demo__label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0;
	}

	.demo__value {
		font-size: var(--text-hero);
		font-weight: 700;
		color: var(--color-brand);
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-sm);

		@media (min-width: 480px) {
			grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
		}
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: oklch(15% 0.02 180);
		font-weight: 600;
		font-family: ui-monospace, monospace;
	}

	.btn--ghost {
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.actions {
		display: flex;
		gap: var(--space-sm);
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
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		list-style: none;
	}

	.history__list li {
		padding-inline: var(--space-sm);
		padding-block: var(--space-xs);
		background: var(--color-surface-2);
		border-radius: var(--radius-sm);
		font-family: ui-monospace, monospace;
	}
</style>
