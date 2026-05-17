---
module: 14
lesson: 14.8
title: Production 3D
duration: 45
prerequisites:
  - "14.7 — Physics with Rapier"
  - "12.1 — Performance fundamentals"
  - "12.12 — 3D Performance with Threlte"
learning_objectives:
  - Lazy-load the Canvas component to reduce initial bundle size
  - Clamp device pixel ratio to prevent GPU overload on high-DPI screens
  - Configure frameloop="demand" for idle scenes
  - Dispose geometries and materials properly on unmount
  - Implement prefers-reduced-motion fallback to a poster image
  - Ensure SSR safety with the {#if browser} pattern
status: ready
---

# Lesson 14.8 — Production 3D

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build.

## 1. Concept — shipping 3D without destroying performance

### 1.1 What the problem is

3D on the web is expensive. A Threlte scene with post-processing, a GLTF model, and physics adds significant weight to your page:

- **Bundle size:** Three.js is ~600KB minified. Adding Rapier WASM adds another ~400KB. The user downloads over 1MB of 3D code before anything renders.
- **GPU load:** Rendering a 3D scene at 60fps consumes significant GPU resources. On mobile (where GPU power is limited and battery matters), this can tank Core Web Vitals.
- **DPR multiplication:** A high-DPI screen (3x on modern phones) triples the pixel count the GPU must shade. A 1080p canvas becomes effectively 3240p internally.
- **Always-on render loop:** By default, the canvas re-renders every frame (60 times per second) even when nothing moves. This wastes battery and GPU cycles.

Production 3D means shipping the experience only when needed, at the quality level the device can handle, and stopping work when idle.

### 1.2 Lazy loading the Canvas

The first optimization: do not load Three.js until the user needs it. Use dynamic import or intersection observer:

**Intersection observer pattern:**
1. Render a placeholder (poster image) in place of the canvas.
2. When the placeholder scrolls into view (IntersectionObserver triggers), dynamically import the scene component.
3. Replace the placeholder with the live canvas.

This keeps Three.js out of the initial bundle. Users who never scroll to the 3D section never download it.

**Dynamic import in SvelteKit:**
```svelte
{#if shouldLoad}
    {#await import('./ProductScene.svelte') then { default: Scene }}
        <Scene />
    {/await}
{/if}
```

### 1.3 DPR clamping

Device pixel ratio (DPR) tells you how many physical pixels represent one CSS pixel. Modern phones have DPR 3. Rendering a 3D canvas at DPR 3 means shading 9x as many pixels as DPR 1.

The fix: clamp DPR to 2 maximum. The visual quality difference between DPR 2 and DPR 3 is negligible on small screens, but the performance cost is 50% more pixels.

In Threlte, set the `dpr` prop on `<Canvas>`:

```svelte
<Canvas dpr={Math.min(window.devicePixelRatio, 2)}>
```

### 1.4 frameloop="demand"

By default, Threlte renders every frame. For scenes that are often static (waiting for interaction), this wastes resources. `frameloop="demand"` tells Threlte to only render when something changes:

```svelte
<Canvas frameloop="demand">
```

Renders happen only when:
- A reactive prop changes (triggering a re-render).
- You explicitly call `invalidate()` from Threlte's context.
- An animation (useFrame) is active.

For scroll-driven scenes, combine `frameloop="demand"` with explicit invalidation from your GSAP callbacks.

### 1.5 Dispose patterns

Three.js allocates GPU memory for geometries, materials, and textures. If you remove a mesh from the scene without calling `.dispose()`, the GPU memory leaks. Over time (especially with navigation), this crashes the tab.

Threlte handles disposal automatically when components unmount. But if you manually create Three.js objects (e.g., `new THREE.TextureLoader().load(...)` in a `$effect`), you must dispose them in the cleanup:

```
$effect(() => {
    const texture = new THREE.TextureLoader().load('/image.png');
    return () => texture.dispose();
});
```

### 1.6 prefers-reduced-motion fallback

Users who enable reduced motion should not see a 3D scene that moves. The correct behavior:

1. Check `prefersReducedMotion` from `svelte/motion`.
2. If reduced motion is preferred, render a static poster image instead of the Canvas.
3. The poster should be a pre-rendered screenshot of the 3D scene at its "hero" angle.

This is also your progressive enhancement story: users on very low-power devices, users with JavaScript disabled, and users with screen readers all benefit from the poster fallback.

### 1.7 SSR safety (recap)

Three.js crashes on the server because there is no WebGL context. Always wrap `<Canvas>` in `{#if browser}`:

```svelte
{#if browser}
    <Canvas> ... </Canvas>
{:else}
    <img src="/hero-poster.webp" alt="Product showcase" />
{/if}
```

The server renders the `{:else}` branch (the poster image). Hydration replaces it with the live canvas.

### 1.8 Putting it all together — the production checklist

1. Lazy-load: Canvas not in initial bundle.
2. DPR clamp: Max 2.
3. frameloop: "demand" when idle.
4. Dispose: All manually-created resources cleaned up.
5. Reduced motion: Poster image fallback.
6. SSR: `{#if browser}` guard.
7. Error boundary: Graceful fallback on WebGL failure.
8. Loading state: Placeholder while model downloads.

### 1.9 WebGL context loss recovery

WebGL contexts can be "lost" by the browser — typically when the GPU is under memory pressure, when the device sleeps and wakes, or when another application claims exclusive GPU access. When context is lost, all textures, buffers, and programs are destroyed. Your scene goes blank.

Three.js partially handles context restoration: it recreates buffers and programs automatically. But textures loaded from URLs may not be reloaded unless you handle the `webglcontextrestored` event:

```typescript
$effect(() => {
    const canvas = canvasRef?.querySelector('canvas');
    if (!canvas) return;

    const handleLost = (e: Event) => { e.preventDefault(); };
    const handleRestored = () => { /* reload textures, invalidate */ };

    canvas.addEventListener('webglcontextlost', handleLost);
    canvas.addEventListener('webglcontextrestored', handleRestored);

    return () => {
        canvas.removeEventListener('webglcontextlost', handleLost);
        canvas.removeEventListener('webglcontextrestored', handleRestored);
    };
});
```

In most applications, the simplest recovery is to unmount and remount the entire `<Canvas>` component, which rebuilds the WebGL context from scratch. For applications where state must persist across context loss (complex editors), manual texture re-upload is required.

### 1.10 Error boundaries for WebGL failure

Not all browsers and devices support WebGL. Old phones, locked-down corporate machines, and browsers with WebGL disabled for security will fail to create the rendering context. Your 3D feature must degrade gracefully:

```svelte
<svelte:boundary>
    {#if browser}
        <Canvas><!-- your scene --></Canvas>
    {/if}
    {#snippet failed(error)}
        <div class="poster-fallback">
            <img src="/hero-poster.webp" alt="Product showcase" />
            <p>3D view is not available on this device.</p>
        </div>
    {/snippet}
</svelte:boundary>
```

The error boundary catches the WebGL creation failure and renders the poster fallback. The user still sees the product — just not in 3D. This is progressive enhancement in its purest form.

### 1.11 Measuring real performance

Do not guess whether your 3D scene is fast enough. Measure it. Threlte exposes frame timing that you can monitor during development:

1. **Chrome DevTools Performance tab** — Record 5 seconds of interaction. Look for frames exceeding 16.6ms (the budget for 60fps). Long frames indicate your render or physics step is too expensive.
2. **`stats.js`** — A small FPS counter overlay. Import it and add to your dev scene for constant monitoring.
3. **`renderer.info`** — Access via `bind:ref` on the canvas or Threlte's context. Shows draw calls, triangles, and textures per frame. High draw call counts (>100) suggest you need instancing or geometry merging.

In production, consider logging frame rate percentiles (p50, p95) to your analytics to understand real-world performance across your user base's devices.

### 1.12 Bundle splitting strategy

Three.js is ~600KB minified. With Rapier WASM (~400KB), extras, and your own scene code, the 3D portion of your app can easily exceed 1.5MB. The key insight: users who never scroll to the 3D section should never download this code.

SvelteKit's dynamic imports handle this automatically:

```svelte
{#await import('./ProductScene.svelte') then { default: Scene }}
    <Scene />
{/await}
```

Vite splits the imported module (and all its dependencies, including Three.js) into a separate chunk. The chunk downloads only when the `import()` executes. Combined with IntersectionObserver triggering, Three.js stays out of the critical rendering path entirely.

Verify this in the Network tab: on initial page load, no `three` chunks appear. Scroll to the 3D section: the chunks download on demand.

## Deep Dive

**Why this matters at scale.** Every production 3D deployment eventually hits a performance crisis. A stakeholder adds a higher-poly model. A designer wants more post-processing effects. A product manager requests 3D on the mobile landing page. Without the optimization toolkit from this lesson, each of these requests creates a performance regression that takes days to debug. Teams that internalize the production checklist can say "yes" to new 3D features because they know how to pay for them with optimization — lazy loading, DPR clamping, demand rendering, and graceful degradation.

**The mental model.** Think of production 3D as a budget. You have a frame budget (16.6ms), a download budget (aim for under 500KB for 3D-related code on initial paint), and a GPU memory budget (varies by device, but 256MB is a safe floor for mobile). Every feature you add — a model, an effect, a physics body — spends from these budgets. The checklist in this lesson is your accounting system. DPR clamping trades visual resolution for GPU budget. Lazy loading trades initial download for on-demand download. `frameloop="demand"` trades continuous rendering for on-change rendering. Every optimization is a trade-off, and the skill is knowing which trade-offs your users will never notice.

**Edge cases.** DPR clamping can produce blurry text if you render 2D text inside the 3D canvas (using Three.js text geometry or Troika text). The fix is to render 2D UI outside the canvas with CSS. `frameloop="demand"` breaks GSAP animations that run outside Threlte's reactivity — GSAP directly mutates Three.js objects without triggering Svelte's reactive system, so Threlte does not know it needs to re-render. The fix is to call `invalidate()` from GSAP's `onUpdate` callback. Lazy-loading with IntersectionObserver can flash a layout shift if the poster image and canvas have different intrinsic sizes — always match their CSS dimensions exactly.

**Performance.** The single biggest production performance gain for most 3D pages is DPR clamping. Going from DPR 3 to DPR 2 reduces pixel count by 44%. The second biggest is `frameloop="demand"` — idle scenes drop from 60 render calls per second to 0, saving battery and GPU thermal throttling on mobile. The third is lazy loading — keeping Three.js out of the initial bundle means your LCP (Largest Contentful Paint) is not blocked by parsing 600KB of JavaScript.

**Cross-module connections.** This lesson synthesizes every previous Module 14 lesson into a production-ready package. It connects to Module 12 (performance fundamentals — Core Web Vitals, LCP, CLS), Module 1 (project setup — `.gitignore` for model files, Vite config for chunk splitting), and Module 6 (CSS — poster-to-canvas transition, aspect-ratio matching, reduced-motion media queries). The IntersectionObserver pattern for lazy loading is the same one used in Module 12 for lazy-loading images and route-level code splitting.

## 2. Style it — PE7 applied to this lesson's mini-build

The production scene uses a poster-to-canvas transition:

- The poster image has the same `aspect-ratio` and `border-radius` as the canvas, ensuring no layout shift on swap.
- A loading indicator overlays the poster during canvas initialization: a subtle pulse animation using `var(--dur-slow)`.
- The transition from poster to canvas uses `opacity` fade with `var(--dur-base)` — no motion, just a crossfade.
- `@media (prefers-reduced-motion: reduce)` prevents even the fade — immediate swap.

## 3. Interact — intersection observer for lazy loading

The TypeScript concept: **IntersectionObserver as a loading trigger**. Create an observer in `$effect` that watches a placeholder element. When it enters the viewport (threshold 0.1), set a `$state` boolean that triggers the dynamic import. Disconnect the observer after triggering — it only needs to fire once.

The mistake: creating the observer but never disconnecting it. This leaks the observer and continues firing callbacks. Disconnect in the `$effect` cleanup or immediately after the first intersection.

## 4. Mini-build — production-ready 3D hero with all optimizations

**File:** `src/routes/modules/14-threlte/08-production-3d/+page.svelte`

See the accompanying route file for the full working component.

**DevTools moment:** Open the Network tab and scroll to the 3D section. Watch the Three.js chunks load on demand (not at page load). In the Performance tab, note the frame rate when the scene is idle (should be 0fps with `frameloop="demand"`) versus when interacting (60fps). This proves the render loop is only active when needed.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why clamp DPR to 2 instead of using the device's native DPR?</summary>

On devices with DPR 3, rendering at native resolution means shading 9x as many pixels as DPR 1. The visual quality improvement from DPR 2 to DPR 3 is barely perceptible on small screens, but the GPU cost is 50% higher. Clamping to 2 gives near-retina quality at a fraction of the cost, critical for maintaining frame rate on mobile.
</details>

<details>
<summary><strong>Q2.</strong> What does frameloop="demand" do and when should you use it?</summary>

It stops the continuous 60fps render loop. The canvas only re-renders when something changes (prop update, explicit invalidation, active animation). Use it for scenes that are often static — product displays waiting for interaction, scroll-driven scenes between scroll events. It saves battery and reduces GPU heat.
</details>

<details>
<summary><strong>Q3.</strong> Describe the lazy loading strategy for a 3D scene below the fold.</summary>

Render a poster image placeholder at the canvas location. Use IntersectionObserver to detect when the placeholder enters the viewport. On intersection, dynamically import the scene component and mount it in place of the poster. Three.js code only downloads when the user scrolls to the 3D section — keeping it out of the critical path and initial bundle.
</details>

<details>
<summary><strong>Q4.</strong> What happens if you create a THREE.Texture in $effect without disposing it in the cleanup?</summary>

The texture allocates GPU memory (VRAM) that persists even after the component unmounts. If the user navigates back and forth, each visit allocates new textures without freeing old ones. Eventually, GPU memory fills up and the browser kills the WebGL context or the tab crashes.
</details>

<details>
<summary><strong>Q5.</strong> Why show a poster image for users with prefers-reduced-motion instead of a frozen 3D canvas?</summary>

A frozen canvas still requires downloading Three.js, parsing the GLTF model, and initializing WebGL — all costly operations that provide no benefit if the scene will not animate. A poster image (pre-rendered static screenshot) is a fraction of the size, loads instantly, and serves the same informational purpose without the performance cost.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Lazy loading the Canvas but eagerly importing Three.js.** If you `import * as THREE from 'three'` at the top of your page component, Three.js loads immediately regardless of the Canvas's lazy loading. Move all Three.js imports inside the dynamically-imported scene component.

2. **Setting frameloop="demand" but forgetting to invalidate during GSAP animations.** GSAP runs outside Threlte's reactivity system. When GSAP updates a Three.js object's rotation, Threlte does not know it needs to re-render. Call `invalidate()` from Threlte's context inside your GSAP `onUpdate` callback.

3. **Using `window.devicePixelRatio` on the server.** This crashes during SSR because `window` does not exist. Always access it inside `{#if browser}` or in a `$effect`, never at module-level.

4. **Poster image with different dimensions than the canvas.** If the poster has a different aspect ratio than the canvas, replacing one with the other causes a layout shift (CLS). Ensure both have identical dimensions using the same `aspect-ratio` CSS.

## 7. What's next — one sentence

This is the final lesson of Module 14 — proceed to the module project to build a complete 3D Product Showcase combining every technique you learned.
