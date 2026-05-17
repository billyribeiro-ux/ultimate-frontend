# Module 20 Project — Full-Stack Test Suite

## Overview

Build a comprehensive test suite for an existing SvelteKit application (the Module 10 CRUD Note-Taking App or the Module 11 Admin Dashboard). The suite covers unit tests for reactive stores, component tests for interactive UI, integration tests for form actions, and E2E tests for complete user flows. A GitHub Actions CI pipeline runs all tests on every push.

## Requirements

### Functional

1. **Unit tests:** At least 5 unit tests for `.svelte.ts` reactive stores covering state mutations, derived values, and edge cases.
2. **Component tests:** At least 5 component tests using @testing-library/svelte that verify rendering, user interaction, and accessibility.
3. **Form action tests:** At least 3 tests for `+page.server.ts` form actions covering success, validation failure, and server error paths.
4. **API route tests:** At least 2 tests for `+server.ts` endpoints verifying correct status codes, headers, and response bodies.
5. **E2E tests:** At least 3 Playwright tests covering auth flow, CRUD operations, and navigation between pages.
6. **Visual regression:** At least 2 screenshot tests capturing a page in light and dark mode.
7. **CI pipeline:** A GitHub Actions workflow that installs dependencies, runs all test suites, and reports results.

### Technical

- Vitest with `@sveltejs/vite-plugin-svelte` for unit and component tests.
- @testing-library/svelte for component rendering and querying.
- Playwright for E2E and visual regression tests.
- TypeScript strict mode. No `any` in test files.
- Test IDs follow the `data-testid` convention for E2E selectors.
- Page objects pattern for Playwright tests.
- Coverage threshold: 80% line coverage for tested modules.

### Test organization

| Directory                    | Type       | Runner     |
| ---------------------------- | ---------- | ---------- |
| `tests/unit/`                | Unit       | Vitest     |
| `tests/component/`          | Component  | Vitest     |
| `tests/integration/`        | Form/API   | Vitest     |
| `tests/e2e/`                | E2E        | Playwright |
| `tests/visual/`             | Visual     | Playwright |

### Stretch goals

- Add mutation testing with Stryker to verify test quality.
- Implement test parallelization in CI for faster feedback.
- Add accessibility testing with axe-playwright in E2E tests.
- Generate and publish a coverage report as a GitHub Pages artifact.

## Evaluation criteria

| Criterion                    | Weight |
| ---------------------------- | ------ |
| Unit test coverage & quality | 20%    |
| Component test patterns      | 20%    |
| E2E flow completeness        | 20%    |
| Form/API test correctness    | 15%    |
| CI pipeline reliability      | 15%    |
| TypeScript strictness        | 10%    |

## Submission

Push to a branch named `module-20-project`. The GitHub Actions workflow must pass with all tests green. Coverage reports must be generated as CI artifacts.
