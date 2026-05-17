---
module: 18
lesson: 18.7
title: Build-time data with Vite plugins
duration: 60 minutes
prerequisites:
  - "18.6 — Custom preprocessors"
  - "8.4 — File-based routing"
  - "12.3 — Code splitting and lazy loading"
learning_objectives:
  - Explain how Vite plugins differ from Svelte preprocessors and when each is appropriate
  - Write a Vite plugin that generates typed data at build time from filesystem content
  - Implement virtual modules (virtual:routes, virtual:i18n) that SvelteKit code imports directly
  - Generate content collections from Markdown files with typed frontmatter
  - Build a route manifest plugin that provides type-safe navigation helpers
status: ready
---

# Lesson 18.7 — Build-time data with Vite plugins

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Generating typed data at build time

### 1.1 The problem: runtime data that could be static

Your application has an i18n dictionary with 500 translation keys. At runtime, you fetch a JSON file, parse it, and pass translations through your component tree. But this data never changes between deployments — it is baked into your source code. Why pay the runtime cost (network request, JSON parsing, loading states) for data that is known at build time?

Or consider a documentation site with 200 Markdown files. At runtime, you read file metadata to build a navigation sidebar. But the file list does not change until the next deploy. Why scan the filesystem on every request when you could compute the navigation structure once at build time and import it as a typed module?

### 1.2 Virtual modules: import data that does not exist as a file

Vite supports **virtual modules** — modules that do not correspond to any file on disk but are resolved by a plugin at build time. You import them with a special prefix:

```typescript
import { routes } from 'virtual:routes';
import { translations } from 'virtual:i18n/en';
```

No file called `virtual:routes` exists in your project. A Vite plugin intercepts the import, generates the module content dynamically (reading the filesystem, computing data, generating types), and returns it to the bundler as if it were a real file.

### 1.3 How Vite plugins work

A Vite plugin is an object with hooks that run at specific points in the build lifecycle:

```typescript
interface Plugin {
  name: string;
  resolveId?(source: string): string | null;
  load?(id: string): string | null;
  transform?(code: string, id: string): string | null;
  buildStart?(): void;
  configureServer?(server: ViteDevServer): void;
}
```

For virtual modules, you use two hooks:

1. **resolveId** — intercepts import resolution. When Vite sees `import 'virtual:routes'`, your plugin returns a synthetic ID (like `\0virtual:routes`) to claim ownership.
2. **load** — provides the module content. When Vite loads the claimed ID, your plugin generates and returns the JavaScript/TypeScript source code.

```typescript
function routeManifestPlugin(): Plugin {
  return {
    name: 'route-manifest',
    resolveId(source) {
      if (source === 'virtual:routes') return '\0virtual:routes';
      return null;
    },
    load(id) {
      if (id === '\0virtual:routes') {
        const routes = scanRoutes('./src/routes');
        return `export const routes = ${JSON.stringify(routes)} as const;`;
      }
      return null;
    }
  };
}
```

### 1.4 Type safety for virtual modules

Virtual modules need TypeScript declarations so your IDE provides autocomplete and type checking. Create a `src/virtual.d.ts` file:

```typescript
declare module 'virtual:routes' {
  interface Route {
    path: string;
    title: string;
    module: string;
  }
  export const routes: readonly Route[];
}

declare module 'virtual:i18n/en' {
  export const translations: Record<string, string>;
}
```

Now importing `virtual:routes` gives you full type information — autocomplete on route properties, type errors if you access non-existent fields, and refactoring support.

### 1.5 Use case: content collections

Astro popularized "content collections" — typed Markdown/MDX file collections with schema-validated frontmatter. You can build the same in SvelteKit with a Vite plugin:

1. Scan a directory (`content/blog/`) for Markdown files
2. Parse each file's frontmatter with `gray-matter`
3. Validate frontmatter against a Zod/Valibot schema
4. Generate a virtual module exporting the typed collection metadata

```typescript
load(id) {
  if (id === '\0virtual:content/blog') {
    const files = glob.sync('content/blog/*.md');
    const posts = files.map(file => {
      const { data } = matter(readFileSync(file, 'utf-8'));
      return { slug: basename(file, '.md'), ...data };
    });
    return `export const posts = ${JSON.stringify(posts)} as const;`;
  }
}
```

Now your SvelteKit pages import `virtual:content/blog` and get a typed array of blog post metadata without any runtime file reading.

### 1.6 Use case: route manifest with navigation helpers

SvelteKit's file-based routing creates routes from the filesystem. But there is no built-in way to get a typed list of all routes for building navigation components. A Vite plugin fills this gap:

```typescript
function scanRoutes(dir: string): Route[] {
  // Recursively find +page.svelte files
  // Extract path from directory structure
  // Read any +page.ts for metadata (title, description)
  // Return typed Route array
}
```

The generated module includes type-safe path builders:

