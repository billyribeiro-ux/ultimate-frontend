---
module: 23
lesson: 23.7
title: Multi-theme architecture
duration: 55 minutes
prerequisites:
  - "23.2 — Token pipeline"
  - "6.9 — Per-page color personalities"
  - "6.2 — OKLCH color system in depth"
learning_objectives:
  - Design a theme architecture that supports more than light and dark modes
  - Implement brand themes and white-labeling using CSS custom property cascading
  - Build a theme switching mechanism that applies themes at runtime
  - Handle theme persistence across page loads using cookies or localStorage
  - Evaluate the trade-offs of CSS-only themes vs build-time theme generation
status: ready
---

# Lesson 23.7 — Multi-theme architecture

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Beyond light and dark

### 1.1 The problem: one product, many visual identities

Dark mode was the beginning. Users want to choose between light and dark. But real-world design systems face more complex theming requirements:

- A SaaS product with three pricing tiers, each with its own brand color (blue for starter, purple for pro, gold for enterprise).
- A white-label platform where each customer wants their own colors, logos, and typography.
- An accessibility theme with high-contrast colors and larger text that meets WCAG AAA (7:1 contrast ratio).
- A seasonal theme for marketing campaigns (holiday red, spring green, summer blue).

These requirements go far beyond `prefers-color-scheme: dark`. They need a **multi-theme architecture** — a system where any number of themes can be defined, applied, and switched at runtime.

### 1.2 CSS custom property cascading strategy

The foundation is CSS custom properties and the cascade. Tokens in PE7 are defined on `:root`. A theme overrides those tokens on a data attribute selector:

```css
/* Base tokens — light theme by default */
:root {
    --color-brand: oklch(65% 0.22 270);
    --color-surface: oklch(98% 0.01 270);
    --color-text: oklch(20% 0.02 270);
}

/* Dark theme */
[data-theme="dark"] {
    --color-brand: oklch(72% 0.20 270);
    --color-surface: oklch(18% 0.02 270);
    --color-text: oklch(96% 0.01 270);
}

/* Brand warm theme */
[data-theme="brand-warm"] {
    --color-brand: oklch(65% 0.18 50);
    --color-surface: oklch(97% 0.02 50);
    --color-text: oklch(22% 0.02 50);
}

/* High contrast theme */
[data-theme="high-contrast"] {
    --color-brand: oklch(50% 0.30 270);
    --color-surface: oklch(100% 0 0);
    --color-text: oklch(0% 0 0);
}
```

When you set `data-theme="dark"` on the `<html>` element, every component that uses `var(--color-surface)` automatically picks up the dark theme value. No component code changes. No prop drilling. The cascade handles everything.

### 1.3 Theme token categories

Not all tokens need theme variants. Categorize tokens into:

**Themeable tokens** — values that change between themes. Colors are the primary example. In a dark theme, surfaces become dark, text becomes light, and brand colors might adjust for sufficient contrast against dark backgrounds.

**Stable tokens** — values that remain consistent across all themes. Spacing (`--space-md`), radii (`--radius-md`), shadows (shape, not color), typography scale (`--text-lg`), and motion timing (`--dur-base`). These define the spatial and temporal personality of the design system, which should feel consistent regardless of color theme.

The distinction is important: if you include spacing in theme definitions, switching themes will change the layout, which is almost never the desired behavior. Themes should change how the product looks (colors, contrast), not how it is structured (spacing, layout).

### 1.4 Theme switching mechanism

Switching themes at runtime is a JavaScript one-liner:

```typescript
function setTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
}
```

To persist the theme across page loads, store it in a cookie (for SSR compatibility) or localStorage (client-side only):

```typescript
function setTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}
```

On the server side, read the cookie in `hooks.server.ts` and inject the theme into the HTML response. This prevents a flash of the wrong theme (FOWT) on page load:

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const theme: string = event.cookies.get('theme') ?? 'light';
    return resolve(event, {
        transformPageChunk: ({ html }) =>
            html.replace('<html', `<html data-theme="${theme}"`)
    });
};
```

### 1.5 White-labeling architecture

White-labeling takes theming further: each customer gets their own brand colors, logo, and potentially typography. The token system handles this by defining customer-specific theme CSS:

```css
[data-theme="customer-acme"] {
    --color-brand: oklch(60% 0.20 150);  /* green */
    --color-brand-dim: oklch(50% 0.16 150);
}

