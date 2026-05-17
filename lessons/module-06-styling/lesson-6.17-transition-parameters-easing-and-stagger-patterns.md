---
module: 6
lesson: 6.17
title: Transition parameters, easing, and stagger patterns
duration: 35 minutes
prerequisites:
  - Lesson 6.11 (Svelte transition directive)
  - Lesson 6.16 (Custom transition functions)
learning_objectives:
  - Pass `delay`, `duration`, and `easing` parameters to every transition consistently
  - Pick an easing from `svelte/easing` that matches the intent of an animation
  - Use the each-block index to stagger transitions across a list
  - Express stagger as a function of index so the gap is consistent
  - Recognise the point where stagger becomes noise instead of polish
status: ready
---

# Lesson 6.17 — Transition parameters, easing, and stagger patterns

## 1. Concept — Parameters are where transitions earn their personality

The `transition:` directive is a doorway into a small, well-designed parameter language. Four words — `delay`, `duration`, `easing`, and whatever extra keys a specific transition needs — let you shape the animation precisely. Students often skip straight to the defaults and wonder why their animations feel generic. This lesson is about taking those parameters seriously.

### 1.1 `delay` — the staging tool

`delay` is the number of milliseconds to wait before the animation starts. On a single element it has limited use — why wait before showing a modal? — but on a *list* of elements it is transformative. Give item 0 a delay of 0ms, item 1 a delay of 60ms, item 2 a delay of 120ms, and so on, and the list cascades into view one item at a time. That cascade is called a **stagger**, and it is the reason a good dashboard feels polished and a bad one feels like a flashcard.

### 1.2 `duration` — the tempo

Durations pull from the PE7 motion tokens (Lesson 6.10). The full palette in milliseconds:

- **100ms** (`instant`) — below this, humans perceive the change as instantaneous
- **200ms** (`fast`) — feedback animations: hover, press, toggle
- **300ms** (`base`) — the default for most transitions you write
- **500ms** (`slow`) — hero reveals, modal openings, anything that wants attention
- **800ms** (`slower`) — once-per-session moments only (page hero, onboarding)

Never go above 800ms for interactive UI. Users waiting for an animation to finish are users wasting their time.

### 1.3 `easing` — the personality

`svelte/easing` exports 30 easing functions. Memorising all of them is overkill; three do 90% of the work:

- **`cubicOut`** — the default for entrances. Fast start, graceful finish.
- **`cubicIn`** — the default for exits. Gentle start, quick finish.
- **`cubicInOut`** — the default for reversible toggles. Symmetric.

For expressive moments you have:

- **`backOut`** — slight overshoot, then settle. Great for "pop in" feelings.
- **`elasticOut`** — bouncy, overshoot, damped oscillation. Use almost never.
- **`expoOut`** — extremely fast start, very slow finish. Dramatic reveals.

If a designer asks for "that Apple feel" they usually mean `cubicOut` with a 400ms duration and a small delay. If they ask for "playful", they mean `backOut`. If they ask for "premium", they mean `expoOut` slowed down.

### 1.4 Stagger patterns

To stagger a transition across a list you need the item's position in the list. Inside a Svelte `{#each}` block, that is the second binding:

```svelte
{#each items as item, index (item.id)}
	<li
		transition:fly={{
			y: 20,
			duration: 400,
			delay: index * 60,
			easing: cubicOut
		}}
	>
		{item.label}
	</li>
{/each}
```

Three tuning knobs for a stagger:

- **Gap** (ms per item) — 40-80ms is the sweet spot. Less than 40ms feels simultaneous; more than 100ms feels like waiting.
- **Direction** — you can reverse it with `delay: (items.length - 1 - index) * 60` for a "last item first" feel.
- **Cap** — for a list of 50 items, a linear stagger is 50 × 60 = 3000ms. That is too long. Cap the total: `delay: Math.min(index * 60, 600)`.

### 1.5 When stagger becomes noise

Stagger is like salt: a pinch makes everything better, a fistful ruins the meal. Rules of thumb:

- **Stagger only on first-paint or first-reveal.** If the list reshuffles every few seconds, staggering every update is distracting.
- **Stagger visible items only.** If the list is scrollable, only stagger items in the initial viewport. Everything off-screen should arrive instantly when the user scrolls to it.
- **Respect reduced motion.** Collapse the delay to 0 when the user has asked for less motion.

### 1.6 Tying it together with reduced motion

```svelte
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);
</script>

{#each items as item, i (item.id)}
	<li
		transition:fly={{
			y: reduced ? 0 : 16,
			duration: reduced ? 0 : 400,
			delay: reduced ? 0 : Math.min(i * 60, 600),
			easing: cubicOut
		}}
	>
		{item.label}
	</li>
{/each}
```

This is the reference pattern for every staggered list in this course.





### The TypeScript angle

Type stagger parameters as a `$derived` object for reactive reduced-motion support.

### Comparison: easing personality

| Easing | Character | Use for |
|--------|-----------|--------|
| `cubicOut` | Fast start, gentle finish | Entrances |
| `cubicIn` | Gentle start, fast finish | Exits |
| `backOut` | Slight overshoot | "Pop in" |
| `expoOut` | Very fast start | Dramatic reveals |

> **In production sidebar.** On a 100K-daily-user product landing page, A/B testing showed that a 60ms stagger on feature cards increased "time on page" by 8%. A 120ms stagger decreased engagement because users felt they were waiting.

### Common interview question

**Q: How do you prevent a stagger from being too slow on long lists?**

