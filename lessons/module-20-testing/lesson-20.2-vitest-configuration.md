---
module: 20
lesson: 20.2
title: Vitest configuration for SvelteKit
duration: 50 minutes
prerequisites:
  - "20.1 — Testing philosophy"
  - "1.2 — Project setup with pnpm"
  - "Vite configuration basics"
learning_objectives:
  - Install and configure Vitest with @sveltejs/vite-plugin-svelte for SvelteKit projects
  - Set up test globals, path aliases ($lib), and TypeScript strict mode in vitest.config.ts
  - Configure coverage reporting with v8 provider and meaningful thresholds
  - Organize test files with co-located and centralized strategies and explain the tradeoffs
  - Write and run the first passing test to verify the configuration works end to end
status: ready
---

# Lesson 20.2 — Vitest configuration for SvelteKit

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Setting up the test runner that understands Svelte

### 1.1 The problem: testing tools that do not understand .svelte files

You install a generic test runner and write your first test. It imports a `.svelte.ts` store — it works because that is plain TypeScript. Then you import a `.svelte` component — the runner crashes with "Unexpected token" because it does not understand Svelte's single-file component syntax. Even if it could parse the template, it would not know about `$state`, `$derived`, or `$props()` because those are compiler features, not runtime JavaScript.

The test runner must integrate with the Svelte compiler to transform `.svelte` files into JavaScript before executing them. It must also understand SvelteKit's path aliases (`$lib`, `$app/state`, `$app/navigation`) so that imports resolve correctly.

### 1.2 How Vitest solves it

Vitest is a Vite-native test runner. Because SvelteKit uses Vite as its build tool, Vitest inherits the same plugin pipeline, path aliases, and transformation chain. Adding `@sveltejs/vite-plugin-svelte` to Vitest's config lets it compile `.svelte` files identically to how Vite compiles them for the browser.

The key insight: **your test environment uses the exact same compilation pipeline as your dev server**. There is no configuration drift between "how tests see my code" and "how the browser sees my code."

### 1.3 Installation

```bash
pnpm add -D vitest @testing-library/svelte @testing-library/jest-dom jsdom
```

Vitest is the test runner. `@testing-library/svelte` renders Svelte components in a simulated DOM. `@testing-library/jest-dom` adds assertions like `toBeVisible()` and `toHaveTextContent()`. `jsdom` provides the simulated browser environment.

### 1.4 Configuration file

Create `vitest.config.ts` at the project root. This file extends your existing Vite configuration so that all path aliases, plugins, and transformations carry over:

```typescript
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    alias: {
      '$lib': '/src/lib',
      '$app': '/node_modules/@sveltejs/kit/src/runtime/app'
    },
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts', 'src/lib/**/*.svelte.ts'],
      exclude: ['src/lib/paraglide/**'],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80
      }
    }
  }
});
```

### 1.5 The setup file

The setup file runs before every test file. It configures `@testing-library/jest-dom` matchers and any global mocks:

```typescript
// tests/setup.ts
import '@testing-library/jest-dom/vitest';
```

This single import adds all `jest-dom` matchers (`toBeVisible`, `toHaveAttribute`, `toBeDisabled`, etc.) to Vitest's `expect`.

### 1.6 Test file organization

Two strategies exist:

**Co-located tests:** Test files live next to the source files they test. `src/lib/stores/cart.svelte.ts` has `src/lib/stores/cart.test.ts` beside it. Advantage: easy to find tests, obvious when a file is untested (no adjacent test file). Disadvantage: test files clutter the source directory.

**Centralized tests:** All tests live in a top-level `tests/` directory. `tests/unit/cart.test.ts` tests `src/lib/stores/cart.svelte.ts`. Advantage: clean source directory, easy to configure CI to run a specific test directory. Disadvantage: test and source file locations diverge as the project grows.

This course uses centralized tests in `tests/` for organizational clarity, but the Vitest config includes both `tests/**/*.test.ts` and `src/**/*.test.ts` so co-located tests also work.

### Deep Dive — Mocking $app modules and SvelteKit runtime dependencies

SvelteKit's runtime modules (`$app/state`, `$app/navigation`, `$app/environment`) are not real npm packages — they are virtual modules resolved by SvelteKit's Vite plugin. In Vitest, these modules do not exist unless you mock them.

The `alias` property in the Vitest config handles `$lib` by pointing it to `src/lib`. But `$app` modules need explicit mocks because their implementations depend on SvelteKit's runtime, which does not run in Vitest.

Create mock files for commonly used `$app` modules:

```typescript
// tests/mocks/$app/navigation.ts
export function goto(url: string): Promise<void> {
  return Promise.resolve();
}

export function invalidate(url: string): Promise<void> {
  return Promise.resolve();
}

export function invalidateAll(): Promise<void> {
  return Promise.resolve();
}
```

```typescript
// tests/mocks/$app/state.ts
export const page = {
  url: new URL('http://localhost'),
  params: {},
  route: { id: '/' },
  status: 200,
  error: null,
  data: {},
  form: null
};
```

Register these mocks in `vitest.config.ts`:

```typescript
alias: {
  '$lib': '/src/lib',
  '$app/navigation': '/tests/mocks/$app/navigation.ts',
  '$app/state': '/tests/mocks/$app/state.ts',
  '$app/environment': '/tests/mocks/$app/environment.ts'
}
```

For tests that need to verify navigation behavior (e.g., testing that a component calls `goto('/dashboard')` on success), use `vi.mock` to replace the mock with a spy:

```typescript
import { vi } from 'vitest';
import { goto } from '$app/navigation';

vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

// In the test:
expect(goto).toHaveBeenCalledWith('/dashboard');
```

This pattern lets you test SvelteKit-specific behavior (navigation, page state, environment checks) without running the full SvelteKit server.

## 2. Style it — PE7 applied to the config explorer mini-build

The mini-build displays the Vitest configuration file with syntax highlighting. Configuration sections use `var(--color-surface-2)` cards. Active/selected options highlight with `var(--color-brand)` left border. Code blocks use monospace font at `var(--text-sm)` on `var(--color-surface)` background. The layout is a single scrollable column with `var(--space-md)` gaps between config sections.

## 3. Interact — building an interactive Vitest config builder

The student toggles configuration options (environment, globals, coverage provider) and sees the generated `vitest.config.ts` update in real time.

```typescript
interface VitestOptions {
  environment: 'jsdom' | 'happy-dom' | 'node';
  globals: boolean;
  coverageProvider: 'v8' | 'istanbul';
  coverageThreshold: number;
  includeColocated: boolean;
}

let options: VitestOptions = $state({
  environment: 'jsdom',
  globals: true,
  coverageProvider: 'v8',
  coverageThreshold: 80,
  includeColocated: true
});

let generatedConfig: string = $derived(generateConfig(options));
```

## 4. Mini-build — Vitest configuration builder

**File path:** `src/routes/modules/20-testing/02-vitest-configuration/+page.svelte`

An interactive config builder. The student selects options (environment, globals, coverage settings) via form controls, and the right panel shows the generated `vitest.config.ts` file. A "Copy" button copies the config to clipboard. A checklist at the bottom shows which setup steps are complete.

**DevTools moment:** Open a terminal and run `pnpm vitest --reporter=verbose` to see the test output. Then run `pnpm vitest --coverage` to see the coverage report. Open the generated `coverage/index.html` in a browser to explore the line-by-line coverage visualization.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why does Vitest need @sveltejs/vite-plugin-svelte in its config?</summary>

Without the Svelte plugin, Vitest cannot compile `.svelte` files — it treats them as unknown file types and crashes with parsing errors. The plugin transforms Svelte components into JavaScript using the same compiler pipeline as the dev server, ensuring tests see the same code the browser sees.
</details>

<details>
<summary><strong>Q2.</strong> What does the setupFiles option do, and why is @testing-library/jest-dom registered there?</summary>

The `setupFiles` option specifies files that run before every test file. Registering `@testing-library/jest-dom/vitest` there adds custom matchers (like `toBeVisible`, `toHaveTextContent`) to Vitest's `expect` globally, so every test file can use them without individual imports.
</details>

<details>
<summary><strong>Q3.</strong> Why can't Vitest resolve $app/navigation without explicit configuration?</summary>

`$app/navigation` is a virtual module provided by SvelteKit's Vite plugin at runtime. Vitest runs outside of SvelteKit's server, so the virtual module does not exist. You must either alias it to a mock file or use `vi.mock` to provide a test implementation.
</details>

<details>
<summary><strong>Q4.</strong> What is the difference between the v8 and istanbul coverage providers?</summary>

v8 uses V8's built-in code coverage instrumentation, which is faster and requires no code transformation. Istanbul instruments the source code by adding counter statements, which is slower but provides more detailed branch coverage. For most SvelteKit projects, v8 is the better default because of its speed.
</details>

<details>
<summary><strong>Q5.</strong> What are the tradeoffs between co-located and centralized test file organization?</summary>

Co-located tests (beside source files) make it easy to find tests and obvious when a file is untested, but they clutter the source directory. Centralized tests (in a `tests/` directory) keep the source clean and make CI configuration easier, but the physical separation between test and source can cause tests to be forgotten or missed during refactoring.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Forgetting `hot: false` in the Svelte plugin.** Hot module replacement (HMR) is designed for the dev server, not the test runner. Leaving it enabled can cause test instability and memory leaks during watch mode.

2. **Using `environment: 'node'` for component tests.** Node does not have a DOM, so `@testing-library/svelte` cannot render components. Use `jsdom` or `happy-dom` for any test that renders Svelte components.

3. **Not aliasing $lib.** Without the `$lib` alias, any import like `import { Button } from '$lib/components/Button.svelte'` fails with "Cannot find module." The alias must match your SvelteKit config.

4. **Setting coverage thresholds too high initially.** Starting with a 95% threshold on a codebase with zero tests forces developers to write hundreds of tests before CI passes. Start at 50-60% and increase gradually as the test culture matures.

## 7. What's next — one sentence

Next, you will write your first real unit tests for `.svelte.ts` reactive stores — testing state mutations, derived values, and effect cleanup.
