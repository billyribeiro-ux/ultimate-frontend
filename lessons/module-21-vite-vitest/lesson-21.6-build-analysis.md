---
module: 21
lesson: 21.6
title: Build analysis and optimization
duration: 50 minutes
prerequisites:
  - "21.1 — What Vite actually does"
  - "21.2 — vite.config.ts in depth"
  - "12.3 — Code splitting and lazy loading"
learning_objectives:
  - Read and interpret the pnpm build output including chunk sizes and asset counts
  - Configure build.chunkSizeWarningLimit and understand its implications
  - Identify oversized dependencies using bundle visualization tools
  - Verify tree-shaking by confirming dead code is eliminated from production output
  - Explain how SvelteKit creates code splitting boundaries at route and dynamic import levels
status: ready
---

# Lesson 21.6 — Build analysis and optimization

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Knowing exactly what you are shipping

### 1.1 The problem: shipping code you do not understand

You run `pnpm build` and it succeeds. Green checkmark. You deploy. But how big is your application? Which dependencies dominate the bundle? Is the charting library you used for one page included in every route's JavaScript? Is the dead code from that experiment last month still being shipped to users?

Most developers never look at their build output. They trust the bundler. But the bundler does not know your intentions — it only follows imports. If you import a 200 KB library and use one function from it, tree-shaking might save you, or it might not, depending on how the library is authored. The only way to know is to look.

### 1.2 Reading the pnpm build output

When you run `pnpm build` in a SvelteKit project, the terminal shows a summary of every output file:

```
vite v8.0.0 building SSR bundle for production...
✓ 142 modules transformed.
.svelte-kit/output/client/_app/immutable/chunks/
  index-abc123.js           12.34 kB │ gzip: 4.56 kB
  entry-def456.js           8.21 kB  │ gzip: 3.12 kB
  page-ghi789.js            2.45 kB  │ gzip: 1.02 kB
  vendor-jkl012.js         45.67 kB  │ gzip: 15.23 kB  ⚠️
```

Each line shows: the file name (with a content hash for cache-busting), the uncompressed size, and the gzip-compressed size. The gzip size is what users actually download — focus on it. The yellow warning icon appears when a chunk exceeds `build.chunkSizeWarningLimit` (default 500 kB).

### 1.3 What the sizes mean

**Uncompressed size** is the raw file size on disk. It matters for parsing — the browser must parse every byte of JavaScript, and parsing is CPU-bound. On a mid-range Android phone, parsing 1 MB of JavaScript takes roughly 1 second.

**Gzip size** is the compressed transfer size. It matters for download — this is what travels over the network. Modern hosting platforms serve assets with gzip or Brotli compression automatically. Brotli typically compresses 15-20% better than gzip.

A healthy SvelteKit application has these rough benchmarks:
- **Entry chunk** (framework code): 15-25 kB gzip
- **Per-route chunk**: 2-10 kB gzip
- **Total initial load**: 30-60 kB gzip for the first page
- **Vendor chunk** (third-party libraries): varies, but >50 kB gzip for a single library deserves investigation

### 1.4 Identifying large dependencies

The biggest wins in bundle optimization come from large third-party dependencies. A single charting library, date utility, or component framework can dwarf your entire application code. To identify culprits:

**Method 1: the build output.** Look for chunks with "vendor" in the name or chunks that are disproportionately large. If `vendor-abc123.js` is 200 kB gzip, something big is in it.

