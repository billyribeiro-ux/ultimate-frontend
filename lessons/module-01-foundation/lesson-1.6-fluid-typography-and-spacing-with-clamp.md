---
module: 1
lesson: 1.6
title: Fluid typography and spacing with clamp()
duration: 40 minutes
prerequisites:
  - Lesson 1.5 — PE7 tokens and mobile-first baseline
learning_objectives:
  - Explain the three arguments of CSS clamp() in plain English
  - Convert a set of desktop and mobile breakpoint values into a single clamp() call
  - Identify why a fluid scale outperforms breakpoint jumps for typography
  - Read PE7's fluid token table and know which token to reach for
  - Diagnose a "text too small on mobile, too big on desktop" problem
status: ready
---

# Lesson 1.6 — Fluid typography and spacing with clamp()

## 1. Concept — A single value that grows with the viewport

### 1.1 The problem: text and spacing snap instead of flowing

Here is a familiar pain. You design a heading at 48px for desktop. On mobile it overflows, so you add a media query that sets it to 32px below 768px. Looks fine at 320px and 1440px. Then you open DevTools at 600px and the heading looks weirdly small — there is a lot of empty space around it because the 32px size was chosen for much narrower screens. You add another breakpoint at 600px with 40px. Still not quite right at 900px. You add another. Before long your stylesheet has five heading sizes across five media queries and the design still looks "stepped" as the window resizes, as if the heading is teleporting between sizes rather than breathing with the screen.

This is a legitimate real problem and it has a well-known name: **stepwise scaling**. The fix is to stop picking discrete sizes and instead describe a continuous range. Let the heading start at, say, 2rem on a narrow phone and smoothly grow to 5rem on a wide monitor, interpolating through every value in between. There are no media queries at all. There are no stepped jumps. One CSS declaration covers every width.

The CSS function that makes this possible is `clamp()`.

### 1.2 How `clamp()` works

`clamp(min, preferred, max)` returns a value constrained between `min` and `max`. If the `preferred` value falls inside the `[min, max]` range, you get `preferred`. If `preferred` is below `min`, you get `min`. If it is above `max`, you get `max`. The magic is in how `preferred` is defined: it is usually a viewport-relative unit, so it grows as the screen grows.

Consider this PE7 token:

```css
--text-2xl: clamp(2rem, 5vw, 3rem);
```

Read it in three beats:

- **Minimum**: 2rem. No matter how narrow the screen, this size will never drop below 32px.
- **Preferred**: 5vw, which means "5% of the viewport width". At 320px wide, 5vw = 16px (loses to the 2rem minimum, so you get 2rem). At 800px, 5vw = 40px. At 1600px, 5vw = 80px (loses to the 3rem maximum, so you get 3rem).
- **Maximum**: 3rem. No matter how wide the screen, this size will never exceed 48px.

As you drag the window from 320px to 2560px, the heading smoothly grows from 2rem to 3rem, with no steps and no media queries. One line of CSS replaces five breakpoints.

### 1.3 Reading PE7's fluid scales

Look at `src/app.css` lines 33–47. Every `--text-*` and `--space-*` token is a `clamp()`:

```css
--text-xs:   clamp(0.75rem,  1.5vw, 0.875rem);
--text-sm:   clamp(0.875rem, 2vw,   1rem);
--text-base: clamp(1rem,     2.5vw, 1.125rem);
--text-lg:   clamp(1.125rem, 3vw,   1.5rem);
--text-xl:   clamp(1.5rem,   4vw,   2rem);
--text-2xl:  clamp(2rem,     5vw,   3rem);
--text-hero: clamp(2.5rem,   8vw,   5rem);
```

Every line follows the same pattern: a small minimum for phones, a viewport-width preferred value, and a larger maximum for big screens. The seven tokens form a complete typographic scale — you pick the one that matches the role of the text (`--text-sm` for muted captions, `--text-base` for body copy, `--text-2xl` for section headings, `--text-hero` for marketing hero text) and PE7 handles the fluid behaviour automatically.

The spacing scale works the same way. `--space-md` is `clamp(1rem, 3vw, 1.5rem)`. Padding on a card uses one token, and the padding breathes as the window resizes. You will almost never need a raw `rem` value in a component style.

### 1.4 Why fluid beats stepped, beyond aesthetics

Three concrete reasons:

1. **Less code.** No media queries for type or spacing means fewer lines, fewer bugs, fewer forgotten overrides.
2. **Better readability on in-between sizes.** A 900px laptop is in the "dead zone" between most breakpoint grids. Fluid scaling means that zone is covered automatically.
3. **Accessibility-friendly.** Users can zoom their browser or increase their root font size. Because PE7's tokens use `rem` for their minima and maxima, they scale with the user's preferences. Hard-coded `px` sizes do not.

### 1.5 When you still need a media query

Fluid tokens solve *sizing*. They do not solve *layout* — the decision of whether a grid has one column or three. That still wants a media query, because the layout change is categorical, not continuous. You will still write:

```css
.grid {
    grid-template-columns: 1fr;
    @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

The difference is that you no longer need media queries for `font-size` and `padding`. Those are now handled by `clamp()`. Your media queries shrink to layout-only and become much easier to read.

### 1.6 What "vw" means, carefully

`1vw` = 1% of the *viewport width*. On a 400px phone, 1vw = 4px. On a 1600px monitor, 1vw = 16px. This is a live value: as you resize the window, it updates instantly. That is why `clamp(..., 5vw, ...)` produces a smooth fluid effect — the preferred value recalculates on every paint.

`vh` (viewport height), `vmin` (smaller dimension), `vmax` (larger dimension), and `svh`/`dvh`/`lvh` (small, dynamic, large heights for mobile browsers) are related units you will meet in Module 6. For today, `vw` is the only one you need.

## 2. Style it — Fluid type in practice

The mini-build renders three heading sizes — `--text-lg`, `--text-2xl`, `--text-hero` — so you can resize the browser and watch them breathe. Below them, a card uses `--space-lg` for padding and a border-radius from `--radius-lg`, both of which are fluid. Mobile baseline is stacked; `min-width: 480px` switches to a two-column side-by-side demo.

## 3. Interact — A function that turns a design spec into a clamp()

The mistake: you are given a spec that says "heading is 32px at 360px wide and 72px at 1440px wide" and you try to hand-tune a `clamp()`:

```css
font-size: clamp(2rem, 6vw, 4.5rem);
```

That *approximately* matches, but at 1000px the heading is 60px when the spec says it should be closer to 53px. The manual interpolation is off.

The fix is to use the linear interpolation formula. A TypeScript helper on the page computes the exact `vw` coefficient so the `clamp()` passes through both endpoints:

```ts
function fluidClamp(
    minPx: number,
    maxPx: number,
    minViewportPx: number,
    maxViewportPx: number
): string {
    const slope = (maxPx - minPx) / (maxViewportPx - minViewportPx);
    const intercept = minPx - slope * minViewportPx;
    const preferredVw = (slope * 100).toFixed(3);
    const interceptRem = (intercept / 16).toFixed(3);
    return `clamp(${(minPx / 16).toFixed(3)}rem, calc(${interceptRem}rem + ${preferredVw}vw), ${(maxPx / 16).toFixed(3)}rem)`;
}
```

You pass the spec numbers in; you get a `clamp()` string out. Apply it via a `style:font-size` directive and the heading sizes match the spec exactly at every width. The function is a few lines of arithmetic, but it demonstrates the real power of keeping your clamp values typed and computed instead of hand-written.

## 4. Mini-build — A fluid typography demo with a live-computed clamp()

**File:** `src/routes/modules/01-foundation/06-fluid-clamp/+page.svelte`

The page shows three headings at `--text-lg`, `--text-2xl`, `--text-hero`. Resize the browser and watch them grow and shrink. Below them, a custom heading uses a computed `clamp()` from the `fluidClamp()` TypeScript helper.

### DevTools verification

1. Open DevTools → Elements.
2. Click the top heading and check its computed `font-size`. It will be a non-round number like `27.4px`.
3. Drag the DevTools pane to resize the viewport and watch the computed value change in real time.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Read <code>clamp(1rem, 3vw, 1.5rem)</code> in plain English.</summary>

The value is 3% of the viewport width, but never less than 1rem and never more than 1.5rem. At narrow widths it snaps to the 1rem floor; at wide widths it snaps to the 1.5rem ceiling; in between it grows linearly with the screen.
</details>

<details>
<summary><strong>Q2.</strong> Why does PE7 prefer fluid tokens to a sequence of breakpoint overrides for font sizes?</summary>

Fewer lines of CSS, smoother behaviour at every width (no stepped jumps), and better support for in-between viewports like 900px laptops that normally fall into design dead zones.
</details>

<details>
<summary><strong>Q3.</strong> Do fluid tokens eliminate the need for <code>@media</code> queries entirely?</summary>

No. They replace media queries for <em>sizing</em> (font size, padding, gap) but you still need media queries for <em>layout</em> — decisions like "one column on mobile, three on desktop" that are categorical changes rather than continuous scaling.
</details>

<details>
<summary><strong>Q4.</strong> Why does PE7 use <code>rem</code> for the minimum and maximum of each clamp instead of <code>px</code>?</summary>

`rem` scales with the user's root font size. If a user increases their browser's default font size for accessibility, `rem`-based values respect that preference. Hard-coded `px` values do not.
</details>

<details>
<summary><strong>Q5.</strong> What does the <code>vw</code> unit mean, exactly?</summary>

One percent of the viewport width. On a 1000px-wide viewport, `1vw = 10px`. It recomputes live as the window resizes.
</details>

## 6. Common mistakes

- **Using `vw` without clamping.** `font-size: 5vw` looks fine on a laptop and is illegibly small on a phone. Always wrap viewport units in `clamp()` with sensible minima and maxima.
- **Mixing units inside `clamp()` carelessly.** `clamp(16px, 3vw, 2rem)` is legal but confusing; stick to `rem` for the min/max and a viewport unit (possibly inside `calc()`) for the preferred.
- **Hand-guessing the preferred coefficient.** If you have two specific points the heading should hit, use the linear formula (or a helper function) rather than squinting and tweaking.
- **Forgetting that the user can zoom.** Test your fluid tokens at 200% browser zoom. If the text explodes off the screen, your max is too high.

## 7. What's next

Lesson 1.7 explains how Svelte guarantees that the CSS in this lesson's mini-build cannot leak into any other page — the mechanism behind scoped styles.
