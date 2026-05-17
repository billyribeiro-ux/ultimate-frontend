---
module: 14
title: "3D Product Showcase"
duration: 180
prerequisites:
  - All Module 14 lessons (14.1–14.8)
  - Module 7 (GSAP + ScrollTrigger)
  - Module 12 (Performance patterns, error boundaries)
---

# Module 14 Project — 3D Product Showcase

## Overview

Build a scroll-driven product page featuring a GLTF model that rotates on scroll, interactive hotspots that reveal product details, post-processing bloom on hover, a physics-based "drop" animation on click, lazy-loaded canvas with poster fallback, SSR-safe rendering, and reduced-motion safety.

## Requirements

### Scene setup
- A full-viewport `<Canvas>` wrapped in `{#if browser}` for SSR safety.
- `PerspectiveCamera` with `OrbitControls` disabled during scroll-driven sections.
- `AmbientLight` + `DirectionalLight` for clean product lighting.

### Model loading
- Load a GLTF/GLB product model using `useGltf` from `@threlte/extras`.
- Show a skeleton/spinner during load via a `{#await}` pattern or Threlte's suspense.
- Handle load errors with an error boundary fallback to a static product image.

### Scroll-driven rotation
- Use GSAP ScrollTrigger to drive the model's Y-axis rotation as the user scrolls.
- Camera position also shifts subtly on scroll (Z-axis pull-back for dramatic reveal).
- All scroll animations wrapped in `gsap.context()` with proper cleanup.

### Interactive hotspots
- Place 3–4 invisible meshes at key points on the product.
- Use the `interactivity` plugin so hovering/clicking a hotspot reveals a detail panel.
- Cursor changes to `pointer` on hover via Threlte's `onpointerenter`/`onpointerleave`.

### Post-processing
- When hovering a hotspot, apply a bloom effect to highlight the relevant product area.
- Use `EffectComposer` from `@threlte/extras` with selective bloom.
- Bloom intensity animates in/out smoothly (GSAP tween on the effect parameter).

### Physics drop
- On a "Drop test" button click, enable `@threlte/rapier` physics.
- The product model gets a `RigidBody` with a `Collider`.
- A ground plane catches the model. It bounces based on restitution.
- After the animation completes (3 seconds), reset the model to its original position.

### Performance
- Lazy-load the `<Canvas>` with a dynamic import or intersection observer.
- Clamp DPR to `Math.min(window.devicePixelRatio, 2)`.
- Use `frameloop="demand"` when the scene is idle (no scroll, no hover).
- `dispose` all geometries and materials on unmount.

### Accessibility & fallback
- `prefers-reduced-motion: reduce` disables all animations and shows a static poster image instead of the 3D canvas.
- All interactive hotspots have `aria-label` attributes.
- The detail panels are keyboard-accessible.

## File structure

```
src/routes/modules/14-threlte/project/
├── +page.svelte           (main page — scroll sections + canvas)
├── ProductScene.svelte    (Threlte scene component)
├── Hotspot.svelte         (individual hotspot mesh)
├── DetailPanel.svelte     (product detail overlay)
└── product-model.glb      (static asset in /static/)
```

## Acceptance criteria

- [ ] GLTF model loads and renders in the browser
- [ ] Scroll rotates the model smoothly
- [ ] Hotspots are clickable and reveal detail panels
- [ ] Bloom activates on hotspot hover
- [ ] Physics drop works on button click
- [ ] Canvas lazy-loads (not in initial bundle)
- [ ] DPR is clamped to 2
- [ ] `prefers-reduced-motion` shows poster image fallback
- [ ] SSR does not crash (no WebGL on server)
- [ ] Lighthouse Performance score >= 90
- [ ] No TypeScript `any` types
- [ ] All GSAP contexts clean up on navigation
