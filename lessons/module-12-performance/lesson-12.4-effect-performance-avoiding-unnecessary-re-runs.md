---
module: 12
lesson: 12.4
title: $effect performance — avoiding unnecessary re-runs
duration: 50 minutes
prerequisites:
  - Module 2 — $effect basics
  - Lesson 12.1 — INP fundamentals
learning_objectives:
  - Explain how Svelte's reactive dependency graph decides when $effect re-runs
  - Use untrack() to read a value without subscribing to it
  - Split one effect into two when the dependencies are unrelated
  - Measure an over-firing effect in the Performance panel
  - Avoid three common patterns that create effect loops or wasted work
status: ready
---

# Lesson 12.4 — `$effect` performance — avoiding unnecessary re-runs

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. Svelte's reactivity graph is automatic, but "automatic" does not mean "always optimal". When an effect fires more often than it should, your INP suffers. This lesson teaches you how to see the waste and fix it.

## 1. Concept — The graph is built from what you read

### 1.1 How a dependency is created

The contract of `$effect` is simple in one sentence: **the effect re-runs whenever any reactive value it *read* during its last run changes.** Not "mentioned", not "imported" — *read*. The compiler instruments every `$state` and `$derived` access inside the effect body, and records the dependency graph automatically.

```ts
$effect(() => {
	console.log(user.name);
});
```

This effect depends on `user.name` because it reads it. It does *not* depend on `user.email`, `user.age`, or any other field on the same object, because those were not read. Mutating `user.email` does not re-run this effect. Mutating `user.name` does.

That precision is the single most important performance property of the runes system. It is also the source of every effect-performance bug, because it is easy to accidentally read something you did not want to depend on.

### 1.2 The "I only read it once" problem

Imagine an effect that syncs two reactive values:

```ts
let source = $state<number>(0);
let mirror = $state<number>(0);
let lastSyncTime = $state<number>(Date.now());

$effect(() => {
	mirror = source;
	lastSyncTime = Date.now();
});
```

What you intended: "whenever `source` changes, copy it to `mirror` and record the time". What actually happens: the effect reads `source` (dependency), writes `mirror`, writes `lastSyncTime`. But because it *writes* `mirror` and `lastSyncTime` inside the effect, and because writes to reactive state invalidate any reader, Svelte will also flag this effect as *producing* updates that could affect other parts of the graph. For dependencies the rule is strict — writes to values read elsewhere can cascade into more work than you intended.

A more insidious variant:

```ts
$effect(() => {
	if (source > 10) {
		mirror = source;
	}
	console.log('last value was', lastSyncTime);   // accidentally reads lastSyncTime
});
```

Now the effect depends on `lastSyncTime` too, because it read it. Every time `lastSyncTime` changes, the effect re-runs — even if `source` has not changed. The console log looks harmless; the dependency it created is not.

### 1.3 `untrack()` — read without subscribing

Svelte provides `untrack()` from the `'svelte'` package for exactly this case. `untrack(fn)` runs `fn` and returns its value, but any reactive reads inside `fn` do not register as dependencies of the surrounding effect.

```ts
import { untrack } from 'svelte';

$effect(() => {
	if (source > 10) {
		mirror = source;
	}
	untrack(() => {
		console.log('last value was', lastSyncTime);
	});
});
```

Now the effect only re-runs when `source` changes. Reading `lastSyncTime` inside `untrack` produces the current value without creating a subscription. This is the single most valuable tool in the `$effect` toolbox.

A second common use: derived values inside effects.

```ts
$effect(() => {
	// Run analytics when the user's name changes, but include their role in the payload.
	const name = user.name;                   // dependency
	const role = untrack(() => user.role);    // not a dependency
	trackEvent('profile_updated', { name, role });
});
```

The effect fires on name change only. The payload includes the current role at the moment the effect fired, but changes to the role alone do not re-run the effect.

### 1.4 Split the effect when the concerns are unrelated

