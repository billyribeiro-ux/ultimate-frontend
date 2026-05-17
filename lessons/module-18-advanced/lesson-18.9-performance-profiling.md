---
module: 18
lesson: 18.9
title: Performance profiling and optimization
duration: 65 minutes
prerequisites:
  - "12.1 — Core Web Vitals (LCP, CLS, INP)"
  - "12.4 — $effect performance"
  - "12.5 — Memoization with $derived"
  - "2.5 — $state.raw()"
  - "Familiarity with browser DevTools Performance panel"
learning_objectives:
  - Use the browser Performance panel to identify long tasks, layout thrashing, and excessive re-renders in a Svelte application
  - Instrument Svelte components with $inspect to trace reactive updates at development time
  - Apply $state.raw() and fine-grained $derived() to eliminate unnecessary deep reactivity
  - Profile memory allocations and detect component-level leaks using DevTools Allocation Timeline
  - Design a performance budget and enforce it with Lighthouse CI in a SvelteKit project
status: ready
---

# Lesson 18.9 — Performance profiling and optimization

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Finding and fixing the bottlenecks that matter

### 1.1 The problem: "it feels slow" is not a diagnosis

Every developer has heard a colleague say "the app feels slow." That statement is nearly useless without data. Is the initial load slow? Is scrolling janky? Does typing into a search field lag? Each symptom points to a completely different root cause: network waterfall, layout thrashing, or excessive reactivity. The first rule of performance work is **measure before you optimize**. An optimization applied to the wrong bottleneck wastes time and often makes code harder to maintain without any user-facing improvement.

Modern browsers ship a suite of profiling tools that can answer these questions precisely. The Performance panel records a flame chart of every function call, paint, layout, and garbage collection event. The Memory panel tracks allocations over time and can snapshot the heap to find objects that should have been collected but were not. Lighthouse audits a page against a set of heuristics and returns scores for Performance, Accessibility, Best Practices, and SEO. Together, these tools tell you exactly where the time goes.

### 1.2 How the profiling workflow solves it

A productive profiling session follows a loop: **record**, **identify**, **hypothesize**, **fix**, **re-record**. You record a trace while reproducing the slow interaction. You look for long tasks (anything over 50 milliseconds blocks the main thread and degrades INP, the Interaction to Next Paint metric). You zoom into the flame chart, find the function at the top of the call stack, and ask whether the work is necessary, whether it can be deferred, or whether it can be batched.

In Svelte applications, the most common performance issues fall into three categories:

1. **Excessive deep reactivity.** A large object passed through `$state()` becomes deeply proxied. Every property read and write goes through a proxy trap. If the object has hundreds of nested keys and the component only reads two of them, you pay for a surveillance apparatus you do not need. The fix is `$state.raw()`, which stores the object without proxying. Updates must be done immutably (replacing the entire object), but reads are free of overhead.

2. **Unnecessary derived recalculations.** A `$derived()` expression that references a large array re-runs whenever any element changes. If the derived value only depends on a count or a specific property, restructuring the derivation to read only what it needs prevents cascading updates.

3. **Layout thrashing.** Reading a layout property (like `offsetHeight`) and then writing a style (like `style.height = ...`) in the same synchronous block forces the browser to recalculate layout between read and write. This is the single most common cause of janky animations and scroll handlers.

### 1.3 How it connects to what you already know

In Module 12 you learned the three Core Web Vitals: LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), and INP (Interaction to Next Paint). Those metrics tell you **what** is slow from the user's perspective. This lesson teaches you **why** it is slow from the browser's perspective. The Performance panel turns a vague LCP score of 4.2 seconds into a specific finding: "the load function fetched three endpoints sequentially when they could have been parallel."

You also used `$effect` cleanup in Module 2 to prevent memory leaks. The Memory panel in this lesson gives you proof that those cleanups are working — or reveals the ones you missed.

### 1.4 Svelte-specific profiling tools in May 2026

Svelte 5 ships `$inspect()`, a development-only rune that logs whenever its argument changes. It does not exist in production builds. Use it to trace which reactive values change and when:

```typescript
let items: Item[] = $state([]);
$inspect(items); // logs every mutation with a before/after diff
```

You can pass a callback to `$inspect()` for custom logging:

```typescript
$inspect(items).with((type, value) => {
  if (type === 'update') {
    console.trace('items updated', value);
  }
});
```

