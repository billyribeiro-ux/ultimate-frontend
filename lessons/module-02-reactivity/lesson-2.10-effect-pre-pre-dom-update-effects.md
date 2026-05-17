---
module: 2
lesson: 2.10
title: $effect.pre() — pre-DOM-update effects
duration: 30 minutes
prerequisites:
  - Lesson 2.9 — $effect
learning_objectives:
  - Explain the difference between $effect and $effect.pre
  - Identify the one concrete case where $effect.pre is the right tool (measure-before-paint)
  - Declare a $effect.pre that reads the old DOM before the reactive update is applied
  - Avoid the temptation to use $effect.pre for general pre-run logic
status: ready
---

# Lesson 2.10 — `$effect.pre()` — pre-DOM-update effects

## 1. Concept — The tiny window before the DOM changes

### 1.1 The problem: sometimes you need to see "before"

`$effect` runs *after* the DOM has been updated. Nine times out of ten that is exactly what you want: you write state, the UI reflects it, and then your effect observes the new DOM. But there is one tiny window of time — the moment *before* the DOM has reflected the state change — that is useful for a specific class of problems: **scroll anchoring** and **measure-before-paint** patterns.

Consider a chat log. When a new message arrives, you want to auto-scroll to the bottom *only if the user was already at the bottom*. If you wait until after the DOM update, you cannot tell "was I at the bottom" any more — the scroll container just grew, so `scrollTop` relates to the new, bigger content. You need to observe the scroll state *before* the new message is added. For that, `$effect.pre` is the right tool.

### 1.2 Declaring a pre-effect

```ts
let messages: Message[] = $state([]);
let container: HTMLElement | null = $state(null);
let wasAtBottom: boolean = $state(true);

$effect.pre(() => {
    // Read messages to register as a dependency.
    messages.length;

    // Runs before the DOM update that will add the new message.
    if (container) {
        const distanceFromBottom =
            container.scrollHeight - container.clientHeight - container.scrollTop;
        wasAtBottom = distanceFromBottom < 4;
    }
});

$effect(() => {
    // Runs after the DOM update.
    messages.length;
    if (container && wasAtBottom) {
        container.scrollTop = container.scrollHeight;
    }
});
```

Two effects working together. The pre-effect captures the pre-update state. The normal effect applies the post-update scroll.

### 1.3 How it is different from $effect

Functionally, `$effect.pre` is identical to `$effect` except for its position in the reactivity tick. Where a regular effect runs after the DOM has been updated, a pre-effect runs just *before*. Everything else — dependency tracking, purity requirements, cleanup, typing — is the same.

### 1.4 When NOT to use it

Pre-effects are a precision tool. Do not use them for:

- **General initialisation logic.** A regular effect is fine; the DOM is ready by then anyway.
- **Derived computations.** Use `$derived`.
- **Anything where the order relative to the DOM update does not matter.** Use `$effect`.

If you cannot articulate a specific reason you need to run *before* the DOM updates, you do not need `$effect.pre`.

### 1.5 Typing

Identical to `$effect`: the function is `() => void` (or `() => () => void` if you return cleanup).

### 1.6 The TypeScript angle — typing the scroll measurement pattern

The scroll-anchoring pattern involves reading DOM properties inside `$effect.pre`. TypeScript helps catch mistakes in the DOM API calls:

```ts
let container: HTMLElement | null = $state(null);
let wasAtBottom: boolean = $state(true);

$effect.pre(() => {
    messages.length; // dependency registration
    if (container) {
        // TypeScript narrows container to HTMLElement inside the if guard
        const { scrollHeight, clientHeight, scrollTop } = container;
        wasAtBottom = scrollHeight - clientHeight - scrollTop < 4;
    }
});
```

Without the `if (container)` guard, TypeScript would refuse `container.scrollHeight` because `container` might be `null`. The guard both satisfies TypeScript and prevents a runtime error if the effect runs before the element is mounted. This is a case where TypeScript's null-checking directly prevents a real bug.

### 1.7 Comparison: `$effect` vs `$effect.pre` timing

| Aspect | `$effect` | `$effect.pre` |
|---|---|---|
| Runs relative to DOM update | After | Before |
| DOM reflects new state? | Yes | No (old DOM) |
| Common use case | Act on new DOM | Measure old DOM |
| Cleanup timing | Same (before next run + on destroy) | Same |
| Dependency tracking | Same | Same |
| Frequency of use | 95% of effects | 5% of effects |

