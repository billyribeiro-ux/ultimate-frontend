---
module: 13
lesson: 13.15
title: 3D & SEO — invisible canvas content and LCP fixes
duration: 60 minutes
prerequisites:
  - Lesson 7.14 — Threlte fundamentals
  - Lesson 12.12 — Threlte performance
  - Lesson 13.6 — JSON-LD
  - Lesson 13.10 — Core Web Vitals
learning_objectives:
  - Explain why WebGL canvas content is invisible to crawlers
  - Ship a text fallback inside <noscript> that describes the 3D scene
  - Use a poster image to keep LCP green when the hero is a WebGL canvas
  - Describe a 3D scene semantically in JSON-LD
  - Build a hero that scores 100 on Lighthouse SEO with a lazy-loaded Threlte canvas
status: ready
---

# Lesson 13.15 — 3D & SEO: invisible canvas content and LCP fixes

## 1. Concept — the bot cannot see pixels

### 1.1 The fundamental problem

A `<canvas>` element in the DOM is a rectangle of raw pixels drawn by JavaScript. To a crawler, the contents of that rectangle are literally invisible — there is no text, no structure, no semantic content. The fact that a Threlte scene is rendering a photorealistic spinning product model matters not at all to Google. The crawler sees `<canvas width="800" height="600"></canvas>` and moves on.

This is a serious problem for any marketing page whose hero is a 3D scene. The most visually impressive element on the page contributes zero to SEO. Worse, the canvas is usually the LCP element, and WebGL initialisation pushes LCP into the yellow or red.

### 1.2 Three solutions, stacked

There is no single fix. You combine three:

1. **A semantic fallback inside `<noscript>`** — a visible text description of the scene that crawlers, screen readers, and no-JS browsers all consume. This turns the invisible into the fully-indexable.
2. **A static poster image** rendered above the canvas during loading and as the initial LCP target. The poster is a real `<img>` with real alt text, explicit width/height, and `fetchpriority="high"`. LCP becomes the poster, not the canvas.
3. **JSON-LD that describes the scene semantically**. Using schema.org `ImageObject` or `3DModel`, you describe what the scene depicts as structured data.

The canvas is then lazy-loaded — dynamically imported only after the main thread is idle and the user has not opted out via `prefers-reduced-motion`. The critical path is poster + text. The canvas is an enhancement that never blocks indexing or LCP.

### 1.3 The `<svelte:boundary>` layer

SvelteKit 2.54+ added server-side error boundaries. Wrap the Threlte canvas in a `<svelte:boundary>` with a `failed` snippet that renders the static poster + text fallback. If WebGL is unsupported, disabled, or throws during initialisation, the boundary catches it and the user still sees something branded and readable. Crawlers always see the fallback content regardless — because boundaries run during SSR and the canvas cannot initialise on the server.

### 1.4 JSON-LD for 3D scenes

Describe the scene as an `ImageObject` for general scenes or a `3DModel` for product configurators:

```json
{
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": "Rotating PE7 torus",
    "description": "A purple torus rotating on a dark background, rendered in WebGL.",
    "contentUrl": "https://yourapp.dev/og/hero-3d-poster.png"
}
```

The `contentUrl` points to the poster image — a real 2D asset Google can fetch, crawl, and understand.

### 1.5 The "100 SEO" target

Lighthouse SEO is a 100-point deterministic audit. Score 100 by hitting every checkbox: document title, meta description, viewport, crawlable links, valid hreflang (if you use it), image alt attributes, structured data. Nothing on that list checks whether a canvas is semantic. As long as the *page* around the canvas is semantic, you get 100 — even with a WebGL hero. This lesson proves that claim by building exactly such a page.

## Deep Dive

**Why this matters at scale.** Crawlers cannot see canvas pixels. All meaningful content must exist as HTML text alongside the 3D scene.

**The mental model.** The poster-image pattern provides a static fallback. Place text descriptions in visually-hidden elements. Use alt text on the poster image.

**Edge cases.** The poster image serves as the LCP element. If the 3D scene loads first, LCP is undefined because canvas pixels are not LCP candidates.

**Performance implications.** The poster-image swap adds one image request. The 3D scene loads independently without blocking LCP.

**Connection to other modules.** Module 12.12's Threlte performance ensures 3D does not block LCP. Module 13.10's CWV addresses poster timing.

## 2. Style it — the poster fills the canvas slot until the scene loads

PE7 tokens drive the poster's rounded frame. The poster is absolutely positioned over the canvas with `opacity` transitioning to 0 once the canvas signals ready. `prefers-reduced-motion` disables the transition. A CSS-only fallback (a gradient with a shape) is used here to avoid requiring Threlte to be installed — swap in the real Threlte canvas in the capstone.

## 3. Interact — the fallback pattern

Problem: if you mount the canvas first and let the poster fade out on ready, the crawler sees the canvas and the poster fighting for LCP. The fix is to mark the poster as the primary LCP target in HTML order, set the canvas `aria-hidden="true"`, and put the semantic text fallback inside `<noscript>` directly in the markup where SSR can see it.

## 4. Mini-build — a 100-SEO hero with a 3D slot

**File:** `src/routes/modules/13-seo/15-3d-seo/+page.svelte`

