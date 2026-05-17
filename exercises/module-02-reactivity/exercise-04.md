---
module: 2
exercise: 4
title: Snapshot Serialization
difficulty: expert
estimated_time: 45
skills_tested:
  - $state.snapshot
  - $state.raw
  - JSON serialization
  - deep vs shallow reactivity
---

# Exercise 2.4 — Snapshot Serialization

## Brief

Build a "state inspector" that lets the user build a nested reactive data structure (a todo list with categories), then demonstrates the difference between `$state.snapshot` (for serialization), `$state.raw` (for non-deep-reactive data), and plain `$state` (for deep reactivity). Include a JSON export panel that proves only `$state.snapshot` produces clean, serializable output.

## Requirements

1. Create `src/routes/exercises/02-reactivity/04/+page.svelte`
2. A reactive todo structure: `$state<Category[]>` where Category has `name` and `items: Todo[]`
3. UI to add categories and add todos within categories
4. A "Raw Data" panel showing `JSON.stringify($state.snapshot(categories))`
5. A "Direct Stringify" panel showing what happens when you try `JSON.stringify(categories)` directly (it works but may include proxy artifacts in logs)
6. A `$state.raw` section storing a large config object that should NOT be deeply reactive
7. A visual diff showing render counts for deeply-reactive vs raw state updates
8. TypeScript interfaces for `Category` and `Todo`

## Constraints

- Must demonstrate all three: `$state`, `$state.raw`, `$state.snapshot`
- The JSON output must be valid (parseable by `JSON.parse`)
- No third-party serialization libraries
- Must show a measurable difference between deep and raw reactivity

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`$state.snapshot()` returns a plain JavaScript object stripped of any reactive proxy. This is what you need for `localStorage.setItem()` or network requests. `$state.raw()` opts out of deep reactivity — inner properties do not trigger updates when mutated.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Create two versions of the same data: one with `$state` (deeply reactive — mutating `categories[0].items[0].done = true` triggers an update) and one with `$state.raw` (only reassignment of the whole variable triggers an update). Show a render counter for each to prove the difference.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  interface Todo { id: string; text: string; done: boolean; }
  interface Category { name: string; items: Todo[]; }

  let categories: Category[] = $state([
    { name: 'Work', items: [{ id: '1', text: 'Ship feature', done: false }] }
  ]);

  // For serialization:
  // const snapshot = $state.snapshot(categories);
  // JSON.stringify(snapshot) — clean output

  // Raw state (not deeply reactive):
  let config = $state.raw({ theme: 'dark', locale: 'en', features: { a: true, b: false } });
</script>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  interface Todo {
    id: string;
    text: string;
    done: boolean;
  }

  interface Category {
    name: string;
    items: Todo[];
  }

  interface AppConfig {
    theme: 'light' | 'dark';
    locale: string;
    features: Record<string, boolean>;
  }

  // Deep reactive state
  let categories: Category[] = $state([
    { name: 'Work', items: [{ id: '1', text: 'Ship feature', done: false }] },
    { name: 'Personal', items: [{ id: '2', text: 'Buy groceries', done: true }] }
  ]);

  // Raw state — not deeply reactive
  let config: AppConfig = $state.raw({
    theme: 'dark',
    locale: 'en',
    features: { notifications: true, analytics: false, beta: true }
  });

  let newCategory: string = $state('');
  let newTodoText: string = $state('');
  let selectedCategory: number = $state(0);

  let deepRenderCount: number = $state(0);
  let rawRenderCount: number = $state(0);

  // Track renders for deep state
  let snapshotJson: string = $derived(() => {
    deepRenderCount++;
    return JSON.stringify($state.snapshot(categories), null, 2);
  }());

  // Track renders for raw state
  let configJson: string = $derived(() => {
    rawRenderCount++;
    return JSON.stringify(config, null, 2);
  }());

  function addCategory(): void {
    if (!newCategory.trim()) return;
    categories.push({ name: newCategory.trim(), items: [] });
    newCategory = '';
  }

  function addTodo(): void {
    if (!newTodoText.trim() || !categories[selectedCategory]) return;
    categories[selectedCategory].items.push({
      id: crypto.randomUUID(),
      text: newTodoText.trim(),
      done: false
    });
    newTodoText = '';
  }

  function toggleTodo(catIdx: number, todoIdx: number): void {
    categories[catIdx].items[todoIdx].done = !categories[catIdx].items[todoIdx].done;
  }

  function updateConfigTheme(): void {
    // Must reassign to trigger update with $state.raw
    config = { ...config, theme: config.theme === 'dark' ? 'light' : 'dark' };
  }

  function mutateConfigDirect(): void {
    // This will NOT trigger a re-render because config is $state.raw
    config.features.analytics = !config.features.analytics;
  }
