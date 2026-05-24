---
module: 21
lesson: 21.1
title: What Vite actually does
duration: 50 minutes
prerequisites:
  - "1.2 — Project setup with pnpm + SvelteKit 2"
  - "1.4 — TypeScript type annotations on variables"
  - "Basic terminal / command-line usage"
learning_objectives:
  - Explain the module graph and why browsers cannot natively consume bare-specifier imports
  - Describe the difference between the Vite dev server and the production build pipeline
  - Articulate how dependency pre-bundling with esbuild speeds up cold starts
  - Trace an HMR update from file save through WebSocket to browser patch
  - Identify how SvelteKit plugs into Vite via @sveltejs/vite-plugin-svelte
status: ready
---

# Lesson 21.1 — What Vite actually does

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — The invisible machine that has been running your code since day one

### 1.1 The problem: browsers do not understand your project

Every time you have run `pnpm dev` in this course, something extraordinary happened in the background. You wrote a `.svelte` file with TypeScript, imported components from `$lib`, referenced CSS tokens from `app.css`, and the browser showed your page instantly. But browsers cannot do any of that natively.

A browser does not understand `.svelte` files. It does not know what `$lib` means. It cannot parse TypeScript. It cannot resolve an `import` statement that says `import { fade } from 'svelte/transition'` because that is a **bare specifier** — a module path without a file extension or a URL, just a package name. The browser needs actual URLs pointing to actual JavaScript files. Something has to translate your developer-friendly source code into browser-friendly output. That something is **Vite**.

**Vite** (pronounced "veet", French for "fast") is a build tool that sits between your source code and the browser. It does two fundamentally different jobs depending on whether you are developing or deploying:

1. **Dev server** — serves your source files on-demand, transforms them just-in-time, and pushes changes to the browser over a WebSocket.
2. **Production build** — bundles all your source code into optimized, minified, fingerprinted output files ready for deployment.

These are not the same process wearing different hats. They are two separate architectures with different performance characteristics, different trade-offs, and different failure modes. Understanding both is what separates a developer who uses Vite from one who can debug it.

### 1.2 The module graph — Vite's mental model of your project

When Vite starts in dev mode, it does not bundle your entire application up front the way Webpack did. Instead, it builds a **module graph** — a directed graph where every node is a file and every edge is an `import` statement.

The browser requests `http://localhost:5173/src/routes/+page.svelte`. Vite intercepts this request, reads the file, transforms it (compiling Svelte to JS, stripping TypeScript types), and sends back valid JavaScript. If that file imports `$lib/components/Card.svelte`, Vite records an edge in the module graph from `+page.svelte` to `Card.svelte`. When the browser's JavaScript engine encounters the import, it sends another request to Vite for `Card.svelte`. Vite transforms that file too, records its imports, and the graph grows.

This on-demand approach means Vite never processes a file you are not using. In a project with 500 components, if the page you are viewing only uses 12 of them, Vite only transforms 12 files. Webpack, by contrast, would bundle all 500 before showing you anything. This is why Vite's cold start is fast: it does the minimum work needed to serve the page you actually requested.

The module graph is not just a performance trick. It is also the data structure that makes **Hot Module Replacement** (HMR) possible. When you save a file, Vite looks up that file in the module graph, finds every module that depends on it (directly or transitively), determines the smallest set of modules that need to be re-evaluated, and pushes only those updates to the browser. Without the module graph, Vite would have to reload the entire page on every save.

### 1.3 Dependency pre-bundling with esbuild

Your project imports from `node_modules` — packages like `svelte`, `svelte/transition`, and any third-party library you have installed. These packages often ship hundreds of tiny files using CommonJS (`require()`) or deeply nested ESM. If Vite served each tiny file individually, the browser would make hundreds of HTTP requests just to load one library, and the waterfall of requests would make the page take seconds to appear.

