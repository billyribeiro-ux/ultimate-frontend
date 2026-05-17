---
module: 7
lesson: 7.12
title: Building a scroll reveal action
duration: 40 minutes
prerequisites:
  - Lesson 7.11 (Svelte actions)
  - Lesson 7.9 (ScrollTrigger)
learning_objectives:
  - Implement `use:revealOnScroll` using `IntersectionObserver`
  - Decide between IntersectionObserver and ScrollTrigger for simple reveals
  - Parameterise the action with distance, duration, and threshold
  - Clean up both the observer and the GSAP tween in `destroy`
  - Reuse the action across many components without performance cost
status: ready
---

# Lesson 7.12 — Building a scroll reveal action

## 1. Concept — Not every scroll animation needs ScrollTrigger

ScrollTrigger is powerful, but it is also expensive — each trigger runs measurement and comparison logic on every scroll event. For the most common scroll animation in the world — "fade this in when it enters the viewport, once, forever" — a much lighter tool exists: `IntersectionObserver`. It is a native browser API that notifies you when elements enter or leave the viewport with almost zero cost. Combined with GSAP for the actual tween, you get the smallest, cheapest, most reusable reveal pattern possible.

This lesson builds `use:revealOnScroll` — an action you will use on dozens of elements in the module project.

### 1.1 What IntersectionObserver is

A browser-native API that watches elements and calls your callback when their visibility in the viewport crosses a configurable threshold. Unlike scroll listeners, it does not run on every scroll tick — the browser only notifies you when something actually crossed a threshold, which is far cheaper.

```ts
const observer = new IntersectionObserver(
	(entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				// element just entered the viewport
			}
		}
	},
	{ rootMargin: '0px 0px -10% 0px', threshold: 0 }
);

observer.observe(element);
```

- **`rootMargin`** — expand or contract the observation box. `'-10%'` on the bottom means "fire 10% before the element touches the bottom of the viewport", which matches `start: 'top 80%'` in ScrollTrigger.
- **`threshold`** — 0 means "fire as soon as any pixel is visible". 1 means "fire when fully visible". 0.5 means "fire when half visible".

### 1.2 Combining IntersectionObserver with GSAP

Inside the callback, run a GSAP tween on the intersecting element and unobserve it (we only want to reveal once). This is the core of the action:

```ts
import type { Action } from 'svelte/action';
import { gsap } from 'gsap';
import { prefersReducedMotion } from 'svelte/motion';

export type RevealParams = {
	y?: number;
	duration?: number;
	delay?: number;
	threshold?: number;
	rootMargin?: string;
};

export const revealOnScroll: Action<HTMLElement, RevealParams | undefined> = (
	node,
	params = {}
) => {
	const { y = 40, duration = 0.6, delay = 0, threshold = 0, rootMargin = '0px 0px -10% 0px' } = params;

	// Set initial state immediately so there is no flash
	if (!prefersReducedMotion.current) {
		gsap.set(node, { y, opacity: 0 });
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;

				if (prefersReducedMotion.current) {
					gsap.set(node, { y: 0, opacity: 1 });
				} else {
					gsap.to(node, { y: 0, opacity: 1, duration, delay, ease: 'power2.out' });
				}
				observer.unobserve(node);
			}
		},
		{ threshold, rootMargin }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
			gsap.killTweensOf(node);
		}
	};
};
```

Four details worth studying:

1. **Initial state applied synchronously.** `gsap.set(node, { y, opacity: 0 })` runs immediately when the action mounts so there is no "flash of visible content" before the observer fires.
2. **`prefersReducedMotion` guard used twice.** Once to skip the initial hidden state, once to skip the tween. If the user prefers reduced motion, the element appears in its natural state with no animation.
3. **`observer.unobserve(node)` after firing.** We only reveal once per element. Keeping the observer alive would waste cycles.
4. **Cleanup disconnects AND kills tweens.** Both resources need releasing.

### 1.3 IntersectionObserver vs ScrollTrigger — the decision

| Need                                                 | Tool            |
|------------------------------------------------------|-----------------|
| One-shot "fade in when visible"                      | IntersectionObserver + GSAP |
| Re-trigger on scroll back up                         | ScrollTrigger (`toggleActions`) |
| Scrub animation progress to scroll position          | ScrollTrigger (`scrub`)      |
| Pin an element during a scroll range                 | ScrollTrigger (`pin`)        |
| 10+ simple reveals on one page                       | IntersectionObserver (cheaper) |
| Complex multi-element sequenced timeline triggered   | ScrollTrigger                |

Rule of thumb: for a marketing page with 20 "fade in when I scroll to you" elements, `revealOnScroll` is 10x cheaper than ScrollTrigger and identical in outcome. For anything with scrubbing, pinning, or back-and-forth behaviour, use ScrollTrigger.

### 1.4 Using the action

```svelte
<script lang="ts">
	import { revealOnScroll } from '$lib/actions/revealOnScroll';
</script>

<section use:revealOnScroll={{ y: 40, duration: 0.7 }}>
	<h2>A section that fades in</h2>
</section>

<section use:revealOnScroll={{ y: 60, duration: 0.8, delay: 0.1 }}>
	<h2>A section that fades in slightly later</h2>
</section>
```