```typescript
export const routes = [
  { path: '/modules/18-advanced/01-compound-components', title: 'Compound Components' },
  { path: '/modules/18-advanced/02-polymorphic-components', title: 'Polymorphic Components' },
  // ...
] as const;

export type RoutePath = typeof routes[number]['path'];
```

Now navigation components use `RoutePath` as their href type — any typo in a route path is a compile error.

### 1.7 Use case: i18n dictionaries

Instead of loading translations at runtime, generate typed translation modules at build time:

1. Read JSON translation files from `src/i18n/en.json`, `src/i18n/fr.json`
2. Generate virtual modules: `virtual:i18n/en`, `virtual:i18n/fr`
3. Export typed translation functions that ensure all keys exist in all languages

```typescript
// Generated: virtual:i18n/en
export const t = {
  'nav.home': 'Home',
  'nav.about': 'About',
  'auth.login': 'Log in',
  // ... 500 keys
} as const;

export type TranslationKey = keyof typeof t;
```

Dead code elimination removes unused translations from the bundle. If French has a key that English lacks, the type error surfaces at build time — before users see a missing translation.

### 1.8 Dev server integration: hot module replacement

Virtual modules should update during development when their source data changes. Use the `configureServer` hook to watch source files and trigger HMR:

```typescript
configureServer(server) {
  server.watcher.add('content/blog/**/*.md');
  server.watcher.on('change', (file) => {
    if (file.includes('content/blog')) {
      const mod = server.moduleGraph.getModuleById('\0virtual:content/blog');
      if (mod) server.moduleGraph.invalidateModule(mod);
      server.ws.send({ type: 'full-reload' });
    }
  });
}
```

Now when you edit a Markdown file during development, the virtual module regenerates and the page reloads with updated content.

### 1.9 Preprocessors vs. Vite plugins: when to use which

| Concern | Preprocessor | Vite Plugin |
|---------|-------------|-------------|
| Scope | Single .svelte file | Entire project |
| Input | File content (string) | Import statements, filesystem |
| Output | Modified file content | New virtual modules, transformed imports |
| Use case | Transform markup/style/script | Generate data, resolve imports |
| Runs when | A .svelte file is processed | Any module is imported |

Use preprocessors to transform individual Svelte files. Use Vite plugins to generate project-wide data, create virtual modules, or intercept non-Svelte imports.

## Deep Dive

**Scale implications.** In a 200-page documentation site, build-time content generation eliminates runtime filesystem access entirely. Pages load instantly because all metadata is baked into the JavaScript bundle. At Vercel, their documentation (docs.vercel.com) uses build-time content generation to achieve sub-100ms page loads — the navigation sidebar, search index, and page metadata are all computed once at build and bundled statically.

**Mental model.** A Vite plugin that generates virtual modules is like a **factory that manufactures ingredients before the restaurant opens**. The chef (SvelteKit) does not forage for ingredients (read files, parse metadata) during service (runtime). Everything is pre-prepared (build-time generation) and sits in labeled containers (typed virtual modules) ready for instant use.

**Edge cases.** Virtual modules are not real files — they cannot be inspected in the filesystem, which complicates debugging. Use `console.log` in the `load` hook during development, or write the generated content to a temporary file for inspection. Also, circular dependencies between virtual modules and real modules can cause infinite resolution loops — always resolve virtual modules to a prefixed ID (`\0`) to avoid re-triggering your own plugin.

**Performance.** Build-time generation adds time to the build but removes time from runtime. For a 500-key i18n dictionary: build cost is ~10ms (read JSON, generate module); runtime cost saved is ~50ms per page load (no network request, no JSON parsing). Over millions of page loads, the savings are enormous. The trade-off: changing translations requires a rebuild/redeploy. For truly dynamic content, use runtime fetching instead.

