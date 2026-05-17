---
module: 6
lesson: 6.7
title: Responsive layout — Flexbox (wrap, holy grail, fluid gaps)
duration: 45 minutes
prerequisites:
  - Lesson 6.6 (Grid)
learning_objectives:
  - Explain what Flexbox is good at that Grid is not
  - Use flex-wrap with gap to build a row of chips that wraps cleanly
  - Build a holy-grail layout (header, content, footer) with flex
  - Use flex: 1 1 auto and flex-basis to control how items share space
  - Use flex: 0 0 auto for "don't shrink me" elements like icons
status: ready
---

# Lesson 6.7 — Responsive layout — Flexbox

## 1. Concept — One-dimensional layout, done right

### 1.1 The problem Grid cannot solve elegantly

A tag list. A navigation bar. A row of icons. A toolbar. A footer with a logo on the left and a copyright line on the right. In all of these, you have one axis of content (usually horizontal), items of different intrinsic sizes, and you want them to sit next to each other and wrap when they run out of room. Grid can do it, but Grid wants to know columns in advance and is awkward when items are different sizes. Flexbox is built for it.

### 1.2 The three key properties

```css
.toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    align-items: center;
}
```

- **`display: flex`** turns the element into a flex container.
- **`flex-wrap: wrap`** lets items wrap to a new line when they run out of room. Without it, they overflow or shrink to zero.
- **`gap`** is the Grid-style gap that works in Flexbox too (since 2021). It replaces the old trick of `margin-right` on items and `:last-child` to strip it.
- **`align-items: center`** vertically centres items on the cross axis.

### 1.3 The `flex` shorthand

On individual items you control growth with `flex`. It is a shorthand for `flex-grow flex-shrink flex-basis`.

- **`flex: 1 1 auto`** — grow to fill space, shrink if needed, preferred size is natural. Generic "take your share".
- **`flex: 0 0 auto`** — do not grow, do not shrink, keep natural size. Use for logos, icons, anything that must stay its intrinsic size.
- **`flex: 1 1 20rem`** — grow and shrink, but start from 20rem. Useful for form fields that should be at least 20rem wide but share space equally beyond that.
- **`flex: 0 1 auto`** — the default. Do not grow, shrink if needed, natural size.

The verbose form is more explicit but `flex: 1 1 auto` is the idiomatic "fill available space" value.

### 1.4 Holy grail — header, content, footer

The classic layout: header at the top, footer at the bottom, content in the middle that expands to fill the gap even when the page is short. This is a flex column problem:

```css
.page {
    display: flex;
    flex-direction: column;
    min-block-size: 100dvb;
}

.page__content {
    flex: 1 1 auto;
}
```

`min-block-size: 100dvb` (dynamic viewport block) makes sure the page is at least as tall as the viewport. `flex: 1 1 auto` on the content tells it to grow and swallow the empty space, pushing the footer to the bottom.

### 1.5 When Grid is clearer

If you want *rows that align columns across wrap boundaries* (for example, a table-like layout where every row has a "name" column and a "price" column), Grid is much clearer. Flex-wrap will wrap items but each wrapped row does not align with the row above it.

### 1.6 Mobile menu pattern

A menu that is a column on mobile and a row on desktop is a one-liner with Flexbox:

```css
.menu {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);

    @media (min-width: 768px) {
        flex-direction: row;
    }
}
```

The same gap works for both orientations because `gap` respects the main axis.




### The TypeScript angle

For typed Flexbox APIs: `direction?: "row" | "column"`, `wrap?: boolean`, `gap?: string`, `align?: "start" | "center" | "end" | "stretch"`.

### Comparison: Grid vs Flexbox

| Need | Grid or Flex? |
|------|-------------|
| Card grid with aligned columns | Grid |
| Navigation bar | Flex |
| Tag/chip list | Flex |
| Holy grail layout | Flex (column) |
| Dashboard with named regions | Grid |

> **In production sidebar.** On a 100K-daily-user SaaS app, switching the nav bar from Grid to Flexbox eliminated a mobile bug where items were cut off at 375px — Grid forced equal columns; Flex let items take natural width.

### Common interview question

**Q: When should you use CSS Grid vs Flexbox?**

