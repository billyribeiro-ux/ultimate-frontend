<!--
	Lesson 4.5 mini-build — Nested each with an extracted CategorySection component.
-->
<script lang="ts">
	import CategorySection from '$lib/components/CategorySection.svelte';

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

	const catalogue: Category[] = [
		{
			id: 'c1',
			name: 'Stationery',
			products: [
				{ id: 'p1', name: 'Atlas Notebook', price: 18 },
				{ id: 'p2', name: 'Fountain Pen', price: 42 },
				{ id: 'p3', name: 'Leather Journal', price: 65 }
			]
		},
		{
			id: 'c2',
			name: 'Tools',
			products: [
				{ id: 'p4', name: 'Brass Ruler', price: 11 },
				{ id: 'p5', name: 'Letter Opener', price: 22 }
			]
		},
		{
			id: 'c3',
			name: 'Accessories',
			products: [
				{ id: 'p6', name: 'Desk Pad', price: 35 },
				{ id: 'p7', name: 'Pen Holder', price: 19 },
				{ id: 'p8', name: 'Ink Bottle', price: 12 }
			]
		}
	];
</script>

<svelte:head>
	<title>Lesson 4.5 · Nested each · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 4.5 mini-build: nested #each loops with sticky category headers and an extracted CategorySection component."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/04-control-flow">← Module 4</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 4.5 · Mini-build</p>
		<h1>A nested catalogue</h1>
		<p class="lede">
			Three categories, eight products, two levels of <code>#each</code>. The inner loop is
			extracted into <code>CategorySection.svelte</code> to keep this file flat.
		</p>
	</header>

	<div class="catalogue">
		{#each catalogue as category (category.id)}
			<CategorySection {category} />
		{/each}
	</div>
</section>

<style>
	section {
		--color-brand: oklch(66% 0.2 80);
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

	.catalogue {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}
</style>
