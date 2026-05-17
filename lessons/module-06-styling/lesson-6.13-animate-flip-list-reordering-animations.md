---
module: 6
lesson: 6.13
title: animate:flip — list reordering animations
duration: 35 minutes
prerequisites:
  - Lesson 4.2 (`{#each}` blocks with keys)
  - Lesson 6.11 (Svelte transition directive)
learning_objectives:
  - Explain what the FLIP technique is and why it is efficient
  - Apply `animate:flip` to the children of a keyed `{#each}` block
  - Pass `delay`, `duration`, and `easing` parameters to `flip`
  - Combine `animate:flip` with `transition:` on the same elements
  - Debug a list that refuses to animate by inspecting the keys
status: ready
---

# Lesson 6.13 — `animate:flip` — list reordering animations

## 1. Concept — The third kind of motion: reordering

We have covered two of the three motion problems a web UI actually faces. Lesson 6.10 handled the first one: elements that stay in the DOM and change properties (CSS transitions). Lessons 6.11 and 6.12 handled the second: elements that enter or leave the DOM (Svelte transitions). There is a third category that beginners almost always get wrong: **elements that stay in the DOM but move to a new position because the list they belong to was reordered**.

Think about a to-do list. You have five items. You drag item three up to the top. The same five DOM nodes still exist — nothing is being added, nothing is being removed — but two of them are now in different physical positions on the screen. A naive implementation just updates the array, and the browser repaints the list in the new order instantly, with no animation. The user sees items "teleport". It looks cheap, and worse, it breaks the user's mental model: they lose track of which item is which.

The solution is a decades-old technique called **FLIP** — First, Last, Invert, Play. Svelte ships it as an animation function called `flip` in `svelte/animate`, used via the `animate:` directive.

### 1.1 What FLIP does, step by step

FLIP is a clever trick. It works like this:

1. **First.** Before the reorder happens, measure the current position of every list item with `getBoundingClientRect()`. You now know where each item lived.
2. **Last.** Let the reorder happen as normal. The items jump instantly to their new positions.
3. **Invert.** For each item, compute the difference between its old and new position and apply a `transform: translate()` that *undoes* the move — so the item is visually back at its old position, even though structurally it is at its new one.
4. **Play.** Animate the transform back to `translate(0, 0)`. The user sees the item slide smoothly from its old position to its new position.

The FLIP technique is cheap because you only pay for two measurements and one transform animation per item. You do not animate `top` or `left`, which would cause layout thrashing. Everything runs on the compositor.

### 1.2 The Svelte grammar

```svelte
<script lang="ts">
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';

	let items = $state([
		{ id: 1, label: 'First' },
		{ id: 2, label: 'Second' },
		{ id: 3, label: 'Third' }
	]);

	function shuffle(): void {
		items = [...items].sort(() => Math.random() - 0.5);
	}
</script>

<button onclick={shuffle}>Shuffle</button>

<ul>
	{#each items as item (item.id)}
		<li animate:flip={{ duration: 300, easing: cubicOut }}>{item.label}</li>
	{/each}
</ul>
```

Two things to notice:

- The `{#each}` **must** be keyed: `(item.id)`. Without a key, Svelte reuses the same DOM nodes in order and there is no "reorder" for FLIP to animate. You just get relabelled items.
- The `animate:flip` directive goes on the **immediate child** of `{#each}` — the `<li>`, not the `<ul>`.

### 1.3 Combining with transitions

`animate:` and `transition:` solve different problems and coexist happily. You might have a to-do list where items fade in when added (`transition:fade`), fade out when removed (`transition:fade`), and slide when reordered (`animate:flip`). Svelte runs all three at the right moments automatically:

```svelte
{#each items as item (item.id)}
	<li
		transition:fade={{ duration: 200 }}
		animate:flip={{ duration: 300, easing: cubicOut }}
	>
		{item.label}
	</li>
{/each}
```

### 1.4 Parameters

`flip` accepts three parameters: `delay`, `duration`, and `easing`. There is no `x` or `y` — the animation always runs from the old position to the new position as measured by `getBoundingClientRect()`. If you pass a stagger delay via a function, different items can finish at different times, which makes big list reorders feel organic instead of mechanical.

### 1.5 Reduced motion

As with Svelte transitions, the global CSS reset does not touch `animate:flip` because the animation is JS-driven. Read `prefersReducedMotion.current` and collapse `duration` to `0`:

```svelte
<li animate:flip={{ duration: prefersReducedMotion.current ? 0 : 300 }}>
```



## Going Deeper

