---
module: 9
exercise: 1
title: Typed Load Function
difficulty: beginner
estimated_time: 10
skills_tested:
  - page.server.ts load
  - auto-generated types
  - PageData consumption
---

# Exercise 9a.1 — Typed Load Function

## Brief

Create a product detail page that loads data from a server-side load function with full end-to-end type safety using SvelteKit's auto-generated types. The page must display product information with types flowing from load to template without a single manual type annotation in the page component.

## Requirements

1. Create `src/routes/products/[id]/+page.server.ts` with a `load` function that returns a typed product object
2. Define a `Product` interface with `id: string`, `name: string`, `price: number`, `description: string`, and `inStock: boolean`
3. The load function must read `params.id` and return the matching product from a hardcoded array
4. If no product matches, throw `error(404, 'Product not found')`
5. Create `src/routes/products/[id]/+page.svelte` that receives `data` via `$props()` typed as `PageData`
6. Display all product fields with PE7-styled card layout
7. The price must format using `Intl.NumberFormat`

## Constraints

- Use `+page.server.ts` (not `+page.ts`) — the data must load server-side only
- Import `PageData` from `./$types` — do not define it manually
- No `any` or `unknown` casts

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

SvelteKit generates types in `.svelte-kit/types/` automatically. When you import `PageServerLoad` from `./$types`, the return type of your load function flows through to `PageData` in the page component.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The load function receives `{ params }` typed with the route's parameter shape. Since the route is `[id]`, `params.id` is a string. Return a plain object — SvelteKit serializes it and delivers it as `data` to the page.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// src/routes/products/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
}

const products: Product[] = [/* ... */];

export const load: PageServerLoad = ({ params }) => {
  const product = products.find(p => p.id === params.id);
  if (!product) error(404, 'Product not found');
  return { product };
};
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/routes/products/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
}

const products: Product[] = [
  { id: 'sv-001', name: 'Svelte Starter Kit', price: 49.99, description: 'Everything you need to start building with Svelte 5.', inStock: true },
  { id: 'sv-002', name: 'TypeScript Masterclass', price: 79.99, description: 'Deep dive into TypeScript for frontend developers.', inStock: true },
  { id: 'sv-003', name: 'PE7 Token System', price: 29.99, description: 'A complete design token system for modern CSS.', inStock: false }
];

export const load: PageServerLoad = ({ params }) => {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    error(404, 'Product not found');
  }

  return { product };
};
```

```svelte
<!-- src/routes/products/[id]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });
</script>

<article class="product-card">
  <div class="header">
    <h1>{data.product.name}</h1>
    <span class="price">{formatter.format(data.product.price)}</span>
  </div>

  <p class="description">{data.product.description}</p>

  <div class="footer">
    <span class="stock" class:out-of-stock={!data.product.inStock}>
      {data.product.inStock ? 'In Stock' : 'Out of Stock'}
    </span>
    <span class="id">ID: {data.product.id}</span>
  </div>
</article>

<style>
  .product-card {
    max-inline-size: 36rem;
    margin-inline: auto;
    padding: var(--space-xl);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-block-end: var(--space-md);
  }

  h1 {
    font-size: var(--text-xl);
    color: var(--color-text);
  }

  .price {
    font-size: var(--text-lg);
    font-weight: 700;
    color: oklch(55% 0.2 145);
  }

  .description {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    line-height: 1.6;
    margin-block-end: var(--space-lg);
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-block-start: var(--space-md);
    border-block-start: 1px solid var(--color-border);
  }

  .stock {
    font-size: var(--text-sm);
    font-weight: 600;
    color: oklch(55% 0.2 145);
  }

  .stock.out-of-stock {
    color: oklch(55% 0.2 25);
  }

  .id {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    font-family: monospace;
  }
</style>
```

### Explanation

SvelteKit's auto-generated types create an end-to-end type chain: the return type of `load` becomes `PageData`, which the page component receives via `$props()`. You never manually synchronize types between server and client. The `error()` helper throws a typed error that SvelteKit catches and renders using the nearest `+error.svelte` boundary. This pattern is the foundation of every data-driven page in a SvelteKit application and eliminates an entire class of bugs where the page expects data the server does not provide.
</details>
