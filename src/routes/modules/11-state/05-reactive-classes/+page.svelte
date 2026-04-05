<!--
	Lesson 11.5 — Reactive classes with runes
	Mini-build: a full cart page demonstrating every method on CartStore.
-->
<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';

	interface Product {
		id: string;
		name: string;
		price: number;
	}

	const products: Product[] = [
		{ id: 'torus', name: 'PE7 Torus', price: 19 },
		{ id: 'cube', name: 'OKLCH Cube', price: 24 },
		{ id: 'sphere', name: 'Rune Sphere', price: 29 },
		{ id: 'helix', name: 'Helix Loop', price: 34 }
	];

	function formatPrice(value: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
	}
</script>

<svelte:head>
	<title>Lesson 11.5 · Reactive classes with runes · Ultimate Frontend</title>
	<meta
		name="description"
		content="A live cart showing $state on class fields, $derived for computed values, and methods that encapsulate business rules."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/11-state">← Module 11</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 11.5 · Mini-build</p>
		<h1>State, derived, methods — one reactive class</h1>
		<p class="lede">
			Every field below reads from the same <code>CartStore</code> instance. The count and
			total are <code>$derived</code>; the buttons call methods that enforce the "bump
			quantity on duplicate" rule in one place.
		</p>
	</header>

	<div class="grid">
		<div>
			<h2>Products</h2>
			<ul class="products">
				{#each products as product (product.id)}
					<li>
						<span>{product.name}</span>
						<span class="muted">{formatPrice(product.price)}</span>
						<button type="button" onclick={() => cart.add(product)}>Add</button>
					</li>
				{/each}
			</ul>
		</div>

		<aside class="cart" aria-label="Cart summary">
			<h2>Cart</h2>
			<dl class="metrics">
				<dt>Items</dt>
				<dd>{cart.count}</dd>
				<dt>Unique</dt>
				<dd>{cart.items.length}</dd>
				<dt>Total</dt>
				<dd>{formatPrice(cart.total)}</dd>
			</dl>
			{#if !cart.isEmpty}
				<ul class="items">
					{#each cart.items as item (item.id)}
						<li>
							<span class="item__name">{item.name}</span>
							<div class="qty" role="group" aria-label="Quantity for {item.name}">
								<button
									type="button"
									aria-label="Decrease"
									onclick={() => cart.setQuantity(item.id, item.quantity - 1)}
								>−</button>
								<span>{item.quantity}</span>
								<button
									type="button"
									aria-label="Increase"
									onclick={() => cart.setQuantity(item.id, item.quantity + 1)}
								>+</button>
							</div>
						</li>
					{/each}
				</ul>
				<button type="button" class="clear" onclick={() => cart.clear()}>Clear cart</button>
			{:else}
				<p class="empty">Add something to see the class in action.</p>
			{/if}
		</aside>
	</div>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 145);
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

	.grid {
		display: grid;
		gap: var(--space-md);
		grid-template-columns: 1fr;

		@media (min-width: 768px) {
			grid-template-columns: 2fr 1fr;
		}
	}

	.products {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.products li {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-block-size: 44px;
	}

	.muted {
		color: var(--color-text-muted);
	}

	button {
		padding: var(--space-xs) var(--space-md);
		min-block-size: 40px;
		background: var(--color-brand);
		color: oklch(15% 0.02 145);
		border-radius: var(--radius-md);
		font-weight: 700;
	}

	.cart {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		align-self: start;
	}

	.cart h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}

	.metrics {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-xs) var(--space-md);
		margin: 0 0 var(--space-md) 0;
	}

	.metrics dt {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.metrics dd {
		margin: 0;
		font-weight: 700;
		font-family: ui-monospace, monospace;
	}

	.items {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.items li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-sm);
		padding-block: var(--space-xs);
		border-block-end: 1px solid var(--color-border);
	}

	.qty {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.qty button {
		min-inline-size: 32px;
		min-block-size: 32px;
		padding: 0;
		background: var(--color-surface);
		color: var(--color-brand);
		border: 1px solid var(--color-brand);
	}

	.clear {
		margin-block-start: var(--space-md);
		background: var(--color-surface);
		color: var(--color-error);
		border: 1px solid var(--color-error);
		min-block-size: 44px;
	}

	.empty {
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>
