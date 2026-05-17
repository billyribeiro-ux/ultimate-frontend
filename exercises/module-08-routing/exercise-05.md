---
module: 8
exercise: 5
title: Hybrid Rendering Strategy
difficulty: principal
estimated_time: 60
skills_tested:
  - page options
  - prerender
  - ssr toggle
  - csr toggle
  - adapter configuration
---

# Exercise 8.5 — Hybrid Rendering Strategy

## Brief

Build a SvelteKit application that uses three different rendering strategies on different routes: a fully prerendered marketing page, a server-rendered dashboard with CSR hydration, and a client-only interactive canvas page. Prove each strategy works by inspecting network responses and documenting the trade-offs.

## Requirements

1. Create a marketing page at `src/routes/(marketing)/+page.svelte` with `export const prerender = true` in its `+page.ts`
2. Create a dashboard at `src/routes/(app)/dashboard/+page.svelte` with default SSR + CSR (no overrides needed)
3. Create a canvas page at `src/routes/(app)/canvas/+page.svelte` with `export const ssr = false` in its `+page.ts` (renders only on the client)
4. Create a shared layout at `src/routes/(app)/+layout.svelte` with sidebar navigation
5. Add a `<RenderInfo />` component that displays the current rendering mode by checking `typeof window`, `$app/environment`'s `browser` flag, and the `building` flag
6. Each page must show its rendering strategy in a visible badge
7. The marketing page must include `<svelte:head>` with full SEO meta tags

## Constraints

- No runtime rendering-mode detection hacks — use SvelteKit's official page options
- The canvas page must use `onMount` to prove it only runs client-side
- All pages share one PE7 design token system

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Page options (`prerender`, `ssr`, `csr`) are exported from `+page.ts` or `+page.server.ts`. They control SvelteKit's rendering behavior per-route. The `browser` and `building` variables from `$app/environment` tell you at runtime which context you are in.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Prerendered pages are built to static HTML at build time — their load functions run once during `vite build`. SSR=false pages get an empty HTML shell and render entirely in the browser. Default pages get SSR on first load and then CSR for subsequent navigations. Use `onMount` on the canvas page to initialize a `<canvas>` element.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// src/routes/(marketing)/+page.ts
export const prerender = true;
```

```typescript
// src/routes/(app)/canvas/+page.ts
export const ssr = false;
```

```svelte
<!-- src/lib/components/RenderInfo.svelte -->
<script lang="ts">
  import { browser, building } from '$app/environment';

  let mode = $derived(
    building ? 'prerender' :
    browser ? 'client' : 'server'
  );
</script>

<span class="badge" data-mode={mode}>{mode}</span>
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/routes/(marketing)/+page.ts
export const prerender = true;
```

```svelte
<!-- src/routes/(marketing)/+page.svelte -->
<script lang="ts">
  import RenderInfo from '$lib/components/RenderInfo.svelte';
</script>

<svelte:head>
  <title>Acme — Build Better Software</title>
  <meta name="description" content="Acme helps teams build better software with modern tools." />
  <meta property="og:title" content="Acme — Build Better Software" />
  <meta property="og:type" content="website" />
</svelte:head>

<div class="hero">
  <RenderInfo />
  <h1>Build Better Software</h1>
  <p>This page is fully prerendered at build time. No server needed.</p>
</div>

<style>
  .hero {
    min-block-size: 60dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-2xl);
  }

  h1 {
    font-size: var(--text-3xl);
    color: var(--color-text);
    margin-block-end: var(--space-md);
  }

  p {
    font-size: var(--text-lg);
    color: var(--color-text-muted);
    max-inline-size: 40rem;
  }
</style>
```

```typescript
// src/routes/(app)/canvas/+page.ts
export const ssr = false;
```

```svelte
<!-- src/routes/(app)/canvas/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import RenderInfo from '$lib/components/RenderInfo.svelte';

  let canvas = $state<HTMLCanvasElement>();
  let mounted = $state(false);

  onMount(() => {
    mounted = true;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'oklch(65% 0.2 280)';
    ctx.fillRect(20, 20, 200, 100);
    ctx.fillStyle = 'oklch(90% 0.05 280)';
    ctx.font = '16px system-ui';
    ctx.fillText('Client-only canvas', 40, 78);
  });
</script>

<div class="canvas-page">
  <RenderInfo />
  <h1>Interactive Canvas</h1>
  <p>SSR is disabled. This page renders only in the browser.</p>

  {#if mounted}
    <canvas bind:this={canvas} width={400} height={300} class="drawing-area"></canvas>
  {:else}
    <div class="placeholder">Loading canvas...</div>
  {/if}
</div>

<style>
  .canvas-page {
    padding: var(--space-lg);
  }

  h1 {
    font-size: var(--text-2xl);
    color: var(--color-text);
    margin-block-end: var(--space-sm);
  }

  p {
    color: var(--color-text-muted);
    margin-block-end: var(--space-lg);
  }

  .drawing-area {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-1);
  }

  .placeholder {
    inline-size: 400px;
    block-size: 300px;
    display: grid;
    place-items: center;
    background: var(--color-surface-2);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
  }
</style>
```

```svelte
<!-- src/routes/(app)/dashboard/+page.svelte -->
<script lang="ts">
  import RenderInfo from '$lib/components/RenderInfo.svelte';

  const stats = [
    { label: 'Users', value: 1_234 },
    { label: 'Revenue', value: 56_789 },
    { label: 'Uptime', value: 99.97 }
  ];
</script>

<div class="dashboard">
  <RenderInfo />
  <h1>Dashboard</h1>
  <p>Default rendering: SSR on first load, CSR on navigation.</p>

  <div class="stats-grid">
    {#each stats as stat}
      <div class="stat-card">
        <span class="stat-value">{stat.value.toLocaleString()}</span>
        <span class="stat-label">{stat.label}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .dashboard {
    padding: var(--space-lg);
  }

  h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-sm);
  }

  p {
    color: var(--color-text-muted);
    margin-block-end: var(--space-lg);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: var(--space-md);
  }

  .stat-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
  }

  .stat-value {
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--color-text);
  }

  .stat-label {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
</style>
```

```svelte
<!-- src/lib/components/RenderInfo.svelte -->
<script lang="ts">
  import { browser, building } from '$app/environment';

  let mode = $derived(
    building ? 'prerender' :
    browser ? 'client' : 'server'
  );
</script>

<span class="render-badge" data-mode={mode}>
  {mode}
</span>

<style>
  .render-badge {
    display: inline-block;
    padding: var(--space-2xs) var(--space-sm);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-block-end: var(--space-md);
  }

  .render-badge[data-mode='prerender'] {
    background: oklch(85% 0.15 145);
    color: oklch(25% 0.05 145);
  }

  .render-badge[data-mode='server'] {
    background: oklch(85% 0.15 250);
    color: oklch(25% 0.05 250);
  }

  .render-badge[data-mode='client'] {
    background: oklch(85% 0.15 30);
    color: oklch(25% 0.05 30);
  }
</style>
```

### Explanation

SvelteKit's rendering strategy is controlled per-route via page options. `prerender = true` runs the load function at build time and emits a static HTML file — perfect for content that rarely changes. The default SSR+CSR mode renders on the server for the first request (great for SEO and initial load performance) and then hydrates for client-side navigation. `ssr = false` skips server rendering entirely, which is necessary for pages that depend on browser-only APIs like Canvas or WebGL. The `RenderInfo` component proves which mode is active by reading `$app/environment`. In production, you would combine these strategies with adapter-specific configuration (e.g., `adapter-static` for fully prerendered sites, `adapter-node` for hybrid).
</details>
