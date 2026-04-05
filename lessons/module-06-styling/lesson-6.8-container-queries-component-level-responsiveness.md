---
module: 6
lesson: 6.8
title: Container queries — component-level responsiveness
duration: 50 minutes
prerequisites:
  - Lesson 6.6 (Grid)
  - Lesson 6.7 (Flexbox)
learning_objectives:
  - Explain what a container query is and how it differs from a media query
  - Set container-type: inline-size on a parent so children can query its width
  - Use @container with cqi and cqw units to respond to container size
  - Name a container with container-name and query it specifically
  - Decide when a container query is the right tool and when media is still simpler
status: ready
---

# Lesson 6.8 — Container queries

## 1. Concept — The component that styles itself

### 1.1 The problem: the same card in two places

You build a beautiful product card — image on the left, title, price, button. On the home page you place it in a wide hero section and it looks great. You drop the same card into a sidebar and it breaks: the image is too big, the text wraps awkwardly, the button is pushed off the edge. The card looks wrong not because the viewport is narrow — the viewport is still desktop-sized — but because the *container* the card sits in is narrow.

Media queries cannot help you here. They answer the question "how wide is the viewport?" but the real question is "how wide is my parent?". For almost 20 years, CSS had no answer. The fix, which shipped in all modern browsers in 2023, is **container queries**.

### 1.2 The two-step setup

Step 1: mark an element as a **container** for size queries.

```css
.card-host {
    container-type: inline-size;
}
```

`container-type: inline-size` turns the element into a container whose inline dimension (width, in LTR) can be queried by its descendants. There is also `size` (both dimensions) and `normal` (default, no querying).

Step 2: write queries against the nearest container:

```css
.card {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-sm);

    @container (min-width: 28rem) {
        grid-template-columns: 10rem 1fr;
    }
}
```

Read that as: by default the card stacks. When its container reaches 28 rem of inline size, the card becomes a two-column layout. Drop the same card into a 20 rem sidebar and it stays stacked; drop it into a 40 rem main column and it goes two-column. The viewport is irrelevant.

### 1.3 Container units — `cqi`, `cqb`, `cqw`, `cqh`

Container query units are the container-aware cousins of `vw` and `vh`:

- **`cqi`** — 1% of the container's inline size
- **`cqb`** — 1% of the container's block size
- **`cqw`** — 1% of the container's width (physical)
- **`cqh`** — 1% of the container's height (physical)

These let you size fonts and spacing relative to the container rather than the viewport:

```css
.card__title {
    font-size: clamp(1rem, 4cqi, 1.5rem);
}
```

On a narrow container the title is 1 rem. On a wide container it grows with the container's inline size. The same card, two behaviours, no code changes.

### 1.4 Named containers

When you have containers inside containers, queries target the nearest one by default. To target a specific ancestor, name it:

```css
.page-grid {
    container: layout / inline-size;
}

.card {
    @container layout (min-width: 50rem) {
        /* responds to the outer layout container, not the immediate parent */
    }
}
```

`container: layout / inline-size` is shorthand for `container-name: layout; container-type: inline-size;`.

### 1.5 A gotcha: you cannot query the element itself

The container query looks at the *ancestor*, not the element. You cannot make an element query its own size. That is actually a feature — it prevents circular layout dependencies (where changing the size changes the rules that change the size). In practice, wrap the component in a thin host and put `container-type` on the host.

### 1.6 When media queries are still simpler

Container queries are powerful but have some cost and add complexity. A few cases where a media query is still the right tool:

- **Viewport-level layout shifts** — sidebar appearing, mobile menu opening, full-screen mode. These are about the viewport, not a container.
- **One-off breakpoints at the page level** — if the whole page changes, the page-level breakpoint is fine.
- **Legacy browsers** — container queries are fully supported in 2026 but older data in analytics may still justify media fallbacks.

## 2. Style it — The same card in two columns

The mini-build shows a product card component placed in two different containers side by side — a wide one and a narrow one. The card has no media queries and no "narrow" class. A `@container` block transforms it automatically based on the column it lands in. Per-page colour: `oklch(68% 0.2 340)` (pink).

## 3. Interact — Drag the divider

Add a resizable divider between the two columns so students can see the card flip between layouts in real time. Use a range input for simplicity.

## 4. Mini-build — Two columns, one card

**File:** `src/routes/modules/06-styling/08-container-queries/+page.svelte`

### DevTools verification

Inspect the card. In the Styles panel, any rule inside `@container` has a small badge indicating which container it resolves against. Chrome also shows the current container size in the computed panel.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between a container query and a media query?</summary>

A media query asks "how wide is the viewport?". A container query asks "how wide is my nearest container ancestor?". Container queries let components respond to their local context regardless of viewport size.
</details>

<details>
<summary><strong>Q2.</strong> What does <code>container-type: inline-size</code> do?</summary>

It marks the element as a container whose inline dimension can be queried by its descendants. Descendants can now use `@container (min-width: ...)` to respond to this element's width.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>cqi</code> mean?</summary>

One percent of the container's inline size. A container-aware equivalent of `vw`.
</details>

<details>
<summary><strong>Q4.</strong> Can an element query its own size?</summary>

No. The container query targets an ancestor. This prevents circular layout dependencies.
</details>

<details>
<summary><strong>Q5.</strong> When should you still reach for a media query?</summary>

For viewport-level changes like a mobile menu toggle or a full-page breakpoint, where the intent is "at this viewport size, the whole page behaves differently".
</details>

## 6. Common mistakes

- **Forgetting `container-type` on the parent.** The `@container` rule is parsed but never matches anything.
- **Querying the wrong ancestor.** Name containers when nesting multiple.
- **Using container queries for page-level layout.** Media queries are simpler for that.
- **Expecting the container to change its own layout based on its children.** It cannot — containers query outward from child to parent.

## 7. What's next

Lesson 6.9 closes out the PE7 deep dive with per-page color personalities — the technique you have been using in every mini-build, now explained in full.
