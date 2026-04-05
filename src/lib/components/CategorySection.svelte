<!--
	CategorySection.svelte — Module 4, Lesson 4.5.
	Extracts the inner loop of a nested catalogue so the page file stays flat.
-->
<script lang="ts">
	interface Product {
		id: string;
		name: string;
		price: number;
	}

	interface Category {
		id: string;
		name: string;
		products: Product[];
	}

	interface Props {
		category: Category;
	}

	let { category }: Props = $props();
</script>

<section class="category">
	<h2 class="category__heading">{category.name}</h2>
	<ul class="category__list">
		{#each category.products as product (product.id)}
			<li class="product">
				<strong class="product__name">{product.name}</strong>
				<span class="product__price">${product.price.toFixed(2)}</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	.category {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.category__heading {
		position: sticky;
		inset-block-start: 0;
		margin: 0;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border-block-end: 1px solid var(--color-border);
		font-size: var(--text-lg);
		z-index: 1;
	}

	.category__list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.product {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
		min-block-size: 44px;
	}

	.product__price {
		font-variant-numeric: tabular-nums;
		color: var(--color-brand);
	}
</style>