**Method 2: rollup-plugin-visualizer.** Install and configure this plugin to generate a treemap of your bundle:

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    plugins: [
        sveltekit(),
        visualizer({
            filename: 'stats.html',
            open: true,
            gzipSize: true
        })
    ]
});
```

After `pnpm build`, it opens `stats.html` — an interactive treemap showing every module and its contribution to the bundle. You can zoom into chunks and see which npm packages dominate.

### 1.5 Tree-shaking verification

**Tree-shaking** is the process of removing unused exports from the bundle. If you import `{ format }` from a library that exports 50 functions, tree-shaking should eliminate the other 49. But tree-shaking only works under certain conditions:

1. The code uses **ES module syntax** (`import`/`export`). CommonJS (`require`) cannot be tree-shaken.
2. The code has **no side effects** — or the package's `package.json` declares `"sideEffects": false`, telling the bundler it is safe to remove unused exports.
3. The imports are **static** — dynamic imports (`import(path)`) and re-exports (`export * from`) limit tree-shaking precision.

To verify tree-shaking worked, search the production output for code you know should be eliminated. If you stopped using a function from a library, search for that function's name in the build output. If it is still present, the library may not be tree-shakeable.

### 1.6 Code splitting in SvelteKit

SvelteKit automatically creates code splitting boundaries at two levels:

**Per-route splitting.** Each `+page.svelte` and its direct dependencies are bundled into a separate chunk. When a user navigates to `/about`, only the chunk for the about page is downloaded — not the code for `/settings` or `/dashboard`.

**Dynamic import splitting.** When you use `import()` (dynamic import) inside a component, the imported module becomes a separate chunk loaded on demand:

```svelte
<script lang="ts">
    let ChartComponent: typeof import('$lib/components/Chart.svelte').default | null = $state(null);

    async function loadChart(): Promise<void> {
        const module = await import('$lib/components/Chart.svelte');
        ChartComponent = module.default;
    }
</script>
```

This pattern is useful for large components (charting, rich text editors, 3D viewers) that are only needed after user interaction.

### 1.7 Manual chunk splitting

When automatic splitting is not enough, use `build.rolldownOptions.output.manualChunks` to control which modules go into which chunks:

```typescript
build: {
    rolldownOptions: {
        output: {
            manualChunks: {
                'chart-vendor': ['chart.js', 'd3-scale'],
                'date-vendor': ['date-fns']
            }
        }
    }
}
```

This creates separate chunks for chart and date dependencies, preventing them from being included in the main vendor chunk. Users who never visit a page that uses charts never download the chart code.

### 1.8 "In production" — trimming 400 kB from a build

An e-commerce team's SvelteKit app shipped a 180 kB gzip initial bundle — three times the target. Using `rollup-plugin-visualizer`, they discovered three issues: (1) `moment.js` was imported for one date formatting call — replacing it with `Intl.DateTimeFormat` eliminated 70 kB. (2) A full icon library was imported when only 12 icons were used — switching to individual icon imports dropped 90 kB. (3) A Markdown renderer was in the main bundle instead of dynamically imported — code splitting it to load only on the blog page saved 50 kB from the initial load. Total reduction: 210 kB uncompressed, from 180 kB to 68 kB gzip. Time invested: one afternoon. Performance impact: LCP improved by 800ms on mobile.

### 1.9 The TypeScript angle

Vite's build output options are fully typed. The `manualChunks` option accepts either an object (mapping chunk names to module IDs) or a function that receives a module ID and returns a chunk name:

```typescript
import type { ManualChunksOption } from 'rolldown';

