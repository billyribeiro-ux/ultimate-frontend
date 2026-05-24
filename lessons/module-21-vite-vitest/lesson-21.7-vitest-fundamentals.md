---
module: 21
lesson: 21.7
title: Vitest fundamentals
duration: 55 minutes
prerequisites:
  - "21.1 — What Vite actually does"
  - "12.9 — Testing with Vitest"
  - "20.1 — Testing philosophy"
learning_objectives:
  - Explain why Vitest uses Vite's transform pipeline and what advantages this provides over Jest
  - Configure vitest.config.ts or reuse vite.config.ts for test settings
  - Write tests using describe, it/test, and expect with proper TypeScript typing
  - Use beforeEach, afterEach, beforeAll, and afterAll lifecycle hooks correctly
  - Apply matchers including toBe, toEqual, toContain, toThrow, toMatchObject, and toHaveProperty
status: ready
---

# Lesson 21.7 — Vitest fundamentals

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Testing at the speed of your dev server

### 1.1 The problem: test runners that do not understand your code

Jest was the dominant test runner for years. But Jest was built for a different era — it uses its own module resolution, its own transform pipeline, and its own config format. When you use SvelteKit with TypeScript, Vite plugins, path aliases, and virtual modules, Jest does not understand any of it out of the box. You end up maintaining two parallel build configurations: one for Vite (your app) and one for Jest (your tests). They drift apart, causing tests to pass locally but fail in CI, or tests to fail on code that works perfectly in the browser.

**Vitest** solves this by reusing Vite's transform pipeline directly. When Vitest runs your tests, it uses the same `vite.config.ts`, the same plugins, the same path aliases, and the same TypeScript handling as your dev server. There is no second configuration to maintain. If your code runs in `pnpm dev`, it runs in `pnpm vitest`. The environments are identical.

### 1.2 Why Vitest over Jest

Five concrete advantages:

1. **Shared config.** Vitest reads your `vite.config.ts`. Path aliases like `$lib`, virtual modules like `virtual:build-info`, and plugin transforms all work automatically in tests.
2. **Native ESM.** Vitest runs tests as ES modules natively. No `--experimental-vm-modules` flag, no babel transforms, no CJS/ESM interop headaches.
3. **Speed.** Vitest uses Vite's file watching and transform caching. Re-running a test after changing one file takes milliseconds because only the changed module is re-transformed.
4. **Built-in TypeScript.** Vitest strips TypeScript using Vite's esbuild integration. No `ts-jest` plugin, no separate `tsconfig` for tests.
5. **API compatibility.** Vitest's API is compatible with Jest's. If you know `describe`, `it`, `expect`, and `vi.fn()`, you know Vitest. Migration from Jest is mostly mechanical — replace `jest` with `vi` and update the config.

### 1.3 Configuration: vitest.config.ts vs vite.config.ts

You have two options for configuring Vitest:

**Option A: extend vite.config.ts.** Add a `test` section to your existing Vite config:

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [sveltekit()],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        environment: 'jsdom',
        globals: true
    }
});
```

**Option B: separate vitest.config.ts.** Create a dedicated config that merges from the Vite config:

```typescript
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        environment: 'jsdom'
    }
}));
```

Option A is simpler. Option B is useful when your test config diverges significantly from your dev config (different plugins, different environment settings).

### 1.4 The test runner lifecycle

Vitest organizes tests with `describe` (group), `it` or `test` (individual test), and lifecycle hooks:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('formatCurrency', () => {
    let formatter: Intl.NumberFormat;

    beforeEach(() => {
        formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        });
    });

    afterEach(() => {
        // Clean up after each test
    });

    it('formats positive amounts', () => {
        expect(formatter.format(42.5)).toBe('$42.50');
    });

    it('formats zero', () => {
        expect(formatter.format(0)).toBe('$0.00');
    });
});
```

