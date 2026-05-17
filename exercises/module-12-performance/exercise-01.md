---
module: 12
exercise: 1
title: Lighthouse Audit and Fix
difficulty: beginner
estimated_time: 10
skills_tested:
  - Lighthouse performance metrics
  - LCP optimization
  - CLS prevention
  - FID reduction
---

# Exercise 12.1 — Lighthouse Audit and Fix

## Brief

Given a deliberately unoptimized page, identify and fix the five most common performance issues that Lighthouse flags. Document each issue and its fix to demonstrate understanding of Core Web Vitals.

## Requirements

1. Create `src/routes/audit/+page.svelte` with five intentional performance anti-patterns
2. Anti-pattern 1: An `<img>` without `width`/`height` attributes (causes CLS)
3. Anti-pattern 2: A render-blocking inline `<script>` that runs a synchronous loop
4. Anti-pattern 3: An oversized image source (2000px wide displayed at 400px)
5. Anti-pattern 4: Missing `alt` text on images (accessibility score impact)
6. Anti-pattern 5: Text with insufficient color contrast (accessibility score impact)
7. Create `src/routes/audit-fixed/+page.svelte` that fixes all five issues
8. Add comments in the fixed version explaining each fix and which metric it improves

## Constraints

- No external tools — document what Lighthouse would flag based on your knowledge
- The "fixed" page must be functionally identical to the "broken" page
- All fixes must reference the specific Core Web Vital they improve (LCP, CLS, FID, or INP)
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

CLS (Cumulative Layout Shift) is caused by images without explicit dimensions, dynamically injected content, and web fonts without `font-display`. LCP (Largest Contentful Paint) is affected by image optimization and render-blocking resources. FID/INP is affected by long-running JavaScript on the main thread.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Fix CLS by adding `width` and `height` attributes to images. Fix LCP by using appropriate image sizes and adding `loading="lazy"` to below-fold images. Fix FID by removing synchronous scripts or moving them to `onMount`. Fix accessibility by adding `alt` text and ensuring contrast ratios meet WCAG AA (4.5:1 for normal text).
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<!-- BROKEN -->
<img src="/hero.jpg" />

<!-- FIXED: explicit dimensions prevent CLS, fetchpriority for LCP -->
<img src="/hero.jpg" width="800" height="450" alt="Hero banner showing product" fetchpriority="high" />
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```svelte
<!-- src/routes/audit-fixed/+page.svelte -->
<script lang="ts">
  // FIX 3 (FID/INP): Heavy computation moved to onMount with requestIdleCallback
  import { onMount } from 'svelte';

  let computed = $state('');

  onMount(() => {
    requestIdleCallback(() => {
      // Simulate computation without blocking the main thread
      computed = 'Data processed';
    });
  });
</script>

<div class="page">
  <!-- FIX 1 (CLS): Added width, height, and fetchpriority to hero image -->
  <img
    src="https://picsum.photos/800/450"
    width="800"
    height="450"
    alt="Scenic landscape used as hero banner"
    fetchpriority="high"
    class="hero-img"
  />

  <h1>Performance Audit — Fixed</h1>

  <!-- FIX 4 (Accessibility): Decorative image has empty alt, informative images have descriptive alt -->
  <div class="gallery">
    <img
      src="https://picsum.photos/400/300?random=1"
      width="400"
      height="300"
      alt="Product showcase demonstrating the dashboard interface"
      loading="lazy"
      class="gallery-img"
    />
    <img
      src="https://picsum.photos/400/300?random=2"
      width="400"
      height="300"
      alt="Team collaboration feature with real-time editing"
      loading="lazy"
      class="gallery-img"
    />
  </div>

  <!-- FIX 5 (Accessibility): Contrast ratio now meets WCAG AA (4.5:1) -->
  <p class="description">
    This page demonstrates fixes for the five most common Lighthouse issues.
    Each fix targets a specific Core Web Vital metric.
  </p>

  {#if computed}
    <p class="computed">{computed}</p>
  {/if}
</div>

<style>
  .page {
    max-inline-size: 48rem;
    margin-inline: auto;
    padding: var(--space-lg);
  }

  /* FIX 1 (CLS): aspect-ratio matches width/height, prevents layout shift */
  .hero-img {
    inline-size: 100%;
    block-size: auto;
    aspect-ratio: 800 / 450;
    border-radius: var(--radius-md);
    margin-block-end: var(--space-lg);
    object-fit: cover;
  }

  h1 {
    font-size: var(--text-2xl);
    color: var(--color-text);
    margin-block-end: var(--space-md);
  }

  .gallery {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
    margin-block-end: var(--space-lg);
  }

  /* FIX 2 (LCP): Images are properly sized, not oversized */
  .gallery-img {
    inline-size: 100%;
    block-size: auto;
    aspect-ratio: 400 / 300;
    border-radius: var(--radius-sm);
    object-fit: cover;
  }

  /* FIX 5: Color contrast is now 7:1+ (oklch lightness 35% on white) */
  .description {
    font-size: var(--text-base);
    color: oklch(35% 0.02 250);
    line-height: 1.6;
  }

  .computed {
    font-size: var(--text-sm);
    color: oklch(45% 0.15 145);
    font-weight: 600;
    margin-block-start: var(--space-md);
  }
</style>
```

### Explanation

Each fix targets a specific metric. **CLS**: adding `width` and `height` attributes lets the browser reserve space before the image loads, preventing layout shift. **LCP**: using `fetchpriority="high"` on the hero image and `loading="lazy"` on below-fold images ensures the largest element paints fast. **FID/INP**: moving heavy computation to `requestIdleCallback` inside `onMount` prevents main-thread blocking during page load. **Accessibility**: descriptive `alt` text and sufficient color contrast (WCAG AA 4.5:1) affect Lighthouse's accessibility score, which is part of the overall page quality. These five fixes typically move a Lighthouse score from 60-70 to 90+.
</details>
