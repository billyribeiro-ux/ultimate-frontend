<!--
	Lesson 4.3 mini-build — {#each} with destructuring, index, and empty-state fallback.
-->
<script lang="ts">
	interface Product {
		id: string;
		name: string;
		price: number;
	}

	const products: Product[] = [
		{ id: 'p1', name: 'Atlas Notebook', price: 18 },
		{ id: 'p2', name: 'Fountain Pen', price: 42 },
		{ id: 'p3', name: 'Leather Journal', price: 65 },
		{ id: 'p4', name: 'Brass Paperclip', price: 4.5 },
		{ id: 'p5', name: 'Ink Bottle', price: 12 }
	];
</script>

<svelte:head>
	<title>Lesson 4.3 · each · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 4.3 mini-build: iterate over an array with Svelte's #each block, using destructuring and the index variable."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/04-control-flow">← Module 4</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 4.3 · Mini-build</p>
		<h1>A product grid</h1>
		<p class="lede">
			One <code>#each</code> block, five rows, inline destructuring, and a typed index.
		</p>
	</header>

	<ul class="grid">
		{#each products as { id, name, price }, i (id)}
			<li class="item">
				<span class="num">{i + 1}</span>
				<strong class="grow">{name}</strong>
				<span class="price">${price.toFixed(2)}</span>
			</li>
		{:else}
			<li class="empty">No products yet.</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(66% 0.2 40);
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
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.item {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		min-block-size: 44px;

		&:nth-child(even) {
			background: var(--color-surface-2);
		}
	}

	.num {
		font-family: ui-monospace, monospace;
		color: var(--color-text-muted);
		min-inline-size: 2ch;
	}

	.grow {
		flex: 1;
	}

	.price {
		font-variant-numeric: tabular-nums;
		color: var(--color-brand);
	}

	.empty {
		padding: var(--space-lg);
		text-align: center;
		color: var(--color-text-muted);
	}
</style>
