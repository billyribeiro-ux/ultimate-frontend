---
module: 6
lesson: 6.11
title: Svelte transition directive — fade, fly, slide, scale, blur, draw
duration: 45 minutes
prerequisites:
  - Lesson 4.1 (`{#if}` blocks)
  - Lesson 4.2 (`{#each}` blocks)
  - Lesson 6.10 (CSS transitions with motion tokens)
learning_objectives:
  - Use the `transition:` directive on an element inside `{#if}` and `{#each}`
  - Pick the correct built-in transition for each DOM mount/unmount scenario
  - Pass duration and easing to a transition via the parameter object
  - Recognise when a transition is local vs global and why it matters inside nested blocks
  - Verify a transition respects `prefers-reduced-motion` in DevTools
status: ready
---

# Lesson 6.11 — Svelte `transition:` directive — fade, fly, slide, scale, blur, draw

## 1. Concept — Animating elements that enter and leave the DOM

The CSS transitions you learned in 6.10 are perfect for elements that *stay* in the DOM. A card lifts on hover, a button darkens on press, a menu slides out of collapse — in every case, the element is already there, and only its CSS properties change. But a huge category of UI problems is different: the element itself appears or disappears. A modal pops up when you click a trigger and is gone when you dismiss it. A toast notification shows up in the corner, lives for four seconds, and disappears. A list item is added to a cart and another is removed. In all these cases the element is literally mounted into or removed from the DOM by a Svelte `{#if}` or `{#each}` block.

CSS transitions cannot solve this. At the moment an element is about to be removed, it is still in the DOM, but the next moment Svelte deletes it — there is no "final state" for CSS to interpolate towards, because the element is gone. You need a system that asks Svelte to keep the element around for a few hundred milliseconds *after* the boolean flips false, and to run an animation during that grace period before removing the node from the page. That system is the **Svelte transition directive**, written `transition:name` on an element.

### 1.1 The six built-in transitions

Svelte ships six transitions in `svelte/transition`. Each solves a different class of problem:

- **`fade`** — interpolates `opacity` from 0 to 1. The most forgiving transition; use it as a default when you are not sure what else to pick.
- **`fly`** — interpolates both `opacity` and `transform: translate(x, y)`. Elements "fly" in from an offset. Accepts `x` and `y` numbers in pixels.
- **`slide`** — animates `max-height` so content *appears to push* the surrounding layout out of the way. Best for accordion panels and expanding sections.
- **`scale`** — interpolates `transform: scale()` and `opacity`. Good for modals and popovers that should feel like they emerge from a point.
- **`blur`** — animates `filter: blur()` and `opacity`. Gives a soft, premium feel; use sparingly, blur is expensive on low-end GPUs.
- **`draw`** — only for SVG `<path>` elements. Animates `stroke-dasharray` so the path looks like it is being drawn by an invisible pen. Great for illustrations and logo reveals.

Each transition function returns a CSS animation, not a JavaScript-driven one, which means Svelte's transitions also run on the compositor and stay smooth under load.

### 1.2 The shape of a transition directive

```svelte
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let visible = $state(false);
</script>

<button onclick={() => (visible = !visible)}>Toggle</button>

{#if visible}
	<p transition:fly={{ y: 20, duration: 300, easing: cubicOut }}>Hello</p>
{/if}
```

Read the directive out loud: *"apply the `fly` transition to this element, with a `y` offset of 20 pixels, a duration of 300 milliseconds, and cubic-out easing"*. The `transition:` keyword tells Svelte this is a bidirectional transition — it runs both in and out of the DOM. If you want *different* animations for entering and leaving, you use the `in:` and `out:` directives instead, which is the subject of Lesson 6.12.

### 1.3 PE7 tokens inside JavaScript

The `duration: 300` above looks like a raw number, and that is a problem. Our motion tokens live in CSS, but the Svelte transition runs in JavaScript and cannot read CSS variables directly. The clean solution is a tiny TypeScript constants file that mirrors the CSS tokens:

```ts
// src/lib/motion.ts
export const DUR = {
	instant: 100,
	fast: 200,
	base: 300,
	slow: 500,
	slower: 800
} as const;
```

Now your Svelte transitions read `duration: DUR.base` and share the same source of truth as your CSS.

### 1.4 Local vs global transitions

Svelte treats every `transition:` as **local by default**, meaning the transition only runs when the immediate block it lives in is created or destroyed. If a parent `{#if}` above it is destroyed, the inner element disappears *without* playing its transition. This is almost always what you want — it keeps performance under control when large sections unmount — but occasionally you need the global form: `transition:fade|global`.

### 1.5 The `prefersReducedMotion` reactive helper

Svelte 5.7 added a reactive helper called `prefersReducedMotion` in `svelte/motion`. It is a media-query reactive value that flips between `true` and `false` as the user's OS preference changes. You can use it to short-circuit transition parameters:

```svelte
<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { fly } from 'svelte/transition';

	let visible = $state(false);
</script>

{#if visible}
	<p
		transition:fly={{
			y: prefersReducedMotion.current ? 0 : 20,
			duration: prefersReducedMotion.current ? 0 : 300
		}}
	>
		Hello
	</p>
{/if}
```

This is the recommended way to make per-component accessibility decisions in Svelte 5. The global CSS reset handles CSS transitions; `prefersReducedMotion.current` handles JavaScript-driven Svelte transitions.



