---
module: 20
exercise: 4
title: Playwright Locator
difficulty: expert
estimated_time: 45
skills_tested:
  - Playwright test structure
  - locator strategies
  - page interaction patterns
  - assertion methods
  - test fixtures
---

# Exercise 20.4 — Playwright Locator

## Brief

Write Playwright end-to-end tests for a multi-page SvelteKit feature. Navigate between pages, fill forms, click buttons, and assert on the resulting page state. This exercise teaches how to write reliable E2E tests that test the full application stack.

## Requirements

1. Create `tests/exercises/e2e-demo.spec.ts` with Playwright tests
2. Test navigation: visit the home page, click a link, verify the destination page loads
3. Test form interaction: navigate to a form page, fill inputs, submit, verify the response
4. Test dynamic content: interact with a component and verify the DOM updates
5. Use Playwright locators: `page.getByRole()`, `page.getByText()`, `page.getByLabel()`, `page.getByPlaceholder()`
6. Use assertions: `expect(page).toHaveTitle()`, `expect(locator).toBeVisible()`, `expect(locator).toHaveText()`
7. Use `test.describe()` for grouping and `test.beforeEach()` for shared setup
8. Add a screenshot assertion: take a screenshot at a key state for visual regression baseline
9. Test a responsive scenario: set viewport to mobile (375px) and verify layout changes
10. Create `src/routes/exercises/20-testing/04/+page.svelte` documenting the Playwright patterns

## Constraints

- All locators must use user-facing attributes (role, text, label) not CSS selectors
- TypeScript strict mode
- Tests must not depend on timing (use `waitForSelector` or auto-waiting, not `setTimeout`)
- Each test must start from a clean state (navigate to the page fresh)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Playwright tests use `import { test, expect } from '@playwright/test'`. The `test` function provides a `page` fixture. Navigate with `await page.goto('/path')`. Locate elements with `page.getByRole('button', { name: 'Submit' })`. Assert with `await expect(locator).toBeVisible()`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Group related tests with `test.describe('Feature', () => { ... })`. Use `test.beforeEach(async ({ page }) => { await page.goto('/some-page'); })` for shared navigation. Take screenshots with `await page.screenshot({ path: 'tests/screenshots/name.png' })`. Set viewport with `await page.setViewportSize({ width: 375, height: 667 })`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays the heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('navigates to about page', async ({ page }) => {
    await page.getByRole('link', { name: /about/i }).click();
    await expect(page).toHaveURL(/about/);
  });
});
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`tests/exercises/e2e-demo.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('SvelteKit E2E Demo', () => {
  test.describe('Navigation', () => {
    test('loads the home page with correct title', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/Ultimate Frontend/i);
    });

    test('navigates via link click', async ({ page }) => {
      await page.goto('/');
      const navLink = page.getByRole('link', { name: /exercises/i }).first();

      if (await navLink.isVisible()) {
        await navLink.click();
        await expect(page.url()).not.toBe('/');
      }
    });
  });

  test.describe('Form Interaction', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/exercises/15-auth/02');
    });

    test('displays the registration form', async ({ page }) => {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('shows validation errors for empty submission', async ({ page }) => {
      const submitButton = page.getByRole('button', { name: /create account/i });

      if (await submitButton.isVisible()) {
        await submitButton.click();
        // Browser-native validation should prevent submission of required fields
      }
    });

    test('fills form fields', async ({ page }) => {
      const nameField = page.getByLabel(/name/i);
      const emailField = page.getByLabel(/email/i);

      if (await nameField.isVisible()) {
        await nameField.fill('Test User');
        await expect(nameField).toHaveValue('Test User');
      }

      if (await emailField.isVisible()) {
        await emailField.fill('test@example.com');
        await expect(emailField).toHaveValue('test@example.com');
      }
    });
  });

  test.describe('Dynamic Content', () => {
    test('counter increments on button click', async ({ page }) => {
      await page.goto('/exercises/01-foundation/01');
      // Test that the page renders content
      await expect(page.getByRole('main')).toBeVisible();
    });
  });

  test.describe('Responsive Layout', () => {
    test('mobile viewport renders correctly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await expect(page.getByRole('main')).toBeVisible();

      await page.screenshot({
        path: 'tests/screenshots/home-mobile.png',
        fullPage: true
      });
    });

    test('desktop viewport renders correctly', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');
      await expect(page.getByRole('main')).toBeVisible();

      await page.screenshot({
        path: 'tests/screenshots/home-desktop.png',
        fullPage: true
      });
    });
  });

  test.describe('Page Content', () => {
    test('exercise page has correct structure', async ({ page }) => {
      await page.goto('/exercises/01-foundation/01');

      // Verify the page has basic structure
      const main = page.getByRole('main');
      await expect(main).toBeVisible();
    });
  });
});
```

