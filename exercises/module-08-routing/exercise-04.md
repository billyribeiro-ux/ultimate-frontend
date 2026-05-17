---
module: 8
exercise: 4
title: Hooks Middleware Chain
difficulty: expert
estimated_time: 45
skills_tested:
  - hooks.server.ts
  - handle function
  - sequence helper
  - locals typing
---

# Exercise 8.4 — Hooks Middleware Chain

## Brief

Build a `hooks.server.ts` that chains three middleware functions using the `sequence` helper: a request logger, a locale detector, and an auth guard. Each middleware writes to `event.locals`, and the page reads from it via a layout load.

## Requirements

1. Create `src/hooks.server.ts` exporting a `handle` built from `sequence(logger, locale, authGuard)`
2. The `logger` middleware logs the method, pathname, and timestamp to the console, then calls `resolve(event)`
3. The `locale` middleware reads `Accept-Language`, extracts the primary language, and writes it to `event.locals.locale`
4. The `authGuard` middleware checks for a `session` cookie — if missing on `/dashboard` routes, redirect to `/login` using `redirect(303, '/login')`
5. Type `event.locals` in `src/app.d.ts` with `locale: string` and `user: { name: string } | null`
6. Create a layout server load at `src/routes/+layout.server.ts` that returns `locals.locale` and `locals.user` to all pages
7. A dashboard page at `src/routes/dashboard/+page.svelte` displays the user name and locale

## Constraints

- No third-party middleware libraries
- All types must be declared in `app.d.ts`
- Each middleware must call `resolve(event)` exactly once

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Import `sequence` from `@sveltejs/kit/hooks`. Each middleware has the signature `({ event, resolve }) => Response`. The `event.locals` object is mutable and shared across all middleware and load functions for a single request.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The order in `sequence()` matters: `logger` runs first (logs all requests), `locale` runs second (sets the language for everything downstream), and `authGuard` runs last (can use `locals.locale` for localized error messages if needed). Each must call `resolve(event)` and return the result.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';

const logger: Handle = async ({ event, resolve }) => {
  console.log(`${event.request.method} ${event.url.pathname}`);
  return resolve(event);
};

const locale: Handle = async ({ event, resolve }) => {
  const lang = event.request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] ?? 'en';
  event.locals.locale = lang;
  return resolve(event);
};

export const handle = sequence(logger, locale, /* authGuard */);
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      locale: string;
      user: { name: string } | null;
    }
  }
}

export {};
```

```typescript
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';

const logger: Handle = async ({ event, resolve }) => {
  const start = performance.now();
  const response = await resolve(event);
  const duration = Math.round(performance.now() - start);
  console.log(`${event.request.method} ${event.url.pathname} — ${response.status} (${duration}ms)`);
  return response;
};

const locale: Handle = async ({ event, resolve }) => {
  const header = event.request.headers.get('accept-language') ?? '';
  const primary = header.split(',')[0]?.split('-')[0]?.trim() ?? 'en';
  event.locals.locale = primary;
  return resolve(event);
};

const authGuard: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');

  if (session) {
    event.locals.user = { name: 'Ada Lovelace' };
  } else {
    event.locals.user = null;
  }

  if (event.url.pathname.startsWith('/dashboard') && !event.locals.user) {
    redirect(303, '/login');
  }

  return resolve(event);
};

export const handle = sequence(logger, locale, authGuard);
```

```typescript
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
  return {
    locale: locals.locale,
    user: locals.user
  };
};
```

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="dashboard">
  <h1>Welcome, {data.user?.name ?? 'Guest'}</h1>
  <p class="locale">Detected locale: <code>{data.locale}</code></p>

  <div class="card">
    <h2>Dashboard</h2>
    <p>You are authenticated and your request passed through three middleware layers.</p>
  </div>
</div>

<style>
  .dashboard {
    max-inline-size: 40rem;
    margin-inline: auto;
    padding: var(--space-lg);
  }

  h1 {
    font-size: var(--text-2xl);
    color: var(--color-text);
    margin-block-end: var(--space-xs);
  }

  .locale {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-end: var(--space-lg);
  }

  code {
    background: var(--color-surface-3);
    padding: var(--space-2xs) var(--space-xs);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
  }

  .card h2 {
    font-size: var(--text-lg);
    margin-block-end: var(--space-sm);
  }

  .card p {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
```

### Explanation

The `sequence` helper composes multiple `Handle` functions into a single pipeline. Each middleware receives the same `event` object, so mutations to `event.locals` are visible downstream. The logger wraps `resolve()` to measure response time. The locale extractor runs before auth so that error pages could use the detected language. The auth guard uses `redirect()` — a thrown response that SvelteKit catches — to block unauthenticated access. This three-layer pattern (logging, enrichment, protection) is the foundation of production SvelteKit middleware and scales to rate limiting, CORS, feature flags, and more.
</details>
