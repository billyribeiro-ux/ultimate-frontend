---
module: 9
exercise: 4
title: Depends and Invalidation
difficulty: expert
estimated_time: 45
skills_tested:
  - depends() registration
  - invalidate() triggering
  - invalidateAll()
  - custom dependency keys
---

# Exercise 9a.4 — Depends and Invalidation

## Brief

Build a live-updating dashboard that uses SvelteKit's `depends()` and `invalidate()` system to manually control when data reloads. A "Refresh prices" button invalidates only the price data, while a "Refresh all" button invalidates everything. Prove that partial invalidation only reruns the affected load function.

## Requirements

1. Create `src/routes/stocks/+layout.server.ts` that loads a user portfolio with `depends('app:portfolio')`
2. Create `src/routes/stocks/+page.server.ts` that loads stock prices with `depends('app:prices')`
3. Both load functions log a timestamp to prove when they rerun
4. Add a "Refresh Prices" button that calls `invalidate('app:prices')` — only the page load reruns
5. Add a "Refresh All" button that calls `invalidateAll()` — both loads rerun
6. Display the load timestamps visibly so the student can verify partial vs full invalidation
7. Stock prices must show randomized values on each load to prove the data is fresh

## Constraints

- Use custom string keys (not URL-based `depends`)
- No `setInterval` or polling — invalidation must be user-triggered
- The layout load must NOT rerun when only prices are invalidated

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Call `depends('app:prices')` inside your load function to register a custom dependency. Then from the page component, call `invalidate('app:prices')` from `$app/navigation` to trigger only load functions that registered that key.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

`depends()` works like a subscription: the load function says "I depend on this key." `invalidate()` says "this key is stale — rerun anyone who depends on it." `invalidateAll()` reruns everything. The layout load depends on `app:portfolio`, the page load depends on `app:prices`. Invalidating `app:prices` only reruns the page load.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// +page.server.ts
export const load: PageServerLoad = ({ depends }) => {
  depends('app:prices');
  return {
    prices: getRandomPrices(),
    pricesLoadedAt: new Date().toISOString()
  };
};
```

```svelte
<script lang="ts">
  import { invalidate, invalidateAll } from '$app/navigation';
</script>

<button onclick={() => invalidate('app:prices')}>Refresh Prices</button>
<button onclick={() => invalidateAll()}>Refresh All</button>
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/routes/stocks/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ depends }) => {
  depends('app:portfolio');
  console.log('[layout] Portfolio loaded at', new Date().toISOString());

  return {
    portfolio: {
      name: 'Growth Portfolio',
      holdings: ['SVLT', 'RUNE', 'VITE'],
      totalValue: Math.round(Math.random() * 10000 + 50000)
    },
    portfolioLoadedAt: new Date().toISOString()
  };
};
```

```typescript
// src/routes/stocks/+page.server.ts
import type { PageServerLoad } from './$types';

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
}

function getRandomPrices(): StockPrice[] {
  return [
    { symbol: 'SVLT', price: +(120 + Math.random() * 10).toFixed(2), change: +(Math.random() * 6 - 3).toFixed(2) },
    { symbol: 'RUNE', price: +(85 + Math.random() * 8).toFixed(2), change: +(Math.random() * 4 - 2).toFixed(2) },
    { symbol: 'VITE', price: +(200 + Math.random() * 15).toFixed(2), change: +(Math.random() * 8 - 4).toFixed(2) }
  ];
}

export const load: PageServerLoad = ({ depends }) => {
  depends('app:prices');
  console.log('[page] Prices loaded at', new Date().toISOString());

  return {
    prices: getRandomPrices(),
    pricesLoadedAt: new Date().toISOString()
  };
};
```

```svelte
<!-- src/routes/stocks/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div class="stocks-layout">
  <aside class="portfolio-panel">
    <h2>{data.portfolio.name}</h2>
    <p class="total">${data.portfolio.totalValue.toLocaleString()}</p>
    <p class="loaded">Layout loaded: {data.portfolioLoadedAt}</p>
  </aside>

  <main class="main-content">
    {@render children()}
  </main>
</div>

<style>
  .stocks-layout {
    display: grid;
    grid-template-columns: 16rem 1fr;
    min-block-size: 100dvh;
  }

  .portfolio-panel {
    background: var(--color-surface-2);
    padding: var(--space-lg);
    border-inline-end: 1px solid var(--color-border);
  }

  .portfolio-panel h2 {
    font-size: var(--text-lg);
    margin-block-end: var(--space-sm);
  }

  .total {
    font-size: var(--text-2xl);
    font-weight: 700;
    color: oklch(55% 0.2 145);
    margin-block-end: var(--space-md);
  }

  .loaded {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    font-family: monospace;
  }

  .main-content {
    padding: var(--space-lg);
  }
</style>
```

```svelte
<!-- src/routes/stocks/+page.svelte -->
<script lang="ts">
  import { invalidate, invalidateAll } from '$app/navigation';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="stocks-page">
  <header class="controls">
    <h1>Stock Prices</h1>
    <div class="actions">
      <button class="btn" onclick={() => invalidate('app:prices')}>
        Refresh Prices
      </button>
      <button class="btn btn-secondary" onclick={() => invalidateAll()}>
        Refresh All
      </button>
    </div>
  </header>

  <p class="loaded">Prices loaded: {data.pricesLoadedAt}</p>

  <table class="price-table">
    <thead>
      <tr>
        <th>Symbol</th>
        <th>Price</th>
        <th>Change</th>
      </tr>
    </thead>
    <tbody>
      {#each data.prices as stock}
        <tr>
          <td class="symbol">{stock.symbol}</td>
          <td>${stock.price}</td>
          <td class:positive={stock.change > 0} class:negative={stock.change < 0}>
            {stock.change > 0 ? '+' : ''}{stock.change}%
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .stocks-page {
    max-inline-size: 40rem;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-block-end: var(--space-sm);
  }

  h1 {
    font-size: var(--text-2xl);
  }

  .actions {
    display: flex;
    gap: var(--space-sm);
  }

  .btn {
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-sm);
    border: none;
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    background: oklch(55% 0.2 250);
    color: white;
  }

  .btn-secondary {
    background: var(--color-surface-3);
    color: var(--color-text);
  }

  .loaded {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    font-family: monospace;
    margin-block-end: var(--space-lg);
  }

  .price-table {
    inline-size: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: var(--space-sm) var(--space-md);
    text-align: start;
    border-block-end: 1px solid var(--color-border);
  }

  th {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-weight: 600;
  }

  .symbol {
    font-weight: 700;
    font-family: monospace;
  }

  .positive {
    color: oklch(55% 0.2 145);
  }

  .negative {
    color: oklch(55% 0.2 25);
  }
</style>
```

### Explanation

SvelteKit's `depends`/`invalidate` system gives you surgical control over data freshness. Each load function registers the keys it depends on, and `invalidate()` reruns only the loads that depend on the specified key. This is far more efficient than `invalidateAll()`, which reruns every load function on the page. The visual proof: clicking "Refresh Prices" changes the `pricesLoadedAt` timestamp but leaves `portfolioLoadedAt` unchanged, while "Refresh All" updates both. This pattern is essential for dashboards, feeds, and any page where different data sections have different freshness requirements.
</details>
