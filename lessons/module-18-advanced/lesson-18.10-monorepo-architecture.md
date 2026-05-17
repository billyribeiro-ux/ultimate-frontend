---
module: 18
lesson: 18.10
title: Monorepo architecture
duration: 70 minutes
prerequisites:
  - "1.2 — Project setup with pnpm + SvelteKit"
  - "18.7 — Build-time data with Vite plugins"
  - "Familiarity with pnpm, package.json, and tsconfig.json"
learning_objectives:
  - Structure a pnpm workspace monorepo with shared packages consumed by multiple SvelteKit applications
  - Configure TypeScript project references so each package has its own tsconfig and the editor resolves types across boundaries
  - Build a shared UI component library as an internal package with proper exports and Svelte 5 runes
  - Set up Turborepo or pnpm's built-in workspace scripts to orchestrate builds, tests, and linting across packages
  - Design a dependency graph that prevents circular imports and enforces architectural boundaries
status: ready
---

# Lesson 18.10 — Monorepo architecture

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Why and how to put multiple packages in one repository

### 1.1 The problem: code shared across applications without a strategy

You maintain two SvelteKit applications: a marketing site and a customer dashboard. Both need the same Button component, the same design tokens, and the same API client. Without a monorepo, you have three options, all bad:

1. **Copy and paste.** The components diverge within weeks. Bug fixes in one copy never reach the other.
2. **Publish to npm.** Every change requires a version bump, publish, and upgrade in both apps. The feedback loop for a one-line CSS fix is twenty minutes of ceremony.
3. **Git submodules.** Notoriously difficult to keep in sync, produce confusing merge conflicts, and break CI pipelines that do not initialize submodules.

A **monorepo** puts all related packages in a single repository. Each package has its own `package.json`, its own `tsconfig.json`, and its own test suite, but they all live under one `git` root. A workspace manager (pnpm workspaces, in our case) links them together so that `import { Button } from '@acme/ui'` resolves to the local `packages/ui` directory without any publishing step.

### 1.2 How pnpm workspaces solve it

pnpm's workspace protocol is the foundation. A `pnpm-workspace.yaml` file at the repository root declares which directories contain packages:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Any `package.json` inside `apps/` or `packages/` is a workspace member. When one member declares a dependency on another using the `workspace:` protocol, pnpm creates a symlink instead of downloading from the registry:

```json
{
  "dependencies": {
    "@acme/ui": "workspace:*"
  }
}
```

The `workspace:*` syntax means "use whatever version is in the local workspace." During `pnpm publish`, pnpm replaces `workspace:*` with the actual version number, so published packages have correct version references. But during development, the symlink means every change to `@acme/ui` is immediately visible in the consuming application — no rebuild, no version bump, no publish.

### 1.3 Structuring the monorepo

A well-structured monorepo follows a layered dependency graph. Packages at the bottom of the graph have no internal dependencies. Packages higher up depend on lower ones. Applications sit at the top and depend on packages but never on each other.

```
apps/
  marketing/     → SvelteKit app (depends on @acme/ui, @acme/tokens)
  dashboard/     → SvelteKit app (depends on @acme/ui, @acme/api-client)
packages/
  ui/            → Svelte component library (depends on @acme/tokens)
  tokens/        → Design tokens (no internal dependencies)
  api-client/    → Typed API client (no internal dependencies)
  tsconfig/      → Shared TypeScript configuration (no internal dependencies)
```

The `packages/tsconfig` package is a pattern that reduces duplication. Instead of copying the same `compilerOptions` into every `tsconfig.json`, each package extends a shared base:

```json
{
  "extends": "@acme/tsconfig/svelte.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

### 1.4 TypeScript project references

TypeScript project references let the editor resolve types across package boundaries without building every package first. Each `tsconfig.json` declares which other projects it references:

```json
{
  "references": [
    { "path": "../tokens" },
    { "path": "../ui" }
  ]
}
```

When you import `@acme/ui` in the dashboard app, TypeScript follows the project reference to `packages/ui/tsconfig.json`, reads its `include` and `outDir`, and resolves types from there. This is faster than scanning the entire monorepo because TypeScript only checks the referenced projects.

For Svelte components specifically, the `package.json` of the shared library must export `.svelte` files directly (not compiled JavaScript) so that the consuming SvelteKit application can compile them with its own Svelte version:

```json
{
  "name": "@acme/ui",
  "exports": {
    "./Button.svelte": "./src/Button.svelte",
    "./tokens": "./src/tokens.ts"
  },
  "svelte": "./src/index.ts"
}
```

### 1.5 Task orchestration with Turborepo

Running `pnpm build` in a monorepo with ten packages is wasteful if only one package changed. Turborepo (or pnpm's built-in `--filter` flag) solves this by understanding the dependency graph and only rebuilding packages whose source files (or dependencies' source files) changed.

A `turbo.json` configuration declares the task pipeline:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".svelte-kit/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

The `^build` syntax means "run `build` in all dependencies first." Turborepo hashes the source files and caches the output. If the hash has not changed, it replays the cached output instead of running the build — turning a 45-second build into a 2-second cache hit.

### 1.6 Preventing circular dependencies

Circular dependencies are the most dangerous architectural flaw in a monorepo. If `@acme/ui` imports from `@acme/api-client` and `@acme/api-client` imports from `@acme/ui`, neither can build without the other. pnpm will warn about workspace cycles, but it cannot prevent them.

The defense is a strict layering rule enforced by convention and tooling. Packages at the bottom layer (tokens, config) must never import from packages above them. Use a tool like `depcheck` or a custom ESLint rule to flag imports that violate the layer boundary.

### Deep Dive — Building and publishing a shared Svelte component library

Publishing a Svelte component library from a monorepo requires careful attention to the `exports` field in `package.json`. SvelteKit's `svelte-package` tool (via `pnpm exec svelte-package`) compiles your library's components into a `dist/` directory with proper type declarations.

The `package.json` must declare conditional exports so that both SvelteKit (which wants raw `.svelte` files) and non-Svelte consumers (which want compiled JavaScript) can import correctly:

```json
{
  "name": "@acme/ui",
  "version": "1.0.0",
  "svelte": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./Button.svelte": {
      "types": "./dist/Button.svelte.d.ts",
      "svelte": "./dist/Button.svelte",
      "default": "./dist/Button.svelte"
    }
  }
}
```

During local development within the monorepo, the consuming SvelteKit app resolves `@acme/ui` through pnpm's workspace symlink directly to the `src/` directory. This means changes to a shared component appear instantly via Vite's HMR without any build step. The `svelte-package` build only runs when you are preparing to publish to npm for external consumption.

For TypeScript, each shared package needs a `tsconfig.json` that uses `"composite": true` and `"declaration": true` so that project references work correctly:

```json
{
  "extends": "@acme/tsconfig/svelte.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

The `declarationMap` option is often overlooked but essential: it creates `.d.ts.map` files that let "Go to Definition" in VS Code jump to the original `.svelte` or `.ts` source rather than the generated declaration file. Without it, navigating across package boundaries lands you in unreadable generated code.

A common mistake is running `svelte-package` as part of the Turborepo build pipeline for local development. This is unnecessary — SvelteKit's Vite config resolves workspace packages from source. Only add `svelte-package` to the pipeline when your CI publishes to a registry.

## 2. Style it — PE7 applied to the monorepo visualizer mini-build

The mini-build is a visual dependency graph showing packages as cards and their dependencies as connecting lines. Package cards use `var(--color-surface-2)` with `var(--radius-lg)` borders. The card currently selected uses `border-color: var(--color-brand)`. Dependency arrows use a `2px solid var(--color-border)` line that becomes `var(--color-brand)` when highlighted.

Package names use `var(--text-sm)` with `font-weight: 700`. The package type label (app, library, config) uses `var(--text-xs)` with `color: var(--color-text-muted)`. The overall layout uses CSS Grid with `var(--space-lg)` gap, responsive from a single column on mobile to three columns at `min-width: 768px`.

## 3. Interact — building a reactive dependency graph explorer

The problem: displaying which packages depend on which, with the ability to click a package and highlight its upstream and downstream dependencies.

The data model uses TypeScript interfaces:

```typescript
interface WorkspacePackage {
  name: string;
  type: 'app' | 'library' | 'config';
  dependencies: string[];
}
```

The reactive state tracks which package is selected:

```typescript
let packages: WorkspacePackage[] = $state([
  { name: '@acme/tokens', type: 'config', dependencies: [] },
  { name: '@acme/ui', type: 'library', dependencies: ['@acme/tokens'] },
  { name: '@acme/marketing', type: 'app', dependencies: ['@acme/ui', '@acme/tokens'] },
]);

let selected: string | null = $state(null);

let highlighted: Set<string> = $derived.by(() => {
  if (!selected) return new Set<string>();
  const result = new Set<string>([selected]);
  // Add direct dependencies
  const pkg = packages.find(p => p.name === selected);
  if (pkg) pkg.dependencies.forEach(d => result.add(d));
  // Add dependents
  packages.filter(p => p.dependencies.includes(selected!))
    .forEach(p => result.add(p.name));
  return result;
});
```

Clicking a package card sets `selected`. The `$derived.by()` computes the full set of related packages. Each card's class binding checks membership in the set: `class:highlighted={highlighted.has(pkg.name)}`.

## 4. Mini-build — Monorepo dependency visualizer

**File path:** `src/routes/modules/18-advanced/10-monorepo-architecture/+page.svelte`

The visualizer displays a simulated monorepo with six packages across three layers. Clicking a package highlights it and all its direct dependencies and dependents. A sidebar shows the selected package's `package.json` exports configuration. The student can add a new dependency by selecting two packages and clicking "Add dependency," which updates the reactive graph.

**DevTools moment:** Open the Elements panel and inspect a package card. Notice the CSS custom properties inherited from `app.css`. Toggle the `highlighted` class on and off manually to see how the border color transitions. Then open the Svelte DevTools extension, find the component, and observe the `selected` and `highlighted` state values change as you click different packages.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> What does the workspace:* protocol in a pnpm dependency declaration do, and how does it differ from a regular version range?</summary>

The `workspace:*` protocol tells pnpm to resolve the dependency from the local workspace via a symlink, not from the npm registry. During development, this means changes to the dependency are immediately visible without publishing. When you run `pnpm publish`, pnpm replaces `workspace:*` with the actual version number from the dependency's `package.json`, so published packages have correct version references. A regular version range like `^1.0.0` always resolves from the registry.
</details>

<details>
<summary><strong>Q2.</strong> Why should a shared Svelte component library export raw .svelte files rather than pre-compiled JavaScript for monorepo consumers?</summary>

Each consuming SvelteKit application needs to compile Svelte components with its own Svelte version and configuration. If the library ships pre-compiled JavaScript, the consumer cannot apply its own Svelte compiler options, plugins, or preprocessors. Exporting raw `.svelte` files lets the consumer's Vite/SvelteKit pipeline handle compilation, ensuring consistency and enabling features like HMR across package boundaries.
</details>

<details>
<summary><strong>Q3.</strong> Explain how Turborepo's caching prevents redundant builds. What does it hash, and what does it store?</summary>

Turborepo hashes the source files, environment variables, and the outputs of dependency tasks to create a unique cache key for each task execution. If the hash matches a previous run, Turborepo replays the cached output (the files listed in `outputs` in `turbo.json`) instead of running the build command again. This turns a full monorepo build into a cache replay that takes seconds instead of minutes, as only packages with changed sources or changed dependencies actually rebuild.
</details>

<details>
<summary><strong>Q4.</strong> What is a circular dependency in a monorepo, and why is it particularly dangerous?</summary>

A circular dependency occurs when package A depends on package B and package B depends on package A (directly or through intermediaries). It is dangerous because neither package can be built first — each requires the other to be built already. Build tools either fail or produce incorrect output. It also indicates an architectural flaw: the two packages are not truly independent and should either be merged or their shared functionality extracted into a third package at a lower layer.
</details>

<details>
<summary><strong>Q5.</strong> What does the declarationMap option in tsconfig.json do, and why is it important for monorepo developer experience?</summary>

The `declarationMap` option generates `.d.ts.map` files alongside TypeScript declaration files. These maps allow VS Code's "Go to Definition" to navigate from a type reference in a consuming package directly to the original source file (`.ts` or `.svelte`) in the library package, rather than landing on the generated `.d.ts` file. Without it, navigating across package boundaries in a monorepo is frustrating because you see generated, unreadable declaration code instead of the actual implementation.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Running svelte-package in development.** The `svelte-package` tool is for publishing to npm. During local development, SvelteKit resolves workspace packages directly from source via pnpm symlinks. Running it unnecessarily adds a slow build step and can produce stale `dist/` files that shadow the live source.

2. **Circular workspace dependencies.** Adding `@acme/ui` as a dependency of `@acme/api-client` while `@acme/api-client` is already a dependency of `@acme/ui` creates a cycle that breaks builds. Enforce a strict layering policy and run `pnpm ls --depth 0` in each package to verify the dependency graph.

3. **Forgetting "composite": true in tsconfig.json.** TypeScript project references require `"composite": true` in the referenced project's `tsconfig.json`. Without it, the editor cannot resolve types across package boundaries, and you get "Cannot find module" errors even though the symlink exists.

4. **Using relative paths instead of package names.** Importing from `../../packages/ui/src/Button.svelte` bypasses the workspace resolution and breaks if you ever move the package. Always import through the package name: `import { Button } from '@acme/ui'`.

## 7. What's next — one sentence

With Module 18 complete, you have mastered advanced component patterns, build-time tooling, and architecture — next you will bring your applications to a global audience with internationalization in Module 19.
