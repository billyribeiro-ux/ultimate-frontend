---
module: 7
lesson: 7.11
title: Svelte use: actions and the attachment pattern
duration: 35 minutes
prerequisites:
  - Lesson 7.5 (bind:this)
  - Lesson 7.7 (cleanup)
learning_objectives:
  - Explain what a Svelte action is and what problem it solves
  - Write a typed action that receives an element and optional parameters
  - Clean up an action with the `destroy` method in its return object
  - Recognise the July 2025 "attachments" evolution and when it replaces classic actions
  - Package a GSAP behaviour as an action for reuse across components
status: ready
---

# Lesson 7.11 — Svelte `use:` actions and the attachment pattern

## 1. Concept — A Svelte action is a function that owns an element

You have spent several lessons writing code that follows the same shape: declare a ref with `bind:this`, write an `$effect` that touches the element, return a cleanup function. That shape is correct, but it is repetitive. Every component that wants to use GSAP on an element has the same skeleton: ref, effect, guard, animation, cleanup. After three or four components it becomes obvious that the pattern should be extracted and reused.

Svelte's answer is a feature called an **action** — a tiny reusable function you attach to an element with the `use:` directive. The action receives the element as its argument and returns an object with optional `update` and `destroy` methods. Svelte calls `destroy` when the element unmounts. This is exactly the ref + effect + cleanup pattern you have been writing, collapsed into one function.

### 1.1 The classic action signature

```ts
// src/lib/actions/lift.ts
import type { Action } from 'svelte/action';
import { gsap } from 'gsap';

export const lift: Action<HTMLElement, { distance?: number }> = (node, params) => {
	const distance = params?.distance ?? -4;

	const onEnter = (): void => {
		gsap.to(node, { y: distance, duration: 0.2, ease: 'power2.out' });
	};
	const onLeave = (): void => {
		gsap.to(node, { y: 0, duration: 0.2, ease: 'power2.out' });
	};

	node.addEventListener('pointerenter', onEnter);
	node.addEventListener('pointerleave', onLeave);

	return {
		destroy() {
			node.removeEventListener('pointerenter', onEnter);
			node.removeEventListener('pointerleave', onLeave);
			gsap.killTweensOf(node);
		}
	};
};
```

And at the call site:

```svelte
<script lang="ts">
	import { lift } from '$lib/actions/lift';
</script>

<article use:lift={{ distance: -6 }}>Card</article>
```

Three takeaways:

- **`Action<HTMLElement, Params>`** is Svelte's TypeScript helper. First generic is the element type; second is the parameter shape.
- **The action function runs when the element mounts** and has direct access to the node. No ref, no effect, no guard.
- **The `destroy` method is the cleanup.** Svelte calls it when the element unmounts. Perfect match for GSAP's `.kill()` / `ctx.revert()` needs.

### 1.2 Updates

If the parameters change, Svelte calls the action's `update` method with the new parameters. Implement it if you want to react to parameter changes without destroying and recreating the action.

```ts
return {
	update(newParams) {
		// handle new params
	},
	destroy() {
		// cleanup
	}
};
```

### 1.3 The July 2025 attachment pattern

Svelte 5 introduced an evolution of actions called **attachments**, rolled out through mid-2025. Attachments are actions written as inline functions that run inside Svelte's effect system. Instead of a separate `.ts` file and `use:` directive, you write the attachment function directly in your component and invoke it with the `@attach` function from `svelte/attachments`.

```svelte
<script lang="ts">
	import { attach } from 'svelte/attachments';
	import { gsap } from 'gsap';

	const reveal = attach((node: HTMLElement) => {
		gsap.from(node, { y: 40, opacity: 0, duration: 0.6 });
		return () => gsap.killTweensOf(node);
	});
</script>

<article {@attach reveal}>Card</article>
```

Attachments are the newer pattern and tend to be cleaner for one-off component-specific code. Classic actions are still fully supported and remain the right choice when you need a reusable file-based helper.

> **Which to use?** For reusable, shared-across-the-app behaviours: classic `use:` actions in a library file. For one-off component-scoped behaviour you would otherwise write as a `$effect`: attachments. Most of this course continues to use classic actions for clarity, and we flag attachment examples explicitly.

### 1.4 Why actions are better than plain effects

- **Locality.** The logic lives on the element, not in a separate effect above it. Readers see `use:lift` and immediately understand the element has that behaviour.
- **Reuse.** A single action definition is imported by many components.
- **Cleanup by contract.** You cannot forget cleanup because the `destroy` method is part of the return type. An effect without a cleanup is a valid effect; an action without `destroy` leaks.
- **Parameters are typed.** The second generic of `Action` gives you full TypeScript checking at call sites.

### 1.5 Actions and GSAP context

When an action creates multiple GSAP tweens, wrap them in `gsap.context`:

```ts
export const heroReveal: Action<HTMLElement> = (node) => {
	const ctx = gsap.context(() => {
		gsap.from('.headline', { y: -40, opacity: 0 });
		gsap.from('.cta', { scale: 0, opacity: 0 }, '-=0.3');
	}, node);
	return { destroy: () => ctx.revert() };
};
```

The scope argument to `gsap.context` is the action's own node, which means the action is safe to use multiple times on the same page — each instance gets its own scope.





### The TypeScript angle

