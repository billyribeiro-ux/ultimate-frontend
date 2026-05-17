---
module: 7
lesson: 7.3
title: gsap.to(), gsap.from(), gsap.fromTo()
duration: 35 minutes
prerequisites:
  - Lesson 7.2 (installing GSAP)
learning_objectives:
  - Write a one-line `gsap.to()` animation targeting a DOM element
  - Use `gsap.from()` for reveal animations where the final state is the natural one
  - Use `gsap.fromTo()` when neither side of the animation matches the element's current state
  - Configure common options: `duration`, `delay`, `ease`, `stagger`, `onComplete`
  - Pick the right form out of the three based on the problem
status: ready
---

# Lesson 7.3 — `gsap.to()`, `gsap.from()`, `gsap.fromTo()`

## 1. Concept — Three functions, three starting assumptions

Almost every GSAP animation you will ever write comes down to one of three function calls: `gsap.to`, `gsap.from`, or `gsap.fromTo`. They differ only in where the animation *starts* and *ends* — and once you internalise those differences, the rest of GSAP feels obvious.

### 1.1 `gsap.to(target, vars)` — animate TO a new state

`to` starts from the element's **current** state and animates to the values you specify.

```ts
import { gsap } from 'gsap';

gsap.to('.card', {
	x: 100,
	opacity: 0.5,
	duration: 1,
	ease: 'power2.out'
});
```

Read aloud: *"take whatever `.card` is right now and animate it over 1 second to `x: 100` and `opacity: 0.5` using the power2.out easing"*. Use `to` for any animation where the *final* state is the interesting one and the starting state is "wherever the element already is". Examples: moving a card to a new position, fading an element out, scaling something up on hover.

### 1.2 `gsap.from(target, vars)` — animate FROM a state to the current

`from` is the reverse: the **final** state is the element's current state, and the `vars` you pass describe the **starting** state.

```ts
gsap.from('.card', {
	x: -100,
	opacity: 0,
	duration: 1,
	ease: 'power2.out'
});
```

Read aloud: *"put `.card` at x: -100 and opacity: 0, then animate it over 1 second to wherever CSS says it should naturally be"*. Use `from` for **reveal** animations — the element's final position is already set correctly by CSS, and you just want to animate it into view. This is the most common GSAP pattern on marketing pages.

### 1.3 `gsap.fromTo(target, fromVars, toVars)` — both ends explicit

When neither side of the animation matches the element's natural state, use `fromTo`. It takes two vars objects: the first describes the starting state, the second describes the ending state *and* the animation options.

```ts
gsap.fromTo(
	'.card',
	{ x: -200, opacity: 0 },
	{ x: 200, opacity: 1, duration: 1, ease: 'power2.out' }
);
```

Use `fromTo` when you want full control over both ends. Example: a card swipe gesture that animates from off-screen left to off-screen right, passing through centre.

### 1.4 Target syntax

GSAP accepts three kinds of targets:

- **A CSS selector string** — `'.card'`, `'.card.active'`, `'#hero h1'`. GSAP runs `document.querySelectorAll` to resolve it. Fast but couples your JS to your class names.
- **A DOM element** — an `HTMLElement` you obtained via `bind:this` (Lesson 7.5). **This is the Svelte-idiomatic approach.** Scoped, refactor-safe, impossible to accidentally grab an element from another component.
- **An array of elements** — from `document.querySelectorAll` or `gsap.utils.toArray()`. Useful for staggered animations on many items.

In this course we **always prefer DOM element references** obtained via `bind:this`, because class selectors break when components are nested or reused. Lesson 7.5 dedicates itself to that pattern.

### 1.5 Common options

Every GSAP `vars` object can include these in addition to the animated properties:

- **`duration`** — seconds (not milliseconds, unlike Svelte transitions). Default is 0.5.
- **`delay`** — seconds before the animation starts.
- **`ease`** — a string like `'power2.out'`, `'back.out(1.7)'`, `'elastic.out(1, 0.3)'`. Cheat sheet: `power1.out` is the gentlest, `power4.out` the sharpest, `back.out(n)` overshoots by n, `elastic.out` bounces.
- **`stagger`** — only relevant when target is multiple elements; covered in Lesson 7.8.
- **`onStart`, `onUpdate`, `onComplete`** — callback hooks.
- **`repeat`**, **`yoyo`** — for looping animations.

### 1.6 Which properties can GSAP animate?

GSAP will happily animate almost any CSS property: `transform` properties (`x`, `y`, `scale`, `rotation`), `opacity`, `color`, `backgroundColor`, `width`, `height`, SVG attributes, and custom CSS variables. The shorthand props `x`, `y`, `scale`, `rotation` live on GSAP's own layer and are written to `transform` on the element. Prefer those — they are the fastest and composited.

### 1.7 Reduced motion at the top of every GSAP block

Every `gsap.to`/`from`/`fromTo` call in this course is preceded by a reduced-motion check:

```ts
import { prefersReducedMotion } from 'svelte/motion';

if (prefersReducedMotion.current) {
	gsap.set(el, { x: 0, opacity: 1 }); // jump to final state
} else {
	gsap.from(el, { x: -100, opacity: 0, duration: 0.6 });
}
```

`gsap.set()` is a zero-duration assignment — useful for putting an element in its "final" state without animating.



## Going Deeper