**Model answer:** Use Grid for two-dimensional layouts (card grids, named-area page layouts). Use Flexbox for one-dimensional layouts (nav bars, tag lists, toolbars). If you find yourself writing `flex-wrap: wrap` and trying to align across rows, Grid is probably better.

## Going Deeper

**Official documentation:**
- [MDN: CSS Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout)
- [MDN: flex shorthand](https://developer.mozilla.org/en-US/docs/Web/CSS/flex)
- [CSS-Tricks: Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

**Advanced pattern:** Build a holy-grail layout using `flex-direction: column` and `min-block-size: 100dvb`. The content area gets `flex: 1 1 auto` to push the footer down.

**Challenge question:** (Combines Lessons 6.7, 6.6, and 6.5) Build a responsive page with a Flexbox navigation bar (row on desktop, column on mobile), a Grid card section, and a Flex tag list. Use logical properties throughout. Verify in RTL.

## Deep Dive

**Why this matters at scale.** Flexbox is the workhorse of component-level layout. In a typical 50-component design system, Flexbox appears in 80% of components. Getting Flexbox right at the component level means getting the entire design system right.

**The mental model.** Flexbox is a conveyor belt. Items flow in one direction. You control direction, wrapping, and space distribution. If you find yourself using flex-wrap and trying to align across rows, you probably want Grid.

**Edge cases.** flex-shrink defaults to 1, meaning items shrink and can cause unexpected text truncation. Set flex-shrink: 0 on items that must not shrink. min-width: auto prevents shrinking below content size — override with min-width: 0 for text truncation.

**Performance implications.** Flexbox is the fastest CSS layout mode. A row of 100 items reflows in under 0.5ms. Deeply nested flex containers (5+ levels) create cumulative layout cost. The order property changes visual order without DOM order, creating accessibility concerns.

**Connection to other modules.** Module 3's composition uses Flexbox. Module 5's event exercises lay out controls with Flexbox. Module 8's navigation uses flex-direction. Module 12 checks that visual order matches DOM order.

## 2. Style it — A tag chip row + a holy-grail frame

The mini-build shows a wrap-friendly chip list plus a flex-column holy-grail layout where the content block expands to push the footer down. Per-page colour: `oklch(68% 0.18 290)` (purple).

## 3. Interact — Toggle flex-direction

Add a button that toggles the nav between row and column. Watch the gap stay correct in both orientations.

## 4. Mini-build — Flex patterns

**File:** `src/routes/modules/06-styling/07-flexbox-patterns/+page.svelte`

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does <code>flex: 1 1 auto</code> mean?</summary>

Grow to fill available space, shrink if necessary, preferred size is the content's natural size. The idiomatic "take your share of the space" value.
</details>

<details>
<summary><strong>Q2.</strong> What does <code>flex-wrap: wrap</code> do, and what happens without it?</summary>

It lets items wrap to a new line when they run out of room on the main axis. Without it, items either overflow the container or shrink below their basis.
</details>

<details>
<summary><strong>Q3.</strong> When is Grid a better choice than Flex?</summary>

When items need to align across rows (table-like layouts) or when the structure is genuinely two-dimensional. Flex wraps but does not keep column alignment across wrap boundaries.
</details>

<details>
<summary><strong>Q4.</strong> What is the holy-grail pattern in one line?</summary>

A flex column with the content set to `flex: 1 1 auto` so it grows to push the footer to the bottom of a `min-block-size: 100dvb` page.
</details>

<details>
<summary><strong>Q5.</strong> What value of <code>flex</code> should a site logo usually have?</summary>

`0 0 auto` — do not grow, do not shrink, keep natural size. Logos should not stretch to fill extra space.
</details>

## 6. Common mistakes

- **Forgetting `flex-wrap: wrap` on a tag list.** Items overflow or shrink to unreadable.
- **Using `margin-right` for gaps.** `gap` works in flex since 2021; use it.
- **Setting `flex: 1` on a fixed-size element.** Logos and icons stretch.
- **Using Flexbox for a two-column form.** Grid is clearer when columns must align.

## 7. What's next

Lesson 6.8 introduces container queries — the feature that finally lets components respond to their own size rather than the whole viewport.
