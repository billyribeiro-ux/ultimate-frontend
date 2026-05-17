---
module: 20
lesson: 20.6
title: Testing form actions and API routes
duration: 55 minutes
prerequisites:
  - "20.3 — Unit testing .svelte.ts stores"
  - "10.3 — Form actions"
  - "10.1 — +server.ts API endpoints"
learning_objectives:
  - Write integration tests for SvelteKit form actions by constructing FormData and Request objects
  - Test +server.ts API endpoints by calling handler functions with mock Request objects
  - Verify validation logic, error responses, and redirect behavior in action handlers
  - Mock database and external service dependencies in server-side tests
  - Test both success and failure paths for every form action and API endpoint
status: ready
---

# Lesson 20.6 — Testing form actions and API routes

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Testing server-side code without a server

### 1.1 The problem: server code runs in a different context

SvelteKit form actions and API routes run on the server. They receive Request objects, access databases, validate input, and return responses. You cannot test them by clicking buttons in a browser test — that would require running the full SvelteKit server and a real database. Instead, you test them as functions: construct the inputs, call the function, assert on the outputs.

### 1.2 Testing form actions

A form action is an exported function in `+page.server.ts`:

```typescript
// src/routes/contacts/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name') as string;
    const email = data.get('email') as string;

    if (!name || name.length < 2) {
      return fail(400, { name, email, error: 'Name must be at least 2 characters' });
    }

    if (!email || !email.includes('@')) {
      return fail(400, { name, email, error: 'Invalid email address' });
    }

    // Save to database...
    return { success: true };
  }
};
```

Testing this action requires constructing a mock `request` with `FormData`:

```typescript
import { describe, it, expect } from 'vitest';
import { actions } from '../../src/routes/contacts/+page.server';

function createFormRequest(data: Record<string, string>): Request {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }
  return new Request('http://localhost', { method: 'POST', body: formData });
}

describe('contacts create action', () => {
  it('returns success for valid input', async () => {
    const request = createFormRequest({ name: 'Ada', email: 'ada@example.com' });
    const result = await actions.create({ request } as any);
    expect(result).toEqual({ success: true });
  });

  it('returns error for short name', async () => {
    const request = createFormRequest({ name: 'A', email: 'a@b.com' });
    const result = await actions.create({ request } as any);
    expect(result?.status).toBe(400);
  });

  it('returns error for invalid email', async () => {
    const request = createFormRequest({ name: 'Ada', email: 'not-an-email' });
    const result = await actions.create({ request } as any);
    expect(result?.status).toBe(400);
  });
});
```

### 1.3 Testing API routes

A `+server.ts` endpoint exports HTTP method handlers:

```typescript
// src/routes/api/items/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const search = url.searchParams.get('q') ?? '';
  const items = await fetchItems(search); // database call
  return json(items);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  if (!body.name) error(400, 'Name is required');
  const item = await createItem(body);
  return json(item, { status: 201 });
};
```

Test it by calling the handler directly:

```typescript
describe('items API', () => {
  it('GET returns items matching search query', async () => {
    const url = new URL('http://localhost/api/items?q=svelte');
    const response = await GET({ url } as any);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('POST creates an item and returns 201', async () => {
    const request = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Item' })
    });
    const response = await POST({ request } as any);
    expect(response.status).toBe(201);
  });
});
```

### 1.4 Mocking database dependencies

Real database calls in tests are slow and require a running database. Mock the database layer:

```typescript
import { vi } from 'vitest';
import * as db from '$lib/server/database';

vi.mock('$lib/server/database', () => ({
  fetchItems: vi.fn().mockResolvedValue([
    { id: '1', name: 'Item A' },
    { id: '2', name: 'Item B' }
  ]),
  createItem: vi.fn().mockResolvedValue({ id: '3', name: 'New' })
}));
```

### 1.5 Testing error and redirect responses

Form actions can throw `redirect()` or `error()`. These throw special objects that SvelteKit catches:

```typescript
import { redirect } from '@sveltejs/kit';

it('redirects to dashboard after successful login', async () => {
  const request = createFormRequest({ email: 'ada@test.com', password: 'valid' });
  
  try {
    await actions.login({ request } as any);
    expect.fail('Should have thrown redirect');
  } catch (e: any) {
    expect(e.status).toBe(303);
    expect(e.location).toBe('/dashboard');
  }
});
```

### Deep Dive — Testing validation with Valibot schemas and action return types

When form actions use Valibot for validation, the test strategy becomes cleaner because validation is a pure function:

```typescript
import * as v from 'valibot';

const ContactSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Name must be at least 2 characters')),
  email: v.pipe(v.string(), v.email('Invalid email address'))
});

// Test the schema directly
describe('ContactSchema', () => {
  it('accepts valid input', () => {
    const result = v.safeParse(ContactSchema, { name: 'Ada', email: 'ada@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = v.safeParse(ContactSchema, { name: '', email: 'ada@example.com' });
    expect(result.success).toBe(false);
  });
});
```

Testing the schema separately from the action handler gives you fast, focused unit tests for validation logic. The action handler test then only needs to verify that the handler uses the schema and returns the correct response format.

For actions that return typed `ActionData`, test that the return shape matches what the component expects:

```typescript
it('returns ActionData with error field on validation failure', async () => {
  const request = createFormRequest({ name: '', email: '' });
  const result = await actions.create({ request } as any);
  expect(result.data).toHaveProperty('error');
  expect(result.data.error).toBeTypeOf('string');
});
```

This ensures the contract between server and client is correct — the component renders `form?.error` and the action returns an object with an `error` field.

## 2. Style it — PE7 applied to the action test simulator mini-build

The mini-build has a form on the left and test results on the right. The form uses PE7 input styles with `var(--color-border)` borders and `var(--radius-md)`. Valid submissions show a `var(--color-success)` response card. Validation errors show `var(--color-error)` field highlights. The test panel displays the constructed FormData and the action's return value.

## 3. Interact — simulating form action tests

The student fills out a form and clicks "Test Action." The component constructs the FormData, calls a simulated action, and displays the result alongside the test code.

## 4. Mini-build — Form action test simulator

**File path:** `src/routes/modules/20-testing/06-form-actions-api/+page.svelte`

A form with name and email fields. The student fills it out, and clicking "Run Test" shows: the constructed FormData, the simulated action's return value, and the test assertion results. Validation error cases are pre-configured for one-click testing.

**DevTools moment:** Open the Network panel and submit a real form in your SvelteKit app. Observe the POST request, the FormData in the payload, and the response. This is exactly what your test constructs programmatically.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why do you construct a Request object manually instead of using a real HTTP request in action tests?</summary>

Constructing Request objects makes tests fast, deterministic, and independent of a running server. Real HTTP requests require starting the SvelteKit server, are slower, and can be affected by network conditions. The action function does not care where the Request comes from — it processes the FormData the same way.
</details>

<details>
<summary><strong>Q2.</strong> How do you test that a form action returns a 400 status for invalid input?</summary>

Call the action with FormData containing invalid values. The action returns the result of `fail(400, { error: '...' })`. Assert on `result.status === 400` and verify the error data. Do not test by catching exceptions unless the action explicitly throws.
</details>

<details>
<summary><strong>Q3.</strong> Why should you mock database calls in form action tests?</summary>

Real database calls make tests slow, require a running database, and introduce external state that can cause flaky tests. Mocking the database layer isolates the action logic, makes tests fast and deterministic, and lets you simulate error conditions (database down, constraint violation) that are hard to reproduce with a real database.
</details>

<details>
<summary><strong>Q4.</strong> How do you test that an action throws a redirect?</summary>

Wrap the action call in a try/catch. SvelteKit's `redirect()` throws a special object with `status` and `location` properties. Catch it and assert on those properties. If the action does not throw, call `expect.fail()` to make the test fail explicitly.
</details>

<details>
<summary><strong>Q5.</strong> What is the advantage of testing Valibot schemas separately from action handlers?</summary>

Schema tests are pure unit tests — fast, focused, and easy to write exhaustively. They verify all valid and invalid input combinations without the overhead of constructing Request objects and calling async handlers. The action test then only needs to verify that the handler uses the schema correctly and returns the right response format, reducing duplication.
</details>

## 6. Common mistakes — 3 pitfalls

1. **Forgetting Content-Type for JSON API tests.** When constructing Request objects for `+server.ts` endpoints that expect JSON, include `'Content-Type': 'application/json'` in the headers. Without it, `request.json()` may fail.

2. **Not testing both success and error paths.** Every form action has at least two paths: valid input (success) and invalid input (validation error). Test both. Many bugs hide in the error path because it receives less attention during development.

3. **Using `as any` excessively.** The mock event objects (`{ request } as any`) bypass TypeScript checking. Create a helper function that builds type-safe mock objects with only the properties your action needs, reducing the risk of testing against an unrealistic input shape.

## 7. What's next — one sentence

Next, you will learn Playwright fundamentals — locators, auto-waiting, and the page object pattern for writing maintainable end-to-end tests.
