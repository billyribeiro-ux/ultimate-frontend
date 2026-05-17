---
module: 12
lesson: 12.2
title: Image optimization — width, height, formats, priority
duration: 50 minutes
prerequisites:
  - Lesson 12.1 — Core Web Vitals
learning_objectives:
  - Always set intrinsic width and height on every <img> to prevent CLS
  - Use loading="lazy" for below-the-fold and fetchpriority="high" for LCP
  - Serve responsive images with srcset, sizes, and the <picture> element
  - Choose AVIF, WebP, and JPEG fallbacks correctly for the content
  - Avoid the top three pitfalls that silently tank an image-heavy page
status: ready
---

# Lesson 12.2 — Image optimization

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. On most real websites, images account for 50 to 70 percent of the page weight. Optimising them is the single cheapest performance win available, and it moves both LCP and CLS at the same time.

## 1. Concept — Six attributes that together make images fast

### 1.1 The two failures to avoid

Every image problem that hurts Core Web Vitals is one of two failures. Either the image *arrives too late* (LCP failure) or the image *changes the size of the page after arriving* (CLS failure). The six attributes this lesson teaches each prevent one or both of those failures. Once you know all six, no image-heavy page you ship should ever fail an audit.

### 1.2 `width` and `height` — the CLS fix that costs nothing

Setting intrinsic dimensions on every `<img>` is the single most important thing in this lesson. Modern browsers combine `width` and `height` into an automatic `aspect-ratio` on the image element, which means the browser reserves the correct-sized box *before* the image data arrives. There is no layout shift when the image finally paints — the box was always that size.

```html
<img src="/hero.jpg" alt="A mountain at sunrise" width="1600" height="900" />
```

Two details that beginners get wrong:

- The `width` and `height` are **intrinsic** pixel values, not CSS display sizes. A 1 600 × 900 source image should declare 1600 and 900 even if you are scaling it to 800 pixels wide in CSS. The numbers describe the aspect ratio, not the final size.
- You still need CSS to make the image responsive. `img { max-inline-size: 100%; block-size: auto; }` is already in the PE7 reset so this works automatically in this course.

### 1.3 `loading="lazy"` — below the fold only

`loading="lazy"` tells the browser not to start downloading the image until it is close to entering the viewport. It is a free performance win for below-the-fold images, but it is a *disaster* for LCP images. The browser cannot know which image is the LCP candidate, so if you mark your hero `loading="lazy"`, you delay the very thing Lighthouse is measuring.

Rule: **every image below the fold gets `loading="lazy"`; the hero image gets `loading="eager"` or nothing at all.**

### 1.4 `fetchpriority="high"` — tell the browser which image matters most

The browser downloads images in a priority order it guesses from document order and CSS visibility. That guess is usually right, but on a hero-heavy landing page with many above-the-fold candidates, you can move LCP down by hundreds of milliseconds by declaring the hero explicitly:

```html
<img
	src="/hero-1600.jpg"
	alt="A mountain at sunrise"
	width="1600"
	height="900"
	fetchpriority="high"
	loading="eager"
/>
```

`fetchpriority="high"` bumps the image up the browser's internal priority queue. Use it on exactly one image per page — the LCP candidate — and nowhere else.

### 1.5 `srcset` and `sizes` — serve the right-sized image

A desktop user on a 27-inch monitor and a phone user on a 375-pixel screen should not receive the same 1 600-pixel JPEG. The phone user pays for bytes they cannot see. `srcset` lets you declare several source files at different sizes and lets the browser pick the appropriate one:

```html
<img
	src="/hero-1600.jpg"
	srcset="/hero-400.jpg 400w, /hero-800.jpg 800w, /hero-1600.jpg 1600w"
	sizes="(min-width: 768px) 60vw, 100vw"
	alt="A mountain at sunrise"
	width="1600"
	height="900"
	fetchpriority="high"
/>
```

Read the `sizes` attribute as: "on screens 768 px and up, this image will be 60 % of the viewport width; otherwise it will be 100 % of the viewport width." The browser combines that information with its device pixel ratio and picks the smallest file in `srcset` that is still at least the size it needs.

The `src` attribute is a fallback for browsers that do not understand `srcset`. In 2026 that is essentially zero users, but `src` is still required for the element to be valid.

