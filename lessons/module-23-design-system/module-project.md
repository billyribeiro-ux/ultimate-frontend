# Module 23 Project — Publishable Component Library

## Overview

Build a publishable Svelte 5 component library (`@org/ui`) with typed component APIs, 3 themes (light, dark, brand-warm), visual regression tests, automated changelog generation, and npm-ready package.json. The library includes 6 core components — Button, Input, Card, Modal, Tabs, and Toast — each with variant systems, size scales, accessibility baked in, and documentation pages with live previews.

## Requirements

### Functional

1. **Button component:** Variants (`primary`, `secondary`, `ghost`, `danger`), sizes (`sm`, `md`, `lg`), `disabled` and `loading` props, snippet-based children content, rest props forwarded to the underlying `<button>` element. Minimum 44px touch target at all sizes.
2. **Input component:** Variants (`default`, `error`, `success`), sizes (`sm`, `md`, `lg`), `label` as snippet, `error` message display, `$bindable()` value, proper `<label>` association via `id`. Rest props forwarded to the underlying `<input>` element.
3. **Card component:** Variants (`elevated`, `outlined`, `flat`), optional `header` and `footer` snippets, `children` snippet for body content. Composable with any content.
4. **Modal component:** Typed `open` prop (`$bindable()`), `title` string, `children` and optional `footer` snippets, focus trap, escape-key close, backdrop click close, `prefers-reduced-motion` respected for enter/exit animations.
5. **Tabs component (compound):** `<Tabs>`, `<TabList>`, `<Tab>`, `<TabPanel>` sub-components with shared context. Active tab tracked via `$state`. Keyboard navigation (arrow keys, Home, End). ARIA `tablist`, `tab`, and `tabpanel` roles.
6. **Toast component:** Variants (`info`, `success`, `warning`, `error`), auto-dismiss with configurable duration, dismiss button, stacking for multiple toasts, position (`top-right`, `bottom-right`). Toast manager as a `.svelte.ts` reactive class.

### Theming

7. **3 themes:** Light (default PE7 tokens), Dark (dark surface, light text, adjusted brand), Brand Warm (warm hue shift, terracotta brand color). Themes applied via `data-theme` attribute.
8. **Theme switcher component:** A `<ThemeSwitcher />` component that renders theme options and applies the selected theme. Theme persisted in a cookie.
9. **Theme CSS generation:** A `themes.css` file with `:root` base tokens and `[data-theme]` overrides for each theme.

### Testing

10. **Visual regression tests:** At least 3 Playwright screenshot tests covering Button variants, Card variants, and theme switching. Configured with `maxDiffPixelRatio: 0.01`.
11. **Component tests:** At least 3 tests using `@testing-library/svelte` verifying Button click handling, Input value binding, and Modal open/close.

### Packaging

12. **Changelog:** At least 3 changeset entries (1 minor for initial release, 1 patch for a bug fix, 1 minor for a new component) processed into a `CHANGELOG.md`.
13. **package.json:** Valid `exports` field with per-component entry points, `svelte` field, `peerDependencies` for Svelte, `"type": "module"`, `"files": ["dist"]`.
14. **Documentation:** A `/docs` route with at least 3 component documentation pages showing live previews, prop tables, and code examples.

### Technical

- Svelte 5 runes: `$state`, `$derived`, `$effect`, `$props()`, `$bindable()`. No `$:` legacy syntax.
- TypeScript strict mode throughout. No `any` types.
- PE7 CSS tokens exclusively — no raw OKLCH, hex, or RGB values in component styles.
- Mobile-first layout with `min-width` media queries only.
- All interactive elements have a minimum 44px touch target.
- `prefers-reduced-motion` respected for all animations.
- Every `{#each}` block uses a key expression.

### File organization

| File | Purpose |
| --- | --- |
| `src/lib/components/Button.svelte` | Button component |
| `src/lib/components/Input.svelte` | Input component |
| `src/lib/components/Card.svelte` | Card component |
| `src/lib/components/Modal.svelte` | Modal component |
| `src/lib/components/Tabs.svelte` | Tabs compound component |
| `src/lib/components/Toast.svelte` | Toast component |
| `src/lib/components/ThemeSwitcher.svelte` | Theme switching component |
| `src/lib/toast.svelte.ts` | Toast manager reactive class |
| `src/lib/styles/themes.css` | Multi-theme token definitions |
| `src/lib/index.ts` | Package entry point (re-exports) |
| `src/routes/docs/+layout.svelte` | Documentation layout with sidebar |
| `src/routes/docs/button/+page.svelte` | Button documentation page |
| `src/routes/docs/input/+page.svelte` | Input documentation page |
| `src/routes/docs/card/+page.svelte` | Card documentation page |
| `tests/component/button.test.ts` | Button component tests |
| `tests/component/input.test.ts` | Input component tests |
| `tests/component/modal.test.ts` | Modal component tests |
| `tests/visual/components.test.ts` | Visual regression screenshots |
| `package.json` | npm-ready package configuration |
| `CHANGELOG.md` | Generated changelog |

### Stretch goals

- Add a `DataTable` component using TanStack Table (from Module 11) with sorting, filtering, and pagination — all themed and typed.
- Build a Figma-to-tokens script that reads a JSON export from Figma Variables and generates the `themes.css` file automatically.
- Add a "component playground" page (like Lesson 23.3's mini-build) for every documented component, allowing visitors to configure props interactively.
- Implement automated accessibility testing using `axe-core` integrated with Playwright, verifying every component state passes WCAG AA.
- Add a package size dashboard that tracks the gzipped size of each component and the total library, alerting when a component exceeds a size budget.

## Evaluation criteria

| Criterion | Weight |
| --- | --- |
| Component API design (typed props, variants, sizes) | 20% |
| Multi-theme implementation (3 themes, CSS custom properties) | 15% |
| Accessibility (keyboard navigation, ARIA, touch targets) | 15% |
| Visual regression and component tests | 15% |
| Documentation quality (live previews, prop tables) | 15% |
| Package configuration (exports, types, tree-shaking) | 10% |
| PE7 compliance and responsive design | 10% |

## Submission

Push to a branch named `module-23-project`. All component tests must pass. The package.json must have valid exports for all 6 components. The theme switcher must apply 3 distinct themes. The documentation pages must render live component previews. TypeScript must compile with zero errors under strict mode.
