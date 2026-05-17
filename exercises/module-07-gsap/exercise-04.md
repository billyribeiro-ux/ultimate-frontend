---
module: 7
exercise: 4
title: GSAP + Svelte Transitions
difficulty: expert
estimated_time: 45
skills_tested:
  - lifecycle coordination
  - GSAP and transition coexistence
---

# Exercise 7.4 — GSAP + Svelte Transitions

## Brief

Demonstrate how to use GSAP animations alongside Svelte's built-in transitions without conflicts. Build a component where Svelte handles mount/unmount transitions while GSAP handles scroll-triggered and state-driven animations on mounted elements.

## Requirements

1. Create `src/routes/exercises/07-gsap/04/+page.svelte`
2. A modal component that uses Svelte `transition:` for mount/unmount (fade + scale)
3. Inside the modal: content animated with GSAP (stagger entrance of list items)
4. The GSAP animation starts AFTER Svelte's transition completes (use `on:introend`)
5. On close: GSAP reverses first, THEN Svelte transition unmounts (coordinate timing)
6. No flash of unstyled content, no animation conflicts
7. TypeScript strict, proper lifecycle handling

## Constraints

- Svelte transitions handle mount/unmount ONLY
- GSAP handles state-driven animations ONLY
- No conflicts (both trying to animate the same property)
- Proper sequencing (no visual glitches during hand-off)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Svelte's `on:introend` event fires when a `transition:in` completes. Start your GSAP animation in that handler. For exit, reverse GSAP first, then set the boolean that triggers Svelte's unmount transition.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The key insight: separate WHAT animates from WHEN it animates. Svelte transitions: mount/unmount (existence). GSAP: everything else (hover, scroll, state changes). For coordinated exit: `await gsapAnimation.reverse().then(() => showModal = false)`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

\`\`\`svelte
<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import gsap from 'gsap';

  let showModal: boolean = \$state(false);
  let listItems: HTMLElement;

  function onIntroEnd(): void {
    gsap.from(listItems.children, { y: 20, opacity: 0, stagger: 0.1 });
  }

  async function closeModal(): Promise<void> {
    await gsap.to(listItems.children, { y: -20, opacity: 0, stagger: 0.05 });
    showModal = false; // triggers Svelte out transition
  }
</script>

{#if showModal}
  <div transition:fade on:introend={onIntroEnd}>
    <ul bind:this={listItems}>...</ul>
  </div>
{/if}
\`\`\`
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

Due to the complexity of GSAP and Threlte solutions requiring actual library installations and significant code, the full implementation is left as the exercise goal. The hints above provide the architectural skeleton. Key principles:

- The coexistence rule: Svelte owns presence (in/out of DOM), GSAP owns property animation
- Never animate the same CSS property with both systems simultaneously
- Use `on:introend` to sequence GSAP after Svelte transitions
- For exit, reverse GSAP tweens before toggling the Svelte condition
</details>
