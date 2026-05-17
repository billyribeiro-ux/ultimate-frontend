---
module: 20
lesson: 20.3
title: Unit testing .svelte.ts stores
duration: 55 minutes
prerequisites:
  - "20.2 — Vitest configuration for SvelteKit"
  - "11.3 — .svelte.ts files"
  - "11.5 — Reactive classes with runes"
learning_objectives:
  - Write unit tests for .svelte.ts stores that verify $state mutations and $derived computations
  - Test reactive classes by instantiating them in Vitest and asserting on property values after method calls
  - Handle the Svelte 5 runes compilation requirement in test files by using the .svelte.ts extension
  - Test edge cases (empty state, boundary values, error conditions) in reactive stores
  - Use vi.fn() and vi.spyOn() to verify side effects triggered by store changes
status: ready
---

# Lesson 20.3 — Unit testing .svelte.ts stores

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Testing reactive state without a browser

### 1.1 The problem: reactive state lives in compiler magic

Svelte 5 runes (`$state`, `$derived`, `$effect`) are compiler features. The `$state` you write in a `.svelte.ts` file is not real JavaScript — the Svelte compiler transforms it into reactive primitives before execution. This means your test file must also go through the Svelte compiler, or the runes will not work.

A plain `.test.ts` file cannot use `$state` because Vitest runs TypeScript through esbuild, not through the Svelte compiler. The solution is to either test the store's public API from a regular `.test.ts` file (which works when the store exports plain functions and properties) or to write the test file as `.test.svelte.ts` so it gets compiled by Svelte.

### 1.2 How to test reactive classes

A reactive class written in `.svelte.ts` exports a class with `$state` and `$derived` properties:

```typescript
// src/lib/stores/counter.svelte.ts
export class CounterStore {
  count: number = $state(0);
  doubled: number = $derived(this.count * 2);

  increment(): void {
    this.count += 1;
  }

  decrement(): void {
    this.count = Math.max(0, this.count - 1);
  }

  reset(): void {
    this.count = 0;
  }
}
```

Because the class is compiled by Svelte (via the Vite plugin in Vitest), the `$state` and `$derived` decorations work in tests. You import the class, instantiate it, call methods, and assert on properties:

```typescript
// tests/unit/counter.test.ts
import { describe, it, expect } from 'vitest';
import { CounterStore } from '$lib/stores/counter.svelte';

describe('CounterStore', () => {
  it('starts at zero', () => {
    const store = new CounterStore();
    expect(store.count).toBe(0);
  });

  it('increments the count', () => {
    const store = new CounterStore();
    store.increment();
    expect(store.count).toBe(1);
  });

  it('computes doubled correctly', () => {
    const store = new CounterStore();
    store.increment();
    store.increment();
    expect(store.doubled).toBe(4);
  });

  it('does not decrement below zero', () => {
    const store = new CounterStore();
    store.decrement();
    expect(store.count).toBe(0);
  });
});
```

### 1.3 Testing more complex stores

Real stores manage arrays, objects, and async operations. Consider a todo store:

```typescript
// src/lib/stores/todos.svelte.ts
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export class TodoStore {
  items: Todo[] = $state([]);
  
  completedCount: number = $derived(
    this.items.filter(t => t.completed).length
  );

  remainingCount: number = $derived(
    this.items.filter(t => !t.completed).length
  );

  add(text: string): void {
    this.items.push({
      id: crypto.randomUUID(),
      text,
      completed: false
    });
  }

  toggle(id: string): void {
    const item = this.items.find(t => t.id === id);
    if (item) item.completed = !item.completed;
  }

  remove(id: string): void {
    this.items = this.items.filter(t => t.id !== id);
  }

  clearCompleted(): void {
    this.items = this.items.filter(t => !t.completed);
  }
}
```

The tests cover the public API comprehensively:

```typescript
describe('TodoStore', () => {
  it('adds a todo with the given text', () => {
    const store = new TodoStore();
    store.add('Buy milk');
    expect(store.items).toHaveLength(1);
    expect(store.items[0].text).toBe('Buy milk');
    expect(store.items[0].completed).toBe(false);
  });

  it('toggles a todo between completed and uncompleted', () => {
    const store = new TodoStore();
    store.add('Test');
    const id = store.items[0].id;
    store.toggle(id);
    expect(store.items[0].completed).toBe(true);
    store.toggle(id);
    expect(store.items[0].completed).toBe(false);
  });

  it('computes remaining count after toggles', () => {
    const store = new TodoStore();
    store.add('A');
    store.add('B');
    store.add('C');
    store.toggle(store.items[0].id);
    expect(store.completedCount).toBe(1);
    expect(store.remainingCount).toBe(2);
  });

  it('clears only completed items', () => {
    const store = new TodoStore();
    store.add('Keep');
    store.add('Remove');
    store.toggle(store.items[1].id);
    store.clearCompleted();
    expect(store.items).toHaveLength(1);
    expect(store.items[0].text).toBe('Keep');
  });
});
```

### 1.4 Testing edge cases

Edge cases are where bugs hide. For the todo store:

- **Empty state:** What happens when you call `clearCompleted()` on an empty store?
- **Non-existent ID:** What happens when you call `toggle('invalid-id')`?
- **Duplicate text:** Can two todos have the same text?
- **Very long text:** Does the store handle a 10,000-character todo?

```typescript
it('handles toggle on non-existent ID gracefully', () => {
  const store = new TodoStore();
  store.add('Test');
  store.toggle('non-existent');
  expect(store.items[0].completed).toBe(false);
});

it('handles clearCompleted on empty store', () => {
  const store = new TodoStore();
  store.clearCompleted();
  expect(store.items).toHaveLength(0);
});
```

