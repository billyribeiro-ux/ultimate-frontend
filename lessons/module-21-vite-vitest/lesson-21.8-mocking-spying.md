---
module: 21
lesson: 21.8
title: Mocking and spying
duration: 55 minutes
prerequisites:
  - "21.7 — Vitest fundamentals"
  - "20.3 — Unit testing .svelte.ts stores"
  - "5.2 — JS functions deeply"
learning_objectives:
  - Create mock functions with vi.fn() and verify they were called with expected arguments
  - Spy on existing methods with vi.spyOn() without replacing their implementation
  - Mock entire modules with vi.mock() including SvelteKit's $app modules
  - Use timer mocking to test time-dependent code deterministically
  - Apply the testing trophy principle to decide when mocking is appropriate vs when to use real implementations
status: ready
---

# Lesson 21.8 — Mocking and spying

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Controlling the uncontrollable

### 1.1 The problem: code that depends on the outside world

Your SvelteKit application calls APIs, reads from databases, navigates between pages, sets timers, and generates random numbers. When you write tests for code that does these things, you face a fundamental problem: the outside world is unpredictable. An API might be slow, down, or return different data each time. A timer might make your test take 10 seconds instead of 10 milliseconds. A random number makes assertions impossible.

**Mocking** replaces these unpredictable dependencies with controlled substitutes. Instead of calling the real API, your test provides a fake function that returns exactly the data you specify. Instead of waiting for a real timer, your test advances time programmatically. Mocking makes tests fast, deterministic, and independent of external services.

### 1.2 vi.fn() — creating mock functions

`vi.fn()` creates a new function that records every call made to it — the arguments, the return value, the number of times it was called, and the order relative to other mocks:

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('notification service', () => {
    it('calls the callback with the message', () => {
        const callback = vi.fn();

        sendNotification('Hello', callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('Hello');
    });
});
```

You can also provide a mock implementation:

```typescript
const fetchUser = vi.fn().mockResolvedValue({
    id: '1',
    name: 'Ada Lovelace'
});

const user = await fetchUser('1');
expect(user.name).toBe('Ada Lovelace');
```

Key mock matchers:
- `toHaveBeenCalled()` — the function was called at least once
- `toHaveBeenCalledTimes(n)` — called exactly n times
- `toHaveBeenCalledWith(arg1, arg2)` — called with specific arguments
- `toHaveBeenLastCalledWith(arg)` — the most recent call used these arguments
- `toHaveReturnedWith(value)` — returned a specific value

### 1.3 vi.spyOn() — watching without replacing

Sometimes you want to observe a function's behavior without changing it. `vi.spyOn()` wraps an existing method, recording calls while still executing the original implementation:

```typescript
const consoleSpy = vi.spyOn(console, 'warn');

logDeprecationWarning('oldFunction');

expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining('deprecated')
);

consoleSpy.mockRestore(); // restore the original
```

You can also override the implementation with `.mockImplementation()` while keeping the spy's recording behavior. Always call `.mockRestore()` in `afterEach` to prevent spies from leaking between tests.

### 1.4 vi.mock() — replacing entire modules

`vi.mock()` replaces an entire module's exports with mock implementations. This is essential for testing code that imports from SvelteKit modules:

```typescript
import { goto } from '$app/navigation';
import { vi, describe, it, expect } from 'vitest';

vi.mock('$app/navigation', () => ({
    goto: vi.fn()
}));

describe('logout', () => {
    it('redirects to login page', async () => {
        await performLogout();

        expect(goto).toHaveBeenCalledWith('/login');
    });
});
```

`vi.mock()` is **hoisted** — Vitest moves it to the top of the file before any imports, so the mock is in place when the tested module loads. This is why you write `vi.mock()` at the top level, not inside `describe` or `it`.

### 1.5 Mocking fetch

Network requests are the most common thing to mock. Vitest provides `vi.stubGlobal()` to replace global functions:

```typescript
const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: [1, 2, 3] })
});

vi.stubGlobal('fetch', mockFetch);

const result = await loadData();

expect(mockFetch).toHaveBeenCalledWith('/api/data');
expect(result).toEqual([1, 2, 3]);

