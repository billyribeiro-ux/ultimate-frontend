---
module: 23
lesson: 23.5
title: Visual regression in CI
duration: 55 minutes
prerequisites:
  - "23.4 — Documentation with Svelte"
  - "12.10 — E2E testing with Playwright"
  - "20.9 — Visual regression testing"
learning_objectives:
  - Explain what visual regression testing detects that unit tests cannot
  - Use Playwright screenshots to capture component states for comparison
  - Configure threshold tuning to handle anti-aliasing and sub-pixel rendering differences
  - Handle dynamic content (timestamps, animations) that causes false positives
  - Integrate visual regression tests into a CI pipeline
status: ready
---

# Lesson 23.5 — Visual regression in CI

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Catching changes the eye can see but unit tests cannot

### 1.1 The problem: invisible visual breakage

A developer changes a CSS variable from `var(--space-md)` to `var(--space-sm)` in a shared layout component. All unit tests pass. All TypeScript types check. The build succeeds. But the spacing between cards on the product listing page shrinks by 8 pixels, making the layout feel cramped on mobile devices. No test catches this because no test was looking at visual output.

Visual regressions are changes in how a component looks that were not intentional. They can be caused by CSS changes, HTML restructuring, dependency updates, browser rendering engine updates, or even seemingly unrelated changes that affect the cascade. Unit tests verify logic. Type checks verify contracts. **Visual regression tests** verify appearance.

### 1.2 How visual regression testing works

The process is straightforward:

1. **Capture baseline screenshots.** For each component state (primary button, disabled button, loading button, error input, etc.), render the component in a browser and take a screenshot. These screenshots are committed to the repository as "golden" images — the known-good appearance.

2. **Capture current screenshots.** On every CI run, the same components are rendered and screenshotted using the same browser, viewport, and conditions.

3. **Compare pixel-by-pixel.** The current screenshot is compared against the baseline. If the difference exceeds a threshold, the test fails and produces a diff image showing exactly which pixels changed.

4. **Review and update.** If the visual change was intentional (you redesigned the button), update the baseline screenshots. If it was unintentional (a spacing regression), fix the code.

### 1.3 Playwright for visual regression

Playwright (which you learned in Lesson 12.10 and Module 20) has built-in screenshot comparison. The API is minimal:

```typescript
import { test, expect } from '@playwright/test';

test('Button primary renders correctly', async ({ page }) => {
    await page.goto('/docs/button');
    const button = page.locator('[data-testid="button-primary"]');
    await expect(button).toHaveScreenshot('button-primary.png', {
        maxDiffPixelRatio: 0.01
    });
});
```

`toHaveScreenshot()` takes a screenshot of the element, compares it against the stored baseline in `tests/__screenshots__/`, and fails if more than 1% of pixels differ. On the first run, when no baseline exists, Playwright creates the baseline and the test passes.

### 1.4 Threshold tuning

Pixel-perfect comparison is too strict. Different operating systems, browsers, and even display DPIs render fonts and anti-aliasing slightly differently. A test that passes on macOS might fail on the Linux CI runner because font rendering is subtly different.

Three threshold parameters control sensitivity:

- **`maxDiffPixels`** — the maximum number of pixels that can differ. Good for small components where you want strict comparison.
- **`maxDiffPixelRatio`** — the maximum percentage of pixels that can differ. Good for large components or full-page screenshots.
- **`threshold`** — per-pixel sensitivity (0 = exact match, 1 = any color difference is acceptable). A threshold of 0.2 ignores anti-aliasing differences while catching substantial color or layout changes.

For a design system, a good starting point is `maxDiffPixelRatio: 0.01` with `threshold: 0.2`. This catches layout changes and color changes while ignoring font rendering differences across platforms.

### 1.5 Handling dynamic content

Dynamic content causes false positives — screenshots differ not because the component changed, but because the content changed:

- **Timestamps.** A footer showing "Generated at 10:23:15" will differ on every run. Solution: mock the time or replace dynamic text with a static placeholder before screenshotting.
- **Animations.** A loading spinner will be in a different frame on each screenshot. Solution: disable animations via `prefers-reduced-motion: reduce` (which PE7 already handles globally) or wait for animations to complete.
- **Avatars and images.** User-generated content changes between runs. Solution: use deterministic seed data or mock images.

```typescript
test('Card component renders correctly', async ({ page }) => {
    // Disable animations
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // Set a fixed viewport for consistent rendering
    await page.setViewportSize({ width: 1280, height: 720 });
    // Navigate and wait for content to settle
    await page.goto('/docs/card');
    await page.waitForLoadState('networkidle');

    const card = page.locator('[data-testid="card-example"]');
    await expect(card).toHaveScreenshot('card-default.png');
});
```

