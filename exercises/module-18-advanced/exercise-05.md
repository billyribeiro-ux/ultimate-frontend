---
module: 18
exercise: 5
title: Monorepo Setup
difficulty: principal
estimated_time: 60
skills_tested:
  - pnpm workspace configuration
  - shared package architecture
  - dependency management
  - TypeScript path mapping
  - build coordination
---

# Exercise 18.5 — Monorepo Setup

## Brief

Design and document a monorepo structure for a Svelte ecosystem project with three packages: a shared UI component library (`@acme/ui`), a shared utilities library (`@acme/utils`), and a SvelteKit application (`@acme/app`) that consumes both. This exercise teaches the architecture patterns for scaling Svelte projects beyond a single application.

## Requirements

1. Create `src/routes/exercises/18-advanced/05/+page.svelte` documenting the monorepo structure
2. Define the directory structure for a pnpm workspace: `packages/ui/`, `packages/utils/`, `apps/web/`
3. Show the `pnpm-workspace.yaml` configuration
4. Show `package.json` for each package with proper `exports` fields and `svelte` entry points
5. Demonstrate how the app imports from shared packages: `import { Button } from '@acme/ui'`
6. Show TypeScript configuration with path aliases and project references
7. Document the build order: utils first (no deps), then ui (depends on utils), then app (depends on both)
8. Show how to share PE7 design tokens across packages
9. Include a dependency graph visualization
10. Demonstrate a shared TypeScript config that all packages extend
11. Style the documentation page with PE7 tokens

## Constraints

- No actual monorepo creation (this is a design/documentation exercise)
- TypeScript strict mode for all package configs
- The shared UI package must export `.svelte` files directly (not compiled)
- All internal package references must use workspace protocol (`workspace:*`)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A pnpm workspace is defined by `pnpm-workspace.yaml` at the root with `packages: ['packages/*', 'apps/*']`. Each package has its own `package.json` with a `name` field like `@acme/ui`. Internal dependencies use `"@acme/utils": "workspace:*"` — pnpm resolves this to the local package.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The `exports` field in `package.json` defines the public API of a package. For a Svelte component library: `"exports": { ".": { "types": "./dist/index.d.ts", "svelte": "./src/index.ts" } }`. The `svelte` condition tells SvelteKit and Vite to use the source files directly, enabling HMR and avoiding a separate build step during development.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```json
// packages/ui/package.json
{
  "name": "@acme/ui",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./src/index.ts"
    }
  },
  "dependencies": {
    "@acme/utils": "workspace:*"
  }
}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/18-advanced/05/+page.svelte`**