Sometimes an effect has two independent reasons to run. Combining them into one effect means every change to either input re-runs the entire effect body — including the unrelated half. The fix is to split:

```ts
// ONE EFFECT — fires on both changes, even if only one is relevant
$effect(() => {
	updateChart(data);
	updateTitle(title);
});

// TWO EFFECTS — each fires only for its own concern
$effect(() => {
	updateChart(data);
});
$effect(() => {
	updateTitle(title);
});
```

If `title` changes but `data` does not, only the second effect runs. The chart update is skipped. On a large dashboard where updating the chart costs 40 ms of main-thread time, that split alone can make the difference between green INP and red.

### 1.5 Derive, do not effect

The most frequent anti-pattern beginners write is using `$effect` to compute a derived value:

```ts
// WRONG — uses an effect to compute a value
let filtered = $state<Item[]>([]);
$effect(() => {
	filtered = items.filter((i) => i.active);
});
```

`$effect` is for *side effects* — logging, fetch, DOM work, integration with non-reactive code. Computing a new value from existing reactive values is the job of `$derived`:

```ts
const filtered = $derived(items.filter((i) => i.active));
```

Three advantages:

1. `$derived` is lazy — it only recomputes when something actually reads `filtered`.
2. `$derived` has no cleanup phase and no main-thread scheduling overhead.
3. `$derived` cannot accidentally create a feedback loop, because it cannot write.

Lesson 12.5 expands on `$derived.by` for more expensive computations. For now, remember the rule: **if the code inside your `$effect` is `let x = ... = expression`, it should be a `$derived` instead.**

### 1.6 Measuring an over-firing effect

Open Chrome DevTools → Performance. Record a short interaction (click a button, type in an input, scroll a list). Look at the main thread track. Each effect run shows up as a small block in the "Function call" row, labelled with the source location. If you see an effect firing dozens of times for a single interaction, open the effect and check what it reads. The offender is almost always something you did not mean to depend on.

A useful trick: temporarily add `console.log('effect fired', Date.now())` inside the effect. Count the logs per interaction. Before your fix: 47. After adding `untrack` around the accidental reader: 1.

### 1.x What Svelte does under the hood with effects

When the compiler processes `$effect(() => { ... })`, it creates a subscription that:

1. **Runs the effect function** and tracks every reactive value read during execution (dependencies).
2. **Registers a cleanup** if the effect returns a function.
3. **Schedules re-runs** when any dependency changes — but only after the current microtask completes (batched).
4. **Runs cleanup** before each re-run and on component unmount.

The most common performance mistake: reading too many dependencies inside an effect. If your effect reads 10 reactive values but only needs to react to 1, it re-runs 10x more often than necessary. The fix: `$effect` only tracks what it reads — restructure the code so the effect reads only what it needs:

```ts
// Bad: re-runs when ANY state changes
$effect(() => { console.log(name, age, email, phone, address); });

// Good: re-runs only when name changes
$effect(() => { console.log(name); });
// Separate effect for age
$effect(() => { console.log(age); });
```

> **In production sidebar.** We had an effect that recalculated a dashboard chart whenever any filter changed. The effect read 8 filter values. Changing any single filter triggered a full chart recalculation — 200ms of work. We split it into two effects: one that computed the filtered dataset (reading 8 values), and one that rendered the chart (reading only the dataset). Changing filters that did not affect the data (like display options) no longer triggered the expensive chart render. The perceived responsiveness improved from 200ms to 40ms for display-only changes.

### 1.x Common interview question

**Q: "How does Svelte track dependencies in `$effect`, and how do you prevent unnecessary re-runs?"**

**Model answer:** Svelte tracks dependencies by recording every reactive value read during the effect's execution. The next time any of those values changes, the effect re-runs. To prevent unnecessary re-runs, minimize the number of reactive values read inside the effect. Split large effects into smaller, focused ones that each read only their relevant dependencies. Use `$derived` for computations that other effects depend on — this creates an intermediate cached value that only recomputes when its own dependencies change, preventing downstream effects from running unnecessarily. The key principle: an effect should do one thing and read only the values it needs for that one thing.

