---
module: 14
lesson: 14.1
title: What Threlte is
duration: 35
prerequisites:
  - "7.14 — Introducing Threlte"
  - "12.12 — 3D Performance with Threlte"
  - "Basic understanding of component composition (Module 3)"
learning_objectives:
  - Explain what Three.js is and why a Svelte abstraction exists
  - Install @threlte/core and @threlte/extras alongside three
  - Create a minimal scene with <Canvas> and <T.*> components
  - Understand the declarative scene graph model
  - Identify where Threlte fits in the SvelteKit rendering lifecycle
status: ready
---

# Lesson 14.1 — What Threlte is

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build.

## 1. Concept — Three.js is powerful but imperative; Threlte makes it declarative

### 1.1 What the problem is

Three.js is the dominant JavaScript library for 3D rendering on the web. It gives you full control over cameras, lights, meshes, materials, geometries, and the render loop. But it is deeply imperative. A basic spinning cube requires 30+ lines of manual setup: create a scene, create a renderer, attach it to a DOM element, create a camera, create geometry, create material, create a mesh, add it to the scene, write an animation loop, handle resize events, clean up on unmount. Every step is a manual function call. There is no reactivity, no component model, no lifecycle management. You are back to writing vanilla JavaScript from 2015.

For a Svelte developer, this clashes with everything you know. Svelte gives you declarative templates, reactive state, scoped styles, and automatic cleanup. Threlte bridges the gap: it wraps Three.js in Svelte 5 components so you write 3D scenes the same way you write 2D UI — declaratively, reactively, with full TypeScript support.

### 1.2 How Threlte solves it

Threlte is a Svelte-native Three.js framework. It provides:

- **`<Canvas>`** — a root component that creates the WebGL renderer, manages the animation loop, handles resizing, and provides context to all child components.
- **`<T.*>` components** — a generic component that instantiates any Three.js class. `<T.Mesh>` creates a `THREE.Mesh`. `<T.PerspectiveCamera>` creates a `THREE.PerspectiveCamera`. Props map directly to constructor arguments and object properties.
- **Declarative scene graph** — nesting `<T.*>` components mirrors Three.js's parent-child scene graph. A `<T.Mesh>` inside another `<T.Group>` is automatically added to that group.
- **Reactive props** — changing a prop on `<T.MeshStandardMaterial color={brandColor}>` reactively updates the material. No manual `.needsUpdate = true`.
- **Automatic disposal** — when a component unmounts, Threlte disposes its Three.js resources (geometries, materials, textures). No memory leaks.

### 1.3 How it connects to what you already know

In Module 7 (lesson 7.14), you created your first Threlte scene — a spinning torus driven by GSAP. In Module 12 (lesson 12.12), you learned about lazy loading and `frameloop="demand"`. This module goes deep: 8 lessons that take you from scene fundamentals through physics, post-processing, and production optimization.

Threlte uses the same patterns you already know: `$effect` for side effects, `$state` for reactive values, `$props()` for component inputs, `bind:ref` for accessing the underlying Three.js object. The mental model is identical to building 2D UI — just with a third dimension.

### 1.4 The Threlte ecosystem (May 2026)

Threlte is split into packages:

| Package | Purpose |
|---------|---------|
| `@threlte/core` | `<Canvas>`, `<T>`, render loop, context |
| `@threlte/extras` | OrbitControls, useGltf, interactivity, post-processing, Text, Float, etc. |
| `@threlte/rapier` | Physics via the Rapier engine (rigid bodies, colliders, joints) |
| `@threlte/xr` | WebXR (VR/AR) support |

You install them alongside `three`:

```bash
pnpm add three @threlte/core @threlte/extras
pnpm add -D @types/three
```

### 1.5 SSR safety

Three.js requires a WebGL context, which only exists in the browser. SvelteKit renders pages on the server first (SSR). If you import `<Canvas>` at the top level and render it unconditionally, the server build will crash or produce errors.

The solution: wrap your canvas in `{#if browser}` where `browser` comes from `$app/environment`. This ensures the 3D scene only mounts client-side. The server renders whatever is in the `{:else}` block — typically a placeholder or poster image.

## 2. Style it — PE7 applied to this lesson's mini-build

The mini-build is a simple scene container. Style the container with PE7 tokens:

- Use `aspect-ratio: 16 / 9` for consistent proportions across viewports.
- Apply `border-radius: var(--radius-xl)` for the rounded card aesthetic.
- Background gradient uses OKLCH values from the PE7 palette for the dark "space" look behind the 3D scene.
- `overflow: hidden` clips the canvas to the rounded corners.
- Mobile-first: the container is `width: 100%` at base, with a `max-inline-size` on larger screens.

## 3. Interact — mounting a Canvas and placing a mesh

The JavaScript concept: **the scene graph is a tree**. Every Three.js object has a parent. The root is the `Scene` (created automatically by `<Canvas>`). You add children by nesting `<T.*>` components.

A common mistake: trying to render `<T.Mesh>` outside of a `<Canvas>`. Threlte's `<T>` components require the context that `<Canvas>` provides. Without it, you get a runtime error: "No Threlte context found."

The correct structure:

```svelte
<Canvas>
  <T.PerspectiveCamera makeDefault position={[0, 0, 5]} />
  <T.AmbientLight intensity={0.5} />
  <T.Mesh>
    <T.BoxGeometry args={[1, 1, 1]} />
    <T.MeshStandardMaterial color="hotpink" />
  </T.Mesh>
</Canvas>
```

Children of `<T.Mesh>` that are geometries or materials are automatically recognized and attached. This is Threlte's "attach" heuristic — it knows that a `BufferGeometry` goes in `mesh.geometry` and a `Material` goes in `mesh.material`.

## 4. Mini-build — a PE7-styled 3D cube

**File:** `src/routes/modules/14-threlte/01-what-is-threlte/+page.svelte`

See the accompanying route file for the full working component.

**DevTools moment:** Open the browser DevTools Network tab. Notice that `three` is loaded as a separate chunk (code splitting works automatically). In the Performance tab, you can see the animation frame loop running at 60fps. In Svelte DevTools, the `<Canvas>` component tree mirrors the Three.js scene graph.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why can't you render a <T.Mesh> outside of a <Canvas> component?</summary>

`<T.*>` components rely on Threlte context (the scene, renderer, and render loop) that `<Canvas>` provides via Svelte's `setContext`. Without that context, Threlte has nowhere to add the Three.js object and no render loop to display it.
</details>

<details>
<summary><strong>Q2.</strong> What does the `{#if browser}` guard around <Canvas> accomplish?</summary>

It prevents the Canvas from rendering during SSR. Three.js requires a WebGL context which only exists in browsers. Without this guard, the server build would fail or produce errors when trying to create a WebGL renderer.
</details>

<details>
<summary><strong>Q3.</strong> How does Threlte know that a <T.BoxGeometry> inside a <T.Mesh> should be attached as the mesh's geometry?</summary>

Threlte uses an "attach" heuristic. It inspects the Three.js class hierarchy — if the child `instanceof BufferGeometry`, it attaches to `parent.geometry`. If it `instanceof Material`, it attaches to `parent.material`. You can override this with the `attach` prop.
</details>

<details>
<summary><strong>Q4.</strong> What happens to Three.js resources (geometries, materials) when a Threlte component unmounts?</summary>

Threlte automatically calls `.dispose()` on them, freeing GPU memory. This prevents memory leaks when components are conditionally rendered or when navigating between pages.
</details>

<details>
<summary><strong>Q5.</strong> Explain the difference between `@threlte/core` and `@threlte/extras`.</summary>

`@threlte/core` provides the foundational pieces: `<Canvas>`, the `<T>` component, the render loop, and context management. `@threlte/extras` provides higher-level utilities and pre-built components like OrbitControls, GLTF loaders, interactivity plugins, text rendering, and post-processing — things you could build yourself but would rather not.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Importing Three.js on the server.** If you `import * as THREE from 'three'` at the top of a `+page.svelte` without the `{#if browser}` guard, the import itself is fine (it's just JS), but instantiating objects that require WebGL will fail during SSR. Keep instantiation inside effects or browser-guarded blocks.

2. **Forgetting `makeDefault` on the camera.** If you add a `<T.PerspectiveCamera>` without `makeDefault`, Threlte won't use it as the active camera. The scene renders but appears black because no camera is active.

3. **Setting position as a single number.** `position={5}` does not work. Three.js positions are `[x, y, z]` tuples. Write `position={[0, 0, 5]}` or use the shorthand `position.z={5}`.

4. **Not installing `@types/three`.** Without the type definitions, TypeScript cannot verify your `<T.*>` props. Install it as a dev dependency: `pnpm add -D @types/three`.

## 7. What's next — one sentence

Next lesson: you'll set up a complete scene with a perspective camera, orbit controls, and a properly lit environment.
