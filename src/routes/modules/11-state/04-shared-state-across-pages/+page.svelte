<!--
	Lesson 11.4 — Shared $state across pages
	Mini-build: the same cart store, now hydrated from localStorage and
	persisted back on every change, surviving reload.
-->
<script lang="ts">
	import { cart, type CartItem } from '$lib/stores/cart.svelte';

	const STORAGE_KEY = 'ultimate-frontend:cart';

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

	let hydrated = $state<boolean>(false);

	$effect(() => {
		// Client-only: hydrate once from localStorage.
		if (typeof window === 'undefined') return;
		if (hydrated) return;
		try {
			const raw = window.localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as CartItem[];
				cart.clear();
				for (const item of parsed) cart.add(item, item.quantity);
			}
		} catch {
			// Ignore corrupted storage values.
		}
		hydrated = true;
	});

	$effect(() => {
		// Client-only: persist on every change (depends on cart.items).
		if (typeof window === 'undefined') return;
		if (!hydrated) return;
		const snapshot = $state.snapshot(cart.items);
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
		} catch {
			// Ignore quota or private-mode errors.
		}
	});

	function formatPrice(value: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
	}
</script>

<svelte:head>
	<title>Lesson 11.4 · Shared state across pages · Ultimate Frontend</title>
	<meta
		name="description"
		content="A cart store hydrated from localStorage and persisted on every change, so it survives navigation and reload."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/11-state">← Module 11</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 11.4 · Mini-build</p>
		<h1>A cart that survives a reload</h1>
		<p class="lede">
			Add something to the cart, reload the page, and watch it come back. The store is the
			same singleton from Lesson 11.3; this page adds the SSR-safe persistence layer.
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
			<button
				type="button"
				class="reload"
				onclick={() => {
					if (typeof window !== 'undefined') window.location.reload();
				}}
			>
				Reload this page
			</button>
		</div>

		<aside class="cart" aria-label="Cart summary">
			<h2>Cart ({cart.count})</h2>
			{#if cart.isEmpty}
				<p class="empty">Empty. Add a product and reload.</p>
			{:else}
				<ul>
					{#each cart.items as item (item.id)}
						<li>
							<span>{item.name}</span>
							<span>×{item.quantity}</span>
						</li>
					{/each}
				</ul>
				<p>Total: <strong>{formatPrice(cart.total)}</strong></p>
				<button type="button" onclick={() => cart.clear()}>Clear</button>
			{/if}
		</aside>
	</div>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 160);
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
		color: oklch(15% 0.02 160);
		border-radius: var(--radius-md);
		font-weight: 700;
	}

	.reload {
		margin-block-start: var(--space-md);
		background: var(--color-surface-2);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.cart {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		align-self: start;
	}

	.cart ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.cart li {
		display: flex;
		justify-content: space-between;
		padding-block: var(--space-xs);
		border-block-end: 1px solid var(--color-border);
	}

	.cart h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}

	.empty {
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>
