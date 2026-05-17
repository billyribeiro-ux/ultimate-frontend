---
module: 6
exercise: 4
title: Animation Sequence
difficulty: expert
estimated_time: 45
skills_tested:
  - CSS animation choreography
  - Svelte transition directive
---

# Exercise 6.4 — Animation Sequence

## Brief

Choreograph a multi-element entrance animation: a hero section where heading, subheading, image, and CTA button animate in sequence with staggered delays. Use Svelte transitions with custom parameters, combining fade, fly, and scale.

## Requirements

1. Create `src/routes/exercises/06-styling/04/+page.svelte`
2. A hero section with: heading, subheading, decorative image, and CTA button
3. Elements animate in sequence: heading (0ms) → subheading (150ms) → image (300ms) → button (450ms)
4. Use Svelte `transition:` directive with `fly`, `fade`, `scale` combinations
5. Custom transition parameters: duration, delay, easing per element
6. Add a "Replay" button that triggers the animation again (use `{#key}`)
7. All animations respect `prefers-reduced-motion`

## Constraints

- Must use Svelte transition directive (not CSS @keyframes for entrance)
- Each element must have a DIFFERENT transition type
- The sequence must be choreographed (not simultaneous)
- prefers-reduced-motion must disable all animations

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Svelte transitions accept a `delay` parameter: `transition:fly={{ y: 20, duration: 400, delay: 150 }}`. Combine with `{#key trigger}` to force re-mount and replay transitions.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Create a `key` variable. Increment it on 'Replay'. Wrap the hero in `{#key animationKey}`. When key changes, Svelte destroys and recreates the block, triggering all `in:` transitions again with their staggered delays.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

\`\`\`svelte
<script lang="ts">
  import { fly, fade, scale } from 'svelte/transition';
  let key: number = \$state(0);
</script>

{#key key}
  <h1 in:fly={{ y: -30, duration: 500, delay: 0 }}>Heading</h1>
  <p in:fade={{ duration: 400, delay: 150 }}>Subheading</p>
  <img in:scale={{ start: 0.8, duration: 500, delay: 300 }} src="..." alt="" />
  <button in:fly={{ y: 20, duration: 400, delay: 450 }}>CTA</button>
{/key}

<button onclick={() => key++}>Replay</button>
\`\`\`
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

Svelte's transition system supports per-element choreography through the `delay` parameter. Combined with `{#key}`, you get replay capability. The stagger pattern (each element delayed by 150ms more than the previous) creates a cascading reveal that guides the user's eye down the page. The `in:` directive means transitions only play on mount, not on unmount.
</details>
