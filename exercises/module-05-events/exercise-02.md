---
module: 5
exercise: 2
title: Typed Event Forwarding
Debounce Implementation
Closure Puzzle
difficulty: intermediate
advanced
expert
estimated_time: 20
30
45
skills_tested:
  - callback props
debounce pattern
closure debugging
  - TypeScript function types
closure scoping
event handler identity
---

# Exercise 5.2 — Typed Event Forwarding
Debounce Implementation
Closure Puzzle

## Brief

Build a child component that emits structured events to its parent via typed callback props. The child is a color picker that reports color changes; the parent tracks and displays the selection history. This replaces Svelte 4's createEventDispatcher with the simpler callback prop pattern.
Implement a debounce utility function from scratch (no lodash) and use it in a search input component. The search fires an API call only after the user stops typing for 300ms. Include proper cleanup when the component unmounts and when the debounce delay changes.
Solve a series of closure-related bugs in event handlers. Each bug demonstrates a common mistake: stale closures in loops, capturing the wrong variable, and the difference between capturing a value vs a reference. Build a fix for each.

## Requirements

1. Create `src/lib/exercises/05/ColorPicker.svelte`
2. Create `src/routes/exercises/05-events/02/+page.svelte`
3. ColorPicker props: `colors: string[]`, `onSelect: (color: string) => void`, `onHover?: (color: string | null) => void`
4. The parent passes typed callbacks that update its own state
5. Track selection history in the parent (last 10 selections)
6. The hover callback updates a live preview area
7. TypeScript enforces the callback signatures — wrong types error at compile time

## Constraints

- No createEventDispatcher (Svelte 4 pattern)
- No event bubbling — direct callback invocation
- The callback type must be explicit in the Props interface
- No `any` in callback parameter types

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

In Svelte 5, event forwarding is just passing a function as a prop. The parent defines the function, the child calls it. TypeScript enforces the contract through the Props interface.
A debounce function returns a wrapper that delays execution. Each call resets the timer. The key: store the timeout ID in a closure variable that persists across calls.
A closure captures variables, not values. If you create a function inside a loop that references the loop variable, all functions share the same variable (which ends at the final value after the loop completes).
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Define the prop as `onSelect: (color: string) => void`. The child calls `onSelect(selectedColor)` directly. The parent implements the function and it receives the color. This is simpler than dispatching custom events because TypeScript can verify the entire contract at compile time.
The debounce function creates a closure with a `timeoutId` variable. Each call clears the previous timeout and sets a new one. The returned function has the same signature as the original. Add a `.cancel()` method that clears the timeout — use this in $effect cleanup.
Bug 1 fix: Use let in the loop (block scoping) or capture the index in the closure at creation time. Bug 2 fix: Read state inside the handler body (Svelte's reactivity ensures fresh values). Bug 3 fix: Store the interval ID in a  variable so cleanup always references the current one.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

\`\`\`svelte
<!-- ColorPicker.svelte -->
<script lang="ts">
  interface Props {
    colors: string[];
    onSelect: (color: string) => void;
    onHover?: (color: string | null) => void;
  }
  const { colors, onSelect, onHover }: Props = \$props();
</script>

{#each colors as color}
  <button
    style="background: {color}"
    onclick={() => onSelect(color)}
    onmouseenter={() => onHover?.(color)}
    onmouseleave={() => onHover?.(null)}
  />
{/each}
\`\`\`
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**\`src/lib/exercises/05/ColorPicker.svelte\`**

\`\`\`svelte
<script lang="ts">
  interface Props {
    colors: string[];
    onSelect: (color: string) => void;
    onHover?: (color: string | null) => void;
  }

  const { colors, onSelect, onHover }: Props = \$props();
</script>

<div class="picker" role="group" aria-label="Color picker">
  {#each colors as color}
    <button
      class="swatch"
      style="background: {color}"
      aria-label="Select {color}"
      onclick={() => onSelect(color)}
      onmouseenter={() => onHover?.(color)}
      onmouseleave={() => onHover?.(null)}
    ></button>
  {/each}
</div>

<style>
  .picker {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .swatch {
    inline-size: 2.5rem;
    block-size: 2.5rem;
    border-radius: var(--radius-md);
    border: 2px solid transparent;
    transition: border-color var(--dur-fast) var(--ease-out), scale var(--dur-fast) var(--ease-spring);
  }

  .swatch:hover { scale: 1.1; border-color: var(--color-text); }
  .swatch:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }
</style>
\`\`\`

**\`src/routes/exercises/05-events/02/+page.svelte\`**

\`\`\`svelte
<script lang="ts">
  import ColorPicker from '\$lib/exercises/05/ColorPicker.svelte';

  const colors: string[] = [
    'oklch(65% 0.22 270)', 'oklch(65% 0.22 145)', 'oklch(65% 0.22 25)',
    'oklch(75% 0.18 85)', 'oklch(50% 0.2 300)', 'oklch(70% 0.15 200)'
  ];

  let selected: string = \$state('');
  let hovered: string | null = \$state(null);
  let history: string[] = \$state([]);

  function handleSelect(color: string): void {
    selected = color;
    history = [color, ...history].slice(0, 10);
  }

  function handleHover(color: string | null): void {
    hovered = color;
  }
</script>

<main class="page">
  <h1>Typed Event Forwarding</h1>
  <ColorPicker {colors} onSelect={handleSelect} onHover={handleHover} />

  <div class="preview" style="background: {hovered ?? selected ?? 'var(--color-surface-2)'}">
    <p>{hovered ? 'Hovering' : selected ? 'Selected' : 'Pick a color'}</p>
  </div>

  <h2>History</h2>
  <div class="history">
    {#each history as color}
      <div class="history-swatch" style="background: {color}"></div>
    {/each}
  </div>
</main>

<style>
  .page { max-inline-size: var(--prose-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
  h2 { font-size: var(--text-lg); margin-block: var(--space-lg) var(--space-sm); }
  .preview { padding: var(--space-xl); border-radius: var(--radius-lg); text-align: center; margin-block-start: var(--space-lg); color: oklch(100% 0 0); font-weight: 600; transition: background var(--dur-fast) var(--ease-out); }
  .history { display: flex; gap: var(--space-xs); }
  .history-swatch { inline-size: 1.5rem; block-size: 1.5rem; border-radius: var(--radius-sm); }
</style>
\`\`\`

### Explanation

The callback prop pattern is simpler and more type-safe than event dispatching. The parent defines a function with a known signature, passes it as a prop, and the child calls it directly. TypeScript verifies the entire contract at compile time — if the child passes wrong arguments, the error shows at the call site. The optional chaining `onHover?.()` safely handles undefined callbacks.
Debouncing is a closure that captures a timeout ID across invocations. Each call clears the previous timer and starts a new one, ensuring the actual function only fires after a quiet period. The cleanup pattern (`debouncedSearch.cancel()` in $effect's return) prevents orphaned timeouts when the component unmounts. This is essential for search inputs, resize handlers, and scroll events.
Closures capture variables by reference, not by value. In a `var`-scoped loop, all closures share one variable that ends at the final value. With `let`, each iteration creates a new binding. In reactive frameworks, the equivalent bug is capturing stale state — Svelte's reactive system helps by re-creating handlers when dependencies change, but setTimeout/setInterval still capture at call time.
</details>