### 1.6 `<picture>` for format fallbacks

`srcset` handles sizes. `<picture>` handles *formats*. You ship an AVIF version (smallest file, excellent quality, broad support in 2026), a WebP version (slightly larger, universal support), and a JPEG fallback (always works). The browser picks the first one it can decode.

```html
<picture>
	<source type="image/avif" srcset="/hero-800.avif 800w, /hero-1600.avif 1600w" sizes="(min-width: 768px) 60vw, 100vw" />
	<source type="image/webp" srcset="/hero-800.webp 800w, /hero-1600.webp 1600w" sizes="(min-width: 768px) 60vw, 100vw" />
	<img
		src="/hero-1600.jpg"
		srcset="/hero-800.jpg 800w, /hero-1600.jpg 1600w"
		sizes="(min-width: 768px) 60vw, 100vw"
		alt="A mountain at sunrise"
		width="1600"
		height="900"
		fetchpriority="high"
	/>
</picture>
```

AVIF versions of a typical photograph are often 30 to 50 percent smaller than the equivalent JPEG at the same visible quality. On a mobile network that saving shows up directly in LCP.

### 1.7 A decision flow

For every image on every page in this course:

1. Does it have `width` and `height`? If not, stop and add them.
2. Is it above the fold? **Yes** → `loading="eager"` and `fetchpriority="high"` if it is the LCP candidate. **No** → `loading="lazy"`.
3. Is it a photograph or complex artwork? Wrap it in `<picture>` with AVIF → WebP → JPEG.
4. Does its display size vary across breakpoints? Add `srcset` + `sizes`.

Done. Those four checks produce fast, CLS-safe, LCP-friendly images every time.

### 1.8 A note on the `@sveltejs/enhanced-img` plugin

SvelteKit ships an official plugin that automates all of this at build time. If your project uses it, you write a single `<enhanced:img src="./hero.jpg" alt="..." />` and the plugin generates every format and size for you. This lesson sticks to plain HTML because the concepts are easier to see when nothing is generated, but in a production project you should turn the plugin on and get the benefits for free. The manual knowledge is still required for any image you cannot control (for example CMS-hosted photos).

### 1.x What SvelteKit does under the hood for images

SvelteKit's `@sveltejs/enhanced-img` (or the `<enhanced:img>` tag) processes images at build time:

1. During `pnpm build`, the Vite plugin scans for `<enhanced:img>` tags.
2. For each image, it generates multiple resized versions (e.g., 400w, 800w, 1200w) in modern formats (WebP, AVIF).
3. It outputs a `<picture>` element with `<source>` tags for each format/size combination and a `<img>` fallback.
4. The `srcset` and `sizes` attributes are computed automatically so the browser picks the optimal version.
5. `width` and `height` attributes are added from the original image dimensions, preventing CLS.
6. `loading="lazy"` is added for below-the-fold images.

> **In production sidebar.** Our product catalog has 2,000 product images. Before optimization, the average product page loaded 1.8 MB of images. After switching to `@sveltejs/enhanced-img` with AVIF/WebP generation, the average dropped to 340 KB — an 81% reduction. LCP improved from 3.1s to 1.6s on mobile. The build time increased by 45 seconds (image processing is CPU-heavy), but the runtime savings are permanent.

### 1.x Common interview question

**Q: "How do you optimize images in a SvelteKit application for Core Web Vitals?"**

**Model answer:** Use `@sveltejs/enhanced-img` to generate multiple sizes and modern formats (WebP, AVIF) at build time. Always set `width` and `height` attributes to prevent CLS. Use `loading="lazy"` for below-the-fold images and `loading="eager"` for the LCP image. Use `fetchpriority="high"` on the LCP image to tell the browser to download it first. Serve images from a CDN with aggressive caching. For hero images, consider preloading with `<link rel="preload" as="image">` in the `<svelte:head>`. Each of these reduces LCP — the most impactful Core Web Vital for perceived performance.

## Deep Dive

**Why this matters at scale.** Images drive LCP. width/height prevent CLS. srcset provides resolution switching. loading=lazy defers off-screen images. This is the highest-impact performance work.

**The mental model.** Six attributes work together: src, width, height, alt, loading, fetchpriority. The hero image needs fetchpriority='high'. Below-fold images need loading='lazy'.

