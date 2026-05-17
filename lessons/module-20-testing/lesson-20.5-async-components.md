---
module: 20
lesson: 20.5
title: Testing async components
duration: 55 minutes
prerequisites:
  - "20.4 — Component testing with @testing-library/svelte"
  - "4.8 — {#await}"
  - "9A.1 — What load functions are"
learning_objectives:
  - Test components that use {#await} blocks by mocking promises and asserting on loading, success, and error states
  - Test SvelteKit load() function return values independently from the components that consume them
  - Use findByText and waitFor from @testing-library/svelte to assert on elements that appear asynchronously
  - Mock fetch in component tests to simulate network responses, errors, and delays
  - Test streaming data patterns by resolving promises sequentially in tests
status: ready
---

# Lesson 20.5 — Testing async components

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Testing code that waits for things

### 1.1 The problem: async state makes tests non-deterministic

A component fetches user data on mount and displays a loading spinner, then the user's name, or an error message. The test renders the component and immediately asserts — but what state is the component in? Loading? Loaded? Error? The answer depends on timing, and tests that depend on timing are flaky.

### 1.2 How to test each async state

The solution is to control the promise lifecycle. Instead of letting the component make real network requests, you mock `fetch` to return a promise you control. Then you assert on each state explicitly:

```typescript
import { render, screen } from '@testing-library/svelte';
import UserProfile from '$lib/components/UserProfile.svelte';

it('shows loading state, then user name', async () => {
  global.fetch = vi.fn().mockResolvedValueOnce(
    new Response(JSON.stringify({ name: 'Ada Lovelace' }))
  );

  render(UserProfile, { props: { userId: '1' } });

  // Loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // Wait for the data to appear
  const name = await screen.findByText('Ada Lovelace');
  expect(name).toBeInTheDocument();

  // Loading state should be gone
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

The `findByText` method is async — it polls the DOM until the element appears or a timeout expires. This handles the delay between mounting and data arrival without relying on `setTimeout` or `await tick()`.

### 1.3 Testing error states

```typescript
it('shows error message when fetch fails', async () => {
  global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

  render(UserProfile, { props: { userId: '1' } });

  const error = await screen.findByText('Failed to load user');
  expect(error).toBeInTheDocument();
});
```

### 1.4 Testing {#await} blocks

A component with `{#await}` renders three branches:

```svelte
{#await promise}
  <p>Loading...</p>
{:then data}
  <p>{data.name}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

The test controls which branch renders by controlling the promise:

```typescript
it('renders the loading state while promise is pending', () => {
  // Create a promise that never resolves (stays pending)
  const promise = new Promise(() => {});
  render(AsyncComponent, { props: { promise } });
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

it('renders the data when promise resolves', async () => {
  const promise = Promise.resolve({ name: 'Ada' });
  render(AsyncComponent, { props: { promise } });
  expect(await screen.findByText('Ada')).toBeInTheDocument();
});

it('renders the error when promise rejects', async () => {
  const promise = Promise.reject(new Error('Boom'));
  render(AsyncComponent, { props: { promise } });
  expect(await screen.findByText('Error: Boom')).toBeInTheDocument();
});
```

### 1.5 Testing load() functions independently

SvelteKit `load()` functions are plain async functions. Test them without rendering components:

```typescript
// src/routes/users/[id]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  const res = await fetch(`/api/users/${params.id}`);
  if (!res.ok) throw error(404, 'User not found');
  return { user: await res.json() };
};
```

```typescript
// tests/unit/user-load.test.ts
import { describe, it, expect, vi } from 'vitest';
import { load } from '../../src/routes/users/[id]/+page';

describe('user page load', () => {
  it('returns user data for valid ID', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ id: '1', name: 'Ada' }), { status: 200 })
    );

    const result = await load({
      params: { id: '1' },
      fetch: mockFetch
    } as any);

    expect(result.user).toEqual({ id: '1', name: 'Ada' });
    expect(mockFetch).toHaveBeenCalledWith('/api/users/1');
  });
});
```

### Deep Dive — Testing streaming data and progressive rendering

SvelteKit supports streaming by returning a promise in the `load` function's return object. The page renders immediately with the non-promise data, and the promise resolves later:

```typescript
export const load: PageLoad = async ({ fetch }) => {
  const quick = await fetch('/api/metadata');
  return {
    metadata: await quick.json(),
    comments: fetch('/api/comments').then(r => r.json()) // streamed
  };
};
```

Testing this pattern requires controlling the timing of each promise independently:

```typescript
it('renders metadata immediately and comments after streaming', async () => {
  let resolveComments: (value: unknown) => void;
  const commentsPromise = new Promise((resolve) => {
    resolveComments = resolve;
  });

  const mockFetch = vi.fn()
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ title: 'Page' }))
    )
    .mockReturnValueOnce(
      commentsPromise.then(data =>
        new Response(JSON.stringify(data))
      )
    );

  render(StreamingPage, {
    props: {
      data: {
        metadata: { title: 'Page' },
        comments: commentsPromise
      }
    }
  });

  // Metadata renders immediately
  expect(screen.getByText('Page')).toBeInTheDocument();

  // Comments show loading
  expect(screen.getByText('Loading comments...')).toBeInTheDocument();

  // Resolve the streamed promise
  resolveComments!([{ text: 'Great article!' }]);

  // Comments appear
  expect(await screen.findByText('Great article!')).toBeInTheDocument();
});
```

The key technique is creating a promise whose resolution you control externally via the `resolveComments` variable. This lets you assert on the intermediate state (loading) before resolving the promise and asserting on the final state (data).

For testing `waitFor` with polling patterns (e.g., a component that polls an API every 5 seconds), use Vitest's fake timers:

```typescript
vi.useFakeTimers();

