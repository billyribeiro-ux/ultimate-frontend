---
module: 14
exercise: 1
title: Your First 3D Scene
difficulty: beginner
estimated_time: 10
skills_tested:
  - Threlte Canvas setup
  - T.Mesh and T.BoxGeometry
  - basic lighting
  - PE7 token integration
---

# Exercise 14.1 — Your First 3D Scene

## Brief

Create a minimal Threlte scene that renders a rotating cube with a directional light. The scene must be embedded in a SvelteKit page with PE7-styled surrounding content. This exercise proves you can set up the Threlte rendering pipeline from scratch.

## Requirements

1. Create a file at `src/routes/exercises/14-threlte/01/+page.svelte`
2. Import `Canvas` from `@threlte/core` and wrap the 3D scene inside it
3. Create a separate `Scene.svelte` component at `src/lib/exercises/14/Scene.svelte`
4. Inside `Scene.svelte`, render a `<T.Mesh>` with a `<T.BoxGeometry>` and a `<T.MeshStandardMaterial>` with a brand-appropriate color
5. Add a `<T.DirectionalLight>` positioned above and to the right of the cube
6. Add a `<T.AmbientLight>` with low intensity for fill lighting
7. Use `useTask` from `@threlte/core` to rotate the cube on every frame
8. The canvas container must have a fixed `block-size` of `24rem` and use PE7 tokens for surrounding layout

## Constraints

- No raw hex/RGB colors in the material — derive from OKLCH values that complement PE7 tokens
- The scene must render without errors in both SSR and CSR modes
- TypeScript strict mode with zero errors

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

The `<Canvas>` component from `@threlte/core` creates the WebGL context. You need to put your 3D elements (meshes, lights, cameras) inside a child component that is rendered within `<Canvas>`. The default camera is a perspective camera — you do not need to create one explicitly.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

In `Scene.svelte`, use `useTask` to get a per-frame callback. Store a reference to the mesh using `bind:ref` on `<T.Mesh>`, then rotate it: `mesh.rotation.y += delta`. The `<T.MeshStandardMaterial>` accepts a `color` prop as a CSS color string or Three.js Color instance.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<!-- Scene.svelte -->
<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import type { Mesh } from 'three';

  let mesh: Mesh | undefined = $state(undefined);

  useTask((delta) => {
    if (mesh) {
      mesh.rotation.y += delta * 0.5;
      mesh.rotation.x += delta * 0.2;
    }
  });
</script>

<T.AmbientLight intensity={0.4} />
<T.DirectionalLight position={[5, 8, 3]} intensity={1.2} />

<T.Mesh bind:ref={mesh}>
  <T.BoxGeometry args={[1, 1, 1]} />
  <T.MeshStandardMaterial color="oklch(65% 0.2 260)" />
</T.Mesh>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/14/Scene.svelte`**

```svelte
<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import type { Mesh } from 'three';

  let mesh: Mesh | undefined = $state(undefined);

  useTask((delta) => {
    if (mesh) {
      mesh.rotation.y += delta * 0.5;
      mesh.rotation.x += delta * 0.2;
    }
  });
</script>

<T.AmbientLight intensity={0.4} />
<T.DirectionalLight position={[5, 8, 3]} intensity={1.2} castShadow />

<T.Mesh bind:ref={mesh} castShadow>
  <T.BoxGeometry args={[1, 1, 1]} />
  <T.MeshStandardMaterial color="oklch(65% 0.2 260)" roughness={0.3} metalness={0.1} />
</T.Mesh>
```

**`src/routes/exercises/14-threlte/01/+page.svelte`**

```svelte
<script lang="ts">
  import { Canvas } from '@threlte/core';
  import Scene from '$lib/exercises/14/Scene.svelte';
</script>

<main class="page">
  <h1>3D Cube Scene</h1>
  <p class="intro">A rotating cube rendered with Threlte and Three.js inside SvelteKit.</p>

  <div class="canvas-container">
    <Canvas>
      <Scene />
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
    block-size: 24rem;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--color-border);
    background: oklch(15% 0.01 260);
  }
</style>
```

### Explanation

This solution demonstrates the fundamental Threlte pattern: a `<Canvas>` component owns the WebGL renderer, and a child scene component defines the 3D world. The `useTask` hook runs a callback on every animation frame, providing the `delta` time since the last frame for smooth, frame-rate-independent rotation. The `<T.Mesh>` component wraps Three.js's `Mesh` class, and nested geometry/material components compose declaratively — mirroring how you would build a Three.js scene imperatively but with Svelte's reactivity. The `bind:ref` pattern gives you access to the underlying Three.js object for imperative manipulation. Separating the scene into its own component keeps the page layout clean and makes the 3D content reusable.
</details>
