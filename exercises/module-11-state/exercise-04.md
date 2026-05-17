---
module: 11
exercise: 4
title: URL as State
difficulty: expert
estimated_time: 45
skills_tested:
  - page.url.searchParams
  - goto with search params
  - replaceState
  - shareable filter state
---

# Exercise 11.4 — URL as State

## Brief

Build a product catalog with filters (category, price range, sort order) that are stored entirely in the URL search params. The filters are shareable, bookmarkable, and survive page reloads. Changing any filter updates the URL without a full-page navigation.

## Requirements

1. Create `src/routes/catalog/+page.svelte` with at least 12 products across 3 categories
2. Add a category filter dropdown that maps to `?category=electronics`
3. Add a price range filter with min/max inputs that maps to `?min=10&max=100`
4. Add a sort select (name-asc, name-desc, price-asc, price-desc) that maps to `?sort=price-asc`
5. All filter changes update the URL using `goto()` with `replaceState: true`
6. Products are filtered and sorted reactively using `$derived` from `page.url.searchParams`
7. A "Clear filters" button removes all search params
8. The filtered count is displayed: "Showing X of Y products"

## Constraints

- No `$state` for filter values — read everything from `page.url.searchParams`
- Use `replaceState: true` to avoid polluting browser history with every filter change
- The page must work if a user pastes a URL with pre-set filters
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Read filters from `page.url.searchParams.get('category')`. To update, construct a new `URLSearchParams`, modify it, and call `goto(\`?\${params}\`, { replaceState: true })`. The page re-renders because `page.url` is reactive.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Create a helper function `updateParam(key, value)` that reads the current params, sets/deletes the key, and calls `goto`. Chain `$derived` expressions: first filter by category, then by price range, then sort. Each reads from `page.url.searchParams`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  let category = $derived(page.url.searchParams.get('category') ?? '');
  let sortBy = $derived(page.url.searchParams.get('sort') ?? 'name-asc');

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(page.url.searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    goto(`?${params}`, { replaceState: true });
  }
