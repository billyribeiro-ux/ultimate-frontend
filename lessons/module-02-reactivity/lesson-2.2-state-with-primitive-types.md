---
module: 2
lesson: 2.2
title: $state with primitive types
duration: 45 minutes
prerequisites:
  - Lesson 2.1 — What state is and why it exists
learning_objectives:
  - Declare reactive state with the $state rune and a primitive initial value
  - Explain, in one sentence, what the compiler does with $state at build time
  - Reassign state from an event handler and see the DOM update
  - Type $state variables with explicit TypeScript annotations
  - Recognise when you need $state and when a plain const is enough
status: ready
---

# Lesson 2.2 — `$state` with primitive types

## 1. Concept — The one edit that turns a variable into reactive state

### 1.1 The problem solved by one rune

Lesson 2.1 left you with a broken counter. A `setInterval` incremented a plain variable in memory, the console proved the number was changing, and the DOM stubbornly refused to update. You were told the fix was a single rune. This lesson uses that rune.

```svelte
<script lang="ts">
    let count: number = $state(0);

    function increment(): void {
        count = count + 1;
    }
</script>

<button onclick={increment}>Clicked {count} times</button>
```

Click the button. The count goes up. Click again. It goes up again. The label tracks the value, the value tracks the clicks, and the whole thing works. Compare this to the Lesson 2.1 version: the only difference is `= 0` became `= $state(0)`. Seven characters. That is Svelte 5's promise — reactivity is opt-in but nearly invisible in the code.

### 1.2 What `$state` actually is

`$state` is a **rune**. A rune is a special function that the Svelte compiler recognises and rewrites at compile time. Unlike a normal JavaScript function, `$state` does not exist as a real function at runtime. You cannot import it. You cannot pass it around as a value. The compiler finds the literal text `$state(...)` in your source code, checks how the variable is used, and generates code that:

1. Creates a **signal** — a small internal container — around the initial value you passed.
2. Rewrites every *read* of the variable (like `{count}` in the markup or `count + 1` in a handler) into a call that registers a subscription to the signal.
3. Rewrites every *write* (like `count = count + 1`) into a signal update that notifies subscribers.
4. Emits DOM update instructions that run when the signal notifies.

From your point of view, `count` still looks like a plain variable. You read it with `count` and you write it with `count = newValue`. The compiler does the rest. This is the compile-time magic that makes Svelte 5 feel like regular JavaScript while still being fully reactive.

### 1.3 Reading and writing are ordinary

One of the best decisions in the Svelte 5 design is that consuming a signal requires no special syntax. In React you write `count`, but to *change* it you have to call `setCount(newValue)`. In Vue you write `count.value` (with the `.value`) for both reads and writes inside the script block. In Svelte 5, you write `count` to read and `count = ...` to write. The compiler hides the signal machinery so thoroughly that it looks like plain JavaScript.

One consequence of this is that the type of `count` is *not* a wrapper type. It is `number`, just like if you had written `let count: number = 0`. The type annotation behaves exactly as you would expect:

```ts
let count: number = $state(0);
count = 'five'; // Error: Type 'string' is not assignable to type 'number'.
```

This is crucial for TypeScript users. `$state` does not warp your types. It leaves them alone.

### 1.4 When to use `$state` and when not to

A value wants `$state` when:

- It changes during the life of the component.
- The UI needs to re-render when it changes.

A value does **not** want `$state` when:

- It never changes (use `const`).
- It is computed from other state (use `$derived`, Lesson 2.7).
- It is a prop coming in from a parent (use `$props`, Module 3).

Wrapping a constant in `$state` costs a tiny bit of signal-creation overhead and adds noise. It is not wrong, but it is not correct either. A good habit: declare every value as a plain `const` first, and only change it to `let x = $state(...)` when you actually need to write to it.

### 1.5 Primitive initial values

This lesson is about **primitive** state: numbers, strings, booleans. These are the three simplest types, and they behave exactly as you would expect.

```ts
let count: number = $state(0);
let username: string = $state('');
let isOpen: boolean = $state(false);
```

Each is a signal that holds one JavaScript primitive. Reassigning the whole variable triggers an update:

```ts
count = count + 1;     // ✓
username = 'ada';       // ✓
isOpen = !isOpen;       // ✓
```

Object and array state behave a little differently (Lesson 2.3 and 2.4) because objects can be mutated in place without reassignment. For primitives there is nothing to mutate — you can only replace the value — so every change is a reassignment and every reassignment triggers reactivity. Primitives are the simplest case.

### 1.6 Event handlers with `onclick`

Svelte 5 uses lowercase event attributes, identical to HTML: `onclick`, `oninput`, `onsubmit`, `onchange`. The value is a TypeScript expression — almost always a function from the script block:

```svelte
<button onclick={increment}>Clicked {count} times</button>
```

Older Svelte (3/4) used `on:click={increment}` with a colon. That syntax is **removed** in Svelte 5. If you see `on:click` in a tutorial, it is outdated. Always use the lowercase attribute form in this course.