Vite solves this with **dependency pre-bundling**. On the first `pnpm dev`, Vite scans your source code to discover every third-party import, then uses **esbuild** — a bundler written in Go that runs 10-100x faster than JavaScript-based bundlers — to combine each library's hundreds of files into a single, ESM-compatible module. These pre-bundled modules are cached in `node_modules/.vite/deps`. On subsequent starts, if your dependencies have not changed, Vite skips the pre-bundling step entirely and reads from the cache.

You can see this in action. Open `node_modules/.vite/deps` in your project and you will find files like `svelte.js` and `svelte_transition.js`. These are the pre-bundled versions that the browser actually loads. They are large, concatenated files — the opposite of the hundreds of small source files in `node_modules/svelte/src/`. This trade-off (one large file vs many small files) is worthwhile because HTTP/2 multiplexing has limits, and the browser's module loader has per-request overhead that adds up.

### 1.4 The dev server vs the production build

**Dev mode** (`pnpm dev`) uses native ES modules. Vite starts an HTTP server, intercepts browser requests, transforms files on-the-fly, and serves them as individual modules. The browser's native `import` system handles loading. There is no bundling step — each file is a separate HTTP response. This means:

- Startup is fast (no bundling).
- File changes are fast (only the changed file and its dependents are re-processed).
- The output is not optimized — no minification, no tree-shaking, no code splitting.

**Production mode** (`pnpm build`) uses **Rollup** (or, starting with Vite 6+, its successor **Rolldown**, a Rust-based bundler that is API-compatible with Rollup). Vite passes your entire source tree through Rollup's pipeline: resolving imports, tree-shaking unused exports, splitting code at dynamic import boundaries, minifying JavaScript and CSS, and generating fingerprinted filenames for cache-busting. The output is a set of static files in `build/` (or `.svelte-kit/output` for SvelteKit) ready for any static host or Node server.

The key insight: **dev mode and production mode use fundamentally different architectures.** This is why a bug can appear in production but not in dev (or vice versa). The most common cause is that dev mode does not tree-shake, so dead code that works fine in dev might depend on something that gets removed in production. Vite 8 is narrowing this gap by using Rolldown for both dev and production transforms, but the architectural difference remains: dev serves files individually, production bundles them.

### 1.5 How SvelteKit plugs into Vite

SvelteKit is not its own build tool. It is a **Vite plugin** — specifically, a collection of Vite plugins that teach Vite how to handle SvelteKit's conventions:

- `@sveltejs/vite-plugin-svelte` registers a Vite `transform` hook that intercepts every `.svelte` file and runs the Svelte compiler on it, producing JavaScript and CSS. It also handles HMR for Svelte components by accepting module updates at the component boundary.
- `@sveltejs/kit/vite` (the SvelteKit Vite plugin) handles file-based routing, generates the manifest of routes, configures SSR rendering, and sets up the dev-time middleware that serves server-rendered pages.

When you write `plugins: [sveltekit()]` in `vite.config.ts`, you are registering both of these. The SvelteKit plugin internally calls the Svelte plugin. You never need to add `svelte()` separately in a SvelteKit project.

### 1.6 The Rolldown transition in Vite 6-8

Vite historically used esbuild for dependency pre-bundling and development transforms, and Rollup for production builds. This dual-bundler architecture caused subtle inconsistencies between dev and prod. Starting with Vite 6, the team began integrating **Rolldown** — a Rust-based bundler that reimplements Rollup's plugin API with esbuild-level speed. Vite 8 (the version used in this course, May 2026) uses Rolldown as the default bundler for production builds via `build.rolldownOptions`, and experimentally for dev transforms.

For you as a SvelteKit developer, the practical impact is:

- Production builds are faster (Rolldown is 5-20x faster than Rollup for large projects).
- The gap between dev and prod behavior is shrinking.
- Rollup plugins still work because Rolldown is API-compatible.
- Configuration options are moving from `build.rollupOptions` to `build.rolldownOptions`, though both are supported during the transition.

### 1.7 "In production" — why understanding Vite matters for a real team

