---
module: 18
exercise: 4
title: Custom Preprocessor
difficulty: expert
estimated_time: 45
skills_tested:
  - Svelte preprocessor API
  - markup transformation
  - build pipeline integration
  - regex-based parsing
  - development tooling
---

# Exercise 18.4 — Custom Preprocessor

## Brief

Write a custom Svelte preprocessor that transforms a custom syntax — `@icon(name)` — into SVG icon markup at compile time. When the preprocessor encounters `@icon(arrow-right)` in a Svelte component's markup, it replaces it with the corresponding inline SVG. This exercise teaches how to extend Svelte's compilation pipeline with custom transformations.

## Requirements

1. Create `src/lib/preprocessors/icon-preprocessor.ts` with the preprocessor function
2. The preprocessor must implement the `markup` hook from the Svelte preprocessor API
3. Define a map of icon names to SVG strings (at least 5 icons: arrow-right, check, x, star, heart)
4. The syntax `@icon(name)` in any `.svelte` file should be replaced with the corresponding SVG
5. The SVG must include proper accessibility attributes (`aria-hidden="true"`, `focusable="false"`)
6. If an unknown icon name is used, emit a warning and replace with a placeholder
7. Add the preprocessor to `svelte.config.js` (document how, even if you do not actually modify the config)
8. Create `src/routes/exercises/18-advanced/04/+page.svelte` demonstrating the icon syntax
9. Include a documentation panel showing all available icons
10. Style with PE7 tokens

## Constraints

- The preprocessor must be synchronous (or use the async variant)
- TypeScript strict mode
- The SVG output must be properly escaped and valid HTML
- The preprocessor must not modify script or style blocks

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A Svelte preprocessor is an object with `markup`, `script`, and/or `style` functions. The `markup` function receives `{ content, filename }` and returns `{ code }` with the transformed content. Use `content.replace(/@icon\(([^)]+)\)/g, replacer)` to find and replace the custom syntax.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The icon map is a `Record<string, string>` where keys are icon names and values are SVG strings. The replacer function looks up the icon name in the map and returns the SVG. If not found, return a comment or placeholder SVG. Make sure to add `class="icon"` to each SVG for consistent styling.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
import type { PreprocessorGroup } from 'svelte/compiler';

const icons: Record<string, string> = {
  'arrow-right': '<svg viewBox="0 0 24 24" ...><path d="M5 12h14m-7-7l7 7-7 7"/></svg>',
  // ...
};

export function iconPreprocessor(): PreprocessorGroup {
  return {
    name: 'icon-preprocessor',
    markup({ content, filename }) {
      const code = content.replace(/@icon\(([^)]+)\)/g, (_, name) => {
        return icons[name] ?? `<!-- unknown icon: ${name} -->`;
      });
      return { code };
    }
  };
}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/preprocessors/icon-preprocessor.ts`**

```typescript
import type { PreprocessorGroup } from 'svelte/compiler';

const ICON_REGEX = /@icon\(([^)]+)\)/g;

const icons: Record<string, string> = {
  'arrow-right': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>',

  'check': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 6L9 17l-5-5"></path></svg>',

  'x': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg>',

  'star': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',

  'heart': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
};

const PLACEHOLDER_SVG = '<svg class="icon icon--unknown" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4m0 4h.01"></path></svg>';

export function iconPreprocessor(): PreprocessorGroup {
  return {
    name: 'icon-preprocessor',
    markup({ content, filename }) {
      if (!content.includes('@icon(')) {
        return { code: content };
      }

      const code = content.replace(ICON_REGEX, (match, name: string) => {
        const trimmedName = name.trim();
        const svg = icons[trimmedName];

        if (!svg) {
          console.warn(`[icon-preprocessor] Unknown icon "${trimmedName}" in ${filename}`);
          return PLACEHOLDER_SVG;
        }

        return svg;
      });

      return { code };
    }
  };
}

export const availableIcons = Object.keys(icons);
```

**Configuration (add to `svelte.config.js`):**

```javascript
// svelte.config.js
import { iconPreprocessor } from './src/lib/preprocessors/icon-preprocessor.ts';