You can also pass an inline arrow function, though it is usually cleaner to define a named function above:

```svelte
<button onclick={() => count++}>Click</button>
```

### 1.7 The May 2026 pattern vs what you may see online

If you search "Svelte counter" on Google, the top results are still full of Svelte 3 and 4 code: plain `let count = 0` as "automatically reactive", `on:click` event binding, and `$: doubled = count * 2` for derived values. None of these work in Svelte 5 the way the tutorial intends. Use this checklist to spot outdated code:

- Reactive values declared with plain `let` → should be `$state(...)`.
- Derived values with `$:` → should be `$derived(...)` (Lesson 2.7).
- Events with `on:click` → should be `onclick`.
- Component events with `createEventDispatcher` → should be callback props (Module 5).

Stick to the four rules above and you will always be writing current Svelte.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, every component that allows user interaction contains at least one `$state` declaration. A dashboard might have 200 reactive primitives spread across dozens of components — toggle states, counters, selected tab indices, input values. If the mental model of "how do I make a value reactive?" is unclear, developers reach for workarounds: global stores for local state, prop drilling of setters, or manual DOM manipulation. Clear understanding of `$state` with primitives eliminates all of those anti-patterns and makes component-local state feel natural and safe.

**The mental model.** Think of `$state(0)` as putting the value inside a glass box wired to an alarm. Anyone looking at the box (reading the variable in markup or a derived expression) gets a subscription to the alarm. Anyone replacing the contents of the box (reassigning the variable) triggers the alarm. The alarm only rings for observers who were actually looking. If you have a counter in one component and a toggle in another, the counter's alarm never rings for the toggle's observers. This per-variable granularity is what makes Svelte fast without a virtual DOM.

**Edge cases.** A common surprise: `$state` with `undefined` as the initial value. `let value: string | undefined = $state(undefined)` is valid and useful for "not yet set" patterns. However, if you forget the type annotation, TypeScript infers `undefined` as a literal type and later rejects `value = 'hello'`. Always annotate when the initial value does not express the full intended type. Another edge case: using `$state` inside a `.ts` file (not a `.svelte` file). This works in Svelte 5 — the compiler processes `.svelte.ts` files — but you must name the file with the `.svelte.ts` extension. A plain `.ts` file does not get compiled by the Svelte plugin, and `$state` inside it will be treated as a syntax error.

**Performance implications.** Each `$state` primitive creates one signal node in the reactive graph. The memory overhead is roughly 100-200 bytes per signal depending on the runtime. For typical applications (tens to low hundreds of state variables), this is unmeasurable. The reactivity update path — from signal write to DOM update — is a direct pointer chase with no diffing, no reconciliation, and no virtual DOM traversal. A single `count++` triggers exactly one text node update in the DOM. This direct-update architecture is why Svelte consistently benchmarks 2-10x faster than virtual-DOM frameworks on fine-grained updates.

**Cross-module connections.** Primitive `$state` is the atom from which everything else is built. Module 3 uses it inside components for local interaction state. Module 5 uses it for tracking event-derived values (mouse position, scroll offset). Module 7 uses it as the bridge between GSAP animations and the reactive graph. Module 11 extracts it into `.svelte.ts` files for shared state across pages. Every time you see a reactive number, string, or boolean in this course, you are looking at the same mechanism introduced here.

### 1.8 What the compiler does with `$state` — a closer look

When you write `let count: number = $state(0)`, the compiler transforms it into something like:

```js
// Simplified compiled output
import { source, get, set } from 'svelte/internal/client';

const count = source(0);  // Creates a signal with initial value 0

// Every read of count in markup becomes:
get(count);  // Registers a subscription

// Every write (count = count + 1) becomes:
set(count, get(count) + 1);  // Notifies subscribers
```

The `source()` function creates a signal node in the reactive graph. `get()` reads the current value and registers the caller as a dependent. `set()` writes a new value and triggers re-evaluation of all dependents. Your authored code (`count`, `count = count + 1`) looks like plain JavaScript. The compiled code is signal operations. This is the compile-time magic that makes Svelte 5 feel minimal while being fully reactive.

### 1.9 "In production" — why explicit runes prevented a refactor bug

At a 50-developer product team, a developer moved a counter from a component's top-level script into a helper function. In Svelte 4, the counter was a plain `let count = 0` that was "magically reactive" at the top level. Inside the helper function, the magic stopped — the counter updated in memory but the UI froze. The team spent two hours debugging before discovering that Svelte 4's implicit reactivity did not work inside nested functions. In Svelte 5, `$state(0)` is explicit. Moving it into a helper function (in a `.svelte.ts` file) works identically because `$state` is a compiler intrinsic, not a positional magic. The rune system made refactoring safe because reactivity travels with the declaration, not with its position in the file.

### 1.10 Common interview question

**Q: "In Svelte 5, what happens internally when you write `count++` on a `$state` variable? Walk through the update cycle."**

