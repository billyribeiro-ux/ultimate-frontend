# Module 14 — Threlte (3D): Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Keep browser preview large for 3D visibility. Consider fullscreen browser for scene demos.

---

## Lesson 14.1 — What is Threlte

**Duration:** 10 minutes
**Screen setup:** Slides for concepts, browser showing Threlte examples

### Hook (30 seconds)
"Three.js powers the 3D web — but its imperative API fights against component-based frameworks. Threlte wraps Three.js in Svelte components: a `<Canvas>`, `<Mesh>`, `<Light>` that are reactive, composable, and type-safe. 3D with the DX of Svelte."

### Demo sequence
1. **[0:30-2:30] Three.js vs Threlte** — Same scene in imperative Three.js (30 lines) vs Threlte components (10 lines).
2. **[2:30-5:00] Architecture** — Canvas → Scene → Objects. Show the component tree matching the scene graph.
3. **[5:00-7:00] Installation** — `pnpm add @threlte/core @threlte/extras three`. Setup in a SvelteKit project.
4. **[7:00-8:30] Build the mini-build** — Spinning cube: Canvas, mesh, geometry, material, animation loop.
5. **[8:30-9:30] Edge case / gotcha** — "Threlte uses Three.js under the hood. All Three.js knowledge transfers. But Threlte manages the render loop — do not call `renderer.render()` yourself."

### Key moments
- 0:30 — "Three.js meets Svelte"
- 2:30 — "Component architecture"
- 5:00 — "Installation"
- 7:00 — "Spinning cube"
- 8:30 — "Don't manage the renderer"

### Callout graphics
- Three.js vs Threlte code comparison
- Scene graph → component tree mapping
- Package installation checklist

### Outro (30 seconds)
"Threlte brings 3D into the Svelte component model. Next lesson: scene fundamentals."

---

## Lesson 14.2 — Scene fundamentals

**Duration:** 11 minutes
**Screen setup:** Editor with scene code, browser showing 3D scene

### Hook (30 seconds)
"Every 3D scene needs three things: geometry (the shape), material (the appearance), and light (the illumination). Without light, everything is black. Without material, geometry is invisible. This lesson builds a scene from nothing to a fully lit, textured stage."

### Demo sequence
1. **[0:30-2:30] Geometry** — BoxGeometry, SphereGeometry, PlaneGeometry. Show each one appearing in the scene.
2. **[2:30-5:00] Materials** — MeshStandardMaterial with color, roughness, metalness. Show how material properties change appearance.
3. **[5:00-7:30] Lighting** — AmbientLight, DirectionalLight, PointLight. Show the scene going from dark to properly lit.
4. **[7:30-9:30] Build the mini-build** — Product display stage: plane, three objects, two lights, orbit camera.
5. **[9:30-10:30] Edge case / gotcha** — "Shadows are expensive. Enable them selectively: `castShadow` on lights and objects, `receiveShadow` on ground planes. Do not enable shadows globally."

### Key moments
- 0:30 — "Geometry + Material + Light"
- 2:30 — "Material properties"
- 5:00 — "Lighting types"
- 7:30 — "Product stage"
- 9:30 — "Shadow performance"

### Callout graphics
- Scene fundamentals diagram
- Material property comparison
- Lighting types reference

### Outro (30 seconds)
"You can build lit, textured 3D scenes. Next lesson: loading 3D models."

---

## Lesson 14.3 — Loading models

**Duration:** 11 minutes
**Screen setup:** Editor with model loading code, browser showing GLTF model

### Hook (30 seconds)
"Real 3D products are not cubes and spheres. They are detailed models created in Blender, exported as GLTF files. Threlte loads these models with a single component — and you can inspect, animate, and interact with every part."

### Demo sequence
1. **[0:30-2:30] GLTF format** — Why GLTF is the "JPEG of 3D." Compact, web-optimized, supports animations.
2. **[2:30-5:00] Loading a model** — Use `useGltf()` to load a .glb file. Show the model appearing in the scene.
3. **[5:00-7:30] Model inspection** — Access model parts by name. Change materials, hide parts, add interactivity.
4. **[7:30-9:30] Build the mini-build** — Shoe configurator: load a shoe model, highlight different parts.
5. **[9:30-10:30] Edge case / gotcha** — "Large models (>5MB) hurt loading time. Use gltf-transform or Draco compression to reduce file sizes by 60-80%."

