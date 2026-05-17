---
module: 6
lesson: 6.9
title: Per-page color personalities (scoped --color-* overrides)
duration: 45 minutes
prerequisites:
  - Lesson 6.1 (@layer)
  - Lesson 6.2 (OKLCH)
  - Lesson 6.3 (tokens)
learning_objectives:
  - Override a design token locally on a single route without using :global()
  - Explain how CSS custom properties cascade into nested components
  - Build a consistent site where every page has its own accent while sharing the rest of the design language
  - Combine per-page overrides with oklch(from ...) relative syntax for automatic shades
  - Avoid the trap of overriding brand tokens from inside a component
status: ready
---

# Lesson 6.9 — Per-page color personalities

## 1. Concept — Unity with character

### 1.1 The problem: eight pages that all look the same

Every real website has more than one page. If all the pages use the same single brand colour, the site feels monolithic — there is nothing to help the user remember where they are. If each page uses a wildly different palette, the site feels fragmented — there is no shared identity. The middle path is what good design systems call **page personalities**: a single shared language (type, spacing, motion, layout) with a per-page accent that gives each route a distinct visual fingerprint.

PE7 achieves this with a trick that students have been using all the way through the course without it being explained in full. It is time to name the trick.

### 1.2 The trick: override `--color-brand` on the root of the page

Svelte `<style>` blocks are scoped, but CSS custom properties defined inside them cascade to every element below — including child components, because custom properties inherit down through the DOM tree regardless of selector scoping. That is the loophole the technique relies on.

```svelte
<section class="page stack">
    ...
</section>

<style>
    section {
        --color-brand: oklch(70% 0.2 280);
    }
</style>
```

That single line overrides `--color-brand` for this `<section>` and every descendant. The button component inside still reads `var(--color-brand)`, but it now resolves to the new value. You did not touch the button's code. You did not add a prop. You did not use `:global()`. The cascade did the work.

### 1.3 Why it works without `:global()`

Svelte scopes class selectors by adding a hash, but **custom property declarations are not selectors** in the usual sense — they are values set on an element and inherited by its descendants. When the button reads `var(--color-brand)`, the browser walks up the DOM tree looking for the nearest ancestor that defines it. It finds the override on `<section>` before it reaches `:root`. The button gets the page's custom value.

Scoping hashes are irrelevant here because the child never touches the *class* that defined the property — it only reads the variable from the cascade.

### 1.4 What to override and what to leave alone

The convention in PE7 is:

- **Override `--color-brand`** — this is the page's accent. Every mini-build in the course does this, usually in one line.
- **Optionally override related tokens** — `--color-brand-dim`, perhaps custom page-only tokens like `--color-accent`.
- **Do not override `--color-text`, `--color-surface`, `--color-border`, or the motion/spacing/radii tokens.** Those are the shared language. Changing them per-page breaks the site's unity.

A well-themed page overrides one or two tokens, not twelve.

### 1.5 Deriving shades from the override

Because of OKLCH's relative colour syntax from Lesson 6.2, you get a full set of derived shades for free:

```css
section {
    --color-brand: oklch(68% 0.2 340);
}

.btn:hover {
    background: oklch(from var(--color-brand) calc(l - 0.08) c h);
}
```

Override `--color-brand` once and every derived colour (hover, focus ring, muted variant) automatically updates. This is the composition feature that makes the whole pattern scalable.

### 1.6 Three concrete examples

Three routes in this module demonstrate the pattern with different hues:

1. **Module 5 index** — `oklch(70% 0.2 330)` (hot pink). Event-focused pages feel energetic.
2. **Lesson 6.9 mini-build** — this page uses three side-by-side examples, each with its own override, so students can see the exact same card component repeated in three colours.
3. **Module 1 Lesson 1.1** — `oklch(68% 0.2 200)` (teal). Foundation pages feel cool and grounded.

Open the mini-build with DevTools and inspect `<section>` on each page. The only difference between them is the one line of custom-property override.



## Going Deeper

**Official documentation:**
- [Svelte docs: Styling](https://svelte.dev/docs/svelte/styling)
- [MDN: CSS custom properties inheritance](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [MDN: oklch() relative syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch)

**Advanced pattern:** Build a hue-slider component that updates `--color-brand` on a parent element in real time. Watch all child components (buttons, cards, links) update their accent colours without any prop changes.

**Challenge question:** (Combines Lessons 6.9, 6.2, and 6.3) Create three side-by-side cards, each inside a `<section>` with a different `--color-brand` override. Use `oklch(from ...)` to derive hover, focus, and muted variants from each override. Verify with a contrast checker that all text-on-brand combinations pass WCAG AA.

## 2. Style it — Three cards, three personalities

The mini-build renders the same card three times, each inside a `<section>` with its own `--color-brand` override. No other styles differ. Per-page colour cycles: `oklch(68% 0.2 20)`, `oklch(68% 0.2 160)`, `oklch(68% 0.2 280)`.

## 3. Interact — Sliders change the personality

Add a hue slider. Moving it updates `--color-brand` on one of the cards live. Students see the whole card theme shift — background gradients, button hover, borders, accents — from a single value change.

## 4. Mini-build — Three cards, three personalities

**File:** `src/routes/modules/06-styling/09-color-personalities/+page.svelte`

### DevTools verification

Inspect one of the cards. In the Styles panel, click the `section` selector and find `--color-brand: oklch(...)`. Change its value in DevTools. The whole card updates. This is the feedback loop designers dream of.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> How does a custom property defined in a scoped Svelte &lt;style&gt; reach a child component?</summary>

Custom properties inherit down the DOM tree. The child resolves `var(--color-brand)` by walking up to find the nearest ancestor that sets it — in this case the section in the parent route. Scoping hashes do not block the inheritance.
</details>

<details>
<summary><strong>Q2.</strong> Should you override <code>--color-text</code> per page?</summary>

No. Text, surface, and border tokens are part of the shared language. Overriding them per page breaks site unity.
</details>

<details>
<summary><strong>Q3.</strong> Why is <code>oklch(from var(--color-brand) calc(l - 0.08) c h)</code> useful in combination with per-page overrides?</summary>

Because a single override updates every derived shade. Hover states, focus rings, and muted variants all recompute from the new base without any extra code.
</details>

<details>
<summary><strong>Q4.</strong> Can a child component override its parent's <code>--color-brand</code>?</summary>

Yes — custom properties cascade through every level, and the nearest ancestor wins. A child can set its own `--color-brand` on itself or a descendant scope to override locally.
</details>

<details>
<summary><strong>Q5.</strong> When do you need <code>:global()</code> for this pattern?</summary>

Never. Custom property inheritance happens outside the scoping system, so `:global()` is not required.
</details>

## 6. Common mistakes

- **Overriding a dozen tokens per page.** Only `--color-brand` and maybe one or two related tokens. More is a redesign.
- **Using `:global()` out of habit.** Unnecessary and harmful — you lose scoping discipline.
- **Setting the override on the `<html>` or `<body>`.** That is global theming, not per-page. Put it on the page-level `<section>`.
- **Forgetting that child components read the override automatically.** Some students pass the colour as a prop, which is redundant and fragile.

## 7. What's next

Module 6 continues with the Svelte animation system in Lesson 6.10. This lesson closes the PE7 architecture deep dive — from here on, you have the full vocabulary to style anything this course will build.
