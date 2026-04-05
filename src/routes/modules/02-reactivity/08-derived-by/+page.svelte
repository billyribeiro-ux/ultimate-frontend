<script lang="ts">
	interface LineItem {
		id: string;
		name: string;
		category: string;
		price: number;
		quantity: number;
	}

	const items: LineItem[] = $state([
		{ id: '1', name: 'Typed Notebook', category: 'Books', price: 12.5, quantity: 1 },
		{ id: '2', name: 'OKLCH Colour Guide', category: 'Books', price: 18.0, quantity: 2 },
		{ id: '3', name: 'PE7 Sticker Pack', category: 'Merch', price: 3.25, quantity: 3 },
		{ id: '4', name: 'Ultimate T-shirt', category: 'Merch', price: 22.0, quantity: 1 },
		{ id: '5', name: 'Capstone Enamel Pin', category: 'Merch', price: 6.5, quantity: 2 }
	]);

	interface Group {
		category: string;
		items: LineItem[];
		subtotal: number;
	}

	const groups: Group[] = $derived.by(() => {
		const byCategory: Record<string, LineItem[]> = {};
		for (const item of items) {
			if (!byCategory[item.category]) {
				byCategory[item.category] = [];
			}
			byCategory[item.category].push(item);
		}

		const result: Group[] = [];
		for (const category of Object.keys(byCategory).sort()) {
			const groupItems = byCategory[category];
			const subtotal = groupItems.reduce((a, i) => a + i.price * i.quantity, 0);
			result.push({ category, items: groupItems, subtotal });
		}
		return result;
	});

	const grandTotal: number = $derived(groups.reduce((a, g) => a + g.subtotal, 0));

	function inc(id: string): void {
		const i = items.find((x) => x.id === id);
		if (i) i.quantity++;
	}

	function dec(id: string): void {
		const i = items.find((x) => x.id === id);
		if (i && i.quantity > 0) i.quantity--;
	}

	function fmt(n: number): string {
		return `$${n.toFixed(2)}`;
	}
</script>

<svelte:head>
	<title>Lesson 2.8 · $derived.by · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 2.8 mini-build: a cart grouped by category using $derived.by for the grouping computation."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/02-reactivity">← Module 2</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 2.8 · Mini-build</p>
		<h1>Grouped by derivation</h1>
		<p class="lede">
			The grouping logic needs a loop, so it lives inside <code>$derived.by</code>. Change a
			quantity and the groups reorganise automatically.
		</p>
	</header>

	{#each groups as group (group.category)}
		<article class="group">
			<header class="group__header">
				<h2>{group.category}</h2>
				<span class="group__subtotal">{fmt(group.subtotal)}</span>
			</header>
			<ul>
				{#each group.items as item (item.id)}
					<li>
						<span>{item.name}</span>
						<div class="stepper">
							<button type="button" onclick={() => dec(item.id)} aria-label="Decrease">−</button>
							<span>{item.quantity}</span>
							<button type="button" onclick={() => inc(item.id)} aria-label="Increase">+</button>
						</div>
						<span>{fmt(item.price * item.quantity)}</span>
					</li>
				{/each}
			</ul>
		</article>
	{/each}

	<p class="grand">Grand total: {fmt(grandTotal)}</p>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 160);
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

	.group {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.group__header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-block-end: var(--space-sm);
	}

	.group h2 {
		font-size: var(--text-lg);
		color: var(--color-brand);
		margin: 0;
	}

	.group__subtotal {
		font-variant-numeric: tabular-nums;
		font-weight: 700;
	}

	.group ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.group li {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: var(--space-sm);
		min-block-size: 44px;
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
		font-weight: 700;
	}

	.grand {
		font-size: var(--text-xl);
		font-weight: 800;
		color: var(--color-brand);
		text-align: end;
	}
</style>
