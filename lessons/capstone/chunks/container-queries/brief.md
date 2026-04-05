---
chunk: container-queries
title: Container Queries
module: 6
---

# Container Queries — Brief

The `Card` component in the capstone is used in three different contexts: a full-width row on mobile, a half-width column inside the dashboard grid, and a third-width tile inside the marketing features grid. A media-query-driven component would look wrong in at least one of those contexts because the viewport width does not tell you how wide the card actually is.

Your task: refactor `Card.svelte` so it reads its own width via a **container query** and switches from a compact vertical layout to a horizontal one when its own inline-size exceeds 28 rem.

## What to build

- Add `container-type: inline-size;` to the `.card` element.
- Name the container with `container-name: card;`.
- Write a `@container card (min-inline-size: 28rem)` rule that switches the internal layout.

## Acceptance criteria

- The same `<Card>` component renders differently depending on its parent's available width, with no JavaScript and no viewport media queries inside the component.
- Resizing the parent in DevTools instantly flips the internal layout.

## How it connects to the capstone

Every other chunk that renders a `Card` (dashboard, marketing home, blog archive) inherits this behaviour for free. This is the single biggest reason to prefer container queries over media queries for component-level responsiveness.
