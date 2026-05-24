---
module: 20
exercise: 2
title: Store Unit Test
difficulty: intermediate
estimated_time: 20
skills_tested:
  - testing .svelte.ts reactive classes
  - assertion patterns for state
  - testing derived values
  - testing side effects
---

# Exercise 20.2 — Store Unit Test

## Brief

Write unit tests for a `.svelte.ts` reactive store that manages a todo list. The store uses `$state`, `$derived`, and methods to add, remove, and toggle items. This exercise teaches how to test Svelte 5's reactive primitives outside of components.

## Requirements

1. Create `src/lib/stores/todos.svelte.ts` with a `createTodoStore()` function
2. The store must have: `items` ($state array), `completedCount` ($derived), `pendingCount` ($derived)
3. Methods: `add(text)`, `remove(id)`, `toggle(id)`, `clearCompleted()`
4. Each todo has: `id: string`, `text: string`, `completed: boolean`
5. Create `src/lib/stores/todos.test.ts` with comprehensive tests
6. Test initial state (empty list, zero counts)
7. Test adding items (count increases, item appears)
8. Test toggling completion (completed count updates)
9. Test removing items (count decreases, item disappears)
10. Test clearing completed items (only completed items removed)
11. Create `src/routes/exercises/20-testing/02/+page.svelte` documenting the test patterns

## Constraints

- Use the `svelte/reactivity` or Svelte 5 test environment for testing runes
- TypeScript strict mode
- Each test must be independent (no shared state between tests)
- Test behavior, not implementation details

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

To test `.svelte.ts` files with runes, you need Vitest configured with the Svelte compiler. The `$state` and `$derived` runes work in test files when the Svelte Vite plugin processes them. Call `createTodoStore()` in each test to get a fresh instance.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The store function returns an object with getter properties backed by `$state` and `$derived`. In tests, you can read these properties and they will reflect the current state. After calling `store.add('Buy milk')`, `store.items.length` should be `1` and `store.pendingCount` should be `1`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
import { describe, it, expect } from 'vitest';
import { createTodoStore } from './todos.svelte';

