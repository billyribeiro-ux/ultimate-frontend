---
module: 7
lesson: 7.8
title: Stagger animations
duration: 35 minutes
prerequisites:
  - Lesson 7.4 (GSAP timelines)
  - Lesson 7.7 (cleanup)
learning_objectives:
  - Use `gsap.utils.toArray` to collect elements for a stagger
  - Write a stagger shorthand (`stagger: 0.1`) and a full config (`stagger: { each, from, grid, amount }`)
  - Choose the right `from` direction for a grid stagger — center, edges, end, random
  - Cap total stagger time with `amount` instead of per-item `each`
  - Respect reduced motion in a staggered GSAP animation
status: ready
---

# Lesson 7.8 — Stagger animations

## 1. Concept — Choreography across many elements

A stagger is what makes a row of cards feel like a single coordinated movement instead of a random flicker. Svelte's built-in stagger (Lesson 6.17) is `delay: index * 60` — simple, effective, but one-dimensional. GSAP's stagger system is the reason motion designers put up with GSAP's runtime cost: it understands 2D grid layouts, it can start from the centre, it can cap total animation time, and it can randomise offsets within bounds.

### 1.1 The shortest form — `stagger: 0.1`

```ts
gsap.from('.card', {
	y: 40,
	opacity: 0,
	duration: 0.5,
	stagger: 0.1
});
```

With a number, `stagger` is simply "seconds between each element". Element 0 starts at time 0, element 1 at 0.1, element 2 at 0.2, etc. Identical to Svelte's delay × index approach.

### 1.2 The full config object

```ts
gsap.from(cards, {
	y: 40,
	opacity: 0,
	duration: 0.5,
	stagger: {
		each: 0.08,
		from: 'center',
		grid: 'auto',
		ease: 'power2.out'
	}
});
```

- **`each`** — seconds between each element (same meaning as the shorthand).
- **`from`** — direction the stagger flows from. Options: `'start'`, `'end'`, `'center'`, `'edges'`, `'random'`, or a specific index number, or `[0.5, 0.5]` for 2D coordinates.
- **`grid`** — `'auto'` to detect the grid shape from element positions, or `[rows, cols]` to specify explicitly. Required when `from` is 2D and elements are laid out as a grid.
- **`amount`** — total seconds across **all** elements. Use instead of `each` to cap total animation length regardless of how many elements there are.
- **`ease`** — shapes how the delay is distributed across elements (not the per-element animation easing).

### 1.3 `amount` vs `each`

Use `each` when per-element pacing matters most. Use `amount` when total duration matters most:

- **`stagger: { each: 0.1 }`** with 5 items → 0.5s total. With 50 items → 5s total. Terrible for long lists.
- **`stagger: { amount: 0.8 }`** with 5 items → 0.16s between each. With 50 items → 0.016s between each, whole thing finishes in 0.8s.

For feature grids, hero reveals, and anything where total length should be bounded, **always prefer `amount`**.

### 1.4 Grid staggers

For a gallery that is laid out in a grid, `from: 'center'` with `grid: 'auto'` creates an "expanding ripple" effect from the centre outward.

```ts
gsap.from(cards, {
	y: 30,
	opacity: 0,
	duration: 0.5,
	stagger: {
		amount: 1,
		from: 'center',
		grid: 'auto'
	}
});
```

GSAP measures each card's position, computes the distance from the centre of the bounding box, and distributes the delays so the animation radiates outward. Without `grid: 'auto'`, GSAP treats the elements as a 1D list and the centre is just the middle item.

### 1.5 Collecting elements: `gsap.utils.toArray`

Inside `gsap.context`, selector strings work automatically. Outside a context, or when you want the array for other reasons, use `gsap.utils.toArray`:

```ts
const cards = gsap.utils.toArray<HTMLElement>('.card');
gsap.from(cards, { y: 30, opacity: 0, stagger: 0.1 });
```

The generic type parameter gives you proper TypeScript inference — each element is typed as `HTMLElement`, not `Element`.

### 1.6 Staggering inside a timeline

