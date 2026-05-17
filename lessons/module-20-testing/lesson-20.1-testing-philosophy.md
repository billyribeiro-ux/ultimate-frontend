---
module: 20
lesson: 20.1
title: Testing philosophy
duration: 45 minutes
prerequisites:
  - "12.9 — Testing with Vitest"
  - "12.10 — E2E testing with Playwright"
  - "TypeScript fundamentals"
learning_objectives:
  - Explain the testing pyramid (unit, integration, E2E) and why the balance between levels matters
  - Distinguish between behavior testing and implementation testing and articulate why behavior testing produces more resilient tests
  - Identify the three types of coverage lies (covered-but-untested, tested-but-wrong, percentage-theater) and explain why 100% coverage does not mean zero bugs
  - Design a testing strategy for a SvelteKit application that assigns each risk to the correct test level
  - Write test descriptions that document behavior rather than implementation details
status: ready
---

# Lesson 20.1 — Testing philosophy

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Why tests exist and what makes a test good

### 1.1 The problem: shipping code without confidence

You push a feature to production. The next morning, a customer reports that the login form crashes on Safari. You investigate and discover that your change broke a function three files away that you did not know existed. You could have caught this in thirty seconds with an automated test, but you did not have one. Now you have a production incident, an angry customer, and a hotfix to ship.

This scenario repeats across teams of every size. The cost of not testing is not the time spent writing tests — it is the time spent debugging production, responding to incidents, and losing user trust. Automated tests are not a luxury. They are the minimum viable quality assurance for professional software.

### 1.2 The testing pyramid

The testing pyramid is a model that describes how many tests you should have at each level:

**Unit tests** (base, many): Test a single function, class, or module in isolation. They are fast (milliseconds), cheap to write, and pinpoint failures precisely. In a SvelteKit app, unit tests cover `.svelte.ts` reactive stores, utility functions, and data transformations.

**Integration tests** (middle, moderate): Test how multiple units work together. They are slower than unit tests but catch wiring bugs that unit tests miss. In SvelteKit, integration tests cover component rendering, form action handlers, and API route endpoints.

**End-to-end tests** (top, few): Test the entire application from the user's perspective. They launch a real browser, navigate pages, click buttons, and assert on what the user sees. They are slowest but catch issues that lower levels cannot: CSS rendering bugs, navigation failures, and cross-page state management. In SvelteKit, E2E tests use Playwright.

The pyramid shape means you should have many unit tests, a moderate number of integration tests, and few E2E tests. Inverting the pyramid (many E2E, few unit tests) produces a test suite that is slow, flaky, and expensive to maintain.

### 1.3 Behavior testing vs implementation testing

A **behavior test** asserts on what the code does from the outside: "When I call `addItem('Milk')`, the items list contains 'Milk'." A behavior test does not care how the function implements the addition — it could use an array push, a linked list, or a database call.

An **implementation test** asserts on how the code works internally: "When I call `addItem('Milk')`, the internal `_items` array has length 1." This test breaks when you refactor the internal data structure, even if the behavior is unchanged.

Implementation tests are fragile. Every refactor breaks them, even when the software still works correctly. This trains developers to avoid refactoring — exactly the opposite of what you want. Behavior tests survive refactors because the external behavior is the contract. If the behavior changes, the test should break. If the behavior is preserved, the test should pass.

In Svelte components, the behavior testing approach means: do not assert on internal `$state` values. Instead, assert on what the user sees in the rendered DOM. Use `@testing-library/svelte` to query by role, text, and label — the same things a user perceives — not by CSS class names or component internals.

### 1.4 The three coverage lies

Code coverage is the most misunderstood metric in software development.

**Lie 1: Covered but untested.** A line of code is "covered" if any test causes it to execute. But execution is not verification. If your test calls `calculateTotal()` but never asserts on the return value, the line is covered but not tested. A bug in the calculation would not break any test.

**Lie 2: Tested but wrong.** A test that asserts `expect(result).toBe(42)` covers the line and passes. But if the correct result is 43, the test is wrong. Coverage does not measure correctness.

**Lie 3: Percentage theater.** A team sets a coverage threshold of 80%. Developers write tests that execute code paths without meaningful assertions just to hit the number. The suite has 80% coverage and catches almost no bugs. The metric becomes a target that corrupts the measure.

Coverage is useful as a lower bound: if coverage is 20%, you know large parts of the codebase are untested. But high coverage does not imply high quality. A test suite with 60% coverage and meaningful assertions catches more bugs than one with 95% coverage and shallow assertions.

### 1.5 Designing a testing strategy for SvelteKit

Assign each risk to the correct test level:

| Risk | Test level | Example |
|---|---|---|
| Utility function returns wrong value | Unit | Vitest test for `formatCurrency()` |
| Component does not render props correctly | Integration | @testing-library/svelte render test |
| Form action does not validate input | Integration | Vitest test calling the action handler |
| Login flow breaks across pages | E2E | Playwright test: navigate, fill form, assert redirect |
| CSS breaks layout on mobile | Visual regression | Playwright screenshot comparison |

### Deep Dive — The economics of testing and when not to test

Testing has diminishing returns. The first 50 tests in a project deliver enormous value — they catch the most common bugs and give developers confidence to refactor. The next 500 tests deliver less value per test because they cover increasingly unlikely scenarios. At some point, the cost of writing and maintaining a test exceeds the cost of the bug it prevents.

Throwaway code (a one-time migration script, a prototype for a demo) does not need tests. Code that changes weekly (an experimental feature under active development) needs behavior tests at the integration level — unit tests would break with every iteration. Code that rarely changes but is critical (authentication, payment processing) needs thorough unit, integration, and E2E tests because the cost of a bug is catastrophic.

