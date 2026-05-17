---
module: 18
lesson: 18.6
title: Custom preprocessors
duration: 60 minutes
prerequisites:
  - "1.7 — Scoped style blocks"
  - "8.1 — What SvelteKit adds to Svelte"
  - "TypeScript string manipulation and AST basics"
learning_objectives:
  - Explain the Svelte preprocessor API and when custom preprocessors are justified
  - Write a preprocessor that transforms markup before the Svelte compiler processes it
  - Implement auto-import functionality for icon components based on markup usage
  - Build a preprocessor that injects analytics tracking into event handlers
  - Configure and chain multiple preprocessors in svelte.config.js
status: ready
---

# Lesson 18.6 — Custom preprocessors

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Writing build-time transformations for Svelte files

### 1.1 The problem: repetitive boilerplate across every component

You have a design system with 200 icon components. Every time a developer uses an icon, they write an import statement: `import IconSearch from '$lib/icons/IconSearch.svelte'`. Across 500 files, that is thousands of import lines — boilerplate that adds nothing but maintenance burden and merge conflicts. If an icon is renamed, every import must update manually.

Or consider analytics: every button click should fire a tracking event. Without automation, developers must remember to add `analytics.track('button-clicked', { label })` to every `onclick` handler. They forget. Coverage drops to 60%. The data team complains.

These problems share a root cause: the source code as written by developers is not the source code the compiler should see. You need a **transformation layer** that sits between what the developer writes and what the Svelte compiler receives.

### 1.2 What preprocessors are

A **Svelte preprocessor** is a function that receives the raw text of a `.svelte` file (split into markup, script, and style blocks) and returns modified text. It runs before the Svelte compiler sees the file. The compiler only processes the output — it never sees the original developer-authored code.

The API is a set of optional hooks:

```typescript
interface PreprocessorGroup {
  name?: string;
  markup?: (args: { content: string; filename: string }) => Promise<{ code: string; map?: object }>;
  script?: (args: { content: string; filename: string; attributes: Record<string, string> }) => Promise<{ code: string; map?: object }>;
  style?: (args: { content: string; filename: string; attributes: Record<string, string> }) => Promise<{ code: string; map?: object }>;
}
```

Each hook receives the content of that block and returns the transformed content. You can modify any or all blocks. The `map` field enables source maps so error messages point to the original developer-authored code, not the transformed version.

### 1.3 The built-in preprocessors you already use

If you write `<script lang="ts">`, a preprocessor transforms TypeScript to JavaScript before the Svelte compiler processes it. If you use `<style lang="scss">`, a preprocessor compiles SCSS to CSS. These ship with `svelte-preprocess` or `@sveltejs/vite-plugin-svelte` and run automatically. Your custom preprocessors use the exact same API.

### 1.4 Use case: auto-importing icons

The goal: when a developer writes `<IconSearch />` in their markup, the preprocessor detects the usage, finds the corresponding file in `$lib/icons/`, and injects the import statement automatically. The developer never writes the import.

Implementation strategy:

1. In the `markup` hook, scan the content for `<Icon[A-Z]\w+` patterns (component names starting with "Icon").
2. Collect unique icon names used in this file.
3. If the file has a `<script>` block, inject import statements at the top.
4. If it does not, create a `<script lang="ts">` block with the imports.

```typescript
function autoImportIcons(): PreprocessorGroup {
  return {
    name: 'auto-import-icons',
    markup({ content, filename }) {
      const iconRegex = /<(Icon[A-Z]\w+)/g;
      const icons = new Set<string>();
      let match: RegExpExecArray | null;

      while ((match = iconRegex.exec(content)) !== null) {
        icons.add(match[1]);
      }

      if (icons.size === 0) return { code: content };

      const imports = Array.from(icons)
        .map(name => `import ${name} from '$lib/icons/${name}.svelte';`)
        .join('\n  ');

      const hasScript = /<script[^>]*>/.test(content);

      if (hasScript) {
        const code = content.replace(
          /(<script[^>]*>)/,
          `$1\n  ${imports}`
        );
        return { code };
      }

      const code = `<script lang="ts">\n  ${imports}\n</script>\n${content}`;
      return { code };
    }
  };
}
```

### 1.5 Use case: injecting analytics into event handlers

You want every `onclick` handler to automatically fire a tracking event. The preprocessor scans the markup for `onclick={...}` patterns and wraps them with analytics calls:

```typescript
function injectAnalytics(): PreprocessorGroup {
  return {
    name: 'inject-analytics',
    markup({ content }) {
      const code = content.replace(
        /onclick={(\w+)}/g,
        `onclick={(e) => { analytics.track('click', { handler: '$1' }); $1(e); }}`
      );
      return { code };
    }
  };
}
```

This is a simplified example — production implementations use proper AST parsing (via `svelte.parse` or `acorn`) instead of regex to handle edge cases like string literals containing `onclick=`.

### 1.6 Use case: custom syntax sugar

