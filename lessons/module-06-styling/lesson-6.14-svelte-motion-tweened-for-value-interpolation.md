---
module: 6
lesson: 6.14
title: svelte/motion — tweened for value interpolation
duration: 40 minutes
prerequisites:
  - Lesson 2.1 (`$state`)
  - Lesson 6.11 (Svelte transitions)
learning_objectives:
  - Explain what a tween is and why it is different from a CSS transition
  - Use the `Tween` class from `svelte/motion` (Svelte 5.8+)
  - Use the legacy `tweened()` function and explain when it is still useful
  - Pass `duration`, `easing`, and `interpolate` options to customise a tween
  - Bind a tween's `.current` value to template interpolation and to CSS custom properties
status: ready
---

# Lesson 6.14 — `svelte/motion` — `tweened` for value interpolation

## 1. Concept — Animating numbers, not elements

So far every motion tool we have met animates DOM *elements*. CSS transitions animate an element's CSS properties; Svelte transitions animate an element's mount/unmount; `animate:flip` animates an element's position. But sometimes the thing you want to animate is not an element at all — it is a **raw value** inside your JavaScript: a number, a colour, a set of coordinates, a progress bar fill. You want that value to move smoothly from its old state to its new state over, say, 400 milliseconds, and you want your template to re-render with every intermediate value.

This is what `svelte/motion` provides. The module exports a small set of utilities that let you wrap a value in a "motion primitive" and then write new targets to it. The primitive interpolates from the current value to the target value over time, and Svelte's reactivity picks up every intermediate step and re-renders the template. The result: a number that counts up, a progress bar that fills smoothly, a counter that does not "pop" from one value to the next.

The two motion primitives are **Tween** (time-based interpolation, exact duration) and **Spring** (physics-based, reacts to velocity). Tween is the subject of this lesson; Spring is Lesson 6.15.

### 1.1 The Svelte 5.8+ class API — `Tween`

Since Svelte 5.8, the preferred API is a class called `Tween`:

```ts
import { Tween } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

const progress = new Tween(0, {
	duration: 400,
	easing: cubicOut
});
```

`Tween` is a class with two important members:

- **`.target`** — the destination value. Assigning to `.target` starts the tween. Reading it returns the destination (not the current interpolated value).
- **`.current`** — the *current* interpolated value. This is what you use in the template. It is a reactive getter, so Svelte re-renders when it changes.

```svelte
<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const progress = new Tween(0, { duration: 400, easing: cubicOut });

	function advance(): void {
		progress.target = progress.target + 10;
	}
</script>

<button onclick={advance}>Advance</button>
<p>{progress.current.toFixed(1)}%</p>
```

Every click bumps the target by 10 and the displayed value smoothly interpolates to it over 400ms. You never write the intermediate frames — the Tween does.

### 1.2 The legacy function API — `tweened()`

Before Svelte 5.8, the same feature was provided by a function called `tweened()` that returns a Svelte store. The function is **still exported** and still works; it is marked deprecated in the docs but the deprecation is soft and the function is not going away in the Svelte 5 line.

```ts
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

const progress = tweened<number>(0, {
	duration: 400,
	easing: cubicOut
});

// later
progress.set(10);
```

Because it returns a store, you access the current value in the template with the `$` auto-subscribe prefix: `{$progress.toFixed(1)}%`. You still see this form in older codebases and in libraries that were written before 5.8. Know both forms.

**Which one to reach for in April 2026:** prefer the `Tween` class for new code — it is more ergonomic, it composes with runes, and it has a cleaner `.current` / `.target` split. Use `tweened()` only when you need store compatibility (e.g. interop with an older library that expects a readable store).

### 1.3 Options

Both APIs accept the same options:

- **`duration`** — total animation time in ms, or a function `(from, to) => ms` that computes the duration based on how far you are travelling.
- **`delay`** — ms before the animation starts.
- **`easing`** — an easing function from `svelte/easing` (cubicOut, quintOut, etc.).
- **`interpolate`** — a custom interpolation function for non-numeric values. For colours, arrays, or objects you supply your own `(a, b) => (t) => value` function.

### 1.4 Interpolating non-numbers

Numbers and arrays of numbers interpolate out of the box. For a colour, you provide an `interpolate` function. A simple one for RGB tuples:

```ts
const bg = new Tween<[number, number, number]>([30, 30, 30], {
	duration: 500,
	easing: cubicOut,
	interpolate: (a, b) => (t) => [
		a[0] + (b[0] - a[0]) * t,
		a[1] + (b[1] - a[1]) * t,
		a[2] + (b[2] - a[2]) * t
	]
});
```

Then in the template you read `bg.current` and render `rgb(${bg.current.join(',')})`.

### 1.5 Driving CSS custom properties

The most powerful use of a tween is to drive a **CSS custom property** that downstream styles consume. You set `--progress: {progress.current}%` on an element inline, and your CSS reads `var(--progress)` in many places. One source of truth, one animated value, many visual effects.

