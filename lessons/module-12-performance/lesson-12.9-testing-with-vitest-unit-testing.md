---
module: 12
lesson: 12.9
title: Testing with Vitest — unit testing
duration: 55 minutes
prerequisites:
  - Lesson 11.5 — reactive classes
  - Module 9A — load functions
learning_objectives:
  - Write a Vitest unit test for a .svelte.ts store using flushSync
  - Test a Svelte component with @testing-library/svelte
  - Test a load() function by calling it directly with a fake event
  - Structure tests with describe, it, expect, beforeEach
  - Distinguish unit tests from E2E tests and pick the right scope
status: ready
---

# Lesson 12.9 — Testing with Vitest — unit testing

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. A test suite is how you sleep at night after deploying. This lesson covers the kinds of tests you should write for a SvelteKit 2 + Svelte 5 app and the specific utilities you need.

## 1. Concept — Unit tests are cheap; write a lot of them

### 1.1 What a unit test is, and is not

A **unit test** exercises a single small piece of code — a function, a class, a component — in isolation, with dependencies replaced by stubs. It runs in milliseconds and tells you whether that one piece works. A **component test** is a unit test of a component: you render it into a DOM, interact with it, and assert on the result. An **E2E test** (Lesson 12.10) drives a real browser across a real app. Unit and component tests are fast and plentiful; E2E tests are slow and scarce.

This lesson covers three kinds of unit tests that cover 90 percent of what a SvelteKit 2 codebase needs:

1. **Stores** (`.svelte.ts` classes with runes).
2. **Components** (`.svelte` files rendered via `@testing-library/svelte`).
3. **`load()` functions** called as plain functions with a fake event.

### 1.2 The Vitest setup in one paragraph

Vitest is the Vite-native test runner. It reuses your Vite config, which means it already understands `.svelte` and `.svelte.ts`. You add a handful of dev dependencies (`vitest`, `@testing-library/svelte`, `jsdom`), write a tiny `vitest.config.ts` that tells it to use the jsdom environment, and write tests in files named `*.test.ts`. A running command is `pnpm vitest` (which watches) or `pnpm vitest run` (which runs once).

The actual config is out of scope for this lesson — we will write the test files and leave the config to the module project. The rule of thumb is: if the tests run, you have configured correctly; if they don't, you missed a plugin.

### 1.3 Testing a reactive store

Lesson 11.5 argued that a reactive class is trivially testable. Here is the proof:

```ts
// src/lib/stores/cart.svelte.test.ts
import { flushSync } from 'svelte';
import { beforeEach, describe, it, expect } from 'vitest';
import { cart } from '$lib/stores/cart.svelte';

describe('CartStore', () => {
	beforeEach(() => {
		cart.clear();
		flushSync();
	});

	it('adds an item', () => {
		cart.add({ id: 'a', name: 'Torus', price: 19 });
		flushSync();
		expect(cart.count).toBe(1);
		expect(cart.total).toBe(19);
	});

	it('bumps quantity on duplicate add', () => {
		cart.add({ id: 'a', name: 'Torus', price: 19 });
		cart.add({ id: 'a', name: 'Torus', price: 19 });
		flushSync();
		expect(cart.count).toBe(2);
		expect(cart.items.length).toBe(1);
	});

	it('removes an item', () => {
		cart.add({ id: 'a', name: 'Torus', price: 19 });
		cart.remove('a');
		flushSync();
		expect(cart.isEmpty).toBe(true);
	});
});
```

Two details:

- **`flushSync()`** from the `svelte` package flushes pending reactive updates so that derived values (`count`, `total`, `isEmpty`) are up to date before you assert on them. Without it, the assertions may run against stale values.
- **`beforeEach`** resets the singleton. Because the module store is shared across tests, a test that leaves state behind poisons the next one. The reset is mandatory.

### 1.4 Testing a component

`@testing-library/svelte` renders a Svelte component into a jsdom DOM and exposes the usual testing-library queries (`getByRole`, `getByLabelText`) plus an interaction helper (`userEvent`).

```ts
// src/lib/components/Counter.svelte.test.ts
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import Counter from './Counter.svelte';

describe('Counter', () => {
	it('increments when the button is clicked', async () => {
		render(Counter, { props: { initial: 0 } });
		const button = screen.getByRole('button', { name: /increment/i });
		await userEvent.click(button);
		await userEvent.click(button);
		expect(screen.getByText('2')).toBeTruthy();
	});

	it('starts from the initial prop', () => {
		render(Counter, { props: { initial: 5 } });
		expect(screen.getByText('5')).toBeTruthy();
	});
});
```

The pattern is the same for every component: render, query by role or label (never by CSS class — that couples the test to implementation details), interact, assert. `userEvent` is preferred over raw `fireEvent` because it simulates real user input (key events, focus changes, the full pointer dance) instead of firing a single DOM event.