</script>
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```svelte
<!-- src/routes/catalog/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
  }

  const products: Product[] = [
    { id: 1, name: 'Wireless Mouse', category: 'electronics', price: 29.99 },
    { id: 2, name: 'Mechanical Keyboard', category: 'electronics', price: 89.99 },
    { id: 3, name: 'USB-C Hub', category: 'electronics', price: 49.99 },
    { id: 4, name: 'Monitor Stand', category: 'electronics', price: 39.99 },
    { id: 5, name: 'Desk Lamp', category: 'home', price: 34.99 },
    { id: 6, name: 'Plant Pot', category: 'home', price: 19.99 },
    { id: 7, name: 'Coaster Set', category: 'home', price: 12.99 },
    { id: 8, name: 'Wall Clock', category: 'home', price: 44.99 },
    { id: 9, name: 'Notebook', category: 'office', price: 9.99 },
    { id: 10, name: 'Pen Set', category: 'office', price: 14.99 },
    { id: 11, name: 'Desk Organizer', category: 'office', price: 24.99 },
    { id: 12, name: 'Whiteboard', category: 'office', price: 59.99 }
  ];

  const categories = ['electronics', 'home', 'office'];
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  let category = $derived(page.url.searchParams.get('category') ?? '');
  let minPrice = $derived(Number(page.url.searchParams.get('min') ?? '0'));
  let maxPrice = $derived(Number(page.url.searchParams.get('max') ?? '999'));
  let sortBy = $derived(page.url.searchParams.get('sort') ?? 'name-asc');

  let filtered = $derived.by(() => {
    let result = products;

    if (category) {
      result = result.filter((p) => p.category === category);
    }

    result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    const [field, direction] = sortBy.split('-') as ['name' | 'price', 'asc' | 'desc'];
    result = [...result].sort((a, b) => {
      const va = field === 'price' ? a.price : a.name;
      const vb = field === 'price' ? b.price : b.name;
      const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number);
      return direction === 'desc' ? -cmp : cmp;
    });

    return result;
  });

  let hasFilters = $derived(page.url.searchParams.toString() !== '');

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(page.url.searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    goto(`?${params}`, { replaceState: true });
  }

  function clearFilters() {
    goto('?', { replaceState: true });
  }
</script>

<div class="catalog">
  <aside class="filters">
    <h2>Filters</h2>

    <div class="filter-group">
      <label for="category">Category</label>
      <select id="category" value={category} onchange={(e) => updateParam('category', e.currentTarget.value)}>
        <option value="">All</option>
        {#each categories as cat}
          <option value={cat}>{cat}</option>
        {/each}
      </select>
    </div>

    <div class="filter-group">
      <label>Price Range</label>
      <div class="price-inputs">
        <input type="number" placeholder="Min" value={minPrice || ''} onchange={(e) => updateParam('min', e.currentTarget.value)} />
        <span>to</span>
        <input type="number" placeholder="Max" value={maxPrice < 999 ? maxPrice : ''} onchange={(e) => updateParam('max', e.currentTarget.value)} />
      </div>
    </div>

    <div class="filter-group">
      <label for="sort">Sort</label>
      <select id="sort" value={sortBy} onchange={(e) => updateParam('sort', e.currentTarget.value)}>
        <option value="name-asc">Name A-Z</option>
        <option value="name-desc">Name Z-A</option>
        <option value="price-asc">Price Low-High</option>
        <option value="price-desc">Price High-Low</option>
      </select>
    </div>

    {#if hasFilters}
      <button class="clear-btn" onclick={clearFilters}>Clear Filters</button>
    {/if}
  </aside>

  <main class="products">
    <p class="count">Showing {filtered.length} of {products.length} products</p>

    <div class="product-grid">
      {#each filtered as product (product.id)}
        <div class="product-card">
          <span class="product-category">{product.category}</span>
          <h3>{product.name}</h3>
          <p class="product-price">{formatter.format(product.price)}</p>
        </div>
      {/each}
    </div>

    {#if filtered.length === 0}
      <p class="no-results">No products match your filters.</p>
    {/if}
  </main>
</div>

<style>
  .catalog { display: grid; grid-template-columns: 14rem 1fr; gap: var(--space-lg); padding: var(--space-lg); max-inline-size: 64rem; margin-inline: auto; }
  .filters { display: flex; flex-direction: column; gap: var(--space-md); }
  .filters h2 { font-size: var(--text-lg); margin-block-end: var(--space-xs); }
  .filter-group { display: flex; flex-direction: column; gap: var(--space-2xs); }
  .filter-group label { font-size: var(--text-sm); font-weight: 600; color: var(--color-text-muted); }
  select, input[type='number'] { padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-sm); background: var(--color-surface-1); color: var(--color-text); }
  .price-inputs { display: flex; align-items: center; gap: var(--space-xs); }
  .price-inputs input { inline-size: 5rem; }
  .clear-btn { padding: var(--space-xs); background: var(--color-surface-3); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--text-sm); color: var(--color-text); }
  .count { font-size: var(--text-sm); color: var(--color-text-muted); margin-block-end: var(--space-md); }
  .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: var(--space-md); }
  .product-card { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-lg); }
  .product-category { font-size: var(--text-xs); text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.05em; }
  .product-card h3 { font-size: var(--text-base); margin-block: var(--space-xs); }
  .product-price { font-size: var(--text-lg); font-weight: 700; color: oklch(55% 0.2 145); }
  .no-results { text-align: center; padding: var(--space-2xl); color: var(--color-text-muted); }
</style>
```

### Explanation

The URL is the oldest and most shareable state container on the web. By reading all filter values from `page.url.searchParams` and writing them with `goto()`, the catalog state is automatically shareable, bookmarkable, and back-button compatible. Using `replaceState: true` prevents each filter change from creating a new history entry. The `$derived` chain (filter by category, then by price, then sort) recalculates whenever the URL changes. This pattern is the right choice for any filter/search UI where the state should survive sharing and page reloads.
</details>
