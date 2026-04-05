<!--
    Lesson 6.6 — Responsive layout patterns with CSS Grid.
-->
<script lang="ts">
	let count: number = $state(6);
	let mode: 'fill' | 'fit' = $state('fill');

	function add(): void {
		count = Math.min(count + 1, 20);
	}

	function remove(): void {
		count = Math.max(count - 1, 0);
	}

	function toggleMode(): void {
		mode = mode === 'fill' ? 'fit' : 'fill';
	}
</script>

<svelte:head>
	<title>Lesson 6.6 · Grid patterns · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 6.6: a responsive card grid and a named-area page layout."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.6 · Mini-build</p>
		<h1>CSS Grid without media queries</h1>
		<p class="lede">
			<code>repeat(auto-{mode}, minmax(16rem, 1fr))</code> creates as many columns as fit. Try
			adding and removing cards to see auto-fill vs auto-fit.
		</p>
	</header>

	<div class="toolbar">
		<button type="button" class="btn" onclick={add}>+ Add card</button>
		<button type="button" class="btn" onclick={remove}>− Remove card</button>
		<button type="button" class="btn btn--ghost" onclick={toggleMode}>
			Mode: <strong>{mode}</strong>
		</button>
	</div>

	<ul class="cards" data-mode={mode}>
		{#each Array.from({ length: count }, (_, i) => i) as i (i)}
			<li class="card">Card {i + 1}</li>
		{/each}
	</ul>

	<h2>Named areas layout</h2>
	<div class="layout">
		<div class="layout__header">Header</div>
		<div class="layout__sidebar">Sidebar</div>
		<div class="layout__main">Main content area</div>
		<div class="layout__footer">Footer</div>
	</div>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 20);
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

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: oklch(15% 0.02 20);
		font-weight: 600;
	}

	.btn--ghost {
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.cards {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-md);
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
	}

	.cards[data-mode='fit'] {
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
	}

	.card {
		padding: var(--space-md);
		min-block-size: 6rem;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		display: grid;
		place-items: center;
		font-weight: 600;
	}

	h2 {
		font-size: var(--text-xl);
		margin-block: var(--space-md) var(--space-sm);
	}

	.layout {
		display: grid;
		gap: var(--space-sm);
		grid-template-columns: 1fr;
		grid-template-areas:
			'header'
			'main'
			'sidebar'
			'footer';

		@media (min-width: 768px) {
			grid-template-columns: 12rem 1fr;
			grid-template-areas:
				'header  header'
				'sidebar main'
				'footer  footer';
		}
	}

	.layout > div {
		padding: var(--space-md);
		background: oklch(from var(--color-brand) 94% 0.04 h);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-block-size: 44px;
	}

	.layout__header {
		grid-area: header;
	}
	.layout__sidebar {
		grid-area: sidebar;
	}
	.layout__main {
		grid-area: main;
		min-block-size: 10rem;
	}
	.layout__footer {
		grid-area: footer;
	}
</style>