### Key moments
- 0:30 — "Real models, not primitives"
- 2:30 — "Loading GLTF"
- 5:00 — "Part access"
- 7:30 — "Shoe configurator"
- 9:30 — "Model compression"

### Callout graphics
- GLTF file structure
- Model loading pipeline
- Compression comparison

### Outro (30 seconds)
"You can load and manipulate real 3D models. Next lesson: interactivity."

---

## Lesson 14.4 — Interactivity

**Duration:** 11 minutes
**Screen setup:** Editor with interactive scene, browser showing pointer interactions

### Hook (30 seconds)
"Click a 3D object and it changes color. Hover and it highlights. Drag to rotate. Threlte's event system makes 3D objects interactive with the same event patterns you use for HTML elements."

### Demo sequence
1. **[0:30-2:30] Pointer events** — onclick, onpointerenter, onpointerleave on 3D objects. Show events firing.
2. **[2:30-5:00] Raycasting** — How Threlte determines which object the pointer hits. Show raycasting visualization.
3. **[5:00-7:30] Drag and transform** — Implement object dragging using pointer events and position updates.
4. **[7:30-9:30] Build the mini-build** — Interactive product showcase: click to select, hover to highlight, rotate with orbit controls.
5. **[9:30-10:30] Edge case / gotcha** — "Raycasting checks every object in the scene. For complex scenes with many objects, use layers to limit which objects receive pointer events."

### Key moments
- 0:30 — "Click, hover, drag in 3D"
- 2:30 — "Raycasting explained"
- 5:00 — "Drag interaction"
- 7:30 — "Product showcase"
- 9:30 — "Raycasting performance"

### Callout graphics
- Pointer event flow in 3D
- Raycasting visualization
- Layer filtering diagram

### Outro (30 seconds)
"3D objects can be as interactive as HTML elements. Next lesson: scroll-driven 3D."

---

## Lesson 14.5 — Scroll-driven 3D

**Duration:** 11 minutes
**Screen setup:** Editor with scroll-linked scene, browser showing scroll animation

### Hook (30 seconds)
"The user scrolls. A 3D product rotates, the camera moves through a scene, objects fade in at specific scroll positions. Scroll-driven 3D creates cinematic landing pages that respond to the most natural user interaction — scrolling."

### Demo sequence
1. **[0:30-2:30] Scroll progress** — Map scroll position (0-1) to animation progress. Show a simple rotation linked to scroll.
2. **[2:30-5:00] Camera path** — Move the camera along a path as the user scrolls. Create a walkthrough effect.
3. **[5:00-7:30] Reveal animations** — Objects appear, scale, and rotate at specific scroll positions. Use intersection observer.
4. **[7:30-9:30] Build the mini-build** — Product landing page: scroll to explore the product from multiple angles.
5. **[9:30-10:30] Edge case / gotcha** — "Scroll-driven animations must respect prefers-reduced-motion. Provide a static fallback for users who disable animations."

### Key moments
- 0:30 — "Scroll drives the scene"
- 2:30 — "Camera paths"
- 5:00 — "Scroll reveals"
- 7:30 — "Product landing page"
- 9:30 — "Reduced motion"

### Callout graphics
- Scroll-to-progress mapping
- Camera path visualization
- Reduced motion fallback

### Outro (30 seconds)
"Scroll-driven 3D creates immersive experiences. Next lesson: post-processing effects."

---

## Lesson 14.6 — Post-processing

**Duration:** 10 minutes
**Screen setup:** Editor with post-processing setup, browser showing effects

### Hook (30 seconds)
"Bloom makes lights glow. SSAO adds depth to crevices. Vignette focuses attention to the center. Post-processing effects apply full-screen image filters after the 3D scene renders — cinematic quality from a few lines of code."

