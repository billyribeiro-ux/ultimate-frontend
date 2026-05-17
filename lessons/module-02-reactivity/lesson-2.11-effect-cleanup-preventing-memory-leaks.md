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

### 1.7 The lifecycle of a cleanup-bearing effect in detail

Let us trace the full lifecycle of an effect with cleanup to build a precise mental model:

1. **Component mounts.** The `<script>` block runs. The `$effect(() => { ... })` call registers the effect in the reactive graph.
2. **First execution.** After the DOM update, Svelte runs the effect body. The body sets up a subscription (e.g., `setInterval`) and returns a cleanup function. Svelte stores that cleanup function internally.
3. **Dependency changes.** A tracked reactive value that the effect read changes. Svelte schedules the effect for re-execution.
4. **Cleanup before re-run.** Before the effect body runs again, Svelte calls the stored cleanup function from step 2. The old interval is cleared.
5. **Re-execution.** The effect body runs again with the new values. A new interval is started. A new cleanup function is returned and stored.
6. **Component destroyed.** The user navigates away or a parent `{#if}` removes this component. Svelte calls the most recent cleanup function. The current interval is cleared. The effect is removed from the graph. No further executions occur.

This sequence is guaranteed. You can rely on cleanup always running before the next execution, and always running on destruction. There is no "sometimes the cleanup runs, sometimes it does not" ambiguity.

### 1.8 Cleanup and AbortController for fetch requests

One of the most important cleanup patterns in a real application is aborting in-flight fetch requests. If an effect depends on a search query state variable and re-runs on every change, you want to abort the previous fetch before starting a new one. Otherwise, the old fetch might resolve after the new one and overwrite the current results with stale data.

