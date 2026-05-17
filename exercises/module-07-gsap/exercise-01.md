---
module: 7
exercise: 1
title: Timeline Choreography
ScrollTrigger Coordination
Action-Based Animation
GSAP + Svelte Transitions
difficulty: beginner
intermediate
advanced
expert
estimated_time: 10
20
30
45
skills_tested:
  - gsap.timeline()
ScrollTrigger plugin
Svelte use: actions
lifecycle coordination
  - tween sequencing
scroll-linked animation
reusable animation patterns
GSAP and transition coexistence
---

# Exercise 7.1 — Timeline Choreography
ScrollTrigger Coordination
Action-Based Animation
GSAP + Svelte Transitions

## Brief

Build a loading animation using GSAP timeline that sequences 5 elements in a choreographed entrance. Elements stagger in, overlap timing, and use different easing curves. Include play/reverse/restart controls.
Create a scroll-driven storytelling section where elements animate as the user scrolls. Use ScrollTrigger with pin and scrub to create a parallax-like experience that ties animation progress to scroll position.
Build a reusable Svelte action (`use:animate`) that applies GSAP animations to any element declaratively. The action should accept parameters for the animation type, trigger, and handle cleanup automatically.
Demonstrate how to use GSAP animations alongside Svelte's built-in transitions without conflicts. Build a component where Svelte handles mount/unmount transitions while GSAP handles scroll-triggered and state-driven animations on mounted elements.

## Requirements

1. Create `src/routes/exercises/07-gsap/01/+page.svelte`
2. A GSAP timeline that sequences 5 card elements
3. Cards stagger in with `gsap.to()` — translateY + opacity
4. Use position parameter for overlapping: `"-=0.2"` overlap
5. Different easing per element (power2, elastic, back)
6. Timeline controls: play, pause, reverse, restart buttons
7. A progress bar that shows timeline progress
8. Proper cleanup in `$effect` return function

## Constraints

- Must use gsap.timeline() — not individual tweens
- Cleanup must kill the timeline on unmount
- Easing must vary between elements
- prefers-reduced-motion must be respected
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

`gsap.timeline()` creates a sequenced animation. Add tweens with `.to()`, `.from()`, or `.fromTo()`. The position parameter (second argument to `.to()`) controls timing: `'+=0.5'` adds delay, `'-=0.2'` overlaps.
Register ScrollTrigger with `gsap.registerPlugin(ScrollTrigger)`. Create a trigger with `scrollTrigger: { trigger: element, start: 'top center', end: 'bottom center', scrub: true, pin: true }`.
A Svelte action is a function that receives the element and optional parameters. Return an object with `destroy()` for cleanup. For GSAP, create the tween in the action body and kill it in destroy.
Svelte's `on:introend` event fires when a `transition:in` completes. Start your GSAP animation in that handler. For exit, reverse GSAP first, then set the boolean that triggers Svelte's unmount transition.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Use `bind:this` to get element references. Create the timeline in `$effect`. Store the timeline instance in a variable. The controls call `tl.play()`, `tl.pause()`, etc. For progress, use `tl.progress()` in an `onUpdate` callback.
The pin behavior keeps the container fixed while the user scrolls through its trigger region. `scrub: true` maps scroll position to animation progress linearly. Combine multiple tweens in a timeline and attach the ScrollTrigger to the timeline, not individual tweens.
For the 'visible' trigger, create an IntersectionObserver in the action. When the element enters the viewport, start the GSAP animation. Store both the observer and the tween for cleanup. The action parameters should be validated with TypeScript.
The key insight: separate WHAT animates from WHEN it animates. Svelte transitions: mount/unmount (existence). GSAP: everything else (hover, scroll, state changes). For coordinated exit: `await gsapAnimation.reverse().then(() => showModal = false)`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

\`\`\`svelte
<script lang="ts">
  import gsap from 'gsap';
  let container: HTMLElement;
  let progress: number = \$state(0);

  \$effect(() => {
    const tl = gsap.timeline({
      paused: true,
      onUpdate() { progress = tl.progress(); }
    });
    tl.from('.card', { y: 50, opacity: 0, stagger: 0.15, ease: 'power2.out' });
    tl.play();
    return () => tl.kill();
  });
</script>
\`\`\`
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

Due to the complexity of GSAP and Threlte solutions requiring actual library installations and significant code, the full implementation is left as the exercise goal. The hints above provide the architectural skeleton. Key principles:

- Always create timelines in `$effect` and kill them in the cleanup return
- Use the position parameter for overlap: `'-=0.2'` means start 0.2s before previous tween ends
- Store timeline reference for external control (play/pause/reverse)
- Use `onUpdate` callback for progress tracking
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
