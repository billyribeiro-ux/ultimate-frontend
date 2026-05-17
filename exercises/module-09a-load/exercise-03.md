---
module: 9
exercise: 3
title: Streaming UX with Suspense
difficulty: advanced
estimated_time: 30
skills_tested:
  - streaming promises from load
  - Svelte await blocks
  - skeleton loading states
---

# Exercise 9a.3 — Streaming UX with Suspense

## Brief

Build a page that streams slow data to the client using SvelteKit's promise-return pattern. The page renders immediately with fast data, then progressively fills in slow sections as their promises resolve, using skeleton placeholders in the meantime.

## Requirements

1. Create `src/routes/feed/+page.server.ts` that returns an object with `fast` (immediate data) and `slow` (an unresolved Promise that takes 2 seconds)
2. The `fast` data is a page title and description (awaited before return)
3. The `slow` data is a Promise of an array of feed items (not awaited — returned as a Promise)
4. Create `src/routes/feed/+page.svelte` that renders the fast data immediately
5. Use Svelte's `{#await data.slow}` block to show a skeleton loader while the slow data streams in
6. The skeleton must have pulsing animation using PE7 motion tokens
7. Handle the error case in the `{:catch}` block with a styled error message

## Constraints

- Do NOT await the slow data in the load function — return the raw Promise
- The skeleton must match the layout of the final content (same heights and widths)
- All animation respects `prefers-reduced-motion`

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

When a load function returns an unresolved Promise as a property value, SvelteKit streams the response. The page renders immediately with the resolved properties, and the Promise properties resolve later. Use `{#await promise}` in the template to handle loading, success, and error states.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Structure the load return as `{ title: 'Feed', items: slowPromise }` where `slowPromise` is not awaited. In the template, `{#await data.items}` shows the skeleton, `{:then items}` renders the list, and `{:catch error}` handles failures.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
export const load: PageServerLoad = async () => {
  const slowItems = fetchItems(); // NOT awaited

  return {
    title: 'Activity Feed',
    items: slowItems // Promise<Item[]>
  };
};
```

```svelte
{#await data.items}
  <div class="skeleton-list">
    {#each Array(5) as _}
      <div class="skeleton-row"></div>
    {/each}
  </div>
{:then items}
  {#each items as item}
    <article>{item.title}</article>
  {/each}
{:catch err}
  <p class="error">{err.message}</p>
{/await}
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/routes/feed/+page.server.ts
import type { PageServerLoad } from './$types';

interface FeedItem {
  id: number;
  title: string;
  author: string;
  summary: string;
  timestamp: string;
}

async function fetchItems(): Promise<FeedItem[]> {
  await new Promise((r) => setTimeout(r, 2000));
  return [
    { id: 1, title: 'Svelte 5 Released', author: 'Rich Harris', summary: 'The runes update is now stable.', timestamp: '2 hours ago' },
    { id: 2, title: 'CSS Layers in Production', author: 'Miriam Suzanne', summary: 'How cascade layers change everything.', timestamp: '5 hours ago' },
    { id: 3, title: 'TypeScript 5.8 Features', author: 'Daniel Rosenwasser', summary: 'New erasableSyntaxOnly and more.', timestamp: '1 day ago' },
    { id: 4, title: 'GSAP 3.13 Improvements', author: 'Jack Doyle', summary: 'ScrollTrigger performance boosts.', timestamp: '2 days ago' },
    { id: 5, title: 'Vite 7 is Here', author: 'Evan You', summary: 'Faster builds, better tree shaking.', timestamp: '3 days ago' }
  ];
}

export const load: PageServerLoad = async () => {
  return {
    title: 'Activity Feed',
    description: 'Latest updates from the community',
    items: fetchItems()
  };
};
```

```svelte
<!-- src/routes/feed/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="feed-page">
  <header class="feed-header">
    <h1>{data.title}</h1>
    <p>{data.description}</p>
  </header>

  {#await data.items}
    <div class="skeleton-list" aria-busy="true" aria-label="Loading feed items">
      {#each Array(5) as _, i}
        <div class="skeleton-card" style:animation-delay="{i * 100}ms">
          <div class="skeleton-title"></div>
          <div class="skeleton-meta"></div>
          <div class="skeleton-body"></div>
        </div>
      {/each}
    </div>
  {:then items}
    <div class="feed-list">
      {#each items as item (item.id)}
        <article class="feed-card">
          <h2>{item.title}</h2>
          <div class="meta">
            <span class="author">{item.author}</span>
            <time>{item.timestamp}</time>
          </div>
          <p>{item.summary}</p>
        </article>
      {/each}
    </div>
  {:catch err}
    <div class="error-state">
      <h2>Failed to load feed</h2>
      <p>{err.message}</p>
      <a href="/feed">Try again</a>
    </div>
  {/await}
</div>

<style>
  .feed-page {
    max-inline-size: 40rem;
    margin-inline: auto;
    padding: var(--space-lg);
  }

  .feed-header {
    margin-block-end: var(--space-xl);
  }

  .feed-header h1 {
    font-size: var(--text-2xl);
    color: var(--color-text);
    margin-block-end: var(--space-xs);
  }

  .feed-header p {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .skeleton-list,
  .feed-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .skeleton-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-title {
    block-size: 1.25rem;
    inline-size: 70%;
    background: var(--color-surface-3);
    border-radius: var(--radius-sm);
    margin-block-end: var(--space-sm);
  }

  .skeleton-meta {
    block-size: 0.875rem;
    inline-size: 40%;
    background: var(--color-surface-3);
    border-radius: var(--radius-sm);
    margin-block-end: var(--space-sm);
  }

  .skeleton-body {
    block-size: 0.875rem;
    inline-size: 90%;
    background: var(--color-surface-3);
    border-radius: var(--radius-sm);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-card {
      animation: none;
    }
  }

  .feed-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
  }

  .feed-card h2 {
    font-size: var(--text-lg);
    color: var(--color-text);
    margin-block-end: var(--space-xs);
  }

  .meta {
    display: flex;
    gap: var(--space-md);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-end: var(--space-sm);
  }

  .author {
    font-weight: 600;
  }

  .feed-card p {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  .error-state {
    text-align: center;
    padding: var(--space-2xl);
    background: var(--color-surface-2);
    border: 1px solid oklch(55% 0.2 25);
    border-radius: var(--radius-md);
  }

  .error-state h2 {
    color: oklch(55% 0.2 25);
    margin-block-end: var(--space-sm);
  }

  .error-state a {
    color: var(--color-accent);
  }
</style>
```

### Explanation

Streaming lets SvelteKit send the HTML shell immediately with fast data, then flush the slow data as it resolves. The browser renders the skeleton first, then swaps in the real content without a full page reload. This is a massive UX improvement for pages with mixed-speed data sources. The key insight is that you do NOT await the slow promise in the load function — you return it as-is. SvelteKit handles the streaming protocol. The skeleton dimensions match the final content to prevent layout shift (CLS). The `prefers-reduced-motion` media query disables the pulse animation for users who need it.
</details>
