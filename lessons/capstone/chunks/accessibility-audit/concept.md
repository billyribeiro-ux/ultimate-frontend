---
chunk: accessibility-audit
level: 2
penalty: medium
---

# Accessibility Audit — Level 2 Concept Reveal

Accessibility in a SvelteKit app spans four layers: semantic HTML, ARIA enrichment, keyboard management, and dynamic announcements. Each layer has a specific job.

### Semantic HTML (the foundation)

If you use `<button>` instead of `<div onclick>`, you get keyboard activation, focus, and role for free. The capstone already uses semantic elements for navigation (`<nav>`), sections (`<section>` with `aria-labelledby`), and forms (`<form>`). The audit fills gaps where headings are skipped, lists lack `role="list"` in Safari (which strips list semantics with `list-style: none`), or interactive regions lack landmarks.

### Skip link pattern

A skip link is the first element in DOM order. It is positioned off-screen until focused. When activated, it moves focus to `<main>` via `element.focus()`. The target needs `tabindex="-1"` because `<main>` is not natively focusable — the tabindex makes it programmatically focusable without adding it to the natural tab order.

### Focus trap for modal-like UI

The sidebar drawer on mobile is modal — it overlays content. While open, keyboard focus must not escape behind it. The pattern:

1. On open: find all focusable elements inside the drawer. Focus the first one.
2. On `keydown`: if Tab lands past the last element, wrap to first. If Shift+Tab lands before the first, wrap to last.
3. On Escape or close button: restore focus to the trigger element stored before opening.

In Svelte 5, store the trigger ref in a `let trigger = $state<HTMLElement | undefined>()` and set it in the open handler.

### ARIA for the data table

TanStack Table renders a `<table>` with dynamic sorting and filtering. Screen readers need:

- `aria-sort="ascending" | "descending" | "none"` on `<th>` elements that are currently sorted.
- A live region outside the table that announces the current row count after filtering: "Showing 12 of 48 rows".
- `role="grid"` if cells are individually interactive (clickable rows); otherwise plain `<table>` semantics suffice.

### Dynamic announcements

`aria-live="polite"` tells assistive tech to read changes at the next pause. Place it on a container whose text content you update reactively. In Svelte 5, a `$derived` string bound into the live region template is enough — when the derived value changes, the DOM text changes, and the screen reader announces it.

### Connecting to other chunks

The GSAP timeline and scroll-trigger chunks must wrap their animations in a `prefers-reduced-motion` check. The optimistic-ui-pattern chunk must announce success/failure to the live region after mutations. The form-remote-validation chunk must associate error messages with inputs via `aria-describedby`.