const manualChunks: ManualChunksOption = (id: string): string | undefined => {
    if (id.includes('node_modules/chart.js')) {
        return 'chart-vendor';
    }
};
```

The function form gives you full programmatic control over chunk assignment, useful when you want to group all modules from a specific package or directory.

### 1.10 Common interview question

**Q: "How would you diagnose and fix an oversized JavaScript bundle in a SvelteKit application?"**

**Model answer:** First, I would run `pnpm build` and read the chunk size report to identify which chunks are largest. Then I would add `rollup-plugin-visualizer` to generate a treemap showing module-level contributions. Common fixes include: replacing heavy libraries with lighter alternatives or native APIs (e.g., `moment.js` with `Intl.DateTimeFormat`), switching from full-package imports to individual imports (e.g., icon libraries), code-splitting large components behind dynamic imports so they load only when needed, and verifying tree-shaking by checking that the library uses ESM and declares `sideEffects: false`. For SvelteKit specifically, I would ensure that heavy dependencies are only imported in the routes that need them — SvelteKit's per-route code splitting handles the rest automatically.

## Deep Dive

**How Rolldown produces chunks.** Rolldown's chunking algorithm starts with entry points (your routes) and follows all static imports to build a dependency graph. Modules shared by multiple entries are extracted into shared chunks. The algorithm optimizes for two competing goals: minimize the number of HTTP requests (fewer, larger chunks) and minimize redundant downloads (smaller, more granular chunks). The `manualChunks` option overrides the algorithm for specific modules, giving you direct control when the defaults are suboptimal.

**Source maps and production debugging.** Setting `build.sourcemap: true` generates `.js.map` files alongside each chunk. These files map minified code back to your original source, making production stack traces readable. However, source maps expose your source code structure. Use `build.sourcemap: 'hidden'` to generate maps without referencing them in the output — then upload the maps to an error tracking service (Sentry, Datadog) that uses them privately. This gives you readable stack traces without exposing source code to users.

**The cost of CSS in the build.** SvelteKit extracts CSS from all components and bundles it into per-route CSS files. The CSS follows the same code-splitting logic as JavaScript — each route gets only the styles it needs. Global CSS from `app.css` is included in every route. If your global stylesheet grows large, consider splitting it into modules imported only by the routes that need them.

**Measuring real-world impact.** Bundle size is a proxy metric. The metrics that matter to users are Core Web Vitals: LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift). Smaller bundles improve LCP (less JavaScript to download and parse before the page renders) and INP (less JavaScript competing for the main thread during user interactions). Use Chrome DevTools Performance panel and Lighthouse to measure these directly.

**Connection to other lessons.** Lesson 12.1 introduced Core Web Vitals. Lesson 12.3 covered code splitting and lazy loading patterns. This lesson provides the build-tool perspective: how to verify that those patterns actually work in the production output.

## Going Deeper

**Official docs to read next:**

- [vite.dev/guide/build](https://vite.dev/guide/build) — Vite's production build documentation.
- [rolldown.rs/guide/output-options](https://rolldown.rs/) — Rolldown output configuration options.
- [svelte.dev/docs/kit/performance](https://svelte.dev/docs/kit/performance) — SvelteKit-specific performance guidance.

**Advanced pattern: CI-based bundle size tracking.** Add a step to your CI pipeline that runs `pnpm build`, parses the output sizes, and compares them to the previous deployment. If any chunk grows more than 10%, the pipeline posts a warning comment on the PR. Tools like `bundlesize` and `size-limit` automate this. This prevents regressions: no one can accidentally add a 200 kB dependency without the team noticing.

**Challenge question (combines Lesson 21.6 + Lesson 21.2 + Lesson 12.3):** Your SvelteKit app has 20 routes. Three routes use a heavy 3D visualization library (Threlte + Three.js, approximately 300 kB gzip). The other 17 routes have nothing to do with 3D. Describe the code splitting strategy that ensures the 17 non-3D routes never download the 3D code, and explain which `vite.config.ts` options and SvelteKit patterns you would use.

## 2. Style it — PE7 applied to the bundle stats dashboard

The mini-build is a bundle stats dashboard. Chunk cards use `var(--color-surface-2)` with size bars colored by category: `var(--color-brand)` for app code, `var(--color-warning)` for vendor, `var(--color-error)` for oversized. File sizes use monospace `var(--text-xs)` with tabular-nums. The layout is a data grid on desktop and stacked cards on mobile.

## 3. Interact — sorting and filtering chunks by size

The problem: raw build output is hard to scan when you have dozens of chunks.

```typescript
interface ChunkInfo {
    name: string;
    rawSize: number;
    gzipSize: number;
    category: 'app' | 'vendor' | 'shared';
    isOversized: boolean;
}
```

The interactive element displays chunks as sortable, filterable cards. Students can sort by raw size, gzip size, or name, and filter by category. Oversized chunks are highlighted.

## 4. Mini-build — Bundle stats dashboard

**File:** `src/routes/modules/21-vite-vitest/06-build-analysis/+page.svelte`

This page simulates a bundle analysis view with sortable chunk cards showing module sizes, categories, and oversized warnings.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/21-vite-vitest/06-build-analysis`.

