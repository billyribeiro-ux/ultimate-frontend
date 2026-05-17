---
module: 6
lesson: 6.16
title: Custom transition functions
duration: 40 minutes
prerequisites:
  - Lesson 6.11 (Svelte transition directive)
  - Lesson 6.14 (Tween)
learning_objectives:
  - Describe the signature of a custom transition function
  - Return a `css(t, u)` generator for compositor-friendly transitions
  - Return a `tick(t, u)` function when CSS cannot express the effect
  - Type the function signature using Svelte's `TransitionConfig`
  - Parameterise a custom transition so one function covers many variants
status: ready
---

# Lesson 6.16 — Custom transition functions

## 1. Concept — Built-in transitions are just functions

The six transitions you met in Lesson 6.11 — `fade`, `fly`, `slide`, `scale`, `blur`, `draw` — are not magic. Each of them is a plain TypeScript function that Svelte calls at mount-or-unmount time. The function receives the DOM node and any parameters you passed in the template, and it returns an object describing the animation. Svelte reads that object and runs the animation for you. Once you understand the shape of that object, you can write your own transitions and they will behave identically to the built-ins.

This lesson is the "peek behind the curtain" for the entire Svelte animation system. After it you will be able to invent new transitions whenever an interaction calls for one, instead of trying to bend a built-in to do something it was not designed for.

### 1.1 The signature

A custom transition is a function with this TypeScript signature:

```ts
import type { TransitionConfig } from 'svelte/transition';

type MyParams = { duration?: number; distance?: number };

function mySlide(
	node: HTMLElement,
	params: MyParams,
	options: { direction: 'in' | 'out' | 'both' }
): TransitionConfig {
	return {
		duration: params.duration ?? 300,
		easing: cubicOut,
		css: (t, u) => `transform: translateX(${u * (params.distance ?? 20)}px); opacity: ${t};`
	};
}
```

Three arguments:

- **`node`** — the HTMLElement the transition is attached to. Useful if you need to read its current computed style, its dimensions, or its existing transform.
- **`params`** — whatever object the caller passed in `transition:mySlide={{ … }}`. Type this explicitly; do not allow `any`.
- **`options`** — an object with a `direction` property. You can branch on direction to do different things for `in`, `out`, or both.

Return a `TransitionConfig`. The shape is:

```ts
type TransitionConfig = {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
};
```

### 1.2 `t`, `u`, and what they mean

Every time Svelte samples the animation (once per frame), it calls your `css` function with two numbers:

- **`t`** — progress after easing, from 0 to 1. `0` means the element is fully out; `1` means the element is fully in. In other words, `1` is the "natural" state.
- **`u`** — equal to `1 - t`. Passed for convenience so you do not have to recompute it.

If you are running an `in:` transition, `t` starts at 0 and climbs to 1. If you are running an `out:` transition, `t` starts at 1 and falls to 0. Your `css` function returns a CSS string that represents what the element should look like at that progress.

### 1.3 `css` vs `tick`

You have two ways to implement the per-frame behaviour:

- **`css(t, u)`** — return a CSS string. Svelte turns this into a Web Animations API keyframe set, which runs on the compositor thread. **Prefer this whenever possible** — it stays smooth even when the main thread is busy.
- **`tick(t, u)`** — a function Svelte calls every frame, on the main thread, while the animation runs. Use this only when CSS cannot express the effect (e.g. you need to modify text content, set an attribute, or perform logic that is not a CSS property).

The classic `tick` example is a typewriter effect: you slice the element's text content by `t`. CSS cannot do that; `tick` can.

### 1.4 A custom compositor transition, end to end

```ts
// src/lib/transitions/curtain.ts
import type { TransitionConfig } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

export type CurtainParams = {
	duration?: number;
	delay?: number;
};

export function curtain(
	node: HTMLElement,
	{ duration = 400, delay = 0 }: CurtainParams = {}
): TransitionConfig {
	return {
		delay,
		duration,
		easing: cubicOut,
		css: (t, u) =>
			`clip-path: inset(0 ${u * 100}% 0 0); opacity: ${t};`
	};
}
```

This runs a horizontal "curtain" reveal by animating `clip-path`. Because it is a `css` transition, it runs on the compositor. Use it with `transition:curtain={{ duration: 500 }}`.

### 1.5 A custom `tick` transition — typewriter

```ts
export function typewriter(
	node: HTMLElement,
	{ speed = 1 }: { speed?: number } = {}
): TransitionConfig {
	const text = node.textContent ?? '';
	const duration = text.length / (speed * 0.01);
	return {
		duration,
		tick: (t) => {
			const i = Math.floor(text.length * t);
			node.textContent = text.slice(0, i);
		}
	};
}
```

Here `css` cannot help — we are modifying the text content itself — so we use `tick`. Svelte will throw if the element's only child is not a text node.

### 1.6 Reduced motion

For custom transitions, reduced motion is your responsibility. Read `prefersReducedMotion.current` at the call site and either collapse the parameters or skip the transition entirely.





### The TypeScript angle

Type custom transitions with `TransitionConfig` from `svelte/transition` as the return type.

### Comparison: css vs tick

| Return key | Runs on | Best for | Performance |
|-----------|---------|---------|-------------|
| `css(t, u)` | Compositor | CSS-expressible effects | Excellent |
| `tick(t, u)` | Main thread | Text content, attributes | Heavier |

> **In production sidebar.** On a 100K-daily-user portfolio site, a custom "reveal wipe" transition using `clip-path` in the `css` function ran at 120fps on high-refresh displays because it used the compositor, while a previous GSAP implementation ran at 60fps with drops.

### Common interview question

**Q: What is the signature of a custom Svelte transition function?**

