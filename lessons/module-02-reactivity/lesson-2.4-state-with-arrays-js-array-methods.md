---
module: 2
lesson: 2.4
title: $state with arrays — JS array methods
duration: 50 minutes
prerequisites:
  - Lesson 2.3 — $state with objects
learning_objectives:
  - Declare reactive array state and understand that it is also proxied
  - Use push, pop, splice, and index assignment to mutate array state
  - Use map, filter, and reduce to produce new arrays without mutating
  - Distinguish "mutating" array methods from "non-mutating" ones
  - Type an array state with Interface[]
status: ready
---

# Lesson 2.4 — `$state` with arrays: JS array methods

## 1. Concept — Lists are the most common UI state

### 1.1 The problem: UI is full of lists

Todo lists, chat messages, table rows, notifications, search results, breadcrumbs, products, comments, shopping cart items — lists are everywhere. Almost every real application's primary state is a list of things, and the operations you perform on them are the same handful: add one at the end, remove one at a given index, reorder, filter, project each item. JavaScript arrays have methods for all of these. But a UI framework needs those operations to trigger re-renders *on the list* so that the user sees the change. This is where reactive array state comes in.

In Svelte 5, the story is the same as for objects: pass an array to `$state(...)` and it becomes a **deep reactive proxy**. Every built-in array method — `push`, `pop`, `splice`, `sort`, `reverse`, index assignment — is intercepted and triggers the right updates.

### 1.2 Declaring and typing array state

```ts
interface Todo {
    id: string;
    text: string;
    done: boolean;
}

const todos: Todo[] = $state([]);
```

Note the idiomatic pattern: the variable is a `const` (the reference never changes) but the array it points to *is* reactive and mutable. This is the opposite of the primitive pattern (`let count = $state(0)`). With objects and arrays you almost always use `const` because you mutate the contents, not the reference.

### 1.3 Mutating methods that trigger reactivity

All of the following work:

```ts
todos.push({ id: '1', text: 'Write lesson', done: false }); // add to end
todos.unshift(firstItem);                                    // add to start
todos.pop();                                                 // remove last
todos.shift();                                               // remove first
todos.splice(index, 1);                                      // remove one at index
todos.splice(index, 0, newItem);                             // insert at index
todos[index].done = true;                                    // mutate an item
todos[index] = replacementItem;                              // replace an item
todos.sort((a, b) => a.text.localeCompare(b.text));          // sort in place
todos.reverse();                                             // reverse in place
todos.length = 0;                                            // clear
```

Every one of these triggers a targeted update. Nothing extra is required. This is a huge contrast with immutable-state systems where you would need `setTodos([...todos, newItem])` to add one item and `setTodos(todos.filter(t => t.id !== id))` to remove one.

### 1.4 Non-mutating methods that produce new arrays

JavaScript arrays also have methods that return *new* arrays without modifying the original. These are useful for derived values and for passing transformed lists to the markup:

```ts
const visibleTodos = todos.filter((t) => !t.done);
const titles = todos.map((t) => t.text);
const totalDone = todos.reduce((acc, t) => acc + (t.done ? 1 : 0), 0);
```

You would not store `visibleTodos` in its own `$state`, because it is *computed* from `todos`. It belongs in a `$derived` (Lesson 2.7). For now, just recognise these three methods — `map`, `filter`, `reduce` — as the three non-mutating workhorses.

A useful mental distinction:

| Mutating (works with $state) | Non-mutating (produces new arrays) |
| --------------------------- | ---------------------------------- |
| push, pop, shift, unshift    | map                                |
| splice, sort, reverse, fill   | filter                             |
| index assignment              | slice                              |
| length = 0                    | concat                             |
|                               | flat, flatMap                      |
|                               | reduce                             |

You will use both. Mutating methods are for *updating* state; non-mutating methods are for *deriving* or *transforming* it.

### 1.5 A common beginner trap: reassignment vs mutation with `const`

```ts
const todos: Todo[] = $state([]);

todos.push(item);       // ✓ works
todos = [...todos, item]; // ✗ Error: Cannot assign to 'todos' because it is a constant.
```

If you declare the array with `const` (recommended), you cannot reassign it — only mutate it. That is fine because mutations are reactive. If you really need to swap the entire array for a new one, declare it with `let`:

```ts
let todos: Todo[] = $state([]);
todos = newArray; // ✓ works
```

But the first form — `const` plus mutation — is cleaner and is what you will write 99% of the time.