```svelte
<script lang="ts">
  interface PackageInfo {
    name: string;
    path: string;
    description: string;
    deps: string[];
  }

  const packages: PackageInfo[] = [
    { name: '@acme/utils', path: 'packages/utils', description: 'Shared TypeScript utilities, validators, and formatters', deps: [] },
    { name: '@acme/ui', path: 'packages/ui', description: 'Svelte 5 component library with PE7 design tokens', deps: ['@acme/utils'] },
    { name: '@acme/app', path: 'apps/web', description: 'SvelteKit application consuming shared packages', deps: ['@acme/ui', '@acme/utils'] }
  ];

  interface ConfigFile {
    filename: string;
    path: string;
    content: string;
  }

  const configs: ConfigFile[] = [
    {
      filename: 'pnpm-workspace.yaml',
      path: '/',
      content: `packages:
  - 'packages/*'
  - 'apps/*'`
    },
    {
      filename: 'package.json',
      path: 'packages/utils/',
      content: `{
  "name": "@acme/utils",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./src/index.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "check": "tsc --noEmit"
  }
}`
    },
    {
      filename: 'package.json',
      path: 'packages/ui/',
      content: `{
  "name": "@acme/ui",
  "version": "0.1.0",
  "type": "module",
  "svelte": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./src/index.ts"
    }
  },
  "dependencies": {
    "@acme/utils": "workspace:*"
  },
  "peerDependencies": {
    "svelte": "^5.0.0"
  }
}`
    },
    {
      filename: 'package.json',
      path: 'apps/web/',
      content: `{
  "name": "@acme/app",
  "version": "0.1.0",
  "type": "module",
  "dependencies": {
    "@acme/ui": "workspace:*",
    "@acme/utils": "workspace:*",
    "@sveltejs/kit": "^2.0.0",
    "svelte": "^5.0.0"
  }
}`
    },
    {
      filename: 'tsconfig.json',
      path: '/',
      content: `{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "declaration": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}`
    }
  ];

  const buildOrder = [
    { step: 1, pkg: '@acme/utils', reason: 'No internal dependencies' },
    { step: 2, pkg: '@acme/ui', reason: 'Depends on @acme/utils' },
    { step: 3, pkg: '@acme/app', reason: 'Depends on @acme/ui and @acme/utils' }
  ];
</script>

<main class="page">
  <h1>Monorepo Architecture</h1>
  <p class="intro">A pnpm workspace structure for sharing Svelte components and utilities across applications.</p>

  <section class="packages-section">
    <h2>Packages</h2>
    <div class="package-grid">
      {#each packages as pkg}
        <div class="package-card">
          <code class="pkg-name">{pkg.name}</code>
          <p class="pkg-path">{pkg.path}/</p>
          <p class="pkg-desc">{pkg.description}</p>
          {#if pkg.deps.length > 0}
            <div class="pkg-deps">
              <span class="deps-label">Depends on:</span>
              {#each pkg.deps as dep}
                <code class="dep">{dep}</code>
              {/each}
            </div>
          {:else}
            <span class="no-deps">No internal dependencies</span>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <section class="dep-graph">
    <h2>Dependency Graph</h2>
    <div class="graph">
      <div class="graph-row">
        <div class="graph-node leaf">@acme/utils</div>
      </div>
      <div class="graph-arrow">&#8595;</div>
      <div class="graph-row">
        <div class="graph-node">@acme/ui</div>
      </div>
      <div class="graph-arrow">&#8595;</div>
      <div class="graph-row">
        <div class="graph-node app">@acme/app</div>
      </div>
    </div>
  </section>

  <section class="configs-section">
    <h2>Configuration Files</h2>
    {#each configs as config}
      <div class="config-card">
        <div class="config-header">
          <code class="config-filename">{config.filename}</code>
          <span class="config-path">{config.path}</span>
        </div>
        <pre class="config-content"><code>{config.content}</code></pre>
      </div>
    {/each}
  </section>

  <section class="build-section">
    <h2>Build Order</h2>
    <div class="build-steps">
      {#each buildOrder as item}
        <div class="build-step">
          <span class="step-number">{item.step}</span>
          <div class="step-info">
            <code>{item.pkg}</code>
            <span class="step-reason">{item.reason}</span>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section class="tokens-section">
    <h2>Sharing Design Tokens</h2>
    <div class="approach-card">
      <p>PE7 tokens live in <code>packages/ui/src/styles/tokens.css</code>. The app imports them in its root layout:</p>
      <pre><code>{'<!-- apps/web/src/routes/+layout.svelte -->\n<style>\n  @import \'@acme/ui/styles/tokens.css\';\n</style>'}</code></pre>
      <p>All packages reference the same token variables, ensuring visual consistency across the monorepo.</p>
    </div>
  </section>
</main>

<style>
  .page { max-inline-size: var(--content-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }
  section { margin-block-end: var(--space-2xl); }

  .package-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: var(--space-md); }
  .package-card { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); }
  .pkg-name { font-size: var(--text-sm); font-weight: 700; color: var(--color-brand); }
  .pkg-path { font-size: var(--text-xs); color: var(--color-text-muted); font-family: monospace; margin-block: var(--space-xs); }
  .pkg-desc { font-size: var(--text-sm); color: var(--color-text-muted); margin-block-end: var(--space-sm); }
  .pkg-deps { display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; }
  .deps-label { font-size: var(--text-xs); color: var(--color-text-muted); }
  .dep { font-size: var(--text-xs); background: var(--color-surface); padding: 0.1em 0.4em; border-radius: var(--radius-sm); }
  .no-deps { font-size: var(--text-xs); color: var(--color-text-muted); }

  .graph { display: grid; place-items: center; gap: var(--space-xs); padding: var(--space-lg); background: var(--color-surface-2); border-radius: var(--radius-lg); border: 1px solid var(--color-border); }
  .graph-node { padding: var(--space-sm) var(--space-lg); border-radius: var(--radius-md); background: var(--color-surface); border: 2px solid var(--color-border); font-family: monospace; font-size: var(--text-sm); font-weight: 600; }
  .graph-node.leaf { border-color: var(--color-success); }
  .graph-node.app { border-color: var(--color-brand); }
  .graph-arrow { font-size: var(--text-lg); color: var(--color-text-muted); }

  .config-card { margin-block-end: var(--space-md); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
  .config-header { display: flex; justify-content: space-between; padding: var(--space-sm) var(--space-md); border-block-end: 1px solid var(--color-border); }
  .config-filename { font-size: var(--text-sm); font-weight: 700; color: var(--color-brand); }
  .config-path { font-size: var(--text-xs); color: var(--color-text-muted); }
  .config-content { padding: var(--space-md); font-size: var(--text-xs); overflow-x: auto; margin: 0; }

  .build-steps { display: grid; gap: var(--space-sm); }
  .build-step { display: flex; align-items: center; gap: var(--space-md); background: var(--color-surface-2); border-radius: var(--radius-md); padding: var(--space-sm) var(--space-md); }
  .step-number { inline-size: 2rem; block-size: 2rem; border-radius: var(--radius-full); background: var(--color-brand); color: var(--color-surface); display: grid; place-items: center; font-weight: 700; font-size: var(--text-sm); flex-shrink: 0; }
  .step-info { display: grid; gap: 0.1rem; }
  .step-info code { font-size: var(--text-sm); font-weight: 600; }
  .step-reason { font-size: var(--text-xs); color: var(--color-text-muted); }

  .approach-card { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); }
  .approach-card p { font-size: var(--text-sm); color: var(--color-text-muted); margin-block-end: var(--space-sm); }
  .approach-card code { font-size: var(--text-xs); background: var(--color-surface); padding: 0.1em 0.3em; border-radius: var(--radius-sm); }
  .approach-card pre { background: var(--color-surface); padding: var(--space-sm); border-radius: var(--radius-sm); font-size: var(--text-xs); overflow-x: auto; margin-block: var(--space-sm); }
</style>
```

### Explanation

A monorepo consolidates related packages into a single repository with shared tooling. The pnpm workspace protocol (`workspace:*`) tells pnpm to resolve `@acme/ui` to the local `packages/ui/` directory instead of fetching from npm. The `exports` field in each package's `package.json` defines the public API surface — consumers can only import what is explicitly exported. The `svelte` condition in exports tells SvelteKit to import source `.svelte` files directly, enabling HMR without a separate build step. The build order follows the dependency graph: packages with no internal dependencies build first. The shared `tsconfig.json` at the root ensures consistent TypeScript settings. Design tokens are shared by hosting them in the UI package and importing the CSS in consuming apps. In production, you would add `turbo.json` (Turborepo) or `nx.json` (Nx) for build caching and parallel task execution. This architecture scales to dozens of packages — companies like Vercel and Shopify use monorepos with hundreds of internal packages sharing components and utilities.
</details>
