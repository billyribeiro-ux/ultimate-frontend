---
module: 7
lesson: 7.5
title: bind:this — getting DOM element references in Svelte
duration: 25 minutes
prerequisites:
  - Lesson 2.1 ($state)
  - Lesson 7.3 (gsap.to/from/fromTo)
learning_objectives:
  - Use `bind:this={el}` to bind a DOM element to a typed variable
  - Type the binding as `HTMLElement | undefined` in strict TypeScript
  - Understand the moment the reference becomes non-null
  - Pass the reference to GSAP instead of a CSS selector string
  - Explain why refs survive refactoring and class names do not
status: ready
---

# Lesson 7.5 — `bind:this` — getting DOM element references in Svelte

## 1. Concept — Svelte's answer to React's `useRef`

When a component renders, Svelte creates real DOM nodes. Your script code often needs to touch one of those nodes directly — to measure its size, to focus it, to hand it to a library like GSAP, or to call a WebGL context on a `<canvas>`. The built-in way to get a reference to a DOM node from your script is the `bind:this` directive. You declare a variable, bind it to an element, and after the element mounts the variable holds a direct reference to the underlying `HTMLElement`.

### 1.1 The grammar

```svelte
<script lang="ts">
	let card: HTMLElement | undefined = $state();
</script>

<article bind:this={card}>Hello</article>
```

Three critical details:

- **The variable is `$state()`** — this makes it reactive, so effects that read `card` rerun when the binding goes from undefined to the real element.
- **The type is `HTMLElement | undefined`** — the element does not exist on the very first render pass in SSR, and strictly typed code must acknowledge that.
- **The element starts as `undefined`** and becomes the real element **after the component has mounted**. Reading `card` in the top of the script (outside an effect) gives you `undefined`.

### 1.2 When is the reference non-null?

The reference populates after the DOM is committed. Inside an `$effect`, the binding is already a real element the first time the effect runs:

```svelte
<script lang="ts">
	import { gsap } from 'gsap';

	let card: HTMLElement | undefined = $state();

	$effect(() => {
		if (!card) return;
		gsap.from(card, { y: 40, opacity: 0, duration: 0.6 });
	});
</script>

<article bind:this={card}>Hello</article>
```

The `if (!card) return` guard is required because TypeScript still sees the type as `HTMLElement | undefined`. Strict mode will not let you call `gsap.from(card, …)` without narrowing.

### 1.3 Why refs, not selectors

GSAP accepts a selector string like `'.card'`, which is tempting because it is short. Three reasons refs are always better in this course:

1. **Scope safety.** A selector string matches **every** element in the document that has the class. If you use the same component twice on a page, every GSAP call targets all copies simultaneously. Refs target exactly one element.
2. **Refactor safety.** Renaming a class to improve styling should not break your animations. With a ref, the only coupling is to the component's own `<script>`.
3. **TypeScript.** GSAP types the target parameter as `gsap.TweenTarget`, which accepts both strings and elements. With a ref you can type your intermediate variables strictly; with a string, TypeScript cannot help you if the class is wrong.

### 1.4 Binding multiple elements

For multiple elements in a list, you can build an array:

```svelte
<script lang="ts">
	let cards: HTMLElement[] = $state([]);

	$effect(() => {
		if (cards.length === 0) return;
		gsap.from(cards, { y: 40, opacity: 0, stagger: 0.1 });
	});
</script>

{#each items as item, i (item.id)}
	<article bind:this={cards[i]}>{item.label}</article>
{/each}
```

Svelte fills the array as each element mounts. The effect runs when `cards.length` changes.

### 1.5 Binding a component instance vs a DOM element

`bind:this` on a regular element gives you the DOM node. `bind:this` on a child component gives you the component instance (a reference to its exports). In this lesson we are only talking about the element form. Component-instance binding is a different topic covered in Module 3.





### The TypeScript angle

Use specific element types: `let canvas: HTMLCanvasElement | undefined = $state()` gives access to `.getContext()` without assertions.

> **In production sidebar.** On a 100K-daily-user product page, GSAP used `.card` selector — when another team added `.card` to a sidebar, every sidebar card animated. Switching to `bind:this` refs fixed cross-component interference.

### Common interview question

**Q: In Svelte, how do you get a reference to a DOM element for use with GSAP?**

**Model answer:** Declare `let el: HTMLElement | undefined = $state()` and use `bind:this={el}`. Guard with `if (!el) return` in effects. Pass the element to GSAP instead of selectors. Refs are scoped, refactor-safe, and strictly typed.

## Going Deeper

