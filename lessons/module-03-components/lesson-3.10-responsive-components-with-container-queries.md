---
module: 3
lesson: 3.10
title: Responsive components with container queries (@container)
duration: 50 minutes
prerequisites:
  - Lesson 3.9 (CSS custom properties as the bridge)
  - Module 1.6 (fluid typography and clamp)
learning_objectives:
  - Explain why media queries are the wrong tool for a truly reusable component
  - Set `container-type: inline-size` on a component's root and register a container name
  - Write a `@container` query that reshapes a component based on its own width
  - Build a `MediaCard` that is compact at 240px, detailed at 420px, and landscape at 640px — in one file
  - Recognise when to reach for a container query vs a media query
status: ready
---

# Lesson 3.10 — Responsive components with container queries

## 1. Concept — The viewport is the wrong thing to listen to

### 1.1 The problem: same component, four contexts, four widths

A `MediaCard` component shows a thumbnail, a title, a description, and a footer. It needs to look good in four places:

- The full-width hero on the marketing page (1000 px wide).
- A two-column grid in the dashboard (480 px wide).
- A three-column grid in the sidebar (260 px wide).
- A modal on mobile that stretches to the screen edges (360 px wide).

Using a media query, you would write rules like "when the *viewport* is wider than 768 px, show the thumbnail on the left". But the viewport is irrelevant to the card. A card that sits inside a 260 px sidebar on a 1440 px desktop should use the compact layout, not the wide layout, because *the card itself* is narrow — the viewport is beside the point.

Media queries have been the only tool for 15 years, which is why most "responsive" components break the moment you put them inside a narrow column. The fix, shipped in every modern browser since 2023 and now baseline-stable, is called a **container query**.

### 1.2 What a container query is

A container query is a `@container` rule that applies based on the size of an **ancestor container** rather than the viewport. You mark an element as a query container with `container-type: inline-size` (which means "track my inline width"), optionally give it a name with `container-name`, and then write `@container` rules that react to that width.

```svelte
<style>
    .media-card {
        container-type: inline-size;
        container-name: media-card;
    }

    .media-card__body {
        display: flex;
        flex-direction: column;
    }

    @container media-card (min-width: 420px) {
        .media-card__body {
            flex-direction: row;
        }
    }
</style>
```

Every `<MediaCard>` instance on the page is now its *own* query container. When the card's rendered width crosses 420 px, its body switches from a vertical stack to a horizontal row — independently of what any other card on the page does, independently of the viewport width, independently of any class the parent applied.

### 1.3 How this connects to what you already know

You have been using `@media (min-width: 480px)` throughout the course for page-level breakpoints. That is still correct — for *layout* decisions that depend on the whole viewport (number of grid columns on the page, sidebar visible yes/no, mobile nav vs desktop nav). Container queries are not a replacement for media queries. They are an additional tool for a different job: *component-level* responsiveness that depends only on the component's own rendered width.

Rule of thumb:

- Layout of the *page*? Media query.
- Layout inside a *component*? Container query.

### 1.4 Why `container-type: inline-size` and not `size`

CSS also offers `container-type: size`, which tracks both width and height. For most component work you only need `inline-size` (width in horizontal writing modes). Using `inline-size` lets the component's intrinsic height adapt to its content, which is almost always what you want. Use `size` only for true 2-D layout containers like a dashboard tile that fills a fixed grid cell.

### 1.5 Combining knobs (Lesson 3.9) with container queries

Container queries shine when combined with the custom-property knob pattern from Lesson 3.9. The card's padding, font size, thumbnail size, and grid template are all `var()` calls whose values change inside different `@container` rules. The result is a single component file whose visual design adapts smoothly across a wide range of widths, with no JavaScript, no ResizeObserver, no manual class switching.

```css
.media-card {
    container-type: inline-size;
    --pad: var(--space-sm);
    --font: var(--text-base);
    padding: var(--pad);
    font-size: var(--font);
}

@container (min-width: 420px) {
    .media-card {
        --pad: var(--space-lg);
        --font: var(--text-lg);
    }
}
```

The knob values change, the existing rules pick them up, and the component reshapes. Two tools, one file.

### 1.6 Browser support in April 2026