Type actions with `Action<HTMLElement, ParamsType>` from `svelte/action`.

> **In production sidebar.** On a 100K-daily-user design system, extracting "lift on hover" into a `use:lift` action reduced 6 copies of the same pattern to 1 shared file + 6 one-line directives.

### Common interview question

**Q: What is a Svelte action and when should you use one instead of `$effect`?**

**Model answer:** An action is a reusable function attached via `use:` that receives the element and returns `update`/`destroy` methods. Use actions for reusable cross-component behaviour (hover effects, observers). Use `$effect` for one-off component-specific logic. Actions enforce cleanup through the `destroy` contract.

## Going Deeper

**Official documentation:**
- [Svelte docs: use: action](https://svelte.dev/docs/svelte/use)
- [Svelte docs: svelte/action types](https://svelte.dev/docs/svelte/svelte-action)
- [Svelte docs: Attachments](https://svelte.dev/docs/svelte/attach)

**Advanced pattern:** Build a `use:tooltip` action that shows a GSAP-animated tooltip on hover. Parameterise the tooltip text and position.

**Challenge question:** (Combines Lessons 7.11, 7.3, and 5.9) Build a `use:dragDrop` action that uses pointer events for drag and GSAP for snap-back animation. Type the action with `Action<HTMLElement, { snapDuration?: number }>`. Handle `pointercancel` in the `destroy` method.

## Deep Dive

**Why this matters at scale.** Actions are the most elegant GSAP integration point. use:fadeIn, use:parallax, use:reveal make animation as easy as adding a CSS class. Write pattern once, apply everywhere.

**The mental model.** Actions receive DOM elements and return { update, destroy }. Create GSAP in the body, handle param changes in update, kill in destroy. Components stay clean.

**Edge cases.** If parameters are reactive, update() is called on change. For static animations, the action fires once and update is never called — zero overhead.

**Performance implications.** Actions have the best performance profile: zero overhead when no animation is active. Unlike $effect, update() only fires on parameter change.

**Connection to other modules.** Module 5 introduced events. Module 7.6 taught the $effect bridge. Module 7.12 builds a specific action. Module 12.6 teaches general action patterns.

## 2. Style it — A gallery with a single `use:lift` action

The mini-build is a six-card gallery with a blue brand (`oklch(66% 0.18 250)`). Each card uses `use:lift={{ distance: -6 }}`. The action lives in `src/lib/actions/lift.ts`. Hovering any card lifts it; leaving returns it. Keyboard focus triggers the same animation via `:focus-visible`. Touch targets 44px.

## 3. Interact — The same behaviour, one line per element

The before-and-after is striking. The inline version has six copies of the ref + effect + event listener + cleanup pattern. The refactored version is one `lift.ts` file plus `use:lift={{ distance: -6 }}` on each card — six characters per element for the same behaviour.

## 4. Mini-build — Lift action gallery

**File:** `src/routes/modules/07-gsap/11-actions/+page.svelte`
**Helper:** `src/lib/actions/lift.ts`

Six cards laid out in a responsive grid. Each uses the shared `lift` action with varying distances to demonstrate parameterisation. The page also demonstrates the attachment pattern on a seventh "bonus" card as a preview.

### DevTools verification

1. Hover any card — it lifts smoothly.
2. Navigate away and back; no tween leaks.
3. Use Tab to keyboard-focus cards — lift happens on focus too (if you added `pointerenter`+`focus`; the mini-build does).
4. Enable reduced motion — the hover lift becomes instant (GSAP duration 0 branch).

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is a Svelte action?</summary>

A function that receives an HTML element (and optional parameters) and returns an object with optional `update` and `destroy` methods. Used with the `use:` directive to attach reusable behaviour to an element.
</details>

<details>
<summary><strong>Q2.</strong> How do you type an action in TypeScript strict mode?</summary>

Use the `Action<ElementType, ParamsType>` generic from `svelte/action`. The first generic is the element type, the second is the parameter shape.
</details>

<details>
<summary><strong>Q3.</strong> When does the <code>destroy</code> method run?</summary>

When the element the action is attached to is removed from the DOM — either because the component unmounts or because a conditional block above the element flipped false.
</details>

<details>
<summary><strong>Q4.</strong> What is the attachment pattern introduced in July 2025?</summary>

An evolution of actions written as inline component-scoped functions invoked via `@attach`. Cleaner for one-off component behaviour; classic `use:` actions remain the right choice for reusable library helpers.
</details>

<details>
<summary><strong>Q5.</strong> Why is an action better than a raw <code>$effect</code> for reusable behaviour?</summary>

The logic lives on the element at the call site, the cleanup contract is enforced by the return type, and the parameters are typed via generics. You cannot forget cleanup because `destroy` is an explicit method on the return object.
</details>

## 6. Common mistakes

- **Forgetting `destroy`.** The action works but leaks event listeners and tweens.
- **Using an action for single-use component-specific code.** Prefer an attachment or a plain effect.
- **Running mutations at module top.** Actions run when the element mounts, not when the file is imported — keep all DOM/GSAP work inside the function body.
- **Typing params as `any`.** Use the second generic of `Action` explicitly.

## 7. What's next

Lesson 7.12 builds a concrete, reusable action on top of everything you have learned: `use:revealOnScroll` using IntersectionObserver plus GSAP.
