---
module: 2
lesson: 2.5
title: $state.raw() — non-deep reactive state
duration: 35 minutes
prerequisites:
  - Lesson 2.3 — $state with objects
  - Lesson 2.4 — $state with arrays
learning_objectives:
  - Explain what $state.raw does and how it differs from $state
  - Identify three cases where raw state is the right choice
  - Replace a raw state value by reassignment rather than mutation
  - Type raw state the same way as ordinary state
  - Benchmark the difference in a large list
status: ready
---

# Lesson 2.5 — `$state.raw()` — non-deep reactive state

## 1. Concept — When you want reactivity *without* the proxy

### 1.1 The problem: proxying can be too much

Lesson 2.3 introduced `$state` for objects and explained that Svelte wraps them in a **deep reactive proxy** — every nested object becomes reactive, every array becomes reactive, every push and every property assignment is intercepted. This is beautiful for small UI state, but it has a cost. Creating a proxy costs memory. Intercepting every read and write costs a few nanoseconds. For a todo list with 20 items, the cost is invisible. For a list of 50,000 data points in a charting library, for a 10 MB JSON blob from a server, or for a third-party class instance that has its own internal state machine, proxying every field is wasted work and sometimes actively breaks things.

Svelte provides an escape hatch: **`$state.raw`**. Raw state is still reactive — the compiler still generates subscriptions and updates — but the value inside is *not* proxied. It is whatever you put in. The trade-off: you can no longer mutate. To change a raw state, you must reassign the whole value.

### 1.2 Declaring raw state

```ts
interface Point { x: number; y: number; }

let points: Point[] = $state.raw([]);

points.push({ x: 1, y: 2 });
// No reactivity — even though the array was mutated, no subscriber is notified.

points = [...points, { x: 1, y: 2 }];
// ✓ Reactivity fires. You reassigned the variable, and Svelte noticed.
```

Raw state is almost always declared with `let`, because you will reassign it. This is the opposite of normal array/object state (`const` because you mutate). Remember the rule: **deep state = const + mutate, raw state = let + reassign.**

### 1.3 When raw state is the right choice

Three concrete situations:

1. **Very large lists you swap wholesale.** A page that loads 10,000 rows from the server and then shows them in a virtualised list. You never mutate individual rows from the Svelte side — you re-fetch and replace. Deep proxying 10,000 objects would cost thousands of proxies for no benefit.
2. **Third-party class instances.** Libraries like `Three.js`, `chart.js`, or `leaflet` return objects that have their own `get`/`set` machinery. Wrapping them in a proxy can break the library. Use `$state.raw` so the instance is passed through untouched.
3. **Deeply nested JSON you only render.** A big read-only configuration object loaded once and rendered. No UI mutates it. Skip the proxy cost.

If none of these apply, use ordinary `$state`. Raw state is an optimisation, not a default.

### 1.4 Raw state can *contain* reactive state

A subtle but powerful combination: you can have a raw *outer* array whose *items* are ordinary reactive objects. The outer array is cheap to swap; the inner objects are still deeply reactive. This hybrid is the right tool when you swap the list often and also need fine-grained updates on each row. It is more advanced than Module 2 normally asks for, but worth knowing the shape exists.

### 1.5 Typing raw state

Exactly the same as typing deep state:

```ts
let config: Config = $state.raw(initialConfig);
```

TypeScript does not care whether the state is proxied — the type is just the value's type.

## Deep Dive

**Why this matters at scale.** In production apps that handle large datasets — analytics dashboards, mapping applications, data visualization tools — the cost of deep proxying becomes measurable. A charting component that receives 50,000 data points and wraps each in a proxy wastes both memory (each proxy is an allocation) and CPU (trap setup on first access). Teams that know when to reach for `$state.raw` can keep their apps performant without abandoning Svelte's reactivity model entirely. The rule of thumb: if the data is fetched wholesale, rendered read-only, and replaced on refetch, `$state.raw` is the right tool.

**The mental model.** Think of `$state.raw` as a mailbox. The mailbox itself is watched — when someone puts a new package in it (reassignment), observers are notified. But the contents of the package are not watched. Nobody cares if you open the package and rearrange the items inside — no alarm fires. This contrasts with deep `$state`, which is like a glass-walled room with motion sensors on every object: move anything and the alarm rings. The mailbox model is perfect for data that arrives as a complete unit and is consumed as a complete unit.

**Edge cases.** A tricky scenario: you declare `let items = $state.raw(bigArray)` and then pass `items[0]` to a child component. That item is a plain object — mutations to it from the child will not trigger reactivity in the parent. This is correct behaviour but can surprise developers who switch between `$state` and `$state.raw`. Another edge case: `$state.raw` with a class instance. The instance's methods still work (they were never proxied), but calling a method that mutates internal state will not trigger a Svelte update. You must reassign the variable afterwards: `instance.doSomething(); instance = instance;` — this is a common pattern for Three.js or D3 objects where the library mutates internally and you need to tell Svelte "something changed."

