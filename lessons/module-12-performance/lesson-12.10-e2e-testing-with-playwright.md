---
module: 12
lesson: 12.10
title: E2E testing with Playwright
duration: 55 minutes
prerequisites:
  - Lesson 12.9 — Vitest unit testing
  - Module 10 — form actions
learning_objectives:
  - Explain the difference between unit, integration, and E2E tests
  - Write a Playwright test that visits a page and asserts on visible text
  - Fill and submit a form in Playwright
  - Test an authenticated flow using a fixture
  - Choose E2E scope wisely — test user journeys, not every component state
status: ready
---

# Lesson 12.10 — E2E testing with Playwright

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. Unit tests prove pieces work. E2E tests prove the assembled app works. You need both, and you need many more of the first than of the second.

## 1. Concept — Real browser, real app, real network

### 1.1 What "end to end" means

An **E2E test** drives a real browser (Chromium, Firefox, or WebKit) against a real running instance of your application. The browser navigates to a URL, the server returns HTML, the client hydrates, and the test performs actions as a real user would — clicking buttons, filling fields, waiting for navigation. The test then asserts on what is visible in the rendered page.

Playwright, from Microsoft, is the standard E2E tool for the Svelte ecosystem. It has excellent TypeScript support, a powerful `expect` extension that waits for conditions, and first-class support for SvelteKit via the `@playwright/test` package.

### 1.2 Why you need both Vitest and Playwright

Unit tests and E2E tests answer different questions:

| Question | Answer type |
| --- | --- |
| "Does this function produce the right output?" | Unit test |
| "Does this component render correctly?" | Component test (jsdom-based, Vitest) |
| "Does the login flow work end-to-end?" | E2E test (Playwright) |
| "Does the admin dashboard load the right data?" | E2E test |
| "Does this list sort correctly?" | Unit test, using the pure sort function |

The rule of thumb from the "test pyramid": for every E2E test, you should have five to ten component tests and twenty to fifty unit tests. E2E tests are slow (seconds each), flaky-prone (they depend on a real browser and real timing), and expensive to maintain. Unit tests are fast (milliseconds), deterministic, and cheap. Write the full test suite bottom-up.

### 1.3 Your first Playwright test

```ts
// tests/home.spec.ts
import { test, expect } from '@playwright/test';

test('home page shows the course title', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: /ultimate frontend/i })).toBeVisible();
});
```

Read it top to bottom:

- **`test('...')`** registers a named test.
- **`page`** is the Playwright browser page, destructured from the fixture.
- **`page.goto('/')`** navigates to the home page.
- **`page.getByRole('heading', { name: /.../i })`** finds a heading by its accessible name (just like `@testing-library/svelte`). Role-based queries are the Playwright best practice.
- **`await expect(...).toBeVisible()`** waits for the condition to become true and asserts it. Playwright's `expect` is auto-waiting — it retries the condition until it passes or the timeout (default 5 s) expires.

### 1.4 Filling and submitting a form

```ts
test('user can submit the contact form', async ({ page }) => {
	await page.goto('/contact');
	await page.getByLabel('Name').fill('Ada Lovelace');
	await page.getByLabel('Email').fill('ada@example.com');
	await page.getByLabel('Message').fill('I have questions.');
	await page.getByRole('button', { name: /send/i }).click();

	await expect(page.getByRole('status')).toContainText(/thank you/i);
});
```

`getByLabel` targets inputs by their visible `<label>` text, which is accessibility-correct and refactor-safe. `fill()` replaces the entire value in one step. The submit click triggers SvelteKit's form action; the assertion then waits for the success message to appear in the live region (from Lesson 12.8).

### 1.5 Authenticated flows via fixtures

Tests that need an authenticated user should not log in from scratch every time — that is slow and brittle. Playwright supports **fixtures**, which are reusable setup/teardown blocks. The standard pattern: log in once in a `setup` test, save the storage state to a file, and reuse the state in every subsequent test.

```ts
// tests/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
	await page.goto('/login');
	await page.getByLabel('Email').fill('admin@example.com');
	await page.getByLabel('Password').fill('correct-horse-battery-staple');
	await page.getByRole('button', { name: /sign in/i }).click();
	await page.waitForURL('/dashboard');
	await page.context().storageState({ path: 'tests/.auth/admin.json' });
});
```

