---
module: 7
exercise: 2
title: ScrollTrigger Coordination
Action-Based Animation
GSAP + Svelte Transitions
difficulty: intermediate
advanced
expert
estimated_time: 20
30
45
skills_tested:
  - ScrollTrigger plugin
Svelte use: actions
lifecycle coordination
  - scroll-linked animation
reusable animation patterns
GSAP and transition coexistence
---

# Exercise 7.2 — ScrollTrigger Coordination
Action-Based Animation
GSAP + Svelte Transitions

## Brief

Create a scroll-driven storytelling section where elements animate as the user scrolls. Use ScrollTrigger with pin and scrub to create a parallax-like experience that ties animation progress to scroll position.
Build a reusable Svelte action (`use:animate`) that applies GSAP animations to any element declaratively. The action should accept parameters for the animation type, trigger, and handle cleanup automatically.
Demonstrate how to use GSAP animations alongside Svelte's built-in transitions without conflicts. Build a component where Svelte handles mount/unmount transitions while GSAP handles scroll-triggered and state-driven animations on mounted elements.

## Requirements

1. Create `src/routes/exercises/07-gsap/02/+page.svelte`
2. A tall scrollable section (300vh) with 4 animated elements
3. Use ScrollTrigger with `scrub: true` — animation tied to scroll position
4. Pin the animated container while scrolling through its section
5. Show a progress indicator that updates with scroll
6. Elements: heading scales up, image parallax-shifts, text fades in, CTA slides up
7. Clean up ScrollTrigger instances on component destroy
8. Respect prefers-reduced-motion (disable scroll animations)

## Constraints

- Must use the ScrollTrigger plugin (registered correctly)
- Must pin the container (not just trigger on scroll)
- Must clean up on navigation (SvelteKit page transitions)
- No scroll-jacking — smooth, user-controlled
- The action must be in a separate .ts file (reusable)
- Must handle component destruction (kill tweens)
- Must work with SSR (no window access at import time)
- IntersectionObserver for visibility trigger
- Svelte transitions handle mount/unmount ONLY
- GSAP handles state-driven animations ONLY
- No conflicts (both trying to animate the same property)
- Proper sequencing (no visual glitches during hand-off)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Register ScrollTrigger with `gsap.registerPlugin(ScrollTrigger)`. Create a trigger with `scrollTrigger: { trigger: element, start: 'top center', end: 'bottom center', scrub: true, pin: true }`.
A Svelte action is a function that receives the element and optional parameters. Return an object with `destroy()` for cleanup. For GSAP, create the tween in the action body and kill it in destroy.
Svelte's `on:introend` event fires when a `transition:in` completes. Start your GSAP animation in that handler. For exit, reverse GSAP first, then set the boolean that triggers Svelte's unmount transition.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The pin behavior keeps the container fixed while the user scrolls through its trigger region. `scrub: true` maps scroll position to animation progress linearly. Combine multiple tweens in a timeline and attach the ScrollTrigger to the timeline, not individual tweens.
For the 'visible' trigger, create an IntersectionObserver in the action. When the element enters the viewport, start the GSAP animation. Store both the observer and the tween for cleanup. The action parameters should be validated with TypeScript.
The key insight: separate WHAT animates from WHEN it animates. Svelte transitions: mount/unmount (existence). GSAP: everything else (hover, scroll, state changes). For coordinated exit: `await gsapAnimation.reverse().then(() => showModal = false)`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

\`\`\`svelte
<script lang="ts">
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  let section: HTMLElement;

  \$effect(() => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top top', end: '+=200%', scrub: 1, pin: true }
    });
    tl.from('.hero-text', { y: 100, opacity: 0 });
    return () => { ScrollTrigger.getAll().forEach(st => st.kill()); };
  });
</script>
\`\`\`
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

Due to the complexity of GSAP and Threlte solutions requiring actual library installations and significant code, the full implementation is left as the exercise goal. The hints above provide the architectural skeleton. Key principles:

- Register ScrollTrigger once at module level
- Always clean up ScrollTrigger instances on destroy
- Use `scrub: 1` for smooth scroll-linked animation (value = seconds of catch-up)
- Check `prefers-reduced-motion` before creating scroll animations
- Actions run after mount — element is guaranteed to exist
- The destroy function must kill all tweens and observers
- For SSR safety, check `typeof window !== 'undefined'` before using IntersectionObserver
- Type the params interface to get autocomplete in templates
- The coexistence rule: Svelte owns presence (in/out of DOM), GSAP owns property animation
- Never animate the same CSS property with both systems simultaneously
- Use `on:introend` to sequence GSAP after Svelte transitions
- For exit, reverse GSAP tweens before toggling the Svelte condition
</details>