**Performance implications.** The difference between `$state` and `$state.raw` for a 10,000-item array is roughly 2-5ms of proxy creation time avoided on initial load, plus ~200KB less memory from avoided Proxy objects. For a 100-item array, the difference is unmeasurable. The break-even point depends on your performance budget, but as a rule: if your array has fewer than 500 items and you need to mutate individual items, use `$state`. If it has more than 1,000 items and you replace it wholesale, use `$state.raw`. The gray zone between 500-1,000 rarely matters in practice.

**Cross-module connections.** `$state.raw` is the foundation for several patterns introduced later. Module 7 uses it for GSAP timeline instances and Three.js scenes that must not be proxied. Module 9 uses it for large server responses that are replaced on refetch. Module 12 revisits it explicitly in the performance optimization lesson, showing how to combine `$state.raw` with `$derived` for computed views over large datasets. The complementary tool `$state.snapshot` (Lesson 2.6) goes in the opposite direction — extracting a plain copy from a deep proxy — forming a complete toolkit for controlling when and where proxying happens.

## 2. Style it — A big list, two versions

The mini-build shows the same list twice: once with deep `$state`, once with `$state.raw`. A button rebuilds each. Both versions use identical PE7 styling. The difference is measured via `performance.now()` and displayed as a small benchmark chip.

## 3. Interact — Why mutation looks silent in raw state

The mistake:

```ts
let data: number[] = $state.raw([1, 2, 3]);

function addOne(): void {
    data.push(4); // no error, but no re-render either
}
```

The array is a plain JavaScript array — push works mechanically — but Svelte never wraps it in a proxy, so there is no interception. The UI keeps showing the stale list. The fix:

```ts
function addOne(): void {
    data = [...data, 4]; // reassignment triggers reactivity
}
```

Now Svelte sees `data = ...` as a rewrite of the variable and notifies subscribers. The rule is: with raw state, you only ever write to the variable, never through it.

## 4. Mini-build — A benchmark page

**File:** `src/routes/modules/02-reactivity/05-state-raw/+page.svelte`

Two panels stacked on mobile, side-by-side on desktop. Panel A uses `$state`, panel B uses `$state.raw`. A button on each rebuilds a list of 2000 items and records the time taken. A chip under each panel shows "last build took N ms".

### DevTools verification

1. Click "Rebuild" on the deep panel. Watch the time chip update.
2. Click "Rebuild" on the raw panel. Compare the number — it should be noticeably smaller.
3. Open the Performance tab, record a rebuild, and observe the time spent in proxy creation for the deep version.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the key difference between <code>$state</code> and <code>$state.raw</code>?</summary>

`$state` wraps the value in a deep reactive proxy — mutations trigger reactivity. `$state.raw` stores the value as-is — only reassigning the variable triggers reactivity. Mutations to a raw state value are silent.
</details>

<details>
<summary><strong>Q2.</strong> Why is raw state almost always declared with <code>let</code>?</summary>

Because the only way to update it is reassignment (`raw = newValue`), and `const` forbids reassignment. `let` is required for the update pattern to work at all.
</details>

<details>
<summary><strong>Q3.</strong> Name two cases where $state.raw is a better choice than $state.</summary>

Very large lists you swap wholesale (e.g., 10,000 rows from a server); and third-party class instances (like Three.js objects) that should not be proxied.
</details>

<details>
<summary><strong>Q4.</strong> Can a raw state contain reactive items?</summary>

Yes. You can have `let rows = $state.raw([ $state(obj1), $state(obj2) ])`. The outer array is not proxied but the inner items still are. Useful when you swap the list often but also mutate individual items.
</details>

<details>
<summary><strong>Q5.</strong> What happens if you call <code>data.push(x)</code> on a raw array state?</summary>

Nothing visible — the array is mutated in memory, but the UI does not re-render because raw state only reacts to reassignment of the variable.
</details>

## 6. Common mistakes

- **Reaching for raw state by default.** It is an escape hatch, not a baseline. Use plain `$state` unless you have measured a real performance problem.
- **Mutating raw state and wondering why the UI doesn't update.** You must reassign the whole value.
- **Using `const` with `$state.raw`.** You cannot reassign a `const`, so you cannot update the state. Always `let`.
- **Forgetting raw state exists.** When you hit a performance problem with a 10k-item list or a Three.js scene, `$state.raw` is the right tool.

## 7. What's next

Lesson 2.6 introduces the partner of raw state: `$state.snapshot`, which produces a plain non-proxied copy of a reactive value for serialization.