A startup with a 200-route SvelteKit application noticed that `pnpm dev` took 8 seconds to start cold. The team assumed this was normal. A senior engineer inspected `node_modules/.vite/deps` and found that pre-bundling was rerunning on every start because a dependency was using `require()` dynamically, which Vite's scanner could not detect statically. Adding that dependency to `optimizeDeps.include` in `vite.config.ts` brought cold start down to 1.2 seconds. The fix took five minutes — but it required understanding what Vite actually does under the hood. In a 12-developer team, saving 7 seconds per restart across dozens of daily restarts translates to hours of recovered productivity per week.

### 1.8 The TypeScript angle

Vite does not type-check your TypeScript. It **strips types** — it removes type annotations and converts TypeScript to JavaScript as fast as possible, without verifying that the types are correct. This is deliberate: type-checking is slow, and Vite prioritizes speed. Your editor (VS Code with the Svelte extension) performs type-checking in real time. The `pnpm check` command (which runs `svelte-check`) does a full type-check across all files. Vite's `pnpm build` does not.

This means you can have a TypeScript error that your editor shows as red squiggly lines, but `pnpm dev` will serve the page anyway. The file compiles because Vite only strips the types — it never reads them. This is a feature, not a bug: it keeps the dev server fast. But it means you must pay attention to your editor's diagnostics, and you should run `pnpm check` before deploying.

```typescript
// Vite transforms this to plain JavaScript by stripping types:
const count: number = 0;         // becomes: const count = 0;
function add(a: number): number { return a + 1; }
// becomes: function add(a) { return a + 1; }
```

### 1.9 Common interview question

**Q: "Explain the difference between how Vite serves files in development vs how it builds for production. Why does this distinction matter?"**

**Model answer:** In development, Vite uses native ES modules — the browser requests individual files, and Vite transforms each one on-demand (compiling Svelte, stripping TypeScript) without bundling. This gives fast startup and instant HMR because only changed files are re-processed. In production, Vite uses Rolldown (or Rollup) to bundle all source files into optimized chunks: tree-shaking removes unused code, minification reduces file sizes, code splitting creates separate chunks per route, and filenames are fingerprinted for cache-busting. This distinction matters because bugs can appear in one mode but not the other — dev mode does not tree-shake, so dead code that references side effects might work in dev but break in production. Understanding both modes helps you diagnose environment-specific issues.

## Deep Dive

**The module graph in detail.** Vite's module graph is an in-memory data structure (an instance of `ModuleGraph` in Vite's source) that tracks every module the server has processed. Each node stores the module's URL, its transformed code, a timestamp, the set of modules it imports (`importedModules`), and the set of modules that import it (`importers`). When a file changes, Vite walks the `importers` set upward through the graph to find an **HMR boundary** — a module that has registered an `import.meta.hot.accept()` call, meaning it knows how to apply the update without a full page reload. For Svelte components, `@sveltejs/vite-plugin-svelte` automatically adds HMR acceptance code, so every `.svelte` file is a boundary. For plain `.ts` files, you would need to add acceptance code manually (or accept that changes to those files trigger a full reload).

**esbuild's role and limitations.** esbuild pre-bundles dependencies in milliseconds because it is written in Go, compiled to native code, and parallelizes across CPU cores. However, esbuild intentionally does not support some Rollup/Rolldown features: it does not run Rollup plugins, it has limited CSS module support, and it does not perform scope hoisting as aggressively. This is why Vite uses esbuild only for the parts where speed matters most (dependency pre-bundling, TypeScript stripping) and Rolldown for the parts where correctness matters most (production bundling, plugin compatibility).

**Why Vite replaced Webpack.** Webpack bundles everything up front. On a 500-module project, this means parsing, resolving, and concatenating 500 modules before the dev server can respond to a single request. With HTTP/1.1, this was necessary because browsers limited concurrent connections to six per domain — serving 500 individual files would be catastrophically slow. Vite's approach works because modern browsers support HTTP/2 (multiplexing dozens of requests over a single connection) and native ES modules (the browser's built-in module loader). Vite did not just optimize Webpack's architecture — it abandoned it for a fundamentally different one that is only possible because browsers evolved.

