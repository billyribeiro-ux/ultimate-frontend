# Module 20 — Testing: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Split-screen: test file (left), terminal with test output (right). Show green/red test results prominently.

---

## Lesson 20.1 — Testing philosophy

**Duration:** 10 minutes
**Screen setup:** Slides for testing pyramid, editor for examples

### Hook (30 seconds)
"100% code coverage and a broken app. Zero tests and a working app. Coverage is not quality. This lesson establishes what to test, why, and at which level — so your test suite catches bugs without becoming a maintenance burden."

### Demo sequence
1. **[0:30-2:30] The testing pyramid** — Unit (fast, many), integration (medium, some), E2E (slow, few). Why this shape.
2. **[2:30-5:00] What to test** — Business logic: yes. Implementation details: no. User behavior: yes. Internal state: no.
3. **[5:00-7:00] Testing confidence** — Tests should give you confidence to refactor. If a test breaks on a refactor that does not change behavior, the test is wrong.
4. **[7:00-8:30] Build the mini-build** — Test decision tree: given a piece of code, which level of test is appropriate.
5. **[8:30-9:30] Edge case / gotcha** — "Do not test the framework. Svelte's reactivity works. Test YOUR logic that uses reactivity, not whether $state triggers updates."

### Key moments
- 0:30 — "Coverage is not quality"
- 2:30 — "What to test"
- 5:00 — "Refactor confidence"
- 7:00 — "Decision tree"
- 8:30 — "Don't test the framework"

### Callout graphics
- Testing pyramid
- Test decision tree
- What to test vs what not to test

### Outro (30 seconds)
"Test what matters, at the right level. Next lesson: Vitest configuration."

---

## Lesson 20.2 — Vitest configuration

**Duration:** 10 minutes
**Screen setup:** Editor with vitest.config.ts, terminal running tests

### Hook (30 seconds)
"Vitest shares Vite's config. Your path aliases, your plugins, your transforms — they all work in tests. Configuration is minimal because most of it is already done in vite.config.ts."

### Demo sequence
1. **[0:30-2:30] Default config** — Vitest works with zero config in a SvelteKit project. Show `pnpm vitest`.
2. **[2:30-5:00] Custom configuration** — vitest.config.ts for test-specific settings: environment, globals, coverage.
3. **[5:00-7:00] SvelteKit integration** — Resolve `$lib`, `$app`, `$env` aliases in tests. Use the Svelte plugin.
4. **[7:00-8:30] Build the mini-build** — Complete Vitest config for a SvelteKit project with coverage thresholds.
5. **[8:30-9:30] Edge case / gotcha** — "jsdom and happy-dom simulate the DOM in Node.js. They are not real browsers. Some browser APIs (IntersectionObserver, Web Animations) are not available — mock them."

### Key moments
- 0:30 — "Shared with Vite"
- 2:30 — "Custom settings"
- 5:00 — "SvelteKit aliases"
- 7:00 — "Complete config"
- 8:30 — "jsdom limitations"

### Callout graphics
- Config file anatomy
- SvelteKit alias resolution
- DOM environment options

### Outro (30 seconds)
"Vitest is configured and ready. Next lesson: unit testing stores."

---

## Lesson 20.3 — Unit testing stores (.svelte.ts)

**Duration:** 11 minutes
**Screen setup:** Editor with store and test file, terminal with test results

### Hook (30 seconds)
"Your cart store has addItem, removeItem, and a total getter. These are pure logic — no DOM, no components. Unit testing a .svelte.ts store is testing a class: call methods, check properties, verify behavior."

### Demo sequence
1. **[0:30-2:30] Testing reactive state** — Import the store. Call methods. Assert state values.
2. **[2:30-5:00] Testing computed values** — Add items, check the total getter. Verify it recalculates correctly.
3. **[5:00-7:30] Testing edge cases** — Empty cart, negative quantities, duplicate items. Show boundary testing.
4. **[7:30-9:30] Build the mini-build** — Full test suite for a task manager store.
5. **[9:30-10:30] Edge case / gotcha** — "Module-level stores are singletons. Tests share state unless you reset between tests. Create a fresh store instance in each test or use beforeEach cleanup."

### Key moments
- 0:30 — "Test the class"
- 2:30 — "Computed verification"
- 5:00 — "Edge case coverage"
- 7:30 — "Task manager tests"
- 9:30 — "Singleton state leak"

### Callout graphics
- Store test pattern
- Edge case categories
- Test isolation

### Outro (30 seconds)
"Store tests verify logic without DOM. Next lesson: component testing."

---

## Lesson 20.4 — Component testing

**Duration:** 11 minutes
**Screen setup:** Editor with component test, terminal showing results

### Hook (30 seconds)
"A component renders a button. When clicked, the count increments. The test renders the component, clicks the button, and verifies the count changed. Component testing verifies that your template, state, and events work together."

