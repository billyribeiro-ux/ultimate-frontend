---
module: 8
lesson: 8.11
title: Page transitions with onNavigate and View Transitions
duration: 55 minutes
prerequisites:
  - Lesson 8.8 — $app/navigation
  - Module 7 — GSAP (for motion design vocabulary)
learning_objectives:
  - Explain what the View Transitions API does and why browsers added it
  - Use onNavigate() from $app/navigation to bridge SvelteKit and the View Transitions API
  - Write a feature-detected page transition that falls back gracefully
  - Respect prefers-reduced-motion in every transition you ship
  - Combine Svelte transitions for in-page elements with view transitions for routes
status: ready
---

# Lesson 8.11 — Page transitions with `onNavigate` and View Transitions

## 1. Concept — Making the change between pages feel intentional

### 1.1 The problem — instant snaps are jarring

SvelteKit's default navigation is instant. You click a link, the new page replaces the old one on the next frame, and you have arrived. Instant is fast but it is also harsh. On mobile, where the user's thumb just committed to a decision, the abrupt swap can feel like the app forgot what the user did. On any device, a slight crossfade gives the eye time to understand the change.

Page transitions used to be hard on the web. Frameworks had to render both the old and the new page simultaneously, animate between them in JavaScript, and carefully clean up after themselves. The results were usually brittle and slow. In 2023 the **View Transitions API** landed in Chromium and has since shipped in Safari 18 — it is a browser-level primitive that turns "snap from state A to state B" into "animate smoothly from state A to state B" with one function call.

SvelteKit 2.3+ exposes a matching hook, `onNavigate`, specifically for wiring View Transitions into its navigation lifecycle.

### 1.2 The View Transitions API in one paragraph

`document.startViewTransition(callback)` does this: the browser takes a snapshot of the current DOM, calls your callback (inside which you are expected to mutate the DOM to the new state), then animates between the two snapshots using CSS pseudo-elements. The default animation is a crossfade, but you can style `::view-transition-old(root)` and `::view-transition-new(root)` to get slides, zooms, morphs or anything else CSS can express.

Crucially, the animation runs **on the compositor**, not the main thread. It is fast, it is smooth, and it respects `prefers-reduced-motion` when you ask it to.

### 1.3 `onNavigate` — the SvelteKit bridge

SvelteKit's navigation is not a direct DOM swap — it fetches the new load data, renders the new component tree, and mounts it. `onNavigate` is the hook that fires immediately before SvelteKit commits the new page.

```svelte
<script lang="ts">
    import { onNavigate } from '$app/navigation';

    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });
</script>
```

The pattern looks odd. Here is what it does:

1. `onNavigate` returns a promise. SvelteKit waits for that promise before committing the DOM update.
2. Inside the promise, we call `document.startViewTransition(cb)`. The browser takes a snapshot of the current DOM *right now*.
3. Our callback resolves the outer promise. SvelteKit is unblocked and proceeds to mutate the DOM to the new page.
4. We `await navigation.complete` so the callback does not return until SvelteKit has finished mutating.
5. When the callback returns, the browser takes the "new" snapshot and animates between the two.

Place this code inside your root `+layout.svelte` and every route transition gets a crossfade for free.

### 1.4 Feature detection and fallback

Older browsers do not have `document.startViewTransition`. Your code must feature-detect:

```ts
if (!document.startViewTransition) {
    return; // SvelteKit falls back to its normal instant navigation
}
```

This is enough. SvelteKit will skip the promise and commit the new page immediately, exactly as before. No polyfill is required.

### 1.5 Respecting `prefers-reduced-motion`

Some users have configured their OS to minimise motion. For them, even a 250 ms crossfade can cause nausea or cognitive load. The PE7 `app.css` already injects a global rule that collapses any CSS transition to effectively zero duration when `prefers-reduced-motion: reduce` is set. That rule also applies to `::view-transition-*` pseudo-elements, so your transitions are automatically neutralised for users who asked for less motion. Always verify this by toggling the OS setting and reloading.

### 1.6 Svelte transitions vs view transitions

You already know Svelte's `transition:` directive from Module 6. It animates an element as it enters or leaves the DOM. That is for *in-page* motion — a dropdown opening, a list item leaving, a modal appearing. View Transitions are for *across-page* motion — the swap between two routes. They are different tools, and you use both. Do not try to implement page transitions with the `transition:` directive; that is the old, brittle approach.

### 1.7 Styling the transition itself

You can override the default crossfade with CSS on the root view transition pseudo-elements:

```css
::view-transition-old(root) {
    animation: fade-out 180ms var(--ease-out) both;
}

::view-transition-new(root) {
    animation: fade-in 220ms var(--ease-out) both;
}
```

For named transitions (where specific elements morph between pages), you tag elements with `view-transition-name: hero;` in CSS and the browser animates that element between its old and new positions. We cover the tagged morph pattern in Module 12's performance work — for this lesson, the root fade is enough.



## Going Deeper