vi.unstubAllGlobals();
```

Always unstub globals in `afterEach` to prevent test pollution.

### 1.6 Timer mocking

Code that uses `setTimeout`, `setInterval`, or `Date.now()` is hard to test because it depends on real time. Vitest's fake timers give you control:

```typescript
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('calls the function after the delay', () => {
        const callback = vi.fn();
        const debounced = debounce(callback, 300);

        debounced();
        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(300);
        expect(callback).toHaveBeenCalledTimes(1);
    });
});
```

Key timer methods:
- `vi.useFakeTimers()` — replaces `setTimeout`, `setInterval`, `Date` with fakes
- `vi.advanceTimersByTime(ms)` — advances the clock by the specified milliseconds
- `vi.runAllTimers()` — fast-forwards until all pending timers have fired
- `vi.useRealTimers()` — restores the real timer functions

### 1.7 When to mock and when not to

The **testing trophy** (Kent C. Dodds's variation of the testing pyramid) advocates for more integration tests and fewer unit tests with mocks. The rationale: mocks verify that you call the mock correctly, not that the real dependency works correctly. Over-mocking creates tests that pass even when the real integration is broken.

**Mock when:**
- The dependency is external (API, database, third-party service)
- The dependency is slow (network requests, file I/O)
- The dependency is non-deterministic (random numbers, current time)
- The dependency has side effects (sending emails, charging credit cards)

**Do not mock when:**
- The code is a pure function (no side effects — just test it directly)
- The dependency is internal and fast (utility functions, data transformers)
- Mocking would make the test longer and harder to understand than using the real thing

### 1.8 "In production" — when over-mocking hid a production bug

A team mocked their date formatting library in tests: `vi.mock('date-fns', () => ({ format: vi.fn().mockReturnValue('Jan 1, 2026') }))`. Tests passed. But the real `format` function was called with a `Date` object in the component and a string in the utility function. The mock accepted both without complaint. In production, the utility crashed because `format()` received a string instead of a `Date`. The mock hid the type mismatch. After the incident, the team adopted a rule: never mock pure functions. They only mock external I/O (fetch, navigation, timers). Pure functions are tested with real implementations because they are fast and deterministic by nature.

### 1.9 The TypeScript angle

Vitest's `vi.fn()` accepts a type parameter for the function signature:

```typescript
const mockFetch = vi.fn<[url: string], Promise<Response>>();
```

This tells TypeScript that the mock expects one string argument and returns `Promise<Response>`. If a test calls `mockFetch(42)`, TypeScript errors because `42` is not a string. Typed mocks catch argument mismatches at compile time, preventing the exact category of bugs described in the production sidebar.

For module mocks, TypeScript knows the original module's types. When you write `vi.mock('$app/navigation')`, the mock must match the module's exported types, or TypeScript will flag the discrepancy.

### 1.10 Common interview question

**Q: "What is the difference between vi.fn(), vi.spyOn(), and vi.mock()? When would you use each?"**

**Model answer:** `vi.fn()` creates a standalone mock function from scratch — use it when you need a callback or dependency injection parameter that you control entirely. `vi.spyOn()` wraps an existing method on an object, recording calls while optionally replacing the implementation — use it when you want to observe behavior without fully replacing the function (e.g., spying on `console.warn`). `vi.mock()` replaces an entire module's exports — use it when the tested code imports from a module you need to control (e.g., mocking `$app/navigation` to test navigation behavior without a real router). The key distinction is scope: `vi.fn()` is a single function, `vi.spyOn()` is a method on an object, and `vi.mock()` is an entire module.

## Deep Dive

**How vi.mock() hoisting works.** When Vitest encounters `vi.mock('module')`, it transforms the test file during compilation to move the mock declaration before all import statements. This is necessary because ES module imports are live bindings — the mock must be in place before the tested module is loaded, or the tested module will import the real module. Vitest uses a Vite plugin transform to achieve this. The hoisting has an important implication: the factory function passed to `vi.mock()` cannot reference variables declared in the test file (because those variables are not yet initialized when the mock runs). If you need dynamic values, use `vi.mock()` with `vi.mocked()` and set return values inside your test:

```typescript
vi.mock('$app/navigation');
import { goto } from '$app/navigation';