**Official documentation:**
- [Svelte docs: bind:this](https://svelte.dev/docs/svelte/bind#bind:this)
- [Svelte docs: $state](https://svelte.dev/docs/svelte/$state)
- [GSAP docs: Targets](https://gsap.com/docs/v3/GSAP/gsap.to())

**Advanced pattern:** Build a component that binds 3 elements and passes them to a GSAP timeline. Display the ref values (undefined vs HTMLElement) in a debug panel.

**Challenge question:** (Combines Lessons 7.5, 7.3, and 2.1) Build an `{#each}` list where each item has a `bind:this` ref stored in an array. Use the array of refs as the target for a staggered `gsap.from` call. Verify that adding/removing items updates the ref array correctly.

## Deep Dive

**Why this matters at scale.** GSAP needs DOM elements. bind:this provides type-safe references. The timing of availability is critical — undefined during SSR, defined after mount.

**The mental model.** Declare as $state<HTMLElement>(). After mount, holds the DOM node. Before mount, undefined. GSAP code must run inside $effect or onMount.

**Edge cases.** Multiple bind:this references resolve at mount time. For dynamic lists, store references in a Map<string, HTMLElement> keyed by ID.

**Performance implications.** Zero runtime cost — compile-time directive. Holding many references prevents GC. Release references for off-screen items in virtual scrolling.

**Connection to other modules.** Module 2 introduced $state. Module 7.6 uses references in $effect. Module 12's actions provide an alternative element-reference pattern.

## 2. Style it — A single card with a coral brand

The mini-build is one card with a coral brand (`oklch(70% 0.19 30)`). The card has a headline and a paragraph. On mount, GSAP animates the card in with a `from` call — the call takes the bound element, not a selector. Mobile-first responsive.

## 3. Interact — Watching the ref become real

A tiny `pre` block at the bottom of the page displays the current value of `card` — shown as `undefined` before the DOM mounts, and as `<article>` after. A `$effect` logs to the console at the moment the ref becomes non-null. Students see the moment with their own eyes.

## 4. Mini-build — Card reveal via bound ref

**File:** `src/routes/modules/07-gsap/05-bind-this/+page.svelte`

Single animated card whose entrance is driven by `gsap.from(card, { … })` inside an effect. The script declares `let card: HTMLElement | undefined = $state()` and narrows with `if (!card) return`.

### DevTools verification

1. Open the console. On first load you should see one log line: "card mounted: HTMLArticleElement".
2. Open Elements and inspect the `<article>` — the `data-svelte-h` attribute and no class-name coupling is needed for the animation.
3. Comment out the `if (!card) return` guard and note TypeScript's error.
4. Enable reduced motion — the reveal becomes instant.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What type should a <code>bind:this</code> target variable have?</summary>

<code>HTMLElement | undefined</code> (or the specific element type like <code>HTMLDivElement | undefined</code>). It is undefined before mount and becomes the real element after.
</details>

<details>
<summary><strong>Q2.</strong> Why must the variable be declared with <code>$state()</code>?</summary>

So that Svelte's reactivity tracks when the binding goes from undefined to a real element. Effects that read the variable rerun at that moment, which is when you want to run your first GSAP call.
</details>

<details>
<summary><strong>Q3.</strong> Why is an element reference safer than a CSS selector string for GSAP?</summary>

Selectors are global — they can match other components accidentally — and they couple JavaScript to class names that may change during refactoring. References point to exactly one element in the current component and survive renames.
</details>

<details>
<summary><strong>Q4.</strong> How do you bind multiple elements in an each block?</summary>

Declare <code>let items: HTMLElement[] = $state([])</code> and write <code>bind:this={items[i]}</code> inside the each block. Svelte fills the array as elements mount.
</details>

<details>
<summary><strong>Q5.</strong> Why does <code>if (!card) return</code> appear at the top of every effect that uses the ref?</summary>

TypeScript still sees the type as possibly undefined. The guard narrows the type so the rest of the effect can call methods on `card` without errors, and it avoids running the animation before the element has mounted.
</details>

## 6. Common mistakes

- **Declaring the variable without `$state()`.** The effect will not rerun when the binding populates.
- **Using `let card: HTMLElement` without `| undefined`.** TypeScript strict mode will complain on the first access.
- **Calling GSAP in the top of `<script>` instead of inside `$effect`.** Refs are undefined at that point.
- **Using a string selector to "avoid typing `| undefined`".** It is a shortcut that breaks refactors.

## 7. What's next

Lesson 7.6 explains why `$effect` is the only correct place to run GSAP code in a Svelte component, and how to bridge reactive state into GSAP calls.