**Cross-module connections.** This lesson connects to Lesson 18.6 (preprocessors — the other build-time tool), Module 8 (SvelteKit's file-based routing that the route manifest plugin introspects), and Lesson 18.10 (monorepo — Vite plugins live in shared packages and are consumed by all apps).

## 2. Style it — PE7 applied to the virtual module demo

The mini-build displays a route manifest visualizer. Routes are shown as a navigable list using `var(--color-surface-2)` cards with `var(--space-sm)` gap, `var(--radius-md)` corners, and `min-block-size: 44px` for touch targets. The "generated at build time" badge uses `var(--color-success)` to indicate the data is static. Module paths use monospace font and `var(--color-brand)` color to distinguish them from runtime data.

## 3. Interact — Building a route manifest Vite plugin

The problem: you want a `<Nav>` component that lists all lessons, but the route list is hardcoded. Adding a new lesson requires updating the nav manually — a maintenance burden and source of bugs.

The mistake — hardcoding routes:

```typescript
// Manually maintained, always out of date
const routes = [
  { path: '/modules/18-advanced/01-compound-components', title: 'Compound Components' },
  // developer forgets to add new routes...
];
```

The fix — generate from the filesystem at build time:

```typescript
// vite-plugin-routes.ts
import { readdirSync } from 'fs';
import type { Plugin } from 'vite';

export function routeManifest(): Plugin {
  return {
    name: 'route-manifest',
    resolveId(source) {
      if (source === 'virtual:routes') return '\0virtual:routes';
      return null;
    },
    load(id) {
      if (id !== '\0virtual:routes') return null;
      const dirs = readdirSync('src/routes/modules/18-advanced', { withFileTypes: true });
      const routes = dirs
        .filter(d => d.isDirectory())
        .map(d => ({
          path: '/modules/18-advanced/' + d.name,
          slug: d.name,
          title: d.name.replace(/^\d+-/, '').replace(/-/g, ' ')
        }));
      return 'export const routes = ' + JSON.stringify(routes) + ' as const;';
    }
  };
}
```

Now `import { routes } from 'virtual:routes'` always reflects the filesystem truth. Add a new directory, rebuild, and the nav updates automatically.

## 4. Mini-build — Route manifest visualizer

**File:** `src/routes/modules/18-advanced/07-build-time-data/+page.svelte`

This page demonstrates build-time data generation by displaying a route manifest that was "generated" (simulated) from the filesystem. It shows the typed route data and how it drives a navigation component.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/18-advanced/07-build-time-data`.

You will see a generated route manifest displayed as a typed data structure, and a navigation component built from that data. The data is static — no loading states, no network requests.

### Prove the data is build-time

1. The page renders instantly with full route data — no loading spinner, no `{#await}`. The data exists at import time.
2. Inspect the Network tab — no XHR/fetch requests for route data. It is inlined in the JavaScript bundle.
3. The TypeScript type annotation shows `as const` — the compiler knows the exact shape at build time.
4. The navigation links are fully typed — hovering any route in your IDE shows its complete type.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> How does a virtual module differ from a regular file module?</summary>

A virtual module has no corresponding file on disk. A Vite plugin creates it by intercepting the import resolution (`resolveId`) and providing content dynamically (`load`). To the consuming code, it looks and types like any other module import. The `\0` prefix convention signals to other plugins that this ID is virtual and should not be treated as a filesystem path.
</details>

<details>
<summary><strong>Q2.</strong> Why do virtual modules need a TypeScript declaration file?</summary>

TypeScript cannot infer types from modules that do not exist as files. A `declare module 'virtual:routes'` block in a `.d.ts` file tells TypeScript what exports the module provides, enabling autocomplete, type checking, and refactoring support. Without it, importing a virtual module produces a "cannot find module" error.
</details>

<details>
<summary><strong>Q3.</strong> When should you use a Vite plugin instead of a Svelte preprocessor?</summary>

Use a Vite plugin when you need to generate project-wide data (not per-file), create virtual modules importable from any file, intercept non-Svelte imports, or integrate with the dev server for HMR. Use a preprocessor when you need to transform the content of individual `.svelte` files (markup, script, or style blocks).
</details>

<details>
<summary><strong>Q4.</strong> How do you enable HMR for virtual modules during development?</summary>

In the `configureServer` hook, watch the source files that feed the virtual module (using `server.watcher.add`). When a source file changes, invalidate the virtual module in Vite's module graph (`server.moduleGraph.invalidateModule`) and send a reload signal (`server.ws.send({ type: 'full-reload' })`). This triggers regeneration and page refresh.
</details>

<details>
<summary><strong>Q5.</strong> What is the performance trade-off of build-time data generation?</summary>

Build time increases (the plugin must read files and generate modules during build). Runtime decreases (no network requests, no JSON parsing, instant data availability). The trade-off is worthwhile for data that changes infrequently (translations, content metadata, route manifests). For truly dynamic data (user-specific, real-time), runtime fetching remains necessary.
</details>

## 6. Common mistakes

- **Forgetting the `\0` prefix for virtual module IDs.** Without it, Vite may try to resolve the ID against the filesystem or pass it to other plugins, causing unexpected behavior. The `\0` convention (null byte prefix) is the Rollup/Vite standard for virtual modules.
- **Not handling dev server invalidation.** Virtual modules are cached after first load. During development, if the source data changes (a Markdown file is edited), the virtual module serves stale content unless you manually invalidate it in the module graph.
- **Generating too much data in a single virtual module.** A module with 10MB of content defeats code splitting. Split large content into multiple virtual modules (`virtual:content/blog/page-1`, etc.) so tree-shaking and lazy loading work correctly.
- **Missing the declaration file.** Without `declare module 'virtual:...'`, TypeScript errors block the build. Always create `.d.ts` declarations alongside the plugin, and document what type the module exports.

## 7. What's next

Lesson 18.8 explores advanced TypeScript patterns in Svelte — conditional types for prop dependencies, generic components, branded types for IDs, and type-safe event buses that make impossible API usage a compile error.