**Official documentation:**
- [GSAP docs: gsap.to()](https://gsap.com/docs/v3/GSAP/gsap.to())
- [GSAP docs: gsap.from()](https://gsap.com/docs/v3/GSAP/gsap.from())
- [GSAP docs: gsap.fromTo()](https://gsap.com/docs/v3/GSAP/gsap.fromTo())

**Advanced pattern:** Build a 3-panel demo where each panel demonstrates one method. Include a "Replay" button that resets and re-runs each animation.

**Challenge question:** (Combines Lessons 7.3, 7.5, and 5.1) Build a card that uses `gsap.from` for its entrance reveal (triggered by `bind:this` + `$effect`), `gsap.to` for a hover lift (triggered by `onpointerenter`/`onpointerleave`), and `gsap.set` for the reduced-motion fallback. Type all event handlers correctly.

## Deep Dive

**Why this matters at scale.** gsap.to is 90% of usage. from() handles entrance animations. fromTo() gives full control. Wrong method causes FOUC bugs.

**The mental model.** to() animates from current to target. from() sets values then animates back to CSS state. fromTo() defines both endpoints. from() trap: element briefly shows CSS state before jumping.

**Edge cases.** from() causes FOUC on first render. Run from() in $effect that fires after mount. Calling gsap.to() on unmounted element returns a tween targeting nothing.

**Performance implications.** Each tween creates ~0.5KB object. For 100+ simultaneous tweens, use timelines with stagger instead of individual calls.

**Connection to other modules.** Module 6 taught Svelte transitions. Module 7.4 chains tweens into timelines. Module 7.5 teaches bind:this for DOM references.

## 2. Style it — Three rows, three GSAP methods, one rose brand

The mini-build uses a rose brand hue (`oklch(70% 0.2 15)`). Three rows, one per method. Each row has a coloured box and a "Run" button. Clicking the button triggers the corresponding `gsap.to`/`gsap.from`/`gsap.fromTo` on that box. Buttons are 44px tall. Mobile-first: rows stack in a single column.

## 3. Interact — Running GSAP from a button click (with cleanup preview)

The student's first GSAP code in this course lives inside a button click handler. No `bind:this` yet — we use scoped selectors limited to the component with `#section-to .box`, etc. — and no cleanup logic, because a click-triggered animation finishes on its own. Lesson 7.5 introduces element refs; Lesson 7.7 introduces cleanup. Keep the first example simple.

## 4. Mini-build — `to`/`from`/`fromTo` side by side

**File:** `src/routes/modules/07-gsap/03-to-from-fromto/+page.svelte`

Three `<section>` blocks, each containing a `<div>` with a unique id and a `<button>`. Section A runs `gsap.to('#box-a', { x: 200, … })`. Section B runs `gsap.from('#box-b', { y: -50, opacity: 0, … })`. Section C runs `gsap.fromTo('#box-c', { scale: 0 }, { scale: 1, rotation: 360, … })`. Each section includes a short caption explaining why it uses that particular method.

### DevTools verification

1. Click Run on Section A. Watch the `transform` on `#box-a` in the Styles panel change from `matrix(1, 0, 0, 1, 0, 0)` to a translated matrix over 1 second.
2. Section B — before clicking, the box is at its natural position. Click Run and watch the box *jump* up and fade out, then animate back. That jump-to-start is `gsap.from`'s defining behaviour.
3. Section C — the box starts at scale(0) (invisible) and animates to scale(1) while rotating 360 degrees.
4. Enable reduced motion in DevTools → Rendering. Click Run again. The animation is replaced with an instant `gsap.set` — no motion, correct final state.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between <code>gsap.to</code> and <code>gsap.from</code>?</summary>

`to` animates from the element's current state to the values you provide. `from` animates from the values you provide to the element's current state — you describe the starting state, GSAP figures out the end.
</details>

<details>
<summary><strong>Q2.</strong> When should you reach for <code>gsap.fromTo</code> instead of <code>to</code> or <code>from</code>?</summary>

When neither the starting state nor the ending state matches the element's natural CSS position. For example, an element that flies from off-screen left to off-screen right.
</details>

<details>
<summary><strong>Q3.</strong> Why prefer <code>x</code> and <code>y</code> over <code>left</code> and <code>top</code>?</summary>

`x` and `y` are GSAP shortcuts that write to `transform`, which is composited on the GPU. `left` and `top` trigger layout on every frame and cause jank.
</details>

<details>
<summary><strong>Q4.</strong> What does <code>gsap.set(el, { opacity: 1 })</code> do?</summary>

It applies the values instantly with zero duration — no animation. Use it to jump an element to its final state, for example when honouring reduced motion.
</details>

<details>
<summary><strong>Q5.</strong> Why prefer an element reference from <code>bind:this</code> over a CSS selector string?</summary>

CSS selector strings couple your JS to your class names and can accidentally match elements in other components. An element reference is scoped to exactly the node you want and survives refactoring.
</details>

## 6. Common mistakes

- **Forgetting that `duration` is in seconds.** CSS and Svelte use milliseconds; GSAP uses seconds. `duration: 300` animates for five minutes.
- **Using `from` when you meant `to`.** Because `from` describes the *start* state, it is easy to confuse. If the element "jumps" before animating back, you are using `from`.
- **Animating `left`/`top`.** Always use `x`/`y`.
- **Ignoring reduced motion.** GSAP runs in JavaScript and is invisible to the global CSS reset. Check `prefersReducedMotion.current`.

## 7. What's next

Lesson 7.4 chains multiple animations together using GSAP timelines.
