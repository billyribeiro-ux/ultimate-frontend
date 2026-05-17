---
module: 6
lesson: 6.10
title: CSS transitions with motion tokens
duration: 40 minutes
prerequisites:
  - Lesson 6.3 (design token system — spacing, typography, motion, radii, shadows)
  - Lesson 6.4 (native CSS nesting)
  - Lesson 6.9 (per-page color personalities)
learning_objectives:
  - Explain the difference between a CSS transition and a Svelte transition
  - Apply the PE7 `--dur-*` and `--ease-*` motion tokens to real components
  - Pick an easing curve that matches the personality of an interaction
  - Respect `prefers-reduced-motion: reduce` in every transition you write
  - Debug a stuck transition by inspecting the computed style in DevTools
status: ready
---

# Lesson 6.10 — CSS transitions with motion tokens

## 1. Concept — Motion is a design system, not a decoration

Most beginners think of animation as a garnish: add a little fade here, a bounce there, make the page feel alive. That idea is wrong, and it is the reason so many websites look busy and amateurish. In a serious design system, **motion is a language with vocabulary, grammar, and a dictionary** — exactly like color and typography. The dictionary is called a *motion token set*. PE7 defines that dictionary in `src/app.css` with two families of tokens:

- **Durations** — `--dur-instant` (100ms), `--dur-fast` (200ms), `--dur-base` (300ms), `--dur-slow` (500ms), `--dur-slower` (800ms).
- **Easings** — `--ease-out`, `--ease-in`, `--ease-in-out`, `--ease-expressive`, `--ease-spring`.

Every animated interaction in this course pulls from those two lists. Like colors, motion tokens live in exactly one file. If we later decide that everything is too fast, we change one value and the whole app breathes differently.

### 1.1 What a CSS transition actually is

A **CSS transition** is the simplest possible animation the browser knows how to do. You tell it: "when this property changes, do not jump; interpolate from the old value to the new value over *N* milliseconds using *E* easing curve". You never write the intermediate frames yourself — the browser does, on the compositor thread, off the main thread, which means it can run at 60 or 120 frames per second even while JavaScript is busy.

The grammar is three words: `transition-property`, `transition-duration`, `transition-timing-function`. Most of the time you use the shorthand:

```css
transition: transform var(--dur-base) var(--ease-out);
```

Read that out loud: *"transition the `transform` property over base duration using ease-out"*. Every transition you write in this course follows that pattern — never a raw `300ms`, never a raw `cubic-bezier(…)`. If a new animation doesn't fit one of the five durations, that is a design-system decision that deserves a conversation, not a one-off magic number.

### 1.2 Which easing curve means what

The five PE7 easings are not interchangeable. Each one carries a meaning:

- **`--ease-out`** — fastest start, gentle finish. Use for things *entering* the user's attention: modal open, tooltip reveal, hover highlight. It feels responsive because the motion starts immediately.
- **`--ease-in`** — gentle start, fast finish. Use for things *leaving*: modal close, toast dismiss. The viewer's eye is already preparing to move on, so accelerating at the end feels right.
- **`--ease-in-out`** — symmetric. Use for transitions between two equally important states: a tab switch, an accordion panel, a theme toggle.
- **`--ease-expressive`** — slight overshoot then settle. Use sparingly for delightful micro-interactions: a button press, a heart icon on "like". If you use it everywhere your app feels silly.
- **`--ease-spring`** — stronger overshoot, physics-like bounce. For playful moments only. Never use it on something the user sees a hundred times a day.

Picking the right easing is 80% of the difference between "feels professional" and "feels amateur". A modal that opens with `ease-out` feels crisp; the same modal with `ease-in-out` feels sluggish; with `linear` it feels mechanical.

### 1.3 What you can and cannot transition

Not every CSS property can be transitioned efficiently. Two properties are essentially free on the GPU: `transform` and `opacity`. Everything else — `width`, `height`, `top`, `left`, `background-color`, `box-shadow`, `filter` — costs the main thread real work and can make animations janky on mid-range phones. The rule for this course: **animate `transform` and `opacity` first, and only reach for other properties when there is no alternative**.

For example, a card that "lifts" on hover looks like it is getting bigger, but you should not animate `width` and `height`. You animate `transform: translateY(-4px) scale(1.02)` instead. The visual result is nearly identical and the frame budget is a fraction of the cost.

### 1.4 CSS transition vs Svelte transition

Throughout this lesson we are talking about *CSS transitions* — the `transition:` CSS property. That is different from *Svelte transitions* — the `transition:` directive you will meet in Lesson 6.11. Both exist, both are useful, and they solve different problems:

