---
module: 6
lesson: 6.12
title: in: and out: — different enter and exit animations
duration: 35 minutes
prerequisites:
  - Lesson 6.11 (Svelte transition directive)
learning_objectives:
  - Use the `in:` directive to define an enter-only animation
  - Use the `out:` directive to define an exit-only animation
  - Combine `in:` and `out:` with different built-in transitions on the same element
  - Decide when unidirectional transitions are the right choice over bidirectional
  - Avoid the "abort mid-flight" bug unique to unidirectional transitions
status: ready
---

# Lesson 6.12 — `in:` and `out:` — different enter and exit animations

## 1. Concept — Entrances and exits are not always symmetrical

Lesson 6.11 introduced `transition:fly`, which animates the same way in both directions. That is often what you want — a toast flies in from the right and flies out to the right, symmetric and predictable. But a surprising number of real-world interactions are *asymmetric*. A hero image might fade in gently when the page loads and then zoom away dramatically when the user clicks away. A modal might scale up from the centre when it opens and slide down out of view when it closes. A card in an onboarding carousel might fly in from the right and fade out in place. In each case, the enter animation and the exit animation are different animations, and the `transition:` directive cannot express that — by design, it runs one function in both directions.

Svelte solves this with two separate directives that share the same parameter grammar as `transition:`, but each only runs in one direction:

- **`in:`** — runs only when the element enters the DOM. Silent on exit.
- **`out:`** — runs only when the element leaves the DOM. Silent on entry.

You can put both on the same element to get fully independent enter and exit animations. Or you can put only one — for example, "fly in but snap out" — when the asymmetry points the other way.

### 1.1 The shape of the directives

```svelte
<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let open = $state(false);
</script>

<button onclick={() => (open = !open)}>Toggle</button>

{#if open}
	<div
		in:fly={{ y: -20, duration: 300, easing: cubicOut }}
		out:fade={{ duration: 200 }}
	>
		I fly in and fade out.
	</div>
{/if}
```

Both directives take the same parameter shape as `transition:` — `duration`, `delay`, `easing`, and the per-transition extras (`x`, `y`, `start`, `amount`, etc.). You can mix transitions from different families freely: `in:scale` and `out:fly`, `in:blur` and `out:fade`, whatever reads naturally for your interaction.

### 1.2 When to prefer unidirectional

Use `in:`/`out:` when:

- The enter and exit animations communicate different intents. A modal appearing should feel assertive; the same modal being dismissed should feel polite and quick, so the exit wants shorter duration and a different easing.
- The geometry is different. A dropdown menu that flies in from above should fade out in place when you click somewhere else — continuing to fly up on exit would look like the menu is running back to wherever it came from.
- You only want one side animated. A nav bar that fades in on first paint does not need to fade out when you navigate away, because the whole page will unmount with a layout transition.

Stick with `transition:` (bidirectional) for symmetric interactions, because bidirectional transitions can *reverse* smoothly if the user changes their mind mid-flight. Unidirectional transitions cannot — which is the main pitfall to understand next.

### 1.3 The mid-flight abort trap

Because `in:` and `out:` are two separate animations, they cannot gracefully hand off to each other. If the user toggles the element while it is mid-intro, Svelte will cut the intro, jump to the *completed* mounted state for a single frame, and then start the `out:` animation. The visual result is often a tiny glitch — a pop at the moment of handover.

With `transition:` (bidirectional), Svelte reverses the same animation in place, and there is no glitch. So the practical rule is: **if users will toggle this element quickly and repeatedly, pick `transition:`. Use `in:`/`out:` for elements that move through their lifecycle once per interaction.**

### 1.4 Interaction with `|global`

Both `in:` and `out:` accept the `|global` modifier, just like `transition:`. An element with `in:fade|global` will play its intro animation even when a parent block mounts; an element with `out:fade|global` will play its exit even when a parent block unmounts. The defaults (local) are almost always correct.

### 1.5 Reduced motion

The same rule as Lesson 6.11 applies: check `prefersReducedMotion.current` and collapse the parameters. For unidirectional transitions you check once and set both directives' parameters:

```svelte
<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { fly, fade } from 'svelte/transition';

	const reduced = $derived(prefersReducedMotion.current);
</script>

{#if open}
	<div
		in:fly={{ y: reduced ? 0 : -20, duration: reduced ? 0 : 300 }}
		out:fade={{ duration: reduced ? 0 : 200 }}
	>
		content
	</div>
{/if}
```



## Going Deeper

