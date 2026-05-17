# Accessibility Checklist

## ARIA Roles — When to Use

| Role | Use When | Example |
|------|----------|---------|
| `role="button"` | Non-button element acts as button | `<div role="button" tabindex="0">` |
| `role="dialog"` | Modal overlay | `<div role="dialog" aria-modal="true">` |
| `role="alert"` | Urgent message announced immediately | Toast/snackbar |
| `role="status"` | Non-urgent live update | Loading spinner text |
| `role="tablist"` / `tab` / `tabpanel` | Tab interface | Grouped content panels |
| `role="listbox"` / `option` | Custom select/dropdown | Autocomplete results |
| `role="menu"` / `menuitem` | Application menu (NOT navigation) | Actions dropdown |
| `role="navigation"` | Major nav block | `<nav>` already implies this |
| `role="region"` | Landmark with label | `<section aria-labelledby="heading">` |
| `role="img"` | Decorative group treated as single image | SVG icon with `aria-label` |

**Rule: prefer semantic HTML (`<button>`, `<dialog>`, `<nav>`) over ARIA roles.**

## Key ARIA Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `aria-label` | Accessible name (no visible text) | Icon buttons |
| `aria-labelledby` | Reference visible label by id | Dialog titled by heading |
| `aria-describedby` | Additional description | Input linked to help text |
| `aria-expanded` | Open/close state | Accordion, dropdown |
| `aria-hidden="true"` | Remove from accessibility tree | Decorative elements |
| `aria-live="polite"` | Announce updates when idle | Search result count |
| `aria-current="page"` | Active nav item | Current page link |
| `aria-invalid="true"` | Input has validation error | Form error state |

## Focus Management Patterns

### Focus Trap (Dialogs/Modals)

```ts
// Keep Tab cycling within the modal
const focusable = modal.querySelectorAll<HTMLElement>(
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
);
const first = focusable[0];
const last = focusable[focusable.length - 1];

modal.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
  else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
});
```

### Focus Restore

```ts
const trigger = document.activeElement as HTMLElement;
openDialog();
// On close:
trigger.focus();
```

### Skip Link

```svelte
<a href="#main-content" class="skip-link">Skip to main content</a>
<!-- ... nav ... -->
<main id="main-content" tabindex="-1">...</main>
```

```css
.skip-link {
  position: absolute;
  inset-inline-start: -9999px;
  &:focus { inset-inline-start: var(--space-md); top: var(--space-md); z-index: 9999; }
}
```

## Keyboard Navigation by Component

| Component | Keys Required |
|-----------|--------------|
| **Button** | `Enter`, `Space` → activate |
| **Link** | `Enter` → follow |
| **Listbox** | `↑/↓` navigate, `Enter/Space` select, `Home/End` jump, type-ahead |
| **Dialog** | `Escape` → close, `Tab` trapped inside |
| **Tabs** | `←/→` switch tab (horizontal), `↑/↓` (vertical), `Home/End` |
| **Accordion** | `Enter/Space` toggle, `↑/↓` between headers, `Home/End` |
| **Menu** | `↑/↓` navigate, `Enter` activate, `Escape` close |
| **Combobox** | `↑/↓` list, `Enter` select, `Escape` close, typing filters |
| **Slider** | `←/→` step, `Home/End` min/max, `PageUp/PageDown` large step |
| **Tree** | `←/→` expand/collapse, `↑/↓` navigate, `Enter` activate |

## Touch Targets

```css
/* Minimum 44x44px interactive area */
.touch-target {
  min-inline-size: 44px;
  min-block-size: 44px;
  /* If visual size is smaller, extend hit area with padding or pseudo-element */
}

/* Extend small icons to meet touch target */
.icon-button {
  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset: -8px; /* extend hit area */
  }
}
```

## Color Contrast Requirements

| Level | Normal Text | Large Text (18px+/14px bold) | UI Components |
|-------|-------------|------------------------------|---------------|
| WCAG AA | 4.5:1 | 3:1 | 3:1 |
| WCAG AAA | 7:1 | 4.5:1 | N/A |

### OKLCH Values That Pass AA on White (L=100%)

| Use | OKLCH | Approx Ratio |
|-----|-------|------|
| Body text | `oklch(30% 0 0)` | ~10:1 |
| Muted text | `oklch(45% 0 0)` | ~5:1 |
| Large headings | `oklch(50% 0.1 250)` | ~4:1 |
| Interactive (links) | `oklch(45% 0.2 260)` | ~5:1 |
| **Fails** | `oklch(65%+ any any)` | < 3:1 on white |

## prefers-reduced-motion Implementation

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```ts
// JavaScript guard
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReduced) {
  gsap.from(el, { opacity: 0, y: 20 });
}
```

## Screen Reader Testing Checklist

- [ ] All images have alt text (or `alt=""` for decorative)
- [ ] All form inputs have associated `<label>` or `aria-label`
- [ ] Headings follow hierarchy (h1 → h2 → h3, no skips)
- [ ] Link text is descriptive (no "click here")
- [ ] Dynamic content changes are announced (`aria-live`)
- [ ] Error messages linked to inputs (`aria-describedby`)
- [ ] Page title updates on navigation (`<svelte:head><title>`)
- [ ] Landmark regions present (nav, main, footer)
- [ ] Tables have `<caption>` or `aria-label`
- [ ] Custom widgets have correct role + keyboard support

## Lighthouse Accessibility 100 Requirements

| Category | Key Checks |
|----------|-----------|
| Names & Labels | Every interactive element has accessible name |
| Color Contrast | All text meets 4.5:1 (AA) minimum |
| Navigation | Skip link present, focus order logical |
| ARIA | Valid roles, states, properties; no misuse |
| Forms | Labels, error identification, required indication |
| Tables | Headers, scope, caption |
| Media | Captions for video, alt for images |
| Semantics | Correct heading hierarchy, landmark regions |
| Language | `lang` attribute on `<html>` |

## Quick Audit Shortcuts

```bash
# Lighthouse CLI
npx lighthouse http://localhost:5173 --only-categories=accessibility --output=html

# axe-core in Playwright
import AxeBuilder from '@axe-core/playwright';
const results = await new AxeBuilder({ page }).analyze();
expect(results.violations).toEqual([]);
```

## Common Mistakes

- **Using `div` and `span` for interactive elements** — screen readers don't announce them; use `<button>` or add role + tabindex + keydown.
- **`aria-hidden="true"` on focusable elements** — creates ghost focus; remove from tab order too.
- **Missing `alt` on meaningful images** — screen readers say "image" with no context.
- **Color as only indicator** — colorblind users can't see red = error; add icons/text.
- **Auto-playing media** — disorienting; always require user interaction to start.
- **Focus outline removed without replacement** — `outline: none` without visible focus style = invisible keyboard navigation.
- **`tabindex` > 0** — disrupts natural tab order; use 0 or -1 only.
- **Live regions added after content** — add `aria-live` to the container before content changes.
