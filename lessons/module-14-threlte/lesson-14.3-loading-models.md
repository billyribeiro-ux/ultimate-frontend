---
module: 14
lesson: 14.3
title: Loading 3D models
duration: 40
prerequisites:
  - "14.2 — Scene fundamentals"
  - "4.8 — {#await} for async handling"
learning_objectives:
  - Load GLTF/GLB models using useGltf from @threlte/extras
  - Display loading states while models download
  - Handle load errors gracefully with error boundaries
  - Position, scale, and rotate loaded models in the scene
  - Understand the GLTF format and why it is the standard
status: ready
---

# Lesson 14.3 — Loading 3D models

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build.

## 1. Concept — real 3D comes from models, not primitives

### 1.1 What the problem is

Primitive geometries (boxes, spheres, tori) are useful for prototyping but no production 3D experience uses them as the final product. Real 3D content — characters, products, architectural models, vehicles — is created in tools like Blender, Maya, or ZBrush and exported as files. Your web application needs to load these files at runtime, parse them into Three.js objects, and render them in the scene.

The challenge: model files can be large (1–50 MB), they load asynchronously over the network, they can fail to load (network error, corrupt file, unsupported features), and they contain complex hierarchies of meshes, materials, and animations that need to be integrated into your Threlte scene graph.

### 1.2 The GLTF format

GLTF (GL Transmission Format) is the standard for 3D on the web. Think of it as the "JPEG of 3D." It comes in two flavors:

- **`.gltf`** — a JSON file that references external binary buffers and textures. Good for inspection but requires multiple HTTP requests.
- **`.glb`** — a single binary file containing everything. Smaller, faster to load, preferred for production.

GLTF supports meshes, materials (PBR), textures, skeletal animations, morph targets, and scene hierarchies. Three.js has a built-in `GLTFLoader` — Threlte wraps it in the `useGltf` hook from `@threlte/extras`.

### 1.3 How useGltf works

`useGltf` is an async utility that returns a promise-like reactive object. You call it with the URL of the model file, and it returns a reactive value that resolves to the loaded GLTF scene:

```
const gltf = useGltf('/models/product.glb');
```

The returned value has a `scene` property containing the root `THREE.Group` with all meshes, and a `nodes` object with named meshes accessible by their Blender-assigned names.

### 1.4 Loading states and error handling

Models take time to download. During loading, you should show a fallback — a spinner, a skeleton placeholder, or a simple primitive geometry. After loading, swap in the real model.

If loading fails (404, network timeout, corrupt GLB), you need error handling. In Threlte, you can use Svelte's `{#await}` pattern or combine `useGltf` with a `<svelte:boundary>` for graceful degradation.

### 1.5 Positioning loaded models

Models from Blender may not be centered at the origin or scaled for your scene. Common adjustments:

- **Position:** `position={[0, -1, 0]}` to move the model down so it sits on a "ground plane."
- **Scale:** `scale={0.5}` to uniformly shrink, or `scale={[1, 1.2, 1]}` for non-uniform.
- **Rotation:** `rotation.y={Math.PI}` to rotate 180 degrees if the model faces the wrong way.

These props go on the `<T>` component wrapping the GLTF scene.

### 1.6 Performance considerations

Large models impact load time and frame rate. Best practices:

- Compress GLB files with `gltf-transform` or Draco compression.
- Keep polygon counts reasonable for web (under 100K triangles for hero models).
- Use LOD (level of detail) for models seen at varying distances.
- Dispose the GLTF when the component unmounts — Threlte handles this automatically.

### 1.7 The GLTF scene hierarchy

A GLTF file is not just a single mesh — it is a tree. A character model might contain hundreds of meshes (body, eyes, clothing, accessories), each with its own material and potentially its own animations. When `useGltf` loads the file, it gives you access to:

- **`scene`** — the root `THREE.Group` containing everything. Drop this directly into your Threlte scene to render the entire model.
- **`nodes`** — a flat object keyed by the names assigned in Blender. If you named a mesh "LeftHand" in Blender, `gltf.nodes.LeftHand` gives you direct access to that mesh.
- **`materials`** — all materials used in the model, keyed by name. You can swap or modify them at runtime.
- **`animations`** — an array of `AnimationClip` objects if the model includes skeletal or morph animations.

