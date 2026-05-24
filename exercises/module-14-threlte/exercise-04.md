---
module: 14
exercise: 4
title: Scroll-Driven Camera
difficulty: expert
estimated_time: 45
skills_tested:
  - useTask for per-frame updates
  - scroll progress calculation
  - camera position interpolation
  - easing functions
  - combining 2D scroll with 3D scene
---

# Exercise 14.4 — Scroll-Driven Camera

## Brief

Build a page where scrolling controls the camera's position in a 3D scene. As the user scrolls through content sections, the camera smoothly orbits around a central object, creating a cinematic storytelling experience. This exercise teaches you how to bridge the 2D scroll world with 3D camera animation — a technique used extensively in product landing pages.

## Requirements

1. Create `src/routes/exercises/14-threlte/04/+page.svelte`
2. Create `src/lib/exercises/14/ScrollCamera.svelte` for the scene
3. The page must have at least four content sections with sufficient height to scroll through (each section ~100vh)
4. Fix the 3D canvas to the viewport background using `position: fixed`
5. Track scroll progress as a 0-1 value using a scroll event listener
6. Pass the scroll progress into the scene component as a `$bindable` prop or via context
7. In the scene, use `useTask` to interpolate the camera position along a circular path based on scroll progress
8. The camera must always look at the center object (use `lookAt`)
9. Add at least two waypoint positions on the orbit path with easing between them
10. Apply an easing function (e.g., `smoothstep` or cubic ease-in-out) to the scroll value
11. The content sections must overlay the canvas with semi-transparent backgrounds using PE7 tokens
12. TypeScript strict mode — type the camera path waypoints

## Constraints

- No animation libraries (no GSAP, no Tween.js) — implement the interpolation manually
- The camera movement must be frame-rate independent (use delta from `useTask`)
- The page must remain scrollable on mobile (no scroll hijacking)
- No jerky camera movements — use lerp for smooth transitions

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Calculate scroll progress as `window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)`. This gives you a 0-1 value. Pass this to the scene component. In `useTask`, lerp the camera's actual position toward the target position computed from scroll progress.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Define camera waypoints as positions on a circle: `x = radius * Math.cos(angle)`, `z = radius * Math.sin(angle)`. Map scroll progress (0-1) to an angle range (e.g., 0 to `Math.PI * 1.5`). Apply an easing function before computing the angle. In `useTask`, use `THREE.MathUtils.lerp` or manual lerp (`current + (target - current) * factor`) to smooth the camera toward its target.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<!-- ScrollCamera.svelte -->
<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { Vector3 } from 'three';

  interface Props {
    scrollProgress: number;
  }

  let { scrollProgress }: Props = $props();

  const RADIUS = 5;
  const HEIGHT = 2;

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  let currentPos = new Vector3(RADIUS, HEIGHT, 0);
  const target = new Vector3(0, 0, 0);

  const { camera } = useThrelte();

  useTask(() => {
    const eased = easeInOutCubic(scrollProgress);
    const angle = eased * Math.PI * 1.5;
    const targetPos = new Vector3(
      RADIUS * Math.cos(angle),
      HEIGHT + eased * 1.5,
      RADIUS * Math.sin(angle)
    );
    currentPos.lerp(targetPos, 0.1);
    camera.current.position.copy(currentPos);
    camera.current.lookAt(target);
  });
</script>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/14/ScrollCamera.svelte`**

```svelte
<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { Vector3 } from 'three';

  interface Props {
    scrollProgress: number;
  }

  let { scrollProgress }: Props = $props();

  interface CameraWaypoint {
    angle: number;
    height: number;
    radius: number;
  }

  const waypoints: CameraWaypoint[] = [
    { angle: 0, height: 2, radius: 5 },
    { angle: Math.PI * 0.5, height: 3, radius: 4.5 },
    { angle: Math.PI, height: 1.5, radius: 5.5 },
    { angle: Math.PI * 1.5, height: 4, radius: 4 }
  ];

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function lerpWaypoint(progress: number): Vector3 {
    const totalSegments = waypoints.length - 1;
    const segment = Math.min(Math.floor(progress * totalSegments), totalSegments - 1);
    const segmentProgress = (progress * totalSegments) - segment;

    const from = waypoints[segment];
    const to = waypoints[segment + 1];

    const angle = from.angle + (to.angle - from.angle) * segmentProgress;
    const height = from.height + (to.height - from.height) * segmentProgress;
    const radius = from.radius + (to.radius - from.radius) * segmentProgress;

    return new Vector3(
      radius * Math.cos(angle),
      height,
      radius * Math.sin(angle)
    );
  }

  const currentPos = new Vector3(5, 2, 0);
  const lookTarget = new Vector3(0, 0, 0);

  const { camera } = useThrelte();

  useTask(() => {
    const eased = easeInOutCubic(scrollProgress);
    const targetPos = lerpWaypoint(eased);
    currentPos.lerp(targetPos, 0.08);
    camera.current.position.copy(currentPos);
    camera.current.lookAt(lookTarget);
  });
