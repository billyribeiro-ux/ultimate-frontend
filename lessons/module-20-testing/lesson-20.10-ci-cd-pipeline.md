---
module: 20
lesson: 20.10
title: CI/CD testing pipeline
duration: 55 minutes
prerequisites:
  - "20.2 — Vitest configuration"
  - "20.7 — Playwright fundamentals"
  - "Familiarity with GitHub and YAML syntax"
learning_objectives:
  - Write a GitHub Actions workflow that installs dependencies, runs Vitest, and runs Playwright on every push
  - Configure parallel jobs for unit/integration tests and E2E tests to minimize pipeline duration
  - Upload test artifacts (coverage reports, Playwright traces, screenshots) for debugging failed runs
  - Set up branch protection rules that require all tests to pass before merging
  - Implement caching strategies for pnpm dependencies and Playwright browsers to speed up CI
status: ready
---

# Lesson 20.10 — CI/CD testing pipeline

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Making tests run automatically on every commit

### 1.1 The problem: tests that nobody runs are tests that do not exist

You have a comprehensive test suite: unit tests for stores, component tests for UI, E2E tests for user flows. But the team relies on developers to run tests before pushing. Some forget. Some skip them "just this once." Some run them locally but miss a test that only fails in CI because of environment differences. Within weeks, the test suite degrades from a safety net into background noise.

Continuous Integration (CI) solves this by running every test, on every commit, in a consistent environment, automatically. If any test fails, the commit is flagged. If branch protection is enabled, the code cannot be merged until all tests pass.

### 1.2 GitHub Actions fundamentals

A GitHub Actions workflow is a YAML file in `.github/workflows/` that defines jobs, steps, and triggers:

```yaml
name: Test Suite
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

**Triggers** define when the workflow runs. `push` runs on direct commits. `pull_request` runs when a PR is opened or updated. Running on both ensures main is always tested.

**Jobs** run in parallel by default. Each job gets its own virtual machine. Common patterns: one job for unit/integration tests, another for E2E tests.

**Steps** run sequentially within a job. Each step is either a `run` command (shell script) or a `uses` action (reusable package).

### 1.3 The complete CI workflow

```yaml
name: Test Suite
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-and-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm vitest run --coverage
        env:
          NODE_ENV: test

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm exec playwright install --with-deps chromium

      - run: pnpm exec playwright test
        env:
          NODE_ENV: test

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-traces
          path: test-results/

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### 1.4 Caching for speed

Without caching, every CI run downloads all npm packages and Playwright browsers from scratch. The `actions/setup-node` action's `cache: pnpm` option caches the pnpm store. For Playwright browsers, cache the installation directory:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}

- run: pnpm exec playwright install --with-deps chromium
```

If the cache hits, the `playwright install` step completes in seconds instead of minutes.

### 1.5 Branch protection

In GitHub repository settings, enable branch protection for `main`:
1. Require status checks to pass before merging
2. Select both the `unit-and-integration` and `e2e` jobs as required checks
3. Require branches to be up to date before merging

Now no code reaches `main` without passing all tests.

### 1.6 Continuous Deployment (CD)

After tests pass, deploy automatically. For SvelteKit on Vercel:

```yaml
deploy:
  needs: [unit-and-integration, e2e]
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/checkout@v4
    - uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

The `needs: [unit-and-integration, e2e]` ensures deployment only happens after both test jobs pass.

### Deep Dive — Advanced CI patterns: matrix builds, test sharding, and Lighthouse CI

**Matrix builds** run the same tests across multiple environments simultaneously:

```yaml
strategy:
  matrix:
    node-version: [20, 22]
    os: [ubuntu-latest, macos-latest]
```

This runs four parallel jobs: Node 20 on Ubuntu, Node 20 on macOS, Node 22 on Ubuntu, Node 22 on macOS. Useful for libraries that must support multiple Node versions, but overkill for most applications.

**Test sharding** splits E2E tests across parallel workers:

```yaml
strategy:
  matrix:
    shard: [1/3, 2/3, 3/3]
steps:
  - run: pnpm exec playwright test --shard=${{ matrix.shard }}
```

This runs three workers, each executing one-third of the test files. A suite that takes 9 minutes runs in 3 minutes. Sharding is essential when E2E suites grow beyond 5 minutes.

**Lighthouse CI** runs Lighthouse audits in CI and fails the build if performance regresses:

```yaml
- run: pnpm build
- uses: treosh/lighthouse-ci-action@v12
  with:
    configPath: lighthouserc.json
    uploadArtifacts: true
```