**Edge cases.** WebP/AVIF save 25-50% over JPEG/PNG. Not all browsers support AVIF. Use <picture> with fallbacks. Oversized images waste bandwidth — serve images at display size.

**Performance implications.** Image optimization reduces transfer size by 40-60% on typical pages. Each KB saved improves LCP linearly. fetchpriority=high can improve LCP by 200-400ms.

**Connection to other modules.** Module 13's LCP optimization builds on this. Module 6's responsive layout affects needed sizes.


## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — A hero that does not jump

The mini-build shows a hero image with both the "unoptimised" and "optimised" versions side by side, so the student can see the CLS fix live. Per-page accent: `oklch(70% 0.18 210)` (image blue).

- Both variants reserve a 16:9 box via `aspect-ratio: 16 / 9`.
- The optimised variant declares `width` and `height`; the unoptimised one omits them, and the page visibly jumps on load.
- `prefers-reduced-motion` makes no difference here — there is no animation.

## 3. Interact — Toggle "break CLS"

A button at the top lets students reload the page with the `width`/`height` attributes stripped from the image element. The page visibly shifts when the image arrives. The same button puts the attributes back. It is the cheapest possible live demo of the single most common CLS bug.

## 4. Mini-build — A CLS-safe hero image

**File:** `src/routes/modules/12-performance/02-image-optimization/+page.svelte`

Because the course repo does not ship real hero art, the mini-build uses a placeholder SVG that the student can trigger to load with and without `width`/`height`. The explanatory panel lists the six attributes and the decision flow.

### DevTools moment

Open the Performance panel, enable "Screenshots", and reload the page with CPU throttling at 4×. Watch the filmstrip. On the "unoptimised" load, the page jumps down when the image arrives. On the "optimised" load, the page is stable — the box was reserved before the pixels arrived. The single difference is `width` and `height`.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why do <code>width</code> and <code>height</code> on an <code>&lt;img&gt;</code> fix CLS?</summary>

The browser reserves the correct-sized box before the image data arrives, because it can compute the aspect ratio from the two numbers. Without them, the browser reserves zero space, and the page shifts down when the image finally paints.
</details>

<details>
<summary><strong>Q2.</strong> Why is <code>loading="lazy"</code> wrong for a hero image?</summary>

Lazy loading tells the browser to wait until the image is close to the viewport before downloading it. The hero is *already* in the viewport, and it is the LCP candidate. Delaying it by even 100 ms moves LCP the wrong direction. Use `loading="eager"` (or leave the attribute off) for the hero.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>sizes="(min-width: 768px) 60vw, 100vw"</code> tell the browser?</summary>

On screens 768 pixels wide or more, the image will be displayed at 60 % of the viewport width. On smaller screens, it will be displayed at 100 % of the viewport width. The browser combines that with the device pixel ratio to pick the smallest `srcset` entry that still covers the display size.
</details>

<details>
<summary><strong>Q4.</strong> Why wrap an image in <code>&lt;picture&gt;</code> with AVIF and WebP sources?</summary>

AVIF files are typically 30 to 50 percent smaller than JPEG at the same visible quality, and WebP is a near-universal fallback. Browsers pick the first source they can decode, so a modern browser takes AVIF while an older one takes WebP, and the JPEG inside the `<img>` is a final safety net.
</details>

<details>
<summary><strong>Q5.</strong> Should every image on the page have <code>fetchpriority="high"</code>?</summary>

No. `fetchpriority="high"` is meant for the single LCP candidate on the page. Setting it on every image reduces it to noise and gives the browser no useful signal. Use it once per page.
</details>

## 6. Common mistakes

- **Forgetting `width` and `height` because CSS sets them.** The browser still needs the intrinsic pixel values to reserve the box before the CSS applies.
- **`loading="lazy"` on the hero.** Slow LCP, every time.
- **A `srcset` without a `sizes`.** The browser falls back to `100vw` as the assumed display size and picks a bigger file than necessary.
- **JPEG everywhere.** Two copies of every image (AVIF + JPEG fallback) cut bytes by ~40 % for free.

## 7. What's next

Lesson 12.3 moves from bytes on the wire to bytes that have to parse — JavaScript code splitting and lazy loading.
