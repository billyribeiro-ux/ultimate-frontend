---
module: 6
lesson: 6.6
title: Responsive layout — CSS Grid (auto-fill, auto-fit, minmax)
duration: 50 minutes
prerequisites:
  - Lesson 6.3 (tokens)
  - Lesson 6.4 (nesting)
learning_objectives:
  - Explain what CSS Grid is good at that Flexbox is not
  - Use auto-fill with minmax to build a grid that wraps without media queries
  - Explain the difference between auto-fill and auto-fit
  - Use grid-template-areas to build a named layout for a simple page
  - Decide when a single-column grid is clearer than no grid
status: ready
---

# Lesson 6.6 — Responsive layout — CSS Grid

## 1. Concept — Two-axis layout, solved

### 1.1 The problem: responsive card grids without media queries

Before Grid, a responsive card list looked like this: mobile is one column, tablet is two, desktop is three, big desktop is four. You wrote four media queries and four column-count rules. Adding a fifth size meant a fifth media query. The breakpoint values came from nowhere in particular. Every designer tweaked them and every developer dreaded them.

CSS Grid introduced in 2017 gave us the tools to express *"wrap as many columns as you can fit, each at least 16rem wide, otherwise stack"* — with no media queries at all.

### 1.2 The magic incantation

```css
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    gap: var(--space-md);
}
```

Read it piece by piece:

- **`display: grid`** — turn the element into a grid container.
- **`grid-template-columns`** — define the columns.
- **`repeat(auto-fill, ...)`** — create as many columns as fit.
- **`minmax(16rem, 1fr)`** — each column is at least 16rem wide, at most 1 fraction of available space.
- **`gap: var(--space-md)`** — space between columns and rows.

On a 320 px phone, 16rem is 256 px and only one column fits. On a 1200 px desktop, five columns fit and the content wraps into five. No breakpoint was specified. The grid adapts continuously.

### 1.3 `auto-fill` vs `auto-fit`

There are two siblings and students mix them up constantly.

- **`auto-fill`** creates as many tracks as fit, even if some are empty. Three cards in a 5-column grid leave two empty slots on the right.
- **`auto-fit`** creates as many tracks as fit, then *collapses empty ones to zero width*, which causes the filled tracks to expand and take up the slack. Three cards in a grid that could fit five will each stretch to take a third of the width.

Use `auto-fill` when you want consistent card sizes regardless of how many items you have. Use `auto-fit` when you want items to always stretch to fill the row.

### 1.4 `grid-template-areas` — a named layout

For a page layout with regions (header, sidebar, main, footer), `grid-template-areas` reads like ASCII art:

```css
.layout {
    display: grid;
    gap: var(--space-md);
    grid-template-columns: 1fr;
    grid-template-areas:
        'header'
        'main'
        'sidebar'
        'footer';

    @media (min-width: 768px) {
        grid-template-columns: 16rem 1fr;
        grid-template-areas:
            'header  header'
            'sidebar main'
            'footer  footer';
    }
}

.layout__header  { grid-area: header; }
.layout__sidebar { grid-area: sidebar; }
.layout__main    { grid-area: main; }
.layout__footer  { grid-area: footer; }
```

Read the template. Mobile: four rows, one column. Desktop: three rows, two columns, sidebar next to main. The order in which you write the HTML is independent from the visual order on desktop — the grid areas decide where things land.

### 1.5 Grid vs Flexbox

They are not rivals; they solve different problems.

- **Grid** is the tool when you have a **two-dimensional** layout. Rows *and* columns. You know the structure in both axes.
- **Flexbox** is the tool when you have a **one-dimensional** layout — a row of tags, a navigation bar, a footer of links. You care about one axis and wrapping is a fallback.

A useful rule of thumb: if you find yourself writing `flex-wrap: wrap` and trying to align items across rows, you probably want Grid.


## Going Deeper

