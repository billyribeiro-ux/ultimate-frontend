---
module: 12
exercise: 3
title: Error Boundary Component
difficulty: advanced
estimated_time: 30
skills_tested:
  - +error.svelte boundaries
  - error handling patterns
  - typed error pages
  - recovery mechanisms
---

# Exercise 12.3 — Error Boundary Component

## Brief

Build a nested error boundary system that catches errors at different levels of the route hierarchy, showing appropriate error UIs and recovery options. The root boundary catches 500 errors, a layout boundary catches 404 errors for a section, and components handle their own recoverable errors.

## Requirements

1. Create `src/routes/+error.svelte` as the root error boundary with a generic error page
2. Create `src/routes/(app)/+error.svelte` as a section-specific error boundary with a "back to dashboard" link
3. Create `src/routes/(app)/items/[id]/+page.server.ts` that throws `error(404)` for invalid IDs and `error(500)` for simulated server errors
4. The root error boundary reads `page.error` and `page.status` from `$app/state`
5. Both error pages display the status code, message, and a stack trace in development mode
6. Include a "Try Again" button that reloads the current route
7. Style the 404 and 500 pages differently (404 is informational, 500 is alarming)

## Constraints

- Error boundaries must use `$app/state` for error info, not props
- No try/catch in page components — use SvelteKit's built-in error boundaries
- Development stack traces must be hidden in production
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`+error.svelte` files act as error boundaries. SvelteKit searches up the route tree for the nearest `+error.svelte` when an error occurs. The `page` object from `$app/state` provides `page.error` (the error message/object) and `page.status` (the HTTP status code).
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The error bubbles up from the page to the nearest error boundary. If `(app)/+error.svelte` exists, it catches errors within the `(app)` group. If that boundary itself errors, the root `+error.svelte` catches it. Use `$app/environment`'s `dev` flag to conditionally show stack traces.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<!-- src/routes/(app)/+error.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import { dev } from '$app/environment';
  import { invalidateAll } from '$app/navigation';
</script>

<div class="error-page">
  <h1>{page.status}</h1>
  <p>{page.error?.message}</p>
  <button onclick={() => invalidateAll()}>Try Again</button>
</div>
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/routes/(app)/items/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface Item {
  id: string;
  name: string;
  description: string;
}

const items: Item[] = [
  { id: '1', name: 'Widget A', description: 'A useful widget' },
  { id: '2', name: 'Widget B', description: 'Another widget' }
];

export const load: PageServerLoad = ({ params }) => {
  // Simulate server error for ID "crash"
  if (params.id === 'crash') {
    error(500, { message: 'Internal server error: database connection failed' });
  }

  const item = items.find((i) => i.id === params.id);

  if (!item) {
    error(404, { message: `Item "${params.id}" not found` });
  }

  return { item };
};
```

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import { dev } from '$app/environment';
</script>

<div class="root-error">
  <div class="error-card">
    <span class="status-code">{page.status}</span>
    <h1>Something went wrong</h1>
    <p class="message">{page.error?.message ?? 'An unexpected error occurred'}</p>

    <div class="actions">
      <a href="/" class="btn-primary">Go Home</a>
      <button class="btn-secondary" onclick={() => location.reload()}>Reload Page</button>
    </div>

    {#if dev && page.error}
      <details class="debug">
        <summary>Debug Info (dev only)</summary>
        <pre>{JSON.stringify(page.error, null, 2)}</pre>
      </details>
    {/if}
  </div>
</div>

<style>
  .root-error { min-block-size: 100dvh; display: grid; place-items: center; padding: var(--space-lg); background: var(--color-surface-1); }
  .error-card { text-align: center; max-inline-size: 28rem; }
  .status-code { font-size: var(--text-3xl); font-weight: 800; color: oklch(55% 0.2 25); display: block; margin-block-end: var(--space-sm); }
  h1 { font-size: var(--text-xl); color: var(--color-text); margin-block-end: var(--space-sm); }
  .message { color: var(--color-text-muted); margin-block-end: var(--space-xl); }
  .actions { display: flex; gap: var(--space-sm); justify-content: center; }
  .btn-primary { padding: var(--space-sm) var(--space-lg); background: oklch(55% 0.2 250); color: white; border-radius: var(--radius-sm); text-decoration: none; font-weight: 600; }
  .btn-secondary { padding: var(--space-sm) var(--space-lg); background: var(--color-surface-3); color: var(--color-text); border: none; border-radius: var(--radius-sm); cursor: pointer; }
  .debug { margin-block-start: var(--space-xl); text-align: start; }
  .debug pre { background: var(--color-surface-2); padding: var(--space-md); border-radius: var(--radius-sm); font-size: var(--text-xs); overflow-x: auto; }
</style>
```

```svelte
<!-- src/routes/(app)/+error.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import { dev } from '$app/environment';
  import { invalidateAll } from '$app/navigation';

  let is404 = $derived(page.status === 404);
</script>

<div class="section-error" class:not-found={is404} class:server-error={!is404}>
  <div class="error-content">
    <span class="status">{page.status}</span>
    <h1>{is404 ? 'Not Found' : 'Server Error'}</h1>
    <p>{page.error?.message ?? 'Something went wrong'}</p>

    <div class="actions">
      <a href="/" class="btn">Back to Dashboard</a>
      {#if !is404}
        <button class="btn btn-retry" onclick={() => invalidateAll()}>Try Again</button>
      {/if}
    </div>

    {#if dev && page.error}
      <details class="debug-info">
        <summary>Stack trace</summary>
        <pre>{JSON.stringify(page.error, null, 2)}</pre>
      </details>
    {/if}
  </div>
</div>

<style>
  .section-error { padding: var(--space-2xl); text-align: center; }
  .status { font-size: var(--text-3xl); font-weight: 800; display: block; margin-block-end: var(--space-xs); }
  .not-found .status { color: oklch(55% 0.2 250); }
  .server-error .status { color: oklch(55% 0.2 25); }
  h1 { font-size: var(--text-xl); margin-block-end: var(--space-sm); }
  p { color: var(--color-text-muted); margin-block-end: var(--space-lg); }
  .actions { display: flex; gap: var(--space-sm); justify-content: center; }
  .btn { padding: var(--space-xs) var(--space-md); background: var(--color-surface-3); color: var(--color-text); border: none; border-radius: var(--radius-sm); text-decoration: none; font-weight: 600; cursor: pointer; }
  .btn-retry { background: oklch(55% 0.2 250); color: white; }
  .debug-info { margin-block-start: var(--space-xl); text-align: start; max-inline-size: 28rem; margin-inline: auto; }
  .debug-info pre { background: var(--color-surface-2); padding: var(--space-md); border-radius: var(--radius-sm); font-size: var(--text-xs); overflow-x: auto; }
</style>
```

### Explanation

SvelteKit's error boundary system uses `+error.svelte` files that catch errors at different levels of the route tree. The nearest boundary to the error handles it. If the section boundary at `(app)/+error.svelte` fails, the root `+error.svelte` catches the bubble-up. This layered approach lets you provide context-specific error UIs (a "back to dashboard" link in the app section, a "go home" link at the root). The `dev` flag from `$app/environment` conditionally shows stack traces — critical for debugging in development but a security risk in production. The `invalidateAll()` call in "Try Again" reruns all load functions, which is the correct way to retry after a server error.
</details>