### 1.5 Testing a `load()` function

SvelteKit's `load()` functions are plain TypeScript functions, so you test them by calling them directly with a fake event. No browser, no server, no network.

```ts
// src/routes/members/+page.server.test.ts
import { describe, it, expect } from 'vitest';
import { load } from './+page.server';
import type { ServerLoadEvent } from '@sveltejs/kit';

function fakeEvent(overrides: Partial<ServerLoadEvent> = {}): ServerLoadEvent {
	return {
		url: new URL('http://localhost/members?role=admin'),
		params: {},
		fetch: () => Promise.resolve(new Response('[]')),
		locals: {},
		// ... add other required fields as needed
	} as unknown as ServerLoadEvent;
}

describe('members page load', () => {
	it('filters members by role', async () => {
		const result = await load(fakeEvent());
		expect(result.members.every((m) => m.role === 'admin')).toBe(true);
	});
});
```

The `as unknown as ServerLoadEvent` cast is a pragmatic escape hatch. A test does not need to provide every field of `ServerLoadEvent` — only the fields the function under test actually reads. The cast tells TypeScript "trust me, I know what I'm doing" for the handful of fields you did not mock.

### 1.6 What to test and what not to test

Good test targets:

- **Pure logic.** Filters, sort comparators, validation functions.
- **Store behaviour.** Add, remove, rules, derived fields.
- **Component contracts.** What the component renders given props, what events it fires.
- **Load functions.** Input URL → output data.

Bad test targets:

- **CSS pixel positions.** Brittle; break on every style tweak.
- **Internal method names.** Test the behaviour, not the implementation.
- **Framework internals.** Trust Svelte's `$state` to work; do not re-prove it.

A good rule: **if you can describe what the test is proving in one sentence without using the name of a function inside the code, the test is aimed at behaviour. If you cannot, it is aimed at implementation and will break the next time you refactor.**

## 2. Style it — Nothing to style

Unit tests live in `.test.ts` files with no visible output. The "style it" slot for this lesson is a short note: tests do not render styles; tests verify behaviour.

## 3. Interact — Running the suite

`pnpm vitest` watches and re-runs on save. Every change to a store or component instantly shows whether the tests still pass. The interaction is the tight feedback loop.

## 4. Mini-build — A test file for the cart store and a component test

**File:** `src/routes/modules/12-performance/09-vitest/+page.svelte`
**Companion test files:**
- `src/lib/stores/cart.svelte.test.ts`
- `src/lib/components/sample-counter.svelte.test.ts`

The route renders an instructional page showing the test code side-by-side with the store/component under test. The actual test files live alongside the code they test. **Do not run the tests in this lesson** — the vitest config required to run them is part of the module project.

### DevTools moment

There is no DevTools step for unit tests. The "proof" is the green checkmarks in the terminal when you run `pnpm vitest`. For this lesson, the proof is that the test files type-check under `svelte-check`.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why call <code>flushSync()</code> before asserting on a derived value?</summary>

Derived values are recomputed lazily when read. `flushSync()` forces any pending reactive work to complete, so when you read `cart.count`, you get the up-to-date value. Without it, your assertion may compare against a stale result.
</details>

<details>
<summary><strong>Q2.</strong> Why reset the store in <code>beforeEach</code>?</summary>

The store is a module-level singleton. A test that leaves items in the cart leaves them in the cart for the next test, which then asserts on the wrong initial state. Reset before each test to guarantee a known starting point.
</details>

<details>
<summary><strong>Q3.</strong> Why prefer <code>getByRole</code> over <code>getByClassName</code>?</summary>

Role-based queries couple the test to semantics (the element's accessibility role) rather than implementation (the CSS class). You can refactor CSS without breaking the test, but you cannot refactor the button into a div without breaking both the test and every screen reader user. The test acts as a secondary accessibility check.
</details>

<details>
<summary><strong>Q4.</strong> How do you test a SvelteKit <code>load()</code> function?</summary>

Call it as a plain function with a fake event object. Only supply the fields the function actually reads, and cast via `as unknown as ServerLoadEvent` for the rest. No browser, no server, no network.
</details>

<details>
<summary><strong>Q5.</strong> When is a test "bad" and likely to break on refactor?</summary>

When it asserts on implementation details — CSS classes, internal method names, private field values — rather than observable behaviour. If the test description cannot be written without naming a function inside the code, the test is aimed at implementation and is fragile.
</details>

## 6. Common mistakes

- **Forgetting `flushSync` and asserting on stale values.** Tests pass locally, fail in CI, confuse everyone.
- **Shared mutable state across tests.** Always reset in `beforeEach`.
- **Querying by CSS class.** Brittle and accessibility-hostile.
- **Testing Svelte itself.** Trust the framework; test your code.

## 7. What's next

Lesson 12.10 adds end-to-end tests with Playwright — the complementary, slow, high-confidence layer above unit tests.