## Deep Dive

**Why this matters at scale.** In production apps, scroll-anchoring is not optional — it is an expected UX behaviour. Chat applications, real-time log viewers, notification feeds, and collaborative editors all need to answer the question "was the user at the bottom before the new content arrived?" A 50-component app with even one scrolling feed needs this pattern. Without `$effect.pre`, developers resort to brittle hacks: setTimeout delays hoping the DOM has not painted yet, or double-render patterns that flash content. `$effect.pre` gives you a guaranteed timing window for measurement.

**The mental model.** Think of the Svelte reactivity tick as a two-phase commit. Phase 1 is "prepare": state has changed, effects are queued, but the DOM still reflects the old state. Phase 2 is "commit": the DOM is updated to reflect the new state, and post-update effects run. `$effect.pre` runs at the boundary between phase 1 and phase 2 — after Svelte knows *what* will change, but before it has *applied* the change to the DOM. This is the last moment you can measure the old DOM. After this moment, the old DOM is gone. This two-phase model maps directly to database transaction concepts: read the old row before writing the new one.

**Edge cases.** A critical subtlety: `$effect.pre` still tracks dependencies just like `$effect`. If you forget to read the relevant state inside the pre-effect, it will not re-run when that state changes. In the scroll-anchoring example, you must read `messages.length` (or some other signal that changes when messages arrive) to ensure the pre-effect runs on new messages. Another edge case: if multiple state changes batch together in one tick, `$effect.pre` runs once for the batch, not once per change. The DOM you observe is the state before *any* of the batched changes are applied. A third edge case: `$effect.pre` cleanup functions run at the same timing as regular effect cleanup — before the next execution of the same effect.

**Performance implications.** Pre-effects add negligible overhead — they are just effects scheduled at a different point in the tick. However, reading DOM measurements (scrollHeight, offsetWidth, getBoundingClientRect) inside a pre-effect forces the browser to perform a synchronous layout calculation. This is unavoidable for measurement patterns, but be aware that measuring many elements in a single pre-effect can cause layout thrashing. Keep pre-effect DOM reads minimal: measure one container's scroll state, not fifty individual element positions. If you need to measure many elements, batch them into a single read pass.

**Cross-module connections.** `$effect.pre` appears in specific places throughout the course. Module 7 uses it for capturing element positions before GSAP animations (measuring the "from" state). Module 8 uses it for preserving scroll position during SvelteKit page transitions. Module 12 covers it in the context of performance-sensitive measurement patterns. The pattern "pre-effect captures old state, regular effect applies new behaviour based on that capture" is a recurring two-effect dance that you will recognise once you have seen it here.

### 1.6 What the compiler does — comparing `$effect` vs `$effect.pre` timing

Both `$effect` and `$effect.pre` compile to essentially the same signal subscription code. The only difference is when the scheduler runs them relative to DOM updates:

```
State change → $derived recomputation → $effect.pre runs → DOM update → $effect runs
```

The compiler does not generate different code for pre vs post effects. The difference is a scheduling flag: `$effect.pre` is queued in the "pre-update" phase, and `$effect` is queued in the "post-update" phase. Both track dependencies identically. Both support cleanup functions identically. The timing flag is the *only* difference.

### 1.7 "In production" — scroll anchoring in a real-time log viewer

At a 50-developer DevOps platform, the log viewer displayed 10,000+ lines streaming in real time. Users scrolled up to read earlier logs while new lines appended at the bottom. Without `$effect.pre`, the team used `requestAnimationFrame` hacks and setTimeout delays to detect "was the user at the bottom?" before new content pushed the scrollbar. The timing was unreliable — sometimes the measurement happened after the DOM update, giving a wrong answer.

Switching to `$effect.pre` gave the team a guaranteed timing window: measure the scroll position *before* the new log lines are inserted. A regular `$effect` then used the measurement to decide whether to auto-scroll. The two-effect pattern eliminated all timing bugs and replaced 40 lines of rAF workaround with 12 lines of clean Svelte.

### 1.8 Common interview question

**Q: "When would you use `$effect.pre` instead of `$effect`?"**

