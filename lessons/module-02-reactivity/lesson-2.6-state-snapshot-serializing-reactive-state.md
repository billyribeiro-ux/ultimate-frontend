---
module: 2
lesson: 2.6
title: $state.snapshot() — serializing reactive state
duration: 30 minutes
prerequisites:
  - Lesson 2.3 — $state with objects
  - Lesson 2.4 — $state with arrays
learning_objectives:
  - Explain why JSON.stringify sometimes produces surprising results on reactive state
  - Use $state.snapshot to extract a plain JS value from a proxied one
  - Identify the three common consumers of snapshots — JSON, structuredClone, and external libraries
  - Type a snapshot function so its result is plain (not proxied)
  - Avoid using snapshots when a live reference is actually required
status: ready
---

# Lesson 2.6 — `$state.snapshot()` — serializing reactive state

## 1. Concept — A plain copy for plain-JS consumers

### 1.1 The problem: not every consumer speaks proxy

Your reactive state is a JavaScript proxy. Most of the time this is invisible — you read and write it like a plain object. But some functions and libraries care about the *exact* object identity or the *exact* prototype chain. When you hand them a proxy, they either throw, produce wrong results, or serialise strangely. The three most common offenders:

1. **`console.log`.** In DevTools, a proxy often logs as `Proxy(Object) { ... }` with a peculiar shape. You can see the values, but the console tells you it is a proxy, and comparing two logs over time is harder.
2. **`structuredClone` and `postMessage`.** These expect a plain structured-clonable value. A proxy can work but may fail depending on what fields it has.
3. **External libraries** — any non-Svelte code that inspects `Object.getPrototypeOf`, `JSON.stringify` with a custom replacer, or does prototype-based dispatch. These may not handle proxies the way you expect.

`$state.snapshot(value)` solves the problem in one step. It produces a **plain, non-reactive, deeply copied** version of the value you pass in. No proxies, no live references, no surprises. The snapshot is a one-way export — changes to the snapshot do not affect the original, and changes to the original do not affect the snapshot.

### 1.2 Using `$state.snapshot`

```ts
const profile = $state({
    name: 'Ada',
    address: { city: 'London', postcode: 'EC1' }
});

function save(): void {
    const plain = $state.snapshot(profile);
    localStorage.setItem('profile', JSON.stringify(plain));
}
```

The `plain` variable has type `{ name: string; address: { city: string; postcode: string } }` — the same shape as `profile`, but a real plain object, not a proxy. `JSON.stringify` handles it cleanly. So does `structuredClone`, `postMessage`, and every external library.

### 1.3 Shallow vs deep — snapshot is always deep

Unlike `{ ...obj }` or `Array.from(arr)`, `$state.snapshot` copies every level. Nested objects, nested arrays, everything. You get a tree of plain objects.

### 1.4 When NOT to use a snapshot

A snapshot is a *copy*. If you mutate it, nothing happens to the reactive original. That is exactly what you want for logging or serialization, and exactly what you do not want if you were hoping to get a "live pointer" to the state. If you need the live value, pass the state itself (or a getter) instead of a snapshot. A common beginner mistake is to snapshot a value, hand it to a child component, and then be surprised that the child cannot see updates.

### 1.5 Typing snapshot results

`$state.snapshot(value)` returns a value of the same apparent type. TypeScript does not differentiate "reactive T" from "plain T" in its type system — both are just `T`. That is a feature: the snapshot is assignable to any variable that expected the original type.

```ts
interface Profile { name: string; }
const profile: Profile = $state({ name: 'Ada' });
const plain: Profile = $state.snapshot(profile); // type still Profile
```

## 2. Style it — Export and import panel

The mini-build shows a profile form (same idea as Lesson 2.3) plus two new buttons: **Export JSON** and **Import JSON**. Export uses `$state.snapshot` to turn the live profile into a plain value, then `JSON.stringify` it into a textarea. Import reads the textarea, `JSON.parse`s it, and assigns to the state. PE7 styling throughout.

## 3. Interact — Why `JSON.stringify(profile)` usually works but sometimes confuses

Modern `JSON.stringify` handles Svelte's reactive proxies correctly — the output is a sensible JSON string. But if you pass the same proxy to a library that uses `Object.keys` plus a manual loop, or to a logging system that introspects prototypes, the proxy can confuse it. The defensive habit: any time you hand live state to code you did not write, pass `$state.snapshot(value)` instead. The cost is small, the safety is real.

## 4. Mini-build — Profile export/import

**File:** `src/routes/modules/02-reactivity/06-state-snapshot/+page.svelte`

Form above, textarea below, export/import buttons in between.

### DevTools verification

1. Click Export. Paste the textarea contents into the Console as `JSON.parse(...)` and verify the result is a plain object with the right fields.
2. Click `console.log(profile)` vs `console.log($state.snapshot(profile))` from your own test buttons (we add two in the mini-build). Observe the difference — the proxy version vs the plain object version.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does <code>$state.snapshot</code> return?</summary>

A plain, deeply-copied, non-reactive version of the value. The result shares no references with the original — mutating either one does not affect the other.
</details>

<details>
<summary><strong>Q2.</strong> Why is a snapshot a poor choice for passing state to a child component?</summary>

Because the child gets a frozen copy. Updates to the parent's state will not propagate into the child, and mutations from the child will not propagate back. Pass the live state (or a getter) instead.
</details>

<details>
<summary><strong>Q3.</strong> When is <code>structuredClone($state.snapshot(x))</code> preferable to <code>structuredClone(x)</code>?</summary>

When `x` is a proxy and you want to be sure the clone is over a plain object. Snapshot normalises the input first, avoiding any edge-case interaction between the proxy and the clone algorithm.
</details>

<details>
<summary><strong>Q4.</strong> Does <code>$state.snapshot</code> preserve class instances or custom prototypes?</summary>

No. It produces plain objects and arrays. If you need to preserve a class instance, keep the original reference instead of snapshotting it.
</details>

<details>
<summary><strong>Q5.</strong> What type does a snapshot have?</summary>

The same type as the input. TypeScript does not distinguish reactive from plain in its type system, so `const plain: Profile = $state.snapshot(profile)` type-checks correctly.
</details>

## 6. Common mistakes

- **Snapshotting something you need to remain live.** If you want two components to share mutable state, share the state itself, not a snapshot.
- **Thinking snapshots are cheap for enormous objects.** A snapshot is a deep copy. For a 10 MB object, that is real work. Only snapshot at the moment you actually hand it to an outside consumer.
- **Forgetting to snapshot before `JSON.stringify`.** It often "looks fine" in dev and then fails on a specific platform. Be defensive.
- **Trying to serialize class instances via snapshot.** Snapshot returns plain objects — the class methods are gone. Implement a `toJSON` method or keep the original reference.

## 7. What's next

Lesson 2.7 introduces the next rune — `$derived` — for values that are *computed* from other state.