The "test what matters" principle: identify the code paths where bugs cause the most damage (data loss, security breach, revenue loss) and test those thoroughly. For everything else, write tests proportional to the risk.

Test maintenance is a real cost. Every test is code that must be updated when requirements change. A test suite with 2,000 tests that takes 20 minutes to run and breaks 50 tests on every refactor is actively harmful — developers disable tests, skip them in CI, or stop refactoring to avoid the breakage. A suite with 500 well-designed behavior tests that runs in 2 minutes and breaks only when actual behavior changes is far more valuable.

The practical rule for this course: every `.svelte.ts` store gets unit tests, every user-facing component gets at least one integration test, every form action gets a success and failure test, and every critical user flow gets one E2E test. This baseline is achievable, maintainable, and catches the bugs that actually reach production.

## 2. Style it — PE7 applied to the testing strategy visualizer mini-build

The mini-build is a testing pyramid visualizer. The pyramid uses three colored tiers: `var(--color-success)` for unit (wide base), `var(--color-warning)` for integration (middle), and `var(--color-error)` for E2E (narrow top). Each tier displays the count and execution time. The pyramid container uses `var(--color-surface-2)` with `var(--radius-lg)`.

Test case cards use `var(--text-sm)` for the description and `var(--text-xs)` for metadata (level, duration). The layout stacks vertically on mobile with the pyramid at the top and the test list below.

## 3. Interact — building an interactive testing strategy planner

The problem: deciding which test level to use for each piece of functionality requires understanding the tradeoffs.

```typescript
interface TestCase {
  id: string;
  description: string;
  level: 'unit' | 'integration' | 'e2e';
  risk: 'low' | 'medium' | 'high';
  estimatedMs: number;
}

let testCases: TestCase[] = $state([]);
let newDescription: string = $state('');
let newLevel: TestCase['level'] = $state('unit');
let newRisk: TestCase['risk'] = $state('medium');
```

The student adds test cases, assigns levels and risk ratings, and sees the pyramid adjust its proportions. A warning appears if the pyramid is inverted (more E2E than unit tests).

## 4. Mini-build — Testing strategy planner

**File path:** `src/routes/modules/20-testing/01-testing-philosophy/+page.svelte`

An interactive planner where students add test cases with descriptions, assign test levels, and see a visual pyramid update. The pyramid shows the count and total estimated run time for each level. Warnings appear for anti-patterns: inverted pyramid, no unit tests, or all tests at one level.

**DevTools moment:** This is a concept page — the DevTools moment is about the testing tools themselves. Open the terminal, run `pnpm vitest --reporter=verbose`, and observe the test output format. Note how each test shows its file, description, and duration. This is the feedback loop you will build throughout this module.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why should the testing pyramid have more unit tests than E2E tests?</summary>

Unit tests are fast (milliseconds), cheap to write, and pinpoint failures precisely. E2E tests are slow (seconds to minutes), expensive to maintain, and when they fail, the failure could be anywhere in the stack. Having many fast unit tests provides a rapid feedback loop, while a few E2E tests verify that the entire system works together. Inverting the pyramid produces a slow, flaky, expensive test suite.
</details>

<details>
<summary><strong>Q2.</strong> Give an example of a behavior test and an implementation test for the same function. Which is more resilient to refactoring?</summary>

Function: `addItem(list, item)`. Behavior test: "After calling `addItem(list, 'Milk')`, `list.includes('Milk')` is true." Implementation test: "After calling `addItem(list, 'Milk')`, `list._internal.length` is 1." The behavior test is more resilient because it survives a refactor that changes the internal data structure. The implementation test breaks even when the function still works correctly.
</details>

<details>
<summary><strong>Q3.</strong> Explain the "covered but untested" coverage lie with a concrete example.</summary>

A test calls `calculateTax(100, 0.08)` but never asserts on the return value — it just checks that no error is thrown. The `calculateTax` function achieves 100% line coverage, but if it returns 0 instead of 8, no test fails. The code is covered (executed during tests) but not tested (no assertion verifies correctness).
</details>

<details>
<summary><strong>Q4.</strong> When is it appropriate to NOT write tests for a piece of code?</summary>

When the cost of writing and maintaining the test exceeds the cost of the bug it prevents. Examples: a one-time migration script that will be deleted after use, a throwaway prototype for a stakeholder demo, or generated code that is fully determined by its inputs (like Paraglide's message functions). The key is a conscious risk assessment, not laziness.
</details>

<details>
<summary><strong>Q5.</strong> Why should component tests query by role and text rather than CSS class names?</summary>

Querying by role and text tests the component the same way a user interacts with it — users see text and interact with buttons, not CSS classes. Class names are implementation details that change during refactoring and redesigns. A test that queries `getByRole('button', { name: 'Submit' })` survives a CSS refactor. A test that queries `container.querySelector('.btn-primary')` breaks when the class name changes, even though the button still works.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Testing implementation details.** Asserting on internal state, private methods, or CSS class names produces brittle tests that break on every refactor. Test external behavior: what the function returns, what the component renders, what the user sees.

2. **Chasing 100% coverage.** Writing shallow tests (no meaningful assertions) just to increase the coverage number wastes time and provides false confidence. Focus on meaningful assertions for high-risk code paths.

3. **Writing only E2E tests.** E2E tests are slow and their failures are hard to diagnose. Without unit and integration tests, debugging a failing E2E test requires tracing through the entire stack. Use E2E for critical user flows only.

4. **Not running tests in CI.** Tests that only run on developer machines are not reliable — different environments, different data, different results. CI ensures every commit is tested in a consistent environment.

## 7. What's next — one sentence

Next, you will configure Vitest for a SvelteKit project with proper TypeScript, Svelte component resolution, and coverage reporting.
