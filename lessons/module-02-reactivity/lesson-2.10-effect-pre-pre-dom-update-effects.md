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