```svelte
<script lang="ts">
    import SEO from '$lib/components/SEO.svelte';
    import JsonLd from '$lib/components/JsonLd.svelte';

    const title: string = '3D hero that still scores 100 SEO · Lesson 13.15';
    const description: string =
        'A WebGL hero is invisible to crawlers. Pair it with a poster image, a noscript text fallback, and JSON-LD to ship a 3D scene that indexes perfectly.';
    const posterUrl: string = '/og/hero-3d-poster.png';
    const sceneDescription: string =
        'A purple Threlte torus rotating slowly above a dark PE7-branded gradient, with soft ambient lighting.';

    const sceneSchema = {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        name: '3D hero scene',
        description: sceneDescription,
        contentUrl: `https://ultimate-frontend.dev${posterUrl}`
    };
</script>

<SEO {title} {description} ogImage={posterUrl} />
<JsonLd data={sceneSchema} />

<svelte:head>
    <link rel="preload" as="image" href={posterUrl} fetchpriority="high" />
</svelte:head>

<section class="page stack">
    <p class="eyebrow">Lesson 13.15 · Mini-build</p>
    <h1>WebGL hero, 100 SEO</h1>

    <figure class="hero">
        <img
            class="hero__poster"
            src={posterUrl}
            width="1200"
            height="630"
            alt={sceneDescription}
            fetchpriority="high"
        />
        <div class="hero__canvas-slot" aria-hidden="true">
            <!-- Threlte <Canvas> is mounted here via dynamic import in Module 12 lesson 12.12 -->
        </div>
        <noscript>
            <p class="hero__fallback">{sceneDescription}</p>
        </noscript>
    </figure>

    <p>
        The poster image above is the LCP target. The Threlte canvas slot lazy-loads after
        hydration when the main thread is idle. Crawlers and no-JS users see the poster and the
        descriptive alt text. Lighthouse SEO reports 100.
    </p>

    <ul class="signals">
        <li>Title under 60 characters: yes.</li>
        <li>Meta description 120–160 characters: yes.</li>
        <li>Hero image with alt and explicit dimensions: yes.</li>
        <li>JSON-LD ImageObject describing the scene: yes.</li>
        <li>Noscript fallback describing the scene: yes.</li>
    </ul>
</section>

<style>
    section { --color-brand: oklch(68% 0.2 290); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
    .hero {
        position: relative;
        margin: 0;
        aspect-ratio: 1200 / 630;
        border-radius: var(--radius-lg);
        overflow: hidden;
        background: var(--color-surface-2);
    }
    .hero__poster {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
    }
    .hero__canvas-slot {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }
    .hero__fallback {
        padding: var(--space-md);
        color: var(--color-text-muted);
    }
    .signals {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: var(--space-xs);
        font-size: var(--text-sm);
        color: var(--color-text-muted);
    }
    .signals li::before {
        content: '✓ ';
        color: var(--color-success);
        font-weight: 700;
    }
</style>
```

### DevTools moment

1. Run Lighthouse → SEO. Expect 100.
2. View Source: confirm `<noscript>` contains the scene description, the JSON-LD block is present, and the poster `<img>` has alt text and explicit dimensions.
3. Toggle "Disable JavaScript" and reload. The poster and the noscript fallback remain visible — the canvas slot does nothing, but the page is still fully usable and indexable.
4. In Performance panel, record a load. LCP fires on the poster, usually under 2 seconds.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is a WebGL canvas invisible to crawlers?</summary>

The canvas element is a rectangle of JavaScript-painted pixels. Crawlers only read DOM text and attributes, so they see an empty canvas and no semantic content.
</details>

<details>
<summary><strong>Q2.</strong> Why use a poster image in front of a canvas instead of hiding the canvas entirely?</summary>

The poster gives the LCP algorithm something real and immediate to paint, the crawler something semantic to index, and users a branded view during the 300–600ms it takes WebGL to initialise.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>&lt;noscript&gt;</code> contribute that <code>alt</code> on the poster does not?</summary>

`<noscript>` is a block-level fallback that can contain paragraphs, lists, and links — richer than a single alt attribute. It also renders for users who explicitly disable JavaScript, which some accessibility tools still do.
</details>

<details>
<summary><strong>Q4.</strong> Which schema.org type describes a 3D hero scene?</summary>

For a general scene, `ImageObject` with a descriptive name and contentUrl pointing to the poster. For a product configurator, `3DModel` is more specific.
</details>

<details>
<summary><strong>Q5.</strong> Why is Lighthouse SEO score 100 achievable even with a WebGL hero?</summary>

Lighthouse SEO audits the page's meta tags, structured data, alt attributes, and link crawlability — none of which depend on whether the hero is a canvas or a static image. As long as the surrounding page is semantic, the 3D element is invisible to the SEO score.
</details>

## 6. Common mistakes

- **No `alt` on the poster image.** Instant Lighthouse SEO deduction.
- **Mounting the canvas above the poster in DOM order.** LCP fires on the canvas, which is zero pixels at the moment it is measured.
- **Forgetting `aria-hidden="true"` on the canvas slot.** Screen readers announce an empty region.
- **Skipping the JSON-LD description of the scene.** The scene is now invisible to AI answer engines too.

## 7. What's next

Congratulations — you have reached the end of the teaching modules. The next step is **the capstone**: twenty chunks, three reveal levels, one production-grade SvelteKit application that ties every module together. See `lessons/capstone/README.md`.
