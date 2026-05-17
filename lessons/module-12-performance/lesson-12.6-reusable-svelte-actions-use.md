---
module: 12
lesson: 12.6
title: Reusable Svelte actions — use:
duration: 50 minutes
prerequisites:
  - Module 7 — use: actions introduction
  - Lesson 12.4 — $effect cleanup
learning_objectives:
  - Write a typed action with an update function and a destroy cleanup
  - Build a production clickOutside action with a callback parameter
  - Build an intersect action backed by IntersectionObserver
  - Explain why actions are the right place for imperative DOM code
  - Type the action signature properly so consumers get full auto-complete
status: ready
---

# Lesson 12.6 — Reusable Svelte actions — `use:`

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. Actions are the bridge between Svelte's reactive model and the non-reactive DOM APIs like `IntersectionObserver`, `ResizeObserver`, and `addEventListener`. A well-written action is a component-sized building block you reuse forever.

## 1. Concept — Actions are functions that meet a specific contract

### 1.1 The action contract

A Svelte action is a function you attach to a DOM element with the `use:` directive. The function takes the element as its first argument and an optional parameter as its second. When the element mounts, Svelte calls the function; when the element unmounts, Svelte calls the `destroy` method on the returned object (if any). If the parameter changes, Svelte calls the `update` method.

```ts
import type { Action } from 'svelte/action';

interface ClickOutsideParams {
	onOutside: () => void;
}

export const clickOutside: Action<HTMLElement, ClickOutsideParams> = (
	node,
	params
) => {
	let current = params;

	function handle(event: MouseEvent): void {
		if (!node.contains(event.target as Node)) {
			current.onOutside();
		}
	}

	document.addEventListener('click', handle, true);

	return {
		update(next: ClickOutsideParams): void {
			current = next;
		},
		destroy(): void {
			document.removeEventListener('click', handle, true);
		}
	};
};
```

The typed `Action<HTMLElement, ClickOutsideParams>` is important. It gives consumers full autocomplete on the parameter object, and it constrains the action to elements that are actually HTML elements (so you cannot accidentally attach a DOM-requiring action to an SVG-specific root). The `update` method lets callers change the callback on the fly, and `destroy` cleans up the listener so the action does not leak.

### 1.2 Why actions and not `$effect`?

You could do the same thing in a component:

```svelte
<script lang="ts">
	let box: HTMLDivElement;
	$effect(() => {
		function handle(event: MouseEvent): void { /* ... */ }
		document.addEventListener('click', handle, true);
		return () => document.removeEventListener('click', handle, true);
	});
</script>

<div bind:this={box}>…</div>
```

It works, but it has three problems:

1. **It is not reusable.** The logic is trapped inside this component. Reusing it means copying and pasting the same `$effect` block into every consumer.
2. **It is not testable.** A component with a hand-rolled effect is harder to unit-test than a pure action function.
3. **It mixes concerns.** The `$effect` lives next to the component's business logic, and future readers cannot tell at a glance whether the effect is part of the UI or part of the behaviour.

An action extracts the behaviour into a named, typed, reusable function. Consumers write a single `use:clickOutside={{ onOutside: close }}` on the element, and the behaviour is instantly applied.

### 1.3 A production `intersect` action

`IntersectionObserver` is the right API for "do something when an element enters the viewport": lazy loading images, triggering animations, pausing expensive work when the element is off-screen. The action wraps it:

```ts
import type { Action } from 'svelte/action';

interface IntersectParams {
	onEnter?: () => void;
	onLeave?: () => void;
	rootMargin?: string;
	threshold?: number;
}

export const intersect: Action<HTMLElement, IntersectParams> = (node, params) => {
	let current = params;
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) current.onEnter?.();
				else current.onLeave?.();
			}
		},
		{
			rootMargin: current.rootMargin ?? '0px',
			threshold: current.threshold ?? 0
		}
	);

	observer.observe(node);

	return {
		update(next: IntersectParams): void {
			current = next;
		},
		destroy(): void {
			observer.disconnect();
		}
	};
};
```

This action is used in Lesson 12.12 to pause the 3D canvas when it scrolls off-screen. It is also the backbone of every "animate on scroll" effect in Module 6. Writing it once as a typed action pays dividends across the whole course.

