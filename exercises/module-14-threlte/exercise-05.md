---
module: 14
exercise: 5
title: Production 3D with Lazy Loading
difficulty: principal
estimated_time: 60
skills_tested:
  - dynamic component imports
  - LOD (Level of Detail) strategy
  - performance budgeting for 3D
  - mobile fallback rendering
  - intersection observer integration
---

# Exercise 14.5 — Production 3D with Lazy Loading

## Brief

Build a production-ready 3D product showcase that only loads the Threlte runtime and 3D assets when the viewer scrolls the component into the viewport. On mobile devices or when the user has `prefers-reduced-motion` enabled, render a static image fallback instead. This exercise teaches the performance optimization patterns that separate demo-quality 3D from production-quality 3D.

## Requirements

1. Create `src/routes/exercises/14-threlte/05/+page.svelte`
2. Create `src/lib/exercises/14/ProductShowcase.svelte` as the lazy-loaded wrapper
3. Create `src/lib/exercises/14/ProductScene.svelte` for the actual 3D scene
4. Use `IntersectionObserver` to detect when the showcase enters the viewport
5. Only `import()` the Threlte components dynamically when the observer fires
6. Display a placeholder (static image or skeleton) before the 3D scene loads
7. After the dynamic import resolves, mount the Canvas and scene
8. Detect mobile viewports (< 768px) and `prefers-reduced-motion: reduce` — in either case, show a static fallback instead of loading the 3D runtime
9. Add a `<noscript>` fallback with the static image for SSR/no-JS contexts
10. Implement a simple LOD system: if the viewport width is under 1024px, use a lower-poly geometry
11. Measure and log the total load time from intersection to first rendered frame
12. The page surrounding the showcase must have PE7-styled content above and below it
13. TypeScript strict mode with zero errors

## Constraints

