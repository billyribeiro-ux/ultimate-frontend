---
module: 2
lesson: 2.11
title: $effect cleanup — preventing memory leaks
duration: 40 minutes
prerequisites:
  - Lesson 2.9 — $effect
learning_objectives:
  - Explain what a memory leak is in the browser context
  - Return a cleanup function from an $effect
  - Clean up setInterval, setTimeout, addEventListener, WebSocket, and AbortController
  - Understand that cleanup runs both on destroy and before the next run
  - Type a cleanup function correctly
status: ready
---

# Lesson 2.11 — `$effect` cleanup — preventing memory leaks

## 1. Concept — Every subscription has a deadline

### 1.1 The problem: side effects have lifetimes

A timer you start with `setInterval` keeps running until you call `clearInterval`. An event listener you add with `addEventListener` keeps firing until you call `removeEventListener`. A WebSocket you open keeps holding a connection until you `close()` it. An `IntersectionObserver` you create keeps observing until you `disconnect()`. Every one of these is a **subscription** that outlives the code that started it, and every one of them will leak resources if you forget to shut it down when the component that started it is destroyed.

A **memory leak**, in the browser, is a piece of memory (or a running subscription) that the program cannot release because something still holds a reference to it. In a single-page app where the user navigates between routes all day, leaks compound. A route that leaks one event listener leaks *another one every time the user returns*. After an hour of browsing, the page is holding hundreds of dead listeners, each calling handlers that reference state that no longer exists. The tab slows down. Eventually it crashes.

### 1.2 Svelte's solution: return a cleanup function

An `$effect` can return a function. That function is Svelte's **cleanup**. Svelte calls it:

1. **Before the effect runs again** (when its dependencies change).
2. **When the component is destroyed** (user navigates away).

Example:

```ts
let seconds: number = $state(0);

$effect(() => {
    const id = setInterval(() => {
        seconds = seconds + 1;
    }, 1000);

    return () => {
        clearInterval(id);
    };
});
```

Read it carefully. Inside the effect, we start an interval and save its id. We then *return* a function that clears the interval. Svelte calls the returned function when the effect re-runs or when the component is destroyed. The interval is always cleaned up. No leak, no duplication, no zombie callbacks.

### 1.3 The common cleanup patterns

```ts
// setInterval / setTimeout
$effect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
});

// addEventListener
$effect(() => {
    const handler = (event: KeyboardEvent) => { /* ... */ };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
});

// AbortController (for fetch)
$effect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal }).then(/* ... */);
    return () => controller.abort();
});

// IntersectionObserver
$effect(() => {
    if (!target) return;
    const observer = new IntersectionObserver(callback);
    observer.observe(target);
    return () => observer.disconnect();
});

// WebSocket
$effect(() => {
    const ws = new WebSocket(url);
    ws.addEventListener('message', onMessage);
    return () => ws.close();
});
```

Each of these follows the same shape: set up, return cleanup. If you learn the shape, you will never leak.

### 1.4 Cleanup runs between runs, not only at the end

A subtlety beginners miss: if an effect re-runs because its dependencies changed, the cleanup from the *previous* run fires *before* the new run starts. This is exactly what you want when the effect's subscription depends on state. For example:

```ts
$effect(() => {
    const url = `wss://api.example.org/feed/${topic}`;
    const ws = new WebSocket(url);
    ws.addEventListener('message', onMessage);
    return () => ws.close();
});
```

When `topic` changes, the cleanup closes the old WebSocket and the new run opens a new one. You never have two sockets open at once. Svelte handles the orchestration.

### 1.5 Typing cleanup

The return type of an effect function is `void | (() => void)`. You either return nothing (plain effect) or return a function (effect with cleanup). TypeScript infers both automatically.

### 1.6 SSR and cleanup

Effects do not run on the server, so cleanup does not run on the server either. You only ever see cleanup in the browser. This is usually what you want — server rendering produces HTML and moves on; there is nothing to clean up.

## 2. Style it — A self-destructing timer

The mini-build is a stopwatch powered by `setInterval`. The effect starts the interval and returns a cleanup. A button lets you pause and resume. A note explains that navigating away cleans up the timer automatically. PE7 tokens for styling; `prefers-reduced-motion` respected on the number transition.

## 3. Interact — What happens without the cleanup

Temporarily remove the `return () => clearInterval(id)` line. The counter still works, but every time the effect re-runs (which happens if any of its dependencies change), a new interval is created *on top of* the old one. The number starts counting by twos, then by threes, then by fours. Put the cleanup back and the problem disappears. This is the exact shape of a real memory leak.

## 4. Mini-build — Stopwatch with cleanup

**File:** `src/routes/modules/02-reactivity/11-effect-cleanup/+page.svelte`

### DevTools verification

1. Start the stopwatch. Observe the number ticking up.
2. Press pause. The number stops; the cleanup has closed the interval.
3. Press resume. A new interval starts.
4. Navigate away and back. The stopwatch restarts fresh — the previous component's interval was cleaned up on destroy.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> When does Svelte call an effect's cleanup function?</summary>

Twice: immediately before the effect re-runs (when a dependency changes), and when the component is destroyed.
</details>

<details>
<summary><strong>Q2.</strong> What happens if you forget the cleanup for a <code>setInterval</code> inside an effect that re-runs?</summary>

Each run starts a new interval without stopping the old one. After N re-runs you have N intervals ticking in parallel, each calling your handler. The counter advances N times per second instead of once.
</details>

<details>
<summary><strong>Q3.</strong> Does cleanup run during server-side rendering?</summary>

No. Effects do not run on the server, so there is nothing to clean up there. Cleanup only happens in the browser.
</details>

<details>
<summary><strong>Q4.</strong> What is the correct TypeScript signature for an effect with cleanup?</summary>

`() => () => void` — a function that takes no arguments and returns either void (no cleanup) or another function (the cleanup).
</details>

<details>
<summary><strong>Q5.</strong> Give one real-world subscription that needs cleanup.</summary>

`setInterval`, `setTimeout`, `addEventListener`, `IntersectionObserver.observe`, `ResizeObserver.observe`, `WebSocket.onmessage`, `AbortController`-wrapped fetches, `MutationObserver.observe`, GSAP animations, any third-party library that returns a "dispose" or "stop" handle.
</details>

## 6. Common mistakes

- **Forgetting to return the cleanup.** The function is set up, but never torn down. The symptom is duplicated side effects on re-run.
- **Returning the wrong thing.** Returning `clearInterval(id)` instead of `() => clearInterval(id)` calls the cleanup immediately and passes its return value (undefined) to Svelte — which does nothing with it.
- **Creating the subscription outside the effect.** A listener added in a top-level `addEventListener('scroll', ...)` at the start of the script cannot be cleaned up by an effect's cleanup. Move the setup inside the effect.
- **Assuming cleanup fixes a state-writing effect.** Cleanup handles subscriptions, not bad data flow. If your effect is writing state it shouldn't, cleanup does not help — use `$derived`.

## 7. What's next

Lesson 2.12 shows how reactive state drives dynamic CSS — classes, inline styles, and custom properties — to make the UI visually follow the data.
