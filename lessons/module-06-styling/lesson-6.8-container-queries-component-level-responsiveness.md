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

### 1.6 Container units in practice

Container query units (`cqi`, `cqw`) are the container-aware equivalents of viewport units (`vw`, `vh`). They let you size elements relative to the container's dimensions rather than the viewport. The most useful application is fluid typography inside a component:

```css
.card__title {
    font-size: clamp(0.875rem, 3.5cqi, 1.5rem);
}
```

This sets the title to scale with the container's inline size, clamped between a minimum (0.875rem on tiny containers) and a maximum (1.5rem on wide ones). Combined with PE7's fluid type scale, this gives you truly responsive text inside components — something that was impossible before container queries because `vw`-based fluid type only responded to the viewport.

### 1.7 When media queries are still simpler

Container queries are powerful but have some cost and add complexity. A few cases where a media query is still the right tool:

- **Viewport-level layout shifts** — sidebar appearing, mobile menu opening, full-screen mode. These are about the viewport, not a container.
- **One-off breakpoints at the page level** — if the whole page changes, the page-level breakpoint is fine.
- **Legacy browsers** — container queries are fully supported in 2026 but older data in analytics may still justify media fallbacks.



### The TypeScript angle

For typed container-query-aware components, expose a `containerName` prop:

```ts
interface Props { containerName?: string; }
```

This lets parents name their container explicitly when multiple query contexts coexist.

### Comparison

| Feature | Media query | Container query |
|---------|------------|----------------|
| What it measures | Viewport width | Container width |
| Use case | Page-level layout | Component-level layout |
| Units | `vw`, `vh` | `cqi`, `cqw` |
| Requires setup | No | `container-type` on parent |
| Circular deps | No | Prevented by containment |

> **In production sidebar.** On a 100K-daily-user dashboard, container queries eliminated the `<Card size="sm|md|lg">` prop entirely. Cards placed in a sidebar auto-detected their narrow context and stacked. Cards in the main area auto-detected their wide context and went horizontal. The component API surface shrank by 30%.

### Common interview question

**Q: What is a container query and how does it differ from a media query?**

**Model answer:** A container query measures the size of a parent element instead of the viewport. You mark a parent with `container-type: inline-size`, then use `@container (min-width: 28rem)` in a descendant to change layout based on the parent's width. This lets components adapt to their local context — the same card can stack in a narrow sidebar and go horizontal in a wide main column, without props or media queries.

## Deep Dive

**Why this matters at scale.** In a design system with 20+ components, container queries eliminate the "size prop" anti-pattern entirely. Without them, teams create `<Card size="sm" />`, `<Card size="md" />`, `<Card size="lg" />` — tripling the component's API surface and requiring every consumer to manually set the right size for their context. With container queries, the card adapts automatically. The consumer places it; the card figures out its own layout. This decoupling reduces API complexity by ~30% in a typical design system and eliminates an entire category of "the card looks broken in this column width" bugs.

**The mental model.** A container-queried component is like a chameleon. You do not have to tell a chameleon what color to be — you put it on a branch and it adapts. A container-queried component does not need to be told "you are narrow" — you place it in a layout and it observes its own width and changes shape. The alternative — media queries — is like painting the chameleon by hand every time you move it to a new branch. That works for one chameleon. It breaks at scale.

**Edge cases.** Container queries inside Svelte's scoped `<style>` blocks work correctly — the hash suffix is applied to the selectors, not the container rule. However, if you try to query a container defined in a *parent* component's style block, you need a named container to target it specifically, because unnamed queries target the *nearest* container ancestor (which might be a closer wrapper you did not intend). In multi-level component nesting, always name your containers to be explicit about which ancestor you are querying. Another edge case: `container-type: inline-size` creates size containment, which means the element cannot depend on its children for its own width — it must have an explicit or parent-determined width. This is usually what you want (the container takes the width its parent gives it) but can surprise you if you expect the container to shrink-wrap its content.

**Performance implications.** Container queries are evaluated during the browser's layout phase, which already computes element sizes. The additional cost of checking `@container` breakpoints is negligible — it is a comparison between a computed value (the container's width) and a constant (your breakpoint). Even 100 container-queried elements on a page produce no measurable performance difference compared to 100 media-queried elements. The containment context created by `container-type` can actually *improve* paint performance because the browser knows it can paint that subtree independently.

**Connection to other modules.** Container queries first appeared in Module 3 Lesson 3.10 (this lesson's companion in the component architecture story). Module 6 teaches them as a styling technique. The capstone project uses them for the dashboard's widget cards — each card adapts between compact (in a narrow sidebar), medium (in a 2-column grid), and wide (in a full-width hero) with zero JavaScript and zero configuration props. The pattern composes with Module 3's custom-property knobs: the `@container` rule reassigns knob values, and the component's existing rules pick up the new values automatically.



## Going Deeper

**Official documentation:**
- [MDN: Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [MDN: container-type](https://developer.mozilla.org/en-US/docs/Web/CSS/container-type)
- [web.dev: Container queries](https://web.dev/articles/cq-stable)

**Advanced pattern:** Build a card that transitions between compact (image on top) and expanded (image on left) layouts using a container query. Use `cqi` units for fluid typography inside the card.

**Challenge question:** (Combines Lessons 6.8, 6.6, and 6.3) Build a dashboard with 3 widget cards in a resizable grid. Each card uses container queries for its internal layout. Use tokens for all spacing. Add a drag handle that resizes the grid columns so students can see cards adapt in real time.

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