[data-theme="customer-globex"] {
    --color-brand: oklch(58% 0.22 30);   /* orange */
    --color-brand-dim: oklch(48% 0.18 30);
}
```

The customer theme is determined at login time and applied via the data attribute. All components render with the customer's brand color without any component-level logic.

For white-label deployments at scale (100+ customers), generating CSS at build time from a database of customer tokens is more practical than maintaining 100 CSS files. The token pipeline (Lesson 23.2) can read customer tokens from a JSON API and generate per-customer CSS.

### 1.6 OKLCH advantages for theming

OKLCH's perceptual uniformity makes it ideal for multi-theme systems:

- **Consistent perceived brightness.** When you change a theme's hue (from blue to green), keeping the same lightness (L) and chroma (C) values ensures the new color feels equally bright. With hex or HSL, changing hue shifts perceived brightness unpredictably.
- **Contrast calculation.** OKLCH lightness maps closely to perceived contrast. You can programmatically verify that text on a surface meets WCAG AA (4.5:1) or AAA (7:1) contrast by comparing their L values: a difference of ~50% in L typically satisfies AA.
- **Systematic color generation.** Given a brand hue, you can generate an entire color palette by varying L and C systematically: brand (65% L), brand-dim (55% L), brand-light (80% L), brand-surface (95% L).

### 1.7 "In Production" — multi-brand theming at a media company

A media company operating 5 news brands (each with distinct brand colors and personality) built a shared SvelteKit application with 5 theme CSS files. Each brand's domain mapped to a theme: `brand-a.com` loaded `[data-theme="brand-a"]`. The application code was 100% shared. Only the theme CSS and logo differed. When they launched a 6th brand, the engineering work was: (1) create a theme JSON file with the brand colors, (2) run the token pipeline to generate CSS, (3) configure the domain mapping. Total time: 2 hours. Without the multi-theme architecture, launching a new brand would have required forking the entire codebase.

### 1.8 The TypeScript angle

Type-safe theme management:

```typescript
type ThemeId = 'light' | 'dark' | 'brand-warm' | 'high-contrast';

interface ThemeDefinition {
    id: ThemeId;
    label: string;
    description: string;
    tokens: Record<string, string>;
}

function isValidTheme(value: string): value is ThemeId {
    return ['light', 'dark', 'brand-warm', 'high-contrast'].includes(value);
}

function getThemeFromCookie(cookies: string): ThemeId {
    const match: RegExpMatchArray | null = cookies.match(/theme=([^;]+)/);
    const value: string = match?.[1] ?? 'light';
    return isValidTheme(value) ? value : 'light';
}
```

The `isValidTheme` type guard narrows a `string` to a `ThemeId`, preventing invalid theme values from reaching the DOM.

### 1.9 Common interview question

**Q: "How would you implement a multi-theme system using CSS custom properties without any JavaScript framework involvement?"**

**Model answer:** Define base tokens on `:root` and theme overrides on attribute selectors like `[data-theme="dark"]`. Set the `data-theme` attribute on the `<html>` element to activate a theme. All components reference tokens via `var()` and automatically inherit the active theme's values through CSS cascade. Persist the theme choice in a cookie. On the server, read the cookie and inject the `data-theme` attribute into the HTML before sending it to the browser, preventing a flash of the wrong theme. This approach works with any framework or none — it is pure CSS with minimal JavaScript for the attribute toggle.

## Deep Dive

**Theme transitions.** When switching themes, colors can transition smoothly using CSS transitions on the `color`, `background-color`, and `border-color` properties. Add a transition to the root element during theme switches and remove it afterward to prevent every page interaction from animating:

```typescript
function setThemeWithTransition(theme: string): void {
    document.documentElement.style.setProperty('transition', 'color 300ms, background-color 300ms');
    document.documentElement.setAttribute('data-theme', theme);
    setTimeout(() => {
        document.documentElement.style.removeProperty('transition');
    }, 300);
}
```

**System theme detection combined with manual override.** The `prefers-color-scheme` media query detects the OS theme. A design system should: (1) default to the OS preference, (2) allow the user to override it, (3) persist the override. The logic is: if the user has a stored preference, use it; otherwise, follow the OS.

**Theme contrast validation.** For accessibility-critical themes (high-contrast), run automated contrast checks during the token pipeline. For every text/surface token pair, calculate the WCAG contrast ratio and fail the pipeline if any pair falls below the required ratio (4.5:1 for AA, 7:1 for AAA).

**Performance considerations.** CSS custom property changes trigger repaint but not reflow (unless properties like `font-size` are themed, which they should not be). Theming is fast — switching 30 color tokens repaints the page in under 16ms on modern hardware, well within a single animation frame.

**Connection to other lessons.** Lesson 6.9 introduced per-page color personalities. Lesson 23.2 covered the token pipeline that generates theme CSS. Lesson 6.2 explained OKLCH's advantages for systematic color generation. Lesson 23.8 covers publishing theme packages alongside the component library.

## Going Deeper

**Official docs to read next:**

- [developer.mozilla.org/en-US/docs/Web/CSS/--*](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) — CSS custom properties specification.
- [svelte.dev/docs/kit/hooks](https://svelte.dev/docs/kit/hooks) — SvelteKit hooks for server-side theme injection.
- [oklch.com](https://oklch.com/) — OKLCH color picker for designing theme palettes.

**Advanced pattern: theme inheritance for nested brands.** In a micro-frontend or embedded widget scenario, a parent page has one theme and an embedded widget needs a different theme. Use a scoped `data-theme` attribute on the widget's container element. CSS custom properties cascade, so the widget's `[data-theme]` overrides the parent's values for everything inside it.

**Challenge question (combines Lesson 23.7 + Lesson 23.2 + Lesson 6.2):** Design a theme system for a white-label platform with 50 customers. Each customer provides a single brand color (one OKLCH value). From that single color, you need to derive a complete theme: brand, brand-dim, brand-light, surface tints, text colors that meet AA contrast. Describe the algorithm and how the token pipeline would automate this.

## 2. Style it — PE7 applied to the theme switcher

The mini-build is a theme switcher with 4 theme options displayed as cards. Each card shows a preview of the theme's colors as circles using `var(--radius-full)`. The active theme card has a `var(--color-brand)` border and `var(--shadow-md)`. The entire page responds to theme changes — as the student clicks a theme, the page background, text, and accents update to demonstrate the real-time effect of CSS custom property overrides.

## 3. Interact — switching between 4 themes and seeing live results

The problem: theme systems are invisible infrastructure. The interactive element makes them tangible by providing 4 clickable theme cards. Each click applies the theme to the entire page (not just the preview area), demonstrating how a single `data-theme` attribute change cascades through every component.

```typescript
interface ThemeOption {
    id: string;
    label: string;
    description: string;
    brandColor: string;
    surfaceColor: string;
    textColor: string;
}
```

## 4. Mini-build — theme switcher with 4 themes

**File:** `src/routes/modules/23-design-system/07-multi-theme-architecture/+page.svelte`

This page renders a theme switcher with 4 theme options. Clicking a theme applies it to the entire page, demonstrating CSS custom property cascading. Color preview circles show each theme's palette, and the active theme is visually highlighted.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/23-design-system/07-multi-theme-architecture`.

