---
module: 21
exercise: 4
title: Mock Strategy for SvelteKit Load Functions
difficulty: expert
estimated_time: 45
skills_tested:
  - vi.mock and vi.fn
  - server load function testing
  - dependency injection patterns
  - test isolation
---

# Exercise 21.4 — Mock Strategy for SvelteKit Load Functions

## Brief

Testing SvelteKit load functions is tricky because they depend on platform-specific objects (`RequestEvent`, `cookies`, `fetch`, `params`). In this exercise, you will create a comprehensive test suite for a realistic `+page.server.ts` load function that fetches a product by slug from a database, checks user authentication via cookies, and returns different data shapes based on whether the user is an admin.

## Requirements

1. Create `src/routes/exercises/21-vite-vitest/04/+page.server.ts` with a load function that:
   - Reads `params.slug` to identify the product
   - Calls a database function `getProductBySlug(slug: string)`
   - Reads a `session` cookie and calls `getUserFromSession(sessionId: string)`
   - Returns `{ product, isAdmin: user.role === 'admin', editUrl }` for admins
   - Returns `{ product, isAdmin: false }` for non-admins
   - Throws `error(404)` if the product is not found
   - Throws `redirect(303, '/login')` if there is no session cookie
2. Create `src/routes/exercises/21-vite-vitest/04/+page.server.test.ts` with these test cases:
   - "returns product data for authenticated user"
   - "returns isAdmin true for admin users"
   - "returns isAdmin false for regular users"
   - "throws 404 when product not found"
   - "redirects to login when no session cookie"
   - "redirects to login when session is invalid"
3. Mock `getProductBySlug` and `getUserFromSession` using `vi.mock()`
4. Create a helper factory function `createMockEvent()` that builds a realistic `RequestEvent`-like object
5. Each test must be fully isolated — no shared mutable state between tests

## Constraints

- Use Vitest's `vi.mock()` for module-level mocks
- Use `vi.fn()` for individual function mocks
- No actual database or HTTP calls
- TypeScript strict — all mock objects must satisfy the expected types
- Tests must run in isolation (each test sets up its own mocks)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

The key challenge is creating a mock `RequestEvent`. You need at minimum: `params` (an object with `slug`), `cookies` (an object with `get()` and `set()` methods), and `fetch` (a mock function). Use `vi.fn()` for each method and configure return values per test.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

A factory function simplifies test setup:

```typescript
function createMockEvent(overrides: Partial<MockEvent> = {}): MockEvent {
  return {
    params: { slug: 'test-product' },
    cookies: {
      get: vi.fn().mockReturnValue('valid-session-id'),
      set: vi.fn(),
      // ...
    },
    fetch: vi.fn(),
    ...overrides
  };
}
```

Then each test calls `createMockEvent()` with only the overrides it needs.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';

vi.mock('$lib/server/db', () => ({
  getProductBySlug: vi.fn()
}));

vi.mock('$lib/server/auth', () => ({
  getUserFromSession: vi.fn()
}));

import { getProductBySlug } from '$lib/server/db';
import { getUserFromSession } from '$lib/server/auth';

describe('product page load', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns product for authenticated user', async () => {
    vi.mocked(getProductBySlug).mockResolvedValue({ id: '1', name: 'Widget', slug: 'widget' });
    vi.mocked(getUserFromSession).mockResolvedValue({ id: 'u1', role: 'user' });

    const event = createMockEvent({ params: { slug: 'widget' } });
    const result = await load(event);

    expect(result.product.name).toBe('Widget');
    expect(result.isAdmin).toBe(false);
  });
});
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`+page.server.ts`**

```typescript
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getProductBySlug } from '$lib/server/db';
import { getUserFromSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, cookies }) => {
  const sessionId: string | undefined = cookies.get('session');
  if (!sessionId) {
    redirect(303, '/login');
  }

  const user = await getUserFromSession(sessionId);
  if (!user) {
    redirect(303, '/login');
  }

  const product = await getProductBySlug(params.slug);
  if (!product) {
    error(404, `Product "${params.slug}" not found`);
  }

  const isAdmin: boolean = user.role === 'admin';

  return {
    product,
    isAdmin,
    ...(isAdmin ? { editUrl: `/admin/products/${product.id}/edit` } : {})
  };
};
```

