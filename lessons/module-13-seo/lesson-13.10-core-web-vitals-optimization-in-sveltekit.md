---
module: 13
lesson: 13.10
title: Core Web Vitals optimization in SvelteKit
duration: 55 minutes
prerequisites:
  - Module 12 — Core Web Vitals introduction
  - Lesson 13.1 — Why SvelteKit is an SEO advantage
learning_objectives:
  - State the 2026 pass thresholds for LCP, CLS, and INP
  - Preload the LCP hero image with rel=preload
  - Prevent CLS with explicit width/height on every image and video
  - Minimise INP by avoiding main-thread work during hydration
  - Use data-sveltekit-preload-data for sub-100ms navigation
status: ready
---

# Lesson 13.10 — Core Web Vitals optimization in SvelteKit

## 1. Concept — the three numbers Google judges you on

### 1.1 LCP, CLS, INP — the 2026 thresholds

Core Web Vitals are three measurements. A page **passes** if the 75th percentile of real-user measurements is within these thresholds on both mobile and desktop:

| Metric | Pass    | Needs work | Poor    |
| ------ | ------- | ---------- | ------- |
| LCP    | ≤ 2.5 s | ≤ 4.0 s    | > 4.0 s |
| CLS    | ≤ 0.1   | ≤ 0.25     | > 0.25  |
| INP    | ≤ 200 ms| ≤ 500 ms   | > 500 ms|

INP replaced FID in March 2024 and has been weighted more heavily since the April 2026 core update. Mobile INP is the hardest of the three to keep green.

### 1.2 LCP — paint the hero fast

LCP measures the time from navigation to the largest above-the-fold element being painted. On most pages that element is a hero image, a hero video poster, or a big headline. The three levers are:

1. **Prerender or SSR** — both put HTML in the first byte (Lesson 13.11).
2. **Preload the hero image** — add `<link rel="preload" as="image" href="…">` inside `<svelte:head>` so the browser starts the fetch while parsing the HTML, not after CSS loads.
3. **Use `fetchpriority="high"`** on the hero `<img>` so it beats other images in the queue.

In SvelteKit, a common LCP win is to add the hero preload to the root layout as a function of `page.data.heroImage`.

### 1.3 CLS — explicit dimensions on everything

CLS measures how much content jumps as the page loads. The single most common cause: an `<img>` without `width` and `height`, which takes zero pixels until it loads and then shoves the layout down. The fix is trivial — set both attributes on every `<img>` and every `<video>`, every time.

```html
<img src="/hero.webp" width="1200" height="630" alt="..." />
```

PE7 already ships this pattern in its image helpers. The reset in `app.css` sets `block-size: auto` so the browser computes the real height from the aspect ratio.

### 1.4 INP — the hydration trap

INP measures the time from the user's first tap to the next paint. During hydration — the window after SSR HTML arrives but before JS has finished running — every tap is queued behind hydration work. Heavy components, large bundles, and synchronous code in component scripts all hurt INP.

SvelteKit-specific tactics:

- **Avoid big components in the critical path.** Move charts, tables, and 3D canvases below the fold.
- **Use `data-sveltekit-preload-data="hover"`** on `<a>` tags to prefetch data before click. Actual navigation then completes in under 100ms.
- **Do not call heavy library code in a component's top-level `<script>`.** Imports are loaded at hydration time — a 200KB date library at the top of a component delays every interaction.
- **Prefer compile-time work to runtime work.** Svelte's compiler is your friend.

### 1.5 Measuring

Three measurement surfaces matter:

1. **Lighthouse** — lab-based, runs in DevTools. Good for catching regressions locally.
2. **PageSpeed Insights** — runs Lighthouse plus Chrome UX Report (CrUX) field data. The field data is what Google uses for rankings.
3. **Web Vitals JS library** — ship it in production to collect INP from real users and send to your analytics. This is the only way to see INP regressions before they hurt your ranking.

## Deep Dive

**Why this matters at scale.** LCP, CLS, and INP are Google's ranking signal metrics. They are the measurable target for all performance work.

**The mental model.** LCP: image optimization and SSR. CLS: explicit dimensions and font loading. INP: minimal main-thread blocking and efficient event handlers.

