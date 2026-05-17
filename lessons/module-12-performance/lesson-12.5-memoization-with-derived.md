---
module: 12
lesson: 12.5
title: Memoization with $derived and $derived.by
duration: 45 minutes
prerequisites:
  - Lesson 12.4 — $effect performance
  - Module 2 — $derived basics
learning_objectives:
  - Explain how $derived memoises a computation
  - Use $derived.by for multi-step expressions
  - Combine filter, sort, and paginate into a single $derived.by
  - Recognise when the cost of memoisation outweighs its benefits
  - Prove memoisation works by logging the recompute count
status: ready
---

# Lesson 12.5 — Memoization with `$derived`

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. Lesson 12.4 told you to use `$derived` instead of `$effect` for computing values. This lesson explains *why* that matters for performance and how to handle computations too complex for a single expression.

## 1. Concept — Lazy, cached, and automatic

### 1.1 What "memoise" means

To **memoise** a function is to remember the result of a previous call and return the remembered value on future calls whose inputs are the same. Memoisation is the oldest performance trick in computing: don't redo work you have already done. Svelte's `$derived` is memoisation built into the language, so you do not have to implement a cache by hand.

```ts
const doubled = $derived(count * 2);
```

`doubled` is a memoised expression. The first time some piece of the app reads `doubled`, Svelte runs `count * 2`, caches the result, and returns it. The second time, *if `count` has not changed*, Svelte returns the cache without re-running the expression. When `count` changes, the cache is invalidated, and the next read recomputes.

Two properties make this fast:

1. **Lazy.** Nothing recomputes until something reads it. A component that never mounts never reads its derived values, so those derived values never run.
2. **Automatic.** You did not write a cache. You wrote an expression. The compiler inserted the cache for you.

For trivial expressions (multiplying by 2), memoisation is nearly free but also nearly pointless. The win grows with the cost of the expression. The canonical payoff is a large list that is filtered, sorted, and paginated on every render.

### 1.2 `$derived.by` for multi-step expressions

Sometimes the computation needs a `let` binding, a `for` loop, or an `if` statement. A single expression cannot hold any of those. Svelte offers `$derived.by()`, which takes a function and returns a memoised value:

```ts
const visibleMembers = $derived.by(() => {
	const query = search.toLowerCase();
	const filtered = members.filter((m) => {
		if (role !== 'all' && m.role !== role) return false;
		if (query && !m.name.toLowerCase().includes(query)) return false;
		return true;
	});
	const sorted = filtered.toSorted((a, b) => a.name.localeCompare(b.name));
	const start = pageIndex * pageSize;
	return sorted.slice(start, start + pageSize);
});
```

The function is lazy-evaluated, its result is cached, and its dependency list is exactly the reactive values it reads (`search`, `role`, `members`, `pageIndex`, `pageSize`). Changing any one of them invalidates the cache; changing an unrelated reactive value (say, a separate counter) does not cost a single cycle.

This pattern — filter, sort, paginate in one `$derived.by` — is the right answer for every large-list dashboard you will ever build. It is also the exact architecture of a TanStack Table row model pipeline (Lesson 11.8), which is why those two lessons fit together.

### 1.3 A note on reference equality

`$derived` memoises by shallow equality on its dependencies, not on its *output*. If two separate reads produce arrays whose contents are identical but whose references differ, Svelte does not collapse them. This is usually what you want — reference equality is how Svelte's reactivity propagates to consumers — but it means that a naive memoisation over `array.toSorted()` returns a new array reference on every recompute, and any downstream code that compares by reference will see a change.

In practice, this is only a problem for integration points like charts or tables that treat a new reference as "the data changed, re-render everything". TanStack Table handles it correctly. GSAP's `to()` handles it correctly. If you are using a library that does not, fall back to Svelte's fine-grained reactivity and pass the individual fields rather than the whole array.

### 1.4 When memoisation is not worth it

`$derived` has a small bookkeeping cost. For expressions whose work is comparable to or smaller than that bookkeeping cost — `a + b`, `array.length`, `user.name.toUpperCase()` — you could write the expression inline in the template and get the same result without the overhead.

A useful rule: memoise any expression whose work scales with the size of a collection (filters, sorts, maps, reductions), and inline any expression whose work is O(1) and a handful of arithmetic operations. The most expensive expressions in a typical app are list transformations, which is exactly where `$derived.by` is designed to shine.

### 1.5 Proving it works

To prove memoisation is doing its job, add a counter:

```ts
let recomputeCount = $state<number>(0);
const visible = $derived.by(() => {
	recomputeCount++;
	// ... the real computation
	return result;
});
```