</script>

<T.PerspectiveCamera makeDefault position={[5, 2, 0]} fov={50} />

<T.AmbientLight intensity={0.4} />
<T.DirectionalLight position={[5, 8, 3]} intensity={1.2} castShadow />
<T.DirectionalLight position={[-3, 2, -5]} intensity={0.3} />

<!-- Central object: a group of shapes -->
<T.Mesh position.y={0}>
  <T.TorusKnotGeometry args={[1, 0.35, 128, 32]} />
  <T.MeshStandardMaterial color="oklch(65% 0.2 260)" roughness={0.3} metalness={0.2} />
</T.Mesh>

<!-- Floor plane for spatial reference -->
<T.Mesh rotation.x={-Math.PI / 2} position.y={-1.5} receiveShadow>
  <T.PlaneGeometry args={[20, 20]} />
  <T.MeshStandardMaterial color="oklch(25% 0.02 260)" roughness={0.8} />
</T.Mesh>
```

**`src/routes/exercises/14-threlte/04/+page.svelte`**

```svelte
<script lang="ts">
  import { Canvas } from '@threlte/core';
  import ScrollCamera from '$lib/exercises/14/ScrollCamera.svelte';

  let scrollProgress = $state(0);

  function handleScroll(): void {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }

  interface ContentSection {
    title: string;
    body: string;
  }

  const sections: ContentSection[] = [
    {
      title: 'Precision Engineering',
      body: 'Every surface is mathematically defined. Every curve has purpose. This is design at the intersection of art and engineering.'
    },
    {
      title: 'Material Science',
      body: 'Advanced material properties — roughness, metalness, subsurface scattering — bring digital objects to life.'
    },
    {
      title: 'Light & Shadow',
      body: 'Directional and ambient lighting reveal form. Shadows ground objects in space and create depth.'
    },
    {
      title: 'Infinite Perspective',
      body: 'The camera orbits freely, revealing new angles. Every viewpoint tells a different story about the same object.'
    }
  ];
</script>

<svelte:window onscroll={handleScroll} />

<div class="canvas-fixed">
  <Canvas>
    <ScrollCamera {scrollProgress} />
  </Canvas>
</div>

<div class="scroll-content">
  {#each sections as section, i}
    <section class="content-section">
      <div class="section-inner">
        <span class="section-number">0{i + 1}</span>
        <h2>{section.title}</h2>
        <p>{section.body}</p>
      </div>
    </section>
  {/each}
</div>

<style>
  .canvas-fixed {
    position: fixed;
    inset: 0;
    z-index: 0;
    background: oklch(10% 0.01 260);
  }

  .scroll-content {
    position: relative;
    z-index: 1;
  }

  .content-section {
    min-block-size: 100vh;
    display: grid;
    place-items: center;
    padding: var(--space-xl) var(--space-md);
  }

  .section-inner {
    max-inline-size: 28rem;
    background: oklch(10% 0.02 260 / 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    box-shadow: var(--shadow-lg);
  }

  .section-number {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--color-brand);
    letter-spacing: 0.1em;
  }

  .section-inner h2 {
    font-size: var(--text-xl);
    color: var(--color-text);
    margin-block: var(--space-sm) var(--space-md);
  }

  .section-inner p {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    line-height: 1.7;
  }
</style>
```

### Explanation

This exercise combines 2D scrolling with 3D camera animation — a pattern used in Apple-style product pages and portfolio sites. The scroll progress is a normalized 0-1 value computed from the scroll position. An easing function (`easeInOutCubic`) is applied before computing the camera target, creating acceleration and deceleration at section boundaries. The waypoint system defines key positions on the orbital path, and `lerpWaypoint` interpolates between them based on progress. Inside `useTask`, `Vector3.lerp` smooths the camera toward its target position with a factor of 0.08, preventing jerky movement even if the scroll value jumps. The `lookAt` call ensures the camera always faces the central object. The fixed canvas sits behind scrollable content, and semi-transparent card overlays with `backdrop-filter: blur()` create the layered storytelling effect. This architecture keeps 2D content accessible and scrollable while the 3D scene responds naturally.
</details>