### 1.6 Reduced motion

Tweens are JS-driven and bypass the global CSS reset. Pass `duration: 0` when `prefersReducedMotion.current` is true:

```ts
const duration = $derived(prefersReducedMotion.current ? 0 : 400);
const progress = new Tween(0, { duration, easing: cubicOut });
```

Since `duration` can also be a function, an even cleaner version is `duration: () => prefersReducedMotion.current ? 0 : 400`.

## 2. Style it — An animated progress ring with a purple brand

The mini-build is a circular progress ring with a purple brand hue (`oklch(65% 0.22 295)`). Advance and reset buttons (44px tall) modify the target; the ring fills smoothly via an SVG stroke-dasharray bound to `progress.current`. The ring is 200px wide on mobile and scales up to 280px at `min-width: 480px`.

## 3. Interact — Why `$state` alone cannot solve this

The first draft wires a plain `let progress = $state(0)` to the SVG stroke. Clicking "advance" increments it by 10 — and the ring *snaps* to the new value. No animation. The reason is that `$state` is a *discrete* value: it holds exactly one number at a time, and writing a new number causes an immediate re-render. There are no intermediate values.

The fix is to wrap the number in a `Tween`. Now writing to `.target` instructs the Tween to interpolate `current` over time, and Svelte re-renders on every frame of the interpolation. This lesson shows both the class API (`new Tween(0, …)`) and the legacy function API (`tweened(0, …)`) side-by-side so the student can read both when they encounter them in the wild.

## 4. Mini-build — A dual-API progress ring

**File:** `src/routes/modules/06-styling/14-tweened/+page.svelte`

The page renders two progress rings side-by-side. The left ring uses `new Tween(0, { duration: 600, easing: cubicOut })` (class API). The right ring uses `tweened(0, { duration: 600, easing: cubicOut })` (function API). Both advance by 10% per button click. The student can visually confirm they behave identically.

### DevTools verification

1. Open DevTools → **Elements** and select the SVG `<circle>` element.
2. Click "Advance" and watch the `stroke-dashoffset` attribute tick down through dozens of intermediate values over 600ms — that is the tween re-rendering every frame.
3. Open **Performance** tab and record a click. The flame chart shows Svelte reactivity doing work every frame of the tween — which is why it is essential to use composited CSS properties downstream (transform, stroke-dashoffset on SVG) and not layout properties.
4. Toggle *prefers-reduced-motion: reduce* and click Advance — the ring now jumps instantly.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does <code>Tween</code> give you that plain <code>$state</code> does not?</summary>

`$state` is a discrete value — writing to it replaces the stored value and re-renders once. `Tween` wraps a value and smoothly interpolates from the old value to the new one over a configured duration, re-rendering on every frame so downstream templates can read intermediate values.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between <code>tween.target</code> and <code>tween.current</code>?</summary>

`target` is the destination value; assigning to it starts the interpolation. `current` is the interpolated value at this moment, which is what the template reads. While the tween is running, `target` is the final value and `current` is somewhere between the old value and the target.
</details>

<details>
<summary><strong>Q3.</strong> Is the <code>tweened()</code> function still supported in April 2026?</summary>

Yes. It is marked deprecated in the docs in favour of the `Tween` class (Svelte 5.8+), but it is still exported, still works, and is still useful for interop with libraries that expect a readable store. Prefer `Tween` for new code.
</details>

<details>
<summary><strong>Q4.</strong> How would you tween a colour between two values?</summary>

Provide a custom `interpolate` option: a function `(a, b) => (t) => …` that returns the mixed value at progress `t`. For an RGB triple that is `a + (b - a) * t` applied to each channel. Then render the current tuple into a CSS `rgb(…)` or `color(…)` string.
</details>

<details>
<summary><strong>Q5.</strong> Does the global <code>prefers-reduced-motion</code> CSS reset slow down a Tween?</summary>

No. Tweens run in JavaScript and bypass CSS transition tokens. You must read <code>prefersReducedMotion.current</code> and pass <code>duration: 0</code> (or use a function form) to the Tween yourself.
</details>

## 6. Common mistakes

- **Reading `.target` in the template.** `progress.target` returns the destination value, not the animated value. The template should read `.current`.
- **Mutating `.current` directly.** `current` is a read-only reactive getter. Always write to `.target`.
- **Forgetting reduced motion.** A tween with a long duration can be worse than an instant update for users with vestibular sensitivity.
- **Tweening layout properties.** The tween is free, but reading it into `width` or `height` every frame costs layout. Feed tween values into `transform`, `opacity`, or SVG attributes instead.

## 7. What's next

Lesson 6.15 introduces `Spring` — like `Tween`, but with physics-based motion that reacts to changes in velocity and feels more natural for interactive values like cursor following.
