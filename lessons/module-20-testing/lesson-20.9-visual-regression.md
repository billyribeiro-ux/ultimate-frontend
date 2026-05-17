---
module: 20
lesson: 20.9
title: Visual regression testing
duration: 50 minutes
prerequisites:
  - "20.7 — Playwright fundamentals"
  - "6.9 — Per-page color personalities"
  - "Familiarity with CSS dark mode"
learning_objectives:
  - Capture page and component screenshots with Playwright's toHaveScreenshot assertion
  - Configure screenshot comparison thresholds to balance sensitivity against flakiness
  - Test light and dark color schemes by emulating prefers-color-scheme
  - Manage screenshot baselines across operating systems and CI environments
  - Identify when visual regression tests add value and when they create maintenance burden
status: ready
---

# Lesson 20.9 — Visual regression testing

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Catching the bugs your eyes would notice

### 1.1 The problem: CSS changes are invisible to unit tests

You refactor a CSS file and accidentally remove a `border-radius` declaration. No unit test fails. No integration test fails. No E2E test fails — because none of them check visual appearance. The button still works, the text still reads correctly, the form still submits. But the button looks wrong, and a user notices.

Visual regression testing captures screenshots of your pages and compares them against approved baselines. If a single pixel changes, the test fails and shows you a diff image highlighting exactly what changed.

### 1.2 How Playwright's toHaveScreenshot works

Playwright's built-in `toHaveScreenshot()` assertion captures a screenshot and compares it against a stored baseline:

```typescript
import { test, expect } from '@playwright/test';

test('pricing page matches baseline', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page).toHaveScreenshot('pricing-page.png');
});
```

The first time you run this test, Playwright saves the screenshot as the baseline in a `__snapshots__` directory. On subsequent runs, it captures a new screenshot and compares it pixel-by-pixel against the baseline. If the difference exceeds the threshold, the test fails and Playwright generates three images: the baseline, the actual screenshot, and a diff highlighting the differences.

### 1.3 Configuration and thresholds

Pixel-perfect comparison is too strict for real applications. Anti-aliasing differences between operating systems, font rendering variations, and sub-pixel positioning can cause false failures. Configure a tolerance threshold:

```typescript
await expect(page).toHaveScreenshot('pricing-page.png', {
  maxDiffPixelRatio: 0.01, // Allow up to 1% of pixels to differ
  threshold: 0.2           // Per-pixel color difference threshold (0-1)
});
```

`maxDiffPixelRatio` sets the maximum fraction of pixels that can differ. `threshold` sets how different each individual pixel can be before it counts as "different." A `threshold` of 0 means exact match; 0.2 allows slight color variations.

### 1.4 Testing color schemes

SvelteKit applications with PE7 support dark mode via `prefers-color-scheme`. Playwright can emulate this preference:

```typescript
test('pricing page in dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/pricing');
  await expect(page).toHaveScreenshot('pricing-dark.png');
});

test('pricing page in light mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/pricing');
  await expect(page).toHaveScreenshot('pricing-light.png');
});
```

### 1.5 Component-level screenshots

You do not have to screenshot entire pages. Playwright can capture individual elements:

```typescript
test('button component variants', async ({ page }) => {
  await page.goto('/components/button');

  const primaryButton = page.getByRole('button', { name: 'Primary' });
  await expect(primaryButton).toHaveScreenshot('button-primary.png');

  const outlineButton = page.getByRole('button', { name: 'Outline' });
  await expect(outlineButton).toHaveScreenshot('button-outline.png');
});
```

Component-level screenshots are more stable than full-page screenshots because they are not affected by layout changes in other parts of the page.

### 1.6 When visual regression tests help and when they hurt

Visual regression tests add the most value for:
- Design systems and component libraries (ensuring consistent appearance)
- Marketing pages (where visual polish is critical)
- Dark mode and theme switching (verifying all color tokens apply correctly)

They add the least value for:
- Pages with dynamic content (user data, timestamps, random content)
- Rapidly changing pages during active development
- Pages viewed on many different operating systems (font rendering differences cause noise)

### Deep Dive — Managing baselines across platforms and CI

The biggest challenge of visual regression testing is platform consistency. A screenshot taken on macOS looks different from one taken on Linux because font rendering, anti-aliasing, and sub-pixel positioning differ. If a developer approves baselines on macOS but CI runs on Linux, every test fails.

Solutions:

**Solution 1: Update baselines in CI only.** Run `npx playwright test --update-snapshots` in CI to generate platform-consistent baselines. Developers never update baselines locally — they push code, let CI generate baselines, and pull them down.

**Solution 2: Docker for consistent rendering.** Run visual regression tests in a Docker container with the same OS and fonts as CI. This ensures developer and CI screenshots match:

```yaml
# docker-compose.test.yml
services:
  visual-tests:
    image: mcr.microsoft.com/playwright:v1.49.0
    command: npx playwright test tests/visual/
    volumes:
      - .:/app
    working_dir: /app
```

**Solution 3: Platform-specific baselines.** Playwright supports per-platform baseline directories. Each platform has its own set of approved screenshots. This is the simplest approach but triplicates baseline storage.

For dynamic content, mask changing elements before capturing:

```typescript
await page.goto('/dashboard');
// Mask the timestamp element
await page.getByTestId('timestamp').evaluate(el => el.textContent = '2026-01-01');
await expect(page).toHaveScreenshot('dashboard.png');
```

Or use Playwright's `mask` option:

```typescript
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [page.getByTestId('timestamp')]
});
```

Masked elements are replaced with a solid color block in the screenshot, preventing dynamic content from causing false failures.

## 2. Style it — PE7 applied to the visual diff viewer mini-build

The mini-build shows a before/after comparison using PE7 tokens. The baseline image uses `var(--color-surface-2)` border. The actual image uses `var(--color-border)` border. Diff highlights use `var(--color-error)` overlay at 50% opacity. A slider control lets the student slide between baseline and actual views using `var(--color-brand)` for the slider thumb.

## 3. Interact — simulating screenshot comparison

The student modifies CSS properties (color, spacing, border-radius) on a simulated component and sees the visual diff update in real time.

## 4. Mini-build — Visual diff simulator

**File path:** `src/routes/modules/20-testing/09-visual-regression/+page.svelte`

A component preview with adjustable CSS properties (background color, border-radius, padding). The left panel shows the "baseline" state, the right panel shows the current state. A diff overlay highlights changed pixels. A threshold slider controls sensitivity. The student can modify properties and see how the diff changes.

**DevTools moment:** Run `npx playwright test --update-snapshots` to generate baseline screenshots. Then modify a CSS property in a component, run `npx playwright test`, and observe the visual diff in the test report (`npx playwright show-report`).

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why does Playwright generate three images (baseline, actual, diff) when a visual test fails?</summary>

The baseline shows what the page should look like (the approved state). The actual shows what the page currently looks like. The diff highlights exactly which pixels changed, making it easy to identify whether the change is intentional (update the baseline) or a bug (fix the code). Without the diff, comparing two similar-looking screenshots is tedious and error-prone.
</details>

<details>
<summary><strong>Q2.</strong> Why should you set a maxDiffPixelRatio greater than 0 instead of requiring pixel-perfect matches?</summary>

Font rendering, anti-aliasing, and sub-pixel positioning differ across operating systems and even browser versions. A pixel-perfect threshold causes false failures from rendering differences that are invisible to humans. A small tolerance (0.01 = 1%) allows for these natural variations while still catching meaningful visual changes.
</details>

<details>
<summary><strong>Q3.</strong> How do you prevent dynamic content (timestamps, user names) from causing false visual test failures?</summary>

Use Playwright's `mask` option to replace dynamic elements with solid color blocks in the screenshot. Alternatively, set dynamic content to a fixed value before capturing: `await element.evaluate(el => el.textContent = 'Fixed')`. This ensures only intentional visual changes trigger failures.
</details>

<details>
<summary><strong>Q4.</strong> Why are component-level screenshots more stable than full-page screenshots?</summary>

Component-level screenshots capture only the element being tested. They are not affected by layout changes in headers, footers, sidebars, or other components on the page. Full-page screenshots break when any part of the page changes, even if the change is unrelated to what you are testing.
</details>

<details>
<summary><strong>Q5.</strong> When is visual regression testing NOT worth the maintenance cost?</summary>

For pages with rapidly changing layouts during active development (baselines need constant updating), pages with heavy dynamic content (too many elements to mask), and pages rarely viewed by users (admin tools, internal dashboards). The maintenance cost of updating baselines exceeds the value of catching visual bugs.
</details>

## 6. Common mistakes — 3 pitfalls

1. **Approving baselines on macOS, running CI on Linux.** Font rendering differs between operating systems, causing every baseline to mismatch. Generate and approve baselines in the same environment that CI uses.

2. **Capturing screenshots before the page is fully loaded.** Animations, lazy-loaded images, and web fonts can change the page appearance after initial render. Wait for the page to stabilize: `await page.waitForLoadState('networkidle')` before capturing.

3. **Taking full-page screenshots for component testing.** A single layout change breaks every full-page screenshot. Capture individual components or sections to isolate visual tests from unrelated changes.

## 7. What's next — one sentence

Next, you will build a CI/CD testing pipeline with GitHub Actions that runs all test suites on every push and reports results.
