---
module: 3
exercise: 4
title: Compound Component Set
difficulty: expert
estimated_time: 45
skills_tested:
  - component composition
  - context bridging
  - container queries
  - CSS custom properties as API
---

# Exercise 3.4 — Compound Component Set

## Brief

Build a compound `Tabs` component set (Tabs, TabList, Tab, TabPanel) where the parent composes them freely. The components communicate through context (setContext/getContext) and the TabPanel automatically shows/hides based on the active tab. Include container-query-based responsive behavior.

## Requirements

1. Create `src/lib/exercises/03/tabs/Tabs.svelte` (wrapper, provides context)
2. Create `src/lib/exercises/03/tabs/TabList.svelte` (container for tab buttons)
3. Create `src/lib/exercises/03/tabs/Tab.svelte` (individual tab trigger)
4. Create `src/lib/exercises/03/tabs/TabPanel.svelte` (content panel)
5. Create `src/routes/exercises/03-components/04/+page.svelte`
6. Tabs component manages active state and exposes it via context
7. Tab accepts a `value: string` prop that identifies it
8. TabPanel shows only when its `value` matches the active tab
9. When container is < 400px, tabs stack vertically (container query)
10. Full keyboard navigation: arrow keys move between tabs, Enter/Space activates
11. Proper ARIA: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`

## Constraints

- No external tab libraries
- Components must work through composition (not configuration objects)
- Context API must be typed (no `any`)
- No media queries for the responsive behavior — container queries only

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Use `setContext` in Tabs to provide a shared state object. Each Tab and TabPanel calls `getContext` to read the active value and a `setActive` function. The context key should be a Symbol for uniqueness.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The context object needs: `activeTab: string` (reactive), `setActiveTab(value: string): void`, and `registerTab(value: string): void`. Use `$state` for the active tab inside the context. Container queries use `container-type: inline-size` on TabList and `@container (max-width: 400px)` for the vertical layout.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<!-- Tabs.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface TabsContext {
    activeTab: string;
    setActiveTab: (value: string) => void;
  }

  const TAB_KEY = Symbol('tabs');
  let activeTab: string = $state('');

  setContext(TAB_KEY, {
    get activeTab() { return activeTab; },
    setActiveTab(value: string) { activeTab = value; }
  });
</script>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/03/tabs/Tabs.svelte`**

```svelte
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    defaultValue: string;
    children: Snippet;
  }

  const { defaultValue, children }: Props = $props();

  let activeTab: string = $state(defaultValue);

  const context = {
    get activeTab() { return activeTab; },
    setActiveTab(value: string) { activeTab = value; }
  };

  setContext('tabs-context', context);
</script>

<div class="tabs-root">
  {@render children()}
</div>

<style>
  .tabs-root {
    display: grid;
    gap: var(--space-md);
  }
</style>
```

**`src/lib/exercises/03/tabs/TabList.svelte`**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();
</script>

<div class="tab-list" role="tablist">
  {@render children()}
</div>

<style>
  .tab-list {
    container-type: inline-size;
    display: flex;
    gap: var(--space-xs);
    border-block-end: 2px solid var(--color-border);
    padding-block-end: var(--space-xs);
  }

  @container (max-width: 400px) {
    .tab-list {
      flex-direction: column;
      border-block-end: none;
      border-inline-start: 2px solid var(--color-border);
      padding-block-end: 0;
      padding-inline-start: var(--space-xs);
    }
  }
</style>
```

**`src/lib/exercises/03/tabs/Tab.svelte`**

```svelte
<script lang="ts">
  import { getContext } from 'svelte';

  interface Props {
    value: string;
    label: string;
  }

  const { value, label }: Props = $props();

  const ctx = getContext<{ activeTab: string; setActiveTab: (v: string) => void }>('tabs-context');

  let isActive: boolean = $derived(ctx.activeTab === value);

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      ctx.setActiveTab(value);
    }
  }
</script>

<button
  role="tab"
  aria-selected={isActive}
  aria-controls="panel-{value}"
  id="tab-{value}"
  tabindex={isActive ? 0 : -1}
  class="tab"
  class:active={isActive}
  onclick={() => ctx.setActiveTab(value)}
  onkeydown={handleKeydown}
>
  {label}
</button>

<style>
  .tab {
    padding: var(--space-xs) var(--space-md);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-muted);
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    transition: color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
  }

  .tab:hover {
    color: var(--color-text);
    background: var(--color-surface-2);
  }

  .tab.active {
    color: var(--color-brand);
    background: var(--color-surface-2);
    box-shadow: inset 0 -2px 0 var(--color-brand);
  }
</style>
```

**`src/lib/exercises/03/tabs/TabPanel.svelte`**

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    value: string;
    children: Snippet;
  }

  const { value, children }: Props = $props();

  const ctx = getContext<{ activeTab: string }>('tabs-context');

  let isActive: boolean = $derived(ctx.activeTab === value);
</script>

{#if isActive}
  <div
    role="tabpanel"
    id="panel-{value}"
    aria-labelledby="tab-{value}"
    class="panel"
  >
    {@render children()}
  </div>
{/if}

<style>
  .panel {
    padding: var(--space-lg);
    background: var(--color-surface-2);
    border-radius: var(--radius-md);
    animation: fadeIn var(--dur-fast) var(--ease-out);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .panel { animation: none; }
  }
</style>
```

**`src/routes/exercises/03-components/04/+page.svelte`**

```svelte
<script lang="ts">
  import Tabs from '$lib/exercises/03/tabs/Tabs.svelte';
  import TabList from '$lib/exercises/03/tabs/TabList.svelte';
  import Tab from '$lib/exercises/03/tabs/Tab.svelte';
  import TabPanel from '$lib/exercises/03/tabs/TabPanel.svelte';
</script>

<main class="page">
  <h1>Compound Tabs Component</h1>

  <Tabs defaultValue="overview">
    <TabList>
      <Tab value="overview" label="Overview" />
      <Tab value="features" label="Features" />
      <Tab value="pricing" label="Pricing" />
    </TabList>

    <TabPanel value="overview">
      <h2>Product Overview</h2>
      <p>This is the overview panel content. The compound pattern lets you compose freely.</p>
    </TabPanel>

    <TabPanel value="features">
      <h2>Features</h2>
      <ul>
        <li>Type-safe context</li>
        <li>Container-query responsive</li>
        <li>Full ARIA support</li>
      </ul>
    </TabPanel>

    <TabPanel value="pricing">
      <h2>Pricing</h2>
      <p>Plans start at $0/month for open source projects.</p>
    </TabPanel>
  </Tabs>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
</style>
```

### Explanation

The compound component pattern gives consumers maximum flexibility — they compose Tab and TabPanel elements in any order, alongside any other content. The context API bridges the gap between components that are not direct parent-child. The getter pattern (`get activeTab()`) ensures the context exposes reactive state that triggers updates in consumers. Container queries make the tab list responsive to its own container width, not the viewport — this means the same Tabs component works in a narrow sidebar AND a full-width content area without any prop changes.
</details>