**Model answer:** Cap the total delay with `Math.min(index * gap, maxDelay)` — typically 600ms max. Without a cap, 50 items at 60ms per item means 3 seconds of cascading, which tests user patience.

## Going Deeper

**Official documentation:**
- [Svelte docs: transition parameters](https://svelte.dev/docs/svelte/transition)
- [Svelte docs: svelte/easing](https://svelte.dev/docs/svelte/svelte-easing)
- [Svelte tutorial: Deferred transitions](https://svelte.dev/tutorial/svelte/deferred-transitions)

**Advanced pattern:** Build a "stagger lab" with sliders for gap (10-200ms), cap (200-2000ms), and easing selection. Replay the stagger with each setting to feel the difference.

**Challenge question:** (Combines Lessons 6.17, 6.11, and 6.16) Build a staggered grid reveal using a custom transition function that combines fly + scale. Use the `mounted` flag pattern for first-paint. Cap the stagger at 600ms. Add an easing dropdown to switch between cubicOut, backOut, and expoOut.

## Deep Dive

**Why this matters at scale.** Parameterized transitions transform one-off animations into reusable primitives. Parameters enable stagger: the same transition with increasing delay creates a cascade that looks choreographed.

**The mental model.** Parameters flow like props. Stagger maps index to delay: item 0 starts immediately, item 1 at 50ms, item 2 at 100ms. Total time: (n-1) * stagger + duration. The easing parameter accepts any (t) => number function.

**Edge cases.** Cap maximum delay for large lists. Stagger on page load can cause FOUC — set initial CSS to match the transition start state. IntersectionObserver-based triggering ensures only visible items animate.

**Performance implications.** Staggered transitions create multiple simultaneous animations. For CSS-based transitions, the browser handles them efficiently. The easing function runs once per frame per transition — keep it simple.

**Connection to other modules.** Module 7's GSAP stagger is more powerful (grid-based, from-center, random). Module 6.11-16's built-in transitions all accept the same parameter interface. Module 12's lazy loading provides scroll-driven trigger timing.

## 2. Style it — A feature grid with a cyan brand

The mini-build is a six-item feature grid with a cyan brand hue (`oklch(72% 0.14 220)`). Each feature tile flies in with a 60ms stagger on first paint. Mobile-first: one column; two columns at 480px; three at 720px (container query friendly).

## 3. Interact — First-paint stagger via a mount flag

The trick to running transitions on initial page load is that Svelte only plays a transition when an element *enters* the DOM — which means it must be mounted by a conditional after the component has existed for a tick. The pattern:

```svelte
<script lang="ts">
	let mounted = $state(false);
	$effect(() => {
		mounted = true;
	});
</script>

{#if mounted}
	{#each items as item, i (item.id)}
		<!-- stagger-animated tiles -->
	{/each}
{/if}
```

The `$effect` runs after the first render, flips `mounted` to `true`, and the each-block mounts with transitions firing. Without this trick, the tiles would be in the DOM on first paint with no transition to run.

## 4. Mini-build — A staggered feature grid

**File:** `src/routes/modules/06-styling/17-stagger/+page.svelte`

Six feature tiles describing imaginary product features. Each tile has an icon, a title, and a short description. On mount, they cascade in with a 60ms stagger. A button re-triggers the stagger by toggling `mounted` off and on.

### DevTools verification

1. Reload the page and immediately open DevTools → Elements. The six `<li>` elements mount over ~400ms with visibly different start times — that is the stagger working.
2. Click "Replay" to flip `mounted` off and on; watch the stagger run again.
3. Enable reduced motion; all tiles appear instantly with no stagger.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What are the four most commonly used keys in a transition parameter object?</summary>

`delay`, `duration`, `easing`, and the transition-specific keys (`x`/`y` for fly, `start` for scale, `amount` for blur, etc.).
</details>

<details>
<summary><strong>Q2.</strong> Why is 60ms a good default stagger gap?</summary>

Below 40ms items feel simultaneous. Above 100ms they feel like separate events. 60ms is fast enough to feel like one cascade but slow enough to be visible as sequential.
</details>

<details>
<summary><strong>Q3.</strong> How do you stop a stagger from running forever on a list of 50 items?</summary>

Cap the delay with <code>Math.min(index * gap, maxDelay)</code>. A typical cap is 600ms so no item waits more than that.
</details>

<details>
<summary><strong>Q4.</strong> How do you make a stagger run on first page load instead of on a later state change?</summary>

Gate the rendering on a `mounted` boolean that starts false, and set it to true inside a `$effect`. The effect runs after the first render, the conditional mounts, and the transitions fire. This works because Svelte only animates elements that enter the DOM.
</details>

<details>
<summary><strong>Q5.</strong> Which easing is a safe default for "enter" transitions and why?</summary>

<code>cubicOut</code> — fast start, graceful finish — matches how the human eye expects things to arrive into attention. It is the default `--ease-out` token in PE7.
</details>

## 6. Common mistakes

- **Uncapped stagger on long lists.** A 50-item linear stagger at 60ms takes three seconds and tests your user's patience.
- **Staggering every update.** First-paint stagger is polish; stagger-on-every-click is distraction.
- **Picking the wrong easing.** `cubicIn` on an entrance feels like the element is limping into view; `cubicOut` on an exit feels like the element is refusing to leave. Think about direction.
- **Forgetting the `mounted` flag.** Without it, first-paint transitions never fire because the elements were already in the DOM when the component initialised.

## 7. What's next

Lesson 6.18 consolidates reduced-motion handling into a single pattern you apply to every animation in every component from here on.
