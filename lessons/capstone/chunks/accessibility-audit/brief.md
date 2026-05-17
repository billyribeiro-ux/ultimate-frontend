---
chunk: accessibility-audit
title: Accessibility Audit
module: 12
---

# Accessibility Audit — Brief

Audit and fix the capstone app's accessibility so that every page scores 100 on Lighthouse Accessibility and can be operated entirely by keyboard, screen reader, or switch device.

## What to build

- In `src/lib/components/SkipLink.svelte`, create an accessible skip-to-content link that becomes visible on `:focus-visible` and sends keyboard focus to `<main id="main-content">`.
- In `src/routes/+layout.svelte`, import and render `<SkipLink />` as the first child of `<body>` content, and ensure `<main>` has `id="main-content"` and `tabindex="-1"`.
- In `src/lib/components/DashboardTable.svelte` (the TanStack Table chunk), add `role="grid"`, proper `aria-sort` on sortable column headers, and `aria-live="polite"` on the row-count status region so screen readers announce filter changes.
- In `src/routes/dashboard/+page.svelte`, manage a focus trap inside the sidebar drawer on mobile (cycle focus between the first and last interactive element) and restore focus to the trigger button on close.
- Add `aria-current="page"` to the navigation link that matches the current route via `$page.url.pathname`.
- Ensure every interactive element has a minimum 44x44 CSS pixel tap target (`min-block-size: 44px; min-inline-size: 44px`).

## Acceptance criteria

- Lighthouse Accessibility is 100 on every page.
- Tab order is logical — skip link → nav → main content.
- The dashboard sidebar drawer traps focus while open and restores focus on close.
- Screen reader announces dynamic row count changes in the table.
- `prefers-reduced-motion: reduce` disables all transitions and animations (verified by removing `@media` wrapping and confirming nothing animates).
- All color contrasts pass WCAG AA (4.5:1 text, 3:1 large text / UI).
- No `any` types in any accessibility utility files.

## How it connects to the capstone

Accessibility is the final quality gate before deployment. The skip link uses the same PE7 token system (`global-token-system`) for styling. The focus trap operates on the sidebar built in `mobile-first-layout`. The table ARIA roles extend the work in `tanstack-table-setup`. The `prefers-reduced-motion` guard ties back to the GSAP chunks (`gsap-timeline`, `scroll-trigger-setup`) ensuring animation respects user preferences.