Understanding this hierarchy is essential for interactive models. A product configurator, for example, needs to change the material on just the "Shell" mesh while keeping everything else unchanged. You access `gltf.nodes.Shell.material` and swap it.

### 1.8 Draco compression in detail

Draco is a compression algorithm developed by Google that reduces geometry data (vertices, normals, UVs, indices) to a fraction of their original size. A 5MB GLB can become 500KB after Draco compression.

The trade-off: the browser must decompress the data before rendering, which takes 50-200ms depending on model complexity and device speed. This decompression runs on the main thread by default, though a Web Worker-based decoder exists.

In Threlte, Draco-compressed models require you to configure the `DRACOLoader` path when using `useGltf`:

```typescript
import { useDraco } from '@threlte/extras';
useDraco(); // configures the Draco decoder path
```

For production, always Draco-compress models intended for the web. The network savings far outweigh the decompression cost, especially on mobile networks where bandwidth is the bottleneck.

### 1.9 Texture optimization

Models often include large textures (albedo, normal map, roughness map, metalness map). A single 4K texture is 16MB uncompressed in GPU memory. Best practices:

- Use power-of-two texture sizes (512, 1024, 2048) for GPU compatibility.
- Compress textures with KTX2/Basis Universal format — these decompress on the GPU, saving both network transfer and CPU time.
- For web, 1024x1024 is usually sufficient for most product models. Reserve 2048x2048 for hero objects viewed up close.
- Consider that each texture channel (R, G, B, A) occupies GPU memory. Combine metalness and roughness into a single texture using different channels (a common GLTF convention).

### 1.10 Error boundaries for model loading

Network requests fail. CDNs go down. URLs get typos. Your model loading must handle failure gracefully:

```svelte
<svelte:boundary>
    <ModelViewer url="/models/product.glb" />
    {#snippet failed(error)}
        <FallbackImage src="/images/product-poster.webp" alt="Product" />
    {/snippet}
</svelte:boundary>
```

This pattern uses Svelte 5's error boundaries to catch any error thrown during model loading and render a fallback. The fallback should be a static image that communicates the same information the 3D model would have — a pre-rendered product shot at the most informative angle.

## Deep Dive

**Why this matters at scale.** In a production e-commerce site, model loading is a critical path operation. Users waiting for a 3D product viewer will abandon the page if loading takes more than 3 seconds on mobile. Every optimization — Draco compression, texture compression, progressive loading, placeholder strategies — directly impacts conversion rates. A team that ships unoptimized 20MB GLB files will see their 3D feature disabled by performance-conscious engineering leads within weeks.

**The mental model.** Think of a GLTF file as a zipped project folder. Inside is a scene graph (like a component tree), materials (like CSS), textures (like images), and animations (like keyframe definitions). The browser downloads this folder, unpacks it, uploads textures to the GPU, builds the scene graph in memory, and then renders it. Each step takes time and resources. Your job is to minimize what gets downloaded and maximize what gets cached.

**Edge cases.** Models exported from Blender with "Apply Modifiers" disabled retain their modifier stack, which Three.js ignores — the model appears as its base mesh without subdivision, booleans, or array modifiers applied. Models with negative scale (mirrored in Blender) can produce inverted normals in Three.js, making surfaces appear inside-out. Models with multiple UV maps may not render textures correctly if the GLTF exporter did not map them to the right channels. Always test exports in a web viewer (like the official gltf-viewer) before integrating into your app.

**Performance.** Model loading blocks the main thread during the parsing phase. For models over 5MB, consider using a Web Worker for parsing (Three.js supports this via `GLTFLoader.setWorkerLoader`). GPU memory is finite and varies dramatically by device — a desktop with 8GB VRAM can hold dozens of 4K textures; a mobile device with shared memory may crash after three. Monitor GPU memory usage in Chrome's `chrome://gpu` page during development.

