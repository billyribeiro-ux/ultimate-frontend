---
module: 6
lesson: 6.3
title: Design token system in depth — spacing, typography, motion, radii, shadows
duration: 50 minutes
prerequisites:
  - Lesson 6.1 (@layer)
  - Lesson 6.2 (OKLCH)
learning_objectives:
  - Define what a design token is and explain why tokens beat raw values
  - List every category of token in PE7 and the naming pattern inside each
  - Use clamp() to define fluid tokens that scale with viewport width
  - Compose tokens — use a colour token inside a shadow token, etc
  - Extend the token system without breaking existing components
status: ready
---

# Lesson 6.3 — The design token system in depth

## 1. Concept — Variables are not enough; tokens are a contract

### 1.1 The problem: magic numbers everywhere

Open a typical CSS file from an unmanaged project and you will see `padding: 16px;` on one element, `padding: 1rem;` on another, and `padding: 18px;` on a third. Three different authors made three different choices for "a bit of space". When the designer later says "make everything a little tighter", there is no single place to change. You grep the codebase, miss a few, and the design drifts.

A **design token** is a named value that captures a design decision. Instead of `padding: 16px`, you write `padding: var(--space-md)`. The name says what the value means in the design language ("medium space") rather than how it is implemented. When the designer says "tighter", you change the definition of `--space-md` in one place and the whole app updates.

Tokens are not just variables. They are a **contract** between design and engineering: a promise that every "medium space" in the app is the same space, and that the design system owns what "medium" means.

### 1.2 The PE7 token categories

PE7 defines six categories, each with a consistent naming pattern:

1. **Colour** — `--color-brand`, `--color-surface`, `--color-text-muted`, `--color-error`, etc. Every colour in OKLCH. See Lesson 6.2.
2. **Spacing** — `--space-xs` to `--space-2xl`. Fluid clamps that scale with viewport.
3. **Typography** — `--text-xs` to `--text-hero`. Fluid font sizes, also clamps.
4. **Motion** — `--dur-instant` to `--dur-slower` and `--ease-out`, `--ease-in`, `--ease-spring`, etc.
5. **Radii** — `--radius-sm` to `--radius-full`. Non-fluid; borders don't need to scale.
6. **Shadows** — `--shadow-sm`, `--shadow-md`, `--shadow-lg`. Defined with OKLCH alpha for consistency across light and dark backgrounds.

Plus two layout constraints: `--content-max` (the full page width cap) and `--prose-max` (the readable text column width).

### 1.3 Fluid tokens with `clamp()`

Half of PE7's spacing and all of its typography uses `clamp(min, preferred, max)`. `clamp` returns `preferred` as long as it sits between `min` and `max`; otherwise it returns whichever boundary is closest. The `preferred` value is almost always a `vw`-based expression, so it scales with viewport width.

```css
--space-md: clamp(1rem, 3vw, 1.5rem);
--text-lg: clamp(1.125rem, 3vw, 1.5rem);
```

Read that as: on a small phone `--space-md` is 1rem (16 px). At around 1024px viewport, `3vw` (~30 px) dominates and nudges up. On a huge monitor it caps at 1.5rem (24 px). You never write a media query for these values — the browser handles the scaling automatically. The result is type and spacing that breathe smoothly from phone to desktop without discrete breakpoints.

### 1.4 Composing tokens

Tokens reference other tokens. This is the superpower that makes the system maintainable:

```css
--shadow-md: 0 4px 12px oklch(0% 0 0 / 0.1);

.btn {
    background: var(--color-brand);
    color: oklch(from var(--color-brand) 15% 0.02 h);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    transition: background var(--dur-fast) var(--ease-out);
}
```

Every value is a token or derived from a token. Change `--color-brand` and the button's text colour, background, and hover state all follow. Change `--dur-fast` and every button in the app animates at the new speed.

### 1.5 Naming discipline

Three rules for token names:

1. **Semantic, not literal.** `--color-error`, not `--color-red`. If you later decide errors should be orange, `--color-error` still makes sense; `--color-red` would lie.
2. **Hierarchical with dashes.** `--color-text-muted` follows `category-purpose-variant`. This gives your IDE's autocomplete useful grouping.
3. **T-shirt sizes for scales.** `xs`, `sm`, `md`, `lg`, `xl`, `2xl`. Easier to compare than numeric scales (`size-12` vs `size-16`).

### 1.6 Extending the system without destroying it

Two rules:

- **Add, don't remove.** If a new component needs `--space-3xl`, add it. Removing `--space-md` breaks every component that uses it.
- **Prefer composition over new tokens.** If a component needs "medium space plus a little extra", use `calc(var(--space-md) + var(--space-xs))` before adding a new token. Only promote to a real token if three or more components need the same value.

## 2. Style it — The token showcase

The mini-build is a single page that demonstrates every token category with a live example. Colour swatches, spacing bars, type scale, motion samples (tiny animated dots), radii samples, and shadow samples.

## 3. Interact — Toggle a token override

Add a button that toggles a `data-compact` attribute on `<section>`. When active, it overrides three spacing tokens locally to demonstrate runtime theming. Since every component reads from the tokens, the whole page responds without a single rule change.

## 4. Mini-build — Token showcase

**File:** `src/routes/modules/06-styling/03-design-tokens/+page.svelte`

A full reference page showing every PE7 token with a visible example next to its name. Students bookmark this page for the rest of the course.

### DevTools verification

In Elements, inspect any element that uses `var(--space-md)`. The computed value should be a px number; resize the browser and the computed value should change fluidly because of `clamp(vw)`. Inspect the `:root` element and you will see every token defined in the Styles panel.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between a design token and a CSS variable?</summary>

Mechanically they are the same (both use CSS custom properties). Conceptually, a token is a *named design decision* with a semantic meaning, while a plain variable is just a value store. Tokens are a contract; variables are plumbing.
</details>

<details>
<summary><strong>Q2.</strong> Why do PE7 spacing and typography use <code>clamp()</code>?</summary>

To scale smoothly across viewport widths without discrete breakpoints. `clamp(min, vw-based, max)` gives you responsive values with a single expression.
</details>

<details>
<summary><strong>Q3.</strong> Why should token names be semantic rather than literal (<code>--color-error</code> not <code>--color-red</code>)?</summary>

So the meaning survives redesigns. If errors later become orange, `--color-error` still makes sense; `--color-red` would be a lie and would force a rename across the codebase.
</details>

<details>
<summary><strong>Q4.</strong> A component needs a padding of "medium + a little extra". Should you add a new token?</summary>

Not for a single use. Use `calc(var(--space-md) + var(--space-xs))` first. Promote to a real token only if three or more components need the same value.
</details>

<details>
<summary><strong>Q5.</strong> What is the difference between <code>--prose-max</code> and <code>--content-max</code>?</summary>

`--prose-max` is the ideal text column width (~38rem) for readable paragraph length. `--content-max` is the outer page width cap (~72rem) that holds layouts, images, and mixed content.
</details>

## 6. Common mistakes

- **Using raw px or rem values in components.** Defeats the whole system; drift inevitable.
- **Defining the same value twice under two names.** If `--space-md` and `--gap-cards` are always equal, collapse them.
- **Hard-coding shadow alpha.** Use OKLCH alpha notation (`oklch(0% 0 0 / 0.1)`) so shadows work in both light and dark mode.
- **Skipping clamp() for spacing.** Fixed px spacing looks cramped on mobile and sparse on desktop.

## 7. What's next

Lesson 6.4 moves from tokens to the Svelte `<style>` block itself and shows how to use native CSS nesting without any preprocessor.