- **`beforeEach`** — runs before every `it` in the `describe` block. Use for setup that each test needs fresh (creating objects, resetting state).
- **`afterEach`** — runs after every `it`. Use for cleanup (removing listeners, clearing mocks).
- **`beforeAll`** — runs once before all tests in the `describe` block. Use for expensive setup (database connections, file reads).
- **`afterAll`** — runs once after all tests. Use for teardown of shared resources.

### 1.5 Matchers deep dive

Matchers are methods on the `expect` object that assert conditions:

**`toBe(value)`** — strict equality (`===`). Use for primitives (numbers, strings, booleans). Does not work for objects (two objects with the same properties are not `===` equal).

```typescript
expect(2 + 2).toBe(4);
expect('hello').toBe('hello');
```

**`toEqual(value)`** — deep equality. Recursively compares object properties. Use for objects and arrays.

```typescript
expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 }); // passes
expect([1, 2, 3]).toEqual([1, 2, 3]); // passes
```

**`toContain(item)`** — checks if an array includes an item or a string includes a substring.

```typescript
expect([1, 2, 3]).toContain(2);
expect('hello world').toContain('world');
```

**`toThrow(message?)`** — asserts that a function throws an error. Wrap the call in a function:

```typescript
expect(() => { throw new Error('oops'); }).toThrow('oops');
```

**`toMatchObject(subset)`** — asserts that an object contains the expected subset of properties. Extra properties are allowed.

```typescript
expect({ a: 1, b: 2, c: 3 }).toMatchObject({ a: 1, b: 2 }); // passes
```

**`toHaveProperty(path, value?)`** — asserts that an object has a property at the given path. Supports dot notation for nested properties.

```typescript
expect({ user: { name: 'Ada' } }).toHaveProperty('user.name', 'Ada');
```

### 1.6 Negation and asymmetric matchers

Prefix any matcher with `.not` to negate it:

```typescript
expect(42).not.toBe(0);
expect([1, 2]).not.toContain(3);
```

**Asymmetric matchers** let you assert partial conditions inside `toEqual` or `toMatchObject`:

```typescript
expect({ id: 123, name: 'Ada', createdAt: '2026-01-01' }).toEqual({
    id: expect.any(Number),
    name: expect.stringContaining('Ada'),
    createdAt: expect.any(String)
});
```

### 1.7 Running tests

```bash
pnpm vitest           # watch mode — re-runs on file changes
pnpm vitest run       # single run — exits after tests complete
pnpm vitest run --reporter=verbose  # detailed output
pnpm vitest --coverage  # with coverage report
```

In watch mode, Vitest uses Vite's file watcher to detect changes and re-runs only the tests affected by the change. This is dramatically faster than re-running the entire suite.

### 1.8 "In production" — why Vitest's shared config prevented a week-long debugging session

A team using Jest for a SvelteKit project had tests that imported from `$lib/utils/format`. Jest did not understand the `$lib` alias, so they added a `moduleNameMapper` in `jest.config.ts` to replicate Vite's alias resolution. This worked until someone added a new alias in `vite.config.ts` and forgot to update `jest.config.ts`. Tests passed with the old alias mapping, but the actual app used the new one — a different module with different behavior. The bug was deployed to production and took three days to diagnose because the tests were green. Switching to Vitest eliminated this category of bug entirely: aliases, plugins, and transforms are shared between the app and the test runner.

### 1.9 The TypeScript angle

Vitest's API is fully typed. When you write `expect(value)`, TypeScript knows the type of `value` and constrains the available matchers. For example, `expect(42).toContain(2)` would show a TypeScript warning because `toContain` is meant for arrays and strings, not numbers. The `vi.fn<[string, number], boolean>()` syntax types mock functions with their parameter and return types. Global type declarations live in `vitest/globals` — if you enable `globals: true` in the config, add `"types": ["vitest/globals"]` to your `tsconfig.json`.

### 1.10 Common interview question

**Q: "Why would you choose Vitest over Jest for a SvelteKit project, and what concrete benefits does it provide?"**

