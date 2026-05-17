---
module: 4
exercise: 2
title: Keyed List Reorder
difficulty: intermediate
estimated_time: 20
skills_tested:
  - "{#each} with key expressions"
  - array reordering
  - why keys matter for DOM identity
---

# Exercise 4.2 — Keyed List Reorder

## Brief

Build a sortable list where items can be moved up/down. Demonstrate why keys are essential by showing TWO lists side-by-side: one with keys and one without. Each list item contains an input field — after reordering, the unkeyed list shows inputs attached to wrong items (proving the DOM reuse bug), while the keyed list maintains correct associations.

## Requirements

1. Create `src/routes/exercises/04-control-flow/02/+page.svelte`
2. A list of 5 items, each with `id`, `label`, and a text input for notes
3. "Move up" and "Move down" buttons per item
4. TWO identical lists rendered: one with `{#each items as item (item.id)}` and one without the key
5. Type something in an input, then reorder — observe the difference
6. A visible explanation of what happened in each case
7. TypeScript strict — the reorder functions must be properly typed

## Constraints

- No drag-and-drop libraries (button-based reorder only)
- Both lists must share the same data source (one array, two views)
- No CSS animations on this exercise (focus is on the DOM identity bug)
- The input values must NOT be bound to state (that would mask the bug)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Without a key, Svelte reuses DOM nodes by index. So when you swap items at index 1 and 2, Svelte just updates the text content of existing nodes — but the input element (with its user-typed value) stays in place. With a key, Svelte moves the actual DOM node, preserving input state.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Make the inputs uncontrolled (no `bind:value`) so they retain their DOM state independently. Render the same `items` array twice — once with `(item.id)` key and once without. When you reorder, the keyed list moves inputs with their items; the unkeyed list keeps inputs in place while changing labels around them.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  interface Item { id: string; label: string; }
  let items: Item[] = $state([
    { id: 'a', label: 'Apple' },
    { id: 'b', label: 'Banana' },
    // ...
  ]);

  function moveUp(index: number): void {
    if (index === 0) return;
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
  }
</script>

<!-- Keyed -->
{#each items as item (item.id)}
  <div><span>{item.label}</span><input placeholder="notes..." /></div>
{/each}

<!-- Unkeyed -->
{#each items as item}
  <div><span>{item.label}</span><input placeholder="notes..." /></div>
{/each}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  interface Item {
    id: string;
    label: string;
  }

  let items: Item[] = $state([
    { id: 'a', label: 'Apple' },
    { id: 'b', label: 'Banana' },
    { id: 'c', label: 'Cherry' },
    { id: 'd', label: 'Date' },
    { id: 'e', label: 'Elderberry' }
  ]);

  function moveUp(index: number): void {
    if (index === 0) return;
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
  }

  function moveDown(index: number): void {
    if (index === items.length - 1) return;
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
  }
</script>

<main class="page">
  <h1>Keyed List Reorder</h1>
  <p class="instructions">
    Type something in the "Notes" inputs below, then reorder items.
    Watch what happens to the typed text in each list.
  </p>

  <div class="grid">
    <section>
      <h2 class="keyed">With Key <code>(item.id)</code></h2>
      <ul class="list">
        {#each items as item, i (item.id)}
          <li class="list-item">
            <span class="label">{item.label}</span>
            <input placeholder="Type notes here..." />
            <div class="buttons">
              <button onclick={() => moveUp(i)} disabled={i === 0}>↑</button>
              <button onclick={() => moveDown(i)} disabled={i === items.length - 1}>↓</button>
            </div>
          </li>
        {/each}
      </ul>
      <p class="verdict good">Input values move WITH their item. Correct behavior.</p>
    </section>

    <section>
      <h2 class="unkeyed">Without Key</h2>
      <ul class="list">
        {#each items as item, i}
          <li class="list-item">
            <span class="label">{item.label}</span>
            <input placeholder="Type notes here..." />
            <div class="buttons">
              <button onclick={() => moveUp(i)} disabled={i === 0}>↑</button>
              <button onclick={() => moveDown(i)} disabled={i === items.length - 1}>↓</button>
            </div>
          </li>
        {/each}
      </ul>
      <p class="verdict bad">Input values STAY in place while labels swap. Bug!</p>
    </section>
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }

  .instructions {
    color: var(--color-text-muted);
    margin-block-end: var(--space-xl);
  }

  .grid {
    display: grid;
    gap: var(--space-xl);
  }

  @media (min-width: 768px) {
    .grid { grid-template-columns: 1fr 1fr; }
  }

  .keyed { color: var(--color-success); }
  .unkeyed { color: var(--color-error); }

  .list {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--space-sm);
  }

  .list-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm);
    background: var(--color-surface-2);
    border-radius: var(--radius-md);
  }

  .label {
    font-weight: 600;
    min-inline-size: 6rem;
  }

  input {
    flex: 1;
    padding: var(--space-xs) var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
  }

  .buttons {
    display: flex;
    gap: 0.25rem;
  }

  .buttons button {
    padding: var(--space-xs);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    line-height: 1;
  }

  .buttons button:disabled { opacity: 0.3; cursor: not-allowed; }
  .buttons button:hover:not(:disabled) { background: var(--color-brand); color: oklch(100% 0 0); }

  .verdict {
    margin-block-start: var(--space-md);
    font-size: var(--text-sm);
    font-weight: 600;
    padding: var(--space-sm);
    border-radius: var(--radius-sm);
  }

  .good { color: var(--color-success); background: oklch(90% 0.05 145); }
  .bad { color: var(--color-error); background: oklch(90% 0.05 25); }
</style>
```

### Explanation

This is one of the most important lessons in any component framework. Without a key, Svelte (like React or Vue) identifies list items by their index. When you swap indices 1 and 2, the framework thinks "index 1 changed its text, index 2 changed its text" — it updates text nodes but reuses the existing DOM elements (including their internal state like input values). With a key, the framework identifies items by their unique ID. Swapping means "move the DOM node for item B to index 2, move item C to index 1" — the entire subtree moves, preserving all internal state. This bug is invisible until you have stateful elements (inputs, videos, animations) inside a list.
</details>
