---
module: 9
exercise: 4
title: Command with Optimistic Update
difficulty: expert
estimated_time: 45
skills_tested:
  - command remote functions
  - optimistic UI updates
  - rollback on failure
  - reactive state management
---

# Exercise 9b.4 — Command with Optimistic Update

## Brief

Build a todo list where toggling a todo's completion state uses a command remote function with optimistic UI updates. The toggle happens instantly in the UI, the server mutation runs in the background, and if the server fails, the UI rolls back to the previous state.

## Requirements

1. Create a command remote function in `src/lib/server/commands/todos.ts` with `toggleTodo(id: number)` that simulates a database update
2. Make the function randomly fail 20% of the time to demonstrate rollback
3. Create `src/routes/todos/+page.svelte` with a reactive list of todos
4. When a user clicks a todo, immediately update the UI (optimistic)
5. If the server returns an error, revert the todo to its previous state and show a toast notification
6. Include a visible "server" indicator that shows when the mutation is in-flight
7. All todos show a checkbox, title, and completion status

## Constraints

- No full-page reloads or refetches after toggling
- The optimistic update must happen before the server responds
- Rollback must restore the exact previous state
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Store todos in `$state`. On click, clone the current state (for rollback), mutate the todo immediately, then `await` the server call. If the call throws, restore from the clone.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The pattern is: save a snapshot, apply the optimistic change, call the server in a try/catch, and restore the snapshot in the catch block. A `pendingIds` set tracks which todos have in-flight mutations so you can show a spinner per item.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  async function toggle(id: number) {
    const prev = todos.find(t => t.id === id)!.done;
    todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    try {
      await toggleTodo(id);
    } catch {
      todos = todos.map(t => t.id === id ? { ...t, done: prev } : t);
      showToast('Failed to update — reverted');
    }
  }
</script>
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/lib/server/commands/todos.ts
export async function toggleTodo(id: number): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 800));

  // Randomly fail 20% of the time
  if (Math.random() < 0.2) {
    throw new Error('Database connection failed');
  }

  return { success: true };
}
```

```svelte
<!-- src/routes/todos/+page.svelte -->
<script lang="ts">
  import { toggleTodo } from '$lib/server/commands/todos';

  interface Todo {
    id: number;
    title: string;
    done: boolean;
  }

  let todos = $state<Todo[]>([
    { id: 1, title: 'Learn Svelte 5 runes', done: true },
    { id: 2, title: 'Build a PE7 design system', done: false },
    { id: 3, title: 'Master TypeScript strict mode', done: false },
    { id: 4, title: 'Deploy to production', done: false },
    { id: 5, title: 'Write integration tests', done: false }
  ]);

  let pendingIds = $state(new Set<number>());
  let toast = $state<{ message: string; type: 'error' | 'success' } | null>(null);

  function showToast(message: string, type: 'error' | 'success' = 'error') {
    toast = { message, type };
    setTimeout(() => { toast = null; }, 3000);
  }

  async function toggle(id: number) {
    const todo = todos.find((t) => t.id === id);
    if (!todo || pendingIds.has(id)) return;

    const previousState = todo.done;

    // Optimistic update
    todo.done = !todo.done;
    pendingIds.add(id);

    try {
      await toggleTodo(id);
      showToast('Updated successfully', 'success');
    } catch (err) {
      // Rollback
      todo.done = previousState;
      showToast(err instanceof Error ? err.message : 'Update failed');
    } finally {
      pendingIds.delete(id);
    }
  }

  let completedCount = $derived(todos.filter((t) => t.done).length);
</script>

<div class="todo-page">
  <header>
    <h1>Todos</h1>
    <p class="count">{completedCount} of {todos.length} complete</p>
  </header>

  <ul class="todo-list">
    {#each todos as todo (todo.id)}
      <li class:done={todo.done} class:pending={pendingIds.has(todo.id)}>
        <button class="todo-toggle" onclick={() => toggle(todo.id)} disabled={pendingIds.has(todo.id)}>
          <span class="checkbox" class:checked={todo.done}>
            {#if todo.done}&#10003;{/if}
          </span>
          <span class="title">{todo.title}</span>
        </button>
        {#if pendingIds.has(todo.id)}
          <span class="spinner" aria-label="Saving"></span>
        {/if}
      </li>
    {/each}
  </ul>

  {#if toast}
    <div class="toast" class:error={toast.type === 'error'} class:success={toast.type === 'success'} role="alert">
      {toast.message}
    </div>
  {/if}
</div>

<style>
  .todo-page {
    max-inline-size: 32rem;
    margin-inline: auto;
    padding: var(--space-lg);
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-block-end: var(--space-lg);
  }

  h1 {
    font-size: var(--text-2xl);
  }

  .count {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .todo-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .todo-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-sm) var(--space-md);
    transition: opacity 150ms ease;
  }

  .todo-list li.pending {
    opacity: 0.7;
  }

  .todo-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--text-base);
    color: var(--color-text);
    padding: 0;
    flex: 1;
    text-align: start;
  }

  .todo-toggle:disabled {
    cursor: wait;
  }

  .checkbox {
    display: grid;
    place-items: center;
    inline-size: 1.5rem;
    block-size: 1.5rem;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    color: white;
    flex-shrink: 0;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .checkbox.checked {
    background: oklch(55% 0.2 145);
    border-color: oklch(55% 0.2 145);
  }

  .done .title {
    text-decoration: line-through;
    color: var(--color-text-muted);
  }

  .spinner {
    inline-size: 1rem;
    block-size: 1rem;
    border: 2px solid var(--color-border);
    border-block-start-color: oklch(55% 0.2 250);
    border-radius: var(--radius-full);
    animation: spin 600ms linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner { animation: none; opacity: 0.5; }
  }

  .toast {
    position: fixed;
    inset-block-end: var(--space-lg);
    inset-inline-end: var(--space-lg);
    padding: var(--space-sm) var(--space-lg);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 600;
    box-shadow: var(--shadow-lg);
    animation: slide-in 200ms ease;
  }

  .toast.error {
    background: oklch(90% 0.1 25);
    color: oklch(35% 0.15 25);
  }

  .toast.success {
    background: oklch(90% 0.1 145);
    color: oklch(35% 0.15 145);
  }

  @keyframes slide-in {
    from { transform: translateY(1rem); opacity: 0; }
  }
</style>
```

### Explanation

Optimistic updates make the UI feel instant by applying changes before the server confirms them. The pattern is: snapshot the current state, mutate immediately, await the server call in a try/catch, and restore the snapshot if the call fails. The `pendingIds` set prevents double-clicks and shows per-item loading indicators. The 20% failure rate lets you observe the rollback in practice. This pattern is essential for interactive lists, toggles, and any mutation where perceived latency matters more than guaranteed consistency. In production, you would add retry logic and potentially queue multiple mutations.
</details>
