---
module: 2
lesson: 2.7
title: $derived() — pure functions introduced naturally
duration: 45 minutes
prerequisites:
  - Lesson 2.2 — $state with primitive types
  - Lesson 2.4 — $state with arrays
learning_objectives:
  - Define "derived state" and distinguish it from primary state
  - Declare a derived value using $derived with an expression
  - Explain what a "pure function" is and why $derived wants one
  - Avoid the common mistake of storing derived values in their own $state
  - Type derived values the same way you type state
status: ready
---

# Lesson 2.7 — `$derived()` — pure functions introduced naturally

## 1. Concept — Values that are always a function of other values

### 1.1 The problem: some things are not primary state

Consider a shopping cart. The **primary state** is the list of line items — each item has a product ID, a quantity, and a unit price. Everything else about the cart is *computed* from that list: the subtotal (sum of quantity × price), the tax (subtotal × rate), the shipping fee (depends on subtotal), the grand total (subtotal + tax + shipping), the count of distinct items, whether the free-shipping threshold is met. None of these are *stored* anywhere permanently — they are just functions of the primary state. Every time the primary state changes, all the computed values must update together, consistently, without you remembering which ones depend on which.

A beginner's first instinct is to store every computed value as its own `$state` and update all of them manually in every place where the cart changes. This does not scale. The moment you forget one update, a value goes stale and the UI shows a contradiction — the subtotal is $50 but the line items sum to $60. These are some of the most frustrating bugs in UI code, and they are completely preventable.

The right tool is a **derived value**. Declare it once, say "this is always a function of these inputs", and Svelte guarantees it is always up to date.

### 1.2 Declaring a derived value

```ts
let count: number = $state(0);
let doubled: number = $derived(count * 2);
```

`doubled` is always equal to `count * 2`. When `count` changes, `doubled` automatically reflects the new value. You read `doubled` in markup or handlers as if it were a plain variable — no function call, no `.value`, nothing.

Under the hood, `$derived` is a **signal with a computation** — also called a *memo*. Svelte tracks which signals the expression reads (`count` in this case) and re-evaluates the expression when any of them change. The result is cached, so reading `doubled` twice in the same render is free.

### 1.3 Why it must be a *pure* expression

A **pure function** is a function that, given the same inputs, always returns the same output, and has no side effects (it does not write to variables outside itself, does not log, does not call an API, does not modify the DOM). The expression you pass to `$derived` must be pure. Three reasons:

1. **Correctness.** Svelte re-evaluates the expression whenever its inputs change. If the expression has side effects, those side effects run multiple times in unpredictable orders.
2. **Caching.** Svelte memoises the result. If the inputs have not changed, it returns the cached value without re-running the expression. Side effects inside would silently be skipped.
3. **Mental model.** Derived values are *data*. Side effects are *actions*. Mixing them makes code impossible to reason about.

If you need a side effect — logging, calling an API, updating the DOM manually — use `$effect` (Lesson 2.9). Keep `$derived` purely for computations.

### 1.4 Typing derived values

Derived values behave exactly like state values from TypeScript's point of view. You can annotate explicitly or let inference work:

```ts
const items: Item[] = $state([]);
const subtotal: number = $derived(items.reduce((acc, i) => acc + i.quantity * i.price, 0));
const isEmpty: boolean = $derived(items.length === 0);
```

Because derived values are read-only, declare them with `const`. Writing to a `$derived` is an error — Svelte will refuse because the value is computed, not stored.

### 1.5 The single biggest beginner mistake: derived state in $state

This is the bug everyone writes once:

```ts
const items: Item[] = $state([]);
let subtotal: number = $state(0);

function addItem(item: Item): void {
    items.push(item);
    subtotal = subtotal + item.quantity * item.price;
}
```

It works — until the first `removeItem` function forgets to update `subtotal`, or until a future feature updates `items` directly and leaves `subtotal` stale. The fix is always the same:

```ts
const items: Item[] = $state([]);
const subtotal: number = $derived(
    items.reduce((acc, i) => acc + i.quantity * i.price, 0)
);
```