### Demo sequence
1. **[0:30-2:30] Rendering a component** — Use @testing-library/svelte to render. Query the DOM.
2. **[2:30-5:00] Interaction** — fireEvent.click, type into inputs, submit forms. Assert the DOM changes.
3. **[5:00-7:30] Props and events** — Test with different prop values. Verify callback props are called.
4. **[7:30-9:30] Build the mini-build** — Test suite for a SearchInput component: typing, clearing, debounce.
5. **[9:30-10:30] Edge case / gotcha** — "Query by role, label, or test ID — not by CSS class or tag name. Class-based queries break on refactors. Role-based queries match user experience."

### Key moments
- 0:30 — "Render, interact, assert"
- 2:30 — "User interactions"
- 5:00 — "Props and callbacks"
- 7:30 — "SearchInput tests"
- 9:30 — "Query by role, not class"

### Callout graphics
- Component test anatomy
- Query priority guide
- Interaction patterns

### Outro (30 seconds)
"Component tests verify rendering and interaction. Next lesson: testing async components."

---

## Lesson 20.5 — Async components

**Duration:** 10 minutes
**Screen setup:** Editor with async component test, terminal

### Hook (30 seconds)
"Your component fetches data on mount. The test renders it — but the data has not arrived yet. Testing async components requires waiting for promises, handling loading states, and verifying the final rendered output."

### Demo sequence
1. **[0:30-2:30] The async challenge** — Component renders loading state first, then data. Test must wait.
2. **[2:30-5:00] waitFor and findBy** — Use waitFor to wait for async updates. findByText waits automatically.
3. **[5:00-7:00] Mocking fetch** — Mock the fetch call to control the response. Test success and error paths.
4. **[7:00-8:30] Build the mini-build** — Test suite for a UserProfile that loads data asynchronously.
5. **[8:30-9:30] Edge case / gotcha** — "Async tests can timeout. Set appropriate timeout values. If your test flakes, the component likely has a race condition — fix the component, not the test."

### Key moments
- 0:30 — "Data arrives after render"
- 2:30 — "waitFor and findBy"
- 5:00 — "Mocking fetch"
- 7:00 — "UserProfile tests"
- 8:30 — "Flaky test diagnosis"

### Callout graphics
- Async test timeline
- waitFor usage patterns
- Mock fetch setup

### Outro (30 seconds)
"Async testing waits for data and verifies the result. Next lesson: testing form actions and API routes."

---

## Lesson 20.6 — Form actions & API route testing

**Duration:** 11 minutes
**Screen setup:** Editor with action/API tests, terminal

### Hook (30 seconds)
"Your form action validates input, queries the database, and returns errors or success. Testing it means calling the action function directly with a mock event — no browser, no form submission, just the server-side logic."

### Demo sequence
1. **[0:30-2:30] Testing form actions** — Import the action. Create a mock RequestEvent. Call the action. Assert the result.
2. **[2:30-5:00] Testing API routes** — Import the GET/POST handler. Create a mock Request. Assert the Response.
3. **[5:00-7:30] Mocking dependencies** — Mock database calls, authentication, external APIs. Test the action logic in isolation.
4. **[7:30-9:30] Build the mini-build** — Test suite for a registration action: valid input, duplicate email, weak password.
5. **[9:30-10:30] Edge case / gotcha** — "SvelteKit's error() and redirect() throw exceptions. Test for them with expect(...).rejects.toThrow() or try/catch."

### Key moments
- 0:30 — "Test server logic directly"
- 2:30 — "API route testing"
- 5:00 — "Mocking dependencies"
- 7:30 — "Registration action"
- 9:30 — "error() throws exceptions"

### Callout graphics
- Action test anatomy
- Mock event factory
- Error/redirect testing

### Outro (30 seconds)
"Form actions and API routes are testable as plain functions. Next lesson: Playwright fundamentals."

---

## Lesson 20.7 — Playwright fundamentals

**Duration:** 11 minutes
**Screen setup:** Editor with Playwright test, browser showing automated interaction

### Hook (30 seconds)
"Playwright launches a real browser. It navigates to your app. It clicks buttons, fills forms, reads text. It verifies that your entire application works end-to-end — not just isolated units, but the complete user experience."

### Demo sequence
1. **[0:30-2:30] Setup** — Install Playwright. Configure with SvelteKit. Run the first test.
2. **[2:30-5:00] Locators** — page.getByRole, page.getByText, page.getByTestId. Show reliable element selection.
3. **[5:00-7:30] Assertions** — expect(locator).toBeVisible, toHaveText, toHaveCount. Show built-in waiting.
4. **[7:30-9:30] Build the mini-build** — E2E test for a todo app: add, complete, delete items.
5. **[9:30-10:30] Edge case / gotcha** — "Playwright auto-waits for elements. Do not add manual sleeps. If you need a sleep, your locator is wrong."