**Edge cases.** Mobile metrics differ from desktop. Google uses mobile-first indexing. Test on throttled mobile connections and mid-range devices.

**Performance implications.** Each CWV improvement is cumulative. Fixing LCP from 4s to 2s can improve rankings measurably. Fix the worst metric first for maximum impact.

**Connection to other modules.** Module 12's performance techniques impact these metrics. Module 6's CSS prevents CLS.

## 2. Style it — the hero that never shifts

The mini-build renders a hero image with explicit dimensions, preload link, and fetchpriority. All existing PE7 tokens. The fluid typography scales the headline without triggering layout shift because line-height and font-size are both set in the same rule.

## 3. Interact — seeing hydration on the timeline

Problem: you cannot see INP directly in DevTools. You see its root cause — blocking tasks during hydration — in the Performance panel. The lesson walks you through recording a load, finding the long tasks, and pointing to the one caused by a heavy top-level import in a component.

## 4. Mini-build — a CWV-green hero page

**File:** `src/routes/modules/13-seo/10-core-web-vitals/+page.svelte`

```svelte
<script lang="ts">
    import SEO from '$lib/components/SEO.svelte';

    const heroImage: string = '/og/lesson-13-10.png';
    const heroWidth: number = 1200;
    const heroHeight: number = 630;
</script>

<SEO
    title="Core Web Vitals in SvelteKit · Lesson 13.10"
    description="LCP under 2.5 s, CLS under 0.1, INP under 200 ms — the SvelteKit-specific levers that get every page into the green zone."
/>

<svelte:head>
    <link rel="preload" as="image" href={heroImage} fetchpriority="high" />
</svelte:head>

<section class="page stack">
    <p class="eyebrow">Lesson 13.10 · Mini-build</p>
    <h1>Hero with zero layout shift</h1>
    <figure class="hero">
        <img
            src={heroImage}
            width={heroWidth}
            height={heroHeight}
            alt="Lesson 13.10 hero illustration"
            fetchpriority="high"
        />
    </figure>
    <p>
        Open DevTools → Lighthouse → Run. LCP, CLS, and INP should all be green.
    </p>
    <nav>
        <a data-sveltekit-preload-data="hover" href="/modules/13-seo">Back to Module 13</a>
    </nav>
</section>

<style>
    section { --color-brand: oklch(68% 0.2 100); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
    .hero {
        margin: 0;
        aspect-ratio: 1200 / 630;
        background: var(--color-surface-2);
        border-radius: var(--radius-lg);
        overflow: hidden;
    }
    .hero img {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
    }
</style>
```

### DevTools moment

Run a Lighthouse mobile audit. LCP, CLS, and INP should all be green. Comment out the `<link rel="preload">` and rerun — LCP regresses by 200–400 ms. That is the preload's contribution in numbers.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What are the 2026 pass thresholds for LCP, CLS, and INP?</summary>

LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms — all at the 75th percentile of real users.
</details>

<details>
<summary><strong>Q2.</strong> Why does setting width and height on an image fix CLS?</summary>

The browser reserves the correct amount of space before the image loads, so nothing shifts when the pixels arrive.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>data-sveltekit-preload-data="hover"</code> do?</summary>

It tells SvelteKit to run the link's load function on hover, so the data is already cached when the click fires, making navigation near-instant.
</details>

<details>
<summary><strong>Q4.</strong> Why is INP harder than FID was?</summary>

FID measured only the first input delay. INP measures every interaction throughout the session and reports the 98th percentile. Hydration work that was hidden from FID is fully visible to INP.
</details>

<details>
<summary><strong>Q5.</strong> What is the difference between lab data and field data in PageSpeed Insights?</summary>

Lab data is a single synthetic run. Field data is aggregated from real Chrome users over the past 28 days. Rankings use field data.
</details>

## 6. Common mistakes

- **Preloading an image you do not end up using.** Wastes bandwidth and hurts LCP.
- **Skipping width/height because the image is responsive.** You still need them — the browser computes the correct aspect ratio.
- **Heavy top-level imports in common components.** Lazy-import anything that is not needed during first paint.
- **Testing only on desktop.** Mobile is the ranking target, and mobile INP is where apps die.

## 7. What's next

Lesson 13.11 turns whole routes into prerendered static HTML for the best-possible LCP.
