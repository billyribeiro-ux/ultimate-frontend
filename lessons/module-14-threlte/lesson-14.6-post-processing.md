---
module: 14
lesson: 14.6
title: Post-processing
duration: 40
prerequisites:
  - "14.5 — Scroll-driven 3D scenes"
learning_objectives:
  - Set up EffectComposer from @threlte/extras
  - Apply bloom effects to make emissive objects glow
  - Add vignette for cinematic framing
  - Use chromatic aberration for stylistic lens effects
  - Toggle effects reactively based on user interaction
status: ready
---

# Lesson 14.6 — Post-processing

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build.

## 1. Concept — post-processing turns renders into cinema

### 1.1 What the problem is

A raw 3D render — even with good lighting and materials — looks flat and "CG." Professional 3D content (games, films, product renders) goes through **post-processing**: image effects applied to the entire rendered frame before it reaches the screen. Bloom makes bright objects glow. Vignette darkens edges for focus. Depth of field blurs distant objects. These effects transform a technically correct render into something that feels cinematic and polished.

Without post-processing, your 3D product showcase looks like a student project. With it, it looks like an Apple product page.

### 1.2 How post-processing works (the pipeline)

Post-processing works as a pipeline:

1. The scene renders to a texture (not directly to screen).
2. That texture passes through a series of "effects" — each reads the previous texture, applies a modification, and outputs a new texture.
3. The final texture is drawn to the screen.

Each effect is a shader program (runs on the GPU). Effects are cheap individually but stack — 5 effects means 5 extra full-screen passes. Performance monitoring matters.

### 1.3 Threlte's EffectComposer

`@threlte/extras` provides an `EffectComposer` component that wraps the Three.js post-processing pipeline in Threlte's declarative API. You nest effect components inside it:

```svelte
<EffectComposer>
    <Bloom intensity={1.5} luminanceThreshold={0.8} />
    <Vignette darkness={0.5} offset={0.3} />
</EffectComposer>
```

The EffectComposer replaces the default render pass — once active, all rendering goes through the pipeline.

### 1.4 Bloom

Bloom simulates how bright lights "bleed" into surrounding areas — the glow around a lightbulb or the flare around a chrome edge. It works by:

1. Extracting pixels brighter than a threshold (`luminanceThreshold`).
2. Blurring those bright pixels.
3. Adding the blurred bright pixels back onto the original image.

To make a mesh bloom, set its material's `emissive` color and `emissiveIntensity`. Only meshes that emit light (exceed the threshold) will glow. This gives you selective bloom — not everything glows, just the objects you choose.

### 1.5 Vignette

Vignette darkens the corners and edges of the frame, drawing the viewer's eye to the center. It is purely aesthetic — no 3D objects are involved. Parameters:

- `offset` — how far from center the darkening starts (0 = center, 1 = edges only).
- `darkness` — how dark the effect is (0 = none, 1 = black corners).

A subtle vignette (darkness 0.3, offset 0.4) adds depth without being noticeable.

### 1.6 Chromatic aberration

Chromatic aberration simulates a lens defect where colors separate at the edges — you see slight red/blue fringing. In games and web design, it adds a "photographed through a real lens" quality. Use sparingly — heavy chromatic aberration looks like a bug, not a feature.

### 1.7 Reactive effects

Post-processing parameters are reactive in Threlte. You can bind them to `$state` values that change based on interaction:

- Increase bloom intensity when hovering an interactive hotspot.
- Add chromatic aberration during a scroll-driven "speed" section.
- Fade vignette in/out based on a scroll position.

This reactive binding makes post-processing part of the interaction design, not just a static filter.

### 1.8 The performance cost breakdown

Post-processing is a GPU-bound operation. Each effect reads the entire framebuffer (every pixel), processes it, and writes a new framebuffer. On a 1920x1080 canvas at DPR 2, that is 4,147,200 pixels per pass. Three effects means reading and writing 12.4 million pixels per frame on top of the base render.

The cost varies by effect type:
- **Vignette** — extremely cheap. One multiplication per pixel. Negligible.
- **Bloom** — expensive. Requires downsampling, multiple blur passes (typically 5-6 at different radii), and a composite. The blur radius directly affects cost.
- **Chromatic aberration** — moderate. Three texture samples per pixel instead of one.
- **Depth of field** — very expensive. Requires the depth buffer, distance calculations, and variable-radius blur. Can halve frame rate on mobile.
- **SSAO (ambient occlusion)** — expensive. Samples surrounding depth values to estimate shadows in crevices.

