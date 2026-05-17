---
module: 3
exercise: 3
title: Snippet Render-Prop Pattern
difficulty: advanced
estimated_time: 30
skills_tested:
  - snippet declaration and rendering
  - typed snippet props
  - render delegation pattern
  - children snippet
---

# Exercise 3.3 — Snippet Render-Prop Pattern

## Brief

Build a `DataList` component that accepts data and a snippet for rendering each item. The component handles the iteration logic and empty/loading states, while the parent controls how each item looks. This is the Svelte 5 equivalent of render props — using `{#snippet}` and `{@render}`.

## Requirements

1. Create `src/lib/exercises/03/DataList.svelte`
2. Create `src/routes/exercises/03-components/03/+page.svelte`
3. DataList accepts: `items: T[]` (generic), `loading?: boolean`
4. DataList accepts a snippet prop `item` that receives `(item: T, index: number)` as parameters
5. DataList also accepts an optional `empty` snippet for the empty state
6. When `loading` is true, show a skeleton placeholder
7. When `items` is empty, render the `empty` snippet (or a default "No items" message)
8. When items exist, iterate and render each with the `item` snippet
9. The parent page demonstrates with two different data types (users and products)
10. TypeScript must enforce that the snippet parameter type matches the items array type

## Constraints

- No `<slot>` — use snippets exclusively
- No `{@html}` — all rendering through snippets
- The component must be generic (work with any item type)
- No external iteration libraries

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Snippets are declared with `{#snippet name(params)}...{/snippet}` in the parent and passed as props to the child. The child renders them with `{@render snippetName(args)}`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

For generics with snippets, define the component props with a generic type parameter. The snippet prop type uses `Snippet<[T, number]>` from `'svelte'` to type the parameters. The parent's snippet declaration implicitly picks up the type from the data it passes.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<!-- DataList.svelte -->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  interface Props {
    items: T[];
    loading?: boolean;
    item: Snippet<[T, number]>;
    empty?: Snippet;
  }

  const { items, loading = false, item, empty }: Props = $props();
</script>

{#if loading}
  <!-- skeleton -->
{:else if items.length === 0}
  {#if empty}{@render empty()}{:else}<p>No items</p>{/if}
{:else}
  {#each items as entry, i}
    {@render item(entry, i)}
  {/each}
{/if}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/03/DataList.svelte`**

```svelte
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  interface Props {
    items: T[];
    loading?: boolean;
    item: Snippet<[T, number]>;
    empty?: Snippet;
  }

  const { items, loading = false, item, empty }: Props = $props();
</script>

<div class="data-list">
  {#if loading}
    <div class="skeleton-list">
      {#each Array(3) as _}
        <div class="skeleton-item"></div>
      {/each}
    </div>
  {:else if items.length === 0}
    <div class="empty-state">
      {#if empty}
        {@render empty()}
      {:else}
        <p>No items to display.</p>
      {/if}
    </div>
  {:else}
    <ul class="item-list">
      {#each items as entry, i}
        <li>
          {@render item(entry, i)}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .data-list {
    display: grid;
    gap: var(--space-sm);
  }

  .skeleton-list {
    display: grid;
    gap: var(--space-sm);
  }

  .skeleton-item {
    block-size: 3rem;
    background: var(--color-surface-2);
    border-radius: var(--radius-md);
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .empty-state {
    padding: var(--space-xl);
    text-align: center;
    color: var(--color-text-muted);
    background: var(--color-surface-2);
    border-radius: var(--radius-lg);
  }

  .item-list {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--space-sm);
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-item { animation: none; opacity: 0.5; }
  }
</style>
```

**`src/routes/exercises/03-components/03/+page.svelte`**

```svelte
<script lang="ts">
  import DataList from '$lib/exercises/03/DataList.svelte';

  interface User {
    id: number;
    name: string;
    email: string;
  }

  interface Product {
    sku: string;
    title: string;
    price: number;
  }

  const users: User[] = [
    { id: 1, name: 'Alice Chen', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
    { id: 3, name: 'Carol Davis', email: 'carol@example.com' }
  ];

  const products: Product[] = [
    { sku: 'SKU-001', title: 'Mechanical Keyboard', price: 149.99 },
    { sku: 'SKU-002', title: 'Ultrawide Monitor', price: 599.99 }
  ];

  const emptyList: User[] = [];
  let loading: boolean = $state(false);
</script>

<main class="page">
  <h1>Snippet Render-Prop Pattern</h1>

  <button onclick={() => loading = !loading}>
    Toggle loading: {loading}
  </button>

  <section>
    <h2>Users</h2>
    <DataList items={users} {loading}>
      {#snippet item(user, index)}
        <div class="user-row">
          <span class="index">#{index + 1}</span>
          <strong>{user.name}</strong>
          <span class="email">{user.email}</span>
        </div>
      {/snippet}
    </DataList>
  </section>

  <section>
    <h2>Products</h2>
    <DataList items={products}>
      {#snippet item(product, _index)}
        <div class="product-row">
          <span class="sku">{product.sku}</span>
          <span class="title">{product.title}</span>
          <span class="price">${product.price.toFixed(2)}</span>
        </div>
      {/snippet}
    </DataList>
  </section>

  <section>
    <h2>Empty State (custom snippet)</h2>
    <DataList items={emptyList}>
      {#snippet item(user, _index)}
        <span>{user.name}</span>
      {/snippet}
      {#snippet empty()}
        <div class="custom-empty">
          <p>No users found. Try adjusting your filters.</p>
        </div>
      {/snippet}
    </DataList>
  </section>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }

  section {
    margin-block-end: var(--space-xl);
  }

  button {
    padding: var(--space-sm) var(--space-md);
    background: var(--color-brand);
    color: oklch(100% 0 0);
    font-weight: 600;
    border-radius: var(--radius-md);
    margin-block-end: var(--space-lg);
  }

  .user-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: var(--color-surface-2);
    border-radius: var(--radius-md);
  }

  .index { color: var(--color-text-muted); font-size: var(--text-xs); }
  .email { color: var(--color-text-muted); font-size: var(--text-sm); margin-inline-start: auto; }

  .product-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background: var(--color-surface-2);
    border-radius: var(--radius-md);
    align-items: center;
  }

  .sku { font-size: var(--text-xs); color: var(--color-text-muted); font-family: ui-monospace, monospace; }
  .price { font-weight: 700; color: var(--color-brand); }

  .custom-empty {
    padding: var(--space-lg);
    text-align: center;
  }
</style>
```

### Explanation

Snippets replace both `<slot>` (for content projection) and render props (for delegated rendering). The key advantage is type safety: `Snippet<[T, number]>` ensures the parent's snippet receives exactly the right parameters. The generic `T` on the component means a single `DataList` works for any item type — users, products, or anything else. The component owns the logic (loading, empty, iteration), while the parent owns the presentation of each item. This separation of concerns scales well: you could add pagination, virtual scrolling, or drag-and-drop to `DataList` without touching any consumer code.
</details>
