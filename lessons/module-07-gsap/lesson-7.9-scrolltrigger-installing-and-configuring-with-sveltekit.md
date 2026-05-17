---
module: 7
lesson: 7.9
title: ScrollTrigger — installing and configuring with SvelteKit
duration: 40 minutes
prerequisites:
  - Lesson 7.7 (cleanup)
  - Lesson 7.8 (stagger)
learning_objectives:
  - Import ScrollTrigger from `gsap/ScrollTrigger` and register it with `gsap.registerPlugin`
  - Trigger a tween when an element enters the viewport using `scrollTrigger: { trigger, start }`
  - Scrub a tween to scroll position using `scrub: true` and `scrub: 1`
  - Pin an element to the viewport during a scroll range
  - Keep ScrollTrigger SSR-safe by registering only inside `$effect`
status: ready
---

# Lesson 7.9 — ScrollTrigger — installing and configuring with SvelteKit

## 1. Concept — Scroll is just another clock

Up to now, every animation we have written has run on a time-based clock: you call it, it starts at `t = 0`, and at `t = duration` it finishes. **ScrollTrigger** replaces that clock with the user's scroll position. Instead of "this animation takes 1 second", you say "this animation starts when the top of this element hits 80% of the viewport and finishes when the bottom hits 20%". The browser's scroll position becomes the playhead. Scroll up and down and the animation scrubs forwards and backwards.

This is the feature that turns a flat page into an interactive experience — feature cards that rotate in as you scroll past them, hero images that pin while text slides alongside, progress bars tied to page depth. It is also the single most abused plugin in the GSAP ecosystem. Lesson 7.9 teaches the restraint first, the mechanics second.

### 1.1 Importing and registering