### Prove the concept

1. Run `pnpm build` in your terminal and compare the real output sizes with the simulated data on this page.
2. Look for the largest chunk in the real build output. Is it app code or vendor code?
3. If any chunk exceeds 500 kB (the default warning limit), consider the optimization strategies from this lesson.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between uncompressed size and gzip size, and which one matters more for user experience?</summary>

Uncompressed size is the raw file on disk; it matters for parsing speed because the browser must parse every byte of JavaScript. Gzip size is the compressed transfer size; it matters for download speed because it determines how long users wait for the file to arrive. Both matter: gzip size affects network time, uncompressed size affects CPU time. For most optimization decisions, focus on gzip size first (network is usually the bottleneck), but watch uncompressed size for mobile performance.
</details>

<details>
<summary><strong>Q2.</strong> Under what conditions does tree-shaking fail?</summary>

Tree-shaking fails when: (1) the code uses CommonJS (`require()`) instead of ES modules (`import/export`), (2) the library has side effects in its module scope and does not declare `"sideEffects": false` in package.json, (3) imports are dynamic or use `export *` re-exports that prevent static analysis, or (4) the code is only reachable through eval or dynamic property access.
</details>

<details>
<summary><strong>Q3.</strong> How does SvelteKit create per-route code splitting automatically?</summary>

Each `+page.svelte` file is treated as a separate entry point. Rolldown builds a dependency graph from each entry, and modules unique to a single route are bundled into that route's chunk. Modules shared by multiple routes are extracted into shared chunks. When a user navigates to a route, only that route's chunk (and any shared chunks it needs) are downloaded.
</details>

<details>
<summary><strong>Q4.</strong> When would you use manualChunks and when would you rely on automatic splitting?</summary>

Rely on automatic splitting for most cases — SvelteKit's per-route splitting handles the common scenario well. Use `manualChunks` when you need to isolate a large third-party library (like a charting library) into its own chunk to prevent it from polluting the main vendor chunk or being included in routes that do not use it.
</details>

<details>
<summary><strong>Q5.</strong> How does build.sourcemap: 'hidden' differ from build.sourcemap: true?</summary>

Both generate source map files. `true` adds a `//# sourceMappingURL=file.js.map` comment to the output, telling browsers where to find the map. `'hidden'` generates the map file but omits the comment, so browsers do not load the map automatically. This is useful for error tracking services (Sentry, Datadog) that can use the maps privately without exposing source code to users.
</details>

## 6. Common mistakes

- **Never running pnpm build during development.** Developers who only use `pnpm dev` miss bundle size problems until deployment. Run `pnpm build` periodically (weekly, or before merging large PRs) to catch size regressions early.
- **Importing entire libraries when you need one function.** `import _ from 'lodash'` imports the entire library. `import debounce from 'lodash-es/debounce'` imports only the function you need. The difference can be 70+ kB.
- **Assuming tree-shaking always works.** Tree-shaking depends on the library being authored with ESM and no side effects. Many popular libraries ship CommonJS or have side-effectful module scopes. Verify with the visualizer.
- **Over-splitting into too many small chunks.** Each HTTP request has overhead (DNS, TLS, headers). Splitting your code into hundreds of 1 kB chunks is worse than having a few 20 kB chunks. HTTP/2 helps but does not eliminate per-request overhead entirely.

## 7. What's next

Lesson 21.7 shifts from build tooling to testing — introducing Vitest, the test runner that shares Vite's transform pipeline and configuration.
