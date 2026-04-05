---
module: 2
lesson: 2.8
title: $derived.by() — complex derived computations
duration: 35 minutes
prerequisites:
  - Lesson 2.7 — $derived
learning_objectives:
  - Explain the difference between $derived and $derived.by
  - Use $derived.by when a derived value needs local variables or multiple statements
  - Return a typed value from the function passed to $derived.by
  - Understand that $derived.by is still pure and still memoized
  - Recognise when a computation is too complex for a single expression
status: ready
---

# Lesson 2.8 — `$derived.by()` — complex derived computations

## 1. Concept — When one expression is not enough

### 1.1 The problem: some computations need a few lines

`$derived(items.reduce((a, i) => a + i.price * i.quantity, 0))` fits on one line. So does `$derived(subtotal * TAX_RATE)`. But real computations are sometimes trickier: you need a local variable, an early return, a conditional branch, or a loop that cannot be expressed as a single reduce. For example, grouping items by category, or computing a histogram, or running a small state machine over a list. Cramming that into a single expression produces unreadable code full of nested ternaries and immediately-invoked arrow functions.

Svelte provides `$derived.by(fn)` for exactly this case. You pass a function (zero arguments, returns the derived value); Svelte calls it, tracks the state reads inside, and memoises the result. Everything else about `$derived` still applies: the function must be pure, the result is cached until its inputs change, and the derived value is read-only.

### 1.2 Declaring a complex derived

```ts
const groupedItems: Record<string, LineItem[]> = $derived.by(() => {
    const groups: Record<string, LineItem[]> = {};
    for (const item of items) {
        const key = item.category;
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
    }
    return groups;
});
```

Read this carefully. The function takes no arguments. Inside, we can declare local variables, loop, and branch. The return value is what `groupedItems` holds. Svelte tracks `items` as a dependency because the function reads it. When `items` changes, the function re-runs and `groupedItems` updates.

### 1.3 When to prefer `$derived` vs `$derived.by`

A simple rule:

- If your computation is a single expression, use `$derived(expr)`.
- If it needs more than one statement, use `$derived.by(() => { ... })`.

You can always convert between them. `$derived(x * 2)` and `$derived.by(() => x * 2)` are equivalent. The `.by` form is just less concise for the simple case.

### 1.4 Typing `$derived.by`

Provide a return type annotation on the function or an explicit type on the variable:

```ts
const histogram: Record<number, number> = $derived.by(() => {
    const out: Record<number, number> = {};
    for (const value of values) {
        out[value] = (out[value] ?? 0) + 1;
    }
    return out;
});
```

### 1.5 Purity is still required

Everything said in Lesson 2.7 about purity still applies. The function you pass to `$derived.by` must not have side effects. No logging, no DOM writes, no API calls. Svelte may skip or repeat the call based on dependency tracking, so any side effect would run at unpredictable times. Use `$effect` (Lesson 2.9) for side effects.

## 2. Style it — Grouped items view

The mini-build extends the cart from Lesson 2.7. Line items now have a `category` field. A `groupedItems` derived value, computed with `$derived.by`, organises the items by category. The markup iterates over the groups and shows each category as its own subsection.

## 3. Interact — Why the single-expression form falls apart

Try writing the grouping as a single expression:

```ts
const grouped = $derived(
    items.reduce<Record<string, LineItem[]>>((acc, item) => ({
        ...acc,
        [item.category]: [...(acc[item.category] ?? []), item]
    }), {})
);
```

It works, but it allocates two new objects and a new array per item — wasteful for long lists and hard to read. The `$derived.by` version is clearer and faster.

## 4. Mini-build — A grouped cart

**File:** `src/routes/modules/02-reactivity/08-derived-by/+page.svelte`

### DevTools verification

1. Change an item's quantity. The grouped view re-renders.
2. Add a console.log inside the `$derived.by` function (temporarily, for teaching — we'll remove it). Observe that it only runs when `items` actually changes.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> When should you prefer <code>$derived.by</code> over <code>$derived</code>?</summary>

When the computation needs multiple statements, local variables, loops, or early returns. For a single-expression computation, prefer the shorter `$derived` form.
</details>

<details>
<summary><strong>Q2.</strong> Is the function passed to <code>$derived.by</code> allowed to have side effects?</summary>

No. It must be pure. Svelte re-runs it only when its dependencies change and caches the result, so side effects would run at unpredictable times. Use `$effect` for side effects.
</details>

<details>
<summary><strong>Q3.</strong> Can you convert every <code>$derived(expr)</code> to <code>$derived.by(() => expr)</code>?</summary>

Yes. They are semantically equivalent. The `.by` form is just more verbose for simple expressions.
</details>

<details>
<summary><strong>Q4.</strong> How do you type the return value of a <code>$derived.by</code>?</summary>

Either annotate the variable explicitly (`const x: Result = $derived.by(() => ...)`) or give the arrow function a return type (`$derived.by((): Result => { ... })`). Usually annotating the variable is cleaner.
</details>

<details>
<summary><strong>Q5.</strong> Does <code>$derived.by</code> re-run on every render?</summary>

No. It re-runs only when its tracked dependencies change. Reading the derived value does not trigger recomputation — Svelte returns the cached result.
</details>

## 6. Common mistakes

- **Using `$derived.by` when a plain `$derived` would do.** It is slightly more verbose; use the simple form when you can.
- **Adding side effects inside the function.** Move them to `$effect`.
- **Forgetting the arrow function wrapper.** `$derived.by(expr)` is a syntax error — you must pass a function. `$derived(expr)` is the version that takes an expression directly.
- **Relying on arguments to the function.** The function takes no arguments and Svelte ignores any you try to pass. Read state variables from the enclosing scope instead.

## 7. What's next

Lesson 2.9 introduces the last new rune in Module 2 — `$effect` — for the side effects you are not supposed to put inside `$derived`.
