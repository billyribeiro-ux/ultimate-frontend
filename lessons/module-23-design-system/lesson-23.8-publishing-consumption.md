---
module: 23
lesson: 23.8
title: Publishing & consumption
duration: 55 minutes
prerequisites:
  - "23.7 — Multi-theme architecture"
  - "23.6 — Versioning & changelogs"
  - "23.3 — Component API design"
learning_objectives:
  - Configure package.json exports, svelte field, and peer dependencies for a Svelte component library
  - Explain why the exports field is critical for tree-shaking in consumer applications
  - Set up a package for npm publishing with proper TypeScript type generation
  - Verify that tree-shaking works by auditing consumer bundle sizes
  - Describe the peer dependency strategy for Svelte and SvelteKit
status: ready
---

# Lesson 23.8 — Publishing & consumption

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Making your design system installable

### 1.1 The problem: sharing code without publishing is painful

Your design system has 20 components, 3 themes, visual regression tests, and a changelog. It works perfectly in your monorepo. Now another team wants to use it. Without publishing, they have to: clone your repo, copy the `src/lib` directory, manually resolve dependencies, keep their copy in sync with yours, and merge conflict on every update.

Publishing to npm transforms your design system from a local directory into a dependency that any team installs with `pnpm add @org/ui`. Updates are versions. Installation is automatic. Dependency resolution is handled by pnpm. The design system becomes a product with consumers.

### 1.2 The package.json anatomy for a Svelte library

A published Svelte component library has specific `package.json` requirements:

```json
{
    "name": "@org/ui",
    "version": "1.0.0",
    "type": "module",
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
        },
        "./styles/themes.css": "./dist/styles/themes.css"
    },
    "files": ["dist"],
    "peerDependencies": {
        "svelte": "^5.0.0"
    },
    "devDependencies": {
        "svelte": "^5.55.0",
        "@sveltejs/package": "^2.3.0"
    }
}
```

Each field serves a specific purpose:

**`"type": "module"`** — declares that `.js` files use ES modules (`import`/`export`), not CommonJS (`require`/`module.exports`).

**`"svelte"`** — the Svelte field tells the Svelte plugin where to find the package's entry point. This is essential: it tells Vite to compile the Svelte components rather than treating them as pre-compiled JavaScript.

**`"exports"`** — the exports map defines the public API surface. It controls what consumers can import. If `"./Button.svelte"` is in the exports map, consumers can write `import Button from '@org/ui/Button.svelte'`. If it is not, the import fails. The exports map is also what enables tree-shaking: bundlers know which files are entry points.

**`"files"`** — an allowlist of directories and files to include in the published package. `["dist"]` means only the `dist/` directory is included. Source code, tests, documentation, and configuration files are excluded, reducing the package size.

**`"peerDependencies"`** — declares that the consumer must also install Svelte. Using `peerDependencies` ensures there is only one copy of Svelte in the consumer's `node_modules`, preventing duplicate-runtime bugs.

### 1.3 The @sveltejs/package tool

SvelteKit provides `@sveltejs/package` for building library packages. It reads components from `src/lib`, compiles them, generates TypeScript declaration files, and outputs everything to `dist/`.

```bash
pnpm exec svelte-package
```