The stack trace from `console.trace` tells you exactly which user action or effect triggered the update.

Svelte DevTools (the browser extension) shows the component tree with live reactive state. Clicking a component reveals its current `$state` and `$derived` values. When profiling, open the extension's "Profiler" tab, click Record, perform the slow interaction, and stop recording. The profiler shows how many times each component re-rendered and how long each render took. Components that rendered many times but should not have are your optimization targets.

### 1.5 The performance budget

A performance budget sets hard limits: LCP under 2.5 seconds, INP under 200 milliseconds, total JavaScript bundle under 150 KB compressed. Without a budget, performance degrades gradually with every feature addition. No single commit makes the app slow — a hundred commits each adding 2 KB do.

Enforce the budget in CI with Lighthouse CI. It runs Lighthouse headless, compares scores against your thresholds, and fails the build if any metric regresses. This is the only reliable way to prevent performance regressions in a team.

### Deep Dive — Memory profiling and reactive cleanup verification

Memory profiling is the least-used and most valuable profiling technique. Open the Memory panel in DevTools, select "Allocation instrumentation on timeline," and click Start. Navigate through your app — open a modal, close it, navigate away and back. Stop the recording. The timeline shows blue bars for allocations that are still alive and gray bars for allocations that were collected. If closing a modal leaves blue bars, those are leaks.

In Svelte, the most common leak is an `$effect` that registers an event listener or interval without returning a cleanup function. The effect's closure keeps the component's variables alive even after the component is destroyed. The fix is always the same pattern:

```typescript
$effect(() => {
  const id = setInterval(poll, 5000);
  return () => clearInterval(id);
});
```

Another subtle leak comes from closures captured in callbacks passed to third-party libraries. If you pass an inline function to a charting library's `onHover` callback and that library stores the reference, the closure and everything it captures stays alive. The fix is to use `$effect` to register and deregister the callback:

```typescript
$effect(() => {
  chart.on('hover', handleHover);
  return () => chart.off('hover', handleHover);
});
```

To verify a fix, take a heap snapshot before and after the interaction. Compare the two snapshots. The Comparison view shows objects that were allocated between the two snapshots but not collected. Filter by "Detached" to find DOM nodes that are no longer in the document but still referenced from JavaScript.

For production monitoring, use the `PerformanceObserver` API to collect real user metrics and send them to your analytics endpoint. SvelteKit's `hooks.server.ts` can inject a small inline script that sets up the observer before any other JavaScript runs, ensuring you capture LCP from the very first paint.

## 2. Style it — PE7 applied to the performance dashboard mini-build

The mini-build is a performance dashboard that displays metrics as bar charts. Each metric bar uses `var(--color-success)` for values within budget, `var(--color-warning)` for values approaching the limit, and `var(--color-error)` for values that exceed it. The bars animate their width with `transition: inline-size var(--dur-base) var(--ease-out)`. The dashboard container uses `var(--color-surface-2)` with `var(--radius-lg)` for consistency with other module mini-builds.

Typography follows the token scale: metric labels use `var(--text-sm)`, values use `var(--text-base)` with `font-variant-numeric: tabular-nums` for alignment, and the dashboard title uses `var(--text-xl)`. All spacing uses `var(--space-md)` and `var(--space-sm)` from the token system. The layout is a single column on mobile, expanding to a two-column grid at `min-width: 768px`.

## 3. Interact — building a reactive performance tracker

The problem: you want to show live performance metrics that update as the user interacts with the page. A naive approach recalculates every metric on every frame, which itself causes performance issues — the observer becomes the bottleneck.

The solution is to batch updates using `$state.raw()` for the metrics array and only trigger reactivity when a new measurement arrives:

```typescript
interface PerfMetric {
  name: string;
  value: number;
  budget: number;
  unit: string;
}

let metrics: PerfMetric[] = $state.raw([]);

function addMetric(metric: PerfMetric): void {
  metrics = [...metrics, metric];
}
```

Because `metrics` uses `$state.raw()`, Svelte does not proxy the array or its objects. The only reactive update happens when we replace the entire array with a new one via the spread. The `$derived` values that compute status colors only re-run when the array reference changes, not when any deep property mutates.

The `$inspect` rune validates that updates happen only when expected:

```typescript
$inspect(metrics).with((type) => {
  console.log(`metrics ${type} — count: ${metrics.length}`);
});
```

## 4. Mini-build — Performance budget dashboard