Container queries (`@container`) and `container-type` are **baseline** since 2023 and are in every evergreen browser. You no longer need a polyfill, a PostCSS plugin, or a feature-detection fallback. Write them directly and trust the browser to do its job.

### 1.7 Building a responsive component: the three-breakpoint pattern

The most useful pattern for a real component is to define three container breakpoints that cover the common widths:

- **Compact** (default, no query needed): below 280 px. Tight padding, stacked layout, smaller fonts.
- **Medium** (`@container (min-width: 280px)`): the sweet spot. Comfortable padding, still mostly stacked but with inline metadata.
- **Wide** (`@container (min-width: 480px)`): side-by-side layout, larger fonts, more generous spacing.

These three states handle the vast majority of real-world placements. A card in a 200 px sidebar gets compact. The same card in a 350 px column gets medium. The same card in a 700 px hero region gets wide. One file, three layouts, zero JavaScript, zero `ResizeObserver`, zero class-toggling logic.

### 1.8 Container queries inside Svelte's scoped styles

Because Svelte scopes CSS by adding a hash suffix to selectors, `@container` queries inside a `<style>` block work identically to any other scoped rule. The hash is applied to the selectors inside the container query, not to the query itself. This means two instances of the same component on the same page can have different container query matches if their containers are different widths — and the styles remain scoped and collision-free.

One subtlety: if you set `container-type: inline-size` on the component's own root element, and that root element has Svelte's scoped hash, the container query will match correctly because the query looks at the *nearest ancestor* with `container-type` set — which is the root element itself (for descendants inside it). This is the recommended pattern: put `container-type` on your component's root `<article>` or `<div>`, and write `@container` rules for children inside it.

## Deep Dive

**Why this matters at scale.** In a 50-component design system, every component that might appear in multiple contexts (sidebar, main content, modal, card grid) needs to be responsive to its container. Without container queries, teams build "size variants" — `<Card size="sm">`, `<Card size="lg">` — that the parent must set manually. This creates coupling: the parent has to know how wide its children are and tell them. Container queries invert this: the child observes its own width and adapts autonomously. The parent simply places the component; the component figures out the rest. This decoupling is what makes a component library truly reusable across different layouts without configuration.

**The mental model.** Think of a container query as a thermostat for width. A thermostat does not need you to tell it the temperature — it measures it and adjusts the heating automatically. Similarly, a component with container queries does not need the parent to tell it "you are narrow" — it measures its own container width and adapts its layout automatically. Just as you do not rewire your thermostat every time you move to a new room, you do not reconfigure a container-queried component every time you place it in a new layout. It just works.

**Edge cases.** You cannot query the element that has `container-type` set on it — only its descendants can query it. This means the root element itself cannot change its own padding based on its own width via a container query. The workaround is to use a thin wrapper: set `container-type` on an outer `<div>`, and put your visual component as the first child inside it. Another edge case: `container-type: inline-size` prevents the element from using `height: auto` based on content in some edge cases (it must establish a containment context). In practice, this rarely causes issues for `inline-size`, but be aware that using `container-type: size` (tracking both axes) can produce unexpected height collapse.

**Performance implications.** Container queries have near-zero runtime cost. The browser already knows the computed width of every element during layout — a container query simply checks that width against your breakpoint during style resolution. There is no JavaScript, no `ResizeObserver` callback overhead, no forced reflow. A page with 50 container-queried components does not perform measurably worse than one with 50 media-queried components. The only consideration is that `container-type: inline-size` creates a containment context, which means the browser can optimize paint for that subtree independently — this is actually a performance *benefit*, not a cost.

**Connection to other modules.** Container queries first appeared in Module 1 Lesson 1.5 as part of PE7's philosophy. Module 6 Lesson 6.8 teaches them in full depth with the styling vocabulary. This lesson (3.10) is where they merge with the component architecture story — because a truly reusable component must own its own responsiveness. The capstone project combines container queries with the `MediaCard` pattern to build a component that works everywhere from a narrow mobile sidebar to a full-width desktop hero, without the page telling it which layout to use.

## 2. Style it — Three widths, one file

The mini-build places the *same* `MediaCard` component in three containers of widely different widths (a narrow sidebar column, a medium card column, and a wide hero region). Each instance uses a container query on its own root to pick between compact, stacked, and wide layouts. Zero JavaScript.