**The transform pipeline.** When Vite processes a file, it runs through a chain of plugin hooks: `resolveId` (turns an import specifier into a file path), `load` (reads the file contents), and `transform` (modifies the source code). Each plugin in the chain can modify the output. For a `.svelte` file, the Svelte plugin's `transform` hook receives the raw Svelte source and returns compiled JavaScript plus a CSS module. Vite then adds HMR boilerplate, resolves any remaining imports, and sends the result to the browser. This pipeline is the same one used by Rollup/Rolldown, which is why Rollup plugins generally work in Vite without modification.

**Connection to other lessons.** Lesson 21.2 explores every `vite.config.ts` option that matters for SvelteKit. Lesson 21.4 teaches you to write your own Vite plugin, using the same `resolveId`/`load`/`transform` hooks described here. Lesson 21.5 dives deep into HMR — the WebSocket protocol, module invalidation, and why Svelte components preserve state across edits.

## Going Deeper

**Official docs to read next:**

- [vite.dev/guide](https://vite.dev/guide/) — Vite's official "Why Vite" and architecture overview.
- [vite.dev/guide/dep-pre-bundling](https://vite.dev/guide/dep-pre-bundling) — full explanation of dependency pre-bundling, including how to troubleshoot when it goes wrong.
- [svelte.dev/docs/kit/project-structure](https://svelte.dev/docs/kit/project-structure) — SvelteKit's project structure, showing where Vite fits into the build.

**Advanced pattern: tracing a request through the Vite pipeline.** Start `pnpm dev` with the `--debug` flag: `pnpm dev -- --debug`. Vite will log every file it resolves, transforms, and serves. Open a route in the browser and watch the terminal — you will see the exact order in which files are requested, the time each transform takes, and which plugins handled each file. This is invaluable for diagnosing slow page loads in development.

**Challenge question (combines Lesson 21.1 + Lesson 21.4 + Lesson 21.5):** A colleague reports that adding a new npm package causes `pnpm dev` to take 15 seconds to start cold. The package is a large charting library that ships 200+ files in CommonJS format. Using what you learned about dependency pre-bundling, explain: (a) why the cold start is slow, (b) what Vite is doing during those 15 seconds, and (c) what configuration change in `vite.config.ts` would fix it.

## 2. Style it — PE7 applied to the Vite pipeline visualizer

The mini-build is a visual diagram page showing the Vite pipeline stages with animated flow. Each pipeline stage (source, transform, serve/bundle) is a card using `var(--color-surface-2)` with `var(--radius-lg)` and `var(--shadow-md)`. The active stage highlights with `var(--color-brand)` border. Flow arrows between stages use `var(--color-text-muted)` and animate with `var(--dur-base)` and `var(--ease-out)`. The entire layout stacks vertically on mobile and flows horizontally on desktop via a `min-width: 768px` media query.

## 3. Interact — toggling between dev and prod pipeline views

The problem: developers often do not realize that `pnpm dev` and `pnpm build` use completely different architectures. The interactive element lets you toggle between "Dev mode" and "Production mode" views, with each view showing the different pipeline stages, tools used, and output characteristics.

```typescript
type PipelineMode = 'dev' | 'prod';

interface PipelineStage {
    id: string;
    label: string;
    tool: string;
    description: string;
    timeEstimate: string;
}
```

When the mode toggles, the pipeline stages animate to show the different paths. In dev mode, the pipeline is: Source -> Vite Dev Server -> Browser (native ESM). In prod mode, the pipeline is: Source -> Rolldown -> Optimized Chunks -> CDN. This makes the architectural difference tangible.

## 4. Mini-build — Vite pipeline visualizer

**File:** `src/routes/modules/21-vite-vitest/01-what-vite-does/+page.svelte`

This page renders an interactive diagram of the Vite pipeline. The student can toggle between dev and production modes to see how the pipeline changes. Each stage shows the tool responsible, a brief description, and an estimated processing time. The flow between stages animates to show the direction of data movement.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/21-vite-vitest/01-what-vite-does`.

### Prove the concept

1. Open DevTools **Network** tab and reload the page.
2. Filter by JS files. In dev mode, you will see individual module requests — one per component, one per import. Each is a separate HTTP request that Vite transformed on-the-fly.
3. Look at the response headers. Vite adds `x-vite-dev` headers and uses `304 Not Modified` for cached modules.
4. Now run `pnpm build` and inspect the output in `.svelte-kit/output`. Notice how the individual files are combined into chunks with fingerprinted names like `page-abc123.js`.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does Vite not bundle your source files in development mode?</summary>

Because Vite leverages the browser's native ES module system. Instead of bundling everything up front (which is slow), Vite transforms individual files on-demand as the browser requests them. This means startup is nearly instant — Vite only processes the files needed for the page you are viewing, not the entire project.
</details>

<details>
<summary><strong>Q2.</strong> What is dependency pre-bundling and why is it necessary?</summary>

Dependency pre-bundling is the process where Vite uses esbuild to combine each npm package's many small files into a single ESM-compatible module. It is necessary because npm packages often ship hundreds of tiny files, and if the browser had to make a separate HTTP request for each one, the waterfall of network requests would make the page unacceptably slow even with HTTP/2 multiplexing.
</details>

<details>
<summary><strong>Q3.</strong> Explain why a bug might appear in production but not in development.</summary>

Dev mode and production mode use different architectures. Dev mode does not tree-shake, so unused code still runs. Production mode removes unused exports via tree-shaking. If your code has a side effect that depends on dead code (code that is never imported but has side effects), it will work in dev (where the dead code is still present) but break in production (where tree-shaking removes it). Additionally, production mode minifies variable names and concatenates modules, which can expose issues with global scope pollution.
</details>

<details>
<summary><strong>Q4.</strong> What does Vite do with your TypeScript code?</summary>

Vite strips TypeScript type annotations to produce plain JavaScript. It does not type-check — it does not verify that your types are correct. This keeps the dev server fast. Type-checking is handled separately by your editor (VS Code with Svelte extension) and by the `pnpm check` command (which runs `svelte-check`).
</details>

<details>
<summary><strong>Q5.</strong> How does SvelteKit integrate with Vite?</summary>

SvelteKit is implemented as a Vite plugin. When you write `plugins: [sveltekit()]` in `vite.config.ts`, you register the SvelteKit plugin, which internally includes `@sveltejs/vite-plugin-svelte`. The Svelte plugin handles compiling `.svelte` files and HMR for components. The SvelteKit plugin handles file-based routing, route manifests, SSR configuration, and dev-time server middleware.
</details>

## 6. Common mistakes

- **Assuming `pnpm dev` and `pnpm build` behave identically.** They use fundamentally different architectures. Always test a production build before deploying. A file that works in dev can fail in prod due to tree-shaking, minification, or different module resolution order.
- **Deleting `node_modules/.vite` thinking it is unnecessary cache.** This directory contains pre-bundled dependencies. Deleting it forces Vite to re-run esbuild pre-bundling on the next startup, which adds seconds to your cold start. It is safe to delete (Vite recreates it), but unnecessary unless you are debugging a stale cache issue.
- **Adding `svelte()` and `sveltekit()` to the plugins array.** In a SvelteKit project, `sveltekit()` already includes the Svelte plugin internally. Adding both causes duplicate transforms, confusing errors, and broken HMR. Use only `sveltekit()`.
- **Ignoring TypeScript errors because the dev server still works.** Vite strips types without checking them. A type error in your editor is a real bug — the dev server does not catch it because it never reads your types. Run `pnpm check` regularly.

## 7. What's next

Lesson 21.2 opens `vite.config.ts` and examines every option that matters for a SvelteKit project — from `server.proxy` for API development to `build.target` for browser compatibility.
