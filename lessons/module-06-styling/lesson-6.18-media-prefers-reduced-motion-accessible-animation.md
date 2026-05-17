---
module: 6
lesson: 6.18
title: "@media (prefers-reduced-motion: reduce) — accessible animation"
duration: 30 minutes
prerequisites:
  - Lesson 6.10 (CSS transitions)
  - Lesson 6.11 (Svelte transitions)
  - Lesson 6.14 (Tween)
  - Lesson 6.15 (Spring)
learning_objectives:
  - Explain who benefits from reduced motion and why it is a WCAG requirement
  - Use the PE7 global CSS reset for automatic CSS-transition safety
  - Use `prefersReducedMotion` from `svelte/motion` for per-component JS decisions
  - Write a component that has three motion tiers: full, reduced, and none
  - Audit a page for motion accessibility in under two minutes
status: ready
---

# Lesson 6.18 — `@media (prefers-reduced-motion: reduce)` — accessible animation

## 1. Concept — Some users cannot safely experience your animations

Animation is not a universal good. For some users — people with vestibular disorders such as Meniere's disease, people with attention differences, people on older hardware where animation stutters — the moving, scaling, sliding things on a page cause real problems. At best: distraction. At worse: nausea, disorientation, migraine. Since 2017, operating systems have provided a way for these users to opt out globally. It is called **Reduce Motion**, and your app must respect it.

The web platform exposes the preference through a CSS media query: `@media (prefers-reduced-motion: reduce)`. When this query matches, the user has asked every app on their device to tone down the motion. Respecting this query is a **WCAG 2.1 Success Criterion (2.3.3 Animation from Interactions, Level AAA)** and a legal requirement in many jurisdictions under accessibility law.

### 1.1 What "reduced" means

"Reduced motion" does not mean "no motion ever". It means **replace large or continuous motion with instant or small motion**. The user still wants feedback — a button press should still feel like a press. They do not want a hero image parallaxing across the screen as they scroll, or a modal scaling up from 0 to 1 with a bouncy overshoot. Three tiers:

- **Full motion** — the default. Decorative and functional animation both run.
- **Reduced motion** — functional animation still runs (button feedback, focus indicators, state changes) but large moves collapse to instant or cross-fade.
- **No motion** — the nuclear option you use only in rare cases where even a crossfade is too much. Normally you do not need this tier.

### 1.2 Two lines of defence

PE7 gives you two complementary mechanisms:

**(1) The global CSS reset (already in `app.css`)**

```css
@layer animations {
	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
			scroll-behavior: auto !important;
		}
	}
}
```

This handles every *CSS* transition and *CSS* keyframe animation automatically. If you write `transition: transform var(--dur-base) var(--ease-out)` on a hover effect, reduced-motion users get a 0.01ms collapse without you writing another line. That covers the majority of micro-interactions in a real app.

**(2) The `prefersReducedMotion` reactive helper (Svelte 5.7+)**

```ts
import { prefersReducedMotion } from 'svelte/motion';

const reduced = $derived(prefersReducedMotion.current);
```

This is a reactive boolean you read inside your components to make JavaScript-side decisions. The CSS reset cannot reach into:

- **Svelte `transition:` / `in:` / `out:` directives** — they are driven by JS, their duration parameter is a number not a CSS property.
- **`svelte/motion` Tween and Spring** — pure JS animation.
- **GSAP, ScrollTrigger, Threlte, and other JS animation libraries** — covered in Module 7.

For those, you read `prefersReducedMotion.current` and short-circuit parameters yourself.

### 1.3 The three-tier pattern

The reference pattern every animated component in this course follows:

```svelte
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);
	const motion = $derived({
		y: reduced ? 0 : 20,
		duration: reduced ? 0 : 400,
		easing: cubicOut
	});
</script>

{#if visible}
	<div transition:fly={motion}>Content</div>
{/if}
```

The `motion` derived object is the single source of truth for that component's animation parameters. If you need a "no motion" tier, you also gate the entire `transition:` directive behind a conditional.

### 1.4 Testing the preference

You do not need to change your OS settings to test reduced motion. DevTools provides an override:

- **Chrome / Edge** — Command menu (`Ctrl/Cmd + Shift + P`) → *Emulate CSS media feature prefers-reduced-motion* → *reduce*.
- **Firefox** — Accessibility panel → Simulate → Reduce motion.
- **Safari** — Develop menu → Feature Flags → Reduced Motion.

Every animated component you build should be tested with the override enabled at least once before you consider it done.

### 1.5 Accessibility beyond the flag

Reduced motion is the big-ticket accessibility item for animation, but it is not the only one. Also consider:

- **Focus indicators** must still be visible. If your hover animation also serves as focus feedback, make sure `:focus-visible` gets the same styles.
- **No flashes faster than 3Hz.** Anything that blinks or strobes faster than 3 times per second risks triggering seizures in photosensitive users — WCAG 2.3.1, non-negotiable.
- **Pause-able animation.** If your component has a loop (carousel, marquee), give users a way to pause it.
- **Touch targets 44×44 CSS pixels.** Not a motion thing exactly, but it goes on the same checklist.



