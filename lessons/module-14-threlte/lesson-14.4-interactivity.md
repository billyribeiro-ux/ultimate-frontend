---
module: 14
lesson: 14.4
title: Interactivity
duration: 40
prerequisites:
  - "14.3 — Loading 3D models"
  - "5.1 — Event handlers in Svelte 5"
learning_objectives:
  - Enable the interactivity plugin from @threlte/extras
  - Attach onclick, onpointerenter, and onpointerleave events to meshes
  - Change the cursor style when hovering interactive 3D objects
  - Build a click-to-select pattern with reactive highlights
  - Understand raycasting and how pointer events work in 3D space
status: ready
---

# Lesson 14.4 — Interactivity

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build.

## 1. Concept — making 3D objects respond to user input

### 1.1 What the problem is

A 3D scene that the user can only look at is a screensaver. For real applications — product configurators, data visualizations, interactive portfolios — users need to click, hover, and drag objects in the scene. But 3D interaction is fundamentally different from 2D: there are no DOM elements with built-in event handlers. A mesh is a GPU-rendered triangle buffer, not a `<div>` with `onclick`.

To detect which 3D object the user is pointing at, you need **raycasting** — shooting an invisible ray from the camera through the mouse position and checking which objects it intersects. This is computationally expensive and conceptually complex.

### 1.2 How Threlte's interactivity plugin solves it

Threlte's `interactivity` plugin from `@threlte/extras` handles all the raycasting for you. Once enabled, you can attach familiar event props directly to `<T.Mesh>` components:

- `onclick` — fires when the user clicks the mesh.
- `onpointerenter` — fires when the pointer moves over the mesh.
- `onpointerleave` — fires when the pointer leaves the mesh.
- `onpointermove` — fires on every pointer movement while over the mesh.

The events include the intersection point (where on the mesh surface the ray hit), the face normal, the distance from camera, and the original pointer event. This gives you rich data for building interactions.

### 1.3 Enabling interactivity

The plugin must be activated once, typically in a scene setup component:

```svelte
<script lang="ts">
    import { interactivity } from '@threlte/extras';
    interactivity();
</script>
```

After this call, all `<T.Mesh>` components in the scene can accept pointer event props. Without calling `interactivity()`, the event props are silently ignored.

### 1.4 Cursor changes

When a mesh is interactive, the user needs a visual cue. The standard web pattern is changing the cursor to `pointer`. In Threlte, you handle this in the `onpointerenter` and `onpointerleave` handlers by modifying `document.body.style.cursor`:

```
onpointerenter={() => { document.body.style.cursor = 'pointer'; }}
onpointerleave={() => { document.body.style.cursor = 'auto'; }}
```

This bridges the 3D world back to familiar web UX conventions.

### 1.5 Click-to-select pattern

A common pattern: clicking a mesh selects it (highlights it with a different color or emissive glow). Implementation:

1. Track the selected mesh ID in `$state`.
2. Pass the ID to each mesh component.
3. Each mesh derives its material color based on whether its ID matches the selected state.
4. On click, update the selected state.

This is the same reactive pattern you use for 2D list selection — just applied to 3D objects.

### 1.6 Performance considerations

Raycasting runs on every pointer move event. With hundreds of meshes, this gets expensive. Mitigations:

- Only mark meshes as interactive that need to be (not every decoration mesh).
- Use bounding-sphere checks before detailed triangle intersection.
- Throttle `onpointermove` if you only need periodic updates.

Threlte optimizes internally by only raycasting against meshes that have event handlers attached. Meshes without handlers are skipped entirely.

## 2. Style it — PE7 applied to this lesson's mini-build

The interactive scene includes an info panel that appears on click:

- Panel slides in from the right using a Svelte transition (`fly` from `svelte/transition`).
- Panel background: `var(--color-surface-2)` with `var(--shadow-lg)` for elevation.
- Selected object gets an emissive highlight using the brand OKLCH color converted to Three.js format.
- The cursor change provides the visual affordance — no additional styling needed for the 3D objects themselves.

## 3. Interact — raycasting and event data

The TypeScript concept: **Threlte pointer events carry 3D intersection data**. The event object includes:

```typescript
interface ThreltePointerEvent {
    point: THREE.Vector3;       // world-space intersection point
    normal: THREE.Vector3;      // face normal at intersection
    distance: number;           // distance from camera
    object: THREE.Object3D;     // the intersected object
    nativeEvent: PointerEvent;  // the original DOM event
}
```

You can use `point` to spawn particles at the click location, `normal` to orient a decal, or `distance` to implement depth-based interactions.

## 4. Mini-build — clickable 3D objects with info panel

**File:** `src/routes/modules/14-threlte/04-interactivity/+page.svelte`

See the accompanying route file for the full working component.

**DevTools moment:** In the Performance tab, record while moving the mouse over the scene. Check that frame time stays under 16ms (60fps). If the scene has many meshes, you can see the raycasting cost in the flame chart as part of the Threlte render loop.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> What is raycasting and why is it needed for 3D interaction?</summary>

Raycasting shoots an invisible ray from the camera through the 2D mouse position into 3D space, testing which objects the ray intersects. It is needed because 3D meshes are not DOM elements — they have no built-in click handlers. Raycasting translates 2D pointer coordinates into 3D object selection.
</details>

<details>
<summary><strong>Q2.</strong> What happens if you add `onclick` to a <T.Mesh> without calling `interactivity()` first?</summary>

The event prop is silently ignored. Threlte's interactivity plugin must be activated to set up the raycasting system. Without it, no pointer events are processed and no handlers fire.
</details>

<details>
<summary><strong>Q3.</strong> Why change `document.body.style.cursor` in pointer handlers instead of using CSS `:hover`?</summary>

CSS `:hover` works on DOM elements, but the 3D canvas is a single `<canvas>` element. The browser does not know which 3D object is under the pointer. You must manually set the cursor in JavaScript when Threlte's raycaster detects a hover on a specific mesh.
</details>

<details>
<summary><strong>Q4.</strong> How does Threlte optimize raycasting performance when a scene has many meshes?</summary>

Threlte only raycasts against meshes that have event handler props attached. Decorative meshes without onclick/onpointerenter are excluded from the raycast candidates, reducing the number of intersection tests per frame.
</details>

<details>
<summary><strong>Q5.</strong> Describe how you would implement a "highlight on hover" effect using reactive state.</summary>

Track a `hoveredId` in `$state`. In `onpointerenter`, set `hoveredId` to the mesh's ID. In `onpointerleave`, clear it. Each mesh derives its material emissive color from whether its ID matches `hoveredId` — if matched, emissive is the brand color; otherwise, it is black (no glow). The reactivity system updates the material automatically.
</details>

## 6. Common mistakes — 3 pitfalls

1. **Forgetting to call `interactivity()`.** The most common mistake — adding event props to meshes and wondering why nothing happens. The plugin initialization call is required exactly once per scene.

2. **Not resetting the cursor on leave.** If you set `cursor = 'pointer'` on enter but forget to reset on leave, the pointer cursor persists even after moving away from the interactive mesh, confusing users.

3. **Adding event handlers to every mesh in a large scene.** Each handler makes the mesh a raycast candidate. In a scene with 500 decorative meshes, this means 500 intersection tests per pointer move. Only attach handlers to the meshes that actually need interaction.

## 7. What's next — one sentence

Next lesson: you'll drive 3D scene properties from scroll position using GSAP ScrollTrigger.