## Deep Dive

**Why this matters at scale.** Effects that read too many values rerun unnecessarily. Minimize the reactive surface: read only needed values, extract computation to $derived.

**The mental model.** Each $state read inside $effect adds a dependency. Reading an object reads all its properties. Destructure to read only specific fields.

**Edge cases.** Logging inside effects for debugging adds dependencies on the logged values. Use untrack() to read values without adding dependencies.

**Performance implications.** An effect with N dependencies reruns when any one changes. Reducing dependencies from 10 to 3 eliminates 70% of potential reruns.

**Connection to other modules.** Module 2 explains the dependency graph. Module 12.5's $derived provides the primary optimization.


## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — A dashboard with visible effect counts

The mini-build renders three numeric counters and three toggle switches. A log next to the counters records how many times each effect fired. Per-page accent: `oklch(68% 0.2 100)` (warning green).

- The counters are `$derived`; no effect is used to compute them.
- The log is a single effect that reads a tracked counter value.
- `prefers-reduced-motion` disables the counter pulse animation.

## 3. Interact — See the over-fire, then fix it

The page has two tabs: "bad" and "good". In "bad", an effect reads every state value and logs a message. Changing any single state fires the effect. In "good", the effect is wrapped in `untrack` for the irrelevant values and split into two, and the student watches the log count drop from 5 per change to 1.

## 4. Mini-build — Counters and an effect log

**File:** `src/routes/modules/12-performance/04-effect-performance/+page.svelte`

Three counters, a "bad effect" log, and a "good effect" log. A mode toggle switches which version is active. Students compare the two counts.

### DevTools moment

Open the Performance panel and record an interaction in "bad" mode. Count the effect runs in the log row. Switch to "good" mode and record again. The count drops. The page's main-thread time drops correspondingly — the difference is visible in the timeline as fewer, shorter function-call blocks.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What determines whether an effect re-runs?</summary>

Whether any reactive value it *read* during its last run has changed. Not "mentioned in the code"; *read at runtime*. The compiler builds the dependency graph from the reads.
</details>

<details>
<summary><strong>Q2.</strong> When should you reach for <code>untrack()</code>?</summary>

Whenever you need the *current value* of a reactive variable inside an effect without creating a subscription to it. Typical cases: logging the last-updated timestamp, reading a role alongside a name, including contextual data in an analytics payload without firing on context changes.
</details>

<details>
<summary><strong>Q3.</strong> Why is computing a filtered list inside <code>$effect</code> wrong?</summary>

`$effect` is for side effects, not for deriving values. Using it to compute a value forces an eager recomputation on every dependency change even if nothing is currently reading the result, and it can create a feedback loop if the computation writes to reactive state. `$derived` is the correct tool — it is lazy, loop-safe, and cheaper.
</details>

<details>
<summary><strong>Q4.</strong> When should one effect be split into two?</summary>

When the effect has two unrelated concerns whose dependencies do not overlap. Splitting ensures that a change in one concern's inputs does not force the other concern's work to run.
</details>

<details>
<summary><strong>Q5.</strong> An effect is firing 10 times per interaction. What's the first thing to look at?</summary>

The list of reactive values the effect reads. One of them is almost certainly something you did not intend to depend on — a secondary value that happens to appear in a `console.log` or in a branch of the effect body. Wrap the accidental reader in `untrack()`.
</details>

## 6. Common mistakes

- **Using `$effect` to compute a value.** Use `$derived`.
- **Reading unrelated reactive values inside an effect.** Wrap them in `untrack`.
- **Combining two independent concerns in one effect.** Split them.
- **Forgetting cleanup.** Effects that subscribe to timers or event listeners must return a cleanup function, otherwise they leak and eventually show up as long tasks.

## 7. What's next

Lesson 12.5 takes `$derived` to its natural conclusion — using it for expensive, memoised computations that would otherwise run on every render.
