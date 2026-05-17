---
module: 14
lesson: 14.5
title: Scroll-driven 3D scenes
duration: 45
prerequisites:
  - "14.4 — Interactivity"
  - "7.9 — ScrollTrigger with SvelteKit"
  - "7.10 — ScrollTrigger + navigation"
learning_objectives:
  - Connect GSAP ScrollTrigger to Threlte scene properties
  - Drive camera position and mesh rotation from scroll position
  - Use $effect for cleanup-safe scroll animation in SvelteKit
  - Build a scroll-driven product reveal animation
  - Handle navigation cleanup with gsap.context().revert()
status: ready
---

# Lesson 14.5 — Scroll-driven 3D scenes

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build.

## 1. Concept — scroll as a timeline scrubber for 3D

### 1.1 What the problem is

Traditional 3D demos auto-animate — the model spins endlessly, lights pulse, the camera orbits. This is passive. The user watches but does not control. For marketing pages and product showcases, you want the user's scroll to drive the 3D experience. As they scroll, the product rotates to reveal features, the camera pulls back for a dramatic wide shot, and text panels sync with specific camera angles.

The challenge: Three.js has no concept of scroll. The render loop runs at 60fps regardless of scroll. You need a bridge between the DOM scroll position and Three.js object properties (position, rotation, scale, material opacity).

### 1.2 GSAP ScrollTrigger as the bridge

GSAP ScrollTrigger maps a scroll range to a tween progress (0 to 1). When `scrub` is enabled, the tween's progress follows the scroll position rather than playing on a timeline. This is exactly what you need for scroll-driven 3D:

1. Create a GSAP tween that animates a Three.js object's rotation from 0 to `Math.PI * 2`.
2. Attach a ScrollTrigger with `scrub: true` that maps the tween to the scroll range.
3. As the user scrolls, the rotation updates frame-by-frame in sync.

The `scrub` value controls smoothness: `scrub: true` is instantaneous (1:1 with scroll), `scrub: 0.5` adds 0.5 seconds of smooth catch-up (more cinematic).

### 1.3 Accessing Three.js objects for GSAP

GSAP needs a reference to the Three.js object to animate its properties. In Threlte, use `bind:ref` on `<T.Mesh>` to get the `THREE.Mesh` instance:

```
let meshRef = $state<THREE.Mesh | undefined>();
// ...
<T.Mesh bind:ref={meshRef}>
```

Then in a `$effect`, pass `meshRef.rotation` to GSAP:

```
gsap.to(meshRef.rotation, { y: Math.PI * 2, scrollTrigger: { ... } });
```

### 1.4 Animating camera position

The camera is also a Three.js object. You can animate its position to create dramatic pull-backs or fly-throughs:

```
gsap.to(cameraRef.position, { z: 10, scrollTrigger: { scrub: 0.5 } });
```

As the user scrolls, the camera smoothly pulls back, revealing more of the scene. Combined with mesh rotation, this creates a "product unboxing" feel.

### 1.5 Cleanup is critical in SvelteKit

SvelteKit navigates between pages without full page reloads. ScrollTrigger instances persist unless explicitly killed. The pattern:

1. Wrap all GSAP code in `gsap.context(() => { ... }, containerElement)`.
2. In the `$effect` return function, call `ctx.revert()`.
3. This kills all tweens and ScrollTriggers created within the context.

Without cleanup, navigating away and back creates duplicate ScrollTriggers that fight each other.

### 1.6 Reduced motion

Users with `prefers-reduced-motion: reduce` should not experience scroll-driven animations. Check `prefersReducedMotion` from `svelte/motion` and skip the GSAP setup entirely. Show the model at its final resting state (e.g., rotation already at the "revealed" angle).

## 2. Style it — PE7 applied to this lesson's mini-build

The scroll-driven page uses tall sections to create scroll distance:

- Each section is `min-block-size: 100vh` to give ScrollTrigger room.
- The 3D canvas is `position: sticky; inset-block-start: 0` so it stays visible while text scrolls past.
- Text panels use PE7 glass-morphism: `background: oklch(from var(--color-surface-2) l c h / 80%)` with `backdrop-filter: blur(8px)`.
- Mobile-first: the sticky canvas takes full width on mobile, constrained to 60% on desktop with text alongside.