**Official documentation:**
- [Svelte docs: in: and out:](https://svelte.dev/docs/svelte/in-and-out)
- [Svelte docs: transition events](https://svelte.dev/docs/svelte/transition#Transition-events)
- [Svelte tutorial: In and out](https://svelte.dev/tutorial/svelte/in-and-out)

**Advanced pattern:** Build a modal that uses `in:scale` with a slight delay and `out:fly` downward. Add `onintroend` and `onoutrostart` event handlers to log the transition lifecycle.

**Challenge question:** (Combines Lessons 6.12, 6.11, and 6.15) Build a notification system where toasts enter with `in:fly` from the right and exit with `out:fade`. Add a spring-driven progress bar inside each toast that shows time remaining. When the progress bar reaches zero, dismiss the toast.

## 2. Style it — A modal dialog with asymmetric motion

The mini-build is a centred modal with an orange brand hue (`oklch(72% 0.17 55)`). The modal has a scrim backdrop and a dialog card. The scrim fades in and fades out. The dialog **scales up** from 0.9 on enter (`in:scale`) and **flies down** on exit (`out:fly`), communicating clearly that the modal is "put away". Close button is 44×44px. Mobile-first: modal is full-width on narrow screens, max-width 28rem above 480px.

## 3. Interact — Why the bidirectional version feels wrong

The first draft uses `transition:scale` on the modal. It works for open, but closing feels off — the modal shrinks symmetrically back to where it came from, which makes it look like it is "being un-summoned". Users expect the close animation to feel like a dismissal, not a reversal. Switching to `in:scale` + `out:fly={{ y: 40 }}` gives the exit its own meaning: *slide away, downward, out of sight*. Same element, completely different feel.

## 4. Mini-build — A modal with scale-in and slide-out

**File:** `src/routes/modules/06-styling/12-in-out-transitions/+page.svelte`

The page has an "Open dialog" button. Clicking it sets `open = true`, which mounts the scrim and dialog. The scrim uses `transition:fade` (symmetric, unobtrusive). The dialog uses `in:scale` + `out:fly`. Escape key closes the dialog.

### DevTools verification

1. Open DevTools → **Elements**.
2. Click "Open dialog" and watch the dialog's `transform` in the Computed pane animate from `scale(0.9)` to `scale(1)` over 300ms.
3. Click the close button. The same element's `transform` now animates `translateY(0)` → `translateY(40px)` with opacity fading out — a completely different animation from the one that played on open.
4. Toggle *prefers-reduced-motion: reduce* and repeat — both animations collapse to instant.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the main functional difference between <code>transition:</code> and the pair <code>in:</code>/<code>out:</code>?</summary>

`transition:` is bidirectional and runs the same animation in both directions, reversing smoothly if interrupted. `in:` and `out:` are unidirectional — you can use two different animations and they cannot hand off smoothly if the element toggles mid-flight.
</details>

<details>
<summary><strong>Q2.</strong> When should you avoid using <code>in:</code>/<code>out:</code>?</summary>

When the element will toggle rapidly and the user might interrupt mid-animation. Bidirectional `transition:` can reverse itself without a visual glitch; unidirectional transitions cannot and will pop briefly when cut off.
</details>

<details>
<summary><strong>Q3.</strong> Can you mix different built-in transition functions in <code>in:</code> and <code>out:</code>?</summary>

Yes. `in:scale` with `out:fly`, `in:blur` with `out:fade`, any combination is valid. They share the same parameter grammar.
</details>

<details>
<summary><strong>Q4.</strong> Why does the exit animation of a modal often want to be shorter than the entrance?</summary>

Entrances should feel assertive — they compete for the user's attention, and a slightly longer duration lets them land properly. Exits should feel polite — the user has already moved on, and a long exit animation makes the app feel sluggish. A common split is 300ms in, 200ms out.
</details>

<details>
<summary><strong>Q5.</strong> How do you respect reduced motion on a unidirectional transition?</summary>

Read `prefersReducedMotion.current` (from `svelte/motion`) into a `$derived` and feed the collapsed values into both the `in:` and `out:` parameter objects (`duration: reduced ? 0 : 300`, distance 0, etc.). The global CSS reset does not touch Svelte transitions.
</details>

## 6. Common mistakes

- **Putting `in:` and `transition:` on the same element.** Pick one or the other. Mixing them is a compile-time error because Svelte cannot decide which rule wins.
- **Expecting `out:` to run if the parent unmounts.** Like `transition:`, `in:`/`out:` default to local. Add `|global` if you need cross-block play.
- **Mid-flight pop because `in:` cannot reverse.** If the visual moves too far, the mid-toggle abort looks jarring. Either pick a less aggressive distance or switch back to bidirectional `transition:`.
- **Forgetting the exit direction should match the interaction.** A menu that flies down from the top should fade out, not fly back up — flying back up looks like the animation is being "undone" rather than finished.

## 7. What's next

Lesson 6.13 introduces `animate:flip`, which solves a totally different problem — animating elements as they *reorder* inside a list, without leaving or entering the DOM.
