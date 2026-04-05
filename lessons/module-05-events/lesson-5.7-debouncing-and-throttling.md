---
module: 5
lesson: 5.7
title: Debouncing and throttling (from scratch, no library)
duration: 55 minutes
prerequisites:
  - Lesson 5.6 (closures)
  - Lesson 5.2 (typed functions)
learning_objectives:
  - Explain the difference between debouncing and throttling
  - Pick the right one for a search box, a resize handler, and a scroll handler
  - Implement debounce with setTimeout and a closure, zero dependencies
  - Implement throttle with a timestamp and a closure, zero dependencies
  - Use them to keep a search input responsive without spamming the network
status: ready
---

# Lesson 5.7 — Debouncing and throttling

## 1. Concept — When firing too often is a bug

### 1.1 The problem: the search box that makes 30 requests per second

You wire a search input to a function that calls your API. Every `input` event triggers the call. The user types "svelte" — six characters, six network requests. In practice, the last response ("svelte") is the only one you care about; the first five are wasted money, wasted battery, and wasted server load. Worse, if the network is slow, the responses may arrive out of order and you may end up showing results for "sve" after results for "svelte".

Two well-known patterns fix this class of problem: **debouncing** and **throttling**. They sound similar and are routinely confused. Learning them from scratch, once, is worth more than memorising a library.

### 1.2 Debouncing — "wait until they stop"

**Debounce** delays a call until a certain amount of quiet time has passed. Every time the event fires, the clock restarts. The function only runs once the events stop coming for `delay` milliseconds.

Mental model: the user typing in a search box is like someone knocking on a door. You do not open the door every knock. You wait until the knocking has stopped for a moment, then open it. If they start knocking again before you reach the door, you sit back down and wait for quiet again.

Typical uses:

- **Search inputs.** Wait until the user pauses typing, then fire the query.
- **Window resize.** Wait until the user stops dragging the window edge, then recompute layout.
- **Auto-save.** Wait until the user has stopped editing for a few seconds, then save.

### 1.3 Throttling — "at most once per interval"

**Throttle** caps how often a function can run. It runs immediately on the first event, then ignores every subsequent event for `delay` milliseconds, then allows the next run. Unlike debouncing, it guarantees regular updates even during continuous activity.

Mental model: a machine that mints coins. Once it mints a coin, it locks for a second. You can press the button as many times as you like during that second, but you still only get one coin per second.

Typical uses:

- **Scroll handlers.** Update a progress indicator at most 10 times per second even though `scroll` fires hundreds.
- **Mousemove.** Update a tooltip position at most every 50 ms.
- **Game loops, rate-limited APIs.**

### 1.4 Implementing debounce with a closure

Debounce is one of the most elegant closures in JavaScript. The helper function returns a *new* function that remembers its own timer:

```ts
type AnyFn = (...args: unknown[]) => void;

function debounce<F extends AnyFn>(fn: F, delay: number): F {
    let timer: ReturnType<typeof setTimeout> | undefined;

    return ((...args: Parameters<F>): void => {
        if (timer !== undefined) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    }) as F;
}
```

Read it carefully. `timer` is declared once, inside `debounce`. The returned arrow function closes over it. Every call cancels the previous timer (if any) and starts a new one. When the last call in a burst finally ends, `setTimeout` fires and runs `fn`. Generic `F extends AnyFn` and `Parameters<F>` preserve the original function's signature so the wrapped version has the same type.

### 1.5 Implementing throttle with a timestamp

Throttle is slightly different. It does not cancel; it asks "has enough time passed since the last run?".

```ts
function throttle<F extends AnyFn>(fn: F, delay: number): F {
    let lastRun: number = 0;

    return ((...args: Parameters<F>): void => {
        const now: number = Date.now();
        if (now - lastRun >= delay) {
            lastRun = now;
            fn(...args);
        }
    }) as F;
}
```

Again the closure carries `lastRun` through the lifetime of the wrapped function. First call: `lastRun` is 0, difference is huge, function runs, `lastRun` updates. Second call 30 ms later: difference less than `delay`, function does not run. Second call 200 ms later: difference exceeds `delay`, function runs again.

There is a subtlety: the plain throttle above ignores the *last* event in a burst if it happens during the cooldown. Production-quality throttles often fire a trailing call after the cooldown ends. For this course's level, the simple version is correct and clearer.

### 1.6 Which to use when

Ask one question: **do I want the last value or do I want regular updates?**

- If you want the last value (user stopped typing), use **debounce**.
- If you want regular updates during continuous activity (scroll position, resize), use **throttle**.

## 2. Style it — A search box with a result counter

The mini-build is a simple search input wired to a simulated network call. Per-page colour: `oklch(70% 0.2 90)` (yellow-green). Show a "requests made" counter so the student can see debouncing work. Mobile first, 44 px target on the input.

## 3. Interact — Start with the broken version

Wire the input with no debounce. Type "svelte" and watch the counter jump to 6. Wrap the handler in `debounce(sendQuery, 300)` and watch it jump to 1 instead. Then add a mousemove-throttled display to see throttle in action.

## 4. Mini-build — Typed helpers and a search UI

**File:** `src/routes/modules/05-events/07-debouncing-throttling/+page.svelte`

Contents:

- `debounce<F>` and `throttle<F>` helpers defined inline (could later be moved to a `.ts` module).
- A search input whose `oninput` is routed through `debounce`.
- A mousemove area whose `onpointermove` is routed through `throttle`.
- Live counters showing how many times the wrapped vs unwrapped functions fire.

### DevTools verification

Open the Network tab and type in the search box (with debounced version). You will see one request appear a moment after you stop typing. Switch to an un-debounced version (commented in the route) and watch a request per keystroke appear in the waterfall.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In one sentence each, describe debounce and throttle.</summary>

Debounce delays a call until the event stream is quiet for `delay` ms. Throttle allows the call to run at most once per `delay` ms no matter how many events fire.
</details>

<details>
<summary><strong>Q2.</strong> You want to update a scroll progress bar as the user scrolls. Debounce or throttle?</summary>

Throttle. You want regular updates during the scroll, not a single update at the end.
</details>

<details>
<summary><strong>Q3.</strong> Why does debounce work as a closure?</summary>

Because the wrapped function needs a private `timer` variable that persists between calls and is not shared with any other wrapped function. A closure gives every call to `debounce(fn, ms)` its own `timer`.
</details>

<details>
<summary><strong>Q4.</strong> What would break if you declared <code>let timer</code> at module scope instead of inside <code>debounce</code>?</summary>

Every `debounce`d function in the module would share the same timer. Debouncing one would cancel the timer of another, and the pattern would fall apart.
</details>

<details>
<summary><strong>Q5.</strong> What's the trade-off of the simple throttle implementation shown?</summary>

It ignores the final event in a burst if that event falls inside the cooldown window. Production-grade throttles schedule a trailing call when the cooldown ends.
</details>

## 6. Common mistakes

- **Debouncing a handler but forgetting to clear the timer in component teardown.** In long-lived pages this is usually fine, but in a SvelteKit app where the component can be destroyed mid-timer you may want to cancel on unmount.
- **Using a debounce delay that is too short.** 50 ms is not long enough for typing — the user will still fire several requests. 250–400 ms is typical for search.
- **Throttling when you should debounce (or vice versa).** If the counter jumps more than you expect, you probably picked the wrong one.
- **Copy-pasting debounce/throttle from a random blog.** Many versions online forget the closure or leak timer references. Write your own once and you will understand every one you read.

## 7. What's next

Lesson 5.8 uses callback props and closures together to build a toast notification system — a reusable UI pattern that every app needs.
