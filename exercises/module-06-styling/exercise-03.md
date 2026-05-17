---
module: 6
exercise: 3
title: Grid Without Breakpoints
Animation Sequence
difficulty: advanced
expert
estimated_time: 30
45
skills_tested:
  - CSS Grid intrinsic sizing
CSS animation choreography
  - auto-fit and minmax
Svelte transition directive
---

# Exercise 6.3 — Grid Without Breakpoints
Animation Sequence

## Brief

Build a card grid layout that adapts from 1 column to 4 columns without a single media query or container query. Use CSS Grid's `auto-fit`/`auto-fill` with `minmax()` to create a fully intrinsic responsive layout.
Choreograph a multi-element entrance animation: a hero section where heading, subheading, image, and CTA button animate in sequence with staggered delays. Use Svelte transitions with custom parameters, combining fade, fly, and scale.

## Requirements

1. Create `src/routes/exercises/06-styling/03/+page.svelte`
2. A card grid with 8-12 items
3. Cards must flow from 1 to 4 columns based on available space — NO media queries
4. Use `grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`
5. Cards have varying content heights — grid must handle this gracefully
6. Add a container-width slider (for demo purposes) that resizes the parent
7. Show the current column count dynamically

## Constraints

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

`repeat(auto-fit, minmax(min(100%, 16rem), 1fr))` means: make as many columns as fit, each at least 16rem wide (or 100% if viewport is smaller), growing to fill available space.
Svelte transitions accept a `delay` parameter: `transition:fly={{ y: 20, duration: 400, delay: 150 }}`. Combine with `{#key trigger}` to force re-mount and replay transitions.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The `min()` function inside `minmax()` provides the mobile fallback — on narrow viewports where 16rem > 100%, it collapses to a single column. No breakpoint needed. The `auto-fit` keyword collapses empty tracks, while `auto-fill` keeps them.
Create a `key` variable. Increment it on 'Replay'. Wrap the hero in `{#key animationKey}`. When key changes, Svelte destroys and recreates the block, triggering all `in:` transitions again with their staggered delays.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

\`\`\`svelte
<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    gap: var(--space-lg);
  }
</style>
\`\`\`
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

CSS Grid's intrinsic sizing eliminates breakpoint maintenance entirely. The `auto-fit` keyword combined with `minmax()` creates a layout that responds to its container width automatically. As the container grows, more columns appear; as it shrinks, columns collapse. The `min(100%, 16rem)` ensures single-column layout on narrow viewports without any explicit breakpoint.
Svelte's transition system supports per-element choreography through the `delay` parameter. Combined with `{#key}`, you get replay capability. The stagger pattern (each element delayed by 150ms more than the previous) creates a cascading reveal that guides the user's eye down the page. The `in:` directive means transitions only play on mount, not on unmount.
</details>
