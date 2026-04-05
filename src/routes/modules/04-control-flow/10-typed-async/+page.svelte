<!--
	Lesson 4.10 mini-build — A fully typed async loader with a runtime guard.
	fetchJson<T> is generic, loadProducts has an explicit Promise<Product[]>,
	and isProduct validates every entry before the data is trusted.
-->
<script lang="ts">
	interface Product {
		id: string;
		name: string;
		price: number;
	}

	function isProduct(value: unknown): value is Product {
		if (typeof value !== 'object' || value === null) return false;
		const v = value as Record<string, unknown>;
		return (
			typeof v.id === 'string' &&
			typeof v.name === 'string' &&
			typeof v.price === 'number'
		);
	}

	async function fetchJson<T>(url: string): Promise<T> {
		const res: Response = await fetch(url);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as T;
	}

	async function loadProducts(): Promise<Product[]> {
		const data: unknown = await fetchJson<unknown>('/products.json');
		if (!Array.isArray(data) || !data.every(isProduct)) {
			throw new Error('Malformed product list');
		}
		return data;
	}

	let promise: Promise<Product[]> = $state(loadProducts());

	function reload(): void {
		promise = loadProducts();
	}
</script>

<svelte:head>
	<title>Lesson 4.10 · Typed async · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 4.10 mini-build: end-to-end typed async with Promise<T>, a generic fetchJson<T>, and a runtime type guard."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/04-control-flow">← Module 4</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 4.10 · Mini-build</p>
		<h1>Types all the way down</h1>
		<p class="lede">
			A generic <code>fetchJson&lt;T&gt;</code>, an explicit
			<code>Promise&lt;Product[]&gt;</code>, and a runtime guard that catches malformed data
			before it reaches the grid.
		</p>
	</header>

	<button type="button" class="btn" onclick={reload}>Reload</button>

	{#await promise}
		<p class="status">Loading…</p>
	{:then products}
		<ul class="grid">
			{#each products as product (product.id)}
				<li class="item">
					<strong>{product.name}</strong>
					<span class="price">${product.price.toFixed(2)}</span>
				</li>
			{/each}
		</ul>
	{:catch err}
		<p class="error">{err instanceof Error ? err.message : 'Unknown error'}</p>
	{/await}
</section>

<style>
	section {
		--color-brand: oklch(66% 0.2 220);
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

	.btn {
		align-self: flex-start;
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: oklch(99% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.status {
		color: var(--color-text-muted);
	}

	.grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-sm);

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.item {
		display: flex;
		justify-content: space-between;
		padding: var(--space-md);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
		min-block-size: 44px;
	}

	.price {
		color: var(--color-brand);
		font-variant-numeric: tabular-nums;
	}

	.error {
		padding: var(--space-md);
		background: oklch(from var(--color-error) 96% 0.03 h);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
	}
</style>
