---
module: 1
exercise: 3
title: Prove Scoping Works
difficulty: advanced
estimated_time: 30
skills_tested:
  - CSS scoping mechanics
  - DevTools investigation
  - specificity understanding
  - component isolation
---

# Exercise 1.3 — Prove Scoping Works

## Brief

Create two sibling components that both use the same class names (`.title`, `.card`) but produce completely different visual outputs. Then create a parent page that renders both side-by-side, proving that Svelte's scoped styles prevent collision. Document your findings by adding a "proof" section that references what you see in DevTools.

## Requirements

1. Create `src/routes/exercises/01-foundation/03/+page.svelte` (parent)
2. Create `src/lib/exercises/01/CardA.svelte` — a card with dark background, light text, large padding
3. Create `src/lib/exercises/01/CardB.svelte` — a card with light background, dark text, compact padding
4. Both components must use EXACTLY the class names `.card` and `.title` — no BEM, no prefixes
5. The parent renders both components. The styles must NOT bleed between them
6. Add a `<p>` in the parent that explains what the hash suffix does (visible on the page)
7. In DevTools: inspect both `.card` elements and verify they have different hash suffixes
8. Both cards must use PE7 tokens for all values

## Constraints

- The class names MUST be identical between components (that is the point)
- No CSS modules, no utility classes, no `!important`
- No global styles in `app.css` for this exercise
- The proof must be visible in the rendered page, not just in code comments

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Svelte automatically appends a hash to every class name in a scoped `<style>` block. Two components using `.card` will compile to `.card.svelte-abc123` and `.card.svelte-xyz789` — they never collide.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Create each component as a standalone `.svelte` file with its own `<style>` block. Import both into the parent page and render them. The visual difference proves isolation. For the explanation paragraph, describe how the compiler generates unique suffixes per component file.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<!-- CardA.svelte -->
<article class="card">
  <h2 class="title">Card A</h2>
</article>
<style>
  .card { background: var(--color-brand); padding: var(--space-xl); }
  .title { color: oklch(100% 0 0); }
</style>

<!-- CardB.svelte -->
<article class="card">
  <h2 class="title">Card B</h2>
</article>
<style>
  .card { background: var(--color-surface); padding: var(--space-sm); }
  .title { color: var(--color-text); }
</style>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/01/CardA.svelte`**

```svelte
<script lang="ts">
  interface Props {
    heading: string;
  }

  const { heading }: Props = $props();
</script>

<article class="card">
  <h2 class="title">{heading}</h2>
  <p class="body">This card uses a dark brand background with generous spacing.</p>
</article>

<style>
  .card {
    background: var(--color-brand);
    padding: var(--space-xl);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
  }

  .title {
    color: oklch(100% 0 0);
    font-size: var(--text-xl);
    margin-block-end: var(--space-sm);
  }

  .body {
    color: oklch(95% 0.01 270);
    font-size: var(--text-sm);
  }
</style>
```

**`src/lib/exercises/01/CardB.svelte`**

```svelte
<script lang="ts">
  interface Props {
    heading: string;
  }

  const { heading }: Props = $props();
</script>

<article class="card">
  <h2 class="title">{heading}</h2>
  <p class="body">This card uses a light surface background with compact spacing.</p>
</article>

<style>
  .card {
    background: var(--color-surface-2);
    padding: var(--space-sm);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
  }

  .title {
    color: var(--color-text);
    font-size: var(--text-base);
    margin-block-end: var(--space-xs);
  }

  .body {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
  }
</style>
```

**`src/routes/exercises/01-foundation/03/+page.svelte`**

```svelte
<script lang="ts">
  import CardA from '$lib/exercises/01/CardA.svelte';
  import CardB from '$lib/exercises/01/CardB.svelte';
</script>

<main class="page">
  <h1>Scoped Style Proof</h1>

  <div class="grid">
    <CardA heading="Card A" />
    <CardB heading="Card B" />
  </div>

  <section class="proof">
    <h2>How this works</h2>
    <p>
      Both components use identical class names: <code>.card</code> and
      <code>.title</code>. Open DevTools and inspect each card element. You will
      see that CardA's article has a class like <code>card svelte-abc123</code>
      while CardB's article has <code>card svelte-xyz789</code>. The Svelte
      compiler appends a unique hash per component file to every selector in that
      component's style block. This means <code>.card</code> in CardA's CSS
      actually compiles to <code>.card.svelte-abc123</code> — a selector that
      can never match CardB's elements. Zero collision, zero configuration.
    </p>
  </section>
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
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    margin-block-end: var(--space-xl);
  }

  @media (min-width: 480px) {
    .grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .proof {
    background: var(--color-surface-2);
    padding: var(--space-lg);
    border-radius: var(--radius-md);
    border-inline-start: 4px solid var(--color-brand);
  }

  .proof h2 {
    font-size: var(--text-lg);
    margin-block-end: var(--space-sm);
  }
</style>
```

### Explanation

Svelte's CSS scoping is a compile-time transformation, not a runtime mechanism. The compiler parses each component's `<style>` block, generates a unique hash from the file content, and appends that hash as an additional class to every element targeted by the styles. This achieves isolation without the runtime cost of CSS-in-JS or the naming discipline of BEM. The key insight: you can write simple, readable class names without fear of global collision. At scale, this means components are truly portable — you can drop them into any project and their styles travel with them.
</details>
