---
module: 7
lesson: 7.10
title: ScrollTrigger with SvelteKit navigation
duration: 35 minutes
prerequisites:
  - Lesson 7.9 (ScrollTrigger installation)
  - Lesson 8.x (SvelteKit routing basics — `afterNavigate`)
learning_objectives:
  - Explain why ScrollTrigger caches break after a SvelteKit navigation
  - Call `ScrollTrigger.refresh()` at the right moment using `afterNavigate`
  - Combine `afterNavigate`, `gsap.context`, and `ctx.revert()` into a bullet-proof pattern
  - Recognise the "triggers fire on wrong page" symptom
  - Debug cache issues with `ScrollTrigger.getAll()`
status: ready
---

# Lesson 7.10 — ScrollTrigger with SvelteKit navigation

## 1. Concept — The single most common GSAP-in-SvelteKit bug

Here is the scenario. You set up a beautiful scroll-driven article on `/posts/one`. You install ScrollTrigger inside `$effect`, register the plugin, create a context, write cleanup with `ctx.revert()`. On `/posts/one` everything works perfectly. You click a link to `/posts/two`. The new page loads — and the animations on the new page are either completely broken or trigger at the wrong scroll positions. Scrolling feels "stuck". Refreshing the browser fixes everything until the next navigation.

This is not a bug in your cleanup. It is a consequence of how **ScrollTrigger measures the document**. When a ScrollTrigger is created, it measures the trigger element's position relative to the scrollable container *once* and caches the numbers. After a SvelteKit navigation, those measurements are stale — the old DOM was replaced, the new DOM has new element positions, and ScrollTrigger does not know. The triggers either fire against the wrong coordinates or refuse to fire at all.

This lesson gives you the pattern that makes SvelteKit routes with ScrollTrigger reliable.

### 1.1 Why `ctx.revert()` alone is not enough

`ctx.revert()` correctly tears down every ScrollTrigger from the *old* page. The problem is the *new* page's triggers. When SvelteKit mounts the new component, the `$effect` runs and creates fresh ScrollTriggers — but at the exact moment of creation, the new DOM might not yet be laid out (stylesheets still settling, images still loading, fonts still swapping). ScrollTrigger measures too early and caches wrong numbers.

The fix is to call `ScrollTrigger.refresh()` **after** the new DOM has stabilised, which SvelteKit tells you via the `afterNavigate` lifecycle hook.

### 1.2 The `afterNavigate` hook

SvelteKit exposes `afterNavigate` from `$app/navigation`. It runs on the client after every successful navigation, including the initial load. Inside a component, you call it with a callback, and that callback runs once at mount plus once after every subsequent navigation to the same or different route.

```svelte
<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	let root: HTMLElement | undefined = $state();

	$effect(() => {
		if (!root) return;

		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			gsap.from('.reveal', {
				y: 40,
				opacity: 0,
				stagger: 0.1,
				scrollTrigger: { trigger: '.reveal', start: 'top 85%' }
			});
		}, root);

		// Refresh triggers after the new DOM has stabilised
		afterNavigate(() => {
			ScrollTrigger.refresh();
		});

		return () => ctx.revert();
	});
</script>

<section bind:this={root}>
	<!-- .reveal blocks -->
</section>
```

### 1.3 Why `afterNavigate` inside the effect

You *could* call `afterNavigate` at the top of the `<script>` block — outside any effect — and it would work. We put it inside the effect so that the refresh subscription lives and dies with the effect's lifecycle. Every time the component's effect reruns (for example, if a state change rebuilt the context), a fresh `afterNavigate` subscription replaces the old one.

> **Note:** `afterNavigate` in Svelte 5 is designed to be called during component setup. Calling it inside an effect is valid because the effect body runs during the component's lifecycle and Svelte handles scope correctly. If you prefer, you can call it at the top of the script and save the returned unsubscribe function, but inside-effect is shorter.

### 1.4 The canonical navigation-safe pattern

```svelte
<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	let root: HTMLElement | undefined = $state();

	$effect(() => {
		if (!root) return;
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			// all your tweens, timelines, and ScrollTriggers
		}, root);

		afterNavigate(() => {
			ScrollTrigger.refresh();
		});

		return () => ctx.revert();
	});
</script>

<main bind:this={root}>
	<!-- page content -->
</main>
```

Four elements every time:

1. A root element ref.
2. `gsap.registerPlugin(ScrollTrigger)` inside the effect.
3. All animations inside `gsap.context`.
4. `afterNavigate(() => ScrollTrigger.refresh())` and `return () => ctx.revert()`.