Then in your `playwright.config.ts`, declare a project that uses `tests/.auth/admin.json` as its storage state. Every test in that project starts already logged in. The actual login flow runs once per test run instead of once per test.

### 1.6 Scope — test journeys, not every permutation

A good E2E suite proves a small number of critical user journeys:

- The home page loads.
- A user can sign up, log in, and reach the dashboard.
- A user can create, edit, and delete their profile.
- A form submission succeeds and shows the correct confirmation.

A bad E2E suite tries to cover every component prop and every edge case. Those belong in unit tests. The E2E layer exists to prove that the *assembled* app works, not to re-verify behaviour that the lower layers already cover. Keep E2E suites small, fast, and focused on the paths that matter most to your users.

### 1.7 A note about running in this lesson

Playwright downloads large browser binaries on install (`pnpm playwright install`). Parallel agents in this course are producing content, so **we do not run the browsers in this lesson** — we only write the test files. To actually run them on your own machine, run `pnpm playwright install` once (it takes a few minutes) and then `pnpm playwright test`. For this lesson, the proof is that the test file type-checks.

## 2. Style it — Nothing to style

E2E tests have no visible output beyond pass/fail in the terminal and the HTML report Playwright generates. The style rules do not apply.

## 3. Interact — Write, type-check, run later

Students write a single test file (`tests/home.spec.ts`) and verify it compiles. Running the test happens in the module project, once the config is in place.

## 4. Mini-build — A Playwright test file for the home page

**File:** `src/routes/modules/12-performance/10-playwright/+page.svelte` (instructional route)
**Companion test file:** `tests/home.spec.ts`

The route displays the Playwright test code and explains the setup. The actual test lives in `tests/`, separate from the app code, as Playwright convention dictates.

### DevTools moment

No DevTools step. Playwright's own UI mode (`pnpm playwright test --ui`) is the equivalent — an interactive runner with time-travel debugging. You will use it in the module project.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does "E2E" mean?</summary>

End-to-end: a test that drives a real browser against a real running instance of the app, exercising the full stack from DOM to database (or fake database). It answers the question "does the whole assembled app work?" — which unit tests cannot answer alone.
</details>

<details>
<summary><strong>Q2.</strong> Why use <code>getByRole</code> and <code>getByLabel</code> instead of CSS selectors?</summary>

Role- and label-based queries couple the test to the accessibility tree — the same information assistive technology uses. The test is refactor-safe against CSS changes and doubles as an implicit accessibility check: if the query fails, so does the accessibility.
</details>

<details>
<summary><strong>Q3.</strong> What does "auto-waiting" mean in Playwright?</summary>

`expect(...).toBeVisible()` and friends retry the condition until it is true or the timeout expires. This handles the inherent asynchrony of a real browser — pages hydrate, animations finish, data loads — without requiring explicit `waitForSelector` calls all over the test.
</details>

<details>
<summary><strong>Q4.</strong> How do authenticated flows avoid logging in on every test?</summary>

Playwright fixtures run a setup test once that logs in and saves the browser's storage state to a file. Subsequent tests reuse the file, starting already logged in. The login flow runs once per test run instead of once per test, which saves many seconds per run.
</details>

<details>
<summary><strong>Q5.</strong> If you have many unit tests, should you still have E2E tests?</summary>

Yes, but few of them. The unit layer proves pieces work; the E2E layer proves the assembled app works. You need both because a working piece does not guarantee a working whole. The test pyramid: many unit tests, fewer component tests, very few E2E tests — focused on the handful of critical user journeys.
</details>

## 6. Common mistakes

- **Re-testing unit behaviour at the E2E layer.** Slow, flaky, and redundant. Unit tests are faster and more reliable for that job.
- **Using CSS selectors.** Brittle and accessibility-blind.
- **Logging in from scratch in every test.** Slow. Use fixtures.
- **Writing an E2E test for every component prop.** Wrong layer. Use unit tests.

## 7. What's next

Lesson 12.11 wraps production-readiness with deployment — adapters, environment variables, and bundle analysis.
