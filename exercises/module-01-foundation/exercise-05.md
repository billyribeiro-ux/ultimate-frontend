---
module: 1
exercise: 5
title: Design Token Audit Tool
difficulty: principal
estimated_time: 60
skills_tested:
  - token architecture design
  - TypeScript type system
  - mobile-first layout
  - component composition
  - OKLCH color theory
---

# Exercise 1.5 — Design Token Audit Tool

## Brief

Design and build a single-page "token explorer" that reads the PE7 design system tokens and renders them as a visual audit tool. The page should display color swatches, typography samples, spacing visualizations, and shadow examples — all generated from the actual token values. This is an architectural challenge: how do you represent a design system as typed data and render it meaningfully?

## Requirements

1. Create `src/routes/exercises/01-foundation/05/+page.svelte`
2. Define TypeScript types for the token categories: `ColorToken`, `TypographyToken`, `SpacingToken`, `ShadowToken`, `RadiusToken`
3. Create typed arrays of tokens with their names, CSS variable references, and descriptive labels
4. Render a "Colors" section with visual swatches showing each color token's output
5. Render a "Typography" section showing each text size token applied to sample text
6. Render a "Spacing" section with boxes whose padding demonstrates each spacing token
7. Render a "Shadows" section with cards showing each shadow level
8. Render a "Radii" section with boxes at each border-radius token
9. The layout must be scannable — use CSS Grid to organize token groups
10. The page must be fully navigable on mobile (320px)
11. Include a sticky nav that links to each section via anchor IDs
12. All rendering must be data-driven (add a token to the array, it appears on the page)

## Constraints