- **CSS transition** — runs when a CSS property changes on an element that stays in the DOM (hover, focus, class toggle). Pure CSS, no JavaScript.
- **Svelte transition** — runs when an element enters or leaves the DOM (`{#if}`, `{#each}` changes). Requires Svelte because the element must exist briefly while it animates away.

You will use CSS transitions for the majority of micro-interactions in a real app. Svelte transitions come out for specific DOM mount/unmount moments.

### 1.5 Reduced motion is not optional

Some of your users have vestibular disorders. Some have ADHD and find motion distracting. Some are on older hardware where animation stutters. All of them can tell their operating system to *prefer reduced motion*, and the browser will tell your CSS. PE7's global reset already collapses every transition to essentially zero when that preference is set:

```css
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		transition-duration: 0.01ms !important;
	}
}
```

That safety net means you are allowed to write expressive animations in your components without worrying about accessibility. Still, we recommend you test your app with the preference enabled at least once per feature — on macOS it is **System Settings → Accessibility → Display → Reduce motion**; on Windows it is **Settings → Accessibility → Visual effects → Animation effects**.





### The TypeScript angle

Mirror CSS motion tokens in TypeScript for JS animation libraries: `export const DUR = { instant: 100, fast: 200, base: 300 } as const;`

### Comparison: animation mechanisms

| Mechanism | Trigger | Composited? | JS required? | Mount/unmount? |
|-----------|---------|-------------|-------------|----------------|
| CSS `transition` | Property change | Yes (transform/opacity) | No | No |
| Svelte `transition:` | DOM enter/leave | Yes | Minimal | Yes |
| GSAP | Code call | Yes | Yes | No |
| Tween/Spring | Target change | N/A | Yes | No |

> **In production sidebar.** On a 100K-daily-user banking app, switching from `transition: all 0.3s ease` to explicit property lists eliminated an accidental background-colour animation causing 4ms paint per hover on low-end Android.

### Common interview question

**Q: Why should you transition `transform` and `opacity` instead of `width` or `height`?**

**Model answer:** `transform` and `opacity` are composited on the GPU without triggering layout or paint. Properties like `width` and `height` force layout recalculation on every frame, causing jank on mid-range mobile devices.

## Going Deeper

