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

### 1.7 How raycasting actually works

Raycasting is a mathematical operation. Given the camera's position and the 2D pointer coordinates on screen, the system constructs a 3D ray (a line extending from the camera through the pointer position into the scene). It then checks every candidate mesh to see if the ray intersects its geometry.

For each candidate mesh, the test proceeds in stages:

1. **Bounding sphere test** — does the ray intersect the mesh's bounding sphere? This is a fast check (one distance calculation) that eliminates most meshes instantly.
2. **Bounding box test** — does the ray intersect the mesh's axis-aligned bounding box? Slightly more expensive but still fast, eliminates more candidates.
3. **Triangle intersection** — for meshes that pass the bounding checks, the ray is tested against every triangle in the geometry. This is O(n) in the triangle count.

The result is a list of intersections sorted by distance. The closest one is the "hit." Threlte delivers this information through the event object — `event.point` is where the ray hit the surface, `event.distance` is how far from the camera, and `event.object` is which mesh was hit.

### 1.8 The event propagation model

In the DOM, events bubble up from child to parent. Threlte's interactivity plugin implements a similar model for 3D:

- A click event fires on the most specific (closest) intersected mesh.
- If that mesh does not have an `onclick` handler, the event propagates up the scene graph to parent groups.
- You can stop propagation with `event.stopPropagation()` just like in DOM events.

This means you can attach a single click handler on a parent `<T.Group>` and it will catch clicks on any child mesh within that group — useful for complex multi-mesh models where you want one handler for the entire object.

### 1.9 Pointer event types available

Threlte supports a rich set of pointer events that mirror the DOM:

- `onclick` — pointer down + up on the same object
- `onpointerdown` — pointer button pressed while over the object
- `onpointerup` — pointer button released while over the object
- `onpointerenter` — pointer enters the object (does not bubble)
- `onpointerleave` — pointer leaves the object (does not bubble)
- `onpointermove` — pointer moves while over the object (fires frequently)
- `onpointerover` — like enter but bubbles
- `onpointerout` — like leave but bubbles

Choosing between `onpointerenter`/`onpointerleave` (no bubble) and `onpointerover`/`onpointerout` (bubbles) follows the same logic as DOM events. For most hover effects, use `onpointerenter`/`onpointerleave`.

### 1.10 Interaction with reactive state

The power of Threlte's interactivity comes from combining pointer events with Svelte's reactive state. Here is the complete pattern for an interactive product selector:

```typescript
let selectedId: string | null = $state(null);
let hoveredId: string | null = $state(null);
```

Each mesh reads these values to determine its visual state:

```svelte
<T.Mesh
    onclick={() => { selectedId = mesh.id; }}
    onpointerenter={() => { hoveredId = mesh.id; }}
    onpointerleave={() => { hoveredId = null; }}
>
    <T.MeshStandardMaterial
        color={selectedId === mesh.id ? 'gold' : 'white'}
        emissive={hoveredId === mesh.id ? '#333333' : '#000000'}
    />
</T.Mesh>
```

The reactive material props update instantly when state changes. No manual material updating is needed. This is the same pattern you use for highlighting list items in 2D — selected item gets a different background. In 3D, the "background" is the material color.

## Deep Dive

**Why this matters at scale.** Interactive 3D is what separates a static showcase from a product configurator, a data visualization, or an explorable portfolio. Production applications need reliable interaction that works on touch devices, with keyboard accessibility, and without frame rate drops. Teams that understand raycasting performance can build configurators with hundreds of interactive parts. Teams that do not understand it ship products that become unresponsive the moment complexity increases.

**The mental model.** Think of raycasting as "asking the scene a question." Every time the pointer moves, you ask: "What is under the cursor right now?" The scene answers with the closest object. This is fundamentally different from DOM events where the browser tracks which element the cursor is over continuously. In 3D, the answer must be recomputed because objects move, cameras rotate, and perspective changes what is "under" a given screen coordinate.

**Edge cases.** Transparent objects can be hit by raycasts even in their transparent regions — the raycast tests geometry, not visual opacity. If you have a mesh with a texture that has transparent areas (like a leaf shape on a plane), clicks on the transparent part still register as hits on that mesh. The workaround is to use a custom raycasting target (a smaller collision mesh) or to check the UV coordinates in the hit callback and reject transparent regions. Another edge case: overlapping meshes where a large background mesh "steals" clicks from smaller foreground meshes. Set `renderOrder` or adjust the scene hierarchy to control which mesh wins.

**Performance.** On a page with 50 interactive meshes, raycasting typically takes 0.1-0.5ms per frame — negligible. But with 500 meshes at 100K+ triangles each, the triangle intersection phase dominates. The solution is to use simplified collision meshes (invisible low-poly versions) for raycasting while displaying the high-poly version visually. Threlte does not do this automatically — you must create a separate invisible mesh with simpler geometry and attach the event handlers to it.

**Cross-module connections.** Interactivity connects to Module 5 (event handlers — same naming convention with `onclick`, `onpointerenter`), Module 2 (reactivity — `$state` drives material properties based on interaction), Module 6 (transitions — hover/select states can trigger CSS transitions on 2D overlays), and Module 7 (GSAP — click events can trigger GSAP animations on meshes or the camera).

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