### 1.6 CI integration

Visual regression tests run in CI (GitHub Actions, GitLab CI) on every pull request. The CI environment must match the baseline environment:

- Same browser version (Playwright pins browser versions).
- Same viewport size (set explicitly in tests).
- Same font rendering (use a Linux CI runner with installed fonts, or run Playwright in Docker).

When a visual test fails, the CI pipeline should:
1. Upload the diff images as artifacts so the reviewer can see what changed.
2. Block the PR merge until the developer either fixes the regression or updates the baselines.

### 1.7 "In Production" — visual regression at a design system team

A design system team with 40 components and 3 themes (light, dark, high-contrast) ran visual regression tests on every PR. They captured 120 screenshots per theme, 360 total. When a developer changed the border-radius token from `0.5rem` to `0.375rem`, the visual tests flagged 28 components that used that token. The developer reviewed the diffs, confirmed the change was intentional, and updated all 28 baselines in one commit. Without visual regression, the border-radius change would have shipped silently, and the design team would have noticed the inconsistency weeks later during a design review.

### 1.8 The TypeScript angle

A typed test helper for component screenshots:

```typescript
interface ScreenshotConfig {
    componentName: string;
    variant: string;
    viewport: { width: number; height: number };
    theme: 'light' | 'dark' | 'high-contrast';
    selector: string;
}

async function captureComponentScreenshot(
    page: Page,
    config: ScreenshotConfig
): Promise<void> {
    await page.setViewportSize(config.viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const element = page.locator(config.selector);
    const filename: string =
        `${config.componentName}-${config.variant}-${config.theme}.png`;
    await expect(element).toHaveScreenshot(filename, {
        maxDiffPixelRatio: 0.01,
        threshold: 0.2
    });
}
```

### 1.9 Common interview question

**Q: "What does visual regression testing catch that other types of testing miss?"**

**Model answer:** Visual regression tests catch changes in appearance that unit tests and type checks cannot detect. A CSS change that shifts spacing by 4 pixels, a font-weight change from 500 to 400, a color that shifts slightly due to a token update — these pass all logic tests but visibly change the product. Visual regression tests compare pixel-level screenshots against baselines, catching any unintentional visual change. They are especially valuable for design systems where visual consistency is the primary product promise.

## Deep Dive

**Component-level vs page-level screenshots.** Component-level screenshots isolate individual components and are faster to capture and easier to diagnose. Page-level screenshots capture the full composition, catching issues in spacing between components, alignment, and layout. Use both: component-level for the design system library, page-level for critical user-facing pages.

**Cross-browser visual testing.** Components can render differently in Chrome, Firefox, and Safari. Playwright supports all three engines. Capturing baselines in all three browsers triples the number of screenshots but catches browser-specific rendering issues. For a design system, Chrome-only visual tests catch most regressions; add Firefox and Safari for release validation.

**Snapshot update workflow.** When baselines need updating, run `npx playwright test --update-snapshots`. This regenerates all baselines. Review the changes in Git diff (Git can show image diffs) before committing. Never update baselines without reviewing — automatic updates can mask real regressions.

**Screenshot storage and Git.** Screenshots are binary files that Git stores inefficiently. For large design systems (500+ screenshots), consider Git LFS (Large File Storage) or an external screenshot service like Percy, Chromatic, or Argos CI. These services store screenshots externally and provide a web UI for visual comparison and approval.

**Connection to other lessons.** Lesson 12.10 introduced Playwright. Lesson 20.9 covered visual regression in the testing module. Lesson 23.4 built the documentation pages that serve as screenshot targets. Lesson 23.6 covers versioning, where visual changes should be reflected in changelogs.

## Going Deeper

**Official docs to read next:**