Memorise this pattern. It is the foundation of every scroll-driven page in the module project.

### 1.5 When to refresh manually

`afterNavigate` handles route transitions. You also need to refresh after:

- **Images load.** If your triggers depend on images whose sizes change after load, call `ScrollTrigger.refresh()` on the image's load event, or set explicit width/height to avoid layout shift.
- **Fonts swap.** Webfonts changing size can shift content below them. Use `document.fonts.ready.then(() => ScrollTrigger.refresh())`.
- **Viewport resize.** ScrollTrigger auto-refreshes on window resize by default — you rarely need to handle this.

### 1.6 Debugging

Paste into console:

```js
ScrollTrigger.getAll().map(t => ({ trigger: t.trigger?.className, start: t.start, end: t.end }));
```

This shows every active ScrollTrigger with its trigger element and cached start/end positions. If the numbers look wildly off, you need a refresh. If the array is empty but you expected triggers, creation failed — check your effect.

## 2. Style it — A two-page demo with a lavender brand

The mini-build is actually *two* routes: the main route and a sub-route. The main route has four reveal sections; the sub-route has three pin-and-scrub blocks. A nav at the top links between them. Both use the lavender brand (`oklch(75% 0.11 295)`). The point is to navigate back and forth and see that both pages work correctly.

## 3. Interact — Proving the bug, then fixing it

The mini-build's first draft omits `afterNavigate`. Navigating between the two pages breaks the triggers after the second navigation. Adding `afterNavigate(() => ScrollTrigger.refresh())` fixes it. Students navigate back and forth five times in a row and see that the animations remain correct.

## 4. Mini-build — Navigation-safe ScrollTrigger template

**File:** `src/routes/modules/07-gsap/10-navigation/+page.svelte` (plus a sibling file `10-navigation-b/+page.svelte` for the second page)

The main page has four stacked reveal sections. The sibling page has three pinned sections. Both import the same `gsap.context` pattern with `afterNavigate` refresh. Nav links at the top of each page.

### DevTools verification

1. Load `/modules/07-gsap/10-navigation`. Scroll. Animations work.
2. Click link to sibling page. Scroll. Animations work.
3. Click back. Scroll. Animations still work.
4. In console: `ScrollTrigger.getAll().length` should match the number of animations on the current page, never grow, never shrink below expected.
5. Comment out `afterNavigate(() => ScrollTrigger.refresh())`, repeat — note that after navigating once or twice, triggers misfire.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why do ScrollTrigger caches break after a SvelteKit navigation?</summary>

ScrollTrigger measures element positions once at creation and caches them. After a SvelteKit navigation the DOM has been replaced but the trigger objects on the new page may be created before the new DOM has fully laid out — leading to stale or wrong measurements.
</details>

<details>
<summary><strong>Q2.</strong> What does <code>afterNavigate</code> do?</summary>

Runs a callback after every successful SvelteKit navigation (including the initial load), on the client, after the new DOM has been mounted and stabilised.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>ScrollTrigger.refresh()</code> do?</summary>

Re-measures every active ScrollTrigger's trigger element and recomputes its start/end positions against the current DOM. Call after layout changes that ScrollTrigger could not detect automatically.
</details>

<details>
<summary><strong>Q4.</strong> Why use <code>ctx.revert()</code> AND <code>ScrollTrigger.refresh()</code>?</summary>

They handle different problems. <code>ctx.revert()</code> tears down triggers from the *old* component. <code>ScrollTrigger.refresh()</code> re-measures triggers on the *new* component. Both are needed for a clean SvelteKit experience.
</details>

<details>
<summary><strong>Q5.</strong> How do you debug whether ScrollTrigger has stale measurements?</summary>

In the console: <code>ScrollTrigger.getAll().map(t => ({ start: t.start, end: t.end }))</code>. Compare those numbers against where you expect the triggers to fire. If they look wildly off, call <code>ScrollTrigger.refresh()</code>.
</details>

## 6. Common mistakes

- **No `afterNavigate` refresh.** The most common bug; triggers misfire after the first navigation.
- **Calling `ScrollTrigger.killAll()` instead of `ctx.revert()`.** Kills triggers from other components too.
- **Refreshing before the new DOM has mounted.** Calling refresh at the top of the script (before mount) is a no-op. It must be inside `afterNavigate` or later.
- **Forgetting image/font load refreshes.** If layout shifts after initial mount, triggers lose accuracy.

## 7. What's next

Lesson 7.11 introduces Svelte's `use:` action pattern and the July 2025 "attachments" evolution, which is the cleanest way to package a GSAP effect as a reusable directive.
