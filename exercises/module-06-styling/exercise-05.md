---
module: 6
exercise: 5
title: Reduced-Motion Audit
difficulty: principal
estimated_time: 60
skills_tested:
  - prefers-reduced-motion
  - WCAG 2.2 compliance
---

# Exercise 6.5 — Reduced-Motion Audit

## Brief

Audit an existing page for motion accessibility. Create a component that demonstrates all animations with prefers-reduced-motion: reduce active, showing alternative non-motion experiences (opacity changes, border highlights, etc.) for every animated element.

## Requirements

1. Create `src/routes/exercises/06-styling/05/+page.svelte`
2. Build a page with 5 different animated elements (button hover, card entrance, loading spinner, notification slide, page transition)
3. For EACH animation, provide TWO versions: full motion and reduced motion
4. The reduced-motion version must still communicate state change (use opacity, borders, color)
5. Toggle between motion modes via a UI switch (override the media query for demo)
6. Include a checklist showing which WCAG 2.2 criteria each element satisfies
7. The page must work for users with vestibular disorders (no parallax, no auto-play, no rapid flashing)

## Constraints

- Must test with actual prefers-reduced-motion: reduce enabled
- No animation can be purely decorative — each must communicate something
- Reduced-motion alternatives must convey the same information
- Zero motion-triggered seizure risks (no flashing > 3 Hz)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Start with `@media (prefers-reduced-motion: reduce)` to detect the preference. Replace transform-based animations with opacity or color changes. Provide equivalent information through non-motion cues.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Create a $state variable `reduceMotion` that can be toggled via UI. Use it with a class on a wrapper element. In CSS, use `.reduce-motion` class as an alternative to the media query for the demo. In production, always respect the OS preference via the media query.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

\`\`\`svelte
<script lang="ts">
  let reduceMotion: boolean = \$state(false);
</script>

<div class:reduce-motion={reduceMotion}>
  <!-- animated content -->
</div>

<style>
  .button { transition: transform var(--dur-fast), background var(--dur-fast); }
  .button:hover { transform: scale(1.05); }

  .reduce-motion .button { transition: background var(--dur-fast); }
  .reduce-motion .button:hover { transform: none; outline: 2px solid var(--color-brand); }

  @media (prefers-reduced-motion: reduce) {
    .button:hover { transform: none; outline: 2px solid var(--color-brand); }
  }
</style>
\`\`\`
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

The reduced-motion audit demonstrates that accessibility is not about removing information — it is about providing equivalent non-motion alternatives. Every animation should answer: what information does this convey? A slide-in notification communicates 'new content appeared' — this can also be communicated with a border highlight or opacity change. The key WCAG criteria are 2.3.1 (no seizure risk), 2.3.3 (animation from interaction can be disabled), and the newer 2.2 criteria for motion preference respect.
</details>
