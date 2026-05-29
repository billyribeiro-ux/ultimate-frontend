---
chunk: container-queries
level: 2
penalty: medium
---

# Container Queries — Level 2 Concept Reveal

A container query is a CSS mechanism that lets a component style itself based on the width (or height, or aspect ratio) of its nearest **containment context**, rather than the width of the viewport. It was standardised in 2022 and shipped in every major browser by 2023. By May 2026 it is the default tool for component-level responsive design.

### Two steps, every time

1. **Establish a container.** On the element you want to measure, set `container-type: inline-size` (for width-based queries) and optionally `container-name: <name>` to label it. From that moment, the element is a *containment context*.
2. **Query the container.** Inside the element's stylesheet, write `@container <name> (min-inline-size: <threshold>) { <rules> }`. Those rules apply when the container's inline-size meets the threshold, regardless of the viewport.

### Why it matters for the capstone

Your dashboard grid renders three `Card` components in a grid that flows from 1 column to 3 columns as the viewport grows. In the 3-column layout each card is about 20 rem wide. In the 1-column layout each card is close to the full viewport width. The same `<Card>` component — the same HTML — now lives in two vastly different widths. A viewport media query cannot tell those apart because the viewport is the same.

A container query can. The card's stylesheet reads: "if my own inline-size is over 28 rem, switch from vertical stack to two-column horizontal with the title on the left and the body on the right; otherwise stay vertical." No JavaScript, no ResizeObserver, no parent needs to cooperate.

### Pseudocode

```
.card {
    container-type: inline-size;
    container-name: card;
    display: grid;
    gap: var(--space-sm);
}

.card__title { font-size: var(--text-lg); }

@container card (min-inline-size: 28rem) {
    .card { grid-template-columns: auto 1fr; align-items: start; }
    .card__title { font-size: var(--text-xl); }
}
```

### Connecting it to the capstone

Any component used across the capstone's varied layouts should use container queries, not media queries, for its internal responsiveness. The `MediaCard` on the blog archive, the `MetricCard` in the dashboard, and the `Card` from the component library all apply the same pattern with different breakpoints.