This command:
1. Copies `.svelte` files to `dist/` (they are shipped as source for the consumer's Vite/Svelte pipeline to compile).
2. Compiles `.ts` files to `.js` with declaration files.
3. Processes any CSS files.
4. Generates the `dist/` directory matching the structure of `src/lib/`.

Consumers import the `.svelte` files, and their own Vite setup compiles them. This is different from React libraries, which ship pre-compiled JavaScript. Svelte libraries ship source `.svelte` files because the Svelte compiler produces different output depending on the consumer's configuration (SSR vs client, hydration mode, etc.).

### 1.4 Tree-shaking verification

Tree-shaking removes unused exports from the final bundle. If a consumer imports only `Button` from `@org/ui`, the `Modal`, `Toast`, `Card`, and all other components should not appear in their bundle.

Tree-shaking works when:
1. The package uses ES modules (`"type": "module"`).
2. The exports map correctly declares individual entry points.
3. Components do not have side effects that prevent tree-shaking.

Verify tree-shaking by building a minimal consumer app that imports one component and checking the bundle size:

```typescript
// Consumer's page
import Button from '@org/ui/Button.svelte';
```

If the bundle includes code from `Modal.svelte`, tree-shaking is broken. The most common cause is a barrel export that re-exports everything:

```typescript
// This barrel file prevents tree-shaking in some configurations:
export { default as Button } from './Button.svelte';
export { default as Modal } from './Modal.svelte';
export { default as Card } from './Card.svelte';
```

Some bundlers handle barrel files well; others do not. For guaranteed tree-shaking, define individual export paths in the exports map and encourage consumers to import specific components: `import Button from '@org/ui/Button.svelte'` rather than `import { Button } from '@org/ui'`.

### 1.5 Peer dependencies strategy

Svelte must be a peer dependency, not a regular dependency. If `@org/ui` includes Svelte as a regular dependency, the consumer's app might end up with two copies of Svelte — one from their own `package.json` and one from `@org/ui`. Two Svelte runtimes cause cryptic bugs: reactivity breaks, context sharing fails, and components behave unpredictably.

Other peer dependency candidates:
- `svelte` (always)
- `@sveltejs/kit` (if the library uses SvelteKit-specific features like `$app/*`)
- `three` and `@threlte/core` (if the library includes 3D components)

Regular dependencies are appropriate for utility packages that the library uses internally and the consumer does not interact with directly.

### 1.6 Publishing to npm

Publishing is a two-step process:

```bash
# Build the library
pnpm exec svelte-package

# Publish to npm (or a private registry)
npm publish --access public
```

For private registries (company-internal packages), configure `.npmrc` with the registry URL and authentication token. For scoped packages (`@org/ui`), ensure the scope is configured: `@org:registry=https://npm.company.com/`.

Automate publishing in CI: when the "Version Packages" PR (from Changesets, Lesson 23.6) is merged, a GitHub Action runs `svelte-package` and `npm publish` automatically.

### 1.7 "In Production" — publishing a design system at a tech company

A tech company published their design system as `@company/ui` on their private npm registry. The package was consumed by 8 product teams across 12 applications. They published weekly (minor versions with new components and bug fixes) and quarterly (major versions with breaking changes). Each major release included a migration guide and codemods. The package size was 45KB gzipped (all components + theme CSS). Bundle impact for a consumer using 5 of the 20 components was 12KB gzipped — tree-shaking removed 73% of the package. The design system team measured adoption: within 6 months, 95% of new features used design system components instead of custom implementations.

### 1.8 The TypeScript angle

Generated type declarations are critical for consumer experience:

```typescript
// Generated by svelte-package: dist/Button.svelte.d.ts
import type { Snippet } from 'svelte';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    onclick?: (event: MouseEvent) => void;
    children: Snippet;
}

declare const Button: import('svelte').Component<ButtonProps>;
export default Button;
```

Consumers get autocompletion, type checking, and inline documentation for every prop. Without type declarations, consumers lose the "pit of success" benefits from Lesson 23.3.

### 1.9 Common interview question

**Q: "Why does a Svelte component library ship .svelte source files instead of pre-compiled JavaScript?"**

**Model answer:** Svelte components are compiled differently depending on the consumer's context. A component compiled for SSR produces different output than one compiled for client-side rendering. The hydration mode, compiler version, and optimization settings all affect the output. By shipping source `.svelte` files, the consumer's own Vite + Svelte plugin compiles them with the correct settings for their application. This ensures compatibility and optimal output. Pre-compiled JavaScript would lock the library into one compilation mode and potentially conflict with the consumer's Svelte version.

## Deep Dive

**The `sideEffects` field.** Adding `"sideEffects": false` to `package.json` tells bundlers that importing a module without using its exports has no side effects and can be safely removed. This enables more aggressive tree-shaking. However, if your CSS imports are side-effectful (they add global styles when imported), you must list them: `"sideEffects": ["**/*.css"]`.

**Monorepo publishing with Changesets.** In a monorepo where the design system and the product application live in the same repository, Changesets can manage versions for multiple packages simultaneously. When the design system version bumps, the product application's lockfile updates automatically.

**npm provenance.** npm provenance (npm publish --provenance) links the published package to a specific CI build and Git commit. Consumers can verify that the package was built from the exact source code in the repository, not modified after the fact. This is a supply chain security measure.

**Conditional exports for SSR vs client.** The exports map supports conditions: `"svelte"` for Svelte-aware bundlers, `"import"` for standard ESM, and `"require"` for CommonJS (if needed). You can also add `"browser"` and `"node"` conditions for code that should differ between server and client.

**Package size monitoring.** Track the published package size over time. A size increase without new features indicates accidental inclusion of unnecessary code (a test file, a build artifact, documentation). Tools like `bundlephobia.com` and `pkg-size.dev` analyze package size and suggest optimizations.

**Connection to other lessons.** Lesson 23.3 defined the component APIs that the package exposes. Lesson 23.6 covered versioning and changelogs that accompany each publish. Lesson 23.2 covered the token pipeline that generates theme CSS included in the package.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/kit/packaging](https://svelte.dev/docs/kit/packaging) — SvelteKit library packaging documentation.
- [nodejs.org/api/packages.html#exports](https://nodejs.org/api/packages.html#exports) — Node.js exports field documentation.
- [docs.npmjs.com/cli/v10/commands/npm-publish](https://docs.npmjs.com/cli/v10/commands/npm-publish) — npm publish documentation.

**Advanced pattern: component-level CSS extraction.** Instead of shipping one global theme CSS file, export CSS per component. Consumers import only the CSS for the components they use: `import '@org/ui/Button.css'`. This further reduces the CSS footprint for consumers who use a subset of the library.

**Challenge question (combines Lesson 23.8 + Lesson 23.6 + Lesson 23.3):** A consumer reports that importing `Button` from your library increases their bundle by 200KB. You expect it to be 3KB. Diagnose: what are the likely causes? How would you verify tree-shaking is working? What package.json changes might fix the issue?

## 2. Style it — PE7 applied to the package.json configurator

The mini-build is an interactive form that generates a valid `package.json` for a Svelte component library. Form sections use `var(--color-surface-2)` cards with `var(--radius-lg)`. Input fields use `var(--color-surface)` with `var(--color-border)` borders. The generated JSON output uses monospace font at `var(--text-sm)` on `var(--color-surface-2)`. Field descriptions use `var(--text-xs)` in `var(--color-text-muted)`. The layout stacks on mobile and splits into form/output columns at `min-width: 768px`.

## 3. Interact — configuring package.json fields for a Svelte library

The problem: package.json for Svelte libraries has many fields with non-obvious requirements. The interactive element provides a form with each critical field (name, version, svelte, exports, peerDependencies, files) and generates a valid package.json in real time. Validation feedback shows warnings for common mistakes (missing svelte field, missing peer dependencies, barrel exports).

```typescript
interface PackageConfig {
    name: string;
    version: string;
    components: string[];
    includeThemesCss: boolean;
    svelteVersion: string;
    useBarrelExport: boolean;
}
```

## 4. Mini-build — package.json configurator

**File:** `src/routes/modules/23-design-system/08-publishing-consumption/+page.svelte`

This page renders an interactive package.json configurator for a Svelte component library. The student inputs their library name, selects which components to export, and sees a valid package.json generated with correct exports, svelte field, peer dependencies, and files array.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/23-design-system/08-publishing-consumption`.

### Prove the concept

1. Enter a package name and see the `name` field update in the generated JSON.
2. Add component names to the list and watch the `exports` field populate with per-component entries.
3. Toggle "Include themes CSS" and see the CSS export entry appear.
4. Toggle "Use barrel export" and see a warning about potential tree-shaking issues.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why must Svelte be a peer dependency, not a regular dependency?</summary>

If Svelte is a regular dependency of your library and the consumer also has Svelte in their dependencies, there will be two copies of Svelte in the application. Two Svelte runtimes cause reactivity failures, context sharing bugs, and unpredictable component behavior. A peer dependency tells pnpm that the consumer must provide Svelte, ensuring only one copy exists.
</details>

<details>
<summary><strong>Q2.</strong> What does the `exports` field in package.json control?</summary>

The `exports` field defines the public API surface of the package — what paths consumers can import. It maps import specifiers (like `'@org/ui/Button.svelte'`) to file paths (like `'./dist/Button.svelte'`). It also supports conditional exports for different environments (svelte, import, require). Paths not listed in `exports` cannot be imported by consumers, which prevents accidental use of internal modules.
</details>

<details>
<summary><strong>Q3.</strong> Why do Svelte libraries ship .svelte source files instead of compiled JavaScript?</summary>

Because the Svelte compiler produces different output depending on the context: SSR vs client rendering, hydration mode, compiler version, and optimization settings. Shipping source files lets the consumer's build pipeline compile them with the correct settings. Pre-compiled output would be locked to one mode and might conflict with the consumer's Svelte version.
</details>

<details>
<summary><strong>Q4.</strong> How do you verify that tree-shaking works for your library?</summary>

Build a minimal consumer application that imports one component from your library, run the production build, and inspect the output bundle size. If importing Button (3KB expected) produces a 200KB bundle, tree-shaking is broken — the bundle includes unused components. Common causes: barrel re-exports that bundlers cannot optimize, missing `"sideEffects": false` in package.json, or imports of side-effectful modules.
</details>

<details>
<summary><strong>Q5.</strong> What is the `files` field and why is it important for security?</summary>

The `files` field is an allowlist of directories and files included in the published npm package. `["dist"]` means only the dist directory is published. Without it, npm includes everything not in `.npmignore`, which might include `.env` files, test fixtures, or internal documentation. The `files` field is a security measure that prevents accidental exposure of sensitive content.
</details>

## 6. Common mistakes

- **Forgetting the `svelte` field in package.json.** Without it, the consumer's Vite/Svelte plugin does not know to compile your components. The import might work but the component will not have Svelte reactivity — it will be treated as a plain JavaScript module.
- **Including devDependencies in the published package.** Use `"files": ["dist"]` to ensure only the build output is published. Never include `src/`, `tests/`, or configuration files in the package.
- **Using barrel exports without testing tree-shaking.** A barrel file (`export { Button, Modal, Card }`) can prevent tree-shaking in some bundler configurations. Always verify that importing one component does not bundle all of them.
- **Publishing without running svelte-package first.** The `dist/` directory must be generated by `@sveltejs/package` before publishing. Publishing `src/lib` directly will not work because TypeScript files need compilation and declaration files need generation.

## 7. What's next

This completes Module 23 — Design System Engineering. The module project combines everything: a publishable component library with typed APIs, multiple themes, visual regression tests, automated changelogs, and npm-ready packaging. Continue to the module project or proceed to the Capstone.
