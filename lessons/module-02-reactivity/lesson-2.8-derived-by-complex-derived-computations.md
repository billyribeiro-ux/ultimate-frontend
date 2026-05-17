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

### 1.5 "In production" — grouping without flicker

At a 50-developer analytics platform, the dashboard displayed metrics grouped by geographic region. Data updated every 5 seconds via a WebSocket push. The initial implementation used an `$effect` to compute the grouping and store it in a separate `$state`. This created a one-tick delay: the raw data updated, then the DOM reflected the raw data, then the effect ran, then the grouped data updated. Users saw a brief flicker where totals and detail rows disagreed.

Refactoring to `$derived.by` eliminated the flicker. The grouping computed synchronously as part of the reactive graph, before any DOM update. The totals and detail rows were always consistent in the same paint. The fix: replace `$effect(() => { grouped = compute(data) })` with `const grouped = $derived.by(() => compute(data))`. One line. Zero flicker.

### 1.6 Comparison: `$derived` vs `$derived.by`

| Feature | `$derived(expr)` | `$derived.by(() => { ... })` |
|---|---|---|
| Input | Single expression | Function body |
| Local variables | Not possible | Allowed |
| Loops and branches | Not possible | Allowed |
| Dependency tracking | Same | Same |
| Caching/memoisation | Same | Same |
| Purity requirement | Same | Same |
| Typical use | `count * 2` | Grouping, histograms, multi-step transforms |

### 1.7 Purity is still required

Everything said in Lesson 2.7 about purity still applies. The function you pass to `$derived.by` must not have side effects. No logging, no DOM writes, no API calls. Svelte may skip or repeat the call based on dependency tracking, so any side effect would run at unpredictable times. Use `$effect` (Lesson 2.9) for side effects.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, derived computations quickly outgrow single expressions. A dashboard widget that groups sales by region, filters by date range, and computes running totals cannot fit in a one-liner. Without `$derived.by`, developers either cram unreadable reduce chains into `$derived`, or — worse — they give up on derivation entirely and store the computed result in its own `$state`, manually updating it in effects. The manual approach reintroduces drift bugs. `$derived.by` gives you the safety of derivation (always consistent, always cached) with the expressiveness of a full function body.

**The mental model.** Think of `$derived(expr)` as a single-cell formula in a spreadsheet — `=A1*2`. Think of `$derived.by(fn)` as a *named function* in a spreadsheet — a VBA macro that computes a cell's value using loops and conditionals. The spreadsheet still knows the dependencies (which cells the function reads), still caches the result, and still recomputes only when inputs change. The only difference is how complex the computation is allowed to be. The runtime behaviour — dependency tracking, memoisation, topological ordering — is identical.

**Edge cases.** A subtle trap: if the function passed to `$derived.by` conditionally reads different state depending on a branch, the dependency set can change between evaluations. This is the same dynamic-dependency behaviour as `$derived`, but it is easier to accidentally create in a multi-statement function. For example, an early `return` that skips reading a state variable means that variable is not tracked in that run. If the variable later changes, the derived value will *not* recompute — because it was not a dependency last time. Always ensure all relevant state is read unconditionally (or at least understand the implications). Another edge case: calling a non-pure helper function inside `$derived.by` that internally reads state — those reads are also tracked, which can create unexpected dependency chains.

**Performance implications.** `$derived.by` has the same caching semantics as `$derived`: the function only re-runs when tracked inputs change, and the result is cached between changes. For expensive computations (grouping 10,000 items, computing statistics), this memoisation means the cost is paid once per state change, not once per render. If the derived value is read in multiple places in the template, the computation still runs only once. For extremely expensive computations (100ms+), consider pairing `$derived.by` with a web worker or breaking the computation into smaller derived steps that recompute independently.

**Cross-module connections.** `$derived.by` is the workhorse behind many patterns in later modules. Module 5 uses it for complex form validation (checking multiple field states and returning a structured error object). Module 11 uses it inside reactive classes for computed properties that need loops. Module 12 uses it as the primary memoisation tool, replacing `useMemo` patterns from React. Whenever you see a "computed value that needs more than one line," `$derived.by` is the answer.

### 1.6 What the compiler does with `$derived.by`

The compiled output of `$derived.by` is essentially the same as `$derived`, but the computation is wrapped in a function call. For `$derived(expr)`, the compiler inlines the expression into a memo node. For `$derived.by(fn)`, it calls the function and stores the result in the same memo node. Both use the same dependency tracking, the same caching, and the same invalidation logic. The difference is purely syntactic — `.by` accepts a function body; plain `$derived` accepts an expression.

### 1.7 "In production" — grouping data without losing reactivity

At a 50-developer analytics platform, the dashboard needed to display metrics grouped by region. The data changed every 5 seconds via a WebSocket. Initially, the team computed the grouping in a `$effect` and stored the result in a separate `$state`. This worked but introduced a one-tick delay: the raw data updated, then the effect ran, then the grouped data updated. Users saw a brief flicker where the totals and the detail rows disagreed.

Switching to `$derived.by` eliminated the flicker. The grouped data recomputed synchronously as part of the reactive graph, before the DOM updated. The totals and detail rows were always consistent in the same paint. The fix was replacing `$effect(() => { grouped = compute(data) })` with `const grouped = $derived.by(() => compute(data))`. One line, zero flicker.

### 1.8 Common interview question

**Q: "Can you put an `async` function inside `$derived.by`?"**

**Model answer:** No. `$derived.by` requires a synchronous function that returns a value immediately. An async function returns a Promise, not the resolved value. If you need to compute a derived value from async data, the correct pattern is to store the async result in `$state` (via an `$effect` that awaits and assigns) and then derive from that state. Alternatively, use `{#await}` in the template for async data that drives rendering. The reason for the synchronous constraint is that the reactive graph must be consistent at all times — if a derived value were pending, every downstream consumer would need to handle a pending state, which defeats the purpose of deterministic derivations.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/$derived#$derived.by](https://svelte.dev/docs/svelte/$derived#$derived.by) — the official `$derived.by` reference.
- [svelte.dev/docs/svelte/$derived](https://svelte.dev/docs/svelte/$derived) — the full `$derived` family.
- [svelte.dev/docs/svelte/reactivity-fundamentals](https://svelte.dev/docs/svelte/reactivity-fundamentals) — memoisation and dependency tracking.

**Advanced pattern: multi-step derived transformations.** For complex data processing, chain multiple `$derived.by` calls:

```ts
const filtered = $derived.by(() => items.filter(i => i.active));
const sorted = $derived.by(() => [...filtered].sort((a, b) => a.name.localeCompare(b.name)));
const grouped = $derived.by(() => {
    const groups: Record<string, Item[]> = {};
    for (const item of sorted) {
        (groups[item.category] ??= []).push(item);
    }
    return groups;
});
```

Each step only recomputes when its inputs change. If only the sort order changes, `filtered` returns its cached value and only `sorted` and `grouped` recompute.

**Challenge question (combines Lesson 2.8 + Lesson 2.7 + Lesson 2.4):** You have a `$state` array of sales records with `amount`, `region`, and `date`. Write a `$derived.by` that groups them by region and computes a total per region. Then write a second `$derived` that finds the highest-grossing region. Explain why you cannot put both computations in the same `$derived.by` call (you can, but should you?).

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
