---
chunk: mobile-first-layout
title: Mobile-First Layout
module: 6
---

# Mobile-First Layout — Brief

Build the capstone's primary layout grid so every page works on a 360 px phone first and scales up. No desktop-first media queries allowed.

## What to build

- A `.page` layout primitive in `src/app.css` (already seeded in the token chunk) that constrains content width and centers it.
- A `.dashboard-grid` inside the dashboard route (`src/routes/dashboard/+page.svelte`) that stacks cards in a single column on mobile and flows into a 2-column, then 3-column grid as the viewport grows.
- A `.hero` layout on the marketing home (`src/routes/+page.svelte`) with mobile baseline: single column, text above image. At 768 px and up: text left, image right, 50/50 split.
- One `@media (min-width: …)` per breakpoint. Never a `max-width` media query.

## Acceptance criteria

- Chrome DevTools device toolbar at 360 × 640 renders every route without horizontal scroll.
- At every breakpoint the layout adapts using CSS Grid — no float hacks, no absolute positioning.
- Lighthouse mobile reports no "Content is wider than screen" errors.

## How it connects to the capstone

The dashboard grid holds the TanStack Table card (chunk `tanstack-table-setup`). The hero houses the GSAP timeline (chunk `gsap-timeline`). Every later chunk assumes this mobile baseline exists.
