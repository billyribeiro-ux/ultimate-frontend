---
module: 7
lesson: 7.4
title: GSAP Timelines — sequencing multiple animations
duration: 40 minutes
prerequisites:
  - Lesson 7.3 (gsap.to/from/fromTo)
learning_objectives:
  - Create a timeline with `gsap.timeline()` and add tweens to it with `.to()` / `.from()` / `.fromTo()`
  - Use the position parameter to control sequencing: absolute, relative, `"<"`, `">"`, `"-=0.2"`, `"+=0.5"`
  - Label positions inside a timeline with `.addLabel()` for readable sequencing
  - Play, pause, reverse, and seek a timeline
  - Respect reduced motion across an entire timeline with one check
status: ready
---

# Lesson 7.4 — GSAP Timelines — sequencing multiple animations

## 1. Concept — When one animation becomes five

`gsap.to`, `gsap.from`, and `gsap.fromTo` each run one animation on one target. As soon as you want two animations to coordinate — one starts when another ends, two run at the same time, a third waits 200ms after the second — plain `to` calls get out of hand. You start chaining setTimeouts; you start calculating start times by hand; you introduce bugs. The fix is GSAP's **timeline** object.

A **timeline** is a container for tweens that holds them on a shared clock. You add tweens with `.to`, `.from`, `.fromTo`, or `.set`, and the timeline decides when each one plays based on its position. The whole thing becomes a single playable object you can pause, reverse, seek, or tie to scroll position. It is the single feature that justifies GSAP existing.

### 1.1 Creating a timeline

```ts
import { gsap } from 'gsap';

const tl = gsap.timeline({ defaults: { duration: 0.6, ease: 'power2.out' } });

tl.from('.hero-title', { y: -40, opacity: 0 })
	.from('.hero-sub', { y: 20, opacity: 0 }, '-=0.4')
	.from('.hero-cta', { scale: 0.9, opacity: 0 }, '-=0.3');
```

Three things to notice:

- **`gsap.timeline({ defaults: … })`** sets defaults that every child tween inherits. You can still override per-tween.
- **Each `.from()` returns the timeline** (method chaining), so you can append as many tweens as you want.
- **The third argument** to each call is the **position parameter**. That is the whole point of timelines.

### 1.2 The position parameter

The third argument to any timeline method tells GSAP *when* to start that tween relative to the timeline's clock. Six forms:

- **Omitted** — appends the tween at the end of the previous one (sequential play).
- **A number** — absolute time in seconds from timeline start. `tl.to('.x', {...}, 2)` means "start at 2 seconds".
- **`"+=N"`** — N seconds *after* the end of the previous tween. Useful for gaps.
- **`"-=N"`** — N seconds *before* the end of the previous tween, so it overlaps. Most common in reveal sequences.
- **`"<"`** — at the start of the previous tween (run simultaneously).
- **`">"`** — at the end of the previous tween (same as omitted; explicit). You can also write `"<0.2"` to mean "0.2s after the previous tween started" or `">0.2"` for "0.2s after the previous tween ended".
- **A label** — any string you defined with `.addLabel('step1')`.

The `"-=0.4"` in the example above means "start 0.4 seconds before the previous tween ended". Because the previous tween had a duration of 0.6 seconds, the new tween starts at 0.2s into the previous one. That is how you get overlapping reveals that look like a single flowing sequence rather than a sequence of stops.

### 1.3 Labels for readability

A long timeline becomes unreadable quickly. Labels give you named positions you can reuse:

```ts
tl.addLabel('intro', 0)
	.from('.logo', { scale: 0 }, 'intro')
	.from('.headline', { y: 40, opacity: 0 }, 'intro+=0.3')
	.addLabel('reveal')
	.from('.cards', { y: 60, opacity: 0, stagger: 0.1 }, 'reveal')
	.addLabel('cta', '>0.2')
	.from('.cta-button', { scale: 0.8, opacity: 0 }, 'cta');
```

Labels let you restructure without recomputing offsets. They are also targets for `tl.seek('reveal')`, `tl.play('reveal')`, etc.

### 1.4 Controlling a timeline

A timeline is a full-featured playhead:

```ts
tl.pause();
tl.play();
tl.reverse();
tl.seek('reveal');
tl.timeScale(2);    // play at 2x speed
tl.progress(0.5);   // jump to 50%
```

You will use these in Module 7's project to wire scroll position to `tl.progress()`.

### 1.5 `gsap.timeline({ paused: true })`

By default a timeline auto-plays the moment it is created. Often you want it created on mount but played later — when a button is clicked, when the element enters viewport, when the user interacts. Create it paused:

```ts
const tl = gsap.timeline({ paused: true, defaults: { duration: 0.6 } });
tl.from('.a', { opacity: 0 }).from('.b', { y: 20 }, '-=0.3');

// later
button.addEventListener('click', () => tl.play());
```

### 1.6 Reduced motion at the timeline level

Wrap the whole timeline creation in a guard:

```ts
import { prefersReducedMotion } from 'svelte/motion';

const tl = gsap.timeline({ defaults: { duration: prefersReducedMotion.current ? 0 : 0.6 } });
```

Setting `duration` to 0 collapses every child tween to instant. One check, whole sequence accessible.





### The TypeScript angle

`gsap.timeline()` returns `gsap.core.Timeline` with typed access to `.play()`, `.reverse()`, `.seek()`, `.progress()`.