ScrollTrigger is a separate module you import from `gsap/ScrollTrigger`. You also have to *register* it with GSAP so GSAP recognises its own plugin:

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
```

**Register it exactly once per page**, ideally inside the first `$effect` that uses it. Calling `registerPlugin` multiple times is harmless but pointless. In SSR, the import is safe (ScrollTrigger guards against missing `window`) but **calling `registerPlugin` at module top level is not recommended** — it triggers DOM work that wastes CPU on the server. Register inside effects.

### 1.2 The simplest scroll-triggered tween

```ts
gsap.from(card, {
	y: 60,
	opacity: 0,
	duration: 0.8,
	ease: 'power2.out',
	scrollTrigger: {
		trigger: card,
		start: 'top 80%'
	}
});
```

The `scrollTrigger` property on a tween turns the tween into a scroll-triggered animation. The `trigger` is the element whose position defines when the animation runs. The `start` string is two tokens: *"where on the trigger"* and *"where on the viewport"*. `'top 80%'` means "when the top of the trigger reaches 80% down the viewport". Other useful starts: `'center center'`, `'top top'`, `'bottom 20%'`.

### 1.3 `end` and `scrub`

By default a scroll-triggered tween plays when it enters and stays. Adding `end` and `scrub` ties progress to scroll position:

```ts
gsap.to(hero, {
	y: 300,
	scrollTrigger: {
		trigger: hero,
		start: 'top top',
		end: 'bottom top',
		scrub: true
	}
});
```

With `scrub: true`, the animation progress mirrors scroll position exactly — scroll halfway through the range and the animation is at 50%. With `scrub: 1` (a number), the animation lags behind scroll by 1 second, which feels smoother.

### 1.4 `pin` — stick an element while scrolling

```ts
gsap.to(hero, {
	scrollTrigger: {
		trigger: hero,
		start: 'top top',
		end: '+=800',
		pin: true,
		scrub: 1
	}
});
```

`pin: true` locks the trigger element in place (position: fixed under the hood) until the scroll reaches `end`. Combined with scrub, this creates the classic "scroll-locked story section" effect. Use sparingly — every pinned element breaks the natural scroll rhythm of the page.

### 1.5 `markers: true` during development

```ts
scrollTrigger: {
	trigger: card,
	start: 'top 80%',
	end: 'bottom 20%',
	markers: true // red/green lines drawn on the page
}
```

Visible markers make it possible to see exactly where `start` and `end` resolve to on the page. Remove before production.

### 1.6 ScrollTrigger and `gsap.context`

ScrollTriggers created inside a `gsap.context` are registered with the context and cleaned up by `ctx.revert()` along with every other tween. That is the whole reason context exists — without it, a page with ten scroll triggers would need ten manual `.kill()` calls on navigation.

```ts
$effect(() => {
	const ctx = gsap.context(() => {
		gsap.registerPlugin(ScrollTrigger);
		gsap.from('.section', {
			y: 40,
			opacity: 0,
			stagger: 0.1,
			scrollTrigger: { trigger: '.section', start: 'top 80%' }
		});
	}, pageRoot);
	return () => ctx.revert();
});
```

### 1.7 SSR safety checklist

1. Imports at module top are fine.
2. **`registerPlugin` inside `$effect`** — not at top of script.
3. **All ScrollTrigger objects inside `gsap.context`** — so cleanup kills them.
4. **Cleanup with `ctx.revert()`** in the effect return — not `ScrollTrigger.killAll()`, which kills triggers from other components too.

### 1.8 Reduced motion for ScrollTrigger

ScrollTrigger has a dedicated helper for this exact case:

```ts
ScrollTrigger.matchMedia({
	'(prefers-reduced-motion: no-preference)': () => {
		gsap.from('.section', { y: 40, opacity: 0, scrollTrigger: { trigger: '.section' } });
	}
});
```

The code inside the media-query block only runs when the user does **not** prefer reduced motion. If they do, the animations are skipped entirely and the section appears in its natural state. This is cleaner than sprinkling `prefersReducedMotion.current` checks throughout.

> **Note:** `ScrollTrigger.matchMedia` works but `gsap.matchMedia()` is the newer, more flexible API. Both are valid in April 2026.





### The TypeScript angle

The `scrollTrigger` property on `TweenVars` is typed with `trigger`, `start`, `end`, `scrub`, `pin`, `markers` fields.

> **In production sidebar.** On a 100K-daily-user product page, ScrollTrigger markers during development revealed that `start: "top top"` fired before the hero image loaded. Switching to `"top 80%"` and adding a refresh on image load fixed the alignment.

### Common interview question

**Q: What does `scrub: true` in GSAP ScrollTrigger do?**

**Model answer:** It ties animation progress directly to scroll position. Scroll halfway through the trigger range and the animation is at 50%. `scrub: 1` adds a 1-second smoothing lag. Without scrub, ScrollTrigger simply plays the animation when the trigger enters the viewport.

## Going Deeper

**Official documentation:**
- [GSAP docs: ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP: ScrollTrigger start/end](https://gsap.com/docs/v3/Plugins/ScrollTrigger/start)
- [GSAP: ScrollTrigger demos](https://gsap.com/scroll/)

**Advanced pattern:** Build a scroll-driven article with 4 reveal sections and a pinned hero with parallax. Use `markers: true` during development.

**Challenge question:** (Combines Lessons 7.9, 7.7, and 7.4) Build a scroll-driven timeline that sequences 5 elements with overlapping reveals. Pin the first section while the rest scroll past. Clean up with `gsap.context`. Add `ScrollTrigger.matchMedia` for reduced motion.

## Deep Dive

**Why this matters at scale.** Scroll-driven animation is the most requested feature. ScrollTrigger connects GSAP to scroll position for parallax, reveal, progress indicators, and pinned sections.

**The mental model.** ScrollTrigger observes scroll position relative to trigger elements. Start/end positions are viewport-relative: 'top center' means trigger's top reaches viewport center.

**Edge cases.** ScrollTrigger caches positions on creation. DOM changes invalidate caches. Call ScrollTrigger.refresh() after content changes. In SvelteKit, also refresh after navigation.

**Performance implications.** Scroll listener uses passive events and rAF batching. Each trigger costs one getBoundingClientRect() per scroll frame. Use ScrollTrigger.batch() for 100+ elements.

**Connection to other modules.** Module 6.10 taught CSS scroll-driven animation. Module 7.10 addresses SvelteKit cleanup. Module 7.12 builds a reusable scroll-reveal action.

## 2. Style it — A long-form article with scroll-triggered section reveals

The mini-build is a fictional article with a graphite brand (`oklch(50% 0.06 260)`). Four sections: intro, body-1, body-2, conclusion. Each section's h2 and first paragraph animate in as the section enters the viewport. The hero image pins with a slow parallax (`scrub: 1`). Mobile-first.

## 3. Interact — Why the markers are invaluable

The first draft omits `markers: true`. When the animations "don't run", the student cannot tell if the trigger is too late, too early, or misaligned. Adding `markers: true` draws the start and end lines, and the problem is obvious: the start was `'top top'` but the section's top enters the viewport before you scroll at all. Changing to `'top 80%'` fixes it.

## 4. Mini-build — Scroll-driven article

**File:** `src/routes/modules/07-gsap/09-scrolltrigger/+page.svelte`

A tall article with a hero, four sections, and a footer. `$effect` creates a `gsap.context`, registers ScrollTrigger, sets up one tween per section, and pins the hero. `return () => ctx.revert()` for cleanup. Markers are on by default in the mini-build so students see them.

### DevTools verification

1. Scroll slowly. Watch the red/green marker lines on the right edge of the viewport; each section's tween runs when the green start line crosses into view.
2. Scroll back up. Sections animate in reverse (that is the `toggleActions` default).
3. Open Console. Paste `ScrollTrigger.getAll().length` — should match the number of triggers on the page.
4. Navigate away and back; paste the same — should be the same number (not doubled), proving `ctx.revert()` cleaned up.
5. Enable reduced motion — all reveals are skipped and the page is static. The pin is also removed.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the <code>start: 'top 80%'</code> expression saying?</summary>

"When the *top of the trigger element* reaches *80% down the viewport*, start the animation." The first token is a position on the trigger; the second is a position on the viewport.
</details>

<details>
<summary><strong>Q2.</strong> What does <code>scrub: true</code> do?</summary>

Ties the animation progress directly to the scroll position in the trigger range. Scroll half way and the animation is half done. `scrub: 1` adds a one-second lag for a smoother feel.
</details>

<details>
<summary><strong>Q3.</strong> Why must ScrollTrigger be created inside a <code>gsap.context</code>?</summary>

So that <code>ctx.revert()</code> kills all ScrollTriggers alongside tweens and timelines when the component unmounts. Otherwise each trigger persists and starts firing on unrelated pages after navigation.
</details>

<details>
<summary><strong>Q4.</strong> What does <code>pin: true</code> do?</summary>

Locks the trigger element in its current viewport position (as if `position: fixed`) during the scroll range defined by <code>start</code> and <code>end</code>. Combined with scrub, this creates scroll-locked story sections.
</details>

<details>
<summary><strong>Q5.</strong> How do you use ScrollTrigger with reduced motion?</summary>

Either check `prefersReducedMotion.current` and skip creating the triggers, or use `ScrollTrigger.matchMedia` / `gsap.matchMedia` with a `'(prefers-reduced-motion: no-preference)'` block that only runs for users without the preference.
</details>

## 6. Common mistakes

- **Registering the plugin at module top.** SSR safety; register inside `$effect`.
- **No cleanup.** Triggers persist across navigation and wreck the next page.
- **Forgetting markers during dev.** You will chase invisible "why isn't it firing" bugs for hours.
- **Over-pinning.** Every pinned section breaks scroll; one or two per page is plenty.

## 7. What's next

Lesson 7.10 handles a subtle issue: when SvelteKit navigates, the DOM changes while ScrollTrigger's internal caches still reference the old page. We fix it with `afterNavigate`, `ctx.revert()`, and `ScrollTrigger.refresh()`.
