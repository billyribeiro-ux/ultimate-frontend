---
module: 12
lesson: 12.12
title: 3D Performance with Threlte — lazy canvas, DPR, frameloop demand
duration: 60 minutes
prerequisites:
  - Lesson 7.14 — Threlte basics
  - Lesson 12.3 — code splitting with dynamic imports
  - Lesson 12.6 — Svelte actions and IntersectionObserver
learning_objectives:
  - Decide when 3D is worth the cost and when it will destroy your INP
  - Lazy-load a <Canvas> component via {#await import('./Scene.svelte')}
  - Clamp DPR with dpr={[1, 2]} to cap GPU work on retina displays
  - Switch a Canvas to frameloop="demand" so it only renders when something changes
  - Pause the animation when the canvas scrolls off-screen
  - Render a static poster image when prefers-reduced-motion is on
status: ready
---

# Lesson 12.12 — 3D Performance with Threlte

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This is the last lesson of Module 12, and the most unusual. WebGL canvases are where web performance goes to die — or where it earns its best demo reel, depending entirely on whether you apply the patterns in this lesson.

## 1. Concept — 3D is a performance amplifier, for better or worse

### 1.1 When 3D is worth it

A `<canvas>` running WebGL is an entire second rendering pipeline the browser runs in parallel with the DOM. It unlocks visual effects — lit meshes, real-time reflections, parallax, physics — that simply cannot be done with CSS and SVG. When your brand or product genuinely benefits from that layer of polish (a 3D landing hero for a luxury product, an interactive model viewer for a piece of furniture, a data-visualization globe), Threlte is a good tool.

When 3D is *not* worth it: decorative spinning logos on a brochure site, "wow factor" animations that repeat every second of the user's visit, backgrounds that most users will ignore. Every WebGL canvas consumes GPU memory and CPU time. If the benefit to the user is cosmetic, the cost is real.

A good test: **show the page with the canvas hidden and ask whether the page still does its job.** If yes, the canvas is decorative — it belongs behind a lazy-load gate and a reduced-motion guard. If the canvas *is* the job, it deserves the bundle cost. Either way, the techniques in this lesson protect your users.

### 1.2 The INP hit

The single worst 3D-performance mistake is running the canvas at full `requestAnimationFrame` for the entire life of the page. Threlte's default `frameloop="always"` does exactly this: every frame, the canvas schedules a render, the GPU runs a draw call, the main thread waits for it. When the user clicks a button, the main thread is already busy, and the interaction's response slips past the 200 ms INP threshold. Your Lighthouse score drops even if the canvas looks pretty.

The fix is a combination of four techniques, and this lesson covers all four:

1. **Lazy-load the canvas.** Do not ship the 3D code to users who will never see it.
2. **Clamp DPR.** Cap the device-pixel-ratio so a retina phone does not render 4× the pixels of a standard phone.
3. **`frameloop="demand"`.** Render frames only when something in the scene has changed.
4. **Pause on off-screen.** Do not render at all when the canvas is scrolled out of view.

Add a fifth for accessibility: **respect `prefers-reduced-motion`**. If the user has told the OS they do not want animations, render a static poster image instead of a canvas. No 3D. No animation. No cost.

### 1.3 Lazy-loading the canvas

Lesson 12.3 taught dynamic imports. This is the canonical use case. The page's initial chunk should contain zero bytes of Three.js. Only when the user scrolls the hero into view does the canvas code load.

```svelte
<script lang="ts">
	let shouldLoad = $state<boolean>(false);
</script>

<div class="hero" use:intersect={{ onEnter: () => (shouldLoad = true), threshold: 0.1 }}>
	{#if shouldLoad}
		{#await import('./Scene.svelte') then { default: Scene }}
			<Scene />
		{/await}
	{/if}
</div>
```

`intersect` is the action from Lesson 12.6. When the hero scrolls within 10 % of the viewport, `shouldLoad` flips to true, the dynamic import starts, and the scene mounts when the chunk arrives. Users who never scroll to the hero never download Three.js. Users who land on other pages never download Three.js either.

SSR safety: `<Canvas>` from Threlte depends on `window` and WebGL, neither of which exists during server-side rendering. Dynamic imports gated by `{#if shouldLoad}` are inherently SSR-safe because the import only runs in response to a client-side event. There is no canvas in the SSR'd HTML at all.

### 1.4 DPR clamping

`dpr` is the device-pixel-ratio Threlte's `<Canvas>` will use for its backing framebuffer. Higher DPR means sharper rendering but quadratically more pixels to shade. On a 3× retina phone, a 1 000 × 500 canvas becomes a 3 000 × 1 500 framebuffer — 4.5 million pixels per frame instead of 500 000. That is nine times the GPU work for a visual improvement most users do not notice.

Clamp with a tuple:

```svelte
<Canvas dpr={[1, 2]} frameloop="demand">
	<!-- ... -->
</Canvas>
```

`[1, 2]` tells Threlte "the minimum DPR is 1, the maximum is 2". Users on a regular screen get 1, users on a retina screen get 2, users on a 3× screen also get 2. The ceiling of 2 is almost always the right call for full-width 3D on the web. On a mobile phone at 2 you still get crisp output; above 2 is waste.

### 1.5 `frameloop="demand"`

`frameloop="always"` (the default) renders a frame every 16.67 ms, forever, regardless of whether anything in the scene has changed. `frameloop="demand"` renders a frame only when Threlte detects that something has changed — a mesh moved, a camera moved, a uniform updated. For a scene that reacts to scroll or to occasional state changes, demand mode reduces the framerate from 60 FPS to "whenever it is needed", which might be 2 FPS during active scroll and zero when the scene is static.

The saving is enormous. A canvas in demand mode that the user interacts with for three seconds of a 30-second visit uses roughly 10 % of the GPU time a canvas in always mode would use. That reclaimed budget goes to INP and to other parts of the page.

The trick with demand mode is ensuring Threlte knows when the scene has changed. Bindings to reactive state trigger automatic invalidation; manual imperative mutations (for example, mutating a Three.js object directly via a `useThrelte` ref) need an explicit `invalidate()` call to schedule a frame. For most Svelte-idiomatic Threlte code, the automatic path works without extra work.

### 1.6 Pause on off-screen

Demand mode already pauses rendering when nothing changes, but some scenes have continuous animation (a slow rotating torus, for example) that keeps the frame loop running even when the user has scrolled away. For those, use the `intersect` action to pause the animation entirely:

```svelte
<script lang="ts">
	import { intersect } from '$lib/actions/intersect.svelte';
	let visible = $state<boolean>(true);
</script>

<div
	class="canvas-wrap"
	use:intersect={{ onEnter: () => (visible = true), onLeave: () => (visible = false) }}
>
	{#if visible}
		<Canvas dpr={[1, 2]} frameloop="demand">
			<!-- scene here -->
		</Canvas>
	{/if}
</div>
```

When the canvas leaves the viewport, it unmounts entirely. When it returns, it remounts. The brief remount cost is trivial; the saved frames of off-screen rendering are substantial.

### 1.7 `prefers-reduced-motion` — a poster image instead

Some users have vestibular disorders, migraine sensitivities, or simply a preference for a quieter web. The OS-level `prefers-reduced-motion` setting lets them tell every site to calm down. Your 3D hero must listen:

```svelte
<script lang="ts">
	let reducedMotion = $state<boolean>(false);

	$effect(() => {
		if (typeof window === 'undefined') return;
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mq.matches;
		const onChange = (e: MediaQueryListEvent) => (reducedMotion = e.matches);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});
</script>

{#if reducedMotion}
	<img src="/hero-poster.jpg" alt="3D hero scene" width="1600" height="900" />
{:else if shouldLoad}
	{#await import('./Scene.svelte') then { default: Scene }}
		<Scene />
	{/await}
{/if}
```

The poster image is a still frame captured from the scene at build time. It has `width` and `height` for CLS-safety, `alt` text for accessibility, and zero runtime cost. Users who asked for no motion get a beautiful still; everyone else gets the full scene. No compromise, no guilt.

### 1.8 GPU memory profiling

Chrome DevTools → Performance Monitor → GPU memory shows live usage of the video card. Open it, reload your page, and watch the number. A 3D hero should consume a few megabytes of VRAM; if it consumes hundreds, something is wrong — usually textures that are far larger than the output size, or a failure to dispose of materials and geometries on unmount. Threlte cleans up most of this automatically if you unmount the `<Canvas>`, which the lazy-load pattern above does naturally. If you see memory climb on repeated navigation, confirm that the canvas actually unmounts (it should, because `{#if visible}` controls its existence).

## Deep Dive

**Why this matters at scale.** 3D is the most expensive browser rendering. Lazy loading, reduced DPR, and frameloop='demand' eliminate wasted GPU cycles.

**The mental model.** Lazy <Canvas> defers Three.js initialization. DPR capping reduces pixel count on retina displays. frameloop='demand' only renders when state changes.

**Edge cases.** Three.js is 600KB+ gzipped. Lazy loading prevents this from blocking initial page render. The poster-image pattern provides content while 3D loads.

**Performance implications.** A 60fps 3D scene consumes 16ms per frame for rendering alone. Reducing DPR from 2 to 1.5 cuts pixel count by 44%. frameloop='demand' drops GPU usage to zero when idle.

**Connection to other modules.** Module 7's GSAP applies to 3D objects. Module 13's LCP optimization addresses poster-image fallback.

## 2. Style it — A hero-sized box that behaves

The mini-build renders a full-width hero with the `.hero` class occupying a fixed aspect ratio, so there is no CLS regardless of whether the 3D loads or the poster appears. Per-page accent: `oklch(70% 0.2 260)` (threlte blue).

- Aspect ratio 16:9 reserved via `aspect-ratio: 16 / 9`.
- `loading="eager"` on the poster image (this is the LCP candidate when reduced motion is on).
- `fetchpriority="high"` on the poster image.

## 3. Interact — See the guards in action

Students toggle their OS reduced-motion setting and reload the page. They see the canvas in one case and the poster in the other. They scroll past the hero and back and watch the canvas unmount and remount. They open the Network tab on first load and confirm that `Scene.svelte`'s chunk does not download until they scroll to the hero.

## 4. Mini-build — A lazy, reduced-motion-safe 3D hero

**File:** `src/routes/modules/12-performance/12-3d-performance/+page.svelte`
**Companion:** `src/routes/modules/12-performance/12-3d-performance/Scene.svelte`

The page uses the intersect action, a reduced-motion guard, and a dynamic import to load the scene only when appropriate. The scene itself is a small rotating PE7-coloured torus driven by Threlte.

### DevTools moment

Open Network, filter JS, and reload. `Scene.svelte` is not in the initial chunks. Scroll to the hero — a new chunk loads. Open Performance Monitor → GPU memory and watch it climb by a few MB. Scroll the hero off-screen — the canvas unmounts and GPU memory drops. Enable `prefers-reduced-motion` in the Rendering panel and reload — no canvas chunk ever downloads; the poster image is LCP.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What are the four techniques that keep 3D from destroying INP?</summary>

Lazy-load the canvas, clamp DPR, use `frameloop="demand"`, and pause when off-screen. Add `prefers-reduced-motion` fallback for accessibility; that is five total.
</details>

<details>
<summary><strong>Q2.</strong> Why does <code>dpr={[1, 2]}</code> matter on a 3× retina phone?</summary>

Without the cap, a 1 000 × 500 canvas becomes 3 000 × 1 500 = 4.5 M pixels per frame on a 3× device. Capping at 2 brings it to 2 000 × 1 000 = 2 M pixels, less than half the GPU work, with no perceivable visual difference on that screen size.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>frameloop="demand"</code> do?</summary>

It tells Threlte to render a frame only when something in the scene has changed — a mesh moved, a camera moved, a uniform updated. Static scenes render zero frames until they need to; user-interactive scenes render only when the user is interacting. The GPU savings are typically 90 % or more.
</details>

<details>
<summary><strong>Q4.</strong> Why is the lazy-load pattern <code>{#if shouldLoad}{#await import('./Scene.svelte')}</code> SSR-safe?</summary>

The dynamic import only runs when `shouldLoad` becomes true, which only happens in response to a client-side event (the `IntersectionObserver` firing). On the server, `shouldLoad` stays false and the import is never called. The server-rendered HTML contains no canvas at all, so there is no attempt to touch `window` or WebGL during SSR.
</details>

<details>
<summary><strong>Q5.</strong> What should a user with reduced motion enabled see?</summary>

A static poster image of the scene, with `width` and `height` for CLS safety and `alt` text for accessibility. No canvas, no animation, no 3D code downloaded. The user's preference is respected completely, and the visual design is preserved as a still frame.
</details>

## 6. Common mistakes

- **Shipping Threlte in the initial bundle.** 500 KB before the user has even scrolled. Lazy-load it.
- **Leaving `frameloop="always"`.** Every page-view pays the full 60 FPS cost even when nothing is happening on screen.
- **No DPR cap on mobile.** 3× retina phones cook themselves.
- **Ignoring `prefers-reduced-motion`.** Inaccessible and disrespectful; also an easy Lighthouse ding.

## 7. What's next

This is the last lesson of Module 12 and of Part II of the course. The module project brings everything together into a production-ready SvelteKit application, and Module 13 pivots to SEO — including a second 3D lesson (13.15) that combines today's techniques with Google's indexing requirements.
