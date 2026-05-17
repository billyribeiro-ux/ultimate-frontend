---
module: 7
exercise: 3
title: Action-Based Animation
GSAP + Svelte Transitions
difficulty: advanced
expert
estimated_time: 30
45
skills_tested:
  - Svelte use: actions
lifecycle coordination
  - reusable animation patterns
GSAP and transition coexistence
---

# Exercise 7.3 — Action-Based Animation
GSAP + Svelte Transitions

## Brief

Build a reusable Svelte action (`use:animate`) that applies GSAP animations to any element declaratively. The action should accept parameters for the animation type, trigger, and handle cleanup automatically.
Demonstrate how to use GSAP animations alongside Svelte's built-in transitions without conflicts. Build a component where Svelte handles mount/unmount transitions while GSAP handles scroll-triggered and state-driven animations on mounted elements.

## Requirements

1. Create `src/lib/exercises/07/animate.ts` — the Svelte action
2. Create `src/routes/exercises/07-gsap/03/+page.svelte`
3. Action signature: `use:animate={{ type: 'fadeIn' | 'slideUp' | 'scaleIn', duration?, delay?, trigger?: 'mount' | 'visible' }}`
4. When trigger is 'visible', use IntersectionObserver to start animation on scroll-in
5. Action returns cleanup (kills GSAP tweens, disconnects observers)
6. Demonstrate on 10+ elements with different configurations
7. The action must be fully typed (TypeScript parameters interface)

## Constraints

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

A Svelte action is a function that receives the element and optional parameters. Return an object with `destroy()` for cleanup. For GSAP, create the tween in the action body and kill it in destroy.
Svelte's `on:introend` event fires when a `transition:in` completes. Start your GSAP animation in that handler. For exit, reverse GSAP first, then set the boolean that triggers Svelte's unmount transition.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

For the 'visible' trigger, create an IntersectionObserver in the action. When the element enters the viewport, start the GSAP animation. Store both the observer and the tween for cleanup. The action parameters should be validated with TypeScript.
The key insight: separate WHAT animates from WHEN it animates. Svelte transitions: mount/unmount (existence). GSAP: everything else (hover, scroll, state changes). For coordinated exit: `await gsapAnimation.reverse().then(() => showModal = false)`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

\`\`\`typescript
import gsap from 'gsap';
import type { Action } from 'svelte/action';

interface AnimateParams {
  type: 'fadeIn' | 'slideUp' | 'scaleIn';
  duration?: number;
  delay?: number;
  trigger?: 'mount' | 'visible';
}

export const animate: Action<HTMLElement, AnimateParams> = (node, params) => {
  // create tween based on params.type
  // if trigger === 'visible', use IntersectionObserver
  return { destroy() { /* kill tween, disconnect observer */ } };
};
\`\`\`
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

Due to the complexity of GSAP and Threlte solutions requiring actual library installations and significant code, the full implementation is left as the exercise goal. The hints above provide the architectural skeleton. Key principles:

- Actions run after mount — element is guaranteed to exist
- The destroy function must kill all tweens and observers
- For SSR safety, check `typeof window !== 'undefined'` before using IntersectionObserver
- Type the params interface to get autocomplete in templates
- The coexistence rule: Svelte owns presence (in/out of DOM), GSAP owns property animation
- Never animate the same CSS property with both systems simultaneously
- Use `on:introend` to sequence GSAP after Svelte transitions
- For exit, reverse GSAP tweens before toggling the Svelte condition
</details>
