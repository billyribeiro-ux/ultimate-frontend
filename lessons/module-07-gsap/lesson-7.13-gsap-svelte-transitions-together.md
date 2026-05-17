---
module: 7
lesson: 7.13
title: GSAP + Svelte transitions together
duration: 30 minutes
prerequisites:
  - Lesson 6.11 (Svelte transitions)
  - Lesson 7.7 (GSAP cleanup)
learning_objectives:
  - Explain the conflict between GSAP and Svelte transitions when both touch the same property
  - Decide which tool owns which element on a given page
  - Use GSAP for persistent-element effects and Svelte transitions for mount/unmount effects
  - Build a component where both coexist without interference
  - Debug "my animation is fighting itself" issues
status: ready
---

# Lesson 7.13 — GSAP + Svelte transitions together

## 1. Concept — Two animation systems, one element

GSAP and Svelte transitions both write to the same CSS properties, most commonly `transform` and `opacity`. When both target the same element at the same time, they fight — each overwrites the other every frame, and the visible result is a jittery mess. This is not a bug in either system; it is a consequence of the fact that there is only one `transform` property per element. The fix is not technical but architectural: **make sure GSAP and Svelte transitions never own the same element at the same time**.

The good news is that in practice this is easy, because GSAP and Svelte transitions solve different lifecycle problems. Svelte transitions run only when an element enters or leaves the DOM. GSAP runs on persistent elements that stay in the DOM. If you keep each tool doing its own job, they never collide.

### 1.1 The division of labour

- **Svelte `transition:` / `in:` / `out:`** — use for mount/unmount of elements. Modals, toasts, dropdowns, `{#if}` blocks, `{#each}` with changing keys.
- **GSAP** — use for everything else. Hover lifts, scroll reveals, timeline sequences, ScrollTrigger, persistent looping effects.

In a single page, both will typically show up — maybe you have a modal with a Svelte transition, and inside the modal you have a GSAP timeline that reveals its children. That is fine because the modal element is owned by Svelte (it is the one mounting/unmounting) and the children inside are owned by GSAP (they are persistent while the modal is open).

### 1.2 The conflict scenario

A beginner mistake that causes real bugs:

```svelte
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { gsap } from 'gsap';

	let open = $state(false);
	let card: HTMLElement | undefined = $state();

	$effect(() => {
		if (!card) return;
		gsap.to(card, { y: 100, repeat: -1, yoyo: true }); // looping animation
	});
</script>

{#if open}
	<article bind:this={card} transition:fly={{ y: -40 }}>
		Content
	</article>
{/if}
```

Both the GSAP loop and `transition:fly` write to `transform: translateY(...)` on the same element every frame. The visible result jitters. The fix is either:

- **Move the loop inward.** Put the looping GSAP animation on a *child* of the article; let the Svelte transition own the article itself.
- **Delay the GSAP call until the transition finishes.** Use the `introend` event on the element to start GSAP only after Svelte's transition is done.

### 1.3 The "wait for introend" pattern

```svelte
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { gsap } from 'gsap';

	let open = $state(false);
	let card: HTMLElement | undefined = $state();

	function startLoop(): void {
		if (!card) return;
		gsap.to(card, { scale: 1.02, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
	}

	function stopLoop(): void {
		if (card) gsap.killTweensOf(card);
	}
</script>

{#if open}
	<article
		bind:this={card}
		transition:fly={{ y: -40 }}
		onintroend={startLoop}
		onoutrostart={stopLoop}
	>
		Content
	</article>
{/if}
```

Svelte dispatches `introend` and `outrostart` on elements that have transitions. You use those hooks to time GSAP's start and stop around the transition. Now the animations never touch the same property at the same time.

### 1.4 The "inner element" pattern (preferred)

Even cleaner: put the GSAP effect on a child element. The parent is owned by Svelte, the child by GSAP, and neither conflicts.

```svelte
{#if open}
	<article transition:fly={{ y: -40 }}>
		<div bind:this={innerPulse}>GSAP lives here</div>
	</article>
{/if}
```

This is the recommended pattern for 95% of cases. Use `introend`/`outrostart` only when the animation really must apply to the outer element.

### 1.5 GSAP + Svelte on different properties

If GSAP animates `color` and Svelte transitions animate `transform`, they do not conflict even on the same element. The rule is "don't share the same CSS property", not "don't share the same element". In practice the shared-property case is so common that architectural separation is still the cleaner rule.