One declaration, zero possibility of drift.

### 1.6 Derived chains and the topological sort

When derived values depend on other derived values — `total` depends on `tax`, `tax` depends on `subtotal`, `subtotal` depends on `items` — Svelte builds a **dependency graph** internally. This graph is a directed acyclic graph (DAG) where edges point from a source signal to its dependents. When `items` changes, Svelte performs a topological sort of the graph and re-evaluates nodes in dependency order: `subtotal` first, then `tax`, then `total`. It never evaluates `total` before `tax` because that would produce a stale intermediate value.

This is entirely automatic. You do not declare the order; you declare the relationships, and the runtime figures out the order. In practice this means you can write your derived declarations in any order in the source code — `total` before `subtotal` would still work — because the graph, not the source order, determines the execution order. But for readability, this course always writes them in dependency order (sources first, final derivations last).

### 1.7 The cost of a derived value

A `$derived` expression is re-evaluated only when its tracked inputs change. Between changes, reading a derived value returns the cached result with zero computation. This lazy-with-cache model means derived values are almost free in terms of CPU — the cost is one evaluation per change, not one evaluation per read.

However, there is a memory cost. Each `$derived` occupies a slot in the reactive graph. If you have a list of 1,000 items and you create a `$derived` for each item, you have 1,000 graph nodes. For most applications this is fine, but if you are rendering thousands of reactive cells (like a spreadsheet), you may want to reconsider the granularity — batch the derivation at the list level rather than the item level.

### 1.8 The April 2026 difference

Svelte 3/4 had a magical `$:` syntax for derived values:

```js
$: doubled = count * 2;
```

Svelte 5 replaces this with `$derived(count * 2)` — explicit, typed, and consistent with the rest of the rune system. If you see `$:` in a tutorial, it is outdated (there is actually a compat mode that still supports it in 5, but the course never uses it).

### 1.9 When to use `$derived` vs when to compute inline

Not every computation needs to be a `$derived` variable. If the computation is trivial — `count + 1`, for example — and is only used in one place in the template, you can compute it inline: `<p>{count + 1}</p>`. Svelte will re-evaluate the expression on every render of that node, which is identical in cost to a `$derived` for a simple expression.

Use `$derived` when:

- The computation is used in more than one place (avoids duplication).
- The computation is expensive and you want it cached (e.g., filtering a large array).
- The computation has a semantic name that aids readability (`subtotal` is clearer than an inline reduce).
- You need to reference the value in an `$effect` or pass it to a child component.

Use inline expressions when:

- The computation is trivial and used once.
- Naming it would not add clarity.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, the difference between "everyone stores derived values as `$state` and updates them manually" and "everyone uses `$derived`" is the difference between zero consistency bugs and dozens. Manual synchronization does not scale linearly — it scales quadratically, because every new piece of primary state adds potential drift points for every existing derived value. A dashboard with ten widgets, each deriving three values from shared state, has 30 derivations. If even one is manual, it will eventually drift. `$derived` makes drift structurally impossible.

**The mental model.** Think of primary state as cells in a spreadsheet and `$derived` as formulas. Cell A1 contains a number you typed. Cell A2 contains `=A1*2`. You never *type into* A2; it always shows the formula's result. If you tried to type into A2, the spreadsheet would reject you — that cell is a formula, not an input. `$derived` is the formula cell. `$state` is the input cell. The spreadsheet analogy is not accidental — the reactive signal model that powers Svelte's runes traces its academic lineage directly back to the same dependency-tracking algorithms that power spreadsheet engines.

**Edge cases.** If a `$derived` expression conditionally reads different state variables depending on a branch, only the variables actually read in the most recent evaluation are tracked. This means the set of dependencies can change between evaluations. In practice this rarely matters, but it can surprise you if a derived value "stops updating" because the branch that reads a particular state variable stopped being taken. Another edge case: circular dependencies. If `a = $derived(b * 2)` and `b = $derived(a + 1)`, the compiler will reject this with an error about circular references. The dependency graph must be acyclic.

