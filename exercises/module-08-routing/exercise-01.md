---
module: 8
exercise: 1
title: Multi-Layout Application Shell
difficulty: beginner
estimated_time: 10
skills_tested:
  - file-based routing
  - nested layouts
  - scoped styles with PE7 tokens
---

# Exercise 8.1 — Multi-Layout Application Shell

## Brief

Build a SvelteKit application with two distinct layout groups: a marketing layout (top nav, full-width hero) and a dashboard layout (sidebar nav, constrained content area). Both share a root layout with a global header.

## Requirements

1. Create a root layout at `src/routes/+layout.svelte` with a `<header>` containing a site logo and a `{@render children()}` slot
2. Create a `(marketing)` route group with its own `+layout.svelte` that renders a horizontal navigation bar and a full-width content area
3. Create a `(dashboard)` route group with its own `+layout.svelte` that renders a sidebar navigation and a constrained main content area
4. Add at least two pages inside each group: `(marketing)/+page.svelte`, `(marketing)/about/+page.svelte`, `(dashboard)/+page.svelte`, `(dashboard)/settings/+page.svelte`
5. Use PE7 tokens for all spacing, colors, and typography
6. The sidebar in the dashboard layout must use CSS Grid or Flexbox with logical properties
7. Navigation links must use `<a>` tags with `href` attributes (SvelteKit handles client-side routing automatically)

## Constraints

- No JavaScript-based layout switching — use SvelteKit route groups only
- No raw pixel or color values — PE7 tokens only
- Both layouts must be responsive (stack on mobile, side-by-side on desktop)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

SvelteKit route groups use parentheses in folder names: `src/routes/(marketing)/` and `src/routes/(dashboard)/`. Each group can have its own `+layout.svelte` that wraps only the pages inside that group. The root `+layout.svelte` wraps everything.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The directory structure looks like:
```
src/routes/
  +layout.svelte          ← root (global header)
  (marketing)/
    +layout.svelte        ← marketing nav
    +page.svelte          ← home
    about/+page.svelte
  (dashboard)/
    +layout.svelte        ← sidebar nav
    +page.svelte          ← dashboard home
    settings/+page.svelte
```
Each layout receives `children` as a snippet and renders it with `{@render children()}`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<!-- src/routes/(dashboard)/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<div class="dashboard-shell">
  <nav class="sidebar">
    <a href="/settings">Settings</a>
  </nav>
  <main class="content">
    {@render children()}
  </main>
</div>

<style>
  .dashboard-shell {
    display: grid;
    grid-template-columns: 16rem 1fr;
    min-block-size: 100dvh;
  }

  .sidebar {
    background: var(--color-surface-2);
    padding: var(--space-md);
  }

  .content {
    padding: var(--space-lg);
    max-inline-size: 60rem;
  }
</style>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<header class="global-header">
  <a href="/" class="logo">MyApp</a>
</header>

{@render children()}

<style>
  .global-header {
    display: flex;
    align-items: center;
    padding-inline: var(--space-md);
    padding-block: var(--space-sm);
    background: var(--color-surface-1);
    border-block-end: 1px solid var(--color-border);
  }

  .logo {
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;
  }
</style>
```

```svelte
<!-- src/routes/(marketing)/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<nav class="marketing-nav">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

<main class="marketing-content">
  {@render children()}
</main>

<style>
  .marketing-nav {
    display: flex;
    gap: var(--space-md);
    justify-content: center;
    padding-block: var(--space-sm);
    background: var(--color-surface-2);
  }

  .marketing-nav a {
    color: var(--color-text);
    text-decoration: none;
    font-size: var(--text-sm);
  }

  .marketing-content {
    max-inline-size: 80rem;
    margin-inline: auto;
    padding: var(--space-lg);
  }
</style>
```

```svelte
<!-- src/routes/(dashboard)/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<div class="dashboard-shell">
  <nav class="sidebar">
    <ul class="nav-list">
      <li><a href="/dashboard">Dashboard</a></li>
      <li><a href="/dashboard/settings">Settings</a></li>
    </ul>
  </nav>
  <main class="content">
    {@render children()}
  </main>
</div>

<style>
  .dashboard-shell {
    display: grid;
    grid-template-columns: 1fr;
    min-block-size: calc(100dvh - 3rem);
  }

  @media (min-width: 48rem) {
    .dashboard-shell {
      grid-template-columns: 16rem 1fr;
    }
  }

  .sidebar {
    background: var(--color-surface-2);
    padding: var(--space-md);
    border-inline-end: 1px solid var(--color-border);
  }

  .nav-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .nav-list a {
    display: block;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    color: var(--color-text);
    text-decoration: none;
  }

  .nav-list a:hover {
    background: var(--color-surface-3);
  }

  .content {
    padding: var(--space-lg);
    max-inline-size: 60rem;
  }
</style>
```

### Explanation

SvelteKit route groups (parenthesized folder names) let you apply different layouts to different sections of your app without affecting the URL structure. The `(marketing)` and `(dashboard)` folders do not appear in the URL. Each group's `+layout.svelte` wraps only pages within that group, while the root `+layout.svelte` wraps everything. This pattern scales well: you can add `(auth)`, `(admin)`, or `(docs)` groups without any routing logic changes. The layouts compose naturally — root layout renders its children, which is the group layout, which renders its children, which is the page.
</details>