### Prove the concept

1. Click each theme card and watch the entire page's colors update — background, text, borders, and brand accents all change.
2. In DevTools Elements tab, observe the `data-theme` attribute changing on the `<html>` element.
3. In DevTools Computed styles, verify that `--color-brand` resolves to different OKLCH values per theme.
4. Refresh the page — if cookie persistence is implemented, the theme should persist.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why should spacing and typography tokens NOT change between themes?</summary>

Themes should change how the product looks (colors, contrast), not how it is structured (spacing, layout, text size). If spacing changes between themes, switching themes would reflow the entire page, potentially breaking layouts. Users expect themes to change colors, not move elements around. Typography scale changes are reserved for accessibility settings (large text mode), not color themes.
</details>

<details>
<summary><strong>Q2.</strong> How do you prevent a flash of the wrong theme (FOWT) on page load?</summary>

Read the theme cookie on the server in `hooks.server.ts` and inject the `data-theme` attribute into the HTML before sending it to the browser. This way, the first paint uses the correct theme. If you wait for client-side JavaScript to apply the theme, the page briefly renders with the default theme before switching.
</details>

<details>
<summary><strong>Q3.</strong> Why is OKLCH better than hex or HSL for multi-theme color systems?</summary>

OKLCH is perceptually uniform — colors with the same lightness value appear equally bright to the human eye regardless of hue. This means you can change a theme's hue (from blue to green) while keeping the same lightness and chroma, and the new color will feel consistent. HSL's lightness is not perceptually uniform, so HSL 50% lightness blue appears much darker than HSL 50% lightness yellow.
</details>

<details>
<summary><strong>Q4.</strong> What is the difference between a theme and a per-page color personality from Lesson 6.9?</summary>

A theme is a global override that changes the entire application's color palette (light theme, dark theme, brand theme). A per-page color personality is a scoped override that changes colors for a single page or section while keeping the global theme active. Themes affect `:root` or `<html>`. Color personalities affect a specific route's `<style>` block.
</details>

<details>
<summary><strong>Q5.</strong> How would you handle white-labeling for 100 customers with unique brand colors?</summary>

Generate per-customer theme CSS from a database of customer tokens using the token pipeline at build or deploy time. Each customer's theme is a CSS block scoped to `[data-theme="customer-{id}"]`. At login, determine the customer and apply their theme. For 100+ customers, storing all CSS in a single file would be wasteful — load the customer's theme CSS dynamically on authentication.
</details>

## 6. Common mistakes

- **Hardcoding colors in component styles instead of using tokens.** `background: oklch(18% 0.02 270)` will not change when the theme switches. Always use `var(--color-surface)` so the cascade handles theme changes.
- **Theming spacing or typography.** Themes should be visual (colors) not structural (spacing, sizing). Changing `--space-md` between themes breaks layouts.
- **Not testing themes with real content.** A dark theme that looks good on a demo page might have contrast issues on a page with light images, status badges, or colored borders. Test every theme with representative content.
- **Applying the theme attribute on body instead of html.** Some CSS may target `html` directly. Using `data-theme` on `<html>` ensures the broadest cascade coverage, including pseudo-elements and inherited properties.

## 7. What's next

Lesson 23.8 covers the final step — publishing the design system as an npm package with proper package.json configuration, exports field, Svelte field, and tree-shaking verification.
