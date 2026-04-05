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

### 1.6 The April 2026 difference

Svelte 3/4 had a magical `$:` syntax for derived values:

```js
$: doubled = count * 2;
```

Svelte 5 replaces this with `$derived(count * 2)` — explicit, typed, and consistent with the rest of the rune system. If you see `$:` in a tutorial, it is outdated (there is actually a compat mode that still supports it in 5, but the course never uses it).

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