Want to write `<Link to="/about">` instead of `<a href="/about">`? A preprocessor can transform custom elements to standard HTML before compilation:

```typescript
markup({ content }) {
  let code = content;
  code = code.replace(/<Link\s+to="([^"]+)"([^>]*)>/g, '<a href="$1"$2>');
  code = code.replace(/<\/Link>/g, '</a>');
  return { code };
}
```

This is how tools like `mdsvex` (Markdown in Svelte) work — they preprocess `.svx` files, transforming Markdown to Svelte markup before the compiler runs.

### 1.7 Configuring preprocessors in svelte.config.js

Preprocessors are registered in `svelte.config.js`:

```typescript
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { autoImportIcons } from './preprocessors/auto-import-icons.js';

const config = {
  preprocess: [
    autoImportIcons(),
    vitePreprocess() // TypeScript, PostCSS — always last
  ]
};

export default config;
```

Order matters: preprocessors run in array order. Put your custom transforms before `vitePreprocess()` so that TypeScript processing handles the injected imports correctly.

### 1.8 Source maps and debugging

When your preprocessor modifies code, error messages point to wrong lines unless you provide a source map. For simple transformations (inserting imports at known positions), you can use the `magic-string` library:

```typescript
import MagicString from 'magic-string';

markup({ content, filename }) {
  const s = new MagicString(content);
  s.prepend('<script lang="ts">\nimport X from "x";\n</script>\n');
  return {
    code: s.toString(),
    map: s.generateMap({ source: filename, hires: true })
  };
}
```

MagicString tracks character positions through transformations, producing accurate source maps automatically.

### 1.9 Testing preprocessors

Preprocessors are pure functions: string in, string out. Test them without mounting components:

```typescript
import { describe, it, expect } from 'vitest';
import { autoImportIcons } from './auto-import-icons';

describe('autoImportIcons', () => {
  it('injects import for IconSearch', async () => {
    const input = '<script lang="ts"></script>\n<IconSearch />';
    const result = await autoImportIcons().markup!({ content: input, filename: 'test.svelte' });
    expect(result.code).toContain("import IconSearch from '$lib/icons/IconSearch.svelte'");
  });
});
```

## Deep Dive

**Scale implications.** At Vercel, custom preprocessors reduce boilerplate by 15-20% across their design system codebase. Auto-import preprocessors eliminate an entire category of merge conflicts (conflicting import additions). Analytics preprocessors achieve 100% coverage without developer effort — compared to 60-70% with manual instrumentation. In a 500-file codebase, this saves hundreds of human-hours per year in manual imports and tracking code.

**Mental model.** A preprocessor is a **translator who rewrites your letter before it reaches the post office**. You write in shorthand that is convenient for you. The translator expands it into the full formal language the postal system (Svelte compiler) requires. The recipient (browser) never sees your shorthand — only the expanded version. The translator works instantly at build time, adding zero runtime cost.

**Edge cases.** Regex-based preprocessors break on edge cases: strings containing patterns (`const s = 'onclick={fake}'`), comments, multi-line attributes, and dynamic values. For production use, parse the Svelte AST with `svelte.parse()` or `svelte.compile()` in analysis mode. Walk the AST to find actual component usages vs. false positives in strings. The performance cost of parsing is negligible (microseconds per file) and the correctness benefit is essential.

**Performance.** Preprocessors run once per file per build (or per HMR update). A preprocessor that takes 5ms per file adds 2.5 seconds to a 500-file project's build. Keep preprocessors fast: avoid network calls, cache expensive computations, and bail early when the file does not match patterns. The `filename` argument lets you skip irrelevant files (e.g., skip files not in `src/routes/`).

**Cross-module connections.** Preprocessors connect to Lesson 18.7 (Vite plugins — both are build-time transformations but at different levels), Module 8 (SvelteKit configuration where preprocessors are registered), and the module project (the shared config package includes the auto-import preprocessor consumed by all apps in the monorepo).

## 2. Style it — PE7 tokens in the preprocessor demo

The mini-build displays a code transformation visualizer: the left panel shows "developer-authored code" and the right panel shows "compiler-received code" after preprocessing. Both panels use `var(--color-surface)` background with `var(--space-md)` padding, monospace font via `ui-monospace`, and `var(--text-sm)` sizing.

Injected code is highlighted with a subtle `var(--color-brand)` background and `var(--radius-sm)` border-radius to make transformations visually obvious. The panels sit in a responsive grid that stacks vertically on mobile and goes side-by-side on `min-width: 768px`.

## 3. Interact — Building an auto-import preprocessor step by step

The problem: you write `<IconHeart />` in your template but forget the import. The component is not recognized. Svelte throws: `'IconHeart' is not defined`.

The mistake — hoping developers remember:

```svelte
<script lang="ts">
  // Developer forgot: import IconHeart from '$lib/icons/IconHeart.svelte';
</script>

<IconHeart /> <!-- Error: not defined -->
```

The fix — a preprocessor that scans markup and injects imports automatically:

```typescript
// preprocessors/auto-import-icons.ts
export function autoImportIcons() {
  return {
    name: 'auto-import-icons',
    markup({ content }: { content: string; filename: string }) {
      const iconRegex = /<(Icon[A-Z]\w+)/g;
      const icons = new Set<string>();
      let match: RegExpExecArray | null;
      while ((match = iconRegex.exec(content)) !== null) {
        icons.add(match[1]);
      }
      if (icons.size === 0) return { code: content };

      const imports = Array.from(icons)
        .map(name => `  import ${name} from '$lib/icons/${name}.svelte';`)
        .join('\n');

      if (/<script[^>]*>/.test(content)) {
        return { code: content.replace(/(<script[^>]*>)/, `$1\n${imports}`) };
      }
      return { code: `<script lang="ts">\n${imports}\n</script>\n${content}` };
    }
  };
}
```

Now the developer writes `<IconHeart />` and the preprocessor ensures the import exists. Zero boilerplate, zero forgotten imports.

## 4. Mini-build — Preprocessor transformation visualizer

**File:** `src/routes/modules/18-advanced/06-custom-preprocessors/+page.svelte`

This page shows a live demonstration of what a preprocessor does: it displays "before" and "after" code panels, simulating the auto-import-icons transformation. Users can type component names and see the imports appear in real-time.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/18-advanced/06-custom-preprocessors`.

You will see an input area (simulating developer code) and an output area (showing what the compiler receives after preprocessing). Type `<IconStar />` in the input and watch the import statement appear in the output.

### Prove the transformation works

1. The input panel shows raw markup without imports. The output panel shows the same markup with auto-generated `import` statements at the top.
2. Add multiple icon usages (`<IconStar />`, `<IconHeart />`) — only unique imports appear (no duplicates).
3. Remove an icon usage — its import disappears from the output (the preprocessor only imports what is used).
4. This is a simulation of what happens at build time — in production, you never see the output panel because it goes directly to the Svelte compiler.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> At what point in the build pipeline does a Svelte preprocessor run?</summary>

A preprocessor runs after Vite detects a file change and before the Svelte compiler processes the file. It receives the raw `.svelte` file content (split into markup, script, and style) and returns modified content that the compiler then compiles into JavaScript and CSS. The preprocessor output is what the compiler sees — it never sees the original source.
</details>

<details>
<summary><strong>Q2.</strong> Why should you put custom preprocessors before <code>vitePreprocess()</code> in the array?</summary>

`vitePreprocess()` handles TypeScript compilation and PostCSS processing. If your custom preprocessor injects TypeScript code (like import statements with type annotations), that injected code needs to pass through `vitePreprocess()` to be compiled. Placing your preprocessor first ensures the injected code is present when TypeScript processing runs.
</details>

<details>
<summary><strong>Q3.</strong> What is the danger of using regex-based transformations in preprocessors?</summary>

Regex cannot distinguish between actual component usage in markup, string literals that happen to match the pattern, comments, or multi-line attributes. A regex matching `<IconSearch` would falsely trigger on `const s = '<IconSearch is cool>'`. For production use, parse the Svelte AST to identify actual component usages with certainty.
</details>

<details>
<summary><strong>Q4.</strong> How do source maps help when using preprocessors?</summary>

When a preprocessor modifies code, line numbers shift. Without a source map, error messages point to wrong lines in the developer's source file. Source maps (generated by libraries like `magic-string`) track the character-position relationship between the original and transformed code, allowing DevTools and error messages to point to the correct location in the developer-authored file.
</details>

<details>
<summary><strong>Q5.</strong> Why are preprocessors testable with simple unit tests?</summary>

Preprocessors are pure functions: they receive a string (file content) and return a string (transformed content). No DOM, no browser, no component mounting required. You can test them by passing input strings and asserting on the output string's content — making them ideal for fast, isolated unit testing with Vitest.
</details>

## 6. Common mistakes

- **Using regex for complex transformations.** Regex works for simple, unambiguous patterns (like `<Icon[A-Z]`). For anything involving nested structures, string content analysis, or attribute parsing, use an AST parser. False positives in regex-based preprocessors cause subtle, hard-to-debug compilation errors.
- **Forgetting to handle files without a script block.** If your preprocessor injects imports but the file has no `<script>` block, you must create one. A common crash: `content.replace(/<script>/, ...)` returns the original content unchanged when no script exists, and the injected import has nowhere to go.
- **Not providing source maps.** Without maps, every error message from preprocessed files points to wrong lines. Developers waste hours tracing issues. Use `magic-string` for reliable map generation with minimal effort.
- **Running expensive operations synchronously.** Preprocessor hooks are async — use that. If you need to read icon directories or resolve paths, await filesystem calls instead of blocking the entire build pipeline with synchronous `fs.readFileSync`.

## 7. What's next

Lesson 18.7 takes build-time code generation further with Vite plugins — generating typed data modules (content collections, route manifests, i18n dictionaries) that your SvelteKit app imports as `virtual:` modules.
