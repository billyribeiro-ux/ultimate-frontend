---
module: 20
exercise: 5
title: CI Pipeline Config
difficulty: principal
estimated_time: 60
skills_tested:
  - GitHub Actions workflow
  - test matrix configuration
  - build and test stages
  - artifact management
  - deployment gates
---

# Exercise 20.5 — CI Pipeline Config

## Brief

Design and document a complete CI/CD pipeline using GitHub Actions that runs linting, type checking, unit tests, component tests, and E2E tests on every pull request. The pipeline uses a test matrix to verify against multiple Node.js versions and caches dependencies for speed. This exercise teaches how to configure automated quality gates for a SvelteKit project.

## Requirements

1. Create `src/routes/exercises/20-testing/05/+page.svelte` documenting the pipeline
2. Design a `.github/workflows/ci.yml` configuration (show the full YAML on the page)
3. The pipeline must have stages: Install, Lint, Type Check, Unit Tests, E2E Tests, Build
4. Use a matrix strategy: Node.js 20 and 22
5. Cache `pnpm` dependencies using `actions/cache`
6. Run unit tests with `pnpm vitest run` and report coverage
7. Run E2E tests with `pnpm playwright test` using the Playwright GitHub Action
8. Upload test results and coverage as artifacts
9. The Build stage only runs if all tests pass
10. Add a concurrency group to cancel in-progress runs when new commits are pushed
11. Document each stage's purpose and failure behavior
12. Show a visual pipeline diagram
13. Style with PE7 tokens

## Constraints

- The pipeline must complete in under 10 minutes for a typical PR
- No secrets or credentials in the documented config
- TypeScript strict mode for the documentation page
- The pipeline must work with pnpm (not npm)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

GitHub Actions workflows are YAML files in `.github/workflows/`. The `on` field defines triggers (push, pull_request). Jobs run in parallel by default — use `needs` to define dependencies. Each job runs on a fresh virtual machine.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The `matrix` strategy runs the same job with different configurations: `strategy: { matrix: { node-version: [20, 22] } }`. Use `pnpm/action-setup` for pnpm installation and `actions/setup-node` with `cache: 'pnpm'` for Node.js + caching. The `concurrency` field with `cancel-in-progress: true` prevents wasted CI minutes.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```yaml
name: CI
on:
  pull_request:
    branches: [main]
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm check
      - run: pnpm vitest run --coverage
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/20-testing/05/+page.svelte`**

