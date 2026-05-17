---
module: 20
lesson: 20.7
title: Playwright fundamentals
duration: 60 minutes
prerequisites:
  - "20.4 — Component testing"
  - "12.10 — E2E testing with Playwright"
  - "SvelteKit routing basics"
learning_objectives:
  - Install and configure Playwright for a SvelteKit project with automatic dev server startup
  - Use Playwright locators (getByRole, getByLabel, getByText) to find elements reliably
  - Understand Playwright's auto-waiting mechanism and why explicit waits are rarely needed
  - Implement the page object pattern to encapsulate page interactions and reduce test duplication
  - Write a complete E2E test that navigates, interacts, and asserts across multiple pages
status: ready
---

# Lesson 20.7 — Playwright fundamentals

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Testing from the user's chair

### 1.1 The problem: unit tests cannot catch integration bugs

Your component tests pass. Your form action tests pass. Your store tests pass. But when a user opens the app, fills out the login form, and clicks submit, nothing happens. Why? Because the form's `action` attribute points to the wrong URL, a middleware strips the cookie before the redirect handler reads it, or the layout component does not render the slot where the page should appear.

These bugs exist in the spaces between units — the wiring that connects components, routes, and server code. No unit test catches them because no unit test exercises the full stack. End-to-end (E2E) tests do.

### 1.2 How Playwright works

Playwright launches a real browser (Chromium, Firefox, or WebKit), navigates to your application, and executes commands that simulate a real user. It clicks buttons, types into inputs, navigates links, and asserts on what the page displays. Unlike jsdom (which simulates a subset of browser APIs), Playwright runs in an actual browser engine with real CSS rendering, real JavaScript execution, and real network requests.

### 1.3 Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } }
  ],
  webServer: {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
});
```

The `webServer` option starts your dev server automatically before tests run and shuts it down after. In CI, it always starts fresh. Locally, it reuses an existing server if one is running.

### 1.4 Locators — finding elements reliably

Playwright's locator API mirrors @testing-library's philosophy: find elements the way a user would.

```typescript
// By role (preferred)
page.getByRole('button', { name: 'Submit' });
page.getByRole('textbox', { name: 'Email' });
page.getByRole('heading', { level: 1 });

// By label
page.getByLabel('Password');

// By text
page.getByText('Welcome back');

// By placeholder
page.getByPlaceholder('Search...');

// By test ID (last resort)
page.getByTestId('sidebar-nav');
```

Locators are lazy — they do not query the DOM when created. They query at the moment you interact with them (`click`, `fill`, `textContent`). This means a locator created before an element exists will find it when the element appears later.

### 1.5 Auto-waiting — no more flaky waits

Playwright automatically waits before performing actions. When you call `locator.click()`, Playwright waits for the element to be:
1. Attached to the DOM
2. Visible
3. Stable (not animating)
4. Enabled
5. Not obscured by another element

Only then does it click. This eliminates the need for `await page.waitForSelector()` or `await page.waitForTimeout(1000)` — the most common sources of flaky tests in other E2E frameworks.

### 1.6 The page object pattern

Page objects encapsulate page-specific selectors and actions into reusable classes:

```typescript
// tests/e2e/pages/login-page.ts
import type { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async getErrorMessage(): Promise<string | null> {
    const error = this.page.getByRole('alert');
    if (await error.isVisible()) {
      return error.textContent();
    }
    return null;
  }
}
```

Tests use the page object instead of raw locators:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';

test('successful login redirects to dashboard', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('ada@example.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

This pattern reduces duplication: if the login form changes its field labels, you update one page object, not fifty tests.

### Deep Dive — Playwright traces, debugging, and CI artifacts

When a test fails in CI, you need to understand what the browser showed at the moment of failure. Playwright's trace viewer records every action, network request, DOM snapshot, and console log during a test run.

The `trace: 'on-first-retry'` configuration records a trace only when a test fails and is retried. This minimizes overhead in passing runs while providing full debugging data for failures.

To view a trace locally:

```bash
npx playwright show-trace test-results/failing-test/trace.zip
```

The trace viewer shows a timeline of actions with DOM snapshots at each step. You can click any action to see the page state before and after it executed. Network requests show request/response bodies. Console logs show JavaScript errors.

In CI (GitHub Actions), upload the `test-results/` directory as an artifact:

```yaml
- uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: playwright-traces
    path: test-results/