**Official documentation:**
- [SvelteKit docs: onNavigate](https://svelte.dev/docs/kit/$app-navigation#onNavigate)
- [MDN: View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [Chrome: View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions/)

**Advanced pattern:** Add a crossfade view transition to the root layout. Style it with a slide effect using `::view-transition-old` and `::view-transition-new` CSS.

**Challenge question:** (Combines Lessons 8.11, 8.8, and 6.11) Build a page transition that uses View Transitions for route changes AND Svelte transitions for in-page element mount/unmount. Verify both respect reduced motion independently.

## Deep Dive

**Why this matters at scale.** Page transitions make navigation feel intentional. View Transitions API provides browser-native cross-document animation.

**The mental model.** onNavigate provides the hook. Call document.startViewTransition() inside it. SvelteKit handles the async lifecycle. The old page snapshot animates to the new page render.

**Edge cases.** View Transitions require careful handling of layout shifts. Elements that move between pages need view-transition-name CSS. Async content that loads after transition causes visual glitches.

**Performance implications.** View Transitions run on the compositor thread and are highly performant. The snapshot is a raster image, so complex pages do not slow the transition.

**Connection to other modules.** Module 7's GSAP complements for complex choreography. Module 6's CSS transitions provide animation primitives. Module 12's performance addresses transition impact on INP.

## 2. Style it — PE7 for a hub page with transition links

The mini-build is a two-page hub: one index page with two coloured cards, and one detail page per card. Clicking a card navigates; a view transition crossfades between them. We use PE7 OKLCH tokens with distinct per-card accents. Every interactive element hits the 44px minimum.

## 3. Interact — `onNavigate` in a layout

We add a local `+layout.svelte` for this lesson's subtree that sets up the view transition hook. It is scoped to this folder, so it does not affect the whole site. Inside the layout:

```svelte
<script lang="ts">
    import { onNavigate } from '$app/navigation';
    import type { Snippet } from 'svelte';

    interface Props { children: Snippet; }
    let { children }: Props = $props();

    onNavigate((navigation) => {
        if (typeof document === 'undefined' || !document.startViewTransition) return;
        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });
</script>

{@render children()}
```

The `typeof document === 'undefined'` guard prevents the code from running on the server, where `document` is not defined.

## 4. Mini-build — a three-route transition playground

**Paths:**

- `src/routes/modules/08-routing/11-page-transitions/+layout.svelte`
- `src/routes/modules/08-routing/11-page-transitions/+page.svelte`
- `src/routes/modules/08-routing/11-page-transitions/sunrise/+page.svelte`
- `src/routes/modules/08-routing/11-page-transitions/nightfall/+page.svelte`

Open `/modules/08-routing/11-page-transitions`. Click **Sunrise** or **Nightfall**. The page crossfades in. Click the back link and it crossfades out.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does SvelteKit provide <code>onNavigate</code> instead of expecting you to call <code>document.startViewTransition</code> yourself?</summary>

Because SvelteKit's navigation is not a direct DOM mutation — it involves running load functions and mounting new components. `onNavigate` is the precise moment when the browser needs its "before" snapshot; calling `startViewTransition` anywhere else would miss the DOM mutation.
</details>

<details>
<summary><strong>Q2.</strong> What does the promise returned from the <code>onNavigate</code> callback control?</summary>

It controls when SvelteKit is allowed to commit the new page. `startViewTransition` takes a callback that must eventually mutate the DOM; we resolve the outer promise inside that callback so SvelteKit mutates at the right moment.
</details>

<details>
<summary><strong>Q3.</strong> How do you make a page transition disappear for users who set <code>prefers-reduced-motion</code>?</summary>

The PE7 global stylesheet already collapses all `transition-duration` and `animation-duration` to nearly zero under `prefers-reduced-motion: reduce`, and that rule applies to the `::view-transition-*` pseudo-elements. Verify by toggling the OS setting and reloading.
</details>

<details>
<summary><strong>Q4.</strong> What happens in a browser that does not support <code>document.startViewTransition</code>?</summary>

The feature-detection guard returns early and `onNavigate` does nothing. SvelteKit then commits the new page instantly, as it would without any transition setup. No polyfill is needed.
</details>

<details>
<summary><strong>Q5.</strong> Is the <code>transition:</code> directive from Svelte the same as a view transition?</summary>

No. `transition:` animates individual elements as they enter or leave the DOM inside a page. View Transitions animate the whole route change from one page to the next. Use both — one for in-page motion, one for across-page motion.
</details>

## 6. Common mistakes

- **Calling `startViewTransition` outside `onNavigate`.** The browser takes the snapshot at the moment you call it. If that moment is not "immediately before SvelteKit mutates", the animation will miss the change.
- **Skipping the `typeof document === 'undefined'` guard.** The code in `onNavigate` runs on the server during SSR. Without the guard, `document.startViewTransition` throws.
- **Writing massive `::view-transition-new(root)` animations.** Keep them short (150–300 ms) and subtle. A long, flashy transition looks amateur and gets in the way of actually using the site.
- **Forgetting to test with `prefers-reduced-motion: reduce`.** Every animation must degrade gracefully. Toggle the setting in OS settings or DevTools → Rendering → Emulate CSS media feature.

## 7. What's next

Lesson 8.12 zooms out and shows the four rendering modes (SSR, SSG, CSR, hybrid) in one application, with a decision matrix for picking the right mode per route.
