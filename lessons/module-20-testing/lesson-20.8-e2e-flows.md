---
module: 20
lesson: 20.8
title: "E2E flows: auth, CRUD, navigation"
duration: 60 minutes
prerequisites:
  - "20.7 — Playwright fundamentals"
  - "10.3 — Form actions"
  - "8.4 — File-based routing"
learning_objectives:
  - Write an E2E test for a complete authentication flow (register, login, session persistence, logout)
  - Test CRUD operations (create, read, update, delete) through the browser with proper assertions
  - Test navigation flows including deep linking, back button, and breadcrumb navigation
  - Use Playwright's storageState to share authentication across tests without repeated login
  - Handle test data setup and cleanup to prevent test pollution across runs
status: ready
---

# Lesson 20.8 — E2E flows: auth, CRUD, navigation

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Testing complete user journeys

### 1.1 The problem: real bugs live in the gaps between features

A user signs up, logs in, creates a note, edits the note title, navigates away, comes back, and finds the edit was not saved. Each individual feature works in isolation — the signup form submits, the login redirects, the editor saves — but the integration between them has a bug: the auth token expires during editing, and the save request silently fails.

E2E tests catch these integration bugs by exercising the full journey from the user's perspective.

### 1.2 Authentication flow testing

The auth flow is the most critical E2E test because every other test depends on being logged in:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';
import { DashboardPage } from './pages/dashboard-page';

test.describe('authentication', () => {
  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('ada@example.com', 'password123');

    const dashboard = new DashboardPage(page);
    await expect(page).toHaveURL('/dashboard');
    await expect(dashboard.welcomeHeading).toHaveText('Welcome, Ada');
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('ada@example.com', 'wrong-password');

    await expect(page).toHaveURL('/login');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('logout clears session and redirects to login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('ada@example.com', 'password123');

    const dashboard = new DashboardPage(page);
    await dashboard.logout();

    await expect(page).toHaveURL('/login');
  });
});
```

### 1.3 Sharing auth state with storageState

Logging in before every test is slow. Playwright's `storageState` lets you save the authenticated browser state (cookies, localStorage) to a file and reuse it:

```typescript
// tests/e2e/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');

  // Save signed-in state
  await page.context().storageState({ path: 'tests/e2e/.auth/user.json' });
});
```

In `playwright.config.ts`, configure a setup project and a dependent test project:

```typescript
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'tests/e2e/.auth/user.json'
    },
    dependencies: ['setup']
  }
]
```

Now all tests in the `chromium` project start with an authenticated session.

### 1.4 CRUD flow testing

```typescript
test.describe('notes CRUD', () => {
  test('create a note and see it in the list', async ({ page }) => {
    await page.goto('/notes');
    await page.getByRole('button', { name: 'New note' }).click();
    await page.getByLabel('Title').fill('Test Note');
    await page.getByLabel('Content').fill('This is a test note.');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Test Note')).toBeVisible();
  });

  test('edit a note title', async ({ page }) => {
    await page.goto('/notes');
    await page.getByText('Test Note').click();
    await page.getByLabel('Title').clear();
    await page.getByLabel('Title').fill('Updated Note');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Updated Note')).toBeVisible();
    await expect(page.getByText('Test Note')).not.toBeVisible();
  });

  test('delete a note removes it from the list', async ({ page }) => {
    await page.goto('/notes');
    await page.getByText('Updated Note').click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText('Updated Note')).not.toBeVisible();
  });
});
```

### 1.5 Navigation testing

```typescript
test('deep link to a specific note', async ({ page }) => {
  await page.goto('/notes/abc-123');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('My Note Title');
});