```ts
$effect(() => {
    const controller = new AbortController();
    
    fetch(`/api/search?q=${query}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => { results = data; })
        .catch((err) => {
            if (err.name !== 'AbortError') throw err;
        });
    
    return () => controller.abort();
});
```

The `.catch` ignores `AbortError` because aborting is intentional — it is not a real failure. This pattern prevents race conditions where a slow response for "sv" arrives after a fast response for "svelte" and overwrites the correct results.

### 1.9 Composing cleanup across multiple subscriptions

Sometimes an effect sets up multiple subscriptions that all need cleanup:

```ts
$effect(() => {
    const intervalId = setInterval(tick, 1000);
    const handler = (e: KeyboardEvent) => { /* ... */ };
    window.addEventListener('keydown', handler);
    const observer = new IntersectionObserver(callback);
    observer.observe(target);

    return () => {
        clearInterval(intervalId);
        window.removeEventListener('keydown', handler);
        observer.disconnect();
    };
});
```

The single returned function cleans up all three. If the cleanup gets complex, you can extract it into a named function for clarity. The important thing is that one effect returns one cleanup function that handles everything that effect set up.

## Deep Dive

**Why this matters at scale.** Memory leaks are the silent killers of single-page applications. A SvelteKit app where users navigate between 20 routes can accumulate leaked subscriptions across dozens of component mount/unmount cycles in a single session. Each leaked interval, listener, or observer consumes memory and CPU. After an hour of use, the tab becomes sluggish and eventually crashes. The worst part: these bugs are invisible in development (where you rarely navigate more than a few times) and catastrophic in production (where users keep the app open all day). Cleanup discipline is not optional in any app that runs for more than a few minutes.

**The mental model.** Think of every subscription as a contract with an external service. When you call `setInterval`, you are signing a contract with the browser: "call this function every N milliseconds until I say stop." The cleanup function is you saying stop. If you forget, the contract runs forever, even after you have moved out of the building (the component has unmounted). The browser keeps calling, the function keeps running, and nobody is home to receive the call. That is the leak. Svelte's effect cleanup mechanism is the stamp on the contract that says "this contract expires when the component dies." But you still have to write the cancellation clause — Svelte just guarantees it will be called.

**Edge cases.** What if the effect body returns early (via an early `return` for a guard check) before reaching the cleanup? In that case, no cleanup is registered for this run, and Svelte will not call one before the next run. This is fine for guards like `if (!element) return;` where the effect has nothing to clean up. But be careful: if you set up a subscription before the guard and the guard prevents the cleanup from being returned, you leak. Always structure the effect so subscriptions are created only when cleanup is also returned. Another edge case: if the cleanup function itself throws, Svelte logs the error but does not prevent the next run from starting.

**Performance implications.** Cleanup functions themselves are nearly free — they are just function objects stored in a reference. The cost is in what they *do*: `clearInterval` and `removeEventListener` are O(1) browser operations. `observer.disconnect()` is also cheap. The performance concern is not the cleanup itself but the *absence* of cleanup. A leaked `IntersectionObserver` observing 50 elements keeps running its callback on every scroll, doing layout calculations the browser cannot optimize away. A leaked `setInterval` keeps running its callback, which may read detached DOM nodes and trigger forced layouts. The performance cost of *not* cleaning up is orders of magnitude larger than the cost of the cleanup call itself.

**Connection to other modules.** Cleanup is the backbone of Module 7 (GSAP), where `gsap.context().revert()` in cleanup is the only correct way to manage animations in Svelte. Module 8 (routing) relies on cleanup to tear down per-page subscriptions on navigation. Module 11 (state management) uses cleanup for WebSocket connections in real-time stores. Module 12 (performance) audits leaked subscriptions as a primary source of memory growth. If you master cleanup now, every lesson that involves a third-party library or a browser API becomes straightforward — the pattern is always the same: set up in the effect body, tear down in the returned function.

### 1.10 Common interview question

**Q: "What happens if you forget to return a cleanup function from an `$effect` that starts a `setInterval`?"**

**Model answer:** Every time the effect re-runs (because a dependency changed), a new interval is created on top of the old one. The old interval is never cleared because no cleanup function was returned. After N re-runs, you have N intervals all ticking simultaneously. The callback runs N times per tick instead of once. This is a classic memory leak in single-page applications — it compounds over time as the user navigates. When the component unmounts, none of the intervals are cleaned up because Svelte only calls the cleanup function that was returned, and none was. The intervals continue firing, calling handlers that reference stale DOM nodes, potentially causing errors or degraded performance until the user closes the tab.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/$effect](https://svelte.dev/docs/svelte/$effect) — cleanup function documentation.
- [svelte.dev/docs/svelte/lifecycle-hooks](https://svelte.dev/docs/svelte/lifecycle-hooks) — component lifecycle and cleanup timing.
- [developer.mozilla.org/en-US/docs/Web/API/AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) — the AbortController API for cancelling fetch requests.

**Advanced pattern: composable cleanup with a helper.** For components with many subscriptions, create a cleanup helper that collects disposers:

```ts
function createDisposers() {
    const fns: (() => void)[] = [];
    return {
        add(fn: () => void) { fns.push(fn); },
        disposeAll() { fns.forEach(fn => fn()); fns.length = 0; }
    };
}

$effect(() => {
    const d = createDisposers();
    d.add(subscribe(eventSource1, handler1));
    d.add(subscribe(eventSource2, handler2));
    d.add(subscribe(eventSource3, handler3));
    return () => d.disposeAll();
});
```

This pattern keeps the cleanup logic close to the setup logic and makes it easy to add or remove subscriptions without forgetting a cleanup call.

**Challenge question (combines Lesson 2.11 + Lesson 2.9 + Lesson 2.2):** A component fetches data from an API every time a `query` state variable changes. Write an `$effect` that: (1) creates an `AbortController`, (2) calls `fetch` with the controller's signal, (3) handles the response, and (4) returns cleanup that aborts the controller. Explain what happens when the user types quickly — how does cleanup prevent race conditions between overlapping requests?

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
