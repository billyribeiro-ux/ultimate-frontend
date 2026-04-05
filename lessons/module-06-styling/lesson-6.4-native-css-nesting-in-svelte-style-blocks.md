---
module: 6
lesson: 6.4
title: Native CSS nesting in Svelte <style> blocks
duration: 40 minutes
prerequisites:
  - Lesson 6.1 (@layer)
  - Lesson 6.3 (tokens)
learning_objectives:
  - Write nested CSS using the & combinator without a preprocessor
  - Explain when an explicit & is required (at-rules, adjacent selectors)
  - Nest pseudo-classes, pseudo-elements, and media queries inside a single rule
  - Keep nesting shallow to avoid specificity explosions
  - Debug nested selectors in DevTools
status: ready
---

# Lesson 6.4 — Native CSS nesting in Svelte `<style>` blocks

## 1. Concept — Nesting without SCSS

### 1.1 The problem: the same class name repeated seven times

Before nesting, a typical component style looked like this:

```css
.card { padding: 1rem; }
.card:hover { border-color: blue; }
.card:focus-visible { outline: 2px solid blue; }
.card .title { font-weight: 700; }
.card .title:hover { color: red; }
```

You write `.card` five times. You scroll the rules and the grouping is not visible. When you rename `.card` you edit in five places. SCSS solved this in 2006 with a nesting syntax. Everyone adopted SCSS partly for this one feature. But SCSS requires a build step, and it compiles to plain CSS, and it invents a small language on top of CSS.

### 1.2 The April 2026 answer: the browser does it now

Native CSS nesting shipped in every browser in 2023. You can now nest selectors directly in your `<style>` block, no SCSS, no build step, no magic:

```css
.card {
    padding: var(--space-md);

    &:hover {
        border-color: var(--color-brand);
    }

    &:focus-visible {
        outline: 2px solid var(--color-brand);
    }

    & .title {
        font-weight: 700;

        &:hover {
            color: var(--color-brand);
        }
    }
}
```

One rule block, one place to change the class name, visual grouping that matches the DOM tree. The `&` character stands for the parent selector. You read it mentally as "self" — `&:hover` means "this selector plus `:hover`".

### 1.3 When `&` is required and when it's optional

Native CSS nesting is stricter than SCSS about when you must write `&`:

- **Before a pseudo-class/pseudo-element** (`&:hover`, `&::before`) — required. Without `&`, CSS would treat `:hover` as a bare selector and fail to parse.
- **Before a compound selector combining with a class** (`&.active`, `&[aria-expanded="true"]`) — required.
- **Before a descendant selector** (`& .title`, `& > li`) — required in many engines, even though SCSS would let you omit it. Safe habit: always write `&` before the descendant.
- **Before a media query** — not required. `@media (min-width: 480px) { ... }` nests cleanly without `&`.

### 1.4 Nesting media queries

This is probably the biggest quality-of-life win. Mobile-first styles and their desktop overrides can live in the same block:

```css
.grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-sm);

    @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-md);
    }
}
```

The rule reads top to bottom as "base state, then what changes at 768 px". No scrolling to a media query section at the bottom of the file, no duplicating the selector.

### 1.5 Nesting and specificity

Native nesting does *not* increase specificity per level the way some CSS-in-JS tools did. `&:hover` has the specificity of `.card:hover`, not `.card.card:hover`. That is a relief — it means nesting is free from a cascade standpoint.

There is one subtlety. Compound selectors inside nesting are calculated as `:is(parent) + whatever`. `:is()` takes the highest specificity of its arguments. This rarely bites in practice because PE7 keeps parents as single classes, but it is worth knowing if you ever nest under a compound selector.

### 1.6 Keep it shallow

The single most common nesting mistake is going too deep. Four levels of nesting (`.page .section .card .title:hover`) mean four coupled levels of structure. Moving `.title` out of `.card` means editing the nest. Keep rules at most 2 levels deep; prefer to flatten when you can.

## 2. Style it — A card with state-ful nested rules

The mini-build is a card that expands on click, has hover, focus, and aria-expanded states, and responds to a media query. All styles for the card live in a single nested rule. Per-page colour: `oklch(70% 0.18 100)` (lime).

## 3. Interact — Toggle `aria-expanded`

Add a click handler that toggles `aria-expanded`. A nested `&[aria-expanded="true"]` rule changes the card's styles without a separate class. This demonstrates how attribute selectors nest naturally.

## 4. Mini-build — A nested card

**File:** `src/routes/modules/06-styling/04-css-nesting/+page.svelte`

One card, one selector block, every state and every breakpoint nested inside.

### DevTools verification

Inspect the card in Chrome. The Styles panel shows each nested rule as an expandable tree — you can see the parent selector resolved (`.card:hover` written as `.card:hover`, not `& :hover`). Chrome also shows the original nested source in a tooltip.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does <code>&</code> mean in nested CSS?</summary>

It is the parent selector. Inside a nested rule, `&` expands to the selector of the enclosing rule. `&:hover` inside `.card` resolves to `.card:hover`.
</details>

<details>
<summary><strong>Q2.</strong> When is <code>&</code> required?</summary>

Before a pseudo-class, pseudo-element, attribute selector, or compound class like `&.active`. It is also safest to use it before a descendant selector (`& .child`).
</details>

<details>
<summary><strong>Q3.</strong> Does nesting increase specificity per level?</summary>

No. A nested `&:hover` has the same specificity as `.card:hover`. Nesting is free from a cascade standpoint.
</details>

<details>
<summary><strong>Q4.</strong> Why nest media queries inside a component rule?</summary>

So mobile-first styles and their enhancements live next to each other, making the rule readable as "base, then this changes at 768 px" rather than scattered across the file.
</details>

<details>
<summary><strong>Q5.</strong> What is the usual maximum nesting depth?</summary>

Two levels. Deeper nesting couples structure too tightly and makes refactors painful.
</details>

## 6. Common mistakes

- **Forgetting `&` before a pseudo-class.** `:hover { ... }` inside a rule parses as a bare selector and fails silently.
- **Over-nesting.** Four levels deep means four coupled selectors. Flatten when you can.
- **Trying to nest at-rules like `@keyframes`.** Those are top-level and cannot be nested inside a rule.
- **Assuming SCSS rules apply.** Native nesting has slightly different `&` requirements; always test in a real browser.

## 7. What's next

Lesson 6.5 introduces logical properties (`margin-inline`, `padding-block`, `inset-inline-start`) — the modern way to write CSS that works in LTR, RTL, and vertical writing modes without rewrites.
