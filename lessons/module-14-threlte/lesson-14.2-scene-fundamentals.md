---
module: 14
lesson: 14.2
title: Scene fundamentals
duration: 40
prerequisites:
  - "14.1 — What Threlte is"
learning_objectives:
  - Configure a PerspectiveCamera with field of view and aspect ratio
  - Add OrbitControls for interactive camera movement
  - Set up DirectionalLight and AmbientLight for realistic illumination
  - Apply MeshStandardMaterial with metalness and roughness
  - Understand the camera-light-material triad for convincing 3D
status: ready
---

# Lesson 14.2 — Scene fundamentals

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build.

## 1. Concept — cameras, lights, and materials form the rendering triad

### 1.1 What the problem is

A 3D scene with just a mesh and no camera produces nothing visible. A scene with a camera but no lights renders everything black (unless you use an unlit material). A scene with lights but a basic material looks flat and unrealistic. You need all three — camera, lights, materials — working together to produce convincing 3D.

Beginners often add a mesh and wonder why it appears as a black silhouette. The answer is always the same: you forgot to light it. Or they add lights but the material does not respond to them (using `MeshBasicMaterial` instead of `MeshStandardMaterial`).

### 1.2 The camera

A `PerspectiveCamera` simulates how human eyes see — objects farther away appear smaller. It has four key parameters:

- **fov** (field of view) — the vertical angle the camera sees. 45-75 degrees is typical. Lower values feel telephoto (compressed), higher values feel wide-angle (distorted).
- **aspect** — width/height ratio. Threlte handles this automatically based on the canvas size.
- **near / far** — clipping planes. Objects closer than `near` or farther than `far` are invisible. Defaults (0.1 to 1000) work for most scenes.

Position the camera with the `position` prop: `position={[0, 2, 5]}` places it 5 units back and 2 units up, looking toward the origin.

### 1.3 OrbitControls

`OrbitControls` from `@threlte/extras` lets the user rotate the camera around a target point by dragging, zoom with scroll, and pan with right-click. In a product showcase, you often want orbit with constraints — limited polar angle (don't let users look underneath), disabled pan, damping for smooth deceleration.

Import and use it as a child of the camera:

```
<T.PerspectiveCamera makeDefault position={[0, 2, 5]}>
    <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2} />
</T.PerspectiveCamera>
```

### 1.4 Lights

Two lights cover 90% of needs:

- **AmbientLight** — adds uniform light from all directions. It prevents pure-black shadows. Keep intensity low (0.3–0.5) or shadows disappear entirely.
- **DirectionalLight** — simulates sunlight. Parallel rays from a direction. Position determines ray direction (light points from `position` toward the origin). Intensity of 1.0–1.5 is typical.

For product scenes, add a second DirectionalLight from the opposite side at lower intensity (0.3–0.5) as a "fill light" to soften harsh shadows.

### 1.5 Materials

`MeshStandardMaterial` is the physically-based material. It responds to lights using a PBR (physically-based rendering) model with two key controls:

- **metalness** (0–1) — 0 = dielectric (plastic, wood), 1 = metal (chrome, gold).
- **roughness** (0–1) — 0 = mirror-smooth, 1 = matte/rough.

A metalness of 0.3 and roughness of 0.4 gives a subtle sheen that works well for product renders. Pure metalness (1.0) requires an environment map to look convincing — without one, metals appear dark.

### 1.6 Putting it together

The rendering equation: Camera observes Meshes that have Materials which respond to Lights. If any link is missing, the chain breaks. This lesson ensures you understand each piece before combining them into complex scenes.

## 2. Style it — PE7 applied to this lesson's mini-build

The 3D canvas sits inside a card component with PE7 styling:

- Dark gradient background using `oklch(16% 0.03 260)` to `oklch(10% 0.02 260)` — makes the lit 3D object pop.
- Rounded corners via `var(--radius-xl)`.
- Below the canvas, parameter controls (sliders for metalness, roughness, light intensity) use PE7 form tokens: `var(--space-sm)` gaps, `var(--color-brand)` accent on range thumbs.
- Mobile-first: controls stack vertically at base, grid to 2 columns at `min-width: 768px`.

## 3. Interact — reactive material properties

The TypeScript concept: **reactive props drive Three.js updates**. When you bind a slider value to `$state` and pass it as a prop to `<T.MeshStandardMaterial metalness={metal}>`, Threlte reactively updates the material whenever the state changes. No manual `.needsUpdate = true` required.

The mistake: creating a new material on every state change by putting the material construction inside a `$derived`. Threlte handles property updates on the existing material — you only need to pass the new value as a prop.

## 4. Mini-build — interactive material explorer

**File:** `src/routes/modules/14-threlte/02-scene-fundamentals/+page.svelte`

See the accompanying route file for the full working component.

**DevTools moment:** Open the browser's Performance tab and record while dragging the orbit controls. The frame rate should stay at 60fps. If it drops, you may have accidentally created new objects on every frame (a common mistake when putting `new THREE.Color()` inside a reactive expression).

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why does a mesh with MeshStandardMaterial appear completely black when no lights are in the scene?</summary>

MeshStandardMaterial is physically-based — it calculates color based on incoming light. With zero light sources, the material receives no illumination and renders as black. AmbientLight or DirectionalLight (or both) must be present for the material to show color.
</details>

<details>
<summary><strong>Q2.</strong> What does `makeDefault` do on a PerspectiveCamera component?</summary>

It tells Threlte to use this camera as the active rendering camera. Without `makeDefault`, the camera exists in the scene but Threlte does not render from its perspective, resulting in a black canvas.
</details>

<details>
<summary><strong>Q3.</strong> Why place OrbitControls as a child of the camera rather than a sibling?</summary>

OrbitControls needs a reference to the camera it controls. When placed as a child, Threlte automatically passes the parent camera reference to the controls. As a sibling, you would need to manually provide the camera reference via a prop.
</details>

<details>
<summary><strong>Q4.</strong> What is the visual difference between metalness 0 and metalness 1 at the same roughness?</summary>

At metalness 0, the surface reflects light diffusely (like plastic) — it has a base color visible even in shadow. At metalness 1, the surface reflects the environment like a mirror — its apparent color comes entirely from reflections. Without an environment map, a metalness-1 surface appears very dark because there is nothing to reflect.
</details>

<details>
<summary><strong>Q5.</strong> If you set `maxPolarAngle={Math.PI / 2}` on OrbitControls, what user action does it prevent?</summary>

It prevents the user from orbiting the camera below the horizontal plane (looking at the object from underneath). The polar angle is clamped to 90 degrees maximum, keeping the camera always at or above the equator of the orbit sphere.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Forgetting AmbientLight.** Without ambient, shadows are pure black. Even a low-intensity ambient (0.3) dramatically improves realism by simulating indirect light bouncing.

2. **Setting DirectionalLight position to [0, 0, 0].** A directional light at the origin points nowhere meaningful. Position it away from the origin — e.g., `[5, 10, 5]` — so the light rays have a clear direction.

3. **Using MeshBasicMaterial and wondering why lights have no effect.** Basic material ignores lights entirely — it always renders at full color. Switch to MeshStandardMaterial or MeshPhongMaterial for light-responsive surfaces.

4. **Setting roughness to exactly 0 without an environment map.** A perfectly smooth surface (roughness 0) reflects the environment. If there is no environment map loaded, the reflections show black, making the object look strange. Use roughness >= 0.1 or add an environment map.

## 7. What's next — one sentence

Next lesson: you'll load real 3D models (GLTF/GLB files) into your scene instead of primitive geometries.