test('back button returns to notes list', async ({ page }) => {
  await page.goto('/notes');
  await page.getByText('My Note').click();
  await page.goBack();
  await expect(page).toHaveURL('/notes');
});
```

### Deep Dive — Test data management and preventing pollution

E2E tests that create data in a shared database can interfere with each other. If Test A creates a note titled "Test Note" and Test B also creates "Test Note," both tests might find the wrong note, causing flaky failures.

Strategies for test data isolation:

**Strategy 1: Unique test data.** Append a unique identifier (timestamp, UUID) to all test data:

```typescript
const noteTitle = `Test Note ${Date.now()}`;
await page.getByLabel('Title').fill(noteTitle);
```

**Strategy 2: Database reset before each test.** Run a seed script that resets the database to a known state. This is slow but guarantees clean state:

```typescript
test.beforeEach(async ({ request }) => {
  await request.post('/api/test/reset');
});
```

**Strategy 3: Test-specific users.** Each test creates a unique user account. Data created by one test is invisible to others:

```typescript
const user = `user-${Date.now()}@test.com`;
```

**Strategy 4: Cleanup in afterEach.** Delete data created during the test:

```typescript
test.afterEach(async ({ request }) => {
  await request.delete(`/api/notes/${createdNoteId}`);
});
```

The best approach for most SvelteKit projects is a combination: use unique test data names for fast isolation during development, and database reset in CI for guaranteed clean state.

For CI, run Playwright tests sequentially (not in parallel) against a fresh database that is reset before the test suite starts. This prevents cross-test pollution and makes failures reproducible.

## 2. Style it — PE7 applied to the E2E flow visualizer mini-build

The mini-build shows a step-by-step flow diagram. Each step is a card with a screenshot-like preview using `var(--color-surface-2)`. Connected steps have arrows using `var(--color-brand)`. The current step highlights with `var(--color-brand)` border. Failed steps use `var(--color-error)` borders. The flow wraps horizontally on mobile.

## 3. Interact — stepping through an E2E flow

The student clicks through a simulated E2E flow step by step, seeing the "browser" state change and the test assertions evaluate at each step.

## 4. Mini-build — E2E flow step-through visualizer

**File path:** `src/routes/modules/20-testing/08-e2e-flows/+page.svelte`

A visual walkthrough of an auth + CRUD E2E flow. Each step shows a simulated page state and the Playwright code that would execute. The student clicks "Next Step" to advance through the flow. At each step, assertions show green or red. The full test code is displayed at the bottom.

**DevTools moment:** Run `npx playwright test --ui` to open Playwright's Test UI. Watch tests execute in real time in the embedded browser. Click on a test step to see the page snapshot at that moment.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why is the authentication flow the most critical E2E test?</summary>

Because every other E2E test depends on being logged in. If the auth flow is broken, no other test can run meaningfully. Auth involves multiple components (form, action, cookies, redirect), making it the highest-risk integration point. It is also the first thing every user does, so its failure has the highest business impact.
</details>

<details>
<summary><strong>Q2.</strong> How does Playwright's storageState avoid repeating the login flow in every test?</summary>

A setup step logs in once and saves the browser state (cookies, localStorage) to a JSON file. All subsequent tests load this saved state, starting with an authenticated session. This skips the login flow, making tests faster without sacrificing coverage (the auth flow itself is tested in the setup step).
</details>

<details>
<summary><strong>Q3.</strong> Why might CRUD tests that share a database be flaky?</summary>

If Test A creates a "Test Note" and Test B also creates a "Test Note," either test might find the other's note during assertions. If tests run in parallel, they can interfere with each other's data. This produces flaky results — tests pass sometimes and fail other times depending on execution order.
</details>

<details>
<summary><strong>Q4.</strong> What is the advantage of using unique timestamps in test data names?</summary>

Timestamps ensure each test run creates uniquely named data that does not collide with data from other tests or previous runs. This prevents cross-test pollution without requiring database resets between tests, making the test suite faster and more reliable.
</details>

<details>
<summary><strong>Q5.</strong> When should you use page.goBack() in E2E tests instead of navigating directly?</summary>

Use `page.goBack()` when you are specifically testing the browser's back button behavior — verifying that the history stack is correct and that returning to a previous page preserves state (scroll position, form data, selected items). If you just need to navigate to a URL, use `page.goto()` directly.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Tests that depend on execution order.** If the "edit note" test depends on the "create note" test having run first, test isolation is broken. Each test should set up its own data or use a shared setup step.

2. **Not cleaning up test data.** Data created in tests accumulates across runs, eventually causing failures. Use unique data names, database resets, or explicit cleanup.

3. **Testing too many things in one E2E test.** A single test that logs in, creates a note, edits it, shares it, and deletes it takes minutes and is hard to debug when it fails. Split into focused tests that each verify one behavior.

4. **Storing .auth/ files in version control.** The `storageState` files contain session tokens. Add `tests/e2e/.auth/` to `.gitignore` to prevent committing credentials.

## 7. What's next — one sentence

Next, you will learn visual regression testing — capturing screenshots and comparing them against baselines to catch unintended visual changes.
