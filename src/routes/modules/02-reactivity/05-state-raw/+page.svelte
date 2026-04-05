<script lang="ts">
	interface Row {
		id: number;
		value: number;
	}

	function buildList(n: number): Row[] {
		const out: Row[] = [];
		for (let i = 0; i < n; i++) {
			out.push({ id: i, value: Math.round(Math.random() * 1000) });
		}
		return out;
	}

	const SIZE = 2000;

	const deepRows: Row[] = $state(buildList(SIZE));
	let rawRows: Row[] = $state.raw(buildList(SIZE));

	let deepMs: number = $state(0);
	let rawMs: number = $state(0);

	function rebuildDeep(): void {
		const start = performance.now();
		deepRows.length = 0;
		for (const row of buildList(SIZE)) {
			deepRows.push(row);
		}
		deepMs = Math.round((performance.now() - start) * 100) / 100;
	}

	function rebuildRaw(): void {
		const start = performance.now();
		rawRows = buildList(SIZE);
		rawMs = Math.round((performance.now() - start) * 100) / 100;
	}
</script>

<svelte:head>
	<title>Lesson 2.5 · $state.raw · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 2.5 mini-build: a side-by-side benchmark of $state vs $state.raw on a 2000-row list."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/02-reactivity">← Module 2</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 2.5 · Mini-build</p>
		<h1>Deep vs raw, side by side</h1>
		<p class="lede">
			Both panels hold {SIZE} rows. The left uses <code>$state</code>, the right uses
			<code>$state.raw</code>. Click rebuild on each and compare the timing.
		</p>
	</header>

	<div class="grid">
		<article class="panel">
			<h2>$state (deep proxy)</h2>
			<button type="button" onclick={rebuildDeep}>Rebuild</button>
			<p class="chip">Last build: {deepMs} ms</p>
			<p class="count">{deepRows.length} rows</p>
		</article>

		<article class="panel">
			<h2>$state.raw</h2>
			<button type="button" onclick={rebuildRaw}>Rebuild</button>
			<p class="chip">Last build: {rawMs} ms</p>
			<p class="count">{rawRows.length} rows</p>
		</article>
	</div>
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

	.grid {
		display: grid;
		gap: var(--space-md);

		@media (min-width: 768px) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.panel {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-sm);
	}

	.panel h2 {
		font-size: var(--text-lg);
		color: var(--color-brand);
	}

	.panel button {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: var(--color-surface);
		border-radius: var(--radius-md);
		font-weight: 600;
		min-block-size: 44px;
		justify-self: start;
	}

	.chip {
		display: inline-block;
		padding: 0.2em 0.7em;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		margin: 0;
	}

	.count {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}
</style>
