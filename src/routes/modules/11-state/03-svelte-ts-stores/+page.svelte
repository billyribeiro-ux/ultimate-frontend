<!--
	Lesson 11.3 — .svelte.ts files — universal reactive state
	Mini-build: a small shop that imports a singleton CartStore from a
	.svelte.ts file and mutates it from multiple places on the page.
-->
<script lang="ts">
	import { cart, type CartItem } from '$lib/stores/cart.svelte';

	interface Product {
		id: string;
		name: string;
		price: number;
	}

	const products: Product[] = [
		{ id: 'torus', name: 'PE7 Torus', price: 19 },
		{ id: 'cube', name: 'OKLCH Cube', price: 24 },
		{ id: 'sphere', name: 'Rune Sphere', price: 29 }
	];

	function addToCart(product: Product): void {
		cart.add({ id: product.id, name: product.name, price: product.price });
	}

	function formatPrice(value: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
	}
</script>

<svelte:head>
	<title>Lesson 11.3 · .svelte.ts universal state · Ultimate Frontend</title>
	<meta
		name="description"
		content="A small shop that imports a singleton cart store from a .svelte.ts file. Every component on the page reads the same reactive instance."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/11-state">← Module 11</a>
	</nav>

	<header class="top">
		<div>
			<p class="eyebrow">Lesson 11.3 · Mini-build</p>
			<h1>One file, one store, one source of truth</h1>
		</div>
		<span class="badge" aria-label="Items in cart">
			{cart.count} item{cart.count === 1 ? '' : 's'}
		</span>
	</header>

	<div class="grid">
		<div class="products">
			<h2>Products</h2>
			<ul>
				{#each products as product (product.id)}
					<li>
						<span class="product__name">{product.name}</span>
						<span class="product__price">{formatPrice(product.price)}</span>
						<button type="button" onclick={() => addToCart(product)}>Add</button>
					</li>
				{/each}
			</ul>
		</div>

		<aside class="cart" aria-label="Cart summary">
			<h2>Cart</h2>
			{#if cart.isEmpty}
				<p class="empty">Nothing in the cart yet.</p>
			{:else}
				<ul class="cart__items">
					{#each cart.items as item (item.id)}
						<li>
							<span>{item.name}</span>
							<span>×{item.quantity}</span>
							<button
								type="button"
								class="remove"
								aria-label="Remove {item.name}"
								onclick={() => cart.remove(item.id)}
							>
								×
							</button>
						</li>
					{/each}
				</ul>
				<p class="total">Total: <strong>{formatPrice(cart.total)}</strong></p>
				<button type="button" class="clear" onclick={() => cart.clear()}>Clear cart</button>
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

	.top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.badge {
		padding: var(--space-xs) var(--space-md);
		background: var(--color-brand);
		color: oklch(15% 0.02 145);
		border-radius: var(--radius-full);
		font-weight: 700;
		font-size: var(--text-sm);
	}

	.grid {
		display: grid;
		gap: var(--space-md);
		grid-template-columns: 1fr;

		@media (min-width: 768px) {
			grid-template-columns: 2fr 1fr;
		}
	}

	.products ul,
	.cart__items {
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

	.product__name {
		font-weight: 600;
	}

	.product__price {
		color: var(--color-text-muted);
		font-family: ui-monospace, monospace;
	}

	.products button {
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
		box-shadow: var(--shadow-sm);
		align-self: start;

		@media (min-width: 768px) {
			position: sticky;
			top: var(--space-md);
		}
	}

	.cart h2,
	.products h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}

	.cart__items li {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: var(--space-sm);
		align-items: center;
		padding-block: var(--space-xs);
		border-block-end: 1px solid var(--color-border);
	}

	.remove {
		min-inline-size: 32px;
		min-block-size: 32px;
		color: var(--color-error);
		font-size: var(--text-lg);
	}

	.total {
		margin-block-start: var(--space-sm);
		font-size: var(--text-base);
	}

	.clear {
		margin-block-start: var(--space-sm);
		padding: var(--space-xs) var(--space-md);
		min-block-size: 44px;
		border: 1px solid var(--color-error);
		color: var(--color-error);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.empty {
		color: var(--color-text-muted);
		font-style: italic;
		margin: 0;
	}
</style>