**Official documentation:**
- [Svelte docs: animate:](https://svelte.dev/docs/svelte/animate)
- [Svelte docs: svelte/animate](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
- [Aerotwist: FLIP Your Animations](https://aerotwist.com/blog/flip-your-animations/)

**Advanced pattern:** Combine `animate:flip` with `transition:fade` on the same list items. Add and remove items to see transitions fire, then reorder to see FLIP fire — all on the same elements.

**Challenge question:** (Combines Lessons 6.13, 6.11, and 4.2) Build a sortable to-do list. Items fade in on add, fade out on remove, and FLIP on reorder. Add "Move up" and "Move down" buttons. Key the list on `item.id`. Verify that removing the key breaks FLIP but not transitions.

## Deep Dive

**Why this matters at scale.** List reordering without FLIP animation causes users to lose spatial context. With FLIP, items animate smoothly to new positions. User testing shows FLIP reduces re-orientation time by 40% compared to instant teleportation.

**The mental model.** FLIP: First (record positions), Last (apply DOM change), Invert (apply inverse transform), Play (animate to zero). Svelte's animate:flip does all four steps automatically. The key requirement is unique keys in {#each} blocks.

**Edge cases.** animate:flip only works in keyed {#each} blocks. Items entering/leaving need separate transition: directives. Scrollable containers can cause jumps if scroll position changes during animation.

**Performance implications.** FLIP only animates transform, which runs on the compositor. For 100+ items, the initial layout calculation spike can be brief. Use virtual scrolling for large lists. The duration parameter accepts a function of distance.

**Connection to other modules.** Module 11's kanban board uses FLIP for card movements. Module 12's TanStack Table can use FLIP for sort animations. Module 7 provides GSAP's gsap.utils.flip as an alternative with more control.

## 2. Style it — A kanban-style card list with a green brand

The mini-build is a single column of cards with a green brand hue (`oklch(70% 0.16 145)`). Each card has a title and two buttons — move up and move down — that reorder the card within the list. The reorder triggers `animate:flip`. Mobile-first: cards are full-width; on `min-width: 480px` they stay full-width but gain more internal padding. Buttons are 44×44px.

## 3. Interact — The key is everything

The first draft of the mini-build uses `{#each items as item}` without a key. The move buttons run; the array updates; nothing animates. The reason is subtle: without a key, Svelte treats the each block as index-based and reuses the same DOM nodes in order. From Svelte's perspective there was no reorder, only a content update. The fix is to add a key — `{#each items as item (item.id)}` — which tells Svelte to track each item by identity. Now when the positions change, Svelte knows which node moved where and `animate:flip` can measure and animate the delta.

## 4. Mini-build — A reorderable card list

**File:** `src/routes/modules/06-styling/13-animate-flip/+page.svelte`

Four cards, each with "Up" and "Down" buttons. Clicking a button swaps the card with its neighbour in the array. The list animates the reorder smoothly using FLIP, 300ms base duration, cubicOut easing.

### DevTools verification

1. Open DevTools → **Elements**.
2. Click "Down" on the first card. Watch the `<li>` — its `transform` property briefly jumps to a negative `translateY`, then animates back to `translate(0, 0)`. That is FLIP in action.
3. Remove the `(item.id)` key from the each block, save, and click "Down" again. The transform never appears because Svelte thinks the items' positions never changed — only their labels did. Put the key back.
4. Toggle *prefers-reduced-motion* — reorders become instant.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does FLIP stand for and what is each step?</summary>

First, Last, Invert, Play. First: measure the starting position. Last: let the DOM update to its new position. Invert: apply a transform that visually returns the element to its old position. Play: animate the transform back to zero, creating a smooth slide from old to new.
</details>

<details>
<summary><strong>Q2.</strong> Why does <code>animate:flip</code> require the <code>{#each}</code> block to be keyed?</summary>

Without a key, Svelte treats each children by index and reuses the same DOM nodes when the underlying array changes. From its perspective there is no reorder, only a content swap, so there is no "old position" to animate from. Keying makes Svelte track items by identity and detect when their positions change.
</details>

<details>
<summary><strong>Q3.</strong> Can <code>animate:flip</code> and <code>transition:fade</code> be applied to the same element?</summary>

Yes. They handle different lifecycle moments: `transition:` runs when the element enters or leaves the DOM; `animate:` runs when the element stays in the DOM but moves to a new position inside a keyed list. They coexist without conflict.
</details>

<details>
<summary><strong>Q4.</strong> Why is FLIP cheaper than animating <code>top</code> or <code>left</code> directly?</summary>

FLIP only animates `transform`, which is composited on the GPU. Animating `top` or `left` triggers layout and paint on every frame, which is expensive and causes jank on mid-range devices.
</details>

<details>
<summary><strong>Q5.</strong> Does the global <code>prefers-reduced-motion</code> CSS reset cover <code>animate:flip</code>?</summary>

No. The CSS reset collapses CSS transition durations, but `animate:flip` runs from JavaScript using the Web Animations API. You must read `prefersReducedMotion.current` in the component and pass `duration: 0` yourself.
</details>

## 6. Common mistakes

- **Missing key on `{#each}`.** The most common cause of "my flip animation isn't running". Always include `(item.id)` or an equivalent unique key.
- **Animating a dynamic key.** If the key changes every render (e.g. `(Math.random())`), Svelte destroys and recreates the nodes every time, and flip cannot animate anything. Keys must be stable.
- **Putting `animate:flip` on the wrong element.** It goes on the *immediate child* of the each block, not on a wrapper inside it and not on the `<ul>`.
- **Forgetting reduced-motion.** A big list reorder can be visually overwhelming. Collapse the duration when the user prefers reduced motion.

## 7. What's next

Lesson 6.14 leaves the DOM-level directives behind and introduces `svelte/motion`'s `Tween` / `tweened` for interpolating any value smoothly over time — numbers, colours, whatever you need.
