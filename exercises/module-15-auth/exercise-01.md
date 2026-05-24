---
module: 15
exercise: 1
title: Session Check Guard
difficulty: beginner
estimated_time: 10
skills_tested:
  - SvelteKit hooks
  - event.locals typing
  - session cookie reading
  - conditional page rendering
---

# Exercise 15.1 — Session Check Guard

## Brief

Create a server hook that reads an authentication cookie from every request and populates `event.locals.user` with the session data. Then build a simple page that conditionally renders a welcome message or a login prompt based on whether a session exists. This exercise teaches the foundational pattern for all SvelteKit authentication: the hook-to-locals pipeline.

## Requirements

1. Create `src/hooks.server.ts` (or extend the existing one) with a `handle` function
2. Define a TypeScript interface `SessionUser` with `id: string`, `email: string`, and `name: string`
3. In the hook, read a cookie named `session` from `event.cookies.get('session')`
4. If the cookie exists, parse it as JSON and set `event.locals.user` to the parsed `SessionUser`
5. If the cookie is missing or invalid, set `event.locals.user` to `null`
6. Extend the `App.Locals` interface in `src/app.d.ts` to include `user: SessionUser | null`
7. Create `src/routes/exercises/15-auth/01/+page.server.ts` that passes `locals.user` to the page
8. Create `src/routes/exercises/15-auth/01/+page.svelte` that shows "Welcome, {name}" if logged in, or "Please log in" if not
9. Style both states with PE7 tokens

## Constraints

- No client-side authentication checks — all session verification happens server-side
- TypeScript strict mode with zero errors
- The cookie parsing must be wrapped in try/catch for safety

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

The `handle` hook in `src/hooks.server.ts` intercepts every request. It receives an `event` object with `event.cookies` for reading cookies and `event.locals` for passing data to load functions. Call `resolve(event)` to continue the request pipeline.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The pattern is: read cookie, parse JSON safely, attach to locals. In `+page.server.ts`, the `load` function receives `event` (or `{ locals }`) and returns data for the page. The page component receives this via the `data` prop. Use `{#if data.user}` to conditionally render.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get('session');

  if (sessionCookie) {
    try {
      event.locals.user = JSON.parse(sessionCookie);
    } catch {
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/app.d.ts`** (relevant addition)

```typescript
declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        email: string;
        name: string;
      } | null;
    }
  }
}

export {};
```

**`src/hooks.server.ts`**

```typescript
import type { Handle } from '@sveltejs/kit';

interface SessionUser {
  id: string;
  email: string;
  name: string;
}

function parseSession(raw: string): SessionUser | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'id' in parsed &&
      'email' in parsed &&
      'name' in parsed
    ) {
      return parsed as SessionUser;
    }
    return null;
  } catch {
    return null;
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get('session');
  event.locals.user = sessionCookie ? parseSession(sessionCookie) : null;
  return resolve(event);
};
```

**`src/routes/exercises/15-auth/01/+page.server.ts`**

```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  return {
    user: locals.user
  };
};
```

**`src/routes/exercises/15-auth/01/+page.svelte`**

```svelte
<script lang="ts">
  interface Props {
    data: {
      user: { id: string; email: string; name: string } | null;
    };
  }

  let { data }: Props = $props();
</script>

<main class="page">
  {#if data.user}
    <div class="card welcome">
      <h1>Welcome back, {data.user.name}</h1>
      <p class="email">{data.user.email}</p>
      <p class="hint">Your session is active. You are authenticated.</p>
    </div>
  {:else}
    <div class="card login-prompt">
      <h1>Please log in</h1>
      <p>No active session detected. Please authenticate to continue.</p>
      <a href="/login" class="btn">Go to Login</a>
    </div>
  {/if}
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
    display: grid;
    place-items: center;
    min-block-size: 60vh;
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    text-align: center;
    max-inline-size: 24rem;
    box-shadow: var(--shadow-md);
  }

  h1 {
    font-size: var(--text-xl);
    margin-block-end: var(--space-sm);
  }

  .email {
    font-size: var(--text-sm);
    color: var(--color-brand);
    margin-block-end: var(--space-xs);
  }

  .hint {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .login-prompt p {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-end: var(--space-lg);
  }

  .btn {
    display: inline-block;
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-brand);
    color: var(--color-surface);
    border-radius: var(--radius-md);
    font-weight: 600;
    text-decoration: none;
    font-size: var(--text-sm);
  }
</style>
```

### Explanation

This solution establishes the canonical SvelteKit authentication pattern. The server hook runs on every request before any load function, making it the single source of truth for session state. By parsing the cookie server-side and attaching the result to `event.locals`, every downstream load function can check authentication without duplicating cookie-reading logic. The `parseSession` helper validates the JSON structure defensively — in production, you would verify a JWT signature or query a session store instead of trusting raw JSON. The page component receives the user data through SvelteKit's type-safe `data` prop and conditionally renders using `{#if}`. This pattern scales to any authentication provider because the hook abstracts the session verification, and the rest of the app only sees the typed `locals.user` object.
</details>
