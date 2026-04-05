---
module: 7
lesson: 7.14
title: Introducing Threlte — 3D in Svelte
duration: 60 minutes
prerequisites:
  - Lesson 7.7 (GSAP cleanup)
  - Lesson 7.9 (ScrollTrigger)
learning_objectives:
  - Explain the relationship between WebGL, Three.js, and Threlte
  - Install `three`, `@threlte/core`, `@threlte/extras`, and `@types/three`
  - Render a basic 3D scene with a camera, two lights, and a mesh using `<Canvas>` and `<T.*>`
  - Wrap `<Canvas>` in a browser guard so SvelteKit SSR does not crash
  - Drive a Threlte mesh's rotation with GSAP ScrollTrigger and map an OKLCH brand colour into Three.js
status: ready
---

# Lesson 7.14 — Introducing Threlte — 3D in Svelte

## 1. Concept — Three pieces of the 3D stack

Drawing a 3D scene in a web page involves three layers, each standing on the one below. You should know exactly what each layer does before you write a single line of Threlte.

### 1.1 WebGL — the browser's 3D pipe

**WebGL** is a browser API that gives you direct access to the GPU from JavaScript. It is a thin binding over OpenGL, which means you work in terms of vertices, buffers, shaders, and draw calls. WebGL is phenomenally powerful and phenomenally awkward — writing even a rotating cube in raw WebGL is 200+ lines of glue code. Nobody uses raw WebGL for app development. WebGL is the foundation, not the tool.

### 1.2 Three.js — the library everybody uses

**Three.js** is a JavaScript library that wraps WebGL in an object-oriented scene graph. Instead of writing shaders, you create a `Scene`, a `Camera`, a `Mesh` (with geometry and material), and you add them to the scene. Three.js translates your high-level objects into the low-level WebGL draw calls every frame. Three.js is the de-facto standard; 99% of 3D on the web runs on it. Documentation at **threejs.org**.

The downside of raw Three.js in a component framework is that it wants to own its own scene graph, which has nothing to do with Svelte's component tree. You end up writing a lot of glue code to synchronise the two, and lifecycle management becomes a pain.

### 1.3 Threlte — the Svelte-idiomatic wrapper

**Threlte** wraps Three.js as Svelte components. Instead of `new Three.PerspectiveCamera(...)`, you write `<T.PerspectiveCamera position={[0, 0, 5]} />`. Threlte turns your Svelte markup into a real Three.js scene graph and keeps them in sync automatically. Everything from Three.js — every geometry, material, light, helper — is available as a `<T.*>` component through the `T` proxy from `@threlte/core`.

The April 2026 Threlte version is 8.x (compatible with Svelte 5, runes-aware). Its two main packages:

- **`@threlte/core`** — `<Canvas>`, `<T.*>` proxy, lifecycle hooks.
- **`@threlte/extras`** — higher-level helpers like `<OrbitControls>`, `<Text>`, `<ContactShadows>`, loaders.

### 1.4 The minimum scene

Every Threlte scene has four parts:

1. **`<Canvas>`** — the root that creates the WebGL context and the Three.js renderer.
2. **A camera** — usually `<T.PerspectiveCamera>` with a position.
3. **Lights** — at least one directional + one ambient for anything to be visible.
4. **A mesh** — geometry + material wrapped in `<T.Mesh>`.

```svelte
<script lang="ts">
	import { Canvas, T } from '@threlte/core';
</script>

<div class="stage">
	<Canvas>
		<T.PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
		<T.AmbientLight intensity={0.4} />
		<T.DirectionalLight position={[5, 10, 5]} intensity={1.2} />
		<T.Mesh>
			<T.TorusGeometry args={[1, 0.4, 16, 100]} />
			<T.MeshStandardMaterial color="hotpink" />
		</T.Mesh>
	</Canvas>
</div>

<style>
	.stage {
		width: 100%;
		aspect-ratio: 16 / 9;
	}
</style>
```

The `args` prop on a geometry passes constructor arguments directly to the Three.js class — `new THREE.TorusGeometry(1, 0.4, 16, 100)`. This is how Threlte lets you use any Three.js class without a hand-written component wrapper.