**Model answer:** Vitest reuses Vite's transform pipeline, which means it shares the same `vite.config.ts`, path aliases, plugin transforms, and TypeScript handling as the dev server. This eliminates the dual-configuration problem where Jest needs its own module resolution, transform setup, and alias mapping that can drift from the real app configuration. Concrete benefits: (1) `$lib` and other SvelteKit aliases work without extra config, (2) virtual modules from Vite plugins are available in tests, (3) TypeScript is handled by esbuild without `ts-jest`, (4) native ESM support without experimental flags, and (5) watch mode re-runs only affected tests using Vite's module graph, making the feedback loop near-instant. The API is Jest-compatible, so migration is straightforward.

## Deep Dive

**How Vitest uses Vite internally.** Vitest creates a Vite dev server instance per test file (or a shared one in `--pool=threads` mode). Each test file is treated as a Vite entry point: Vitest resolves its imports using Vite's plugin pipeline, transforms TypeScript and Svelte files using the same plugins, and evaluates the result in a JavaScript runtime (Node.js, jsdom, or happy-dom). This is why Vitest can run Svelte component tests — the Svelte plugin compiles components during the test run, just like it would in `pnpm dev`.

**Test isolation and parallelism.** By default, Vitest runs test files in parallel using worker threads. Each worker gets its own module scope, so global state does not leak between test files. Within a single file, tests run sequentially in order. You can control parallelism with `test.pool` (`'threads'` or `'forks'`) and `test.poolOptions`. Use `--sequence.concurrent` to run tests within a file in parallel (useful when tests are independent).

**Environment options.** Vitest supports multiple test environments: `'node'` (default, no DOM), `'jsdom'` (simulated DOM), `'happy-dom'` (faster simulated DOM), and custom environments. For Svelte component tests that render DOM, use `'jsdom'` or `'happy-dom'`. For pure logic tests (utility functions, stores), `'node'` is fastest. You can set the environment per file using a comment at the top: `// @vitest-environment jsdom`.