For production: start with no effects, add one at a time, and test on your lowest-target device. If frame time exceeds 16ms (drops below 60fps), remove effects or reduce their quality parameters.

### 1.9 Half-resolution rendering for effects

A common optimization: render the bloom pass at half resolution. Since bloom is a blurry effect anyway, the quality difference is imperceptible, but the GPU processes only 25% as many pixels. Threlte's EffectComposer supports this via configuration options:

```svelte
<Bloom intensity={1.5} mipmapBlur luminanceThreshold={0.8} />
```

The `mipmapBlur` option uses the GPU's built-in mipmap chain for the blur operation instead of separate full-resolution passes. This is significantly faster on modern GPUs and produces smoother results.

### 1.10 When NOT to use post-processing

Post-processing is tempting — it makes everything look "cinematic" with minimal effort. But it is wrong for:

- **Text-heavy interfaces** — chromatic aberration and bloom make text harder to read. Never apply effects over UI elements.
- **Performance-constrained mobile experiences** — if your scene already uses most of the GPU budget for geometry and materials, effects will push you below 30fps. Serve a poster image instead.
- **Accessibility contexts** — heavy vignette reduces the visible area, making peripheral content harder to see. Strong chromatic aberration can trigger visual discomfort in some users.

The professional approach: make effects conditional. Enable them on desktop with powerful GPUs. Disable or reduce them on mobile. Always provide a toggle or respect `prefers-reduced-motion` for animated effects.

### 1.11 Custom effects via shaders

Beyond the built-in effects, you can write custom post-processing shaders. A shader receives the rendered frame as a texture and outputs a modified version. This is advanced territory (GLSL programming), but Threlte makes it accessible by letting you pass custom `Effect` classes to the composer.

Common custom effects in production:
- Color grading (LUT lookup) for brand-consistent color treatment
- Film grain for analog aesthetic
- Custom blur patterns for focus effects
- Pixelation for retro transitions

Each custom effect is a single GLSL fragment shader that reads `texture2D(inputBuffer, uv)` and writes the modified color. If you know CSS filters, GLSL effects are conceptually similar — just running on the GPU at pixel level.

## Deep Dive

**Why this matters at scale.** Post-processing is the layer that transforms "technically correct rendering" into "visually compelling content." Every AAA game, every high-end product render, every cinematic trailer uses post-processing. On the web, it is the differentiator between a Threlte scene that looks like a tech demo and one that looks like a professional product page. Teams that understand the performance trade-offs deploy effects strategically — bloom on the hero section, nothing on the rest — rather than blanket-applying them and wondering why mobile users bounce.

**The mental model.** Think of post-processing as Instagram filters for your 3D render. The scene is "photographed" into a texture (like taking a picture), then the filters are applied to that picture before showing it to the user. Each filter reads every pixel of the previous result and outputs a new result. Chaining three filters means three passes over every pixel. The photo is never "modified in place" — it is read, processed, and written fresh each time.

**Edge cases.** Bloom with very low `luminanceThreshold` makes the entire scene glow, not just bright objects — everything exceeds the threshold. Transparent objects (glass, particles) interact poorly with some effects — depth-based effects like DOF cannot determine the correct depth for semi-transparent surfaces. Effects that sample neighboring pixels (blur, SSAO) produce artifacts at screen edges because there are no neighbors to sample outside the frame — implementations typically clamp or mirror edge pixels.

**Performance.** On a Retina MacBook (DPR 2, 2560x1600), one post-processing pass processes 8.2 million pixels. At 60fps, that is 492 million pixel operations per second per effect. Mobile GPUs (which share memory bandwidth with the CPU) typically hit their fill-rate ceiling with two to three effects at native DPR. The fix is DPR clamping (Module 14.8) combined with selective effect enabling based on device capability detection (`navigator.gpu` for WebGPU, or frame rate monitoring after enabling effects).

**Cross-module connections.** Post-processing connects to Module 12 (performance — frame budget management, DPR clamping), Module 14.4 (interactivity — hover-triggered bloom changes), Module 14.5 (scroll-driven — scroll-modulated effect intensity), and Module 7 (GSAP — tweening effect parameters for dramatic reveals). The reactive binding pattern is pure Module 2 — `$state` variables driving visual output.