describe('createTodoStore', () => {
  it('starts with an empty list', () => {
    const store = createTodoStore();
    expect(store.items).toHaveLength(0);
    expect(store.completedCount).toBe(0);
  });

  it('adds a todo item', () => {
    const store = createTodoStore();
    store.add('Buy milk');
    expect(store.items).toHaveLength(1);
    expect(store.items[0].text).toBe('Buy milk');
  });
});
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/stores/todos.svelte.ts`**

```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoStore {
  readonly items: Todo[];
  readonly completedCount: number;
  readonly pendingCount: number;
  readonly totalCount: number;
  add: (text: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clearCompleted: () => void;
}

export function createTodoStore(): TodoStore {
  let items: Todo[] = $state([]);

  const completedCount: number = $derived(items.filter((t) => t.completed).length);
  const pendingCount: number = $derived(items.filter((t) => !t.completed).length);
  const totalCount: number = $derived(items.length);

  function add(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    items.push({
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false
    });
  }

  function remove(id: string): void {
    items = items.filter((t) => t.id !== id);
  }

  function toggle(id: string): void {
    const todo = items.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }

  function clearCompleted(): void {
    items = items.filter((t) => !t.completed);
  }

  return {
    get items() { return items; },
    get completedCount() { return completedCount; },
    get pendingCount() { return pendingCount; },
    get totalCount() { return totalCount; },
    add,
    remove,
    toggle,
    clearCompleted
  };
}
```

**`src/lib/stores/todos.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { createTodoStore } from './todos.svelte';

describe('createTodoStore', () => {
  describe('initial state', () => {
    it('starts with an empty items array', () => {
      const store = createTodoStore();
      expect(store.items).toHaveLength(0);
    });

    it('starts with zero completed count', () => {
      const store = createTodoStore();
      expect(store.completedCount).toBe(0);
    });

    it('starts with zero pending count', () => {
      const store = createTodoStore();
      expect(store.pendingCount).toBe(0);
    });
  });

  describe('add', () => {
    it('adds a new todo item', () => {
      const store = createTodoStore();
      store.add('Buy milk');
      expect(store.items).toHaveLength(1);
      expect(store.items[0].text).toBe('Buy milk');
      expect(store.items[0].completed).toBe(false);
    });

    it('increments pending count', () => {
      const store = createTodoStore();
      store.add('Task 1');
      store.add('Task 2');
      expect(store.pendingCount).toBe(2);
      expect(store.totalCount).toBe(2);
    });

    it('ignores empty strings', () => {
      const store = createTodoStore();
      store.add('');
      store.add('   ');
      expect(store.items).toHaveLength(0);
    });

    it('trims whitespace from text', () => {
      const store = createTodoStore();
      store.add('  Buy milk  ');
      expect(store.items[0].text).toBe('Buy milk');
    });
  });

  describe('remove', () => {
    it('removes an item by id', () => {
      const store = createTodoStore();
      store.add('Task 1');
      store.add('Task 2');
      const id = store.items[0].id;
      store.remove(id);
      expect(store.items).toHaveLength(1);
      expect(store.items[0].text).toBe('Task 2');
    });

    it('does nothing for non-existent id', () => {
      const store = createTodoStore();
      store.add('Task 1');
      store.remove('non-existent');
      expect(store.items).toHaveLength(1);
    });

    it('updates counts after removal', () => {
      const store = createTodoStore();
      store.add('Task 1');
      store.add('Task 2');
      store.remove(store.items[0].id);
      expect(store.totalCount).toBe(1);
      expect(store.pendingCount).toBe(1);
    });
  });

  describe('toggle', () => {
    it('marks an item as completed', () => {
      const store = createTodoStore();
      store.add('Task 1');
      store.toggle(store.items[0].id);
      expect(store.items[0].completed).toBe(true);
      expect(store.completedCount).toBe(1);
      expect(store.pendingCount).toBe(0);
    });

    it('toggles a completed item back to pending', () => {
      const store = createTodoStore();
      store.add('Task 1');
      const id = store.items[0].id;
      store.toggle(id);
      store.toggle(id);
      expect(store.items[0].completed).toBe(false);
      expect(store.completedCount).toBe(0);
    });

    it('does nothing for non-existent id', () => {
      const store = createTodoStore();
      store.add('Task 1');
      store.toggle('non-existent');
      expect(store.items[0].completed).toBe(false);
    });
  });

  describe('clearCompleted', () => {
    it('removes only completed items', () => {
      const store = createTodoStore();
      store.add('Done');
      store.add('Pending');
      store.toggle(store.items[0].id);
      store.clearCompleted();
      expect(store.items).toHaveLength(1);
      expect(store.items[0].text).toBe('Pending');
    });

    it('does nothing when no items are completed', () => {
      const store = createTodoStore();
      store.add('Task 1');
      store.add('Task 2');
      store.clearCompleted();
      expect(store.items).toHaveLength(2);
    });

    it('clears all items when all are completed', () => {
      const store = createTodoStore();
      store.add('Task 1');
      store.add('Task 2');
      store.toggle(store.items[0].id);
      store.toggle(store.items[1].id);
      store.clearCompleted();
      expect(store.items).toHaveLength(0);
    });
  });
});
```

**`src/routes/exercises/20-testing/02/+page.svelte`**

```svelte
<main class="page">
  <h1>Store Unit Testing</h1>
  <p class="intro">Testing .svelte.ts reactive stores with Vitest — assert state, derived values, and method behavior.</p>

  <section class="patterns">
    <h2>Test Patterns</h2>
    <div class="pattern-list">
      <div class="pattern">
        <h3>Fresh Instance Per Test</h3>
        <p>Call <code>createTodoStore()</code> in each test. Never share state between tests.</p>
      </div>
      <div class="pattern">
        <h3>Test Behavior, Not Implementation</h3>
        <p>Assert on public API (items, counts) not internal state representation.</p>
      </div>
      <div class="pattern">
        <h3>Edge Cases Matter</h3>
        <p>Empty strings, non-existent IDs, double toggles — test the boundaries.</p>
      </div>
      <div class="pattern">
        <h3>Derived Values Are Automatic</h3>
        <p>After mutating state, derived values update synchronously in tests.</p>
      </div>
    </div>
  </section>
</main>

<style>
  .page { max-inline-size: var(--content-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }
  .pattern-list { display: grid; gap: var(--space-md); }
  .pattern { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); }
  .pattern h3 { font-size: var(--text-sm); margin-block-end: var(--space-xs); }
  .pattern p { font-size: var(--text-sm); color: var(--color-text-muted); }
  code { font-size: var(--text-xs); background: var(--color-surface); padding: 0.1em 0.3em; border-radius: var(--radius-sm); }
</style>
```

### Explanation

Testing `.svelte.ts` reactive stores is surprisingly straightforward — the store function returns a plain object with getter properties, so tests read like any other unit test. The key principle is fresh instances: `createTodoStore()` in each test ensures no state leaks between tests. Getter properties backed by `$derived` update synchronously in the test context (no need for `tick()` or `flush`), so after calling `store.add('Task')`, `store.pendingCount` immediately reflects the change. The tests follow the "test behavior, not implementation" principle: we assert that `store.items.length` is correct, not that the internal `$state` array was mutated in a specific way. Edge cases (empty strings, non-existent IDs, double toggles) catch bugs that normal-path testing misses. This store testing pattern applies to any `.svelte.ts` reactive class in your application — authentication state, shopping cart, form state, etc.
</details>