### Key moments
- 0:30 — "Real browser testing"
- 2:30 — "Locator strategies"
- 5:00 — "Auto-waiting assertions"
- 7:30 — "Todo app E2E"
- 9:30 — "No manual sleeps"

### Callout graphics
- Playwright architecture
- Locator priority guide
- Auto-wait mechanism

### Outro (30 seconds)
"Playwright tests your entire app in a real browser. Next lesson: E2E user flows."

---

## Lesson 20.8 — E2E flows

**Duration:** 11 minutes
**Screen setup:** Editor with E2E flow test, browser showing the journey

### Hook (30 seconds)
"A user signs up, creates a project, adds a team member, and publishes. That is a user flow — a sequence of actions that achieves a goal. E2E flow tests verify these multi-step journeys work correctly from start to finish."

### Demo sequence
1. **[0:30-2:30] Flow vs unit test** — A flow test covers multiple pages, actions, and states. Show the journey scope.
2. **[2:30-5:00] Page objects** — Encapsulate page interactions in classes. LoginPage.login(), DashboardPage.createProject().
3. **[5:00-7:30] Test data management** — Create test data before the flow. Clean up after. Use API calls for setup, not UI.
4. **[7:30-9:30] Build the mini-build** — E2E flow: sign up → create post → publish → verify on public page.
5. **[9:30-10:30] Edge case / gotcha** — "E2E tests are slow. Run them in CI, not during development. Target critical paths only — do not E2E-test every feature."

### Key moments
- 0:30 — "Multi-step user journeys"
- 2:30 — "Page objects"
- 5:00 — "Test data management"
- 7:30 — "Sign up to publish"
- 9:30 — "Critical paths only"

### Callout graphics
- User flow diagram
- Page object pattern
- Test data lifecycle

### Outro (30 seconds)
"E2E flows verify complete user journeys. Next lesson: visual regression testing."

---

## Lesson 20.9 — Visual regression

**Duration:** 10 minutes
**Screen setup:** Editor with screenshot test, browser showing diff viewer

### Hook (30 seconds)
"A CSS change shifts a button 2 pixels to the right. No test fails. No type error. But the layout looks wrong. Visual regression tests take screenshots, compare them pixel-by-pixel, and fail when the appearance changes unintentionally."

### Demo sequence
1. **[0:30-2:30] toHaveScreenshot** — Playwright's built-in screenshot comparison. Create a baseline, compare on each run.
2. **[2:30-5:00] Threshold tuning** — maxDiffPixelRatio for anti-aliasing tolerance. Show false positives and how to fix them.
3. **[5:00-7:00] Dynamic content** — Hide timestamps, mask avatars, freeze animations. Prevent false failures.
4. **[7:00-8:30] Build the mini-build** — Visual regression suite for a component library: button states, card variants.
5. **[8:30-9:30] Edge case / gotcha** — "Screenshots differ between operating systems due to font rendering. Run visual tests in Docker or CI with a fixed OS to ensure consistency."

### Key moments
- 0:30 — "Catching visual bugs"
- 2:30 — "Threshold tuning"
- 5:00 — "Dynamic content masking"
- 7:00 — "Component library suite"
- 8:30 — "Cross-OS differences"

### Callout graphics
- Screenshot comparison visualization
- Threshold tuning guide
- Dynamic content masking strategies

### Outro (30 seconds)
"Visual regression catches what other tests miss. Last lesson: CI/CD pipeline."

---

## Lesson 20.10 — CI/CD pipeline

**Duration:** 11 minutes
**Screen setup:** Editor with GitHub Actions workflow, GitHub UI showing pipeline

### Hook (30 seconds)
"Every push runs your tests. Every PR shows green or red. Failed tests block the merge. A CI/CD pipeline automates quality gates — lint, type check, unit tests, E2E tests, build, deploy — so bugs never reach production."

### Demo sequence
1. **[0:30-2:30] GitHub Actions basics** — Workflow file, triggers, jobs, steps. Show a minimal pipeline.
2. **[2:30-5:00] SvelteKit pipeline** — Install, lint, type-check, unit test, build, E2E test. Show the full pipeline.
3. **[5:00-7:30] Caching** — Cache node_modules and Playwright browsers. Show time savings.
4. **[7:30-9:30] Build the mini-build** — Complete CI workflow for a SvelteKit project.
5. **[9:30-10:30] Edge case / gotcha** — "Playwright tests need a running server. Use `webServer` config in playwright.config.ts to start the dev or preview server before tests."

### Key moments
- 0:30 — "Automated quality gates"
- 2:30 — "Full SvelteKit pipeline"
- 5:00 — "Caching for speed"
- 7:30 — "Complete workflow"
- 9:30 — "webServer for Playwright"

### Callout graphics
- Pipeline stages diagram
- Caching strategy
- GitHub Actions status checks

### Outro (30 seconds)
"A CI/CD pipeline automates quality enforcement. Module 20 is complete — you have a comprehensive testing strategy from unit tests to CI/CD."

---
