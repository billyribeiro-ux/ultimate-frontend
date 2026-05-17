---
module: 6
lesson: 6.15
title: svelte/motion — spring for physics-based motion
duration: 40 minutes
prerequisites:
  - Lesson 6.14 (Tween for value interpolation)
learning_objectives:
  - Explain the difference between a tween and a spring
  - Use the `Spring` class from `svelte/motion` (Svelte 5.8+)
  - Use the legacy `spring()` function and recognise it in older code
  - Tune `stiffness` and `damping` to achieve a chosen feel
  - Drive cursor-following and drag interactions with a spring
status: ready
---

# Lesson 6.15 — `svelte/motion` — `Spring` for physics-based motion

## 1. Concept — When duration is the wrong parameter

The Tween you met in Lesson 6.14 has one weakness: it is defined by **duration**. You tell it "take 400 milliseconds to go from 0 to 100", and no matter what the starting velocity is, the Tween always takes exactly 400 milliseconds. This is fine for things that move once per interaction — a progress bar filling, a counter ticking. But for things that move *continuously* and get new target values while already in motion — a cursor-follower, a dragged card, a value that reacts to another value — duration is the wrong parameter. The animation starts to feel robotic because every motion takes the same time regardless of how far it has to travel or how fast it was already moving when the target changed.

The fix is to describe motion the way the physical world does it: in terms of **force, mass, and damping**. A weight on a spring pulls towards its resting position with a force proportional to distance, and it loses energy to friction at a rate proportional to velocity. If the resting position moves while the weight is still swinging, the weight does not restart — it just adjusts its trajectory smoothly. That is how real things move, and it is what a good UI animation system gives you.

The `Spring` primitive in `svelte/motion` implements this. You wrap a value in a Spring, you set a target, and the spring simulates a physical mass moving towards the target with the stiffness and damping you configured. When the target changes mid-motion, the spring reacts naturally.

### 1.1 The Svelte 5.8+ class API — `Spring`

```ts
import { Spring } from 'svelte/motion';

const cursor = new Spring({ x: 0, y: 0 }, {
	stiffness: 0.1,
	damping: 0.4
});
```

Like `Tween`, `Spring` has:

- **`.target`** — the destination. Assign to move the mass.
- **`.current`** — the reactive current position, which the template reads.

Unlike `Tween`, there is no `duration`. The motion finishes when the mass has settled — its velocity drops below the `precision` threshold.

```svelte
<script lang="ts">
	import { Spring } from 'svelte/motion';

	const pos = new Spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.4 });

	function track(event: MouseEvent): void {
		pos.target = { x: event.clientX, y: event.clientY };
	}
</script>

<svelte:window onmousemove={track} />

<div
	class="dot"
	style:transform="translate({pos.current.x}px, {pos.current.y}px)"
></div>
```

### 1.2 The legacy function API — `spring()`

The older function form still exists and still works:

```ts
import { spring } from 'svelte/motion';

const pos = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.4 });

pos.set({ x: 100, y: 50 });
```

The returned value is a store; the template reads `$pos.x`, `$pos.y`. You will still see this form in older codebases. Prefer the `Spring` class for new code in April 2026.

### 1.3 Tuning stiffness and damping

Only two numbers define the feel of a spring, and both run from 0 to 1:

- **`stiffness`** — how strongly the mass is pulled towards its target. High stiffness (0.2+) feels snappy and aggressive; low stiffness (0.03) feels floaty and slow.
- **`damping`** — how quickly energy is lost to friction. High damping (0.8+) removes oscillation and feels critically damped; low damping (0.2) bounces for a long time.

A handful of presets will cover 95% of what you need:

| Preset        | Stiffness | Damping | Feel                                                       |
|---------------|-----------|---------|------------------------------------------------------------|
| Gentle        | 0.05      | 0.5     | Slow, luxurious, for hero graphics                         |
| Default       | 0.15      | 0.8     | Quick and critically damped, no visible bounce              |
| Wobbly        | 0.1       | 0.2     | Playful bounce, for delightful micro-interactions          |
| Stiff         | 0.3       | 0.9     | Instantaneous-feeling snap, for menus and toggles          |

Start from a preset and adjust. Do not try to tune stiffness and damping from a blank slate — it is a frustrating exercise that usually ends in a spring that feels "off" and you cannot say why.

### 1.4 When to use spring vs tween

- **Tween** — one-off animations with a specific duration. Progress bars, counters, fade-ins.
- **Spring** — anything that can receive a new target mid-motion. Cursor followers, drag handles, physics-y UI that needs to feel alive.

If in doubt: if the user can move the target while it is already moving, use a spring.