### 1.4 A `tooltip` action with a parameter update

```ts
interface TooltipParams { text: string; }

export const tooltip: Action<HTMLElement, TooltipParams> = (node, params) => {
	let current = params;
	const el = document.createElement('div');
	el.className = 'tooltip';
	el.textContent = current.text;

	function show(): void {
		document.body.appendChild(el);
		const rect = node.getBoundingClientRect();
		el.style.inset = `${rect.bottom + 8}px auto auto ${rect.left}px`;
	}

	function hide(): void {
		el.remove();
	}

	node.addEventListener('mouseenter', show);
	node.addEventListener('mouseleave', hide);
	node.addEventListener('focusin', show);
	node.addEventListener('focusout', hide);

	return {
		update(next: TooltipParams): void {
			current = next;
			el.textContent = next.text;
		},
		destroy(): void {
			node.removeEventListener('mouseenter', show);
			node.removeEventListener('mouseleave', hide);
			node.removeEventListener('focusin', show);
			node.removeEventListener('focusout', hide);
			el.remove();
		}
	};
};
```

Notice the `focusin`/`focusout` listeners alongside `mouseenter`/`mouseleave`. Tooltips that only appear on hover are inaccessible to keyboard users. A well-written action fixes that at the source, so every consumer gets the accessible behaviour automatically.

### 1.5 Actions and reactive parameters

If the parameter object is reactive (for example, a `$state` that changes over time), the `update` method is called whenever the reactive binding changes. Use `update` to apply the change to whatever the action has already set up. Do not create new observers or event listeners inside `update` — reuse the existing ones and swap the parameter values.

### 1.6 Why this matters for performance

Actions are *the* right place to touch the DOM directly. They run once per element, clean up on unmount, and do not need to be wrapped in an effect that competes with the component's other reactive work. An `IntersectionObserver` inside an action is vastly cheaper than a scroll listener on `window` that measures every element on every frame. A `clickOutside` with a single document listener shared across many nodes is cheaper than one listener per node. Every action you write is a small performance win because it uses a lower-level DOM API than a naive effect would.

### 1.x What Svelte does under the hood with actions

A Svelte action is a function that receives a DOM element and optional parameters. The lifecycle:

1. **Mount:** Svelte calls `action(node, params)` when the element is added to the DOM. The function can set up event listeners, observers, or any imperative DOM logic.
2. **Update:** If the action returns an object with an `update(newParams)` method, Svelte calls it whenever the parameters change reactively.
3. **Destroy:** If the action returns an object with a `destroy()` method, Svelte calls it when the element is removed from the DOM.

```ts
function tooltip(node: HTMLElement, text: string) {
    // Setup: add event listeners
    const show = () => { /* show tooltip */ };
    const hide = () => { /* hide tooltip */ };
    node.addEventListener('mouseenter', show);
    node.addEventListener('mouseleave', hide);
    
    return {
        update(newText: string) { text = newText; },
        destroy() {
            node.removeEventListener('mouseenter', show);
            node.removeEventListener('mouseleave', hide);
        }
    };
}
```

> **In production sidebar.** We have 8 reusable actions in our SvelteKit app: `clickOutside` (close dropdowns), `tooltip` (hover text), `autoFocus` (focus on mount), `longPress` (touch hold), `intersectionObserver` (lazy loading), `clipboard` (copy to clipboard), `resizeObserver` (responsive components), and `trapFocus` (modal focus trapping). Each is 15-40 lines. They are imported across 30+ components. Without actions, each component would implement these behaviors inline, duplicating imperative DOM logic throughout the codebase.

### 1.x Common interview question

**Q: "What is a Svelte action, and how does it differ from a component?"**

**Model answer:** A Svelte action is a function applied to a DOM element with the `use:` directive. It receives the element and optional parameters, and can set up imperative DOM behavior (event listeners, observers, third-party library integration). Unlike a component, an action does not render markup — it enhances an existing element. Actions have a lifecycle: they run on mount, can update when parameters change, and clean up on destroy. Use actions for cross-cutting DOM concerns (tooltips, click-outside detection, focus trapping) that apply to any element regardless of what component renders it. Use components for rendering new DOM structure with encapsulated state and markup.

## Deep Dive