## Going Deeper

**Official documentation:**
- [Svelte docs: transition:](https://svelte.dev/docs/svelte/transition)
- [Svelte docs: svelte/transition](https://svelte.dev/docs/svelte/svelte-transition)
- [Svelte docs: svelte/easing](https://svelte.dev/docs/svelte/svelte-easing)

**Advanced pattern:** Build a notification stack where each notification uses `transition:fly` to enter from the right and exit to the right. Use the `local` modifier (default) so that notifications do not re-animate when the parent unmounts.

**Challenge question:** (Combines Lessons 6.11, 6.10, and 6.3) Build a card that uses CSS transitions for hover states AND a Svelte `transition:fade` for show/hide. Use PE7 motion tokens for both. Verify that reduced motion collapses both the CSS transition (via the global reset) and the Svelte transition (via `prefersReducedMotion.current`).

## 2. Style it — A notification stack with per-page personality

The mini-build is a stack of dismissible toast notifications with a teal brand hue (`oklch(72% 0.14 190)`). Each toast uses `transition:fly` to enter from the right and leave to the right. Duration comes from PE7 tokens (300ms base). Mobile-first: toasts are full-width on narrow screens and capped at 24rem at `min-width: 480px`. Dismiss buttons are 44px tall.

## 3. Interact — Why a CSS transition cannot replace a Svelte transition

The first version of the mini-build tries to solve the problem with pure CSS: a toast has a `.visible` class toggled via a boolean. The enter animation works — but when the user clicks dismiss, the toast vanishes immediately. There is no exit animation, because CSS has nothing to interpolate against once the element is removed from the DOM. The fix is the `transition:fly` directive, which keeps the toast around just long enough to animate out and then unmounts it automatically.

## 4. Mini-build — A toast notification stack

**File:** `src/routes/modules/06-styling/11-svelte-transitions/+page.svelte`

The page has an "Add notification" button that appends a toast to an array. Each toast has an auto-dismiss timer of four seconds. The toast itself uses `transition:fly={{ x: 320, duration: 300, easing: cubicOut }}`. Clicking the X on a toast removes it from the array, which triggers Svelte's outro transition.

### DevTools verification

1. Open DevTools → **Elements**.
2. Click "Add notification" and expand the `<ul>` that holds the toasts. You will see a new `<li>` appear immediately in the DOM with an animated `transform`.
3. Click the X on that toast. Watch the Elements panel — the `<li>` stays in the DOM for approximately 300ms with an animated `transform` and `opacity`, then disappears. That grace period is exactly what the `transition:` directive gives you.
4. Toggle *prefers-reduced-motion: reduce* in DevTools Rendering tab. Add and dismiss a toast again — the fly distance drops to zero and the duration becomes 0.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why can't CSS transitions handle the case where an element is removed from the DOM?</summary>

A CSS transition interpolates between two values of a CSS property on a persistent element. When an element is removed from the DOM, there is no second value to interpolate towards — the element is simply gone. Svelte's `transition:` directive solves this by holding the element in the DOM for the duration of the outro animation before removing it.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between <code>transition:fly</code> and using <code>in:fly</code> plus <code>out:fly</code>?</summary>

`transition:fly` is *bidirectional* — the same animation runs in both directions and can reverse smoothly mid-flight. `in:fly` and `out:fly` are *unidirectional* and let you use *different* animations for entering and leaving (for example, fly in and fade out). You will meet them in Lesson 6.12.
</details>

<details>
<summary><strong>Q3.</strong> When should you use <code>transition:fade|global</code> instead of the default local form?</summary>

When you want the element's transition to play even if a parent block unmounts. By default, Svelte skips outro animations on descendants when a parent block is destroyed so that large sections can tear down quickly. The `|global` modifier opts that element into playing regardless.
</details>

<details>
<summary><strong>Q4.</strong> How do you feed PE7 motion tokens into a Svelte transition when tokens live in CSS?</summary>

Duplicate the token values in a TypeScript constants file (for example `src/lib/motion.ts` exports `DUR.base = 300`). Import from there in the component. The CSS and JS sides stay in sync because they read from the same source of truth when you edit the file.
</details>

<details>
<summary><strong>Q5.</strong> Which built-in transition is best for an accordion panel and why?</summary>

`slide` — it animates `max-height` so the surrounding layout reflows smoothly around the expanding panel. `fly` or `fade` would overlap other content because they don't push layout.
</details>

## 6. Common mistakes

- **Putting `transition:` on the wrong element.** The directive must go on the element that enters or leaves the DOM — typically the element immediately inside the `{#if}` or inside the keyed `{#each}`. Placing it on a parent that never unmounts will silently do nothing.
- **Forgetting to key `{#each}` blocks.** Without a key (`{#each items as item (item.id)}`), Svelte reuses the same DOM nodes when items reorder, and your outro transitions will not play. Always key any each block that has a transition.
- **Ignoring `prefersReducedMotion.current`.** The global CSS reset only collapses *CSS* durations. Svelte transitions are driven from JS and need per-component checks when the visual move is large.
- **Animating elements inside a parent that is unmounting.** If the parent `{#if}` flips false, your inner transitions will not play — that is the *local* default. Add `|global` only when you understand the performance cost.

## 7. What's next

Lesson 6.12 splits `transition:` into `in:` and `out:` so you can use different animations for entering and leaving the same element.