**Model answer:** The compiler rewrites `count++` into a signal `set()` call. This notifies the reactive scheduler that the signal has a new value. The scheduler batches this notification with any other signal changes in the same microtask. After the current synchronous code finishes, the scheduler walks the dependency graph: every `$derived` that reads `count` recomputes, every template expression that references `count` emits a targeted DOM update (like `textNode.data = newValue`), and every `$effect` that reads `count` is scheduled to run after the DOM update. The key insight is granularity: only the specific DOM nodes and computations that depend on `count` are touched. Other parts of the component are untouched. There is no virtual DOM diff, no whole-component re-render.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/$state](https://svelte.dev/docs/svelte/$state) — the `$state` rune reference with all variants.
- [svelte.dev/docs/svelte/what-are-runes](https://svelte.dev/docs/svelte/what-are-runes) — the conceptual overview of the rune system.
- [svelte.dev/docs/svelte/old-vs-new](https://svelte.dev/docs/svelte/old-vs-new) — a migration guide comparing Svelte 4 and Svelte 5 reactivity.

**Advanced pattern: state with union types for mode toggles.** Instead of a boolean `isPlaying`, use a union type that carries more information:

```ts
type PlayerState = 'idle' | 'playing' | 'paused' | 'buffering';
let playerState: PlayerState = $state('idle');
```

This prevents impossible states (you cannot be both "playing" and "paused") and gives you exhaustive branching in `{#if}` chains. The type system becomes your state machine validator.

**Challenge question (combines Lesson 2.2 + Lesson 2.1 + Lesson 1.4):** A developer writes `const count = $state(0)` with `const` instead of `let`. Explain why this compiles but makes the state useless. Then explain what happens if they write `const count: string = $state(0)` — which error fires first, and why?

## 2. Style it — The counter we couldn't build in Module 1

The mini-build is the classic counter: a big number, a plus button, a minus button, a reset. PE7 tokens for colour and spacing. Buttons have a minimum 44×44 touch target. A small transition on the count number respects `prefers-reduced-motion`.

## 3. Interact — Replacing the broken counter from Lesson 2.1

Reopen Lesson 2.1's mini-build in your editor. Change the single line:

```ts
const clock: { seconds: number } = { seconds: 0 };
```

to:

```ts
let seconds: number = $state(0);
```

And change the interval body to:

```ts
seconds = seconds + 1;
```

Save. Open the route. The counter now counts. That single rune was the entire fix.

## 4. Mini-build — A typed counter

**File:** `src/routes/modules/02-reactivity/02-state-primitives/+page.svelte`

The page has three buttons (`+1`, `−1`, `Reset`) and a large number. A typed boolean state controls whether a "confirmation" message appears briefly after reset. The number transitions subtly when it changes (respecting reduced motion).

### DevTools verification

1. Open DevTools → Elements.
2. Click the `+` button. Watch the text inside the number element change in place. Svelte does not replace the whole element — only the text node.
3. Open the Svelte DevTools extension (if installed) and observe the `count` signal in the component's state list.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the <em>only</em> difference, in code, between a non-reactive constant and a reactive primitive state?</summary>

The initial value is wrapped in `$state(...)` and the binding is `let` instead of `const`. Reads and writes look identical.
</details>

<details>
<summary><strong>Q2.</strong> Does <code>$state</code> change the TypeScript type of your variable?</summary>

No. `let count: number = $state(0)` has type `number`, not a wrapper type. You use it exactly like a number.
</details>

<details>
<summary><strong>Q3.</strong> What is the Svelte 5 replacement for <code>on:click={handler}</code>?</summary>

The lowercase attribute form `onclick={handler}`. This matches native HTML and is the only form supported in Svelte 5.
</details>

<details>
<summary><strong>Q4.</strong> Would you use <code>$state</code> for a value that never changes during the life of the component?</summary>

No. Use `const` (or a plain `let` if you must). Wrapping a constant in `$state` adds signal machinery for no benefit.
</details>

<details>
<summary><strong>Q5.</strong> You write <code>let count: number = $state(0)</code> and try <code>count = 'five'</code>. What happens?</summary>

TypeScript rejects it at compile time with `Type 'string' is not assignable to type 'number'`. The `$state` rune does not weaken the type.
</details>

## 6. Common mistakes

- **Forgetting the rune.** `let count: number = 0` and then `count++` in a handler. Svelte 5 will error with *"`count` is updated, but is not declared with `$state(...)`"*. Add the rune.
- **Using `const` with `$state`.** `const count = $state(0)` is technically legal but makes reassignment impossible — which defeats the point. Always use `let`.
- **Trying to import `$state`.** `$state` is a compiler intrinsic, not a function. You do not import it from anywhere. If your editor shows an "unused import" warning, delete the import.
- **Writing `on:click` out of habit.** Svelte 5 compiles this to a warning and then a hard error. Use `onclick`.

## 7. What's next

Lesson 2.3 shows what happens when the value inside `$state` is an object — and introduces the concept of a deep reactive proxy.
