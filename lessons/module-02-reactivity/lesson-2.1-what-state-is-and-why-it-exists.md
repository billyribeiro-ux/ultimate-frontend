---
module: 2
lesson: 2.1
title: What state is and why it exists
duration: 40 minutes
prerequisites:
  - Module 1 — The Foundation (complete)
learning_objectives:
  - Define "state" in the context of a user interface
  - Distinguish between a constant, a local variable, and state
  - Explain why a plain `let` inside a Svelte script does not trigger UI updates
  - Name three kinds of state you will encounter in a real app
  - Recognise the problem that reactive runes solve
status: ready
---

# Lesson 2.1 — What state is and why it exists

## 1. Concept — The values that change while your page is open

### 1.1 The problem: a page without state is a document, not an app

Every file you built in Module 1 rendered exactly once. You declared some typed constants, poured them into the markup, and the browser drew the result. If the user clicked a button, nothing happened. If a timer elapsed, nothing happened. If data arrived from the network, nothing happened. The page was a static document — beautifully typed and styled, but frozen the moment it appeared.

A real application is not frozen. A shopping cart's item count goes up when the user clicks *Add*. A form's submit button becomes enabled the moment every required field is filled. A chat window grows as new messages stream in. A dark-mode toggle inverts the colour scheme when clicked. A video player shows its current playback position. Each of these is a value that can be different at different moments during the life of the page. **These changing values have a name: state.**

If you remember one definition from this lesson, remember this: **state is any value that can be different now than it was a second ago.** Constants are not state. Props from a parent component are not state (they are *received* data). Computed values are usually not state (they are derived). State is the live, mutable truth of what the component is currently showing.

### 1.2 Why `let` on its own is not enough

You might expect this to work:

```svelte
<script lang="ts">
    let count = 0;

    function increment(): void {
        count = count + 1;
    }
</script>

<button onclick={increment}>Clicked {count} times</button>
```

The `let` keyword *is* the JavaScript keyword for a variable that can change. And `count = count + 1` *is* a legal reassignment. So why, in Svelte 5, does the button's label not update when you click it?

Because plain variables in a JavaScript function have no way to tell the UI they have changed. JavaScript runs `count = count + 1`, the number in memory is now 1, and that's it. Nothing in the DOM knows to look again. The value changed in memory, but nothing is *observing* the change. To make the UI react, you need a value that the compiler and the runtime know to watch — a value that, every time it is reassigned, schedules a re-render of the bits of the DOM that depend on it. That mechanism is called **reactivity**, and in Svelte 5 it is implemented by runes: small special functions whose names start with a dollar sign.

The first rune you will meet is `$state`, in Lesson 2.2. Writing `let count = $state(0)` instead of `let count = 0` is the difference between a static page and a live one. The syntax is intentionally almost the same so that upgrading a constant to state is a one-word edit.

### 1.3 Three categories of state you will see

Real apps hold many different kinds of state. It is useful to have names for them now so that later lessons can refer to categories by name:

1. **UI state** — values that describe the current visible appearance of the component. Is this modal open? Which tab is selected? Is this button in its loading state? This is the most common kind in Module 2. Lives in the component, dies when the component unmounts.
2. **Form state** — the current values of inputs that the user is typing into. A form's state lives in the component that contains the form. When the form submits, its state is usually copied out and sent to the server.
3. **Remote / server state** — data that lives on a server and your app mirrors locally. Product listings, user profiles, saved documents. This kind of state has complications (cache invalidation, race conditions, optimistic updates) that are covered in Modules 9A and 9B. You will not handle remote state in Module 2; everything here is purely client-side.

Other categories you will meet later include **URL state** (which tab is selected, stored in the query string so it survives a refresh), **global state** (user preferences shared across every page), and **ephemeral animation state** (transition progress). For now, the first three are enough.

### 1.4 Why reactivity needs compiler help