### 1.5 SSR safety — the browser guard

`<Canvas>` creates a `<canvas>` element and asks for a WebGL context. Both operations require `document` and `window`, which do not exist during SvelteKit's server-side render. The safest pattern is to gate the `<Canvas>` behind SvelteKit's `browser` flag from `$app/environment`:

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	import { Canvas, T } from '@threlte/core';
</script>

{#if browser}
	<Canvas>
		<!-- scene -->
	</Canvas>
{/if}
```

During SSR, the whole `<Canvas>` subtree is skipped and the page HTML contains an empty `div`. On the client, hydration mounts the Canvas and the scene appears. No crash.

### 1.6 Sizing the stage

Threlte's `<Canvas>` fills its nearest positioned parent. Wrap it in a `<div>` with an explicit `width` and `aspect-ratio` (or a fixed `height`) so the canvas has somewhere to live. Without that wrapper the canvas collapses to 0×0 and nothing is visible.

### 1.7 OKLCH to Three.js — colour conversion

Three.js materials accept colours in any form that `THREE.Color` understands: hex strings (`#ff66aa`), CSS color names (`'hotpink'`), RGB tuples, or `THREE.Color` instances. **Three.js does not natively understand `oklch()`**. If you want your PE7 brand colour to drive a material, you have to convert.

The cleanest approach on the web in 2026 is to let the browser do the conversion for you. Create a throwaway element, assign the OKLCH colour to it, read back the computed RGB, then construct a Three.js colour from the RGB numbers:

```ts
import * as THREE from 'three';

export function oklchToThreeColor(oklchString: string): THREE.Color {
	const el = document.createElement('div');
	el.style.color = oklchString;
	document.body.appendChild(el);
	const computed = getComputedStyle(el).color; // e.g. "rgb(254, 171, 120)"
	document.body.removeChild(el);

	const match = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
	if (!match) throw new Error(`Could not parse computed color: ${computed}`);
	const [, r, g, b] = match;
	return new THREE.Color(Number(r) / 255, Number(g) / 255, Number(b) / 255);
}
```

You call it once on mount, pass the resulting `THREE.Color` to the material via the `color` prop, and the torus inherits your brand colour without drifting outside PE7's token system. The function is only safe to call in the browser (it reads `document`), so put it inside an effect that checks `browser` or simply place the call inside the `{#if browser}` block alongside the `<Canvas>`.

### 1.8 Driving Threlte with GSAP

Threlte exposes a `useTask` hook for per-frame updates, but for anything that comes from outside the 3D scene — scroll position, a button click, a timeline — GSAP is a cleaner fit. You obtain a ref to the mesh, set up a GSAP ScrollTrigger that mutates `mesh.rotation.y`, and the render loop picks up the change automatically. That is the mini-build for this lesson.

### 1.9 Reduced motion

Same rules as every other GSAP code: check `prefersReducedMotion.current` and either skip the ScrollTrigger or give the mesh a static rotation.

## 2. Style it — A spinning PE7-coloured torus

The mini-build has a cobalt brand (`oklch(58% 0.2 250)`). The stage is a full-width, 16:9 container holding a `<Canvas>`. A torus sits at the origin with a `MeshStandardMaterial` whose colour comes from the converted PE7 brand token. Two lights, one perspective camera. Scroll to rotate.

## 3. Interact — The first 3D bridge

The student sees three moments connect for the first time: (1) a Svelte component tree that looks like HTML is rendering a Three.js scene; (2) a GSAP ScrollTrigger is setting a 3D object's rotation; (3) an OKLCH brand token is driving a 3D material's colour through a one-time conversion. None of these are hard individually; the magic is seeing them work together.

## 4. Mini-build — Scroll-rotating torus

**File:** `src/routes/modules/07-gsap/14-threlte/+page.svelte`

Structure:

1. Import `browser` from `$app/environment`, `Canvas` and `T` from `@threlte/core`, `gsap` + `ScrollTrigger`, `prefersReducedMotion` from `svelte/motion`.
2. State: a THREE.Color value derived from the OKLCH token, initialised on client mount.
3. A tall scroll container with the `<Canvas>` pinned inside a 70vh stage, wrapped in `{#if browser}`.
4. Inside `<Canvas>`: camera, ambient + directional lights, a `<T.Mesh bind:ref={torusRef}>` containing `<T.TorusGeometry args={[1, 0.4, 32, 200]} />` and `<T.MeshStandardMaterial color={brandColor} metalness={0.2} roughness={0.3} />`.
5. A `$effect` that (a) converts the OKLCH token to a THREE.Color once in the browser, (b) creates a `gsap.context` with a ScrollTrigger on the scroll container, (c) scrubs `torusRef.rotation.y` from 0 to `Math.PI * 2` across the scroll length, (d) returns `() => ctx.revert()`.
6. Long dummy content below the stage so there is something to scroll.

### DevTools verification

1. Load the page. In SSR view (disable JavaScript temporarily in Chrome devtools settings) the page renders with an empty stage placeholder but does not crash.
2. Re-enable JS. The torus appears and is coloured with the PE7 cobalt brand.
3. Scroll. The torus rotates in sync with scroll position. Scrolling back rewinds the rotation.
4. Open Performance and record a scroll — low main-thread cost; the Three.js render runs on the compositor.
5. Navigate away and back — no leaked tweens; `ctx.revert()` handled cleanup.
6. Enable reduced motion — the ScrollTrigger is replaced with a static `gsap.set(torusRef.rotation, { y: 0 })`, and the torus stays still while you scroll.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the relationship between WebGL, Three.js, and Threlte?</summary>

WebGL is a browser API for direct GPU access. Three.js is a JavaScript library that wraps WebGL in a scene-graph abstraction. Threlte wraps Three.js as Svelte components so you can express scenes in Svelte markup and Svelte manages the lifecycle.
</details>

<details>
<summary><strong>Q2.</strong> Why must <code>&lt;Canvas&gt;</code> be wrapped in a browser guard for SvelteKit?</summary>

`<Canvas>` creates a DOM canvas element and requests a WebGL context — both require `document` and `window`, which do not exist during server-side rendering. Without the guard, SSR crashes.
</details>

<details>
<summary><strong>Q3.</strong> What are the four minimum parts of a Threlte scene?</summary>

A `<Canvas>` root, a camera (usually `<T.PerspectiveCamera>`), at least one light (typically an ambient and a directional), and at least one `<T.Mesh>` containing a geometry and a material.
</details>

<details>
<summary><strong>Q4.</strong> Why can't you pass an <code>oklch()</code> string directly to a Three.js material's <code>color</code> prop?</summary>

Three.js's `THREE.Color` class only understands hex, named, and RGB formats. You must convert OKLCH to RGB first — the simplest way is to let the browser parse it by assigning it to an element's `color` style and reading back the computed value.
</details>

<details>
<summary><strong>Q5.</strong> How do you drive a Threlte mesh's rotation from GSAP ScrollTrigger?</summary>

Bind a ref to the mesh via `bind:ref`, then inside a `$effect` create a ScrollTrigger tween that mutates `meshRef.rotation.y` (or x/z). Threlte's render loop picks up the change on the next frame, so there is no manual sync step.
</details>

## 6. Common mistakes

- **Forgetting the browser guard.** SSR crashes with "document is not defined".
- **Canvas inside a zero-size parent.** Threlte's canvas collapses when its parent has no dimensions. Always give the wrapper an explicit size.
- **Passing an OKLCH string to the material.** Three.js silently falls back to black. Convert first.
- **No cleanup.** A Threlte scene ScrollTrigger that is not reverted will run on the next page with a dangling mesh ref.
- **Skipping the `makeDefault` prop on the camera.** Without it, Threlte uses a default internal camera and your `<T.PerspectiveCamera>` becomes decorative.

## 7. What's next

Module 7 ends here. The module project consolidates everything — GSAP timelines, ScrollTrigger with `afterNavigate` refresh, stagger, `use:revealOnScroll`, and a Threlte hero — into a single Premium Marketing Page. Module 8 moves into SvelteKit routing, which is the foundation for every multi-page app you will build after.