**Cross-module connections.** Model loading connects to Module 12 (performance — lazy loading with IntersectionObserver, code splitting), Module 9a (async data loading patterns — the same suspense/loading-state concepts apply), and Module 4 (`{#await}` blocks for managing async states in templates). The error boundary pattern connects to Module 4's error handling concepts.

## 2. Style it — PE7 applied to this lesson's mini-build

The loading state uses PE7 tokens for a branded experience:

- A pulsing skeleton placeholder using `animation` with `var(--dur-slow)` and `var(--ease-out)`.
- The loading indicator uses `var(--color-brand)` for the spinner accent.
- Error states use a muted red from the PE7 semantic palette.
- The model viewer container maintains `aspect-ratio: 1 / 1` (square) for product shots, shifting to `16 / 9` on wider viewports.

## 3. Interact — async model loading with reactive state

The TypeScript concept: **`useGltf` returns a reactive async value**. You can track loading state with a `$derived` expression:

```typescript
const gltf = useGltf('/models/product.glb');
const isLoaded = $derived(gltf.scene !== undefined);
```

The mistake: trying to access `gltf.scene` before it loads and getting `undefined` errors. Always guard with a conditional check or use `{#await}`.

## 4. Mini-build — GLTF model viewer with loading state

**File:** `src/routes/modules/14-threlte/03-loading-models/+page.svelte`

See the accompanying route file for the full working component.

**DevTools moment:** Open the Network tab and watch the `.glb` file download. Note its size and load time. In the Performance tab, observe any frame drops during model parsing. The model parse happens on the main thread — for very large models, consider using a Web Worker (advanced topic).

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> What is the difference between .gltf and .glb files?</summary>

`.gltf` is a JSON file that references external binary buffers and texture images via URLs — it requires multiple HTTP requests. `.glb` is a single binary file that packs everything together — one request, smaller total size due to binary encoding, preferred for production web use.
</details>

<details>
<summary><strong>Q2.</strong> Why must you guard against undefined when accessing the GLTF scene?</summary>

`useGltf` loads asynchronously. The reactive value starts as undefined and resolves to the loaded scene only after the network request completes. Accessing `.scene` before load completes would throw a runtime error or render nothing.
</details>

<details>
<summary><strong>Q3.</strong> A model from Blender appears 100x too large in your Threlte scene. How do you fix it?</summary>

Apply a `scale` prop to the component rendering the model: `scale={0.01}` shrinks it to 1% of its original size. Alternatively, fix the scale in Blender before export (apply scale transforms).
</details>

<details>
<summary><strong>Q4.</strong> What happens to GPU memory when a component rendering a GLTF model unmounts?</summary>

Threlte automatically calls `.dispose()` on the model's geometries, materials, and textures, freeing GPU memory. This prevents memory leaks when navigating between pages or conditionally showing/hiding 3D content.
</details>

<details>
<summary><strong>Q5.</strong> Why is Draco compression recommended for production GLB files?</summary>

Draco compresses geometry data (vertex positions, normals, UVs) significantly — often 70-90% smaller file sizes. This reduces download time and bandwidth. The trade-off is a small decompression cost on the client, but the network savings far outweigh it for web delivery.
</details>

## 6. Common mistakes — 3 pitfalls

1. **Placing the GLB in `src/` instead of `static/`.** Files in `src/` are processed by Vite's bundler. Large binary GLB files should go in the `static/` directory so they are served as-is without bundling overhead. Reference them with absolute paths: `/models/product.glb`.

2. **Not handling the loading state.** Rendering an empty scene while the model downloads shows a blank canvas. Always show a placeholder (spinning primitive, skeleton, or progress indicator) during the load phase.

3. **Forgetting to apply transforms from Blender.** If a model was scaled or rotated in Blender but transforms were not "applied" (Ctrl+A in Blender), the model may appear with incorrect orientation or size in Threlte. Always apply transforms before export.

## 7. What's next — one sentence

Next lesson: you'll make your 3D models interactive — responding to clicks, hovers, and pointer events.
