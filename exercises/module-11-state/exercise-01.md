---
module: 11
exercise: 1
title: Context vs Store Decision
difficulty: beginner
estimated_time: 10
skills_tested:
  - setContext and getContext
  - component tree scoping
  - type-safe context keys
---

# Exercise 11.1 — Context vs Store Decision

## Brief

Build a theme provider using Svelte's Context API that provides typed theme data to deeply nested child components without prop drilling. The theme includes color, spacing, and typography tokens that child components consume via `getContext`.

## Requirements

1. Create a `ThemeProvider.svelte` component that accepts a `theme` prop and provides it via `setContext`
2. Define a `Theme` interface with `primary: string`, `surface: string`, `text: string`, and `radius: string`
3. Create a type-safe context key using a `Symbol` or string constant
4. Create three nested child components: `Card.svelte` > `CardHeader.svelte` > `CardTitle.svelte`
5. `CardTitle.svelte` reads the theme from context and applies it — no props passed through intermediate components
6. Create a page that renders two `ThemeProvider` instances with different themes side by side
7. Prove that each provider's children receive their own theme (not the other's)

## Constraints

- No props passed through `Card` or `CardHeader` for theme data
- No global stores — use context only
- Type the context key so that `getContext` returns the correct type

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`setContext` and `getContext` are imported from `'svelte'`. Call `setContext('theme', theme)` in the provider and `getContext<Theme>('theme')` in any descendant. Context is scoped to the component tree — two providers create two separate scopes.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Create a `theme-context.ts` file that exports the key and typed helper functions: `export function setThemeContext(theme: Theme) { setContext(THEME_KEY, theme); }` and `export function getThemeContext(): Theme { return getContext(THEME_KEY); }`. This centralizes the typing.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// src/lib/context/theme.ts
import { setContext, getContext } from 'svelte';

const THEME_KEY = Symbol('theme');

export interface Theme { primary: string; surface: string; text: string; radius: string; }

export function setThemeContext(theme: Theme) { setContext(THEME_KEY, theme); }
export function getThemeContext(): Theme { return getContext<Theme>(THEME_KEY); }
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/lib/context/theme.ts
import { setContext, getContext } from 'svelte';

const THEME_KEY = Symbol('theme');

export interface Theme {
  primary: string;
  surface: string;
  text: string;
  radius: string;
}

export function setThemeContext(theme: Theme): void {
  setContext(THEME_KEY, theme);
}

export function getThemeContext(): Theme {
  return getContext<Theme>(THEME_KEY);
}
```

```svelte
<!-- src/lib/components/ThemeProvider.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setThemeContext, type Theme } from '$lib/context/theme';

  let { theme, children }: { theme: Theme; children: Snippet } = $props();

  setThemeContext(theme);
</script>

{@render children()}
```

```svelte
<!-- src/lib/components/CardTitle.svelte -->
<script lang="ts">
  import { getThemeContext } from '$lib/context/theme';

  let { text }: { text: string } = $props();

  const theme = getThemeContext();
</script>

<h3 class="title" style:color={theme.text}>{text}</h3>

<style>
  .title {
    font-size: var(--text-lg);
    font-weight: 600;
    margin: 0;
  }
</style>
```

```svelte
<!-- src/lib/components/CardHeader.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getThemeContext } from '$lib/context/theme';

  let { children }: { children: Snippet } = $props();

  const theme = getThemeContext();
</script>

<div class="header" style:border-block-end="1px solid {theme.primary}">
  {@render children()}
</div>

<style>
  .header {
    padding: var(--space-md);
  }
</style>
```

```svelte
<!-- src/lib/components/Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getThemeContext } from '$lib/context/theme';

  let { children }: { children: Snippet } = $props();

  const theme = getThemeContext();
</script>

<article class="card" style:background={theme.surface} style:border-radius={theme.radius}>
  {@render children()}
</article>

<style>
  .card {
    border: 1px solid var(--color-border);
    overflow: hidden;
  }
</style>
```

```svelte
<!-- src/routes/theme-demo/+page.svelte -->
<script lang="ts">
  import ThemeProvider from '$lib/components/ThemeProvider.svelte';
  import Card from '$lib/components/Card.svelte';
  import CardHeader from '$lib/components/CardHeader.svelte';
  import CardTitle from '$lib/components/CardTitle.svelte';
  import type { Theme } from '$lib/context/theme';

  const oceanTheme: Theme = {
    primary: 'oklch(55% 0.2 230)',
    surface: 'oklch(95% 0.02 230)',
    text: 'oklch(25% 0.05 230)',
    radius: 'var(--radius-lg)'
  };

  const sunsetTheme: Theme = {
    primary: 'oklch(60% 0.25 25)',
    surface: 'oklch(95% 0.02 25)',
    text: 'oklch(25% 0.05 25)',
    radius: 'var(--radius-md)'
  };
</script>

<div class="demo">
  <div class="column">
    <h2>Ocean Theme</h2>
    <ThemeProvider theme={oceanTheme}>
      <Card>
        <CardHeader>
          <CardTitle text="Ocean Card" />
        </CardHeader>
      </Card>
    </ThemeProvider>
  </div>

  <div class="column">
    <h2>Sunset Theme</h2>
    <ThemeProvider theme={sunsetTheme}>
      <Card>
        <CardHeader>
          <CardTitle text="Sunset Card" />
        </CardHeader>
      </Card>
    </ThemeProvider>
  </div>
</div>

<style>
  .demo {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);
    padding: var(--space-lg);
    max-inline-size: 48rem;
    margin-inline: auto;
  }

  h2 {
    font-size: var(--text-lg);
    margin-block-end: var(--space-md);
    color: var(--color-text);
  }
</style>
```

### Explanation

Context solves prop drilling by creating a scoped tunnel through the component tree. Unlike global stores, context is scoped to the provider's subtree — two providers with different data create two isolated scopes. The type-safe helper functions (`setThemeContext`, `getThemeContext`) centralize the key and type in one file, eliminating the risk of typos or type mismatches. This pattern is ideal for themes, i18n, feature flags, and any data that many deeply nested components need but that varies per subtree.
</details>