### 1.6 Reduced motion across both systems

Each system has its own reduced-motion handling (CSS reset for Svelte transitions + `prefersReducedMotion.current` for both Svelte JS transitions and GSAP). Make sure both sides honour the preference; one without the other is still bad.



## Going Deeper

**Official documentation:**
- [Svelte docs: Transition events](https://svelte.dev/docs/svelte/transition#Transition-events)
- [GSAP docs: gsap.killTweensOf()](https://gsap.com/docs/v3/GSAP/gsap.killTweensOf())
- [Svelte docs: transition:](https://svelte.dev/docs/svelte/transition)

**Advanced pattern:** Build a modal with `transition:scale` on the wrapper and a GSAP continuous pulse on an inner badge. Verify no jitter.

**Challenge question:** (Combines Lessons 7.13, 7.7, and 6.12) Build a modal that uses `in:scale` + `out:fly` (asymmetric Svelte transitions) with a GSAP timeline for inner content reveals. Use `onintroend` to play the timeline after the modal is fully open. Clean up the timeline on `outrostart`.

## 2. Style it — A modal with a pulsing badge inside

The mini-build is a modal with an amber brand (`oklch(75% 0.16 65)`). The modal opens with a Svelte `transition:scale`. Inside the modal is a badge element that pulses continuously with GSAP (`scale` yoyo). The badge lives on a child element so no conflict. Close button 44×44px.

## 3. Interact — The conflict, then the architectural fix

The first draft puts the pulse on the outer modal element — visible jitter. The refactor moves the pulse to a nested badge — smooth on both the modal open animation and the badge's continuous pulse.

## 4. Mini-build — Modal with inner GSAP effect

**File:** `src/routes/modules/07-gsap/13-transitions-together/+page.svelte`

A button opens a modal (`open = $state(false)`). The modal uses `transition:scale`. Inside the modal, a `<span class="badge">` element has a GSAP pulse attached via `$effect` keyed to the bind:this ref. The pulse starts when the ref becomes non-null and is killed on cleanup.

### DevTools verification

1. Open the modal — smooth scale-in.
2. While open, inspect the badge — its transform animates continuously from scale(1) to scale(1.05) and back.
3. Close the modal — clean scale-out; no jitter on the badge during the out transition.
4. Enable reduced motion — modal opens instantly, badge does not pulse.
5. Open and close rapidly — no leaked tweens; the badge stops when the modal closes.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why do GSAP and Svelte transitions conflict when applied to the same element?</summary>

Both write to the same CSS properties (usually `transform` and `opacity`) every frame. With two writers and one value, each overwrites the other and the visible result jitters.
</details>

<details>
<summary><strong>Q2.</strong> What is the recommended architectural fix?</summary>

Put the GSAP animation on a child element while the Svelte transition is on the parent. The two elements do not share a CSS property so they cannot conflict.
</details>

<details>
<summary><strong>Q3.</strong> What are the <code>introend</code> and <code>outrostart</code> events?</summary>

DOM events Svelte dispatches on transitioning elements. `introend` fires when the intro transition finishes; `outrostart` fires when the outro transition begins. Useful for starting or stopping GSAP around a Svelte transition.
</details>

<details>
<summary><strong>Q4.</strong> Can GSAP and Svelte transitions share the same element if they animate different properties?</summary>

Yes. GSAP on `color` and Svelte on `transform` never collide. But the shared-property case is common enough that the cleaner rule is "separate elements" rather than "separate properties".
</details>

<details>
<summary><strong>Q5.</strong> How does reduced motion interact when both systems are present?</summary>

Each system has its own handling — CSS reset covers CSS transitions, `prefersReducedMotion.current` covers both Svelte JS transitions and GSAP. You must honour the preference in both code paths or users get half an accessible experience.
</details>

## 6. Common mistakes

- **Same element, both systems, same property.** The classic cause of jitter.
- **Starting GSAP too early.** If your effect starts a loop while Svelte's intro transition is running, they fight. Use `onintroend` or a child element.
- **Forgetting to kill the loop when the element unmounts.** Svelte calls the effect's cleanup, and if you have not returned a cleanup, the loop persists.
- **Half-accessible reduced-motion.** Skipping one of the two systems means the user still gets unwanted motion.

## 7. What's next

Lesson 7.14 is Module 7's final lesson — introducing Threlte, SvelteKit's 3D renderer, and building a GSAP-driven spinning torus.