## 3. Interact — Media query first, container query second

Start by writing the card's responsive rules as media queries based on viewport width. Put two cards side by side — a narrow one in a sidebar and a wide one in the main column — on a desktop viewport. They both look the same (wide), because the media query fires on the viewport and both cards see the same viewport. That is wrong. Now replace every `@media` with `@container`, add `container-type: inline-size` on the root, and reload. The narrow card snaps to the compact layout while the wide card stays wide. The component is now *truly* responsive to its own container, not to whatever the page thinks.

## 4. Mini-build — A MediaCard in three containers

### Files

- `src/lib/components/MediaCard.svelte` (new)
- `src/routes/modules/03-components/10-container-queries/+page.svelte`

### Key excerpt

```svelte
<!-- MediaCard.svelte -->
<article class="media-card">
    <div class="media-card__thumb" aria-hidden="true"></div>
    <div class="media-card__body">
        <h3 class="media-card__title">{title}</h3>
        <p class="media-card__desc">{description}</p>
    </div>
</article>

<style>
    .media-card {
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        background: var(--color-surface-2);
        border-radius: var(--radius-lg);
        overflow: hidden;
    }

    .media-card__thumb {
        aspect-ratio: 16 / 9;
        background: linear-gradient(135deg, var(--color-brand), oklch(from var(--color-brand) 60% c calc(h + 30)));
    }

    @container (min-width: 420px) {
        .media-card {
            flex-direction: row;
        }

        .media-card__thumb {
            inline-size: 40%;
            aspect-ratio: auto;
        }
    }
</style>
```

### DevTools verification

1. Open DevTools → Elements → select a `.media-card` element.
2. In the **Computed** tab, search for `container-type`. You should see `inline-size`.
3. Resize the browser window so the sidebar card stays narrow but the main-column card expands. Watch the two cards diverge: the sidebar card stays stacked, the main-column card flips to horizontal. Two DOMs, one file, zero JavaScript.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is a media query the wrong tool for a component that must look good in a sidebar and a main column on the same viewport?</summary>

Because a media query reacts to the viewport, not to the component's own width. Both the sidebar card and the main-column card see the same viewport width, so they get the same rules — even though one is 260 px and the other is 900 px.
</details>

<details>
<summary><strong>Q2.</strong> What does `container-type: inline-size` do?</summary>

It marks the element as a query container and tells the browser to track its inline size (usually the width). Any `@container` rule targeting that container becomes active based on that size.
</details>

<details>
<summary><strong>Q3.</strong> When should you still reach for a media query?</summary>

For page-level layout decisions — number of columns on the route, when a nav collapses, when a sidebar hides. Media queries remain the right tool for anything that depends on the viewport as a whole.
</details>

<details>
<summary><strong>Q4.</strong> Why does combining container queries with the knob pattern from Lesson 3.9 work so well?</summary>

Because the knobs (`--pad`, `--font`, `--thumb-size`) act as a single list of values the component reads, and the `@container` rule only has to reassign those values. The component's layout rules stay untouched; only the variable definitions change. That is clean, declarative, and JavaScript-free.
</details>

<details>
<summary><strong>Q5.</strong> Is `container-type: inline-size` supported in the browsers your users actually have in 2026?</summary>

Yes. Container queries have been baseline since 2023, which means every evergreen browser supports them. No polyfill, no fallback, no PostCSS step.
</details>

## 6. Common mistakes

- **Forgetting `container-type`.** Without it, `@container` queries never fire. Add `container-type: inline-size` to the element you want to query.
- **Querying by name without declaring the name.** If you write `@container my-card (min-width: …)` you must also write `container-name: my-card` on the container. Un-named container queries are fine and usually simpler.
- **Using `container-type: size` when `inline-size` would do.** `size` tracks both axes and forces the element's height to become queryable, which often produces surprising layout side effects. Default to `inline-size`.
- **Mixing media and container queries for the same decision.** Pick one tool per decision. Media for page-level, container for component-level.

## 7. What's next

Module 3 is complete. The module project, **UI Component Library Part 1**, asks you to assemble everything — typed props, snippets, bindable inputs, composition, variants via custom properties, and container queries — into a working component library with a demo route. Module 4 then moves on to control flow: `{#if}`, `{#each}`, `{#key}`, `{#await}`.