Staggers compose with timelines. You pass the stagger option to a timeline method exactly like you would to a standalone tween, and the whole stagger sequence takes one "slot" in the timeline:

```ts
const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
tl.from('.hero-title', { y: -40, opacity: 0 })
	.from(cards, { y: 30, opacity: 0, stagger: { amount: 0.8, from: 'center', grid: 'auto' } }, '-=0.3');
```

### 1.7 Reduced motion

Collapse `stagger.amount` to 0 or skip the stagger entirely:

```ts
gsap.from(cards, {
	y: reduced ? 0 : 30,
	opacity: 0,
	duration: reduced ? 0 : 0.5,
	stagger: reduced ? 0 : { amount: 0.8, from: 'center', grid: 'auto' }
});
```

## 2. Style it — A 12-card image gallery with an emerald brand

The mini-build is a grid of twelve illustrated cards with an emerald brand (`oklch(70% 0.15 155)`). On mount, the grid ripples in from the centre over 1 second total (`amount: 1, from: 'center', grid: 'auto'`). A "Replay" button re-runs the stagger. Mobile-first: 2 columns; 3 columns at 480px; 4 columns at 720px.

## 3. Interact — The wrong stagger vs the right one

The first draft uses `stagger: 0.1` on 12 items — 1.2 seconds of waiting while items pop in one at a time from left to right. It feels slow and mechanical. The refactor replaces it with `{ amount: 1, from: 'center', grid: 'auto' }` — same total time budget, but the choreography is radically better.

## 4. Mini-build — Ripple gallery

**File:** `src/routes/modules/07-gsap/08-stagger/+page.svelte`

Twelve cards in a CSS grid. A `bind:this` array holds element refs. An effect creates a `gsap.context` scoped to the grid container and runs the ripple stagger. A "Replay" button resets elements to their starting state with `gsap.set` and reruns the stagger.

### DevTools verification

1. Reload. The cards ripple in from the centre over exactly 1 second.
2. Click Replay. Same animation runs again.
3. Open Elements and inspect a card — the inline `transform` style shows GSAP is writing to it directly (not the class).
4. Navigate away and back — no tween leaks (context reverts on unmount).
5. Enable reduced motion — cards appear instantly with no stagger.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between <code>stagger.each</code> and <code>stagger.amount</code>?</summary>

`each` is seconds between each element; total duration scales with item count. `amount` is the total seconds across all elements; per-element delay scales down as count grows. Prefer `amount` for bounded total duration.
</details>

<details>
<summary><strong>Q2.</strong> When should you add <code>grid: 'auto'</code> to a stagger?</summary>

When your elements are laid out as a 2D grid and you want the stagger to understand that. Without it, GSAP treats the elements as a 1D list and directional staggers (`from: 'center'`, `from: 'edges'`) collapse to a one-dimensional interpretation.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>from: 'center'</code> produce when combined with <code>grid: 'auto'</code>?</summary>

An expanding-ripple effect from the centre of the grid outward. The cards nearest the centre animate first; cards at the corners animate last.
</details>

<details>
<summary><strong>Q4.</strong> Why use <code>gsap.utils.toArray&lt;HTMLElement&gt;(...)</code> instead of <code>document.querySelectorAll</code>?</summary>

It returns a real array (not a live NodeList), and with the generic type parameter it gives you strict TypeScript types for each element. It is also the idiomatic way to collect elements for GSAP.
</details>

<details>
<summary><strong>Q5.</strong> How do you collapse a stagger to instant for reduced motion?</summary>

Set `stagger: 0` (or the shorthand number form with value 0). Combined with `duration: 0`, the whole sequence becomes an instant `.set()`.
</details>

## 6. Common mistakes

- **Using `each` on long lists.** 50 items × 0.1s = 5 seconds of waiting.
- **Forgetting `grid: 'auto'`.** Your ripple becomes a linear sweep.
- **Running the stagger without a context.** Selector strings leak to the whole document.
- **No reduced-motion branch.** Twelve ripple cards are exactly the kind of animation some users need to disable.

## 7. What's next

Lesson 7.9 installs and configures ScrollTrigger, the GSAP plugin that ties animation progress to scroll position.