- [playwright.dev/docs/test-snapshots](https://playwright.dev/docs/test-snapshots) — Playwright visual comparison documentation.
- [playwright.dev/docs/ci](https://playwright.dev/docs/ci) — Playwright CI configuration.
- [chromatic.com](https://chromatic.com/) — Chromatic visual testing service (integrates with Storybook).

**Advanced pattern: visual testing per theme.** Loop over all themes in your test suite and capture screenshots for each one. This ensures that token changes in one theme do not break another.

**Challenge question (combines Lesson 23.5 + Lesson 23.7 + Lesson 23.4):** Your design system has 40 components and 4 themes. A designer changes the primary color token for the "dark" theme. How many screenshots potentially change? How would you structure your test suite to make reviewing the diffs manageable? What CI configuration ensures that only changed screenshots require human review?

## 2. Style it — PE7 applied to the visual diff viewer

The mini-build is a visual diff viewer showing "before" and "after" screenshots side by side. The image containers use `var(--color-surface-2)` with `var(--radius-md)`. A diff overlay highlights changed pixels in `var(--color-error)` at 50% opacity. The diff percentage badge uses `var(--color-error)` for failures and `var(--color-success)` for passes. Controls (threshold slider, component selector) use `var(--space-sm)` spacing. Layout stacks on mobile and shows side-by-side comparison at `min-width: 768px`.

## 3. Interact — comparing visual diffs with threshold adjustment

The problem: visual diff tools are opaque — you set a threshold but do not understand what it filters. The interactive element shows two simulated component screenshots side by side with an adjustable threshold slider. As the threshold changes, the diff overlay updates to show which pixels are flagged at that sensitivity level.

```typescript
interface DiffResult {
    componentName: string;
    totalPixels: number;
    diffPixels: number;
    diffPercentage: number;
    threshold: number;
    passed: boolean;
}
```

## 4. Mini-build — visual diff viewer

**File:** `src/routes/modules/23-design-system/05-visual-regression-ci/+page.svelte`

This page renders a visual diff viewer with simulated before/after component states. The student adjusts a threshold slider and sees how different sensitivity levels affect which changes are flagged as regressions.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/23-design-system/05-visual-regression-ci`.

### Prove the concept

1. View the "before" and "after" component renders side by side.
2. Adjust the threshold slider and watch the diff pixel count change — higher thresholds ignore more subtle differences.
3. Click different component examples to see various types of visual changes (spacing, color, border).
4. In Svelte DevTools, observe `$derived` recalculating the diff results as the threshold changes.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What type of bug does visual regression testing catch that unit tests miss?</summary>

Visual regressions — unintentional changes in appearance caused by CSS changes, HTML restructuring, token updates, or dependency changes. A unit test verifies logic (does the button call the click handler?), not appearance (did the button's border-radius change from 8px to 4px?). Visual regression tests compare pixel-level screenshots to catch any visual change.
</details>

<details>
<summary><strong>Q2.</strong> Why is pixel-perfect comparison (threshold = 0) usually too strict?</summary>

Different operating systems, browsers, and display settings render fonts, anti-aliasing, and sub-pixel details slightly differently. A component that renders identically to the human eye may have 0.1-0.5% pixel differences between macOS and Linux due to font hinting. Pixel-perfect comparison would flag these as failures, creating noisy false positives that erode trust in the test suite.
</details>

<details>
<summary><strong>Q3.</strong> How do you handle timestamps or animated content in visual regression tests?</summary>

For timestamps, mock the system time or replace dynamic text with static placeholders before screenshotting. For animations, enable `prefers-reduced-motion: reduce` (which disables animations via PE7's global CSS) or wait for animations to complete before capturing the screenshot. For any dynamic content, use deterministic seed data.
</details>

<details>
<summary><strong>Q4.</strong> Why must the CI environment match the baseline environment?</summary>

Visual regression tests compare screenshots pixel-by-pixel. If baselines were captured on macOS with its specific font rendering and the CI runs on Linux with different font rendering, every screenshot will differ slightly, producing false positives across the entire test suite. Using the same browser version, viewport size, and operating system (typically Linux in Docker) ensures consistent rendering.
</details>

<details>
<summary><strong>Q5.</strong> When should you update baselines vs fix the regression?</summary>

Update baselines when the visual change is intentional — you redesigned a component, changed a token, or updated a layout. Fix the regression when the change is unintentional — a CSS refactor accidentally changed spacing, a dependency update shifted colors. Always review diff images before updating baselines to confirm the change is expected.
</details>

## 6. Common mistakes

- **Not reviewing baseline updates before committing.** Running `--update-snapshots` regenerates all baselines. If a real regression exists, the baseline update masks it. Always review the Git diff of screenshot changes before committing.
- **Running visual tests only on one viewport size.** A component may look correct on desktop (1280px) but broken on mobile (375px). Capture screenshots at multiple viewport sizes to catch responsive layout regressions.
- **Not disabling animations before capture.** An animated component produces different screenshots on every run, causing constant false positives. Always use `prefers-reduced-motion: reduce` or wait for animations to complete.
- **Storing hundreds of screenshots in Git without LFS.** Screenshots are binary files that Git stores as full copies on every change. For large test suites, use Git LFS or an external screenshot service to avoid bloating the repository.

## 7. What's next

Lesson 23.6 introduces versioning and changelogs — how to communicate changes to consumers of your design system using semver and automated changelog generation.