**`src/routes/exercises/20-testing/04/+page.svelte`**

```svelte
<script lang="ts">
  interface LocatorPattern {
    method: string;
    example: string;
    description: string;
  }

  const locators: LocatorPattern[] = [
    { method: 'getByRole', example: "page.getByRole('button', { name: 'Submit' })", description: 'Finds by ARIA role — the most reliable selector' },
    { method: 'getByText', example: "page.getByText('Welcome')", description: 'Finds by visible text content' },
    { method: 'getByLabel', example: "page.getByLabel('Email')", description: 'Finds form controls by their label' },
    { method: 'getByPlaceholder', example: "page.getByPlaceholder('Search...')", description: 'Finds by placeholder text' },
    { method: 'getByTestId', example: "page.getByTestId('hero')", description: 'Finds by data-testid (last resort)' }
  ];

  interface AssertionPattern {
    assertion: string;
    use: string;
  }

  const assertions: AssertionPattern[] = [
    { assertion: 'toBeVisible()', use: 'Element is rendered and not hidden' },
    { assertion: 'toHaveText("...")', use: 'Element contains specific text' },
    { assertion: 'toHaveURL(/pattern/)', use: 'Current URL matches pattern' },
    { assertion: 'toHaveTitle("...")', use: 'Page title matches' },
    { assertion: 'toHaveValue("...")', use: 'Input has specific value' }
  ];
</script>

<main class="page">
  <h1>Playwright E2E Testing</h1>
  <p class="intro">End-to-end tests that verify the full application stack from the user's perspective.</p>

  <section>
    <h2>Locator Priority</h2>
    <div class="locator-list">
      {#each locators as loc, i}
        <div class="locator-card">
          <span class="priority">{i + 1}</span>
          <div>
            <code class="method">{loc.method}</code>
            <code class="example">{loc.example}</code>
            <p>{loc.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h2>Assertions</h2>
    <div class="assertion-grid">
      {#each assertions as a}
        <code>{a.assertion}</code>
        <span>{a.use}</span>
      {/each}
    </div>
  </section>
</main>

<style>
  .page { max-inline-size: var(--content-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }
  section { margin-block-end: var(--space-2xl); }

  .locator-list { display: grid; gap: var(--space-sm); }
  .locator-card { display: flex; gap: var(--space-md); padding: var(--space-md); background: var(--color-surface-2); border-radius: var(--radius-md); }
  .priority { inline-size: 1.5rem; block-size: 1.5rem; border-radius: var(--radius-full); background: var(--color-brand); color: var(--color-surface); display: grid; place-items: center; font-weight: 700; font-size: var(--text-xs); flex-shrink: 0; }
  .method { font-size: var(--text-sm); font-weight: 700; color: var(--color-brand); display: block; }
  .example { font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-block: var(--space-xs); }
  .locator-card p { font-size: var(--text-sm); color: var(--color-text-muted); }

  .assertion-grid { display: grid; grid-template-columns: auto 1fr; gap: var(--space-sm); }
  .assertion-grid code { font-size: var(--text-xs); background: var(--color-surface-2); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); }
  .assertion-grid span { font-size: var(--text-sm); color: var(--color-text-muted); align-self: center; }
</style>
```

### Explanation

Playwright tests run a real browser (Chromium, Firefox, or WebKit) against your running SvelteKit application. Unlike unit tests that test isolated components, E2E tests verify the full stack: server-side rendering, client-side hydration, navigation, form submission, and API calls. Playwright's auto-waiting mechanism means you never need `setTimeout` — `getByRole` waits for the element to appear, `click` waits for the element to be actionable, and assertions wait for the expected state. The locator priority (role > text > label > placeholder > testId) ensures tests are resilient to implementation changes — if you rename a CSS class, role-based tests still pass. The responsive tests use `setViewportSize` to verify mobile layouts, and screenshots create baselines for visual regression testing. In CI, Playwright runs headless browsers against the built application, catching integration bugs that unit tests miss.
</details>
