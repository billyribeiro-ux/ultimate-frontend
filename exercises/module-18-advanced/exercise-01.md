---
module: 18
exercise: 1
title: Compound Component
difficulty: beginner
estimated_time: 10
skills_tested:
  - setContext and getContext
  - component composition
  - shared state across component tree
  - snippet-based content projection
---

# Exercise 18.1 — Compound Component

## Brief

Build an Accordion compound component where `<Accordion>`, `<AccordionItem>`, and `<AccordionTrigger>`/`<AccordionContent>` work together through shared context. The parent manages which items are open, and child components read and update that state via context. This exercise teaches the compound component pattern — a way to create APIs that feel like HTML elements but carry shared behavior.

## Requirements

1. Create `src/lib/exercises/18/Accordion.svelte` — the root component that manages open state
2. Create `src/lib/exercises/18/AccordionItem.svelte` — wraps a single collapsible section
3. Create `src/lib/exercises/18/AccordionTrigger.svelte` — the clickable header that toggles the item
4. Create `src/lib/exercises/18/AccordionContent.svelte` — the content that shows/hides
5. The root `Accordion` must use `setContext` to share open state and a toggle function
6. `AccordionItem` must register itself and pass its ID via context to its children
7. Only one item can be open at a time (exclusive mode)
8. Create `src/routes/exercises/18-advanced/01/+page.svelte` demonstrating the accordion with 3 items
9. Style with PE7 tokens — smooth open/close transitions

## Constraints

- No prop drilling — all state sharing via context
- TypeScript strict mode with zero errors
- The accordion must be keyboard-accessible (Enter/Space to toggle)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

The Accordion root calls `setContext('accordion', { openId, toggle })` where `openId` is a `$state` and `toggle` is a function. Each AccordionItem calls `setContext('accordion-item', { id })` and `getContext('accordion')` to check if its ID matches `openId`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Use a unique ID per item (passed as a prop or auto-generated). The trigger calls `toggle(id)` from context. The content renders conditionally based on `openId === id`. For transitions, wrap the content in a `div` with `style="max-height"` transitions or use Svelte's `slide` transition.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<!-- Accordion.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  let openId: string | null = $state(null);

  setContext('accordion', {
    get openId() { return openId; },
    toggle(id: string) { openId = openId === id ? null : id; }
  });

  let { children }: { children: Snippet } = $props();
</script>

<div class="accordion">
  {@render children()}
</div>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/18/Accordion.svelte`**

```svelte
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface AccordionContext {
    readonly openId: string | null;
    toggle: (id: string) => void;
  }

  let openId: string | null = $state(null);

  const ctx: AccordionContext = {
    get openId() { return openId; },
    toggle(id: string) {
      openId = openId === id ? null : id;
    }
  };

  setContext<AccordionContext>('accordion', ctx);

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="accordion" role="region">
  {@render children()}
</div>

<style>
  .accordion {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
</style>
```

**`src/lib/exercises/18/AccordionItem.svelte`**

```svelte
<script lang="ts">
  import { setContext, getContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface AccordionContext {
    readonly openId: string | null;
    toggle: (id: string) => void;
  }

  interface Props {
    id: string;
    children: Snippet;
  }

  let { id, children }: Props = $props();

  const accordion = getContext<AccordionContext>('accordion');

  setContext('accordion-item', {
    get id() { return id; },
    get isOpen() { return accordion.openId === id; }
  });
</script>

<div class="accordion-item">
  {@render children()}
</div>

<style>
  .accordion-item {
    border-block-end: 1px solid var(--color-border);
  }

  .accordion-item:last-child {
    border-block-end: none;
  }
</style>
```

**`src/lib/exercises/18/AccordionTrigger.svelte`**

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface AccordionContext {
    readonly openId: string | null;
    toggle: (id: string) => void;
  }

  interface ItemContext {
    readonly id: string;
    readonly isOpen: boolean;
  }

  const accordion = getContext<AccordionContext>('accordion');
  const item = getContext<ItemContext>('accordion-item');

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<button
  class="trigger"
  aria-expanded={item.isOpen}
  onclick={() => accordion.toggle(item.id)}
>
  <span class="trigger-text">{@render children()}</span>
  <span class="trigger-icon" class:open={item.isOpen}>&#9656;</span>
</button>

<style>
  .trigger {
    inline-size: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md);
    background: var(--color-surface);
    border: none;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    cursor: pointer;
    text-align: start;
    transition: background var(--dur-fast) var(--ease-out);
  }

  .trigger:hover {
    background: var(--color-surface-2);
  }

  .trigger-icon {
    transition: transform var(--dur-fast) var(--ease-out);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .trigger-icon.open {
    transform: rotate(90deg);
  }
</style>
```

**`src/lib/exercises/18/AccordionContent.svelte`**

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import { slide } from 'svelte/transition';
  import type { Snippet } from 'svelte';

  interface ItemContext {
    readonly id: string;
    readonly isOpen: boolean;
  }

  const item = getContext<ItemContext>('accordion-item');

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

{#if item.isOpen}
  <div class="content" transition:slide={{ duration: 200 }}>
    {@render children()}
  </div>
{/if}

<style>
  .content {
    padding: var(--space-md);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    border-block-start: 1px solid var(--color-border);
    background: var(--color-surface-2);
  }
</style>
```

**`src/routes/exercises/18-advanced/01/+page.svelte`**

```svelte
<script lang="ts">
  import Accordion from '$lib/exercises/18/Accordion.svelte';
  import AccordionItem from '$lib/exercises/18/AccordionItem.svelte';
  import AccordionTrigger from '$lib/exercises/18/AccordionTrigger.svelte';
  import AccordionContent from '$lib/exercises/18/AccordionContent.svelte';
</script>

<main class="page">
  <h1>Compound Accordion</h1>
  <p class="intro">A compound component where parent and children share state via context.</p>

  <Accordion>
    <AccordionItem id="what">
      <AccordionTrigger>What is a compound component?</AccordionTrigger>
      <AccordionContent>
        A compound component is a pattern where a parent component manages shared state that its children consume through context. The API feels like HTML elements (like select/option) but carries custom behavior.
      </AccordionContent>
    </AccordionItem>

    <AccordionItem id="why">
      <AccordionTrigger>Why use context instead of props?</AccordionTrigger>
      <AccordionContent>
        Context avoids prop drilling through intermediate components. The Accordion root sets the state, and any descendant — at any depth — can read it. This makes the component tree more flexible and the API cleaner.
      </AccordionContent>
    </AccordionItem>

    <AccordionItem id="how">
      <AccordionTrigger>How do runes work with context?</AccordionTrigger>
      <AccordionContent>
        Context values set with setContext are available immediately via getContext. When the context object uses getter properties backed by $state runes, the consuming components reactively update when the state changes.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }
</style>
```

### Explanation

The compound component pattern uses `setContext`/`getContext` to share state without prop drilling. The `Accordion` root owns the `openId` state and provides a `toggle` function via context. Each `AccordionItem` registers its own `id` in a nested context scope. The `AccordionTrigger` and `AccordionContent` read both context layers to determine their behavior. The critical technique is using getter properties (`get openId()`) in the context object — this ensures consuming components reactively re-render when the `$state` changes. Without getters, the context value would be read once and never update. The `slide` transition from Svelte creates a smooth expand/collapse animation. The `aria-expanded` attribute on the trigger enables screen readers to announce the accordion state. This pattern is how libraries like Radix, Headless UI, and Melt UI build their component APIs.
</details>
