---
chunk: mobile-first-layout
level: 2
penalty: medium
---

# Mobile-First Layout — Level 2 Concept Reveal

Mobile-first has a simple rule: the base stylesheet describes the mobile layout. Media queries only add rules as the viewport grows. The moment you write `@media (max-width: …)` you are doing it backward — you are starting from desktop and subtracting, and subtraction in CSS is almost always harder to reason about than addition.

### The dashboard grid

Three dashboard cards on a phone: one column, three rows, stacked. Same three cards on a tablet: two columns, two rows. On a desktop: three columns, one row. The CSS Grid idiom that does all three at once:

```
grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
```

Explanation:
- `auto-fit` means "compute as many columns as fit".
- `minmax(16rem, 1fr)` means "each column is at least 16 rem wide but can grow to share the remaining space".
- As the viewport grows from 360 px to 1280 px, the column count grows from 1 to 2 to 3 with no media queries.

You only reach for a media query when the mobile card layout needs different padding or font sizes at larger widths.

### The hero

The hero is the exception: you usually want an explicit breakpoint where the single-column text-above-image swaps to two-column text-beside-image. One `@media (min-width: 768px)` rule adds `grid-template-columns: 1fr 1fr` and the child order takes care of itself.

### Logical properties

Use `padding-inline`, `margin-block`, `inline-size`, `block-size` everywhere. They work in every writing direction, so an RTL locale (Arabic, Hebrew) flips automatically. This does not cost you anything and earns you the April 2026 accessibility audit checkpoints.

### Connecting it to the capstone

The same `repeat(auto-fit, minmax(…, 1fr))` pattern repeats in the capstone's marketing features section, contact form layout, and blog archive. Write it once and reach for it whenever a section has a variable number of equal-weight children.