**Official documentation:**
- [MDN: CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions)
- [MDN: CSS animation performance](https://developer.mozilla.org/en-US/docs/Web/Performance/CSS_JavaScript_animation_performance)
- [web.dev: Animations guide](https://web.dev/articles/animations-guide)

**Advanced pattern:** Create a "transition playground" with 4 cards, each using a different easing token. Add labels showing the easing name and a description of when to use it.

**Challenge question:** (Combines Lessons 6.10, 6.3, and 6.4) Build an interactive card that uses CSS transitions for hover/focus states, with all durations and easings from PE7 tokens. Nest the hover, focus-visible, and active states inside a single CSS rule. Verify with DevTools Paint Flashing that hover triggers no paint (only composite).

## Deep Dive

**Why this matters at scale.** CSS transitions are the cheapest animation — no JavaScript, no library, no runtime cost. In a design system with 50 interactive components, replacing JS hover effects with CSS transitions eliminates hundreds of event listeners.

**The mental model.** A CSS transition declares intent: when this property changes, interpolate it over time. The browser handles interpolation on the compositor thread. You declare what to animate, duration, timing function, and delay. The trigger is any state change.

**Edge cases.** Not all properties are animatable. display cannot transition. transition: all is dangerous — it animates unintended properties, causing jank on layout properties. Always list specific properties.

**Performance implications.** Transitions on transform and opacity run on the GPU and never trigger layout. Transitions on width, height, or margin trigger reflow every frame. Use transform: scale() instead of width/height for size animations.

**Connection to other modules.** Module 6.3's motion tokens are consumed here. Module 7 adds GSAP for cases CSS cannot handle. Module 12 verifies transitions do not cause layout thrashing. Module 6.18 teaches prefers-reduced-motion overrides.

## 2. Style it — PE7 tokens driving every transition

The mini-build is a row of three interactive cards. Every hover, focus, and press uses only `--dur-*` and `--ease-*` tokens. We assign each card a different easing so you can feel the difference side by side. A per-page brand hue (`oklch(70% 0.2 40)` — a warm amber) is pushed via a single `--color-brand` override in the scoped `<style>`.

Mobile-first: on narrow screens the cards stack in a single column; at `min-width: 480px` they sit in a three-column grid. Touch targets are 44px minimum, enforced with `min-block-size: 2.75rem` on the card's interactive surface.

## 3. Interact — Hover is a state change, not an event

A beginner's instinct is to reach for JavaScript any time something reacts to the cursor. They write `onmouseenter` and `onmouseleave` handlers, flip a `$state` boolean, and update a class. That works, but it is wasteful and it runs on the main thread. The truth is that a CSS **pseudo-class** — `:hover`, `:focus-visible`, `:active` — is a state change the browser tracks *for free*. Combined with a `transition`, you get animated hover feedback without a single line of JavaScript.

The mistake we show first is the JavaScript version: a handler flipping `hovered = true`, a `class:lifted={hovered}` binding, a `transform` in the class. It runs, but it is unnecessary overhead and it loses keyboard focus styling for free. The fix is to delete the handler and the state, and let CSS do what CSS was born to do.

## 4. Mini-build — Three cards, three easings, zero JavaScript state

**File:** `src/routes/modules/06-styling/10-css-transitions/+page.svelte`

The page renders three cards. Each has a title, a short description, and a "View details" link. All three cards share the same `--dur-base` duration; each card uses a different easing token so you can compare them. The cards respond to hover with a small lift (`translateY(-4px)`) and a soft shadow. When focused with keyboard, the same animation runs. When pressed, they settle back.

### DevTools verification

1. Open DevTools → **Elements**.
2. Hover the first card and watch the `transform` property in the **Computed** pane change smoothly from `none` to `translateY(-4px)`.
3. Open DevTools → **Rendering** and enable **Paint flashing**. Hover a card — you should see *no* green rectangle on the card, because `transform` and `opacity` are composited, not painted.
4. Open DevTools → **Command menu** (`Ctrl/Cmd + Shift + P`) and run *Emulate CSS media feature prefers-reduced-motion: reduce*. Hover a card again — it still changes color but no longer lifts.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why do we transition <code>transform</code> and <code>opacity</code> instead of <code>width</code>, <code>height</code>, or <code>top</code>?</summary>

`transform` and `opacity` are composited properties — the browser can animate them on the GPU compositor thread without re-laying out or re-painting the element. `width`, `height`, `top` force a layout recalculation on every frame, which is expensive and causes jank on mid-range mobile devices.
</details>

<details>
<summary><strong>Q2.</strong> When should you use <code>--ease-out</code> vs <code>--ease-in</code>?</summary>

`--ease-out` for things entering the user's attention (modal open, tooltip reveal) because the fast start makes the app feel responsive. `--ease-in` for things leaving (modal close, toast dismiss) because the eye is already moving on. Using them backwards makes the app feel sluggish.
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between a CSS transition and a Svelte transition?</summary>

A CSS transition runs when a property on a persistent DOM element changes (for example, hover state). A Svelte transition runs when an element enters or leaves the DOM because of an `{#if}` or `{#each}` block. You use CSS transitions for micro-interactions and Svelte transitions for DOM mount/unmount animations.
</details>

<details>
<summary><strong>Q4.</strong> Why should every duration and easing in your components come from a token instead of a raw value?</summary>

Tokens give the whole app one rhythm. If everything uses `var(--dur-base)` and you later decide to speed the app up by 10%, you change one value in `app.css` and every animation adapts. Raw values scatter the design decision across hundreds of files and make consistency impossible.
</details>

<details>
<summary><strong>Q5.</strong> Do you still have to write <code>@media (prefers-reduced-motion: reduce)</code> in every component if PE7 has a global safety net?</summary>

For simple CSS transitions, the global safety net in `app.css` is usually enough. For large or destabilising animations (hero parallax, big spatial moves, looping effects) you should write an explicit per-component rule that removes or replaces the motion, because the global rule only shortens duration to 0.01ms — it does not change the visual choreography.
</details>

## 6. Common mistakes

- **Raw numbers in `transition:`.** Writing `transition: transform 300ms ease-out` looks identical to the student but breaks the token contract. Always use `var(--dur-base) var(--ease-out)`.
- **Transitioning `all`.** `transition: all var(--dur-base) var(--ease-out)` silently animates properties you did not intend to animate (like `color` or `background-image`), often with ugly results. Always list the properties explicitly.
- **Forgetting `:focus-visible`.** Keyboard users never trigger `:hover`. Every hover animation should duplicate onto `:focus-visible` so keyboard navigation has the same visual feedback.
- **Animating something that causes layout.** Animating `height` or `top` feels fine on a MacBook and melts on a mid-range Android phone. Always reach for `transform` first.

## 7. What's next

Lesson 6.11 introduces Svelte's built-in `transition:` directive — `fade`, `fly`, `slide`, `scale`, `blur`, `draw` — for animating elements as they enter and leave the DOM.
