---
module: 12
exercise: 2
title: Lazy Loading with Dynamic Import
difficulty: intermediate
estimated_time: 20
skills_tested:
  - dynamic import()
  - Svelte component lazy loading
  - loading states
  - bundle splitting
---

# Exercise 12.2 — Lazy Loading with Dynamic Import

## Brief

Build a page with a heavy component (chart/data visualization) that is lazy-loaded only when the user clicks a "Show Chart" button. Before loading, a skeleton placeholder is shown. After loading, the component renders with a smooth transition.

## Requirements

1. Create a "heavy" component `src/lib/components/HeavyChart.svelte` that simulates a complex visualization (SVG bar chart with at least 10 bars)
2. Create `src/routes/dashboard/+page.svelte` with a button to load the chart
3. Use `import()` to dynamically import `HeavyChart` when the button is clicked
4. Show a skeleton placeholder while the component loads
5. Once loaded, render the component with a fade transition
6. Track and display the load state: 'idle' | 'loading' | 'loaded' | 'error'
7. Include an error state with a retry button

## Constraints

- The heavy component must NOT be in the initial bundle — verify with a code comment explaining why `import()` achieves this
- No third-party charting libraries — build a simple SVG chart
- The skeleton must match the chart's dimensions
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`const module = await import('$lib/components/HeavyChart.svelte')` returns a module object. The default export is `module.default`. Store it in a `$state` variable and render it with `<svelte:component this={component} />`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Track the state machine: `idle` (show button), `loading` (show skeleton), `loaded` (show component), `error` (show retry). The dynamic import is a Promise, so use try/catch. Vite automatically code-splits at dynamic import boundaries.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  import type { ComponentType } from 'svelte';

  let ChartComponent = $state<ComponentType | null>(null);
  let status = $state<'idle' | 'loading' | 'loaded' | 'error'>('idle');

  async function loadChart() {
    status = 'loading';
    try {
      const mod = await import('$lib/components/HeavyChart.svelte');
      ChartComponent = mod.default;
      status = 'loaded';
    } catch {
      status = 'error';
    }
  }
</script>
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```svelte
<!-- src/lib/components/HeavyChart.svelte -->
<script lang="ts">
  interface DataPoint {
    label: string;
    value: number;
  }

  const data: DataPoint[] = [
    { label: 'Jan', value: 65 }, { label: 'Feb', value: 78 },
    { label: 'Mar', value: 52 }, { label: 'Apr', value: 91 },
    { label: 'May', value: 84 }, { label: 'Jun', value: 73 },
    { label: 'Jul', value: 95 }, { label: 'Aug', value: 68 },
    { label: 'Sep', value: 82 }, { label: 'Oct', value: 76 }
  ];

  const maxValue = Math.max(...data.map((d) => d.value));
  const barWidth = 40;
  const gap = 12;
  const chartHeight = 200;
  const chartWidth = data.length * (barWidth + gap);
</script>

<div class="chart-container">
  <h3>Monthly Performance</h3>
  <svg viewBox="0 0 {chartWidth} {chartHeight + 30}" class="chart">
    {#each data as point, i}
      {@const barHeight = (point.value / maxValue) * chartHeight}
      <rect
        x={i * (barWidth + gap)}
        y={chartHeight - barHeight}
        width={barWidth}
        height={barHeight}
        fill="oklch(55% 0.2 250)"
        rx="4"
      />
      <text
        x={i * (barWidth + gap) + barWidth / 2}
        y={chartHeight + 20}
        text-anchor="middle"
        fill="currentColor"
        font-size="11"
      >
        {point.label}
      </text>
    {/each}
  </svg>
</div>

<style>
  .chart-container {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
  }

  h3 {
    font-size: var(--text-lg);
    margin-block-end: var(--space-md);
    color: var(--color-text);
  }

  .chart {
    inline-size: 100%;
    block-size: auto;
    color: var(--color-text-muted);
  }
</style>
```

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { ComponentType } from 'svelte';

  let ChartComponent = $state<ComponentType | null>(null);
  let status = $state<'idle' | 'loading' | 'loaded' | 'error'>('idle');

  async function loadChart() {
    status = 'loading';
    try {
      // Dynamic import creates a separate chunk — HeavyChart is NOT in the initial bundle.
      // Vite code-splits at every import() boundary automatically.
      const mod = await import('$lib/components/HeavyChart.svelte');
      ChartComponent = mod.default;
      status = 'loaded';
    } catch {
      status = 'error';
    }
  }
</script>

<div class="dashboard">
  <h1>Dashboard</h1>

  <div class="chart-section">
    {#if status === 'idle'}
      <button class="load-btn" onclick={loadChart}>
        Show Performance Chart
      </button>
    {/if}

    {#if status === 'loading'}
      <div class="skeleton" aria-busy="true" aria-label="Loading chart">
        <div class="skeleton-bars">
          {#each Array(10) as _, i}
            <div class="skeleton-bar" style:block-size="{30 + Math.random() * 70}%" style:animation-delay="{i * 80}ms"></div>
          {/each}
        </div>
      </div>
    {/if}

    {#if status === 'loaded' && ChartComponent}
      <div transition:fade={{ duration: 300 }}>
        <svelte:component this={ChartComponent} />
      </div>
    {/if}

    {#if status === 'error'}
      <div class="error-state">
        <p>Failed to load chart component</p>
        <button class="retry-btn" onclick={loadChart}>Retry</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .dashboard { max-inline-size: 40rem; margin-inline: auto; padding: var(--space-lg); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-xl); }

  .load-btn { padding: var(--space-sm) var(--space-lg); background: oklch(55% 0.2 250); color: white; border: none; border-radius: var(--radius-sm); font-size: var(--text-base); font-weight: 600; cursor: pointer; }

  .skeleton { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-lg); block-size: 16rem; }
  .skeleton-bars { display: flex; align-items: flex-end; gap: var(--space-xs); block-size: 100%; }
  .skeleton-bar { flex: 1; background: var(--color-surface-3); border-radius: var(--radius-sm); animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @media (prefers-reduced-motion: reduce) { .skeleton-bar { animation: none; } }

  .error-state { text-align: center; padding: var(--space-xl); background: var(--color-surface-2); border: 1px solid oklch(55% 0.2 25); border-radius: var(--radius-md); }
  .error-state p { color: oklch(55% 0.2 25); margin-block-end: var(--space-md); }
  .retry-btn { padding: var(--space-xs) var(--space-md); background: oklch(55% 0.2 25); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; }
</style>
```

### Explanation

Dynamic `import()` tells Vite to create a separate JavaScript chunk for the imported module. The chart component's code is not included in the page's initial bundle, reducing the amount of JavaScript the browser must download and parse before the page becomes interactive. The state machine (`idle` / `loading` / `loaded` / `error`) provides clear UX for each phase. The skeleton placeholder prevents layout shift by reserving the chart's space. The fade transition makes the swap smooth. This pattern is essential for dashboard widgets, modals, and any component that not every user will see.
</details>
