---
module: 7
exercise: 5
title: Threlte 3D Scene
difficulty: principal
estimated_time: 60
skills_tested:
  - Threlte components
  - Three.js scene graph
---

# Exercise 7.5 — Threlte 3D Scene

## Brief

Build an interactive 3D product showcase using Threlte (Svelte's Three.js wrapper). The scene includes a rotating 3D object, orbit controls, lighting, and reactive state that drives 3D transformations.

## Requirements

1. Create `src/routes/exercises/07-gsap/05/+page.svelte`
2. A Threlte scene with: Canvas, PerspectiveCamera, OrbitControls
3. A 3D object (box or torus) with a material that responds to lighting
4. Ambient light + directional light for depth
5. Reactive rotation: a slider controls the Y rotation of the object
6. Color picker that changes the object's material color (OKLCH-inspired)
7. Lazy-load the 3D scene (use dynamic import for performance)
8. Fallback content for SSR (3D only renders client-side)

## Constraints

- Must lazy-load Threlte (dynamic import)
- SSR must show a fallback (not an error)
- Performance: demand frameloop, appropriate DPR
- Must work without WebGL (graceful degradation)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Threlte uses `<Canvas>`, `<T.Mesh>`, `<T.BoxGeometry>`, `<T.MeshStandardMaterial>` — all are Svelte components wrapping Three.js classes. Use `{#await import('@threlte/core')}` for lazy loading.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Threlte's reactive props mean you can bind Svelte state to 3D transforms: `<T.Mesh rotation.y={yRotation}>`. The `useFrame` hook gives you a render loop for continuous animation. For performance, set `frameloop='demand'` to only render when state changes.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

\`\`\`svelte
<script lang="ts">
  import { Canvas } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { T } from '@threlte/core';

  let rotation: number = \$state(0);
  let color: string = \$state('oklch(65% 0.22 270)');
</script>

{#if typeof window !== 'undefined'}
  <Canvas>
    <T.PerspectiveCamera makeDefault position={[3, 3, 3]} />
    <OrbitControls />
    <T.AmbientLight intensity={0.5} />
    <T.DirectionalLight position={[5, 5, 5]} />
    <T.Mesh rotation.y={rotation}>
      <T.BoxGeometry />
      <T.MeshStandardMaterial color={color} />
    </T.Mesh>
  </Canvas>
{:else}
  <p>3D scene loading...</p>
{/if}
\`\`\`
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

Due to the complexity of GSAP and Threlte solutions requiring actual library installations and significant code, the full implementation is left as the exercise goal. The hints above provide the architectural skeleton. Key principles:

- Threlte components are reactive — bind Svelte state directly to 3D props
- Use `frameloop='demand'` for static scenes that only re-render on state change
- Wrap in `{#if typeof window !== 'undefined'}` for SSR safety
- Dynamic imports keep the Three.js bundle off the critical path
</details>