### 1.6 Identity vs copies when passing items around

One subtle gotcha: when you pass an item out of reactive array state — for example, to a child component — the item you pass is *still* a proxy. Mutating its properties from the child still triggers updates on the parent's list. This is usually what you want. If you genuinely need a plain non-reactive copy of the item (for serialisation to JSON, for comparison with older snapshots), use `$state.snapshot` (Lesson 2.6).

## 2. Style it — A todo list that breathes

The mini-build is a todo list with add, toggle, delete, and clear-completed actions. It uses PE7 tokens for everything and a subtle `all 200ms var(--ease-out)` transition on list items that respects `prefers-reduced-motion`. Mobile-first layout: stacked vertical list, with the new-item input fixed at the top.

## 3. Interact — Mutating in place vs spreading

The mistake beginners make when coming from React:

```ts
function addTodo(text: string): void {
    todos = [...todos, { id: crypto.randomUUID(), text, done: false }];
}
```

This works in Svelte 5 (if `todos` is a `let`) but it creates a new array every time, which throws away every proxy reference inside the old array. It is also wordier. The idiomatic fix:

```ts
function addTodo(text: string): void {
    todos.push({ id: crypto.randomUUID(), text, done: false });
}
```

One line, no spread. The proxy intercepts `push` and notifies subscribers.

Similarly, to toggle an item, mutate in place:

```ts
// Before (React style):
todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);

// After (Svelte 5 style):
const item = todos.find(t => t.id === id);
if (item) item.done = !item.done;
```

Less noise, the same result.

## 4. Mini-build — A typed todo list

**File:** `src/routes/modules/02-reactivity/04-state-arrays/+page.svelte`

Form at top: text input + Add button. Below: list of todos with a checkbox and a delete button per item. Below that: a footer showing the remaining count and a "Clear completed" button.

### DevTools verification

1. Add a todo. Watch the new `<li>` appear in the Elements tab.
2. Toggle a todo. Only the checkbox and the list item's computed style change.
3. Delete a todo. Svelte efficiently removes the one element — check by adding a console.log inside a `$effect` (spoiler from Lesson 2.9) to confirm only the affected item's element is touched.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why can you usually declare array state with <code>const</code>?</summary>

Because you mutate the contents (push, splice, index assignment) rather than replacing the reference. `const` prevents reassignment but does not prevent mutation, and the proxy handles mutations reactively.
</details>

<details>
<summary><strong>Q2.</strong> Name three mutating array methods that trigger reactivity in $state arrays.</summary>

`push`, `pop`, `splice` (others: `shift`, `unshift`, `sort`, `reverse`, `fill`, direct index assignment, setting `length`).
</details>

<details>
<summary><strong>Q3.</strong> What is wrong with <code>const { 0: first } = todos</code> for reading the first todo reactively in the markup?</summary>

Destructuring copies the value out of the proxy. `first` becomes a plain reference that is no longer tracked. In the markup, reference `todos[0]` directly so the read passes through the proxy.
</details>

<details>
<summary><strong>Q4.</strong> What is the Svelte 5 equivalent of React's <code>setTodos(todos.filter(...))</code>?</summary>

Usually an index-based splice or a direct reassignment: `const i = todos.findIndex(...); todos.splice(i, 1);`. Alternatively, if the variable is a `let`, `todos = todos.filter(...)` also works, but direct mutation is idiomatic.
</details>

<details>
<summary><strong>Q5.</strong> Are <code>map</code>, <code>filter</code>, and <code>reduce</code> mutating or non-mutating?</summary>

Non-mutating. They return new arrays and leave the original untouched. They are the right tool for *producing derived views* of state, not for *updating* state.
</details>

## 6. Common mistakes

- **Treating array state as immutable.** You do not need to spread to push. `todos.push(item)` is idiomatic and reactive.
- **Destructuring items out of the array.** You lose the proxy connection. Index into the array when you need the live value.
- **Calling a sort method in the markup.** `{#each todos.toSorted(...) as t}` looks clever but re-sorts on every re-render. Compute the sorted list in a `$derived` (Lesson 2.7) instead.
- **Forgetting to key your `{#each}`.** `{#each todos as todo (todo.id)}` — the key prevents Svelte from reusing the wrong element when items move. You will see this in depth in Module 4 but the principle applies from day one.

## 7. What's next

Lesson 2.5 introduces `$state.raw` — the escape hatch for state that should not be proxied at all.
