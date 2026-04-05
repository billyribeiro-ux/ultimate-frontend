<script lang="ts">
	interface LineItem {
		id: string;
		name: string;
		price: number;
		quantity: number;
	}

	const TAX_RATE = 0.2;
	const FREE_SHIP_THRESHOLD = 50;
	const SHIP_FEE = 4.99;

	const items: LineItem[] = $state([
		{ id: '1', name: 'Typed Notebook', price: 12.5, quantity: 1 },
		{ id: '2', name: 'OKLCH Colour Guide', price: 18.0, quantity: 2 },
		{ id: '3', name: 'PE7 Sticker Pack', price: 3.25, quantity: 3 }
	]);

	const subtotal: number = $derived(
		items.reduce((acc, item) => acc + item.price * item.quantity, 0)
	);
	const shipping: number = $derived(subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_FEE);
	const tax: number = $derived((subtotal + shipping) * TAX_RATE);
	const total: number = $derived(subtotal + shipping + tax);
	const itemCount: number = $derived(items.reduce((acc, i) => acc + i.quantity, 0));

	function dec(id: string): void {
		const item = items.find((i) => i.id === id);
		if (item && item.quantity > 0) item.quantity--;
	}

	function inc(id: string): void {
		const item = items.find((i) => i.id === id);
		if (item) item.quantity++;
	}

	function fmt(n: number): string {
		return `$${n.toFixed(2)}`;
	}
</script>

<svelte:head>
	<title>Lesson 2.7 · $derived · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 2.7 mini-build: a cart whose subtotal, tax, shipping and total are all derived values."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/02-reactivity">← Module 2</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 2.7 · Mini-build</p>
		<h1>A cart without drift</h1>
		<p class="lede">
			Adjust the quantities. Subtotal, shipping, tax and total recompute automatically
			because every one of them is a <code>$derived</code>.
		</p>
	</header>

	<ul class="items">
		{#each items as item (item.id)}
			<li class="item">
				<div class="item__body">
					<p class="item__name">{item.name}</p>
					<p class="item__price">{fmt(item.price)} each</p>
				</div>
				<div class="stepper">
					<button type="button" onclick={() => dec(item.id)} aria-label="Decrease">−</button>
					<span>{item.quantity}</span>
					<button type="button" onclick={() => inc(item.id)} aria-label="Increase">+</button>
				</div>
				<p class="item__line">{fmt(item.price * item.quantity)}</p>
			</li>
		{/each}
	</ul>

	<dl class="totals">
		<dt>Items</dt>
		<dd>{itemCount}</dd>
		<dt>Subtotal</dt>
		<dd>{fmt(subtotal)}</dd>
		<dt>Shipping</dt>
		<dd>{shipping === 0 ? 'Free' : fmt(shipping)}</dd>
		<dt>Tax (20%)</dt>
		<dd>{fmt(tax)}</dd>
		<dt class="totals__final">Total</dt>
		<dd class="totals__final">{fmt(total)}</dd>
	</dl>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 350);
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

	.items {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.item {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-block-size: 44px;
	}

	.item__name {
		font-weight: 600;
		margin: 0;
	}

	.item__price {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	.stepper {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.stepper button {
		inline-size: 44px;
		block-size: 44px;
		background: var(--color-brand);
		color: var(--color-surface);
		border-radius: var(--radius-sm);
		font-size: var(--text-lg);
		font-weight: 700;
	}

	.stepper span {
		min-inline-size: 2ch;
		text-align: center;
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}

	.item__line {
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		margin: 0;
	}

	.totals {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-xs) var(--space-md);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		margin: 0;
	}

	.totals dt {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.totals dd {
		margin: 0;
		text-align: end;
		font-variant-numeric: tabular-nums;
	}

	.totals__final {
		font-size: var(--text-xl);
		font-weight: 800;
		color: var(--color-brand);
		padding-block-start: var(--space-sm);
		border-block-start: 1px solid var(--color-border);
	}
</style>