Hover over the result, click a button that changes an unrelated reactive value, and confirm that `recomputeCount` does *not* increment. Then click a button that changes one of the dependencies, and confirm it does increment by exactly one. That is memoisation working correctly.

(Strictly, writing to `recomputeCount` inside a `$derived.by` is a side effect and Svelte will warn you in development. The trick is for debugging only. Remove it once you are convinced.)

### 1.6 Combining with TanStack Table

TanStack Table already memoises its row models internally. The Svelte adapter re-reads its inputs via getters (Lesson 11.7), and each row model is a memoised computation. If you put a `$derived.by` over the data *before* it enters the table, you get two layers of memoisation — the outer one for data transformations you care about, the inner one for the table pipeline. Both are correct; they compose without conflict.

## Deep Dive

**Why this matters at scale.** $derived values compute lazily and cache results. Expensive computations only rerun when specific dependencies change.

**The mental model.** $derived is lazy: it computes on first read and caches until dependencies change. $effect is eager: it runs on every dependency change. Extract computation from effects into derived.

**Edge cases.** $derived.by() handles multi-statement computations. The function runs lazily. Multiple $derived values can chain without intermediate computation.

**Performance implications.** $derived eliminates redundant computation. Filtering a 1000-item list in $derived runs once per state change, not once per frame.

**Connection to other modules.** Module 12.4's effect optimization depends on extracting into $derived. Module 11's state uses $derived for computed views.

## 2. Style it — A large list with a clear memoisation counter

The mini-build renders a 500-member list with search, role filter, and pagination — and prints the live recompute count next to the result. Per-page accent: `oklch(70% 0.2 190)` (teal).

- A `$derived.by` combines the three operations.
- The recompute counter is rendered as a small pill under the search input.
- `prefers-reduced-motion` disables the pill's pulse.

## 3. Interact — See the recompute count stay stable

The student can click an "increment unrelated counter" button that mutates a state the derived expression does not read. The recompute count does *not* move. Then they change a filter — the count increments by one. Memoisation is proven in two clicks.

## 4. Mini-build — A filter+sort+paginate memoised list

**File:** `src/routes/modules/12-performance/05-memoization/+page.svelte`

Renders 200 generated members with search, role, and pagination. A `$derived.by` produces the current page. A recompute counter demonstrates that the expression only runs when one of its dependencies changes.

### DevTools moment

Open the Performance panel, record a short interaction (type in the search), and look at the function-call blocks on the main thread. There is exactly one block per keystroke, not one per keystroke per list item. That is the cost of `$derived.by` in action.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does "memoise" mean?</summary>

Remember the result of a previous computation so you do not repeat the work when the inputs have not changed. Svelte's `$derived` applies this automatically, using the reactive dependency graph to know when the cache is valid.
</details>

<details>
<summary><strong>Q2.</strong> Why use <code>$derived.by(() =&gt; { ... })</code> instead of <code>$derived(expression)</code>?</summary>

`$derived.by` takes a function, which lets you use `let`, `if`, `for`, and multiple statements. `$derived` takes a single expression. For anything more complex than a single expression, reach for `$derived.by`.
</details>

<details>
<summary><strong>Q3.</strong> Does memoising a trivial expression like <code>a + b</code> help performance?</summary>

No, and it can slightly hurt. `$derived` has a small bookkeeping cost. For expressions whose work is comparable to that cost, inline them in the template. Memoise work that scales with a collection size, not work that is a constant handful of operations.
</details>

<details>
<summary><strong>Q4.</strong> If you mutate an unrelated reactive value, does <code>$derived.by</code> recompute?</summary>

No. It only recomputes when one of the values it *read* during its last run has changed. Unrelated state changes do not touch its cache.
</details>

<details>
<summary><strong>Q5.</strong> Does <code>$derived</code> help with reference stability?</summary>

Partially. `$derived` returns the same reference as long as none of its dependencies changed. But when a dependency changes, the expression re-runs and returns a new reference — so if you are passing the derived value into a library that compares by reference, every dependency change triggers a downstream re-render.
</details>

## 6. Common mistakes

- **Using <code>$effect</code> to compute a value and setting a local `$state`.** Use `$derived`. Lesson 12.4 covered this; it is the single biggest `$effect` anti-pattern.
- **Writing to reactive state inside a <code>$derived</code>.** Forbidden. Derived expressions must be pure.
- **Memoising trivial expressions.** Unnecessary overhead.
- **Expecting deep equality.** `$derived` compares by shallow reference, not by deep content.

## 7. What's next

Lesson 12.6 introduces Svelte actions — reusable `use:` directives that encapsulate DOM behaviour like click-outside, tooltips, and intersection observers.