> **In production sidebar.** On a 100K-daily-user product launch page, refactoring 7 separate `gsap.from` calls with hand-computed delays into a timeline with relative positions reduced build time for new launch pages from 2 days to 4 hours.

### Common interview question

**Q: What is a GSAP timeline and how does the position parameter work?**

**Model answer:** A timeline is a container holding tweens on a shared clock. The position parameter (3rd argument) controls timing: `"-=0.3"` overlaps, `"+=0.5"` adds a gap, `"<"` starts simultaneously. Labels name positions for readability. The timeline is a playable object you can pause, reverse, seek, and scrub.

## Going Deeper

**Official documentation:**
- [GSAP docs: Timeline](https://gsap.com/docs/v3/GSAP/Timeline)
- [GSAP docs: Position parameter](https://gsap.com/docs/v3/GSAP/Timeline/position-parameter)
- [GSAP: Understanding timelines](https://gsap.com/resources/getting-started/timelines)

**Advanced pattern:** Build a hero timeline with 5 elements, a progress scrubber slider, and Play/Reverse/Replay buttons. Use labels for readability.

**Challenge question:** (Combines Lessons 7.4, 7.3, and 7.7) Build a multi-step onboarding animation with a timeline. Use `gsap.context` for cleanup. Add a "Skip" button that seeks to the end. Add a reduced-motion guard that collapses all durations to 0.

## Deep Dive

**Why this matters at scale.** Complex sequences justify GSAP's existence. A hero reveal needing 5 coordinated animations is unmaintainable with CSS @keyframes.

**The mental model.** A timeline is a music sequencer: each tween is a track, the playhead triggers each at its scheduled position. Position parameter controls timing relationships.

**Edge cases.** Keep nesting to 2 levels. Use labels for readable references. A timeline's duration includes all children — verify with tl.duration().

**Performance implications.** Timelines use one rAF callback instead of N. Past tweens stop calculating. For reversible animations, tl.reverse() replays correctly.

**Connection to other modules.** Module 7.3 introduced tweens. Module 7.8 adds stagger. Module 7.6 connects to Svelte reactivity. Module 8.11 uses timelines for page transitions.

## 2. Style it — A hero reveal with a teal-blue brand

The mini-build is a hero section with a teal-blue brand (`oklch(68% 0.14 230)`). The hero has a logo mark, a headline, a subheadline, a CTA button, and three feature cards below. A timeline choreographs all seven elements: logo pops in, then headline flies in, then subheadline fades in overlapping, then CTA scales in, then feature cards stagger in. "Replay" button restarts the timeline. Mobile-first.

## 3. Interact — Sequential reveals without a single `setTimeout`

The first draft of the mini-build uses three separate `gsap.from` calls with hand-computed `delay` values: 0, 0.5, 1.0. It works, but adding a fourth reveal means recomputing every delay. The refactor replaces it with a timeline — each reveal is appended in reading order, relative offsets use `"-=0.3"`, and adding a fourth reveal is one more chained `.from` with no recomputation.

## 4. Mini-build — The hero timeline

**File:** `src/routes/modules/07-gsap/04-timelines/+page.svelte`

The page has a hero with seven animated elements. On mount, a paused timeline is built; a "Play" button plays it, a "Reverse" button plays it backwards, a "Replay" button seeks to 0 and plays. A slider at the bottom lets the student scrub `tl.progress()` manually to feel the whole sequence.

### DevTools verification

1. Click Play. Watch all seven elements animate in with overlapping timing.
2. Drag the scrubber slider — the entire reveal plays forwards and backwards in sync with the slider, which proves the timeline is a single playable object.
3. Click Reverse mid-way — the animation smoothly unwinds to the start.
4. Enable reduced motion — the whole timeline becomes instant.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does the position parameter <code>"-=0.3"</code> mean?</summary>

Start the new tween 0.3 seconds *before* the previous tween ends, so the two overlap. Very common in reveal sequences to create flowing motion.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between <code>"<"</code> and <code>">"</code>?</summary>

`"<"` means "at the start of the previous tween" (simultaneous). `">"` means "at the end of the previous tween" (sequential — same as omitting the position entirely). You can add offsets: `"<0.2"` is 0.2s after the previous tween *started*.
</details>

<details>
<summary><strong>Q3.</strong> Why use labels inside a timeline?</summary>

Labels name positions in the sequence so you can reorganise the timeline without recomputing absolute offsets, and you can seek, play, or reverse to a named label directly (`tl.seek('reveal')`).
</details>

<details>
<summary><strong>Q4.</strong> How do you create a timeline that does not auto-play on creation?</summary>

Pass `{ paused: true }` in the options: `gsap.timeline({ paused: true })`. Call `.play()` when you are ready.
</details>

<details>
<summary><strong>Q5.</strong> How do you collapse an entire timeline for reduced-motion users with one check?</summary>

Set `defaults: { duration: 0 }` when creating the timeline if `prefersReducedMotion.current` is true. Every child tween inherits the zero duration.
</details>

## 6. Common mistakes

- **Computing offsets by hand.** Use relative position strings, not hard-coded start times.
- **Creating timelines inside handlers.** Create once on mount, play later. Creating on each click leaks tweens.
- **Forgetting `paused: true`.** If your timeline "runs before the page is ready", the cause is auto-play.
- **No reduced-motion guard.** A long timeline is exactly the kind of animation some users need you to collapse.

## 7. What's next

Lesson 7.5 shows the Svelte-idiomatic way to grab DOM element references — `bind:this` with a typed `HTMLElement` — so GSAP stops relying on class selectors.