- No top-level imports of `@threlte/core` or `three` — everything must be dynamically imported
- The initial page bundle must not include any Three.js code
- The fallback image must be a real `<img>` element, not a CSS background
- The loading skeleton must animate to indicate progress
- The component must clean up properly when unmounted (no memory leaks)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Use `{#await import(...)}` or store the dynamically imported module in a `$state` variable. The `IntersectionObserver` triggers the import. Use `matchMedia('(prefers-reduced-motion: reduce)')` to detect motion preference, and check `window.innerWidth` for viewport size. Wrap both checks in an `$effect` that runs client-side only.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The architecture has three states: (1) not yet visible — show nothing or a placeholder; (2) loading — show a skeleton while the dynamic import resolves; (3) loaded — mount the Canvas. Use a discriminated union type: `type LoadState = { status: 'idle' } | { status: 'loading' } | { status: 'loaded'; module: typeof import('...') } | { status: 'fallback' }`. The LOD decision happens inside the scene component using a `detail` prop.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  type LoadState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'loaded'; Canvas: any; Scene: any }
    | { status: 'fallback' };

  let loadState: LoadState = $state({ status: 'idle' });
  let containerRef: HTMLElement | undefined = $state(undefined);

  $effect(() => {
    if (!containerRef) return;

    const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    if (prefersReducedMotion || isMobile) {
      loadState = { status: 'fallback' };
      return;
    }

    const observer = new IntersectionObserver(async ([entry]) => {
      if (entry.isIntersecting && loadState.status === 'idle') {
        loadState = { status: 'loading' };
        const [threlte, scene] = await Promise.all([
          import('@threlte/core'),
          import('$lib/exercises/14/ProductScene.svelte')
        ]);
        loadState = { status: 'loaded', Canvas: threlte.Canvas, Scene: scene.default };
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(containerRef);
    return () => observer.disconnect();
  });
</script>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/14/ProductScene.svelte`**

```svelte
<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import type { Mesh } from 'three';

  interface Props {
    detail: 'high' | 'low';
  }

  let { detail }: Props = $props();

  let mesh: Mesh | undefined = $state(undefined);

  const segments = detail === 'high' ? 128 : 32;

  useTask((delta) => {
    if (mesh) {
      mesh.rotation.y += delta * 0.3;
    }
  });
</script>

<T.PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={45}>
  <OrbitControls enableDamping dampingFactor={0.08} autoRotate autoRotateSpeed={0.5} />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[5, 8, 3]} intensity={1.2} castShadow />
<T.DirectionalLight position={[-4, 3, -3]} intensity={0.3} />

<T.Mesh bind:ref={mesh} castShadow>
  <T.TorusKnotGeometry args={[1, 0.35, segments, segments / 4]} />
  <T.MeshStandardMaterial
    color="oklch(65% 0.2 260)"
    roughness={0.25}
    metalness={0.3}
  />
</T.Mesh>

<T.Mesh rotation.x={-Math.PI / 2} position.y={-1.8} receiveShadow>
  <T.CircleGeometry args={[6, 64]} />
  <T.MeshStandardMaterial color="oklch(20% 0.02 260)" roughness={0.9} />
</T.Mesh>
```

**`src/lib/exercises/14/ProductShowcase.svelte`**

```svelte
<script lang="ts">
  import type { Component } from 'svelte';

  type LoadState =
    | { status: 'idle' }
    | { status: 'loading'; startTime: number }
    | { status: 'loaded'; Canvas: Component; Scene: Component; loadMs: number }
    | { status: 'fallback'; reason: string };

  let loadState: LoadState = $state({ status: 'idle' });
  let containerRef: HTMLElement | undefined = $state(undefined);

  const detail: 'high' | 'low' = $derived(
    typeof window !== 'undefined' && window.innerWidth < 1024 ? 'low' : 'high'
  );

  $effect(() => {
    if (!containerRef) return;

    const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    if (prefersReducedMotion) {
      loadState = { status: 'fallback', reason: 'Reduced motion preference detected' };
      return;
    }

    if (isMobile) {
      loadState = { status: 'fallback', reason: 'Mobile viewport — showing static image' };
      return;
    }

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        if (loadState.status !== 'idle') return;

        const startTime = performance.now();
        loadState = { status: 'loading', startTime };

        try {
          const [threlte, sceneModule] = await Promise.all([
            import('@threlte/core'),
            import('$lib/exercises/14/ProductScene.svelte')
          ]);

          const loadMs = Math.round(performance.now() - startTime);
          console.info(`[ProductShowcase] 3D loaded in ${loadMs}ms`);

          loadState = {
            status: 'loaded',
            Canvas: threlte.Canvas,
            Scene: sceneModule.default,
            loadMs
          };
        } catch (err) {
          console.error('[ProductShowcase] Failed to load 3D scene:', err);
          loadState = { status: 'fallback', reason: 'Failed to load 3D runtime' };
        }

        observer.disconnect();
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef);
    return () => observer.disconnect();
  });
</script>

<div class="showcase" bind:this={containerRef}>
  {#if loadState.status === 'idle'}
    <div class="placeholder">
      <img
        src="https://api.dicebear.com/8.x/shapes/svg?seed=product3d"
        alt="Product preview placeholder"
        class="fallback-img"
      />
    </div>
  {:else if loadState.status === 'loading'}
    <div class="skeleton">
      <div class="skeleton-pulse"></div>
      <p class="skeleton-text">Loading 3D experience...</p>
    </div>
  {:else if loadState.status === 'loaded'}
    <div class="canvas-wrapper">
      <loadState.Canvas>
        <loadState.Scene {detail} />
      </loadState.Canvas>
    </div>
    <p class="load-time">Loaded in {loadState.loadMs}ms</p>
  {:else if loadState.status === 'fallback'}
    <div class="fallback">
      <img
        src="https://api.dicebear.com/8.x/shapes/svg?seed=product3d"
        alt="Product showcase — static fallback"
        class="fallback-img"
      />
      <p class="fallback-reason">{loadState.reason}</p>
    </div>
  {/if}

  <noscript>
    <div class="fallback">
      <img
        src="https://api.dicebear.com/8.x/shapes/svg?seed=product3d"
        alt="Product showcase — JavaScript required for 3D"
        class="fallback-img"
      />
    </div>
  </noscript>
</div>

<style>
  .showcase {
    position: relative;
    block-size: 32rem;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--color-border);
    background: oklch(12% 0.01 260);
  }

  .placeholder,
  .skeleton,
  .fallback {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    place-content: center;
    gap: var(--space-md);
  }

  .fallback-img {
    inline-size: 12rem;
    block-size: 12rem;
    opacity: 0.6;
  }

  .skeleton-pulse {
    inline-size: 6rem;
    block-size: 6rem;
    border-radius: var(--radius-full);
    background: var(--color-surface-2);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(0.95); }
    50% { opacity: 1; transform: scale(1.05); }
  }

  .skeleton-text {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .canvas-wrapper {
    position: absolute;
    inset: 0;
  }

  .load-time {
    position: absolute;
    inset-block-end: var(--space-sm);
    inset-inline-start: var(--space-sm);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    background: oklch(10% 0.01 260 / 0.8);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
  }

  .fallback-reason {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
</style>
```

**`src/routes/exercises/14-threlte/05/+page.svelte`**

```svelte
<script lang="ts">
  import ProductShowcase from '$lib/exercises/14/ProductShowcase.svelte';
</script>

<main class="page">
  <section class="hero">
    <h1>Product Showcase</h1>
    <p class="intro">Scroll down to reveal the 3D product viewer. On mobile or with reduced motion preferences, a static fallback is shown instead.</p>
  </section>

  <section class="spacer">
    <p>Keep scrolling to trigger the lazy load...</p>
  </section>

  <section class="showcase-section">
    <h2>The Object</h2>
    <ProductShowcase />
  </section>

  <section class="outro">
    <h2>Performance Notes</h2>
    <p>The 3D scene was lazy-loaded only when it entered the viewport. The initial page bundle contained zero Three.js code. Check the console for the exact load time measurement.</p>
  </section>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  .hero {
    min-block-size: 60vh;
    display: grid;
    place-content: center;
    text-align: center;
  }

  h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-sm);
  }

  .intro {
    color: var(--color-text-muted);
    font-size: var(--text-base);
    max-inline-size: 36rem;
  }

  .spacer {
    min-block-size: 50vh;
    display: grid;
    place-items: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .showcase-section {
    margin-block: var(--space-2xl);
  }

  .showcase-section h2 {
    font-size: var(--text-xl);
    margin-block-end: var(--space-lg);
  }

  .outro {
    min-block-size: 40vh;
    display: grid;
    place-content: center;
    gap: var(--space-md);
    text-align: center;
  }

  .outro h2 {
    font-size: var(--text-lg);
  }

  .outro p {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    max-inline-size: 32rem;
  }
</style>
```

### Explanation

This exercise addresses the #1 concern with 3D on the web: bundle size and load performance. Three.js alone is ~600KB minified, plus Threlte's runtime, plus any model assets. By using dynamic `import()` triggered by an `IntersectionObserver`, the initial page load includes zero 3D code. The discriminated union `LoadState` type makes each state explicit and type-safe — the compiler ensures you handle every case. The LOD system is simple (fewer geometry segments on smaller viewports) but demonstrates the principle — in production, you would swap entire GLTF models of different polygon counts. The `prefers-reduced-motion` and mobile viewport checks are accessibility and performance heuristics: mobile GPUs struggle with complex scenes, and users who prefer reduced motion should not see unexpected 3D animations. The `performance.now()` measurement gives real data for performance budgeting. The `<noscript>` fallback ensures the page is still meaningful without JavaScript. This pattern — lazy 3D with graceful degradation — is how companies like Apple and Stripe ship 3D on their marketing pages.
</details>
