---
module: 14
exercise: 3
title: Interactive Mesh
difficulty: advanced
estimated_time: 30
skills_tested:
  - pointer events on 3D meshes
  - hover and click state management
  - dynamic material properties
  - Svelte 5 runes in 3D context
---

# Exercise 14.3 — Interactive Mesh

## Brief

Create a 3D scene with multiple geometric shapes that respond to pointer interactions. Each shape should highlight on hover (change color and scale), toggle a "selected" state on click, and display an info panel in the HTML overlay with the selected shape's metadata. This exercise bridges Svelte's reactive state system with Three.js's 3D event model.

## Requirements

1. Create `src/routes/exercises/14-threlte/03/+page.svelte`
2. Create `src/lib/exercises/14/InteractiveScene.svelte` for the 3D scene
3. Render at least three different shapes (box, sphere, torus) arranged in a row with spacing
4. Each mesh must have `onpointerenter`, `onpointerleave`, and `onclick` event handlers
5. On hover: smoothly scale the mesh to 1.15x and change the material color to a highlight tone
6. On click: toggle a "selected" state — selected meshes get a distinct emissive glow
7. Track selected shapes using `$state` and display their names in an HTML panel overlaid on the canvas
8. Define a TypeScript interface `ShapeConfig` with `name: string`, `geometry: 'box' | 'sphere' | 'torus'`, `position: [number, number, number]`, and `color: string`
9. Drive all shapes from a typed array — adding an entry should make a new shape appear
10. Use PE7 tokens for the overlay panel styling

## Constraints

- No imperative Three.js raycasting — use Threlte's declarative event system
- TypeScript strict mode with zero errors
- Hover transitions should feel smooth (use `useTask` or Svelte transitions for interpolation)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Threlte meshes support pointer events just like HTML elements. Use `onpointerenter` and `onpointerleave` on `<T.Mesh>` to track hover state. The `onclick` handler toggles selection. Store hovered and selected IDs in `$state` sets or arrays.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Create a `$state` variable like `let hoveredId: string | null = $state(null)` and `let selectedIds: Set<string> = $state(new Set())`. In the `{#each}` loop rendering shapes, check if the current shape is hovered or selected to conditionally pass different `color`, `emissive`, and `scale` props to the material and mesh. Use `$derived` to compute display data for the info panel.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  import { T } from '@threlte/core';

  interface ShapeConfig {
    name: string;
    geometry: 'box' | 'sphere' | 'torus';
    position: [number, number, number];
    color: string;
  }

  const shapes: ShapeConfig[] = [
    { name: 'Cube', geometry: 'box', position: [-2, 0, 0], color: 'oklch(65% 0.2 260)' },
    { name: 'Sphere', geometry: 'sphere', position: [0, 0, 0], color: 'oklch(65% 0.2 150)' },
    { name: 'Torus', geometry: 'torus', position: [2, 0, 0], color: 'oklch(65% 0.2 30)' }
  ];

  let hoveredId: string | null = $state(null);
  let selectedIds = $state(new Set<string>());

  function toggleSelect(name: string) {
    const next = new Set(selectedIds);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    selectedIds = next;
  }
</script>