The `lighthouserc.json` sets performance budgets:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 1.0 }]
      }
    }
  }
}
```

This fails the build if the Performance score drops below 90 or the Accessibility score drops below 100. Combined with test sharding and caching, the full pipeline — unit tests, E2E tests, visual regression, and Lighthouse — runs in under 5 minutes.

## 2. Style it — PE7 applied to the CI pipeline visualizer mini-build

The mini-build shows a pipeline diagram. Each job is a card using `var(--color-surface-2)`. Running jobs pulse with `var(--color-brand)`. Passed jobs show `var(--color-success)` check marks. Failed jobs show `var(--color-error)` crosses. Dependency arrows between jobs use `var(--color-border)`. The timeline uses `var(--text-xs)` with `font-variant-numeric: tabular-nums` for durations.

## 3. Interact — simulating a CI pipeline run

The student clicks "Push to main" and watches the pipeline jobs execute sequentially. Each step shows a progress indicator. Some steps can be configured to fail to see how the pipeline handles failures.

## 4. Mini-build — CI pipeline simulator

**File path:** `src/routes/modules/20-testing/10-ci-cd-pipeline/+page.svelte`

A visual pipeline simulator with three jobs (install, test, deploy). The student clicks "Run Pipeline" and watches each job's steps execute with animated progress. Jobs run in parallel where configured. A "Fail step" toggle lets the student simulate failures to see how the pipeline stops. The generated YAML is displayed at the bottom.

**DevTools moment:** Open your repository's GitHub Actions tab. Click on a workflow run. Observe the job graph, step logs, and artifacts. Download a Playwright trace artifact and open it with `npx playwright show-trace trace.zip` to see the full debugging experience.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why should unit tests and E2E tests run in separate CI jobs?</summary>

They have different requirements (unit tests need Node only, E2E tests need a browser and a running server) and different speeds (unit tests are fast, E2E tests are slow). Running them in separate jobs allows parallel execution. If unit tests fail, you get fast feedback without waiting for the slower E2E suite. If E2E tests need special setup (browser installation, server startup), it does not delay unit test results.
</details>

<details>
<summary><strong>Q2.</strong> What does --frozen-lockfile do in pnpm install, and why is it important for CI?</summary>

`--frozen-lockfile` ensures pnpm installs exactly the versions specified in `pnpm-lock.yaml` without updating the lockfile. In CI, this guarantees reproducible builds — the same lockfile always installs the same packages. Without it, pnpm might resolve different versions, causing tests to pass or fail depending on when they run.
</details>

<details>
<summary><strong>Q3.</strong> Why should Playwright traces be uploaded only on failure, while coverage reports are uploaded always?</summary>

Playwright traces are large (5-50 MB per test) and only useful for debugging failures — uploading them on every passing run wastes storage. Coverage reports are small and always useful — they track coverage trends over time, even when all tests pass. The `if: failure()` condition uploads traces selectively, while `if: always()` ensures coverage is always available.
</details>

<details>
<summary><strong>Q4.</strong> How does pnpm dependency caching speed up CI, and what key should the cache use?</summary>

Caching stores the pnpm store directory between CI runs. If the `pnpm-lock.yaml` has not changed, the cache restores all packages instantly instead of downloading them from the registry. The cache key should include the lockfile hash so it invalidates when dependencies change: `key: pnpm-${{ hashFiles('pnpm-lock.yaml') }}`.
</details>

<details>
<summary><strong>Q5.</strong> What does the needs keyword do in a GitHub Actions job, and how does it enable deployment gates?</summary>

`needs: [unit-and-integration, e2e]` makes the deploy job wait for both test jobs to complete successfully. If either test job fails, the deploy job is skipped. This creates a deployment gate: code only deploys to production after all tests pass. Combined with branch protection, this ensures main always has passing tests and production always runs tested code.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Not using --frozen-lockfile in CI.** Without it, CI might install different package versions than developers use locally, causing tests to pass locally but fail in CI (or vice versa).

2. **Installing all Playwright browsers.** `playwright install` downloads Chromium, Firefox, and WebKit (500+ MB). If your tests only run on Chromium, install only Chromium: `playwright install --with-deps chromium`. This saves 2-3 minutes per CI run.

3. **Not uploading artifacts on failure.** Without traces and screenshots, debugging a CI-only failure requires reproducing it locally — which may be impossible due to environment differences. Always upload debugging artifacts when tests fail.

4. **Running E2E tests on every push to every branch.** E2E tests are slow and expensive. Run them on `push` to `main` and on `pull_request`, but not on every push to every feature branch. Developers can run them locally before creating a PR.

## 7. What's next — one sentence

With Module 20 complete, you have a comprehensive testing strategy from unit tests through CI/CD — you are now ready to apply everything you have learned in the capstone project.
