---
chunk: gsap-timeline
title: GSAP Timeline
module: 7
---

# GSAP Timeline — Brief

Sequence the capstone's marketing home hero with a GSAP Timeline. The timeline animates the eyebrow, headline, subhead, and CTA into view in a deliberate 1.2-second choreography on first load.

## What to build

- On `src/routes/+page.svelte`, mark the four hero text elements with `bind:this` refs.
- Inside `$effect(() => { … return cleanup; })`, build a `gsap.timeline()` that tweens each element from `opacity: 0, y: 20` to `opacity: 1, y: 0` with an 80 ms stagger between steps.
- Clean up the timeline in the effect's return function so navigation does not leak animations.
- Respect `prefers-reduced-motion: reduce` — skip the timeline and set the final state immediately.

## Acceptance criteria

- Animations run on first load.
- Navigating away and back does not double-run the timeline.
- With reduced-motion enabled, elements appear at their final position with no animation.
- No `any` types.

## How it connects to the capstone

Sets the tone for the entire marketing home. `scroll-trigger-setup` layers scroll-driven animations on top. `reveal-action` packages the pattern as a reusable directive for the blog archive.
