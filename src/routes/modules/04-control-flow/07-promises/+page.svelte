<!--
	Lesson 4.7 mini-build — A hand-driven async loader.
	Demonstrates Promises, async/await, try/catch, and the four-state pattern.
	{#await} is NOT used here — that's the next lesson. The point of this lesson
	is to see the plain JavaScript async model in action first.
-->
<script lang="ts">
	interface Product {
		id: string;
		name: string;
		price: number;
	}

	type Status = 'idle' | 'loading' | 'success' | 'error';

	let status: Status = $state('idle');
	let products: Product[] = $state([]);
	let errorMessage: string = $state('');

	async function load(): Promise<void> {
		status = 'loading';
		errorMessage = '';
		try {
			const res: Response = await fetch('/products.json');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			products = await res.json();
			status = 'success';
		} catch (err: unknown) {
			errorMessage = err instanceof Error ? err.message : 'Unknown error';
			status = 'error';
		}
	}

	async function loadFailing(): Promise<void> {
		status = 'loading';
		errorMessage = '';
		try {
			const res: Response = await fetch('/does-not-exist.json');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			products = await res.json();
			status = 'success';
		} catch (err: unknown) {
			errorMessage = err instanceof Error ? err.message : 'Unknown error';
			status = 'error';
		}
	}
</script>

<svelte:head>
	<title>Lesson 4.7 · Promises · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 4.7 mini-build: fetch products with async/await and handle loading, success, and error states manually."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/04-control-flow">← Module 4</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 4.7 · Mini-build</p>
		<h1>Fetch with async/await</h1>
		<p class="lede">
			An async function, a <code>try</code>/<code>catch</code>, and a four-state UI. No
			<code>#await</code> block yet — that's the next lesson.
		</p>
	</header>

	<div class="controls">
		<button type="button" class="btn" onclick={load}>Load products</button>
		<button type="button" class="btn btn--danger" onclick={loadFailing}>Load (will fail)</button>
	</div>

	{#if status === 'idle'}
		<p class="hint">Click a button to start a request.</p>
	{:else if status === 'loading'}
		<ul class="grid">
			{#each Array.from({ length: 4 }) as _, i (i)}
				<li class="skeleton" aria-hidden="true"></li>
			{/each}
		</ul>
	{:else if status === 'success'}
		<ul class="grid">
			{#each products as product (product.id)}
				<li class="item">
					<strong>{product.name}</strong>
					<span class="price">${product.price.toFixed(2)}</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="error">Request failed: {errorMessage}</p>
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(66% 0.2 160);
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

	.hint {
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
