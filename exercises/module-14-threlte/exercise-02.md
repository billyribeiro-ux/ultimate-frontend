---
module: 14
exercise: 2
title: GLTF Model Loader
difficulty: intermediate
estimated_time: 20
skills_tested:
  - useGltf hook
  - Suspense boundaries
  - loading state management
  - model positioning and scaling
---

# Exercise 14.2 — GLTF Model Loader

## Brief

Build a scene that loads a GLTF 3D model using Threlte's `useGltf` hook, displays a loading indicator while the model downloads, and positions the model correctly in the viewport. This exercise teaches you the async model loading pipeline that every production 3D application requires.

## Requirements

1. Create `src/routes/exercises/14-threlte/02/+page.svelte`
2. Create `src/lib/exercises/14/ModelViewer.svelte` for the scene
3. Use `useGltf` from `@threlte/extras` to load a public GLTF model (use `https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf` or any public GLTF URL)
4. Wrap the model in a `<Suspense>` boundary from `@threlte/extras`
5. Show a styled HTML loading indicator (spinner or progress text) while the model loads using the `fallback` snippet
6. Once loaded, render the model with `<T.Primitive object={gltf.scene} />`
7. Position the camera so the full model is visible (adjust position and lookAt)
8. Add an `<OrbitControls>` from `@threlte/extras` so the user can rotate around the model
9. The loading indicator must use PE7 tokens for styling

## Constraints

- No blocking the page render — the model loads asynchronously
- TypeScript strict mode — type the GLTF result properly
- Handle the error case where the model fails to load (show an error message)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`useGltf` returns a reactive store that starts as `undefined` and resolves to the loaded GLTF data. The `<Suspense>` component from `@threlte/extras` provides a declarative way to show fallback content while async children are loading.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The pattern is: `const gltf = useGltf('/path/to/model.gltf')`. Inside the template, check `{#if $gltf}` to conditionally render the model. `<T.Primitive>` is the escape hatch for rendering an already-constructed Three.js object. `<OrbitControls>` needs the `<T.PerspectiveCamera>` to have `makeDefault` set.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  import { T } from '@threlte/core';
  import { useGltf, OrbitControls } from '@threlte/extras';

  const gltf = useGltf('https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf');
</script>

<T.PerspectiveCamera makeDefault position={[0, 1.5, 3]} fov={50}>
  <OrbitControls enableDamping />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[5, 5, 5]} intensity={1} />

{#if $gltf}
  <T.Primitive object={$gltf.scene} scale={1} />
{/if}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/14/ModelViewer.svelte`**

```svelte
<script lang="ts">
  import { T } from '@threlte/core';
  import { useGltf, OrbitControls } from '@threlte/extras';

  const MODEL_URL = 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';

  const gltf = useGltf(MODEL_URL);

  let loadError: string | undefined = $state(undefined);

  $effect(() => {
    const unsubscribe = gltf.subscribe((value) => {
      // If the store resolves, no error
    });
    return unsubscribe;
  });
</script>

<T.PerspectiveCamera makeDefault position={[0, 1, 3]} fov={50}>
  <OrbitControls
    enableDamping
    dampingFactor={0.1}
    autoRotate
    autoRotateSpeed={1}
  />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.6} />
<T.DirectionalLight position={[5, 8, 3]} intensity={1.2} castShadow />
<T.DirectionalLight position={[-3, 4, -2]} intensity={0.4} />

{#if $gltf}
  <T.Primitive object={$gltf.scene} scale={1} position.y={0} />
{/if}
```

**`src/routes/exercises/14-threlte/02/+page.svelte`**

```svelte
<script lang="ts">
  import { Canvas } from '@threlte/core';
  import ModelViewer from '$lib/exercises/14/ModelViewer.svelte';

  let loaded = $state(false);
</script>

<main class="page">
  <h1>GLTF Model Viewer</h1>
  <p class="intro">Loading and displaying a 3D model with orbit controls.</p>

  <div class="canvas-container">
    {#if !loaded}
      <div class="loader">
        <div class="spinner"></div>
        <p>Loading 3D model...</p>
      </div>
    {/if}
    <Canvas>
      <ModelViewer />
    </Canvas>
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-sm);
  }

  .intro {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    margin-block-end: var(--space-lg);
  }

  .canvas-container {
    position: relative;
    block-size: 28rem;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--color-border);
    background: oklch(15% 0.01 260);
  }

  .loader {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    place-content: center;
    gap: var(--space-md);
    background: var(--color-surface);
    z-index: 1;
  }

  .loader p {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .spinner {
    inline-size: 2.5rem;
    block-size: 2.5rem;
    border: 3px solid var(--color-border);
    border-block-start-color: var(--color-brand);
    border-radius: var(--radius-full);
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(1turn); }
  }
</style>
```

### Explanation

This exercise introduces the async 3D pipeline. The `useGltf` hook returns a Svelte store that resolves once the model finishes downloading and parsing. The `<T.Primitive>` component is Threlte's escape hatch for rendering pre-built Three.js objects — since GLTF loading produces a complete scene graph, you hand that scene graph to `<T.Primitive>` rather than recreating it declaratively. `<OrbitControls>` wraps Three.js's OrbitControls as a declarative component nested inside the camera — this pattern (controls as children of the camera) is idiomatic Threlte. The loading overlay uses absolute positioning over the canvas so the user sees meaningful feedback while the model downloads. In production, you would add error handling for network failures and consider showing a download progress percentage.
</details>