**Performance implications.** Each `$derived` creates one node in the reactive graph. The graph is walked on every state change to determine which nodes need re-evaluation. For typical applications (tens to hundreds of derived values), this walk is sub-microsecond. For extreme cases (thousands of interleaved derived values), the graph traversal itself can become measurable. The solution is to batch derivations: instead of 1,000 per-item derived values, compute one derived array that maps over the items. Module 12 covers this optimization pattern in Lesson 12.5.

**Connection to other modules.** `$derived` reappears everywhere. Module 3 uses it for computed props. Module 5 uses it for derived event state (e.g., "is the form valid?" derived from all field states). Module 11 uses it in reactive classes for computed totals. Module 12 uses it as a memoization tool for expensive computations. The concept of "a value that is always a function of other values, guaranteed consistent" is the single most powerful tool for eliminating bugs in a reactive system.

## 2. Style it — A live cart total

The mini-build is a mini shopping cart with three hardcoded line items. Each item has a stepper for quantity. Below the list, three derived values — subtotal, tax, and grand total — update as you press the steppers. PE7 tokens throughout; `prefers-reduced-motion` respected on the number transitions.

## 3. Interact — The derived chain

The script declares:

```ts
const TAX_RATE = 0.2;
const items: LineItem[] = $state([...]);
const subtotal: number = $derived(items.reduce((acc, i) => acc + i.quantity * i.price, 0));
const tax: number = $derived(subtotal * TAX_RATE);
const total: number = $derived(subtotal + tax);
```

`total` depends on `tax`, which depends on `subtotal`, which depends on `items`. This is a **dependency chain**, and Svelte handles it for free. When `items` changes, `subtotal` recomputes, which triggers `tax` to recompute, which triggers `total` to recompute, in the right order, without you writing any orchestration code.

## 4. Mini-build — A three-derived cart

**File:** `src/routes/modules/02-reactivity/07-derived/+page.svelte`

### DevTools verification

1. Click a stepper. All three derived values update in sync.
2. Open the Console and type `items[0].quantity = 5` (if the state is exposed via a window hook you add for debugging). The totals update without touching the stepper.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between primary state and derived state?</summary>

Primary state is stored directly (the list of line items). Derived state is computed from other state (the subtotal). You store primary state with `$state`; you express derived state with `$derived`.
</details>

<details>
<summary><strong>Q2.</strong> Why must the expression inside <code>$derived</code> be pure?</summary>

Because Svelte re-evaluates it whenever its inputs change and caches the result when they don't. Side effects inside would run at unpredictable times (or not at all), breaking correctness.
</details>

<details>
<summary><strong>Q3.</strong> What goes wrong if you store a derived value in its own <code>$state</code>?</summary>

Drift. Every site that changes the primary state has to remember to update the derived value. One missed update and the UI shows a contradiction.
</details>

<details>
<summary><strong>Q4.</strong> Can you write to a <code>$derived</code> value?</summary>

No. Derived values are computed from their inputs, so they are conceptually read-only. Svelte enforces this at compile time.
</details>

<details>
<summary><strong>Q5.</strong> In Svelte 5, what replaces the Svelte 3/4 <code>$: doubled = count * 2</code> syntax?</summary>

`const doubled = $derived(count * 2)`. The intent is identical; the rune syntax is explicit and consistent with the rest of Svelte 5.
</details>

## 6. Common mistakes

- **Storing derived values in $state and updating them by hand.** The whole point of $derived is that you cannot forget.
- **Putting a side effect in the derived expression.** `$derived(() => { console.log(count); return count * 2 })` is wrong; logs belong in `$effect`.
- **Thinking the derived expression is evaluated once.** It is re-evaluated whenever its tracked inputs change. Keep it cheap — or use `$derived.by` for complex logic (Lesson 2.8).
- **Trying to reassign a derived.** `doubled = 10` is a compile error. If you want to reassign, you probably want `$state`.

## 7. What's next

Lesson 2.8 introduces `$derived.by` for derived values whose computation is too complex to fit in a single expression.
