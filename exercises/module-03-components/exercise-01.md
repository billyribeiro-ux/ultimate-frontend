---
module: 3
exercise: 1
title: Extract and Type a Card
difficulty: beginner
estimated_time: 10
skills_tested:
  - $props() rune
  - interface Props
  - component extraction
---

# Exercise 3.1 — Extract and Type a Card

## Brief

Take an inline card markup and extract it into a reusable `Card.svelte` component with typed props. The component must accept `title`, `description`, and an optional `variant` prop that changes its visual style.

## Requirements

1. Create `src/lib/exercises/03/Card.svelte` — the reusable component
2. Create `src/routes/exercises/03-components/01/+page.svelte` — the page using it
3. Define `interface Props` with: `title: string`, `description: string`, `variant?: 'default' | 'elevated' | 'outlined'`
4. Use `$props()` to destructure props with a default value for variant
5. Render the card with the appropriate styling per variant
6. The page must render 3 cards, one per variant, proving the prop works
7. TypeScript strict — passing an invalid variant must error at compile time

## Constraints

- No `export let` (Svelte 4 syntax)
- No `<slot>` (Svelte 4 syntax) — this exercise only uses props
- The variant must affect styling via a class, not inline styles
- All styling with PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

In Svelte 5, props are declared with `const { title, description, variant = 'default' }: Props = $props()`. The interface defines what the parent can pass in.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Use `class:elevated={variant === 'elevated'}` or a dynamic class with `class={variant}` to switch styles. Define separate CSS rules for each variant class inside the component's scoped style block.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<!-- Card.svelte -->
<script lang="ts">
  interface Props {
    title: string;
    description: string;
    variant?: 'default' | 'elevated' | 'outlined';
  }
  const { title, description, variant = 'default' }: Props = $props();
</script>

<article class="card {variant}">
  <h2>{title}</h2>
  <p>{description}</p>
</article>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/03/Card.svelte`**

```svelte
<script lang="ts">
  interface Props {
    title: string;
    description: string;
    variant?: 'default' | 'elevated' | 'outlined';
  }

  const { title, description, variant = 'default' }: Props = $props();
</script>

<article class="card {variant}">
  <h2 class="title">{title}</h2>
  <p class="description">{description}</p>
</article>

<style>
  .card {
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
    display: grid;
    gap: var(--space-sm);
  }

  .card.default {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
  }

  .card.elevated {
    background: var(--color-surface);
    box-shadow: var(--shadow-lg);
  }

  .card.outlined {
    background: transparent;
    border: 2px solid var(--color-brand);
  }

  .title {
    font-size: var(--text-lg);
    color: var(--color-text);
  }

  .description {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
</style>
```

**`src/routes/exercises/03-components/01/+page.svelte`**

```svelte
<script lang="ts">
  import Card from '$lib/exercises/03/Card.svelte';
</script>

<main class="page">
  <h1>Card Component Variants</h1>
  <div class="grid">
    <Card title="Default Card" description="Uses a subtle background with a border." />
    <Card title="Elevated Card" description="Uses shadow for depth." variant="elevated" />
    <Card title="Outlined Card" description="Uses a brand-colored border." variant="outlined" />
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-lg);
  }

  .grid {
    display: grid;
    gap: var(--space-lg);
  }

  @media (min-width: 768px) {
    .grid { grid-template-columns: repeat(3, 1fr); }
  }
</style>
```

### Explanation

This is the fundamental Svelte 5 component pattern. The `interface Props` declares the contract between parent and child. The `$props()` rune replaces Svelte 4's `export let` with a single, typed destructuring assignment. Default values are expressed with standard JavaScript destructuring defaults. The variant prop uses a string union type to constrain valid values at compile time — passing `variant="invalid"` would produce a TypeScript error. The class interpolation `class="card {variant}"` is clean and readable, and the scoped styles ensure each variant's rules stay encapsulated.
</details>