Each section gets its own observer. Browsers optimise multiple observers well; thousands of observed elements is not a performance concern.

### 1.5 Variations you might add

- **`from: 'left' | 'right'`** — animate horizontally instead of vertically.
- **`once: false`** — re-trigger on each intersection (rare).
- **`stagger: number`** — for elements inside the observed element, use gsap.utils.toArray and stagger children.

We keep the base action simple in this lesson; advanced variants are fine to layer on top.



## Going Deeper

**Official documentation:**
- [MDN: IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [GSAP docs: ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [web.dev: Intersection Observer](https://web.dev/articles/intersectionobserver)

**Advanced pattern:** Build the `use:revealOnScroll` action with IntersectionObserver + GSAP. Include the reduced-motion guard and the `gsap.set` for initial hidden state.

**Challenge question:** (Combines Lessons 7.12, 7.11, and 7.9) Build a long marketing page that uses `use:revealOnScroll` for 20 section reveals AND ScrollTrigger for one pinned hero section. Compare Performance tab recordings to see the cost difference.

## Deep Dive

**Why this matters at scale.** Scroll-reveal is the most common production animation. IntersectionObserver provides a lightweight alternative to ScrollTrigger for simple one-shot reveals.

**The mental model.** IntersectionObserver fires callbacks when intersection thresholds cross. Zero per-frame cost. ScrollTrigger is for scrub/pin. Observer is for one-shot reveals.

**Edge cases.** Threshold 0.1-0.2 is ideal for reveals. Elements above fold on load are already intersecting. Call unobserve() after first trigger for one-shot animations.

**Performance implications.** Creating 100 observers is efficient — browser batches calculations. Each has ~200 bytes memory cost. For 1000+ elements, use one observer with multiple targets.

**Connection to other modules.** Module 7.9 taught ScrollTrigger for complex animations. Module 12.6 teaches the general action pattern. Module 12.3 uses IntersectionObserver for lazy loading.

## 2. Style it — A long marketing page with a moss brand

The mini-build is a marketing page with a moss brand (`oklch(60% 0.1 140)`). A hero, four feature sections, a testimonial row, and a CTA. Every section uses `use:revealOnScroll` with slightly different parameters. Mobile-first.

## 3. Interact — Proving the cost difference

The page includes two versions in tabs — one using `use:revealOnScroll`, one using ScrollTrigger — and a Performance-tab note instructing the student to record a scroll on each. The IntersectionObserver version shows near-zero scroll cost; the ScrollTrigger version shows measurable ticker activity even though the visual result is the same.

## 4. Mini-build — `use:revealOnScroll` across a long page

**File:** `src/routes/modules/07-gsap/12-reveal-action/+page.svelte`
**Helper:** `src/lib/actions/revealOnScroll.ts`

The action file exports the implementation from section 1.2. The page applies it to every major block. Smooth performance, no leaks, works through SvelteKit navigation without needing `ScrollTrigger.refresh()`.

### DevTools verification

1. Scroll the page. Each section fades in as it enters the viewport.
2. Open Performance tab, record a scroll — very low ticker activity compared to a ScrollTrigger equivalent.
3. Navigate away and back — works instantly, no refresh needed.
4. Enable reduced motion — sections appear in their final state without animation.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is IntersectionObserver cheaper than ScrollTrigger for one-shot reveals?</summary>

IntersectionObserver is a native browser API that only fires when visibility thresholds are crossed. ScrollTrigger runs measurement and comparison logic on every scroll event, which is more work even when nothing needs to change.
</details>

<details>
<summary><strong>Q2.</strong> Why does the action call <code>gsap.set</code> synchronously before the observer fires?</summary>

To put the element into its hidden starting state immediately on mount, preventing a "flash of visible content" before the observer's first callback.
</details>

<details>
<summary><strong>Q3.</strong> Why call <code>observer.unobserve(node)</code> after the first intersection?</summary>

The reveal should happen once. Keeping the observer alive would waste cycles on an element that no longer needs observation.
</details>

<details>
<summary><strong>Q4.</strong> What two resources does the action's <code>destroy</code> method need to release?</summary>

The observer (via `observer.disconnect()`) and any active GSAP tweens on the node (via `gsap.killTweensOf(node)`).
</details>

<details>
<summary><strong>Q5.</strong> When should you NOT use this action and reach for ScrollTrigger instead?</summary>

When you need to scrub animation progress to scroll, pin elements, re-trigger on scroll-back, or sequence complex multi-element timelines. For those, ScrollTrigger is the right tool.
</details>

## 6. Common mistakes

- **No initial state.** Without `gsap.set` before the observer fires, the element flashes visible for a frame.
- **Forgetting `unobserve`.** Works but wastes cycles.
- **Missing cleanup.** Leaks observers and tweens on unmount.
- **Using ScrollTrigger for a simple reveal.** Cheaper tools exist for the cheap case.

## 7. What's next

Lesson 7.13 shows how GSAP and Svelte transitions coexist on the same page without conflict — a nuanced topic because both want to own an element's transform at the same time.