### 1.5 Reduced motion

Set `instant: true` in the update options, or set stiffness to 1 and damping to 1 for instant settling. A clean pattern:

```ts
async function move(x: number, y: number): Promise<void> {
	await pos.set({ x, y }, { instant: prefersReducedMotion.current });
}
```



## Going Deeper

**Official documentation:**
- [Svelte docs: Spring](https://svelte.dev/docs/svelte/svelte-motion#Spring)
- [Svelte docs: svelte/motion](https://svelte.dev/docs/svelte/svelte-motion)
- [Svelte tutorial: Springs](https://svelte.dev/tutorial/svelte/springs)

**Advanced pattern:** Build a spring-driven cursor follower with live stiffness/damping sliders. Display the spring's current velocity to show the physics in action.

**Challenge question:** (Combines Lessons 6.15, 6.14, and 5.9) Build a "drag and spring" component: the user drags a card with pointer events (Lesson 5.9), and on release the card springs back to its origin. Use `Spring` for the return animation and `Tween` for a progress bar showing drag distance. Type the pointer event handlers correctly.

## 2. Style it — A cursor follower with a pink brand

The mini-build is a pink brand page (`oklch(72% 0.2 350)`) with a soft circular cursor follower. The dot chases the mouse with a spring tuned to feel alive but critically damped. On touch devices (no hover capable), a draggable card demonstrates the spring following touch position. Hit targets are 44px.

## 3. Interact — Why a tween chases badly

The first draft uses `Tween` to follow the cursor. It looks terrible: every mouse move restarts a 300ms tween, so the dot stutters and lags behind every time you change direction. The fix is `Spring` — setting a new target mid-motion is a first-class operation, and the spring smoothly re-aims without restarting its clock.

## 4. Mini-build — A spring-driven cursor follower

**File:** `src/routes/modules/06-styling/15-spring/+page.svelte`

The page tracks mouse position via `onmousemove` on `<svelte:window>` and writes it to `spring.target`. A styled circle renders at `spring.current` via a `transform: translate(…)` inline style. Two sliders let the student tune stiffness and damping live to feel the difference. A reduced-motion checkbox (or the OS preference) collapses the spring to instant.

### DevTools verification

1. Move your cursor slowly; the dot tracks smoothly.
2. Whip the cursor left and right. With low damping the dot overshoots and wobbles. Raise damping with the slider and the overshoot disappears.
3. Open DevTools → **Performance**, record a few seconds of tracking. The spring samples ~60 times per second, each sample updates a CSS transform — compositor-only work, zero layout.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the main reason to prefer a spring over a tween for a cursor-follower?</summary>

Cursor-followers receive new target values continuously. A tween restarts from scratch every time its target changes, which produces stuttering and lag. A spring adjusts its trajectory smoothly from whatever velocity it already had.
</details>

<details>
<summary><strong>Q2.</strong> What do <code>stiffness</code> and <code>damping</code> control?</summary>

`stiffness` is how strongly the spring pulls towards the target (higher = faster, snappier). `damping` is how quickly oscillation dies out (higher = fewer bounces). Both run 0 to 1.
</details>

<details>
<summary><strong>Q3.</strong> How do you get a spring to settle instantly without removing it from your component?</summary>

Pass `{ instant: true }` to `.set()`, or set stiffness and damping both to 1. The `instant` option in the update options is the preferred path for reduced motion because it keeps the Spring wrapper intact for later calls.
</details>

<details>
<summary><strong>Q4.</strong> Is the legacy <code>spring()</code> function still supported in April 2026?</summary>

Yes. It is marked deprecated in favour of the `Spring` class (5.8+) but still exported and still works. Prefer `Spring` for new code; recognise `spring()` in older code.
</details>

<details>
<summary><strong>Q5.</strong> Why should spring values flow into <code>transform</code> rather than <code>top</code>/<code>left</code>?</summary>

Transform is composited; top/left are layout. A spring re-renders ~60 times per second, so an expensive layout property would cause jank. Transform stays on the compositor and remains smooth even on mid-range devices.
</details>

## 6. Common mistakes

- **Tuning from scratch.** Start from a preset; adjust by small increments.
- **Using spring for a finite animation with a known duration.** That is what Tween is for. Spring has no duration concept.
- **Ignoring reduced motion.** A physical follower feels magical until it doesn't — some users find it distracting or nauseating. Respect `prefersReducedMotion.current`.
- **Writing to `.current`.** Like Tween, `current` is a read-only reactive getter. Always write to `.target`.

## 7. What's next

Lesson 6.16 shows how to build your own custom transition function — the `css(t)` and `tick(t)` pattern used by the built-in transitions you have been consuming.