{#each shapes as shape}
  <T.Mesh
    position={shape.position}
    scale={hoveredId === shape.name ? 1.15 : 1}
    onpointerenter={() => hoveredId = shape.name}
    onpointerleave={() => hoveredId = null}
    onclick={() => toggleSelect(shape.name)}
  >
    <!-- geometry based on shape.geometry -->
    <T.MeshStandardMaterial
      color={hoveredId === shape.name ? 'oklch(80% 0.15 260)' : shape.color}
      emissive={selectedIds.has(shape.name) ? shape.color : 'black'}
      emissiveIntensity={selectedIds.has(shape.name) ? 0.4 : 0}
    />
  </T.Mesh>
{/each}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/14/InteractiveScene.svelte`**

```svelte
<script lang="ts">
  import { T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';

  interface ShapeConfig {
    name: string;
    geometry: 'box' | 'sphere' | 'torus';
    position: [number, number, number];
    color: string;
  }

  const shapes: ShapeConfig[] = [
    { name: 'Cube', geometry: 'box', position: [-2.5, 0, 0], color: 'oklch(65% 0.2 260)' },
    { name: 'Sphere', geometry: 'sphere', position: [0, 0, 0], color: 'oklch(65% 0.2 150)' },
    { name: 'Torus', geometry: 'torus', position: [2.5, 0, 0], color: 'oklch(65% 0.2 30)' }
  ];

  let hoveredId: string | null = $state(null);
  let selectedIds = $state(new Set<string>());

  const selectedNames: string[] = $derived([...selectedIds]);

  function toggleSelect(name: string): void {
    const next = new Set(selectedIds);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    selectedIds = next;
  }

  interface Props {
    onselectionchange?: (names: string[]) => void;
  }

  let { onselectionchange }: Props = $props();

  $effect(() => {
    onselectionchange?.(selectedNames);
  });
</script>

<T.PerspectiveCamera makeDefault position={[0, 2, 6]} fov={45}>
  <OrbitControls enableDamping dampingFactor={0.1} />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[5, 8, 3]} intensity={1} />

{#each shapes as shape (shape.name)}
  {@const isHovered = hoveredId === shape.name}
  {@const isSelected = selectedIds.has(shape.name)}

  <T.Mesh
    position={shape.position}
    scale={isHovered ? 1.15 : 1}
    onpointerenter={() => (hoveredId = shape.name)}
    onpointerleave={() => (hoveredId = null)}
    onclick={() => toggleSelect(shape.name)}
  >
    {#if shape.geometry === 'box'}
      <T.BoxGeometry args={[1, 1, 1]} />
    {:else if shape.geometry === 'sphere'}
      <T.SphereGeometry args={[0.7, 32, 32]} />
    {:else}
      <T.TorusGeometry args={[0.6, 0.25, 16, 32]} />
    {/if}

    <T.MeshStandardMaterial
      color={isHovered ? 'oklch(80% 0.15 260)' : shape.color}
      emissive={isSelected ? shape.color : 'black'}
      emissiveIntensity={isSelected ? 0.4 : 0}
      roughness={0.4}
      metalness={0.1}
    />
  </T.Mesh>
{/each}
```

**`src/routes/exercises/14-threlte/03/+page.svelte`**

```svelte
<script lang="ts">
  import { Canvas } from '@threlte/core';
  import InteractiveScene from '$lib/exercises/14/InteractiveScene.svelte';

  let selectedShapes: string[] = $state([]);
</script>

<main class="page">
  <h1>Interactive 3D Meshes</h1>
  <p class="intro">Hover to highlight, click to select. Selected shapes appear in the panel below.</p>

  <div class="canvas-container">
    <Canvas>
      <InteractiveScene onselectionchange={(names) => (selectedShapes = names)} />
    </Canvas>

    {#if selectedShapes.length > 0}
      <div class="info-panel">
        <h2>Selected</h2>
        <ul>
          {#each selectedShapes as name}
            <li>{name}</li>
          {/each}
        </ul>
      </div>
    {/if}
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

  .info-panel {
    position: absolute;
    inset-block-end: var(--space-md);
    inset-inline-end: var(--space-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-sm) var(--space-md);
    box-shadow: var(--shadow-md);
    min-inline-size: 8rem;
  }

  .info-panel h2 {
    font-size: var(--text-sm);
    font-weight: 600;
    margin-block-end: var(--space-xs);
    color: var(--color-text);
  }

  .info-panel ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--space-xs);
  }

  .info-panel li {
    font-size: var(--text-sm);
    color: var(--color-brand);
    font-weight: 500;
  }
</style>
```

### Explanation

This exercise connects Svelte's reactive state system to Threlte's 3D event model. Threlte maps DOM-style pointer events (`onpointerenter`, `onclick`) to Three.js raycasting under the hood, so you never need to write manual raycasting code. The `$state` rune tracks which shape is hovered and which are selected, and `$derived` computes the display list for the overlay panel. The key architectural insight is that 3D interaction state lives in the same reactive graph as your 2D UI — a selection in the 3D world instantly updates the HTML overlay because both read from the same `$state`. The `onselectionchange` callback prop follows Svelte 5's pattern of passing callbacks instead of dispatching events, keeping the parent component in control of the state display. The `{#if}` block on geometry type shows how to conditionally render different Three.js geometries from data.
</details>