## Going Deeper

**Official documentation:**
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Svelte docs: prefersReducedMotion](https://svelte.dev/docs/svelte/svelte-motion#prefersReducedMotion)
- [WCAG 2.3.3: Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions)

**Advanced pattern:** Build a "motion preference viewer" that displays the current OS preference in real time and shows two animations side by side: one CSS transition and one Svelte transition. Toggle the preference in DevTools and verify both respond.

**Challenge question:** (Combines Lessons 6.18, 6.11, and 6.14) Build a dashboard page with 3 animated widgets: a CSS-transitioned hover card, a Svelte-transitioned modal, and a Tweened progress counter. Add the reduced-motion two-layer defence. Verify with DevTools emulation that all three collapse to instant under reduced motion.

## 2. Style it — A toggle that demonstrates both tiers

The mini-build has a red brand (`oklch(62% 0.22 25)`) and a single interactive card that demonstrates three things: a CSS transition on hover (handled by the global reset), a Svelte transition on a show/hide toggle (handled by `prefersReducedMotion.current`), and a visible banner that updates live to display the current preference state. Toggle targets are 44px.

## 3. Interact — Reactive motion preference in action

The banner at the top of the page reads "Reduced motion: on" or "off" and updates live the moment the OS preference changes. This is a direct read of `prefersReducedMotion.current` through a `$derived`. The card below animates differently depending on the state, and the toggle button shows the feature from both sides.

## 4. Mini-build — Motion preference viewer

**File:** `src/routes/modules/06-styling/18-reduced-motion/+page.svelte`

Top: a banner showing the current value of `prefersReducedMotion.current`. Middle: a card that lifts on hover (CSS) and slides in/out on toggle (Svelte transition). Bottom: three parameter rows showing the *actual* duration and distance being applied in each motion tier. Toggle reduced motion in DevTools and watch the numbers and the animations change without a reload.

### DevTools verification

1. Open DevTools → **Rendering** → check *Emulate CSS media feature prefers-reduced-motion: reduce*. The banner flips to "on" immediately. Hover the card — the lift happens instantly (CSS reset). Click the toggle — the Svelte transition collapses to 0ms.
2. Uncheck the emulation. Banner flips back, hover lift animates over 300ms, toggle slides over 400ms.
3. Confirm the hover lift still works in reduced mode (it just happens instantly) — this is the "instant feedback" behaviour we want, not "no feedback at all".

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is "reduced motion" not the same as "no motion"?</summary>

Users still want functional feedback (button presses, focus indicators, state changes). What they want to avoid is large, continuous, or decorative motion — parallax, hero zooms, bouncy overshoots. Reduced motion replaces those with instant or crossfade alternatives.
</details>

<details>
<summary><strong>Q2.</strong> Which animations are NOT handled by the PE7 global CSS reset?</summary>

Svelte `transition:` / `in:` / `out:` directives, `Tween` and `Spring` from `svelte/motion`, GSAP, ScrollTrigger, Threlte, and any other JS-driven animation. The reset only touches CSS transition and animation durations.
</details>

<details>
<summary><strong>Q3.</strong> How do you read the current reduced-motion preference reactively in a Svelte 5 component?</summary>

Import `prefersReducedMotion` from `svelte/motion` and read `prefersReducedMotion.current`. Wrap it in a `$derived` if you need to compose it into an object. The value updates automatically when the OS preference changes.
</details>

<details>
<summary><strong>Q4.</strong> What is the WCAG Success Criterion that covers animation from interactions?</summary>

WCAG 2.1 Success Criterion 2.3.3 (Animation from Interactions, Level AAA). There is also 2.3.1 (Three Flashes or Below Threshold, Level A) which is about seizure risk from rapid flashing.
</details>

<details>
<summary><strong>Q5.</strong> What is the fastest way to test reduced motion without changing OS settings?</summary>

Use the browser DevTools emulator. In Chrome, open the Command menu and run *Emulate CSS media feature prefers-reduced-motion: reduce*. Toggle on and off to verify your component responds reactively.
</details>

## 6. Common mistakes

- **Assuming the CSS reset covers JS animation.** It does not. Svelte transitions, Tween, Spring, GSAP all need explicit handling.
- **Gating the entire animation to zero instead of reducing.** Losing all feedback is worse than full animation. Instant or crossfade is the right replacement for most things.
- **Testing once and forgetting.** Every new feature should be tested with reduced motion on before it ships. Add the check to your PR checklist.
- **Hard-coding the preference.** Do not read the preference once at mount time. Use the reactive `prefersReducedMotion.current` so the UI adapts live.

## 7. What's next

Module 6 ends here. Module 7 begins with GSAP — a professional animation library that picks up exactly where Svelte's built-ins leave off, for animations that need precise sequencing, scroll-driven behaviour, and GPU-accelerated timelines.