</script>

<main class="page">
  <h1>Snapshot Serialization</h1>

  <div class="grid">
    <section class="panel">
      <h2>Deep Reactive State ($state)</h2>
      <div class="form-row">
        <input bind:value={newCategory} placeholder="New category" />
        <button onclick={addCategory}>Add Category</button>
      </div>
      <div class="form-row">
        <select bind:value={selectedCategory}>
          {#each categories as cat, i}
            <option value={i}>{cat.name}</option>
          {/each}
        </select>
        <input bind:value={newTodoText} placeholder="New todo" />
        <button onclick={addTodo}>Add</button>
      </div>

      {#each categories as cat, catIdx}
        <div class="category">
          <h3>{cat.name}</h3>
          {#each cat.items as todo, todoIdx}
            <label class="todo">
              <input
                type="checkbox"
                checked={todo.done}
                onchange={() => toggleTodo(catIdx, todoIdx)}
              />
              <span class:done={todo.done}>{todo.text}</span>
            </label>
          {/each}
        </div>
      {/each}

      <p class="render-count">Derived re-computations: {deepRenderCount}</p>
    </section>

    <section class="panel">
      <h2>Raw State ($state.raw)</h2>
      <p class="explanation">
        Mutating nested properties does NOT trigger updates.
        Only full reassignment does.
      </p>
      <div class="form-row">
        <button onclick={updateConfigTheme}>
          Toggle theme (reassign — triggers update)
        </button>
      </div>
      <div class="form-row">
        <button onclick={mutateConfigDirect}>
          Mutate features directly (no update!)
        </button>
      </div>
      <p class="render-count">Derived re-computations: {rawRenderCount}</p>
    </section>
  </div>

  <section class="json-panel">
    <h2>Serialized Output ($state.snapshot)</h2>
    <pre><code>{snapshotJson}</code></pre>
  </section>

  <section class="json-panel">
    <h2>Config JSON ($state.raw)</h2>
    <pre><code>{configJson}</code></pre>
  </section>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }
  h3 { font-size: var(--text-base); font-weight: 600; }

  .grid {
    display: grid;
    gap: var(--space-lg);
  }

  @media (min-width: 768px) {
    .grid { grid-template-columns: 1fr 1fr; }
  }

  .panel {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    display: grid;
    gap: var(--space-md);
  }

  .form-row {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  input, select {
    padding: var(--space-xs) var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    flex: 1;
    min-inline-size: 8rem;
  }

  button {
    padding: var(--space-xs) var(--space-md);
    background: var(--color-brand);
    color: oklch(100% 0 0);
    font-weight: 600;
    font-size: var(--text-sm);
    border-radius: var(--radius-md);
    white-space: nowrap;
  }

  .category {
    display: grid;
    gap: var(--space-xs);
    padding: var(--space-sm);
    background: var(--color-surface);
    border-radius: var(--radius-sm);
  }

  .todo {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: var(--text-sm);
    cursor: pointer;
  }

  .done { text-decoration: line-through; opacity: 0.5; }

  .render-count {
    font-size: var(--text-xs);
    color: var(--color-brand);
    font-weight: 700;
    padding: var(--space-xs) var(--space-sm);
    background: var(--color-surface);
    border-radius: var(--radius-sm);
  }

  .explanation {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-style: italic;
  }

  .json-panel {
    margin-block-start: var(--space-lg);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
  }

  pre {
    overflow-x: auto;
    font-size: var(--text-xs);
    background: var(--color-surface);
    padding: var(--space-md);
    border-radius: var(--radius-md);
  }
</style>
```

### Explanation

This exercise demonstrates three critical concepts. `$state` creates deep reactive proxies — mutating `categories[0].items[0].done` triggers fine-grained updates because every nested property is wrapped. `$state.raw` opts out — only reassigning the entire variable triggers an update, making it ideal for large config objects or data you never mutate in-place. `$state.snapshot` strips the reactive proxy, returning a plain object safe for `JSON.stringify`, `structuredClone`, or network transmission. The render counter proves the difference: deep state fires on every checkbox toggle, while raw state only fires on explicit reassignment. Understanding when to use each is what separates intermediate from senior-level Svelte developers.
</details>