**Coverage providers.** Vitest supports two coverage providers: `v8` (built into Node.js, fastest, uses V8's built-in coverage) and `istanbul` (more accurate but slower, instruments code at the transform level). Configure with `test.coverage.provider`. For most projects, `v8` is sufficient. Use `istanbul` when you need more precise branch coverage tracking.

**Connection to other lessons.** Lesson 20.2 covered Vitest configuration in the testing module. This lesson provides deeper context on why Vitest's architecture works the way it does. Lesson 21.8 covers mocking and spying. Lesson 21.9 covers snapshot testing.

## Going Deeper

**Official docs to read next:**

- [vitest.dev/guide](https://vitest.dev/guide/) — Vitest getting started guide.
- [vitest.dev/api](https://vitest.dev/api/) — full API reference for `describe`, `it`, `expect`, and all matchers.
- [vitest.dev/config](https://vitest.dev/config/) — configuration options reference.

**Advanced pattern: typed test factories.** When many tests need the same data shape, create a factory function that returns typed test fixtures:

```typescript
function createUser(overrides: Partial<User> = {}): User {
    return {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        ...overrides
    };
}

it('displays user name', () => {
    const user: User = createUser({ name: 'Ada' });
    expect(formatGreeting(user)).toBe('Hello, Ada!');
});
```

**Challenge question (combines Lesson 21.7 + Lesson 21.8 + Lesson 20.1):** You have a utility function `calculateDiscount(price: number, userTier: string): number` that calls an API to get the discount percentage for a user tier. Write a test that mocks the API call, verifies the discount calculation, and handles the error case where the API fails. Describe which Vitest features you would use and why.

## 2. Style it — PE7 applied to the test dashboard

The mini-build is a test dashboard. Pass indicators use `var(--color-success)`, fail indicators use `var(--color-error)`, and skip indicators use `var(--color-warning)`. Test names use `var(--text-sm)` monospace font. The dashboard uses `var(--color-surface-2)` cards with `var(--radius-lg)` and `var(--shadow-sm)`.

## 3. Interact — running simulated tests and seeing results

The problem: understanding test output requires seeing it in context, not just reading about it.

```typescript
interface TestResult {
    id: string;
    name: string;
    suite: string;
    passed: boolean;
    duration: number;
    error: string | null;
}
```

The interactive element runs simulated tests and displays results with pass/fail indicators, durations, and error messages. Students can add new test cases and see how they affect the suite summary.

## 4. Mini-build — Test results dashboard

**File:** `src/routes/modules/21-vite-vitest/07-vitest-fundamentals/+page.svelte`

This page displays a simulated test results dashboard. Students see test suites with pass/fail results, durations, and error details. They can add simulated test cases and run the suite.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/21-vite-vitest/07-vitest-fundamentals`.

### Prove the concept

1. Create a file `src/lib/utils/math.test.ts` with a simple test:
   ```typescript
   import { describe, it, expect } from 'vitest';
   describe('addition', () => {
       it('adds two numbers', () => {
           expect(1 + 1).toBe(2);
       });
   });
   ```
2. Run `pnpm vitest run` and see the test pass.
3. Change the expected value to `3` and run again — see the test fail with a diff.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does Vitest share Vite's transform pipeline instead of using its own?</summary>

Sharing the pipeline ensures tests run code through exactly the same transforms as the dev server — same path aliases, same plugins, same TypeScript handling. This eliminates configuration drift between the app and test runner, preventing bugs where tests pass but the app behaves differently.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between toBe and toEqual?</summary>

`toBe` uses strict equality (`===`). It works for primitives but fails for objects because two objects with identical properties are not the same reference. `toEqual` performs deep comparison, recursively checking that all properties match. Use `toBe` for numbers, strings, and booleans; use `toEqual` for objects and arrays.
</details>

<details>
<summary><strong>Q3.</strong> When would you use beforeAll instead of beforeEach?</summary>

`beforeAll` runs once before all tests in the block. Use it for expensive setup that can be shared across tests (database connections, reading large fixture files). `beforeEach` runs before every individual test. Use it for setup that each test needs fresh (creating new objects, resetting mutable state) to prevent tests from interfering with each other.
</details>

<details>
<summary><strong>Q4.</strong> What does the toMatchObject matcher do that toEqual does not?</summary>

`toMatchObject` checks that the received object contains the expected subset of properties, ignoring extra properties. `toEqual` requires an exact match — all properties must match and no extra properties are allowed. `toMatchObject` is useful for asserting on API responses where you only care about specific fields.
</details>

<details>
<summary><strong>Q5.</strong> How does Vitest's watch mode know which tests to re-run?</summary>

Vitest uses Vite's module graph to track dependencies. When a file changes, Vitest traces the graph to find which test files import the changed module (directly or transitively) and re-runs only those test files. This is much faster than re-running the entire suite because most test files are unaffected by a typical change.
</details>

## 6. Common mistakes

- **Using toBe for object comparison.** `expect({ a: 1 }).toBe({ a: 1 })` fails because the two objects are different references. Use `toEqual` for object comparison.
- **Forgetting to wrap throwing code in a function.** `expect(throwingFn()).toThrow()` executes the function before `expect` receives it, causing an unhandled error. Write `expect(() => throwingFn()).toThrow()` to defer execution.
- **Not cleaning up in afterEach.** If a test modifies global state (timers, DOM, event listeners) and does not clean up, subsequent tests see stale state. Always pair setup with cleanup.
- **Running pnpm vitest without the run flag in CI.** `pnpm vitest` starts watch mode, which never exits. Use `pnpm vitest run` in CI pipelines to get a single run that exits with a status code.

## 7. What's next

Lesson 21.8 introduces mocking and spying — `vi.fn()`, `vi.spyOn()`, and `vi.mock()` — for testing code that depends on external services, APIs, and timers.