## 2. Style it — PE7 applied to this lesson's mini-build

The mini-build is a product scene with a toggle panel for effects:

- Toggle switches use PE7 form tokens: `var(--radius-full)` for pill shape, `var(--color-brand)` for the active state.
- The effect parameter sliders use `accent-color: var(--color-brand)` on native `<input type="range">`.
- A "before/after" split-view shows the scene with and without effects, using a CSS `clip-path` driven by a slider.

## 3. Interact — toggling effects reactively

The TypeScript concept: **conditional rendering of effect components**. In Threlte, you can conditionally include effects with `{#if}`:

```svelte
<EffectComposer>
    {#if bloomEnabled}
        <Bloom intensity={bloomIntensity} />
    {/if}
</EffectComposer>
```

When `bloomEnabled` toggles to false, the Bloom component unmounts and the effect is removed from the pipeline. No manual disposal needed.

The mistake: trying to set `intensity={0}` instead of removing the effect. A bloom with intensity 0 still runs the shader pass (performance cost) — it just produces no visible result. Unmounting is cleaner.

## 4. Mini-build — cinematic product scene with toggleable effects

**File:** `src/routes/modules/14-threlte/06-post-processing/+page.svelte`

See the accompanying route file for the full working component.

**DevTools moment:** Open the Performance tab and toggle effects on/off while recording. Notice the frame time difference — each effect adds a full-screen shader pass. With all effects on, frame time may increase by 1-3ms. On mobile GPUs, this matters.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why does post-processing render to a texture first instead of directly to the screen?</summary>

Effects need to read the entire rendered image as input. By rendering to a texture (called a render target), each effect can sample any pixel from the previous pass. Direct-to-screen rendering would not allow reading back pixels for processing.
</details>

<details>
<summary><strong>Q2.</strong> How do you make only specific objects bloom while others don't?</summary>

Bloom uses a luminance threshold — only pixels brighter than the threshold glow. Set `emissive` and `emissiveIntensity` on the materials of objects you want to bloom. Objects without emissive values stay below the threshold and do not glow.
</details>

<details>
<summary><strong>Q3.</strong> What is the performance cost of adding 3 post-processing effects?</summary>

Each effect adds one full-screen shader pass per frame. Three effects mean three additional passes where the GPU reads and writes a full-resolution texture. On high-DPI screens, this can significantly increase frame time. Monitor with DevTools and reduce effect count or resolution on mobile.
</details>

<details>
<summary><strong>Q4.</strong> Why is unmounting a <Bloom> component better than setting its intensity to 0?</summary>

Setting intensity to 0 keeps the shader pass running — the GPU still processes every pixel, just producing no visible result. Unmounting removes the pass entirely from the pipeline, saving the GPU work. For effects that are rarely active, conditional rendering is more performant.
</details>

<details>
<summary><strong>Q5.</strong> How would you animate bloom intensity on hover using Threlte and GSAP?</summary>

Store bloom intensity in a `$state` variable. On `onpointerenter`, use `gsap.to()` to tween the state variable from 0 to the desired intensity. On `onpointerleave`, tween it back to 0. Pass the reactive variable as the `intensity` prop to `<Bloom>`. Threlte reactively updates the effect parameter each frame.
</details>

## 6. Common mistakes — 3 pitfalls

1. **Adding EffectComposer without any effects inside.** An empty composer still overrides the default render pass but does nothing — you get the same result with extra overhead. Only add the composer when you have at least one effect to apply.

2. **Using very high bloom intensity on mobile.** Mobile GPUs have limited fill rate. High-radius bloom (which requires large blur kernels) can tank frame rate below 30fps. Use lower intensity and smaller blur radius on mobile, or disable bloom entirely.

3. **Forgetting `emissive` on materials.** Adding Bloom to the scene but forgetting to set `emissive` on target materials means nothing exceeds the luminance threshold. Everything stays below the threshold and no glow appears. Set `emissive` to a bright color and `emissiveIntensity` > 1 for visible bloom.

## 7. What's next — one sentence

Next lesson: you'll add physics — rigid bodies, colliders, and gravity — to make your 3D objects behave like real physical objects.