it('navigates', async () => {
    vi.mocked(goto).mockResolvedValue(undefined);
    // ...
});
```

**Mock reset vs restore vs clear.** Three methods control mock lifecycle: `mockClear()` resets call history (`.calls`, `.results`) but keeps the mock implementation. `mockReset()` clears history AND resets the implementation to a no-op function. `mockRestore()` clears everything and restores the original implementation (only works for `vi.spyOn()`). Use `vi.restoreAllMocks()` in a global `afterEach` to prevent leaks.

**Mocking ES modules with exports.** When a module uses named exports, `vi.mock()` must provide all the exports the tested code uses. If it uses a default export, provide `default`. For modules with both:

```typescript
vi.mock('./utils', () => ({
    default: vi.fn(),
    formatDate: vi.fn().mockReturnValue('2026-01-01'),
    parseDate: vi.fn()
}));
```

**Testing asynchronous mocks.** `mockResolvedValue(value)` is shorthand for `mockImplementation(() => Promise.resolve(value))`. For testing error paths, use `mockRejectedValue(error)`. Chain multiple return values with `mockResolvedValueOnce(first).mockResolvedValueOnce(second)` — the first call returns `first`, the second returns `second`, and subsequent calls return the default.

**Connection to other lessons.** Lesson 20.4 uses mocking for component tests. Lesson 21.7 introduced the testing fundamentals that mocking builds on. Lesson 21.9 covers snapshot testing, which captures the output of components rendered with mocked dependencies.

## Going Deeper

**Official docs to read next:**

- [vitest.dev/api/vi](https://vitest.dev/api/vi) — the full `vi` utility reference.
- [vitest.dev/guide/mocking](https://vitest.dev/guide/mocking) — mocking guide with examples for modules, timers, and globals.
- [vitest.dev/api/mock](https://vitest.dev/api/mock) — mock function API (`.mockReturnValue`, `.mockImplementation`, etc.).

**Advanced pattern: factory mocks with per-test overrides.** Create a mock factory in a shared test utility file:

```typescript
// tests/mocks/navigation.ts
import { vi } from 'vitest';
export function mockNavigation() {
    vi.mock('$app/navigation', () => ({
        goto: vi.fn(),
        invalidateAll: vi.fn()
    }));
}
```

Import and call it in tests that need navigation mocking. This prevents duplicate mock definitions and ensures consistency across test files.

**Challenge question (combines Lesson 21.8 + Lesson 21.7 + Lesson 20.1):** You are testing a `CartStore` class that calls `fetch('/api/cart')` to load cart items, `fetch('/api/cart', { method: 'POST' })` to add items, and uses `setTimeout` to auto-save after 2 seconds of inactivity. Write a test plan describing which dependencies to mock, which to leave real, and how to test the auto-save timing behavior.

## 2. Style it — PE7 applied to the mock explorer

The mini-build is a mock explorer showing mock call counts and arguments. Mock function cards use `var(--color-surface-2)` with `var(--radius-lg)`. Call count badges use `var(--color-brand)` background. Argument lists use monospace `var(--text-xs)`. The layout is a single column on mobile, two columns on desktop.

## 3. Interact — calling mock functions and seeing the recorded data

The problem: mock functions are abstract until you see what they record.

```typescript
interface MockCallRecord {
    callIndex: number;
    args: string[];
    returnValue: string;
    timestamp: number;
}
```

The interactive element lets students "call" mock functions with custom arguments and see the recorded calls, return values, and call counts update in real time.

## 4. Mini-build — Mock explorer

**File:** `src/routes/modules/21-vite-vitest/08-mocking-spying/+page.svelte`

This page simulates mock function behavior. Students call mock functions, provide arguments, and see the mock's internal state (call history, return values, call count) update live.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/21-vite-vitest/08-mocking-spying`.

### Prove the concept

1. Create a test file that uses `vi.fn()` and log the mock's `.mock.calls` property.
2. Call the mock several times with different arguments.
3. Verify that `.mock.calls` matches the explorer's display.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between vi.fn() and vi.spyOn()?</summary>

`vi.fn()` creates a brand-new mock function with no connection to any real implementation. `vi.spyOn()` wraps an existing method on an object, recording its calls while still executing the original implementation by default. `vi.spyOn()` can be restored to the original with `.mockRestore()`, while `vi.fn()` has no original to restore.
</details>

<details>
<summary><strong>Q2.</strong> Why does vi.mock() need to be hoisted above imports?</summary>

ES module imports are resolved before any code executes. If `vi.mock()` ran after the imports, the tested module would already have imported the real module. By hoisting `vi.mock()` before imports, Vitest ensures the mock is in place when the tested module's imports resolve.
</details>

<details>
<summary><strong>Q3.</strong> When should you NOT mock a dependency?</summary>

Do not mock pure functions (functions with no side effects that return the same output for the same input). They are fast and deterministic, so testing them directly is simpler and more reliable than mocking. Also avoid mocking internal modules when the test becomes harder to understand than the code it tests — over-mocking hides integration bugs.
</details>

<details>
<summary><strong>Q4.</strong> How do you test code that uses setTimeout without waiting in real time?</summary>

Use `vi.useFakeTimers()` before the test to replace the real timer with a controllable fake. Call the code that sets the timeout, then use `vi.advanceTimersByTime(ms)` to advance the fake clock by the desired amount. The timeout callback fires synchronously when the fake clock passes its delay. Always call `vi.useRealTimers()` in `afterEach` to restore real timers.
</details>

<details>
<summary><strong>Q5.</strong> What does mockResolvedValue do and when would you use it?</summary>

`mockResolvedValue(value)` configures a mock function to return `Promise.resolve(value)` when called. Use it when mocking asynchronous functions like `fetch` that return promises. It is shorthand for `mockImplementation(() => Promise.resolve(value))`. For error cases, use `mockRejectedValue(error)`.
</details>

## 6. Common mistakes

- **Not restoring mocks between tests.** Mocks persist across tests within a file. If you mock `fetch` in one test and do not restore it, subsequent tests use the mock too. Use `vi.restoreAllMocks()` in a global `afterEach` or per-test cleanup.
- **Mocking too much.** If every dependency is mocked, your test only verifies that you call mocks correctly — not that the real code works. Follow the testing trophy: mock external I/O, test internal logic directly.
- **Referencing test-file variables inside vi.mock() factory.** The factory runs before the test file's variables are initialized (because of hoisting). Access to variables declared with `const` or `let` in the test file will cause a ReferenceError. Use `vi.mocked()` inside tests instead.
- **Forgetting to await async mocks.** If a mock returns a promise via `mockResolvedValue`, the code that calls it must be awaited. Forgetting `await` causes the test to complete before the promise resolves, masking assertion failures.

## 7. What's next

Lesson 21.9 introduces snapshot testing — capturing the rendered output of components and comparing it across runs to catch unexpected changes.
