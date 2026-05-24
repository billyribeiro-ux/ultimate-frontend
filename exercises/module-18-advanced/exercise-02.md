---
module: 18
exercise: 2
title: "Polymorphic as Prop"
difficulty: intermediate
estimated_time: 20
skills_tested:
  - dynamic element rendering
  - type-safe polymorphic props
  - HTML semantic flexibility
  - generic component patterns
---

# Exercise 18.2 — Polymorphic `as` Prop

## Brief

Create a `Box` component that accepts an `as` prop to control which HTML element it renders. `<Box as="article">` renders an `<article>`, `<Box as="section">` renders a `<section>`, and so on. The component must forward all valid HTML attributes for the specified element while maintaining type safety. This exercise teaches the polymorphic component pattern used in design system libraries.

## Requirements

1. Create `src/lib/exercises/18/Box.svelte` with an `as` prop that defaults to `'div'`
2. The component must render the element specified by `as`
3. Support at least: `div`, `section`, `article`, `aside`, `main`, `header`, `footer`, `nav`, `span`
4. Forward all remaining props to the rendered element using `{...restProps}`
5. Accept a `children` snippet for content
6. Add a `variant` prop with values `'default' | 'surface' | 'elevated'` for pre-built styles
7. The component must be type-safe — passing `href` when `as="div"` should be a type error concept (document this)
8. Create `src/routes/exercises/18-advanced/02/+page.svelte` demonstrating different element types and variants
9. Style with PE7 tokens

## Constraints

- No `{@html}` — use Svelte's element rendering
- TypeScript strict mode
- The component must work with PE7 token classes

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

In Svelte 5, you can use `<svelte:element this={as}>` to dynamically render any HTML element. The `this` attribute accepts a string tag name. Spread `{...restProps}` on the element to forward any additional attributes.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Destructure the known props (`as`, `variant`, `class`, `children`) and collect the rest into `restProps`. Use `<svelte:element this={as} class={computedClass} {...restProps}>`. The `variant` prop maps to CSS classes or data attributes for styling.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLElement> {
    as?: string;
    variant?: 'default' | 'surface' | 'elevated';
    children: Snippet;
  }

  let { as = 'div', variant = 'default', children, class: className, ...restProps }: Props = $props();
</script>

<svelte:element this={as} class="{className ?? ''} box" data-variant={variant} {...restProps}>
  {@render children()}
</svelte:element>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/18/Box.svelte`**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type ValidElement = 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer' | 'nav' | 'span';

  interface Props extends HTMLAttributes<HTMLElement> {
    as?: ValidElement;
    variant?: 'default' | 'surface' | 'elevated';
    children: Snippet;
  }

  let {
    as = 'div',
    variant = 'default',
    children,
    class: className,
    ...restProps
  }: Props = $props();

  const computedClass: string = $derived(
    ['box', variant !== 'default' ? variant : '', className].filter(Boolean).join(' ')
  );
</script>

<svelte:element this={as} class={computedClass} data-variant={variant} {...restProps}>
  {@render children()}
</svelte:element>

<style>
  .box {
    /* Base box styles */
  }

  .box:where([data-variant='surface']) {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
  }

  .box:where([data-variant='elevated']) {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    box-shadow: var(--shadow-lg);
  }
</style>
```

**`src/routes/exercises/18-advanced/02/+page.svelte`**

```svelte
<script lang="ts">
  import Box from '$lib/exercises/18/Box.svelte';
</script>

<main class="page">
  <h1>Polymorphic Box</h1>
  <p class="intro">The same component renders different HTML elements via the <code>as</code> prop.</p>

  <div class="demo-grid">
    <Box as="article" variant="surface">
      <h2>as="article"</h2>
      <p>Renders a semantic &lt;article&gt; element with surface styling.</p>
    </Box>

    <Box as="section" variant="elevated">
      <h2>as="section"</h2>
      <p>Renders a &lt;section&gt; with elevated shadow styling.</p>
    </Box>

    <Box as="aside" variant="surface">
      <h2>as="aside"</h2>
      <p>Renders an &lt;aside&gt; for complementary content.</p>
    </Box>

    <Box as="nav" variant="surface" aria-label="Demo navigation">
      <h2>as="nav"</h2>
      <p>Renders a &lt;nav&gt; — notice the aria-label is forwarded.</p>
    </Box>

    <Box as="div" variant="default">
      <h2>as="div" (default)</h2>
      <p>The default element is a plain &lt;div&gt; with no variant styling.</p>
    </Box>
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }
  .intro code { background: var(--color-surface-2); padding: 0.1em 0.3em; border-radius: var(--radius-sm); font-size: var(--text-xs); }

  .demo-grid { display: grid; gap: var(--space-md); }

  h2 { font-size: var(--text-base); margin-block-end: var(--space-xs); }
  p { font-size: var(--text-sm); color: var(--color-text-muted); }
</style>
```

### Explanation

The polymorphic component pattern uses `<svelte:element this={as}>` to dynamically choose the rendered HTML element at runtime. This is essential for design systems where the same visual component might need different semantic meanings — a card might be an `<article>` in a blog feed but a `<div>` in a dashboard. The `...restProps` spread ensures all HTML attributes (including ARIA attributes like `aria-label`) are forwarded to the actual DOM element. The `data-variant` attribute drives styling through CSS attribute selectors, which keeps the styling scoped without generating dynamic class names. The `:where()` pseudo-class keeps specificity at zero, making it easy to override styles from the consuming component. In a full design system, you would extend the type definitions to provide element-specific attribute types (e.g., `href` only valid when `as="a"`), but this requires advanced TypeScript generics that go beyond Svelte's current component type system.
</details>
