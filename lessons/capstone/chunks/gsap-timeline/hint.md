---
chunk: gsap-timeline
level: 1
penalty: 0
---

# GSAP Timeline — Level 1 Hint (free)

GSAP's Timeline is an ordered sequence of tweens with automatic chaining. You add tweens to it, and each one plays after the previous one unless you override the position parameter.

Three things to get right:

1. **Refs before tweens.** GSAP needs real DOM nodes, not Svelte components. Use `let el = $state<HTMLElement | undefined>();` and `<h1 bind:this={el}>…`.
2. **Effect for the timeline, not `onMount`.** In Svelte 5 the idiomatic place to create an effect that reads from DOM is `$effect`. Return a cleanup function that calls `tl.kill()` so navigation does not leak animations.
3. **Reduced motion is an early return.** Read `matchMedia('(prefers-reduced-motion: reduce)').matches` at the top of the effect. If true, skip GSAP entirely — just set the final state.

A timeline with 4 elements and an 80 ms stagger is not 4 tweens — it is one `.to()` call with a `stagger` parameter. Let GSAP do the sequencing work.