**Why this matters at scale.** Actions are the most underutilized Svelte feature. They encapsulate DOM-level behavior: click-outside, intersection, tooltip positioning, focus trap.

**The mental model.** Actions receive (node, params) and return { update, destroy }. update() fires when params change. destroy() fires on unmount. The action owns the element's behavior lifecycle.

**Edge cases.** Actions cannot access component state directly. Pass reactive values as params — the action's update() fires when they change. Do not create event listeners without cleanup.

**Performance implications.** Actions add zero overhead when not active. Each action is one DOM listener setup on mount and one cleanup on unmount. No per-frame cost.

**Connection to other modules.** Module 7.11-12 taught GSAP actions. This generalizes to any DOM behavior.


## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — A tooltip, a click-outside dropdown, and an intersect fade-in

The mini-build shows three interactive examples in a single page, each backed by one of the actions above. Per-page accent: `oklch(72% 0.18 220)` (action blue).

- The tooltip target is a 44px button with a focus ring.
- The click-outside dropdown closes when the user taps anywhere off it.
- The intersect fade-in uses a transition that honours `prefers-reduced-motion`.

## 3. Interact — Three actions, three behaviours

Students attach `use:tooltip={...}`, `use:clickOutside={...}`, and `use:intersect={...}` to three different elements and see the DOM-level behaviour. No `$effect` or component lifecycle code is required — all of it is hidden inside the action definitions.

## 4. Mini-build — Three production actions on one page

**File:** `src/routes/modules/12-performance/06-svelte-actions/+page.svelte`

Imports `clickOutside`, `intersect`, and `tooltip` from local modules inside the route directory. Demonstrates all three on a single page.

### DevTools moment

Open the Elements panel and watch the tooltip element being appended to the body on hover and removed on blur. Open the Performance panel while scrolling the intersect target in and out of view and confirm that the callback fires only when the element crosses the viewport — not on every scroll frame. That is the cost difference between an action and a naive scroll listener.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the contract an action function must meet?</summary>

It must accept a DOM node (and optionally a parameter object) and return an object that may contain `update` and `destroy` methods. `update` is called when the parameter changes; `destroy` is called when the element unmounts. The function itself runs once when the element mounts.
</details>

<details>
<summary><strong>Q2.</strong> Why type actions as <code>Action&lt;HTMLElement, Params&gt;</code>?</summary>

The generic gives consumers autocomplete on the parameter object and constrains the action to elements that can actually host it (so you cannot accidentally attach an HTML-specific action to an SVG-root element). Without the generic, the second argument is `unknown`.
</details>

<details>
<summary><strong>Q3.</strong> Why add <code>focusin</code>/<code>focusout</code> listeners to a tooltip that already has <code>mouseenter</code>/<code>mouseleave</code>?</summary>

Keyboard users cannot hover. Without focus listeners, the tooltip is invisible to anyone navigating with a keyboard — which is a serious accessibility failure. Actions are the right place to fix this once for all consumers.
</details>

<details>
<summary><strong>Q4.</strong> Why not use a scroll listener on <code>window</code> instead of <code>IntersectionObserver</code>?</summary>

Scroll listeners fire on every frame of every scroll, even when nothing of interest is happening, and they do their own expensive layout reads. `IntersectionObserver` only fires when an element crosses a threshold, and it does the visibility check in a background thread without forcing layout. It is orders of magnitude cheaper.
</details>

<details>
<summary><strong>Q5.</strong> When a reactive parameter changes, should the action rebuild its observer?</summary>

No — it should swap the current value in-place inside the `update` method. Rebuilding observers and re-adding listeners on every update throws away the caching and rebinding logic that makes actions cheap.
</details>

## 6. Common mistakes

- **Forgetting to clean up in `destroy`.** Every listener, every observer, every interval must be cancelled. Otherwise the action leaks for the lifetime of the page.
- **Rebuilding state inside `update`.** `update` is for swapping parameters, not re-initialising. Keep the observer stable.
- **Attaching a document-level listener inside a component's `$effect`.** Use an action instead — it is reusable, testable, and scoped.
- **Untyped actions.** Consumers get no autocomplete and TypeScript cannot catch wrong parameters.

## 7. What's next

Lesson 12.7 catches and recovers from errors with `<svelte:boundary>` — the Svelte equivalent of React's error boundaries.