## 3. Interact — gsap.context + $effect for lifecycle-safe animation

The TypeScript concept: **GSAP context as a scope for cleanup**. `gsap.context()` returns an object with a `.revert()` method that undoes everything created inside it — tweens, ScrollTriggers, set values. By calling `.revert()` in the `$effect` cleanup, you guarantee no animation survives navigation.

The mistake: creating ScrollTriggers in `$effect` without a context, then manually trying to kill each one. If you miss one, it leaks. The context pattern is foolproof.

## 4. Mini-build — scroll-rotating product with camera pull-back

**File:** `src/routes/modules/14-threlte/05-scroll-driven-3d/+page.svelte`

See the accompanying route file for the full working component.

**DevTools moment:** Open ScrollTrigger's visual markers by adding `markers: true` to your ScrollTrigger config. You'll see start/end indicators on the page showing exactly where the animation begins and ends relative to scroll position.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> What does `scrub: 0.5` do differently from `scrub: true`?</summary>

`scrub: true` (equivalent to `scrub: 0`) ties the animation progress directly to scroll with no smoothing — it jumps instantly. `scrub: 0.5` adds 0.5 seconds of eased catch-up, making the animation smoothly interpolate to the current scroll position. This creates a more cinematic, less jittery feel.
</details>

<details>
<summary><strong>Q2.</strong> Why do you need `gsap.context()` for ScrollTrigger cleanup in SvelteKit?</summary>

SvelteKit uses client-side navigation — components mount and unmount without full page reloads. ScrollTriggers created without a context persist globally. `gsap.context()` groups all animations and ScrollTriggers so `.revert()` can kill them all at once during the `$effect` cleanup, preventing leaks across navigations.
</details>

<details>
<summary><strong>Q3.</strong> How do you get a reference to a Three.js Mesh object in Threlte for GSAP to animate?</summary>

Use `bind:ref` on the `<T.Mesh>` component: `<T.Mesh bind:ref={meshRef}>`. This binds the underlying `THREE.Mesh` instance to your `$state` variable. In a `$effect`, you can then pass `meshRef.rotation` or `meshRef.position` directly to `gsap.to()`.
</details>

<details>
<summary><strong>Q4.</strong> What should happen for users with `prefers-reduced-motion: reduce`?</summary>

The scroll-driven animations should be completely skipped. Instead of creating GSAP tweens, immediately set the model to its final "revealed" state (e.g., the intended rotation and camera position). The user sees the end result without any motion.
</details>

<details>
<summary><strong>Q5.</strong> Why make the 3D canvas `position: sticky` in a scroll-driven layout?</summary>

Sticky positioning keeps the canvas visible in the viewport while surrounding text content scrolls past it. This creates the illusion that the 3D scene responds to scroll while remaining constantly visible — the standard layout pattern for scroll-driven storytelling.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Animating Three.js properties that require manual update.** Some properties (like `material.opacity`) need the material to be marked as `transparent: true` before opacity animation works. Camera `fov` changes require calling `camera.updateProjectionMatrix()` after the tween.

2. **Creating ScrollTrigger before the DOM element exists.** The `trigger` element must be in the DOM when ScrollTrigger initializes. In `$effect`, this is guaranteed (effects run after mount), but if you try to set up ScrollTrigger in `<script>` top-level code, the element has not mounted yet.

3. **Using the wrong scroll container.** By default, ScrollTrigger uses `window` scroll. If your layout uses a scrollable container (e.g., `overflow-y: auto` on a wrapper), you must configure ScrollTrigger's `scroller` option to point to that container.

4. **Not calling `ScrollTrigger.refresh()` after navigation.** When SvelteKit navigates and the DOM changes height, ScrollTrigger's cached measurements become stale. Call `ScrollTrigger.refresh()` in `afterNavigate()` to recalculate trigger positions.

## 7. What's next — one sentence

Next lesson: you'll add cinematic post-processing effects — bloom, vignette, and chromatic aberration — to make your 3D scenes look polished.
