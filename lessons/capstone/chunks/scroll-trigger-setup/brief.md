---
chunk: scroll-trigger-setup
title: ScrollTrigger + SvelteKit
module: 7
---

# ScrollTrigger + SvelteKit — Brief

Register GSAP's ScrollTrigger plugin once and wire it to a feature grid on the marketing home. As the user scrolls past each feature card, it animates into view with a 30 px rise and fade.

## What to build

- Register `ScrollTrigger` once inside an `$effect` guard (registration is safe to repeat but cleanest done in one place).
- Select the feature cards with a class selector and create one ScrollTrigger-backed tween per card using `gsap.utils.toArray()`.
- Use `trigger`, `start: 'top 80%'`, and `toggleActions: 'play none none reverse'`.
- **Navigation-safe cleanup:** call `ScrollTrigger.killAll()` (or track and kill individual triggers) in the effect's return function so SvelteKit client-side navigations do not leak triggers.

## Acceptance criteria

- Feature cards animate into view as you scroll on the home page.
- Navigating to `/dashboard` and back resets the triggers cleanly — no duplicated animations, no stale listeners.
- Reduced-motion preference disables all ScrollTriggers.

## How it connects to the capstone

`scroll-trigger-setup` enables the scroll-driven feel that ties the marketing home together. `reveal-action` generalises the pattern into a reusable directive.
