---
module: 14
lesson: 14.7
title: Physics with Rapier
duration: 45
prerequisites:
  - "14.4 — Interactivity"
  - "14.5 — Scroll-driven 3D scenes"
learning_objectives:
  - Install and configure @threlte/rapier for physics simulation
  - Attach RigidBody and Collider components to meshes
  - Configure gravity, bounce (restitution), and friction
  - Trigger physics from user interaction (click to drop)
  - Reset physics state programmatically
status: ready
---

# Lesson 14.7 — Physics with Rapier

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build.

## 1. Concept — making 3D objects obey physical laws

### 1.1 What the problem is

GSAP gives you precise control over animation — you script exactly how an object moves. But scripted motion looks artificial. When a product "drops" onto a surface, you expect it to accelerate under gravity, bounce based on its material, and eventually come to rest. Scripting this with keyframes requires manual tuning for every scenario. Change the drop height? Re-tune the bounce. Change the surface? Re-tune again.

A physics engine simulates these behaviors automatically. You define masses, shapes, and material properties — the engine calculates forces, collisions, and resulting motion. The animation emerges from the simulation.

### 1.2 What Rapier is

Rapier is a high-performance physics engine written in Rust and compiled to WebAssembly. It runs in the browser at near-native speed. It handles:

- **Rigid body dynamics** — objects with mass that respond to forces and gravity.
- **Collision detection** — determining when objects touch or overlap.
- **Colliders** — simplified shapes (box, sphere, capsule, convex hull) used for collision instead of the full mesh geometry (which would be too expensive).
- **Constraints** — joints, hinges, springs connecting objects.

`@threlte/rapier` wraps Rapier in Threlte components so you can add physics declaratively.

### 1.3 Setting up @threlte/rapier

Install the package:

```bash
pnpm add @threlte/rapier
```

Wrap your physics-enabled content in a `<World>` component that configures gravity:

```svelte
<World gravity={[0, -9.81, 0]}>
    <!-- physics-enabled content here -->
</World>
```

Gravity defaults to Earth-like (-9.81 m/s^2 on the Y axis). You can change it for moon gravity, zero-G, or inverted gravity.

### 1.4 RigidBody and Collider

A mesh becomes a physics object by wrapping it in `<RigidBody>`:

```svelte
<RigidBody type="dynamic">
    <Collider shape="cuboid" args={[0.5, 0.5, 0.5]} />
    <T.Mesh>
        <T.BoxGeometry args={[1, 1, 1]} />
        <T.MeshStandardMaterial color="tomato" />
    </T.Mesh>
</RigidBody>
```

- `type="dynamic"` — affected by gravity and forces (falls, bounces).
- `type="fixed"` — immovable (the ground plane, walls).
- `type="kinematic"` — moved by code, not by forces (platforms, elevators).

The `<Collider>` defines the collision shape. It does not need to match the visual mesh exactly — a simplified shape (cuboid for a box, ball for a sphere) is faster and usually sufficient.

### 1.5 Bounce and friction

Material properties control how collisions feel:

- **Restitution** (0–1) — bounciness. 0 = no bounce (clay), 1 = perfect bounce (super ball).
- **Friction** (0–1) — resistance to sliding. 0 = ice, 1 = rubber.

Set these on the `<Collider>`:

```svelte
<Collider shape="ball" args={[0.5]} restitution={0.7} friction={0.3} />
```

### 1.6 Triggering physics from user interaction

A common pattern: the product model starts as `kinematic` (positioned by scroll animation), then on a "Drop test" button click, switches to `dynamic` to fall under gravity. After a delay, reset it back to `kinematic` at the original position.

You control this via reactive state:

1. Track `bodyType` in `$state<'kinematic' | 'dynamic'>('kinematic')`.
2. On button click, set to `'dynamic'` — the object falls.
3. After 3 seconds (setTimeout), set back to `'kinematic'` and reset position.

### 1.7 Performance of physics

Rapier in WASM is fast, but physics still has a cost:

- Each rigid body adds to the simulation step.
- Complex collider shapes (trimesh) are expensive — prefer primitives.
- The physics world steps at a fixed rate (default 60 Hz) regardless of frame rate.
- For scenes where physics is only occasionally needed, instantiate the `<World>` conditionally.

## 2. Style it — PE7 applied to this lesson's mini-build

