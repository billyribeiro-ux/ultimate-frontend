<!--
	Lesson 4.8 mini-build — Svelte's {#await} block.
	Same product-loading UI as Lesson 4.7, now driven entirely by {#await}.
	Assigning a new Promise to the state variable automatically resets to pending.
-->
<script lang="ts">
	interface Product {
		id: string;
		name: string;
		price: number;
	}

	async function loadProducts(): Promise<Product[]> {
		const res: Response = await fetch('/products.json');
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return res.json();
	}

	async function loadFailing(): Promise<Product[]> {
		const res: Response = await fetch('/does-not-exist.json');
		if (!res.ok) throw new Error(`HTTP ${res.status} — request failed`);
		return res.json();
	}

	let promise: Promise<Product[]> = $state(loadProducts());

	function reload(): void {
		promise = loadProducts();
	}

	function reloadFailing(): void {
		promise = loadFailing();
	}
</script>

<svelte:head>
	<title>Lesson 4.8 · await block · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 4.8 mini-build: replace manual async state with Svelte's #await / :then / :catch block."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/04-control-flow">← Module 4</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 4.8 · Mini-build</p>
		<h1>Same data, less code</h1>
		<p class="lede">
			One <code>#await</code> block replaces four <code>$state</code> variables and a
			<code>try</code>/<code>catch</code>. Throttle your network to see the skeleton, then
			click Reload.
		</p>
	</header>

	<div class="controls">
		<button type="button" class="btn" onclick={reload}>Reload</button>
		<button type="button" class="btn btn--danger" onclick={reloadFailing}>Reload (fail)</button>
	</div>

	{#await promise}
		<ul class="grid">
			{#each Array.from({ length: 4 }) as _, i (i)}
				<li class="skeleton" aria-hidden="true"></li>
			{/each}
		</ul>
	{:then products}
		<ul class="grid">
			{#each products as product (product.id)}
				<li class="item">
					<strong>{product.name}</strong>
					<span class="price">${product.price.toFixed(2)}</span>
				</li>
			{/each}
		</ul>
	{:catch error}
		<p class="error">
			{error instanceof Error ? error.message : 'Unknown error'}
		</p>
	{/await}
</section>

<style>
	section {
		--color-brand: oklch(66% 0.2 260);
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

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: oklch(99% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.btn--danger {
		background: var(--color-error);
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

	.skeleton {
		block-size: 3rem;
		background: linear-gradient(
			90deg,
			var(--color-surface-2) 0%,
			var(--color-border) 50%,
			var(--color-surface-2) 100%
		);
		background-size: 200% 100%;
		border-radius: var(--radius-md);
		animation: shimmer 1.2s infinite linear;
	}

	@keyframes shimmer {
		from {
			background-position: 200% 0;
		}
		to {
			background-position: -200% 0;
		}
	}

	.error {
		padding: var(--space-md);
		background: oklch(from var(--color-error) 96% 0.03 h);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton {
			animation: none;
		}
	}
</style>