**`+page.server.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';
import { error, redirect } from '@sveltejs/kit';

vi.mock('$lib/server/db', () => ({
  getProductBySlug: vi.fn()
}));

vi.mock('$lib/server/auth', () => ({
  getUserFromSession: vi.fn()
}));

import { getProductBySlug } from '$lib/server/db';
import { getUserFromSession } from '$lib/server/auth';

interface MockCookies {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  serialize: ReturnType<typeof vi.fn>;
  getAll: ReturnType<typeof vi.fn>;
}

interface MockEvent {
  params: Record<string, string>;
  cookies: MockCookies;
  fetch: ReturnType<typeof vi.fn>;
  url: URL;
  request: Request;
}

function createMockEvent(overrides: Partial<MockEvent> = {}): MockEvent {
  return {
    params: { slug: 'test-product' },
    cookies: {
      get: vi.fn().mockReturnValue('valid-session-id'),
      set: vi.fn(),
      delete: vi.fn(),
      serialize: vi.fn(),
      getAll: vi.fn().mockReturnValue([])
    },
    fetch: vi.fn(),
    url: new URL('http://localhost/products/test-product'),
    request: new Request('http://localhost/products/test-product'),
    ...overrides
  };
}

describe('product page load', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getProductBySlug).mockResolvedValue({
      id: 'p1',
      name: 'Test Widget',
      slug: 'test-product',
      price: 29.99
    });

    vi.mocked(getUserFromSession).mockResolvedValue({
      id: 'u1',
      name: 'Test User',
      role: 'user'
    });
  });

  it('returns product data for authenticated user', async () => {
    const event = createMockEvent();
    const result = await load(event as any);

    expect(result.product.name).toBe('Test Widget');
    expect(result.product.price).toBe(29.99);
    expect(getProductBySlug).toHaveBeenCalledWith('test-product');
  });

  it('returns isAdmin true for admin users', async () => {
    vi.mocked(getUserFromSession).mockResolvedValue({
      id: 'a1',
      name: 'Admin',
      role: 'admin'
    });

    const event = createMockEvent();
    const result = await load(event as any);

    expect(result.isAdmin).toBe(true);
    expect(result.editUrl).toBe('/admin/products/p1/edit');
  });

  it('returns isAdmin false for regular users', async () => {
    const event = createMockEvent();
    const result = await load(event as any);

    expect(result.isAdmin).toBe(false);
    expect(result).not.toHaveProperty('editUrl');
  });

  it('throws 404 when product not found', async () => {
    vi.mocked(getProductBySlug).mockResolvedValue(null);

    const event = createMockEvent({ params: { slug: 'nonexistent' } });

    await expect(load(event as any)).rejects.toThrow();
  });

  it('redirects to login when no session cookie', async () => {
    const event = createMockEvent();
    event.cookies.get.mockReturnValue(undefined);

    await expect(load(event as any)).rejects.toThrow();
  });

  it('redirects to login when session is invalid', async () => {
    vi.mocked(getUserFromSession).mockResolvedValue(null);

    const event = createMockEvent();

    await expect(load(event as any)).rejects.toThrow();
  });
});
```

### Explanation

The core pattern is: mock external dependencies at the module level with `vi.mock()`, create a factory function for the complex `RequestEvent` object, and configure mocks per-test using `mockResolvedValue()`. The `beforeEach` block with `vi.clearAllMocks()` ensures test isolation. Note that `error()` and `redirect()` in SvelteKit throw exceptions — you test for them with `rejects.toThrow()`. The factory function `createMockEvent()` provides sensible defaults that individual tests override only for the specific behavior they are testing, keeping each test focused and readable.
</details>