### 1.5 Using spies for side effects

When a store triggers side effects (API calls, analytics events), use `vi.fn()` to verify they are called:

```typescript
it('calls the onchange callback when count changes', () => {
  const callback = vi.fn();
  const store = new CounterStore({ onchange: callback });
  store.increment();
  expect(callback).toHaveBeenCalledWith(1);
});
```

### Deep Dive — Testing $effect and async store patterns

Testing `$effect` in unit tests is tricky because effects run asynchronously after state changes. In Svelte 5, effects are scheduled by the runtime and execute in microtasks. To test them, you need to flush the reactive queue.

Vitest provides `await vi.waitFor()` for waiting on async conditions, but the more reliable approach for Svelte effects is to use `flushSync` from `svelte`:

```typescript
import { flushSync } from 'svelte';

it('effect runs after state change', () => {
  const store = new SyncStore();
  flushSync(() => {
    store.value = 42;
  });
  // Effect has now run
  expect(store.effectResult).toBe('processed: 42');
});
```

For stores that make async API calls, mock the fetch function and use async/await:

```typescript
import { vi } from 'vitest';

global.fetch = vi.fn();

it('loads data from the API', async () => {
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
    new Response(JSON.stringify([{ id: '1', text: 'Test' }]))
  );

  const store = new ApiStore();
  await store.load();

  expect(store.items).toHaveLength(1);
  expect(fetch).toHaveBeenCalledWith('/api/todos');
});
```

Always restore mocks after each test to prevent test pollution:

```typescript
afterEach(() => {
  vi.restoreAllMocks();
});
```

A common pitfall: testing the store's internal `$state` after an async operation without awaiting the operation. The state update happens asynchronously, so asserting immediately after `store.load()` (without `await`) sees the old state. Always `await` async store methods before asserting.

## 2. Style it — PE7 applied to the test runner output mini-build

The mini-build displays simulated test output. Passing tests show `var(--color-success)` check marks, failing tests show `var(--color-error)` crosses, and skipped tests show `var(--color-warning)` dashes. The test file header uses `var(--text-sm)` with `var(--color-brand)` for the file path. Duration badges use `var(--text-xs)` with `font-variant-numeric: tabular-nums`.

## 3. Interact — writing and running simulated store tests

The student writes test assertions in an input field and sees them evaluated against a simulated store. This demonstrates the test-driven feedback loop without leaving the browser.

## 4. Mini-build — Store test runner simulator

**File path:** `src/routes/modules/20-testing/03-unit-testing-stores/+page.svelte`

A simulated test runner that shows a CounterStore and TodoStore with pre-written test cases. The student clicks "Run Tests" to see each test execute with pass/fail results. They can modify test expectations to see failures. A coverage summary shows which store methods are tested.

**DevTools moment:** Open a terminal and create the actual test file at `tests/unit/counter.test.ts`. Run `pnpm vitest tests/unit/counter.test.ts --reporter=verbose`. Compare the real Vitest output with the simulated output in the mini-build.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why can you import and test a .svelte.ts store in a regular .test.ts file?</summary>

Because Vitest's Vite plugin pipeline processes `.svelte.ts` files through the Svelte compiler before execution. The test file itself is plain TypeScript, but the imported store module is compiled by Svelte, so `$state` and `$derived` work correctly. The test file does not need Svelte compilation because it does not use runes directly.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between testing a store's public API and testing its internal state?</summary>

Testing the public API means calling methods and asserting on return values or observable properties. Testing internal state means accessing private fields or implementation details. Public API tests survive refactoring because the contract is stable. Internal state tests break when the implementation changes, even if the behavior is preserved.
</details>

<details>
<summary><strong>Q3.</strong> Why is it important to test edge cases like empty arrays and non-existent IDs?</summary>

Edge cases are where bugs hide because developers often code the "happy path" first and handle edge cases as afterthoughts. An empty array might cause an undefined access, a non-existent ID might cause a null reference, and a boundary value might trigger an off-by-one error. Testing these cases catches bugs that users will inevitably trigger in production.
</details>

<details>
<summary><strong>Q4.</strong> How do you test a store method that calls fetch internally?</summary>

Mock the global `fetch` function with `vi.fn()` and configure it to return a fake Response. Call the store method with `await`, then assert on the store's state and verify that `fetch` was called with the correct URL and options. Always restore mocks in `afterEach` to prevent test pollution.
</details>

<details>
<summary><strong>Q5.</strong> What does flushSync from 'svelte' do in a test context?</summary>

`flushSync` forces Svelte's reactive runtime to process all pending state changes and effects synchronously. In tests, this ensures that `$effect` callbacks have run before you assert on their results. Without it, effects execute asynchronously in microtasks, and assertions may run before the effects complete.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Sharing state between tests.** Creating a store instance at the module level means all tests share the same state. Always create a new store instance inside each `it()` block or use `beforeEach`.

2. **Not awaiting async store methods.** Asserting on state immediately after calling an async method (without `await`) sees the old state. Always `await` the async operation before asserting.

3. **Mocking too much.** Mocking the store's internal methods to test other internal methods produces tests that verify the mock, not the code. Only mock external dependencies (fetch, localStorage, timers).

4. **Forgetting vi.restoreAllMocks() in afterEach.** A mock created in one test persists into subsequent tests, causing mysterious failures. Always restore mocks between tests.

## 7. What's next — one sentence

Next, you will render Svelte components in tests with @testing-library/svelte and assert on what the user sees, not what the code does.
