---
chunk: accessibility-audit
level: 1
penalty: 0
---

# Accessibility Audit — Level 1 Hint (free)

Think about the three pillars: keyboard operability, programmatic relationships, and dynamic announcements.

The skip link is a visually-hidden anchor that becomes visible on `:focus-visible`. It uses a fragment link (`#main-content`) and `tabindex="-1"` on the target so `.focus()` works on a non-interactive element.

For the focus trap, you need to know the first and last focusable elements inside the drawer. On `keydown` of Tab on the last element, prevent default and send focus back to the first. On Shift+Tab on the first element, send focus to the last. Store the element that opened the drawer so you can `.focus()` it on close.

`aria-live="polite"` on the table status region means assistive technology will announce its text content whenever it changes — but only at the next pause in speech. Pair it with `aria-atomic="true"` so the entire region is read, not just the changed word.

Check every `<button>` and `<a>` — if it only contains an icon, it needs `aria-label`. If a group of radio-like toggles exists, wrap them in a `role="group"` with `aria-labelledby`.