**Model answer:** It receives `(node: HTMLElement, params: any, options: { direction })` and returns `TransitionConfig` with optional `delay`, `duration`, `easing`, `css`, and `tick`. The `css` function returns a CSS string per frame (compositor-friendly). The `tick` function runs per frame on the main thread for non-CSS effects.

## Going Deeper

**Official documentation:**
- [Svelte docs: Custom transitions](https://svelte.dev/docs/svelte/transition#Custom-transitions)
- [Svelte docs: TransitionConfig](https://svelte.dev/docs/svelte/svelte-transition)
- [MDN: Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)

**Advanced pattern:** Build a "typewriter" transition using the `tick` function that reveals text one character at a time. Then build a "curtain wipe" transition using the `css` function with `clip-path`.

**Challenge question:** (Combines Lessons 6.16, 6.11, and 6.2) Build a custom transition that "colour-wipes" an element: the background transitions from one OKLCH colour to another via a horizontal gradient, while opacity fades in. Use the `css` function for compositor performance. Parameterise the start and end colours.

## Deep Dive

**Why this matters at scale.** Custom transitions create brand-specific animations no built-in transition provides. A design system with 5-10 custom transitions becomes a competitive differentiator — every interaction feels uniquely branded.

**The mental model.** A transition function receives (node, params) and returns { delay, duration, easing, css, tick }. The css function generates CSS for each frame on the compositor. tick runs JS on the main thread. Prefer css for performance.

**Edge cases.** The css function returns style attribute strings, not <style> blocks. tick receives (t, u) where u = 1-t. If the transition reads computed styles during setup, layout may not be final if other transitions run simultaneously.

**Performance implications.** CSS-based transitions (css return) compile to @keyframes on the compositor. JS-based (tick return) run on the main thread and can cause drops if tick does layout reads. Benchmark on mid-range mobile.

**Connection to other modules.** Module 7 provides GSAP for complex transitions. Module 6.17 parameterizes custom transitions. Module 12 ensures custom transitions respect prefers-reduced-motion.

## 2. Style it — A hero section with a custom curtain reveal

The mini-build is a hero with a deep indigo brand (`oklch(45% 0.18 265)`). An "Enter" button mounts a hero card using the custom `curtain` transition from above. The reveal is horizontal, 500ms, cubicOut. Mobile-first responsive, reduced motion skips the reveal.

## 3. Interact — Writing your own transition is the last step to mastery

Once you can write a custom transition function, every "I wish the built-ins had X" problem becomes a five-line helper. The mini-build composes two custom transitions — `curtain` for the hero image and `typewriter` for the headline text — to show that you can mix both approaches on the same page.

## 4. Mini-build — A hero reveal with two custom transitions

**File:** `src/routes/modules/06-styling/16-custom-transitions/+page.svelte`

The route imports `curtain` from `$lib/transitions/curtain.ts` and `typewriter` as a local function in the component. An "Enter" button toggles `mounted = true`. When mounted, the hero image runs `transition:curtain` and the headline runs `transition:typewriter`.

### DevTools verification

1. Click Enter and inspect the hero image in DevTools. Its `clip-path` attribute animates from `inset(0 100% 0 0)` to `inset(0 0 0 0)` over 500ms — that is your custom `css` function running.
2. Inspect the headline `<h1>` — its `textContent` grows one character at a time. That is your `tick` function running on the main thread.
3. Enable reduced motion in the Rendering panel; both effects become instant.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What are the three arguments Svelte passes to a custom transition function?</summary>

The DOM node the directive is attached to, the parameter object supplied by the caller, and an `options` object with a `direction` field (`'in' | 'out' | 'both'`).
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between returning <code>css</code> and returning <code>tick</code>?</summary>

`css` returns a CSS string per frame and Svelte turns it into a Web Animation on the compositor thread — smooth and cheap. `tick` is called per frame on the main thread and lets you run arbitrary code, but it costs more and can jank. Prefer `css`; use `tick` only when CSS cannot express the effect.
</details>

<details>
<summary><strong>Q3.</strong> What do <code>t</code> and <code>u</code> represent?</summary>

`t` is eased progress from 0 to 1, where 1 is the element's natural mounted state. `u` is simply `1 - t`, provided for convenience. For an `in:` transition `t` climbs from 0 to 1; for `out:` it falls from 1 to 0.
</details>

<details>
<summary><strong>Q4.</strong> How do you type the return value of a custom transition in TypeScript strict mode?</summary>

Import `TransitionConfig` from `svelte/transition` and declare it as the return type. This gives full type checking on `delay`, `duration`, `easing`, `css`, and `tick`.
</details>

<details>
<summary><strong>Q5.</strong> Can one custom transition function handle both <code>in:</code> and <code>out:</code>?</summary>

Yes — Svelte calls the same function and passes <code>direction</code> in the options argument. Your function can branch on direction to alter its behaviour. For symmetric transitions, you can ignore direction and return the same config for both.
</details>

## 6. Common mistakes

- **Using `tick` when `css` would work.** Every frame of `tick` runs on the main thread. If the effect is expressible in CSS, use `css`.
- **Forgetting to handle direction.** If your animation is asymmetric, branch on `options.direction`. Otherwise the out-transition will look like the in-transition played backwards, which may be wrong.
- **Returning invalid CSS from `css`.** The returned string must parse cleanly. Syntax errors there fail silently and the animation appears broken.
- **Not typing `params`.** Leaving params as `any` undermines strict TypeScript. Declare an explicit type and default the optional fields.

## 7. What's next

Lesson 6.17 digs into transition parameters, easing selection, and how to stagger transitions across a list so that they cascade instead of firing all at once.