### Demo sequence
1. **[0:30-2:30] Post-processing pipeline** — EffectComposer processes the rendered image. Show before/after.
2. **[2:30-5:00] Common effects** — Bloom, SSAO, vignette, chromatic aberration. Show each one toggled on/off.
3. **[5:00-7:00] Performance impact** — Each effect costs GPU time. Show FPS with 0, 1, 3, 5 effects.
4. **[7:00-8:30] Build the mini-build** — Moody product shot with bloom and vignette.
5. **[8:30-9:30] Edge case / gotcha** — "Mobile GPUs are weak. Use fewer effects on mobile or disable post-processing entirely based on device capabilities."

### Key moments
- 0:30 — "Cinematic effects"
- 2:30 — "Common effects gallery"
- 5:00 — "Performance cost"
- 7:00 — "Product shot"
- 8:30 — "Mobile limitations"

### Callout graphics
- Post-processing pipeline
- Effect comparison gallery
- Performance impact chart

### Outro (30 seconds)
"Post-processing adds cinematic polish. Next lesson: physics with Rapier."

---

## Lesson 14.7 — Physics with Rapier

**Duration:** 11 minutes
**Screen setup:** Editor with physics scene, browser showing falling objects

### Hook (30 seconds)
"Objects fall, bounce, collide, and stack. Physics simulation makes 3D scenes feel real. Rapier is a high-performance physics engine, and Threlte integrates it with components: `<RigidBody>`, `<Collider>`, gravity."

### Demo sequence
1. **[0:30-2:30] Adding physics** — Install @threlte/rapier. Add `<World>` component. Objects start falling with gravity.
2. **[2:30-5:00] Rigid bodies and colliders** — Wrap objects in `<RigidBody>`. Add collider shapes. Show objects bouncing.
3. **[5:00-7:30] Interaction** — Click to spawn objects. Apply forces and impulses. Show stacking.
4. **[7:30-9:30] Build the mini-build** — Physics playground: drop shapes onto a platform, watch them interact.
5. **[9:30-10:30] Edge case / gotcha** — "Physics runs at a fixed timestep. If your frame rate drops, physics catches up with multiple steps — this can cause tunneling (objects passing through walls) at very low FPS."

### Key moments
- 0:30 — "Real physics in the browser"
- 2:30 — "Rigid bodies and colliders"
- 5:00 — "Interactive forces"
- 7:30 — "Physics playground"
- 9:30 — "Fixed timestep and tunneling"

### Callout graphics
- Physics pipeline
- Collider shape types
- Force application diagram

### Outro (30 seconds)
"Physics makes 3D scenes dynamic and realistic. Last lesson: production 3D patterns."

---

## Lesson 14.8 — Production 3D

**Duration:** 11 minutes
**Screen setup:** Editor with production optimizations, performance metrics

### Hook (30 seconds)
"Your 3D scene works in development. Now ship it. Production 3D means lazy loading the canvas, progressive enhancement for non-WebGL browsers, performance budgets, and accessibility for keyboard and screen reader users."

### Demo sequence
1. **[0:30-2:30] Lazy canvas** — Load the 3D scene only when it is in the viewport. Show the lazy loading pattern.
2. **[2:30-5:00] Progressive enhancement** — Fallback image for non-WebGL browsers. Detect WebGL support.
3. **[5:00-7:30] Performance budget** — Set targets: 60fps on mid-range devices, <5MB total 3D assets. Monitor with DevTools.
4. **[7:30-9:30] Build the mini-build** — Production-ready product viewer: lazy, progressively enhanced, accessible.
5. **[9:30-10:30] Edge case / gotcha** — "iOS Safari has WebGL memory limits. Complex scenes crash on older iPhones. Test on real devices, not just simulators."

### Key moments
- 0:30 — "Ship it right"
- 2:30 — "Progressive enhancement"
- 5:00 — "Performance budgets"
- 7:30 — "Production viewer"
- 9:30 — "iOS Safari limits"

### Callout graphics
- Lazy loading flow
- Progressive enhancement layers
- Performance budget checklist

### Outro (30 seconds)
"Production 3D is lazy, progressively enhanced, and performance-budgeted. Module 14 is complete — you can build and ship 3D experiences in SvelteKit."

---