React, Vue, and Angular all have reactivity systems. They all work by asking you to wrap your state in a special function (React's `useState`, Vue's `ref`, Angular's `signal`) and then tracking when that wrapped value is read and written. The mechanism is called a **signal**, and it dates back to a 1960s paper. Svelte 5's runes are signals too, but they are much less ceremonial because Svelte has a compiler. The compiler can rewrite ordinary-looking code into signal reads and writes at build time, so you can write `count = count + 1` instead of `count.set(count.get() + 1)`. That is the payoff of the compile-time model.

The May 2026 version of Svelte uses runes universally. Older Svelte (3/4) had a clever but confusing feature where *any* top-level `let` was automatically reactive. New learners constantly got bitten by the distinction between "reactive let" and "not reactive because it's nested", and teams found the automatic behaviour hard to reason about in large codebases. Runes replace the implicit magic with explicit markers: if a value is state, you wrapped it in `$state(...)`. If you did not, it is a constant.

### 1.5 The relationship between state and the DOM

Understanding state deeply requires understanding what the DOM is. The **DOM** (Document Object Model) is the browser's live, in-memory representation of the HTML on your page. When you write `<p>{count}</p>` in Svelte, the compiler produces code that creates a real `<p>` DOM node and fills it with the text value of `count`. If `count` is a plain variable, the DOM node holds whatever value `count` had at creation time and never looks at it again. If `count` is reactive state, the compiler also generates a subscription: "when `count` changes, find this text node and replace its content." That subscription is the core of reactivity.

This is why state is not just "a variable that changes." A variable that changes in memory but never notifies the DOM is useless in a UI context. **State, in UI programming, is a variable whose changes are observed and reflected in the rendered output.** The observation mechanism varies across frameworks — React uses a virtual DOM diff, Vue uses proxies, Angular uses zone.js — but the core idea is the same. Svelte 5 uses compiler-generated signals (runes) which produce the smallest possible subscription code because the compiler knows at build time exactly which DOM nodes depend on which state.

### 1.6 How Svelte's reactivity compares to other frameworks

In React, you call `const [count, setCount] = useState(0)`. You get two things: the current value and a setter function. To update, you call `setCount(count + 1)`. React then schedules a re-render of the entire component, diffs the old virtual DOM against the new one, and patches the real DOM wherever differences exist.

In Vue, you call `const count = ref(0)`. You get a reactive reference with a `.value` property. To update, you write `count.value++`. Vue's proxy-based system notices the write and schedules fine-grained DOM updates.

In Svelte 5, you write `let count = $state(0)`. You read `count` as a plain variable and write to it with `count = count + 1`. The compiler rewrites your code so that the read creates a subscription and the write notifies subscribers. No virtual DOM, no proxy wrapper around a `.value` property, no separate setter function. The syntax is the closest to plain JavaScript of any framework, because the compiler handles the ceremony that other frameworks push to runtime.

This is not a "Svelte is better" argument — it is a "Svelte chose a different set of trade-offs" explanation. The trade-off is that Svelte requires a compile step (you cannot use runes in a plain `.js` file that runs in the browser without processing). In exchange, the compiled output is smaller, faster, and more readable.

### 1.7 State management at different scales

The concept of state grows in complexity as your application grows. At each scale, different questions become important:

- **Single component** (this module). Where is the state? In a `$state` variable. Who reads it? The template. Who writes it? Event handlers.
- **Parent-child** (Module 3). How does state flow? Through props, downward. How does a child tell a parent about a change? Through callback props or `$bindable`.
- **Cross-component** (Module 11). How do unrelated components share state? Through module-level stores, reactive classes, or context. How do you prevent stale reads?
- **Client-server** (Modules 9A, 9B, 10). Where does the state *really* live? On the server. How does the client get a copy? Through `load` functions or remote queries. How does it stay fresh? Through invalidation and optimistic updates.

Module 2 is the bottom of this pyramid. You must be perfectly comfortable with single-component state before the multi-component and multi-layer patterns in later modules will make sense. That is why this module has 13 lessons — we are building the foundation that everything else stands on.

### 1.8 What this module will teach

Module 2 is the densest module in the course because reactivity is the foundation of everything that follows. In 13 lessons you will meet:

- `$state` for primitive, object, and array values (2.2–2.4)
- `$state.raw` and `$state.snapshot` for escape hatches (2.5–2.6)
- `$derived` and `$derived.by` for computed values (2.7–2.8)
- `$effect`, `$effect.pre`, and effect cleanup for side effects (2.9–2.11)
- Dynamic styles driven by reactive state (2.12)
- TypeScript patterns for reactive state (2.13)

By the end of Module 2 you will have built an interactive dashboard that counts clicks, derives totals, persists to `localStorage`, and re-renders efficiently on every change.

## Deep Dive

**Why this matters at scale.** In a production app with 50 components and 20 routes, the distinction between "a variable that changes" and "state that the UI observes" is not academic — it is the difference between an app that works and an app with 30 subtle visual bugs. Every stale counter, every input that does not reflect its value, every toggle that reverts on re-render traces back to a developer who used a plain variable where reactive state was needed, or vice versa. The discipline of asking "is this value observed by the UI?" before declaring it is the single most important habit Module 2 will build.

**The mental model.** Think of state as a whiteboard in a conference room. Constants are printed posters on the wall — they never change. A plain `let` variable is a thought in someone's head — it might change, but nobody else in the room can see the change. A `$state` variable is a value written on the whiteboard with a marker. Anyone looking at the whiteboard (the DOM, derived values, effects) sees the update the instant someone writes a new number. The whiteboard is the shared, observable surface. Reactivity is the act of looking at the whiteboard and knowing when to update your own work based on what you see.

**Edge cases.** The compiler will warn you if you write to a non-reactive variable that is used in the template. But it cannot catch every case — if you pass a plain object to a child component and that child tries to observe changes inside the object, the changes will not propagate unless the object itself was created with `$state`. This is the deep-reactivity topic covered in Lesson 2.3. Another edge case: `$state` in a `.ts` file (not `.svelte`) only works if the file has the `.svelte.ts` extension — Module 11 covers this in detail.

**Performance implications.** Every `$state` variable adds a small overhead: a proxy (for objects/arrays) or a signal cell (for primitives) that tracks subscribers. For most applications this overhead is negligible — you would need tens of thousands of reactive variables to notice any performance difference. The cases where it matters are covered in Lesson 2.5 (`$state.raw` for non-deep reactivity) and Lesson 12.4 (avoiding unnecessary `$effect` re-runs). The rule of thumb: make it reactive if the UI depends on it, keep it plain if the UI does not. Do not wrap everything in `$state` "just in case."

**Connection to other modules.** State is the seed crystal from which the entire course grows. Module 3 (components) is about passing state between components via props. Module 5 (events) is about changing state in response to user actions. Module 7 (GSAP) bridges reactive state to animation libraries. Modules 9A and 9B bring server state into the reactive graph. Module 11 scales state management to cross-component patterns. Module 12 optimises the performance of state changes. If you truly understand what state is — an observable, mutable value whose changes drive UI updates — every subsequent module is a variation on that theme, not a new concept.

### 1.9 Common interview question

**Q: "What is the difference between a plain variable and reactive state in Svelte 5, and why does the distinction matter?"**

**Model answer:** A plain variable (`let count = 0`) exists only in JavaScript memory. Changing it updates the value in memory but nothing else — the DOM has no way to know the value changed. Reactive state (`let count = $state(0)`) wraps the value in a signal. The compiler generates code so that every read of `count` in the template registers a subscription, and every write to `count` notifies those subscribers, triggering targeted DOM updates. The distinction matters because it determines whether the UI stays in sync with the data. Without reactive state, you get the "frozen UI" bug demonstrated in this lesson — the value changes in memory but the page never updates. The `$state` rune is how you opt into the reactivity contract.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/$state](https://svelte.dev/docs/svelte/$state) — the official `$state` rune reference.
- [svelte.dev/docs/svelte/what-are-runes](https://svelte.dev/docs/svelte/what-are-runes) — the rune system overview, explaining why runes exist and how they replaced Svelte 3/4 reactivity.
- [svelte.dev/docs/svelte/reactivity-fundamentals](https://svelte.dev/docs/svelte/reactivity-fundamentals) — the fundamentals of Svelte 5's signal-based reactivity.

**Advanced pattern: the reactive class pattern.** You can encapsulate related state and derived values in a class declared in a `.svelte.ts` file:

```ts
// src/lib/timer.svelte.ts
export class Timer {
    seconds = $state(0);
    readonly formatted = $derived(
        `${Math.floor(this.seconds / 60)}:${(this.seconds % 60).toString().padStart(2, '0')}`
    );

    start() { /* ... */ }
    stop() { /* ... */ }
    reset() { this.seconds = 0; }
}
```

This pattern bundles state, derived values, and methods into a single cohesive unit. You will see it in Module 11 as the primary pattern for shared reactive state.

**Challenge question (combines Lesson 2.1 + Lesson 1.3 + Lesson 1.9):** Explain why `console.log(clock.seconds)` inside a `setInterval` callback shows the updated value in the console, but `{clock.seconds}` in the markup stays at 0. Trace the data flow from the interval callback through JavaScript memory to the DOM, and identify the exact point where the flow breaks without `$state`.

## 2. Style it — A frozen-looking card that isn't

The mini-build shows a single card that looks like the static cards from Module 1 but contains a count of how long the page has been open. We use the clock to introduce the *idea* of state one lesson before the mechanism. The count is shown as a plain number — no interactivity, no button, no rune — so the student sees the *need* for state before the *syntax* of state arrives in 2.2.

The card uses PE7 tokens (`--color-brand`, `--space-lg`, `--radius-lg`) and a scoped brand override.

## 3. Interact — Why a plain `let` silently fails

The mistake (this is the mini-build below):

```svelte
<script lang="ts">
    const clock: { seconds: number } = { seconds: 0 };

    if (typeof window !== 'undefined') {
        setInterval(() => {
            clock.seconds = clock.seconds + 1;
            console.log('clock.seconds in memory:', clock.seconds);
        }, 1000);
    }
</script>

<p>This page has been open for {clock.seconds} seconds.</p>
```

Run this in a Svelte 5 project and you will see the paragraph stuck on "0 seconds" forever. The interval is mutating `clock.seconds` in memory, but the DOM has no idea. Open the console and you will see the number counting up every second while the UI stays still. That gap between "the value changed" and "the DOM changed" is the exact problem reactivity exists to solve. (Note: if you wrote the same demo with a plain `let`, Svelte's compiler would actually refuse with the error *"`x` is updated, but is not declared with `$state(...)`"*. That refusal is Svelte telling you what this lesson is about.)

We do not fix this lesson's code. We leave it broken as a motivator. Lesson 2.2 fixes it in one edit.

## 4. Mini-build — The broken counter (on purpose)

**File:** `src/routes/modules/02-reactivity/01-what-is-state/+page.svelte`

The page renders a card that says "This page has been open for N seconds" where N is incremented by `setInterval` in a plain `let`. The number stays at 0 because the `let` is not reactive. A note under the card explains what is happening.

### DevTools verification

1. Open DevTools → Console.
2. Refresh the page. You should see `secondsOpen` logging every second, counting up.
3. Look at the card on the page. The displayed number stays at 0.
4. This is the demo. The console proves the variable is changing; the UI proves that the DOM does not care.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Define "state" in the context of a user interface in your own words.</summary>

Any value that can be different now than it was a moment ago. Constants and props are not state; only values that change during the life of the component are. Examples: a click counter, a toggle flag, an input's current text.
</details>

<details>
<summary><strong>Q2.</strong> Why does a plain <code>let count = 0</code> in a Svelte 5 script not update the UI when you reassign it?</summary>

Because `let` is plain JavaScript. Changing the variable updates memory but nothing tells the DOM to re-read it. Svelte 5 needs a *rune* (`$state`) to mark the variable as reactive so the compiler can generate the subscription and update code.
</details>

<details>
<summary><strong>Q3.</strong> Name the three categories of state introduced in this lesson.</summary>

UI state, form state, and remote/server state. (Bonus: URL state, global state, ephemeral animation state.)
</details>

<details>
<summary><strong>Q4.</strong> What is a "signal", briefly, and how does it relate to Svelte 5's runes?</summary>

A signal is a small container that holds a value, tracks reads of that value, and notifies subscribers when the value changes. Svelte 5's runes are an ergonomic, compiler-assisted signal system: `$state(0)` creates a signal, and code that reads the variable automatically subscribes.
</details>

<details>
<summary><strong>Q5.</strong> If the Svelte 3/4 system made any top-level <code>let</code> reactive automatically, why was it changed?</summary>

Because the magic stopped at certain boundaries (nested functions, helper modules, class fields) in ways that were hard to predict. Learners wrote "reactive" variables that weren't, or relied on reactivity that broke during refactoring. Runes make the intent explicit and uniform across every context.
</details>

## 6. Common mistakes

- **Forgetting that `let x = 0` without `$state(...)` is not reactive in Svelte 5.** This is the single biggest trap moving from Svelte 4 to Svelte 5.
- **Thinking constants and state are interchangeable.** If the value never changes, use `const`. If it changes once in a while, use state. Don't wrap constants in `$state` — it adds overhead for no benefit.
- **Putting a `setInterval` in the script without cleaning it up.** This page leaks an interval every time the user navigates away and back. We will fix this with `$effect` cleanup in Lesson 2.11.
- **Mixing up "changing" and "reactive".** A variable can change without being reactive (plain `let`), and a value can be "live" without changing (`const` values). Reactivity is about *observing* the change, not about the change itself.

## 7. What's next

Lesson 2.2 replaces one `let` with `let count = $state(0)` and the UI finally starts updating.