**Model answer:** Use `$effect.pre` when you need to measure or read the current DOM state *before* a reactive update changes it. The canonical case is scroll anchoring: you need to know if the user was at the bottom of a scroll container before new items are added. If you measure after the DOM update (in a regular `$effect`), the new content has already changed the scroll height, and you cannot tell where the user was. `$effect.pre` runs after state has changed but before the DOM reflects the change, giving you a window to capture the "before" snapshot. For any other timing need — logging, API calls, title updates — use regular `$effect`.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/$effect#$effect.pre](https://svelte.dev/docs/svelte/$effect#$effect.pre) — the official `$effect.pre` reference.
- [svelte.dev/docs/svelte/$effect](https://svelte.dev/docs/svelte/$effect) — the full `$effect` family including timing details.
- [svelte.dev/docs/svelte/lifecycle-hooks](https://svelte.dev/docs/svelte/lifecycle-hooks) — lifecycle ordering.

**Advanced pattern: FLIP animation measurement.** The pre-effect is the natural place to capture element positions for FLIP (First, Last, Invert, Play) animations:

```ts
let positions: Map<string, DOMRect> = new Map();

$effect.pre(() => {
    items.length; // track dependency
    // Capture "first" positions before DOM update
    for (const el of container.querySelectorAll('[data-key]')) {
        positions.set(el.dataset.key!, el.getBoundingClientRect());
    }
});
```

After the DOM update, a regular `$effect` reads the new positions, computes the delta, and applies a CSS transform to animate the move. This is the foundation for smooth list reorder animations.

**Challenge question (combines Lesson 2.10 + Lesson 2.9 + Lesson 2.11):** A chat component has a message list that grows when new messages arrive. Write the two-effect pattern (pre-effect to capture scroll state, regular effect to auto-scroll). Include cleanup logic in case the effect sets up an event listener. Explain what happens if you forget to read `messages.length` inside the pre-effect.

## 2. Style it — A chat log with sticky-bottom scroll

The mini-build is a small chat log. New messages arrive on a button press. The log auto-scrolls to the bottom only if the user was already at the bottom — if they have scrolled up to read earlier messages, new arrivals do not yank the view. PE7 tokens for styling; `prefers-reduced-motion` respected.

## 3. Interact — Capturing the pre-update scroll position

The script reads `container.scrollTop` in `$effect.pre`, saves whether the user was at the bottom to a boolean state, and then in a normal `$effect` uses that boolean to decide whether to snap to the new bottom. This is a real pattern used in production chat and log viewers.

## 4. Mini-build — Sticky-bottom chat log

**File:** `src/routes/modules/02-reactivity/10-effect-pre/+page.svelte`

### DevTools verification

1. Click "Send" a few times. The log auto-scrolls to the bottom.
2. Scroll up in the log. Click "Send" again. The log stays where you put it.
3. Scroll back to the bottom and click "Send". Auto-scroll resumes.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the one-line difference between <code>$effect</code> and <code>$effect.pre</code>?</summary>

`$effect.pre` runs before the DOM has been updated for the current reactivity tick; `$effect` runs after.
</details>

<details>
<summary><strong>Q2.</strong> Describe one concrete case where <code>$effect.pre</code> is the right tool.</summary>

Scroll anchoring — capturing whether the user was at the bottom of a scrolling container before new content is appended, so you can restore the scroll after the update.
</details>

<details>
<summary><strong>Q3.</strong> Is <code>$effect.pre</code> allowed to have side effects?</summary>

Yes. It is an effect, not a derivation. The purity rules that apply to `$derived` do not apply to effects.
</details>

<details>
<summary><strong>Q4.</strong> If you are not sure whether you need <code>$effect</code> or <code>$effect.pre</code>, which should you use?</summary>

`$effect`. Pre-effects are a precision tool for very specific timing problems. Regular effects cover the common case.
</details>

<details>
<summary><strong>Q5.</strong> Does <code>$effect.pre</code> track dependencies differently from <code>$effect</code>?</summary>

No. Both track the state they read during execution. The only difference is timing relative to the DOM update.
</details>

## 6. Common mistakes

- **Reaching for <code>$effect.pre</code> by default.** Most side effects do not care whether they run before or after the DOM update.
- **Expecting the DOM inside a pre-effect to reflect the new state.** It does not — that is the whole point. Read the *old* DOM there; read the *new* DOM in a regular effect.
- **Pairing two effects without a shared state bridge.** If you need the pre-update snapshot in the post-update effect, capture it in a `$state` variable like `wasAtBottom`.

## 7. What's next

Lesson 2.11 covers effect cleanup — the pattern for preventing memory leaks when an effect sets up timers, subscriptions, or observers.
