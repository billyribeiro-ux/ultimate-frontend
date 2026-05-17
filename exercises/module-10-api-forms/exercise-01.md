---
module: 10
exercise: 1
title: REST API Endpoint
difficulty: beginner
estimated_time: 10
skills_tested:
  - server.ts endpoints
  - JSON responses
  - HTTP methods
  - RequestHandler typing
---

# Exercise 10.1 — REST API Endpoint

## Brief

Build a typed REST API endpoint at `/api/bookmarks` that supports GET (list all) and POST (create one). The endpoint returns proper JSON responses with correct status codes and Content-Type headers.

## Requirements

1. Create `src/routes/api/bookmarks/+server.ts` with typed `GET` and `POST` handlers
2. `GET` returns a JSON array of bookmarks with `id`, `url`, `title`, and `createdAt` fields
3. `POST` reads a JSON body, validates it has `url` and `title`, creates a new bookmark, and returns it with status 201
4. If the POST body is missing required fields, return a 400 error with `{ error: 'Missing required fields' }`
5. Type the handlers using `RequestHandler` from `@sveltejs/kit`
6. Store bookmarks in an in-memory array (server-side module scope)
7. Create a simple test page at `src/routes/api-test/+page.svelte` that calls both endpoints and displays results

## Constraints

- Use `json()` helper from `@sveltejs/kit` for all responses
- No external libraries for request parsing
- All request/response types must be explicit

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Export named functions `GET` and `POST` from `+server.ts`. Each receives a `RequestEvent` and must return a `Response`. Use the `json()` helper: `return json(data, { status: 201 })`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

For POST, read the body with `await request.json()`. Validate the fields, push to the in-memory array, and return the new item. The in-memory array persists between requests as long as the server is running (it resets on restart).
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  return json(bookmarks);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  // validate, create, return
};
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/routes/api/bookmarks/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface Bookmark {
  id: number;
  url: string;
  title: string;
  createdAt: string;
}

let nextId = 3;
const bookmarks: Bookmark[] = [
  { id: 1, url: 'https://svelte.dev', title: 'Svelte', createdAt: '2026-05-01T10:00:00Z' },
  { id: 2, url: 'https://kit.svelte.dev', title: 'SvelteKit', createdAt: '2026-05-02T14:00:00Z' }
];

export const GET: RequestHandler = async () => {
  return json(bookmarks);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  if (!body.url || !body.title) {
    return json({ error: 'Missing required fields: url, title' }, { status: 400 });
  }

  const bookmark: Bookmark = {
    id: nextId++,
    url: body.url as string,
    title: body.title as string,
    createdAt: new Date().toISOString()
  };

  bookmarks.push(bookmark);
  return json(bookmark, { status: 201 });
};
```

```svelte
<!-- src/routes/api-test/+page.svelte -->
<script lang="ts">
  interface Bookmark {
    id: number;
    url: string;
    title: string;
    createdAt: string;
  }

  let bookmarks = $state<Bookmark[]>([]);
  let newUrl = $state('');
  let newTitle = $state('');
  let error = $state('');

  async function loadBookmarks() {
    const res = await fetch('/api/bookmarks');
    bookmarks = await res.json();
  }

  async function createBookmark() {
    error = '';
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: newUrl, title: newTitle })
    });

    if (!res.ok) {
      const data = await res.json();
      error = data.error;
      return;
    }

    newUrl = '';
    newTitle = '';
    await loadBookmarks();
  }

  $effect(() => {
    loadBookmarks();
  });
</script>

<div class="api-test">
  <h1>Bookmarks API Test</h1>

  <form onsubmit={(e) => { e.preventDefault(); createBookmark(); }}>
    <input type="url" bind:value={newUrl} placeholder="URL" required />
    <input type="text" bind:value={newTitle} placeholder="Title" required />
    <button type="submit">Add Bookmark</button>
  </form>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <ul class="bookmark-list">
    {#each bookmarks as bm (bm.id)}
      <li>
        <a href={bm.url} target="_blank" rel="noopener">{bm.title}</a>
        <time>{new Date(bm.createdAt).toLocaleDateString()}</time>
      </li>
    {/each}
  </ul>
</div>

<style>
  .api-test { max-inline-size: 32rem; margin-inline: auto; padding: var(--space-lg); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
  form { display: flex; gap: var(--space-sm); margin-block-end: var(--space-lg); }
  input { flex: 1; padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-sm); background: var(--color-surface-1); color: var(--color-text); }
  button { padding: var(--space-xs) var(--space-md); background: oklch(55% 0.2 250); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; }
  .error { color: oklch(55% 0.2 25); font-size: var(--text-sm); margin-block-end: var(--space-md); }
  .bookmark-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-xs); }
  .bookmark-list li { display: flex; justify-content: space-between; padding: var(--space-sm) var(--space-md); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
  a { color: oklch(55% 0.2 250); text-decoration: none; }
  time { font-size: var(--text-xs); color: var(--color-text-muted); }
</style>
```

### Explanation

SvelteKit's `+server.ts` files create standalone API endpoints that can handle any HTTP method. Named exports (`GET`, `POST`, `PUT`, `DELETE`) map directly to HTTP methods. The `json()` helper creates a `Response` with the correct `Content-Type: application/json` header. This pattern is ideal for building APIs consumed by mobile apps, third-party integrations, or your own frontend via `fetch`. The in-memory storage demonstrates the concept but would be replaced with a database in production.
</details>