```svelte
<script lang="ts">
  interface PipelineStage {
    name: string;
    command: string;
    purpose: string;
    onFailure: string;
    time: string;
  }

  const stages: PipelineStage[] = [
    { name: 'Install', command: 'pnpm install --frozen-lockfile', purpose: 'Install exact locked dependencies', onFailure: 'Lockfile out of sync — run pnpm install locally', time: '~30s (cached)' },
    { name: 'Lint', command: 'pnpm lint', purpose: 'Check code style and catch common errors', onFailure: 'Run pnpm lint --fix locally', time: '~10s' },
    { name: 'Type Check', command: 'pnpm check', purpose: 'Verify TypeScript types across the project', onFailure: 'Fix type errors shown in output', time: '~20s' },
    { name: 'Unit Tests', command: 'pnpm vitest run --coverage', purpose: 'Run Vitest tests with coverage report', onFailure: 'Failing test — check assertion errors', time: '~30s' },
    { name: 'E2E Tests', command: 'pnpm playwright test', purpose: 'Run browser-based end-to-end tests', onFailure: 'Check Playwright trace viewer artifact', time: '~2min' },
    { name: 'Build', command: 'pnpm build', purpose: 'Verify the production build succeeds', onFailure: 'Build error — check for SSR/import issues', time: '~45s' }
  ];

  const workflowYaml = `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm check

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint-and-check
    strategy:
      matrix:
        node-version: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm vitest run --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-node-\${{ matrix.node-version }}
          path: coverage/

  e2e-tests:
    runs-on: ubuntu-latest
    needs: lint-and-check
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm build
      - run: pnpm playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  build:
    runs-on: ubuntu-latest
    needs: [unit-tests, e2e-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: build/`;
</script>

<main class="page">
  <h1>CI Pipeline Configuration</h1>
  <p class="intro">A complete GitHub Actions pipeline for SvelteKit with linting, testing, and build verification.</p>

  <section class="diagram">
    <h2>Pipeline Flow</h2>
    <div class="flow">
      <div class="flow-stage">Lint + Check</div>
      <div class="flow-split">
        <div class="flow-branch">
          <div class="flow-arrow">&#8595;</div>
          <div class="flow-stage matrix">Unit Tests (Node 20)</div>
        </div>
        <div class="flow-branch">
          <div class="flow-arrow">&#8595;</div>
          <div class="flow-stage matrix">Unit Tests (Node 22)</div>
        </div>
        <div class="flow-branch">
          <div class="flow-arrow">&#8595;</div>
          <div class="flow-stage">E2E Tests</div>
        </div>
      </div>
      <div class="flow-arrow">&#8595;</div>
      <div class="flow-stage final">Build</div>
    </div>
  </section>

  <section class="stages-section">
    <h2>Pipeline Stages</h2>
    {#each stages as stage, i}
      <div class="stage-card">
        <span class="stage-num">{i + 1}</span>
        <div class="stage-info">
          <h3>{stage.name} <span class="time">{stage.time}</span></h3>
          <code>{stage.command}</code>
          <p class="purpose">{stage.purpose}</p>
          <p class="failure">On failure: {stage.onFailure}</p>
        </div>
      </div>
    {/each}
  </section>

  <section class="yaml-section">
    <h2>Full Workflow YAML</h2>
    <pre class="yaml"><code>{workflowYaml}</code></pre>
  </section>
</main>

<style>
  .page { max-inline-size: var(--content-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }
  section { margin-block-end: var(--space-2xl); }

  .flow { display: grid; place-items: center; gap: var(--space-sm); padding: var(--space-lg); background: var(--color-surface-2); border-radius: var(--radius-lg); }
  .flow-stage { padding: var(--space-sm) var(--space-lg); border-radius: var(--radius-md); background: var(--color-surface); border: 2px solid var(--color-border); font-weight: 600; font-size: var(--text-sm); }
  .flow-stage.matrix { border-color: var(--color-warning); }
  .flow-stage.final { border-color: var(--color-success); background: var(--color-success); color: var(--color-surface); }
  .flow-split { display: flex; gap: var(--space-lg); }
  .flow-branch { display: grid; place-items: center; gap: var(--space-sm); }
  .flow-arrow { font-size: var(--text-lg); color: var(--color-text-muted); }

  .stage-card { display: flex; gap: var(--space-md); padding: var(--space-md); background: var(--color-surface-2); border-radius: var(--radius-md); margin-block-end: var(--space-sm); }
  .stage-num { inline-size: 2rem; block-size: 2rem; border-radius: var(--radius-full); background: var(--color-brand); color: var(--color-surface); display: grid; place-items: center; font-weight: 700; font-size: var(--text-sm); flex-shrink: 0; }
  .stage-info h3 { font-size: var(--text-sm); margin-block-end: var(--space-xs); }
  .time { font-size: var(--text-xs); color: var(--color-text-muted); font-weight: 400; }
  .stage-info code { font-size: var(--text-xs); color: var(--color-brand); display: block; margin-block-end: var(--space-xs); }
  .purpose { font-size: var(--text-sm); color: var(--color-text-muted); margin-block-end: var(--space-xs); }
  .failure { font-size: var(--text-xs); color: var(--color-warning); }

  .yaml { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); overflow-x: auto; font-size: var(--text-xs); line-height: 1.6; }
</style>
```

### Explanation

This CI pipeline implements the testing pyramid in GitHub Actions: fast checks first (lint, type check), then unit tests (with matrix), then E2E tests (slowest), and finally a build verification. The `concurrency` group with `cancel-in-progress: true` saves CI minutes by cancelling ongoing runs when new commits are pushed to the same PR. The matrix strategy runs unit tests against Node 20 and 22 to catch version-specific issues. The `needs` field creates a dependency graph: unit tests and E2E tests run in parallel after lint passes, and the build only runs if both test jobs succeed. Artifacts (coverage reports, Playwright traces) are uploaded for debugging — the Playwright report is only uploaded on failure (no point storing traces for passing tests). The `--frozen-lockfile` flag ensures CI uses exactly the same dependency versions as development — if the lockfile is out of date, the install fails instead of silently updating. This pipeline catches issues at every level: style issues (lint), type errors (check), logic bugs (unit tests), integration bugs (E2E), and build failures (build).
</details>