**File path:** `src/routes/modules/18-advanced/09-performance-profiling/+page.svelte`

The dashboard displays five metrics (LCP, INP, CLS, Bundle Size, Memory) as animated bars. Each bar's width is proportional to its value relative to the budget threshold. Color changes from green to yellow to red based on the ratio. The student simulates adding measurements by clicking a button that generates a random value within a realistic range.

**DevTools moment:** Open the Performance panel, click Record, then click the "Simulate Measurement" button ten times rapidly. Stop the recording. Examine the flame chart. Each click should produce a single short task with no layout thrashing. If bars animate smoothly during rapid clicks, the batched `$state.raw()` approach is working. Compare this with a version that uses deep `$state()` and observe the difference in task duration.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why should you use $state.raw() instead of $state() for a large array of metric objects that only changes by replacement?</summary>

Because `$state()` wraps the array and every nested object in proxies, creating overhead for every property read and write. When the component only needs to react to the entire array being replaced (not individual property mutations), `$state.raw()` avoids that overhead entirely. The tradeoff is that you must update immutably — replace the whole array rather than mutating an element — but this is exactly how metrics arrive: as new snapshots.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between a long task and a layout thrash, and how do they appear in the Performance panel?</summary>

A long task is any synchronous JavaScript execution that takes more than 50 milliseconds. It appears as a wide bar in the flame chart, often highlighted with a red corner. Layout thrashing is a specific cause of long tasks: it happens when JavaScript alternates between reading layout properties (like `offsetHeight`) and writing styles (like `element.style.height`), forcing the browser to recalculate layout between each pair. In the flame chart, layout thrashing shows as repeated purple "Layout" blocks interleaved with script execution.
</details>

<details>
<summary><strong>Q3.</strong> How does $inspect() help you find unnecessary re-renders, and why does it not exist in production builds?</summary>

`$inspect()` logs whenever its tracked value changes, including a trace of what triggered the change. By placing it on a `$derived` value, you can see how often that derivation recalculates. If it fires on every keystroke but should only fire when a specific field changes, the derivation is too broadly scoped. It does not exist in production because the logging and tracing have non-trivial overhead and because reactive internals should not be observable by end users.
</details>

<details>
<summary><strong>Q4.</strong> Explain the record-identify-fix-rerecord profiling loop and why skipping the re-record step is dangerous.</summary>

You record a trace of the slow interaction, identify the bottleneck in the flame chart, apply a fix, and then record a new trace to verify the fix worked. Skipping the re-record step is dangerous because optimizations can have unexpected side effects — moving work off the main thread might increase memory usage, batching updates might introduce visual glitches, and removing a derived calculation might cause stale data. Only a new recording proves the fix actually improved the metric without introducing new problems.
</details>

<details>
<summary><strong>Q5.</strong> What does a "Detached" DOM node in a heap snapshot comparison indicate, and what is the most common Svelte cause?</summary>

A detached DOM node is an element that is no longer in the document tree but is still referenced by JavaScript, preventing garbage collection. In Svelte, the most common cause is an `$effect` that captures a DOM reference (via `bind:this`) and passes it to a third-party library without cleaning up the reference when the effect is destroyed. The fix is to return a cleanup function from the `$effect` that removes the library's reference to the element.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Profiling in development mode.** Svelte's development build includes extra validation, `$inspect` support, and unminified code. Always profile production builds (`pnpm build && pnpm preview`) for realistic numbers. Development-mode profiles show overhead that does not exist in production.

2. **Optimizing before measuring.** Developers often add `$state.raw()` everywhere "just in case." This forces immutable update patterns on data that is frequently mutated in place (like form state), making the code harder to write without any measurable improvement. Only switch to `$state.raw()` when profiling shows deep reactivity is the bottleneck.

3. **Ignoring CLS while fixing LCP.** Lazy-loading an image to improve LCP can cause layout shift if the image's dimensions are not reserved. Always set explicit `width` and `height` attributes or use CSS `aspect-ratio` on lazy-loaded media.

4. **Forgetting to clean up PerformanceObserver.** The `PerformanceObserver` itself can accumulate entries. Call `observer.disconnect()` in `$effect` cleanup or `onDestroy` to stop observing when the component is removed.

## 7. What's next — one sentence

Next, you will learn how to organize multiple Svelte packages and applications in a monorepo architecture using pnpm workspaces and shared TypeScript configurations.