const config = {
  preprocess: [
    // vitePreprocess(), (existing)
    iconPreprocessor()
  ],
  // ... rest of config
};
```

**`src/routes/exercises/18-advanced/04/+page.svelte`**

```svelte
<script lang="ts">
  // Note: In a real setup with the preprocessor active,
  // @icon(name) in the markup below would be replaced at compile time.
  // For this exercise page, we show the concept with inline SVGs.

  const iconDemos: { name: string; label: string }[] = [
    { name: 'arrow-right', label: 'Arrow Right' },
    { name: 'check', label: 'Check' },
    { name: 'x', label: 'Close' },
    { name: 'star', label: 'Star' },
    { name: 'heart', label: 'Heart' }
  ];
</script>

<main class="page">
  <h1>Custom Icon Preprocessor</h1>
  <p class="intro">A compile-time preprocessor transforms <code>@icon(name)</code> into inline SVG.</p>

  <section class="syntax-demo">
    <h2>Syntax</h2>
    <div class="code-block">
      <code>&lt;button&gt;Next @icon(arrow-right)&lt;/button&gt;</code>
    </div>
    <p class="note">At compile time, <code>@icon(arrow-right)</code> is replaced with the full SVG markup.</p>
  </section>

  <section class="icon-catalog">
    <h2>Available Icons</h2>
    <div class="icon-grid">
      {#each iconDemos as icon}
        <div class="icon-card">
          <div class="icon-preview">
            <!-- These would use @icon(name) syntax with the preprocessor active -->
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              {#if icon.name === 'arrow-right'}
                <path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path>
              {:else if icon.name === 'check'}
                <path d="M20 6L9 17l-5-5"></path>
              {:else if icon.name === 'x'}
                <path d="M18 6L6 18"></path><path d="M6 6l12 12"></path>
              {:else if icon.name === 'star'}
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              {:else if icon.name === 'heart'}
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              {/if}
            </svg>
          </div>
          <code class="icon-name">@icon({icon.name})</code>
          <span class="icon-label">{icon.label}</span>
        </div>
      {/each}
    </div>
  </section>

  <section class="how-it-works">
    <h2>How It Works</h2>
    <ol>
      <li>The preprocessor runs before Svelte compilation</li>
      <li>It scans the markup block for <code>@icon(name)</code> patterns</li>
      <li>Each match is replaced with the corresponding inline SVG</li>
      <li>Unknown icons produce a warning and a placeholder SVG</li>
      <li>The final output contains no custom syntax — just standard HTML</li>
    </ol>
  </section>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }
  .intro code { background: var(--color-surface-2); padding: 0.1em 0.3em; border-radius: var(--radius-sm); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }

  section { margin-block-end: var(--space-2xl); }

  .code-block {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    font-family: monospace;
    font-size: var(--text-sm);
    margin-block-end: var(--space-sm);
  }

  .note { font-size: var(--text-xs); color: var(--color-text-muted); }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    gap: var(--space-md);
  }

  .icon-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    text-align: center;
    display: grid;
    gap: var(--space-xs);
    place-items: center;
  }

  .icon-preview { color: var(--color-text); }

  :global(.icon) {
    inline-size: 1.5rem;
    block-size: 1.5rem;
  }

  .icon-name { font-size: var(--text-xs); color: var(--color-brand); }
  .icon-label { font-size: var(--text-xs); color: var(--color-text-muted); }

  .how-it-works ol {
    padding-inline-start: var(--space-lg);
    display: grid;
    gap: var(--space-sm);
  }

  .how-it-works li {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .how-it-works code {
    background: var(--color-surface-2);
    padding: 0.1em 0.3em;
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
  }
</style>
```

### Explanation

Svelte preprocessors run before the Svelte compiler processes a file. They can transform markup, script, or style blocks. The `markup` hook receives the raw file content and returns modified content. This icon preprocessor uses a regex to find `@icon(name)` patterns and replaces them with inline SVG — no runtime JavaScript, no component overhead, no additional HTTP requests. The SVGs include `aria-hidden="true"` and `focusable="false"` because decorative icons should be invisible to screen readers (the surrounding text provides context). If an icon name is not found, the preprocessor warns at build time and inserts a placeholder — this is better than a runtime error because it surfaces the issue during development. The early-exit check (`if (!content.includes('@icon('))`) skips files without the custom syntax, keeping compilation fast. In production, you might fetch icon SVGs from a directory or a design system package. This pattern is similar to how MDsveX preprocesses Markdown and how PostCSS preprocesses CSS.
</details>
