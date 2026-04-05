<!--
	Lesson 3.7 mini-build — A generic List<T> component rendered twice
	with two different item snippets. Demonstrates Snippet<[T, number]>
	and the render-prop pattern.
-->
<script lang="ts">
	import List from '$lib/components/List.svelte';

	interface Product {
		id: string;
		name: string;
		price: string;
	}

	interface User {
		id: string;
		name: string;
		email: string;
	}

	const products: Product[] = [
		{ id: 'p1', name: 'Atlas Notebook', price: '$18.00' },
		{ id: 'p2', name: 'Fountain Pen', price: '$42.00' },
		{ id: 'p3', name: 'Leather Journal', price: '$65.00' },
		{ id: 'p4', name: 'Brass Clip', price: '$4.50' }
	];

	const users: User[] = [
		{ id: 'u1', name: 'Ada Lovelace', email: 'ada@example.com' },
		{ id: 'u2', name: 'Alan Turing', email: 'alan@example.com' },
		{ id: 'u3', name: 'Grace Hopper', email: 'grace@example.com' }
	];
</script>

<svelte:head>
	<title>Lesson 3.7 · Snippet props · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 3.7 mini-build: a generic List<T> component with a typed Snippet<[T, number]> render prop."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/03-components">← Module 3</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 3.7 · Mini-build</p>
		<h1>One List, two shapes</h1>
		<p class="lede">
			The same <code>List.svelte</code> renders a product catalogue and a user directory. The
			layout is shared. The row content is supplied by a typed snippet.
		</p>
	</header>

	{#snippet productRow(p: Product, i: number)}
		<span class="num">{i + 1}</span>
		<strong class="grow">{p.name}</strong>
		<span class="price">{p.price}</span>
	{/snippet}

	{#snippet userRow(u: User, i: number)}
		<span class="num">{i + 1}</span>
		<strong class="grow">{u.name}</strong>
		<span class="email">{u.email}</span>
	{/snippet}

	<h2>Products</h2>
	<List items={products} item={productRow} />

	<h2>Users</h2>
	<List items={users} item={userRow} />
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 100);
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

	.num {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
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

	.email {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
