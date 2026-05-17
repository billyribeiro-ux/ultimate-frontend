---
module: 6
exercise: 1
title: Layer Specificity Challenge
OKLCH Palette Generator
Grid Without Breakpoints
Animation Sequence
difficulty: beginner
intermediate
advanced
expert
estimated_time: 10
20
30
45
skills_tested:
  - @layer cascade control
OKLCH color space math
CSS Grid intrinsic sizing
CSS animation choreography
  - specificity resolution
perceptual uniformity
auto-fit and minmax
Svelte transition directive
---

# Exercise 6.1 — Layer Specificity Challenge
OKLCH Palette Generator
Grid Without Breakpoints
Animation Sequence

## Brief

Create a page that demonstrates how `@layer` controls specificity regardless of selector complexity. Show a case where a high-specificity selector LOSES to a low-specificity one because of layer ordering. Prove it visually.
Build a dynamic palette generator that takes a base hue (0-360) and generates a full color scale (50-950 lightness steps) using OKLCH. The palette must be perceptually uniform — each step should look evenly spaced to the human eye.
Build a card grid layout that adapts from 1 column to 4 columns without a single media query or container query. Use CSS Grid's `auto-fit`/`auto-fill` with `minmax()` to create a fully intrinsic responsive layout.
Choreograph a multi-element entrance animation: a hero section where heading, subheading, image, and CTA button animate in sequence with staggered delays. Use Svelte transitions with custom parameters, combining fade, fly, and scale.

## Requirements

1. Create `src/routes/exercises/06-styling/01/+page.svelte`
2. Define three layers in order: `@layer base, theme, utilities`
3. In `base`: style a paragraph with `#content .special p.highlight` (high specificity) — set color to red
4. In `utilities`: style the same element with just `.text-brand` (low specificity) — set color to brand
5. The low-specificity rule in the later layer WINS — prove it visually
6. Add a visual explanation showing the cascade resolution order
7. Include a second example where removing the layer declaration reverses the winner

## Constraints

- Must prove the layer wins over specificity with actual visual output
- No !important
- The high-specificity selector must be genuinely complex (at least 3 levels)
- Must work in latest Chrome, Firefox, Safari
- All colors must be in OKLCH — no HSL conversion
- Must handle gamut mapping (colors near L=100% or L=0% need reduced chroma)
- No external color libraries
- The generator must be reactive (slider changes update instantly)
- ZERO media queries in the solution
- ZERO container queries
- Pure CSS Grid intrinsic sizing
- Cards must look good at 320px and 1920px viewport widths
- Must use Svelte transition directive (not CSS @keyframes for entrance)
- Each element must have a DIFFERENT transition type
- The sequence must be choreographed (not simultaneous)
- prefers-reduced-motion must disable all animations

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`@layer` creates a cascade layer. Rules in later-declared layers win over earlier layers regardless of specificity. The order in the `@layer` statement at the top of the file determines winner.
OKLCH uses Lightness (0-100%), Chroma (0-0.4), and Hue (0-360). To create a palette, fix the hue, set chroma to a reasonable value (0.15-0.22 for vivid colors), and vary lightness from 95% (lightest) to 10% (darkest).
`repeat(auto-fit, minmax(min(100%, 16rem), 1fr))` means: make as many columns as fit, each at least 16rem wide (or 100% if viewport is smaller), growing to fill available space.
Svelte transitions accept a `delay` parameter: `transition:fly={{ y: 20, duration: 400, delay: 150 }}`. Combine with `{#key trigger}` to force re-mount and replay transitions.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Declare `@layer base, theme, utilities;` at the top. Put the complex selector in `base`. Put the simple selector in `utilities`. Because `utilities` is declared last, it wins regardless of the other selector having higher specificity.
For gamut safety, reduce chroma at extreme lightness values. At L=95%, use chroma * 0.3. At L=10%, use chroma * 0.5. This keeps colors within the sRGB gamut. Show the oklch() value and use a `color: oklch()` style to demonstrate each swatch.
The `min()` function inside `minmax()` provides the mobile fallback — on narrow viewports where 16rem > 100%, it collapses to a single column. No breakpoint needed. The `auto-fit` keyword collapses empty tracks, while `auto-fill` keeps them.
Create a `key` variable. Increment it on 'Replay'. Wrap the hero in `{#key animationKey}`. When key changes, Svelte destroys and recreates the block, triggering all `in:` transitions again with their staggered delays.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

\`\`\`svelte
<style>
  @layer base, theme, utilities;

  @layer base {
    #content .special p.highlight { color: oklch(60% 0.22 25); /* red */ }
  }

  @layer utilities {
    .text-brand { color: var(--color-brand); /* wins despite lower specificity */ }
  }
</style>

<div id="content"><div class="special"><p class="highlight text-brand">What color am I?</p></div></div>
\`\`\`
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

The solution demonstrates that `@layer utilities` declared after `@layer base` means any rule in utilities wins over base, regardless of specificity. A `.text-brand` selector (specificity 0-1-0) beats `#content .special p.highlight` (specificity 1-1-2) because layer order trumps specificity. This is the foundational insight of the PE7 architecture: layers give you explicit cascade control without specificity wars or `!important`.
The OKLCH palette generator leverages the perceptual uniformity of the OKLCH color space. Unlike HSL where L=50% varies wildly in perceived brightness across hues, OKLCH's Lightness is calibrated to human perception. The gamut reduction at extremes prevents out-of-gamut colors that browsers would clip unpredictably. This is why design systems are moving from HSL to OKLCH — the math is simpler and the results are more consistent.
CSS Grid's intrinsic sizing eliminates breakpoint maintenance entirely. The `auto-fit` keyword combined with `minmax()` creates a layout that responds to its container width automatically. As the container grows, more columns appear; as it shrinks, columns collapse. The `min(100%, 16rem)` ensures single-column layout on narrow viewports without any explicit breakpoint.
Svelte's transition system supports per-element choreography through the `delay` parameter. Combined with `{#key}`, you get replay capability. The stagger pattern (each element delayed by 150ms more than the previous) creates a cascading reveal that guides the user's eye down the page. The `in:` directive means transitions only play on mount, not on unmount.
</details>