it('polls for updates every 5 seconds', async () => {
  global.fetch = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ count: 1 })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ count: 2 })));

  render(PollingComponent);

  expect(await screen.findByText('Count: 1')).toBeInTheDocument();

  await vi.advanceTimersByTimeAsync(5000);

  expect(await screen.findByText('Count: 2')).toBeInTheDocument();
});

vi.useRealTimers();
```

## 2. Style it — PE7 applied to the async testing demo mini-build

The mini-build shows a simulated async component with three states (loading, success, error) displayed in a tab-like interface. Each state panel uses `var(--color-surface-2)`. The loading state uses a pulsing animation with `var(--color-brand)` and `prefers-reduced-motion` respect. Error states use `var(--color-error)` borders.

## 3. Interact — controlling promise resolution in real time

The student clicks buttons to resolve or reject a promise, watching the component transition between states and the corresponding test assertions update.

## 4. Mini-build — Async component test simulator

**File path:** `src/routes/modules/20-testing/05-async-components/+page.svelte`

An interactive demo with a simulated async component on the left and test code on the right. Three buttons (Pending, Resolve, Reject) control the promise state. As the state changes, the component updates and the test assertions highlight which ones would pass. Shows the full test lifecycle for async components.

**DevTools moment:** Open the Network panel with throttling set to "Slow 3G." Navigate to a real data-loading page in the app. Watch the loading state appear, then the data. This is the real-world behavior your async component tests simulate.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> What is the difference between findByText and getByText in @testing-library/svelte?</summary>

`getByText` queries the DOM synchronously and throws immediately if the element is not found. `findByText` is async — it polls the DOM until the element appears or a timeout expires (default 1000ms). Use `findByText` for elements that appear after async operations (data loading, state transitions) and `getByText` for elements that should be present immediately after render.
</details>

<details>
<summary><strong>Q2.</strong> How do you test that a component shows a loading spinner while a promise is pending?</summary>

Pass a promise that never resolves (e.g., `new Promise(() => {})`) as the data prop. Render the component, then use `getByText('Loading...')` to assert the loading state is visible. Because the promise never resolves, the component stays in the loading state for the duration of the test.
</details>

<details>
<summary><strong>Q3.</strong> Why should you test load() functions independently from the components that consume them?</summary>

Load functions are pure async functions that can be tested faster and more precisely than full component renders. Testing them independently verifies the data fetching logic, error handling, and response transformation without the overhead of mounting components. Component tests then only need to verify that the component renders the data correctly, not that the data was fetched correctly.
</details>

<details>
<summary><strong>Q4.</strong> How do you test a streaming data pattern where some data arrives immediately and some arrives later?</summary>

Create a promise whose resolution you control externally. Pass the immediate data and the pending promise as props. Assert on the immediately rendered data, then resolve the promise and use `findByText` to assert on the streamed data that appears after resolution.
</details>

<details>
<summary><strong>Q5.</strong> When should you use Vitest's fake timers in async component tests?</summary>

Use fake timers when the component uses `setTimeout`, `setInterval`, or other timer-based APIs (polling, debouncing, animation delays). Fake timers let you advance time instantly with `vi.advanceTimersByTime()` instead of waiting real seconds in the test. This makes tests fast and deterministic.
</details>

## 6. Common mistakes — 3 pitfalls

1. **Using setTimeout to wait for async rendering.** Writing `await new Promise(r => setTimeout(r, 100))` is fragile — the delay might not be long enough on slow CI machines. Use `findByText` or `waitFor` instead, which poll until the condition is met.

2. **Forgetting to mock fetch.** If the component calls `fetch` and you do not mock it, the test makes a real network request. This makes tests slow, non-deterministic, and dependent on external services. Always mock `fetch` in component tests.

3. **Not testing the error state.** Most developers test the happy path (data loads successfully) but skip the error path (network failure, invalid response). Both paths render different UI and both should be tested.

## 7. What's next — one sentence

Next, you will test SvelteKit form actions and API routes — the server-side code that handles form submissions and API requests.