**Official documentation:**
- [MDN: CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)
- [MDN: repeat()](https://developer.mozilla.org/en-US/docs/Web/CSS/repeat)
- [CSS-Tricks: Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)

**Advanced pattern:** Build a grid that switches between `auto-fill` and `auto-fit` via a toggle. Add and remove cards to see the difference visually.

**Challenge question:** (Combines Lessons 6.6, 6.5, and 6.3) Build a responsive product grid using `auto-fill` and `minmax()`. Use logical properties for all internal spacing. Use PE7 tokens for gap and padding. Add a `grid-template-areas` page layout that swaps at 768px. Verify in RTL mode.

## Deep Dive

**Why this matters at scale.** Grid eliminates media-query proliferation. A project with 40 components and 4 breakpoints generates 160 media query blocks. With auto-fill and minmax, most collapse to zero. Teams report 30-40% fewer CSS lines.

**The mental model.** Grid is a spreadsheet: define rows and columns, place items in cells. Flexbox is a clothesline: hang items and they flow. The key question is whether you need control in both dimensions.

**Edge cases.** auto-fill vs auto-fit matters only when items are fewer than available tracks. auto-fill leaves empty tracks; auto-fit collapses them. Subgrid lets children inherit parent track definitions, solving aligned-labels in forms.

**Performance implications.** CSS Grid layout is GPU-accelerated. Layout runs once per frame, typically under 1ms even for hundreds of items. Avoid grid-auto-rows: masonry in production — it triggers multiple layout passes.

**Connection to other modules.** Module 8 uses Grid for dashboard layouts. Module 11's TanStack Table renders into Grid. Module 12's image gallery uses auto-fill for responsive thumbnails.

## 2. Style it — A card grid + a page layout

The mini-build has two parts. Part 1: a card grid using `repeat(auto-fill, minmax(16rem, 1fr))` with 12 sample cards. Part 2: a named-area page layout that swaps at 768 px. Per-page colour: `oklch(68% 0.2 20)` (coral).

## 3. Interact — Add and remove cards

Buttons to add or remove a card let students watch `auto-fill` handle the empty slots while `auto-fit` collapses them. A toggle flips between the two modes so the difference is visible in real time.

## 4. Mini-build — Grid playground

**File:** `src/routes/modules/06-styling/06-grid-patterns/+page.svelte`

### DevTools verification

Open DevTools and toggle the grid overlay (click the "grid" badge next to any `display: grid` element). You will see track numbers, gap sizes, and (for auto-fill) empty tracks rendered as grey lines.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does <code>repeat(auto-fill, minmax(16rem, 1fr))</code> do?</summary>

It creates as many 16rem-minimum columns as fit in the container, and each column stretches up to an equal share of the remaining space. The grid wraps automatically without media queries.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between <code>auto-fill</code> and <code>auto-fit</code>?</summary>

`auto-fill` creates all tracks that fit and leaves empty ones when items run out. `auto-fit` collapses empty tracks to zero and stretches the filled tracks to take the slack.
</details>

<details>
<summary><strong>Q3.</strong> When should you reach for Grid instead of Flexbox?</summary>

When you have a two-dimensional layout — structure in both rows and columns — or when you need named areas that swap at breakpoints.
</details>

<details>
<summary><strong>Q4.</strong> What is <code>grid-template-areas</code> and why is it useful?</summary>

It lets you lay out a named grid visually in CSS. Each area is a rectangle, elements reference areas by name with `grid-area`, and you can re-arrange the whole layout at a breakpoint by swapping the template.
</details>

<details>
<summary><strong>Q5.</strong> Why does <code>gap: var(--space-md)</code> work for both rows and columns?</summary>

Because `gap` is a shorthand for `row-gap column-gap`. With one value, both receive it.
</details>

## 6. Common mistakes

- **Using `minmax(16rem, 1fr)` without `repeat(auto-fill, ...)`.** Produces a single column that stretches to 1fr. You need the repeat for wrapping.
- **Confusing `auto-fit` with `auto-fill`.** Empty tracks look different; pick the one that matches the visual intent.
- **Using Grid for a row of three items with no wrapping.** Flexbox is simpler here.
- **Defining `grid-template-areas` but forgetting to assign `grid-area` on the children.** The children land in the default auto-flow positions instead.

## 7. What's next

Lesson 6.7 covers the Flexbox patterns that Grid doesn't replace — the one-dimensional layouts, holy grail, and fluid-gap tag lists.