- No hardcoded CSS for individual tokens — everything renders from the typed data arrays
- No component library — raw Svelte only
- No JavaScript to read computed styles (use the variable references directly)
- The page must work without JavaScript enabled (SSR-compatible)
- TypeScript strict mode — design the type system to prevent invalid token entries

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Think of each token category as an array of objects. A `ColorToken` might be `{ name: '--color-brand', label: 'Brand', category: 'semantic' }`. The template iterates these arrays and applies the CSS variable inline (this is the one case where inline styles are justified — you are demonstrating the variable's value).
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

For swatches, render a `<div>` with `style="background: var({token.name})"`. For typography, render text with `style="font-size: var({token.name})"`. The sticky nav uses `position: sticky; inset-block-start: 0`. Each section gets an `id` for anchor navigation. The type system should use discriminated unions so each token category is distinct.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  interface ColorToken {
    kind: 'color';
    name: string;
    label: string;
    category: 'brand' | 'surface' | 'text' | 'feedback';
  }

  interface TypographyToken {
    kind: 'typography';
    name: string;
    label: string;
    sampleText: string;
  }

  // ... more token types

  type DesignToken = ColorToken | TypographyToken | SpacingToken | ShadowToken | RadiusToken;

  const colors: ColorToken[] = [
    { kind: 'color', name: '--color-brand', label: 'Brand', category: 'brand' },
    // ...
  ];
</script>

{#each colors as token}
  <div class="swatch" style="background: var({token.name})">
    <code>{token.name}</code>
  </div>
{/each}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  interface ColorToken {
    kind: 'color';
    name: string;
    label: string;
    category: 'brand' | 'surface' | 'text' | 'feedback';
  }

  interface TypographyToken {
    kind: 'typography';
    name: string;
    label: string;
  }

  interface SpacingToken {
    kind: 'spacing';
    name: string;
    label: string;
  }

  interface ShadowToken {
    kind: 'shadow';
    name: string;
    label: string;
  }

  interface RadiusToken {
    kind: 'radius';
    name: string;
    label: string;
  }

  const colors: ColorToken[] = [
    { kind: 'color', name: '--color-brand', label: 'Brand', category: 'brand' },
    { kind: 'color', name: '--color-brand-dim', label: 'Brand Dim', category: 'brand' },
    { kind: 'color', name: '--color-surface', label: 'Surface', category: 'surface' },
    { kind: 'color', name: '--color-surface-2', label: 'Surface 2', category: 'surface' },
    { kind: 'color', name: '--color-text', label: 'Text', category: 'text' },
    { kind: 'color', name: '--color-text-muted', label: 'Text Muted', category: 'text' },
    { kind: 'color', name: '--color-border', label: 'Border', category: 'surface' },
    { kind: 'color', name: '--color-error', label: 'Error', category: 'feedback' },
    { kind: 'color', name: '--color-success', label: 'Success', category: 'feedback' },
    { kind: 'color', name: '--color-warning', label: 'Warning', category: 'feedback' }
  ];

  const typography: TypographyToken[] = [
    { kind: 'typography', name: '--text-xs', label: 'Extra Small' },
    { kind: 'typography', name: '--text-sm', label: 'Small' },
    { kind: 'typography', name: '--text-base', label: 'Base' },
    { kind: 'typography', name: '--text-lg', label: 'Large' },
    { kind: 'typography', name: '--text-xl', label: 'Extra Large' },
    { kind: 'typography', name: '--text-2xl', label: '2X Large' },
    { kind: 'typography', name: '--text-hero', label: 'Hero' }
  ];

  const spacing: SpacingToken[] = [
    { kind: 'spacing', name: '--space-xs', label: 'XS' },
    { kind: 'spacing', name: '--space-sm', label: 'SM' },
    { kind: 'spacing', name: '--space-md', label: 'MD' },
    { kind: 'spacing', name: '--space-lg', label: 'LG' },
    { kind: 'spacing', name: '--space-xl', label: 'XL' },
    { kind: 'spacing', name: '--space-2xl', label: '2XL' }
  ];

  const shadows: ShadowToken[] = [
    { kind: 'shadow', name: '--shadow-sm', label: 'Small' },
    { kind: 'shadow', name: '--shadow-md', label: 'Medium' },
    { kind: 'shadow', name: '--shadow-lg', label: 'Large' }
  ];

  const radii: RadiusToken[] = [
    { kind: 'radius', name: '--radius-sm', label: 'Small' },
    { kind: 'radius', name: '--radius-md', label: 'Medium' },
    { kind: 'radius', name: '--radius-lg', label: 'Large' },
    { kind: 'radius', name: '--radius-xl', label: 'Extra Large' },
    { kind: 'radius', name: '--radius-full', label: 'Full' }
  ];

  interface Section {
    id: string;
    label: string;
  }

  const sections: Section[] = [
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'shadows', label: 'Shadows' },
    { id: 'radii', label: 'Radii' }
  ];
</script>

<nav class="sticky-nav">
  {#each sections as section}
    <a href="#{section.id}">{section.label}</a>
  {/each}
</nav>

<main class="page">
  <h1>PE7 Design Token Audit</h1>

  <section id="colors">
    <h2>Colors</h2>
    <div class="color-grid">
      {#each colors as token}
        <div class="color-card">
          <div class="swatch" style="background: var({token.name})"></div>
          <div class="color-meta">
            <code>{token.name}</code>
            <span class="label">{token.label}</span>
            <span class="category">{token.category}</span>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="typography">
    <h2>Typography</h2>
    <div class="type-stack">
      {#each typography as token}
        <div class="type-row">
          <code class="type-code">{token.name}</code>
          <p class="type-sample" style="font-size: var({token.name})">
            {token.label} — The quick brown fox jumps over the lazy dog
          </p>
        </div>
      {/each}
    </div>
  </section>

  <section id="spacing">
    <h2>Spacing</h2>
    <div class="spacing-stack">
      {#each spacing as token}
        <div class="spacing-row">
          <code>{token.name}</code>
          <div class="spacing-demo">
            <div class="spacing-box" style="padding: var({token.name})">
              <span>{token.label}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="shadows">
    <h2>Shadows</h2>
    <div class="shadow-grid">
      {#each shadows as token}
        <div class="shadow-card" style="box-shadow: var({token.name})">
          <code>{token.name}</code>
          <span>{token.label}</span>
        </div>
      {/each}
    </div>
  </section>

  <section id="radii">
    <h2>Radii</h2>
    <div class="radius-grid">
      {#each radii as token}
        <div class="radius-card" style="border-radius: var({token.name})">
          <code>{token.name}</code>
          <span>{token.label}</span>
        </div>
      {/each}
    </div>
  </section>
</main>

<style>
  .sticky-nav {
    position: sticky;
    inset-block-start: 0;
    z-index: 10;
    background: var(--color-surface);
    border-block-end: 1px solid var(--color-border);
    padding: var(--space-sm) var(--space-md);
    display: flex;
    gap: var(--space-md);
    overflow-x: auto;
  }

  .sticky-nav a {
    font-size: var(--text-sm);
    font-weight: 600;
    white-space: nowrap;
    text-decoration: none;
    color: var(--color-text-muted);
    transition: color var(--dur-fast) var(--ease-out);
  }

  .sticky-nav a:hover {
    color: var(--color-brand);
  }

  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-xl);
  }

  section {
    margin-block-end: var(--space-2xl);
    scroll-margin-block-start: 4rem;
  }

  h2 {
    font-size: var(--text-xl);
    margin-block-end: var(--space-lg);
    padding-block-end: var(--space-xs);
    border-block-end: 2px solid var(--color-brand);
  }

  /* Colors */
  .color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: var(--space-md);
  }

  .color-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .swatch {
    block-size: 4rem;
  }

  .color-meta {
    padding: var(--space-sm);
    display: grid;
    gap: var(--space-xs);
  }

  .color-meta code {
    font-size: var(--text-xs);
  }

  .label {
    font-size: var(--text-sm);
    font-weight: 600;
  }

  .category {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Typography */
  .type-stack {
    display: grid;
    gap: var(--space-lg);
  }

  .type-row {
    display: grid;
    gap: var(--space-xs);
  }

  .type-code {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .type-sample {
    color: var(--color-text);
    max-inline-size: none;
  }

  /* Spacing */
  .spacing-stack {
    display: grid;
    gap: var(--space-md);
  }

  .spacing-row {
    display: grid;
    grid-template-columns: 10rem 1fr;
    align-items: center;
    gap: var(--space-md);
  }

  @media (max-width: 479px) {
    .spacing-row {
      grid-template-columns: 1fr;
    }
  }

  .spacing-box {
    background: var(--color-brand);
    color: oklch(100% 0 0);
    font-size: var(--text-xs);
    font-weight: 600;
    border-radius: var(--radius-sm);
    display: inline-block;
  }

  /* Shadows */
  .shadow-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: var(--space-xl);
  }

  .shadow-card {
    background: var(--color-surface);
    padding: var(--space-lg);
    border-radius: var(--radius-md);
    display: grid;
    gap: var(--space-xs);
    text-align: center;
  }

  .shadow-card code {
    font-size: var(--text-xs);
  }

  /* Radii */
  .radius-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    gap: var(--space-lg);
  }

  .radius-card {
    background: var(--color-surface-2);
    border: 2px solid var(--color-brand);
    padding: var(--space-lg);
    display: grid;
    place-items: center;
    gap: var(--space-xs);
    aspect-ratio: 1;
    text-align: center;
  }

  .radius-card code {
    font-size: var(--text-xs);
  }
</style>
```

### Explanation

This exercise is architectural because it requires thinking about how to represent a design system as data. The discriminated union pattern (`kind` field) allows you to handle each token type differently in the template while maintaining type safety. The inline `style` attribute is justified here — we are demonstrating variable values, which is inherently dynamic. At scale, this tool becomes a living style guide that stays in sync with `app.css` because it references the same variables. A production version might read token values from a JSON file generated by a CSS parser, or use `getComputedStyle()` to show resolved values — but the SSR-compatible approach (referencing variables directly) works without JavaScript and renders correctly on first paint.
</details>
