# PE7 CSS System Cheat Sheet

## @layer Order (lowest → highest specificity)

| Layer | Purpose |
|-------|---------|
| `@layer reset` | Normalize browser defaults |
| `@layer tokens` | Design token custom properties |
| `@layer base` | Element-level typography and defaults |
| `@layer layout` | Page-level grid and container structure |
| `@layer components` | Reusable component styles |
| `@layer utilities` | Single-purpose overrides (last wins) |

```css
@layer reset, tokens, base, layout, components, utilities;
```

## Token Variables

### Colors (OKLCH)

| Token | Meaning |
|-------|---------|
| `--color-primary` | Brand primary (interactive elements) |
| `--color-secondary` | Supporting accent |
| `--color-surface` | Background surfaces |
| `--color-surface-alt` | Elevated/card backgrounds |
| `--color-text` | Primary body text |
| `--color-text-muted` | Secondary/subdued text |
| `--color-border` | Dividers and outlines |
| `--color-success` | Positive feedback |
| `--color-warning` | Caution states |
| `--color-error` | Error/destructive states |

### Spacing

| Token | Value |
|-------|-------|
| `--space-xs` | 0.25rem (4px) |
| `--space-sm` | 0.5rem (8px) |
| `--space-md` | 1rem (16px) |
| `--space-lg` | 1.5rem (24px) |
| `--space-xl` | 2rem (32px) |
| `--space-2xl` | 3rem (48px) |
| `--space-3xl` | 4rem (64px) |

### Typography

| Token | Purpose |
|-------|---------|
| `--text-xs` | Caption / fine print |
| `--text-sm` | Small body / labels |
| `--text-base` | Default body |
| `--text-lg` | Lead paragraph |
| `--text-xl` | Subheading |
| `--text-2xl` | Section heading |
| `--text-3xl` | Page heading |
| `--text-4xl` | Hero / display |

### Motion

| Token | Value | Use |
|-------|-------|-----|
| `--dur-instant` | 100ms | Micro-interactions |
| `--dur-fast` | 200ms | Hover, focus states |
| `--dur-normal` | 300ms | Reveals, transitions |
| `--dur-slow` | 500ms | Page transitions |
| `--ease-out` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Enter/appear |
| `--ease-in` | `cubic-bezier(0.4, 0.0, 1, 1)` | Exit/disappear |
| `--ease-in-out` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Move/resize |

### Radius & Shadow

| Token | Purpose |
|-------|---------|
| `--radius-sm` | Buttons, inputs |
| `--radius-md` | Cards |
| `--radius-lg` | Modals, panels |
| `--radius-full` | Circles, pills |
| `--shadow-sm` | Subtle elevation |
| `--shadow-md` | Cards, dropdowns |
| `--shadow-lg` | Modals, popovers |

## Mobile-First Breakpoints (min-width only)

```css
/* Default styles = mobile */
.component { padding: var(--space-sm); }

@media (min-width: 40em)  { /* sm: 640px  — large phones, landscape */ }
@media (min-width: 48em)  { /* md: 768px  — tablets */ }
@media (min-width: 64em)  { /* lg: 1024px — laptops */ }
@media (min-width: 80em)  { /* xl: 1280px — desktops */ }
@media (min-width: 96em)  { /* 2xl: 1536px — large screens */ }
```

**Rule: NEVER use `max-width`. Always build up from mobile.**

## OKLCH Color Model

```
oklch(L% C H)
      │  │ │
      │  │ └─ Hue: 0–360 (color wheel angle)
      │  └─── Chroma: 0–0.4 (saturation intensity)
      └────── Lightness: 0%–100% (0 = black, 100 = white)
```

| WCAG AA contrast | Min L% difference (approx) |
|------------------|---------------------------|
| Normal text (4.5:1) | ~45% between text and bg |
| Large text (3:1) | ~35% between text and bg |

## Fluid clamp() Formula

```css
/* clamp(min, preferred, max) */
font-size: clamp(1rem, 0.5rem + 2vw, 2.5rem);
padding: clamp(var(--space-sm), 3vw, var(--space-xl));

/* Formula: preferred = min + (max - min) * viewport-factor */
```

## Container Query Pattern

```css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-inline-size: 400px) {
  .card { grid-template-columns: 1fr 2fr; }
}
```

## Logical Properties Mapping

| Physical | Logical | Direction |
|----------|---------|-----------|
| `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end` | Horizontal |
| `margin-top` / `margin-bottom` | `margin-block-start` / `margin-block-end` | Vertical |
| `padding-left` / `padding-right` | `padding-inline-start` / `padding-inline-end` | Horizontal |
| `width` | `inline-size` | Horizontal |
| `height` | `block-size` | Vertical |
| `text-align: left` | `text-align: start` | Inline |
| `border-left` | `border-inline-start` | Horizontal |

## Nesting Pattern for States

```css
.button {
  background: var(--color-primary);
  transition: background var(--dur-fast) var(--ease-out);

  &:hover {
    background: oklch(from var(--color-primary) calc(l - 0.1) c h);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &:active {
    scale: 0.97;
  }

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
```

## Per-Page Color Personality Pattern

```css
/* In +page.svelte <style> */
:global(html) {
  --color-primary: oklch(55% 0.25 260);   /* Blue personality */
  --color-surface: oklch(98% 0.005 260);
}

/* Or via a layout data attribute */
[data-page="about"] {
  --color-primary: oklch(60% 0.2 145);    /* Green personality */
}
```

## prefers-reduced-motion Pattern

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Common Mistakes

- **Using `max-width` media queries** — breaks mobile-first; use `min-width` only.
- **Hardcoding px values** — use token variables for consistency and theming.
- **Using `rgb()` or `hsl()`** — PE7 uses OKLCH for perceptual uniformity; don't mix models.
- **Forgetting `container-type`** — container queries won't fire without declaring the container.
- **Physical properties in RTL-aware components** — use logical properties for internationalization.
- **Setting `transition: all`** — causes layout thrash; be explicit about which properties transition.
- **Skipping the `prefers-reduced-motion` check** — accessibility requirement for all animation.
- **Putting component styles in `@layer utilities`** — utilities are single-purpose overrides only.
