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

Consider what happens when you render a sphere with `MeshStandardMaterial` at `metalness: 0.5, roughness: 0.3`:

1. The camera determines which pixels on screen correspond to the sphere's surface.
2. For each pixel, the renderer traces a line from that pixel back to the surface point on the sphere.
3. At that surface point, the material shader calculates how much light arrives from each light source in the scene.
4. The shader applies the PBR equations — how much light reflects specularly (mirror-like), how much scatters diffusely, and how roughness blurs the specular reflection.
5. The final color is written to the canvas pixel.

This entire process happens per-pixel, per-frame, on the GPU. The more lights, the more meshes, and the higher the resolution, the more work the GPU does. Understanding this pipeline helps you make informed decisions about scene complexity.

### 1.7 The environment map (an advanced topic introduced early)

When you set `metalness` to 1 on a material, the surface should look like a mirror — reflecting its surroundings. But what is there to reflect? By default, nothing. The scene background is empty. This is why pure metals look dark without an environment map.

An **environment map** is a pre-rendered image of a surrounding environment (a sky, a studio, a forest) mapped onto a sphere that wraps the scene. Reflective materials sample this map to produce convincing reflections. Threlte's `<Environment>` component from `@threlte/extras` loads an HDR environment map and applies it to the scene:

```svelte
<Environment url="/hdr/studio.hdr" />
```

You do not need to understand HDR rendering in depth for this lesson. The takeaway is: metallic surfaces need something to reflect. If your metal object looks dark, add an environment map. This is the single most common "fix" for unconvincing PBR scenes.

### 1.8 Camera positioning strategy

Beginners place cameras randomly and wonder why their scene looks wrong. A systematic approach:

1. **Start with the object at the origin** (0, 0, 0). This is where Threlte's auto-centering places most objects.
2. **Move the camera backward** along the Z axis: `position={[0, 0, 5]}`. The object is now 5 units away, visible in the center.
3. **Raise the camera slightly**: `position={[0, 2, 5]}`. This gives a slight top-down angle, which is more natural than looking straight at something.
4. **Adjust field of view** to taste. Lower FOV (35-45) compresses the perspective (telephoto feel). Higher FOV (60-75) makes the scene feel wider and more dramatic.

OrbitControls lets users override your camera position, but the initial position determines the first impression. Choose it intentionally.

### 1.9 The relationship between units and real-world scale

Three.js has no inherent units — a position of `[0, 1, 0]` means "one unit up," not "one meter up." But for consistent lighting and physics (Module 14.7), you should adopt a convention. The standard convention is: **1 unit = 1 meter**. A human-height object is 1.7 units tall. A coffee mug is 0.12 units tall.

This convention matters for:
- **Light intensity** — physically correct light falloff is based on distance. If your "room" is 1000 units wide, light intensities need to be enormous to illuminate it.
- **Camera near/far planes** — the default near plane of 0.1 means objects closer than 10cm clip. If your scale is 1 unit = 1 kilometer, objects within 100 meters would disappear.
- **Physics** — gravity at -9.81 assumes meters. If your units are centimeters, gravity would need to be -981.

Keep the 1-unit-equals-1-meter convention and you avoid an entire category of "why does my scene look wrong" bugs.

## Deep Dive

**Why this matters at scale.** The camera-light-material triad is foundational. Every 3D bug you will encounter in production — "the model is black," "the scene is too dark," "the object looks flat," "reflections are wrong" — traces back to one of these three elements being misconfigured. Teams that understand the triad debug 3D issues in seconds. Teams that do not understand it spend hours adjusting random values hoping something works.

**The mental model.** Think of the three elements as a photographer thinks about a studio shoot. The **camera** is your viewpoint and lens (wide-angle vs telephoto). The **lights** are your studio lighting rig (key light, fill light, ambient). The **material** is the object's surface (matte paper, glossy plastic, brushed metal). A photographer adjusts all three to get the shot they want. You do the same in code.

**Edge cases.** Materials with `metalness: 1` and no environment map render as near-black — this is correct physically (a mirror in a void reflects nothing) but surprises beginners. Materials with `roughness: 0` produce sharp reflections that can look unrealistic if the environment map has visible seams or low resolution. The `transparent: true` property must be explicitly set on materials that use opacity — without it, opacity values below 1 are ignored. Emissive materials bypass the lighting equation entirely — they glow regardless of lights, which is useful for screens, signs, and bloom targets but confusing if applied accidentally.

**Performance.** Each light in the scene increases the GPU work per pixel. DirectionalLight is cheap (parallel rays, one shadow map). PointLight and SpotLight are more expensive because they require distance-based falloff calculations and potentially multiple shadow maps. A scene with 10 lights can cut frame rate significantly on mobile GPUs. For most product showcases, two to three lights (ambient + directional + optional fill) is sufficient and performant.

**Cross-module connections.** Camera positioning connects to Module 7's GSAP ScrollTrigger work — scroll-driven camera animation uses the same `position` and `fov` props. Materials connect to Module 12's performance optimization — reducing texture resolution and using simpler materials on mobile. The OrbitControls interaction model connects to Module 5's event handling — pointer events on meshes and camera controls share the same input pipeline and can conflict if not coordinated.

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
