---
module: 7
lesson: 7.6
title: $effect as the bridge — triggering GSAP from reactive state
duration: 30 minutes
prerequisites:
  - Lesson 2.4 ($effect)
  - Lesson 7.5 (bind:this)
learning_objectives:
  - Explain why GSAP calls belong inside `$effect` and not in the script body
  - Use `$effect` to run GSAP once after mount
  - Use `$effect` to re-run GSAP whenever a reactive value changes
  - Avoid the "runs on SSR" error by trusting that effects are client-only
  - Recognise the relationship between `$effect` and React's `useEffect`
status: ready
---

# Lesson 7.6 — `$effect` as the bridge — triggering GSAP from reactive state

## 1. Concept — Bridges between reactive worlds

Svelte's reactivity and GSAP's animation loop are two different worlds with two different clocks. Svelte runs synchronously in response to state changes: you write `count = count + 1`, Svelte re-renders, done. GSAP runs asynchronously, off the main thread when possible, driven by its own ticker at ~60fps. The only correct place to connect them is the `$effect` rune, which lets you run **side effects** (anything that reaches outside Svelte's pure render) at the right moment in the component lifecycle.

### 1.1 Why not the script top-level?

Tempting code that does not work:

```svelte
<script lang="ts">
	import { gsap } from 'gsap';
	gsap.from('.card', { y: 40 }); // runs during SSR, card does not exist yet
</script>
```

Three problems:

1. **SSR crash.** The `<script>` block runs on the server during SvelteKit rendering, where there is no `document` and no `.card`. GSAP will throw.
2. **Runs before mount.** Even on the client, the script runs before the DOM has been committed. The element does not exist yet, so the animation targets an empty node list.
3. **Cannot react.** Top-level code runs exactly once. If you want GSAP to rerun when a state value changes, top-level code is the wrong place.

### 1.2 The right place: `$effect`

```svelte
<script lang="ts">
	import { gsap } from 'gsap';

	let card: HTMLElement | undefined = $state();

	$effect(() => {
		if (!card) return;
		gsap.from(card, { y: 40, opacity: 0, duration: 0.6 });
	});
</script>

<article bind:this={card}>Hello</article>
```

`$effect` runs **only on the client**, **after the DOM has mounted**, and **again whenever any reactive value read inside it changes**. It is the bridge you need: the first run kicks off your initial animation, and subsequent runs react to state.

### 1.3 Triggering GSAP from a reactive value

```svelte
<script lang="ts">
	import { gsap } from 'gsap';

	let step = $state(0);
	let stage: HTMLElement | undefined = $state();

	$effect(() => {
		if (!stage) return;
		gsap.to(stage, { x: step * 100, duration: 0.4, ease: 'power2.out' });
	});
</script>

<button onclick={() => (step += 1)}>Next</button>
<div bind:this={stage}>Stage</div>
```

Every click bumps `step`. The effect reads `step` and reruns. GSAP animates the stage to its new `x` position. The bridge in action.

### 1.4 What counts as a dependency?

Svelte's effect dependencies are tracked automatically based on which reactive values the function **reads during the current run**. No dependency array like React's `useEffect`. The rules:

- If you read `step` in the effect, the effect reruns when `step` changes.
- If you read `card` in the effect, the effect reruns when the binding populates.
- If you read a `$derived` value, the effect reruns when that derived value changes.
- If you do **not** read a value, the effect does not depend on it, even if the value is mutated elsewhere.

### 1.5 `$effect` is not `$effect.pre` is not `$effect.root`

Svelte has three effect variants. For GSAP bridging you always use plain `$effect`. The others are rarer:

- **`$effect`** — runs after DOM mount and after DOM updates. The default; use this for GSAP.
- **`$effect.pre`** — runs *before* DOM updates. Useful for measuring layout before a mutation; not for GSAP.
- **`$effect.root`** — creates an effect scope outside a component. Library territory; not needed in components.

### 1.6 A mental model from React

If you know React, `$effect` is closest to `useEffect`. Key differences:

| React `useEffect`                            | Svelte `$effect`                                |
|----------------------------------------------|--------------------------------------------------|
| Manual dependency array                      | Dependencies tracked automatically              |
| Runs only on client by default               | Runs only on client by default                  |
| Cleanup via the returned function            | Cleanup via the returned function               |
| Re-runs on every dep change                  | Re-runs on every tracked dependency change      |

The dependency-tracking difference is the biggest win: you cannot forget to list a dependency.

## 2. Style it — A multi-step carousel with a violet brand

The mini-build is a three-slide carousel with a violet brand (`oklch(64% 0.22 310)`). Two buttons (Prev, Next) update a `step` state. The effect reads `step`, clamps it, and runs `gsap.to` on the slide track. Buttons are 44×44px. Dots indicate current slide.

## 3. Interact — Watching the effect rerun

The mini-build displays a small counter showing "Effect runs: N" that increments every time the effect body runs. Students see the effect run once on mount (initial render), then once per click of Prev/Next. Changing any state the effect does *not* read (e.g. a timestamp) does not trigger a rerun.

## 4. Mini-build — State-driven carousel via `$effect`

**File:** `src/routes/modules/07-gsap/06-effect-bridge/+page.svelte`

A `<div class="track">` with three stacked slides. `step = $state(0)`. An effect reads `step` and a track ref, then runs `gsap.to(track, { x: -step * track.offsetWidth, duration: 0.5, ease: 'power2.out' })`. Prev/Next buttons update `step`.

### DevTools verification

1. Click Next. The effect-run counter increments and the track slides.
2. Click a button that updates unrelated state — the counter does not increment. (Included in the mini-build as a "this button does not trigger the effect" demonstration.)
3. Open the Elements panel and inspect the track — its `transform` is updated each click.
4. Enable reduced motion: the slide becomes instant (duration 0).

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why can't you call GSAP at the top level of a <code>&lt;script lang="ts"&gt;</code> block?</summary>

The script runs during SSR where there is no DOM, and even on the client it runs before the DOM has mounted, so the target element does not exist yet. It also only runs once and cannot react to state changes.
</details>

<details>
<summary><strong>Q2.</strong> How does <code>$effect</code> decide when to rerun?</summary>

It tracks which reactive values are read during the current run and reruns the next time any of those values changes. No manual dependency array.
</details>

<details>
<summary><strong>Q3.</strong> Which <code>$effect</code> variant should you use for GSAP animations?</summary>

Plain <code>$effect</code>. It runs after the DOM is mounted and updated, which is what GSAP needs. <code>$effect.pre</code> runs before updates and is for measurement; <code>$effect.root</code> is for libraries outside components.
</details>

<details>
<summary><strong>Q4.</strong> What guard should every GSAP effect start with when the target comes from <code>bind:this</code>?</summary>

<code>if (!element) return</code> — to narrow the TypeScript type from <code>HTMLElement | undefined</code> and to skip the run if the ref has not populated yet.
</details>

<details>
<summary><strong>Q5.</strong> Will an effect rerun if you mutate a <code>$state</code> value it does not read?</summary>

No. Svelte tracks dependencies by which reactive values are actually read during the effect run. Unread state is not a dependency.
</details>

## 6. Common mistakes

- **Top-level GSAP calls.** They SSR-crash and they run before mount.
- **Reading a value outside the effect and capturing it in a closure.** The closure captures the value once and the effect is "stuck" at that value. Read inside the effect.
- **Using `$effect.pre` by mistake.** Pre-effects run before DOM mutations; GSAP will target stale elements.
- **Forgetting the ref guard.** TypeScript complains and the first run may crash.

## 7. What's next

Lesson 7.7 shows how GSAP animations must clean up when the component unmounts, using the `gsap.context()` pattern inside the effect's return function.
