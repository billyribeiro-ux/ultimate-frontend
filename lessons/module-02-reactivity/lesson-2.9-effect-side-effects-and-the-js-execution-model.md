---
module: 2
lesson: 2.9
title: $effect() — side effects and the JS execution model
duration: 50 minutes
prerequisites:
  - Lesson 2.7 — $derived
  - Lesson 2.8 — $derived.by
learning_objectives:
  - Define a "side effect" and name three common kinds in a UI
  - Declare an $effect that runs when its tracked dependencies change
  - Explain when an $effect runs relative to the DOM update
  - Avoid the common trap of writing to state from inside an $effect
  - Type an effect function as () => void
status: ready
---

# Lesson 2.9 — `$effect()` — side effects and the JS execution model

## 1. Concept — The bridge from reactive state to the outside world

### 1.1 The problem: some things are not data

`$state` holds values. `$derived` computes values from other values. Both are pure — they live entirely inside Svelte's reactive graph. But a real application has to talk to the *outside world*: it logs things to the console, saves state to `localStorage`, calls APIs, sets the document title, opens and closes WebSockets, starts and cancels timers, and plays sounds. None of these are data transformations. Each one is a **side effect** — an action that changes something outside the reactive graph.

Side effects cannot live in `$state` (state is a value, not an action) and they cannot live in `$derived` (derived expressions must be pure). They need their own rune: `$effect`. An effect is a block of code that Svelte re-runs whenever the state it reads changes. Unlike `$derived`, it returns nothing — it exists purely for its side effects.

### 1.2 Declaring an effect

```ts
let count: number = $state(0);

$effect(() => {
    console.log('count changed to', count);
});
```

Svelte runs the function once after the component mounts, notices it reads `count`, and subscribes. Every time `count` changes thereafter, Svelte re-runs the function.

Effects are expressions, not declarations — you do not assign them to a variable. Just write `$effect(() => { ... })` at the top level of your `<script>` block.

### 1.3 Three common kinds of side effect

1. **Synchronising with the browser.** Setting `document.title`, `localStorage`, `sessionStorage`, cookies, or `history.replaceState`. These are all single API calls you want to run whenever the relevant state changes.
2. **Talking to third-party libraries.** Initialising a chart, updating a WebGL scene, commanding a video player to seek. Anything outside Svelte's control that needs to know about state changes.
3. **Starting and cancelling background work.** Timers (`setInterval`, `setTimeout`), WebSocket connections, intersection observers, abort controllers. These usually need cleanup, which we will cover in Lesson 2.11.

### 1.4 When effects run, relative to the DOM

An effect runs **after the DOM has been updated** for the current tick. This matters because it means the DOM is already in its new shape when your effect reads it. For example, you can measure an element's new height inside an effect and be sure you are measuring the version after the state change, not before. (If you need to run *before* the DOM update, use `$effect.pre` — Lesson 2.10.)

The exact order of a reactivity tick is:

1. A piece of state changes (e.g. `count = count + 1`).
2. Every `$derived` that depends on it recomputes.
3. Every piece of DOM that reads the state or a derived is updated.
4. Every `$effect` that depends on the state runs.

This ordering is important for mental correctness: by the time an effect fires, the UI has already reflected the state change.

### 1.5 The single biggest trap: writing to state from an effect

```ts
let a: number = $state(0);
let b: number = $state(0);

$effect(() => {
    b = a * 2; // looks reasonable, is a trap
});
```

This *works*, but it is the wrong tool. `b` is a value computed from `a`, which is exactly what `$derived` is for:

```ts
let a: number = $state(0);
const b: number = $derived(a * 2);
```

When you write to state from an effect, you are hiding a computation inside a side effect, and the computation will re-run the effect, which may write again, which may loop. If you ever catch yourself doing it, stop and ask whether `$derived` is what you really want. **Nine times out of ten it is.**

There are legitimate cases — for example, writing `localStorage.setItem('x', value)` and *also* updating a separate `lastSaved` timestamp — but they are rare, and they should be deliberate.

### 1.6 Reading vs calling

One more subtlety: Svelte tracks **reads** inside an effect, not calls. If you call a function that internally reads state, the effect subscribes to that state indirectly. If you read a state variable inside an `if` branch that is currently false, the effect does not subscribe to it on this run, only on future runs that take the branch. This is usually fine but occasionally surprises new learners when an effect does not fire for a state change they expected.

## 2. Style it — A title-syncing demo

The mini-build is a counter whose value is mirrored to `document.title` via an `$effect`. As you click, the browser tab's title updates in real time. A PE7-styled card shows the current value.

## 3. Interact — Title as a side effect

```ts
let count: number = $state(0);

$effect(() => {
    document.title = `Count: ${count}`;
});
```

This is the canonical beginner effect. It reads `count`, writes to the DOM's outside-of-Svelte API (`document.title`), and re-runs whenever `count` changes. Open the browser tab while clicking and watch it update.

## 4. Mini-build — Tab title counter

**File:** `src/routes/modules/02-reactivity/09-effect/+page.svelte`

### DevTools verification

1. Click the + button. Watch the browser tab title change.
2. Open the Console. Each click triggers the effect (you can add a `console.log` to prove it).
3. Navigate away and back to the tab — the effect is still wired up.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Define "side effect" in one sentence.</summary>

An action that changes something outside the reactive graph — the DOM, the console, local storage, the network, the filesystem, a timer, a library.
</details>

<details>
<summary><strong>Q2.</strong> When does an <code>$effect</code> run relative to the DOM update?</summary>

After. By the time the effect fires, the DOM already reflects the new state. If you need to run before the DOM update, use `$effect.pre`.
</details>

<details>
<summary><strong>Q3.</strong> Why is writing to state from inside an effect usually wrong?</summary>

Because it hides a computation inside a side effect. `$derived` is the right tool for a value that is computed from other values. Writing state from an effect risks re-running the effect infinitely and makes the data flow harder to follow.
</details>

<details>
<summary><strong>Q4.</strong> What is the type of the function passed to <code>$effect</code>?</summary>

`() => void` for a plain effect, or `() => () => void` when you return a cleanup function (Lesson 2.11). The function takes no arguments and returns nothing (or a cleanup).
</details>

<details>
<summary><strong>Q5.</strong> If an <code>$effect</code> reads a state variable inside an <code>if</code> branch that is currently false, does the effect subscribe to it?</summary>

Not on this run. Svelte tracks only the reads that actually happen during this execution of the effect. Future runs that enter the branch will subscribe to it then.
</details>

## 6. Common mistakes

- **Using an effect to compute a derived value.** Use `$derived` instead.
- **Forgetting to include a cleanup function for timers or listeners.** Memory leak. Lesson 2.11 covers this in depth.
- **Putting slow work inside an effect.** It runs on every change of any dependency. Keep effects small and quick; do heavy lifting in background functions.
- **Expecting effects to run during SSR.** Effects only run in the browser. On the server there is no DOM to sync with, so Svelte skips them.

## 7. What's next

Lesson 2.10 introduces `$effect.pre` — the same rune, but running *before* the DOM update.