The mini-build has a "Drop test" button and a physics playground:

- The button uses the PE7 CTA style: `background: var(--color-brand)`, `min-block-size: 44px`, `border-radius: var(--radius-md)`.
- A reset button appears after the drop completes, using the secondary/ghost variant.
- The ground plane in 3D is styled with a grid texture matching the PE7 grid aesthetic.
- Status text ("Falling...", "Resting", "Kinematic") uses `var(--color-text-muted)` with monospace font.

## 3. Interact — reactive body type switching

The TypeScript concept: **reactive props control physics behavior**. Changing `type` on `<RigidBody>` from `'kinematic'` to `'dynamic'` mid-simulation causes Rapier to apply gravity to the body immediately. The object begins accelerating downward from its current position.

The mistake: trying to manually set `position` on a dynamic rigid body. Dynamic bodies are controlled by the physics engine — setting position directly conflicts with the simulation. To teleport a dynamic body, first switch it to kinematic, set position, then switch back.

## 4. Mini-build — click-to-drop physics playground

**File:** `src/routes/modules/14-threlte/07-physics-rapier/+page.svelte`

See the accompanying route file for the full working component.

**DevTools moment:** The Rapier debug renderer (if enabled) draws wireframe collider shapes over your meshes. This shows you the actual collision boundaries the physics engine uses — useful for debugging when objects pass through each other (collider too small) or float above surfaces (collider too large).

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> What is the difference between a "dynamic" and "fixed" rigid body?</summary>

A dynamic body is affected by gravity and forces — it moves, falls, bounces, and collides. A fixed body is immovable — it acts as a wall or ground that other objects collide with but never moves itself, regardless of forces applied to it.
</details>

<details>
<summary><strong>Q2.</strong> Why use a simplified Collider shape instead of the exact mesh geometry?</summary>

Collision detection against a full mesh (trimesh) requires testing every triangle — extremely expensive for complex models. Simplified shapes (cuboid, ball, capsule) require only one mathematical intersection test, running orders of magnitude faster while giving "close enough" collision behavior for most use cases.
</details>

<details>
<summary><strong>Q3.</strong> What does restitution control and what values produce what behavior?</summary>

Restitution controls bounciness on collision. 0 = no bounce (the object stops dead on impact, like clay). 1 = perfect elastic bounce (the object rebounds to its original height). Values between 0 and 1 produce partial bounces that lose energy each time, which is what most real materials do (0.3–0.7).
</details>

<details>
<summary><strong>Q4.</strong> How do you reset a fallen object back to its original position?</summary>

Switch the rigid body type from `'dynamic'` to `'kinematic'` (stops physics control), then set the body's position back to the original coordinates. Optionally switch back to `'dynamic'` to allow it to fall again. You cannot directly set position on a dynamic body — the physics engine controls it.
</details>

<details>
<summary><strong>Q5.</strong> Why is @threlte/rapier compiled to WebAssembly instead of pure JavaScript?</summary>

Physics simulation involves heavy numerical computation (matrix math, constraint solving, broad-phase collision detection). WebAssembly runs at near-native CPU speed — significantly faster than JavaScript for this type of work. Rapier is written in Rust and compiled to WASM, giving browser-based physics performance comparable to native game engines.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Forgetting the `<World>` wrapper.** RigidBody and Collider components require a `<World>` ancestor for context. Without it, you get a runtime error about missing Rapier world context.

2. **Using trimesh colliders for dynamic bodies.** Trimesh (exact mesh shape) colliders only work with fixed bodies in Rapier. For dynamic bodies, use convex hull or primitive shapes. This is a Rapier limitation for performance reasons.

3. **Not waiting for WASM initialization.** Rapier's WASM module loads asynchronously. If you try to create physics objects before it initializes, you get errors. `@threlte/rapier`'s `<World>` handles this with a loading state — content inside only renders after WASM is ready.

4. **Conflicting GSAP animation with physics.** If a mesh has both a GSAP scroll animation and a dynamic RigidBody, they fight over the object's transform. Use `kinematic` type during GSAP-controlled phases and switch to `dynamic` only when physics should take over.

## 7. What's next — one sentence

Next lesson: you'll learn production optimization patterns — lazy loading, DPR clamping, demand-based frame loops, and reduced-motion fallbacks — to ship 3D that does not destroy performance.