```

Other debugging tools:
- `npx playwright test --debug` opens the Playwright Inspector with step-through debugging
- `npx playwright codegen http://localhost:5173` records your browser interactions and generates test code
- `page.screenshot({ path: 'debug.png' })` captures the current page state
- `page.pause()` pauses test execution and opens the Inspector at the current point

For mobile testing, Playwright's device emulation (`devices['Pixel 5']`) sets the viewport size, user agent, and device scale factor. This is not a real mobile device, but it catches responsive layout bugs that desktop testing misses.

## 2. Style it — PE7 applied to the Playwright demo mini-build

The mini-build is a concept page that shows Playwright test code alongside simulated browser output. Code panels use `var(--color-surface)` with monospace `var(--text-xs)`. The "browser" preview uses `var(--color-surface-2)` with a simulated URL bar. Action highlights use `var(--color-brand)` borders on the currently active element.

## 3. Interact — simulating Playwright locator resolution

The student selects a locator strategy (role, label, text) and the mini-build highlights which element on the simulated page it finds.

## 4. Mini-build — Playwright locator explorer

**File path:** `src/routes/modules/20-testing/07-playwright-fundamentals/+page.svelte`

A simulated page with various elements (buttons, inputs, headings, links). The student selects a locator strategy from a dropdown and types a query. The matching element highlights on the simulated page. If multiple elements match, all are highlighted with a count badge. Shows how different locator strategies resolve to different elements.

**DevTools moment:** Run `npx playwright codegen http://localhost:5173`. Interact with your app in the opened browser. Observe how Playwright generates locator code in real time. Copy the generated code into a test file.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> What does Playwright's auto-waiting do, and why does it reduce flaky tests?</summary>

Auto-waiting automatically waits for an element to be attached, visible, stable, enabled, and unobscured before performing an action. This eliminates the need for manual `waitForSelector` or `setTimeout` calls, which are the primary source of flaky tests — they either wait too long (slow tests) or not long enough (false failures on slow CI).
</details>

<details>
<summary><strong>Q2.</strong> What is the page object pattern and what problem does it solve?</summary>

The page object pattern encapsulates page-specific locators and actions into a class. Tests call methods like `loginPage.login(email, password)` instead of writing raw locator code. This reduces duplication: if the page's markup changes, you update one page object instead of every test that interacts with that page.
</details>

<details>
<summary><strong>Q3.</strong> Why does Playwright launch a real browser instead of using jsdom?</summary>

jsdom simulates a subset of browser APIs but does not render CSS, execute browser-specific JavaScript, or handle real network requests. A real browser catches bugs that jsdom misses: CSS layout issues, navigation problems, cookie handling, and cross-origin restrictions. E2E tests need the full browser environment to verify the complete user experience.
</details>

<details>
<summary><strong>Q4.</strong> How does the webServer configuration option simplify CI setup?</summary>

The `webServer` option tells Playwright to start your dev server automatically before tests run and stop it after. In CI, this means the workflow does not need a separate step to start the server and wait for it to be ready. Playwright handles server startup, port detection, and health checking automatically.
</details>

<details>
<summary><strong>Q5.</strong> When should you use getByTestId instead of getByRole or getByLabel?</summary>

`getByTestId` should be a last resort for elements that have no accessible role, label, or text — such as a decorative container or a complex custom widget. Most interactive elements should be findable by role and label, which also enforces accessibility. If you frequently need `getByTestId`, the component likely has accessibility gaps.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Using page.waitForTimeout().** Hard-coded waits make tests slow and flaky. Use Playwright's auto-waiting or `expect(locator).toBeVisible()` assertions, which wait automatically with proper timeouts.

2. **Not using the webServer configuration.** Starting the server manually before tests is error-prone (wrong port, stale build, forgotten step). Let Playwright manage the server lifecycle.

3. **Writing one giant test instead of focused tests.** A single test that logs in, creates an item, edits it, and deletes it is hard to debug when it fails. Split into focused tests that each verify one behavior. Use `test.beforeEach` for common setup like authentication.

4. **Ignoring mobile viewports.** Running tests only in desktop Chrome misses responsive layout bugs. Add a mobile project (like `Pixel 5`) to your Playwright config to catch mobile-specific issues.

## 7. What's next — one sentence

Next, you will write complete E2E test flows for authentication, CRUD operations, and multi-page navigation in your SvelteKit application.
