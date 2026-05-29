---
module: 9A
lesson: 9A.8
title: Error handling in load — error() and redirect()
duration: 50 minutes
prerequisites:
  - Lesson 9A.1 — Load functions
  - Lesson 8.4 — +error.svelte
learning_objectives:
  - Throw a semantic error from a load function using error()
  - Throw a redirect from a load function using redirect()
  - Write a +error.svelte that reads page.error and renders a friendly message
  - Distinguish between expected errors (404, 403) and unexpected errors
  - Keep error messages user-friendly and never leak internals
status: ready
---

# Lesson 9A.8 — Error handling in load — `error()` and `redirect()`

## 1. Concept — Errors and redirects as typed throws

### 1.1 The problem — there are two kinds of "failure" in a load

Inside a load function, two very different situations both count as "the page cannot render normally":

1. **The data does not exist.** The slug points at a post that is not in the database. The user does not have permission to view the resource. The right response is a 404 or 403 status and a friendly error page.
2. **The user should be somewhere else.** The user tried to visit `/dashboard` while logged out. The right response is a 302 redirect to `/login`.

Both need to abort the load and tell SvelteKit to do something specific. You could return an object with an `error` field and branch in the component, but that is fragile. You could `return` a redirect URL, but SvelteKit would not know what to do with it. The clean answer is to **throw a special value** that SvelteKit recognises and handles.

### 1.2 `error(status, message)` — throwing a typed error

```ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const post = await db.posts.findUnique({ where: { slug: params.slug } });
    if (!post) {
        throw error(404, 'Post not found');
    }
    return { post };
};
```

`error(404, 'Post not found')` creates an `HttpError`. Throwing it stops the load, sets `page.status` to 404, and renders the nearest `+error.svelte`. The error object becomes `page.error` with `{ message: 'Post not found' }`.

You can pass a full object for more detail:

```ts
throw error(403, { message: 'You cannot view this draft', code: 'DRAFT_ONLY_AUTHOR' });
```

As long as the object extends `App.Error` (typed in `src/app.d.ts`), SvelteKit happily serialises it.

### 1.3 `redirect(status, location)` — throwing a typed redirect

```ts
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
    if (!locals.user) {
        throw redirect(302, `/login?redirectTo=${url.pathname}`);
    }
    return { user: locals.user };
};
```

`redirect` creates a `Redirect` object. Throwing it tells SvelteKit: "stop rendering this route, send the browser to that URL instead". On the server it becomes a 302 response; on the client it becomes a `goto`.

Common statuses:

- `301` — permanent (the resource has moved)
- `302` — temporary (e.g., login)
- `303` — see other (typical for post-form redirect)
- `307` / `308` — like 302/301 but preserves the HTTP method

### 1.4 Writing `+error.svelte`

The nearest `+error.svelte` up the route tree handles any error thrown (or raised unexpectedly) from a load or a component. It has access to `page.status` and `page.error`:

```svelte
<!-- src/routes/blog/[slug]/+error.svelte -->
<script lang="ts">
    import { page } from '$app/state';
</script>

<section class="page stack">
    <h1>{page.status}</h1>
    <p>{page.error?.message}</p>
</section>
```

You can have multiple `+error.svelte` files at different folder depths. The deepest one that covers the failing route wins. A root `+error.svelte` is your catch-all.

### 1.5 Expected vs unexpected errors

SvelteKit distinguishes between:

- **Expected errors** — those you threw deliberately with `error(...)`. Their message is safe to display to the user.
- **Unexpected errors** — a `TypeError`, a network failure, a null dereference. SvelteKit catches these too, but it **does not display their message by default**, because they may contain stack traces or sensitive data. Instead, `handleError` (Lesson 8.9) lets you log the real error and return a sanitised message to the client.

Treat `error(...)` as "please show this to the user" and regular exceptions as "something broke, log it but do not leak it".

### 1.6 Errors in parallel loads

If you use `Promise.all` and one branch throws `error(404, ...)`, the whole load aborts with that error. If the failing branch is optional, wrap it in a try/catch or use `Promise.allSettled` instead. The decision depends on whether the page can render meaningfully with partial data.

### 1.7 What May 2026 changes

Nothing in the API shape. `error` and `redirect` have been stable since SvelteKit 1.0. What did change is that in May 2026 the `error` helper throws synchronously (no `throw` keyword needed in newest SvelteKit versions), but the `throw error(...)` form still works and is what we teach for clarity.

### 1.8 What SvelteKit does under the hood

The error and redirect lifecycle is one of the most carefully designed parts of SvelteKit's internals. Here is what happens at each stage:

**When `error(404, 'Not found')` is thrown:**

1. The `error()` helper creates an `HttpError` object. This is a special class that SvelteKit recognises.
2. The load function's execution stops. The `HttpError` propagates up to SvelteKit's load orchestrator.
3. SvelteKit checks the response context. If this is SSR, the HTTP status code is set to 404 on the response.
4. SvelteKit walks up the route tree looking for the nearest `+error.svelte`. It starts at the failing route and moves toward the root.
5. The `+error.svelte` component is rendered instead of the `+page.svelte`. Layout components above the error boundary stay mounted — only the page slot is replaced.
6. Inside the error component, `page.status` is `404` and `page.error` is `{ message: 'Not found' }`.
7. On the client (during navigation), the same process happens but the HTTP status is irrelevant — the error component renders in place of the page.

**When `redirect(303, '/login')` is thrown:**

1. The `redirect()` helper creates a `Redirect` object.
2. SvelteKit catches it before any component renders.
3. During SSR: the response is a 303 with a `Location: /login` header. The browser follows the redirect.
4. During client navigation: SvelteKit calls `goto('/login')` internally. No HTTP redirect happens — the client router navigates directly.
5. No `+error.svelte` renders. No component on the current route is touched.

**When an unexpected error is thrown (a regular `Error`, `TypeError`, etc.):**

1. SvelteKit catches it.
2. It calls the `handleError` hook (defined in `src/hooks.server.ts`). You can log the full error here, send it to Sentry, etc.
3. `handleError` returns an `App.Error` object — a sanitised version safe for the client. The default is `{ message: 'Internal Error' }`.
4. SvelteKit sets the status to 500 and renders the nearest `+error.svelte` with the sanitised error.
5. The original error message **never reaches the client** unless you explicitly put it in the `handleError` return.

### 1.9 The TypeScript angle

SvelteKit lets you customise the shape of errors that reach the client by declaring the `App.Error` interface in `src/app.d.ts`:

```ts
// src/app.d.ts
declare global {
    namespace App {
        interface Error {
            message: string;
            code?: string;
            details?: string;
        }
    }
}
export {};
```

Now when you throw `error(403, { message: 'Forbidden', code: 'NO_ACCESS' })`, the second argument must match `App.Error`. In the `+error.svelte`, `page.error` is typed as `App.Error`, so you can safely read `page.error.code`.

For `redirect`, the types ensure you pass a valid redirect status (300-308). Passing `200` is a compile-time error. The location argument is typed as `string`, which means TypeScript cannot check if it is a valid route — that is a runtime concern.

The `handleError` hook has this signature:

```ts
// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
    console.error('Unexpected error:', error);
    // Return a sanitised error for the client
    return { message: 'Something went wrong', code: 'INTERNAL' };
};
```

The return type must extend `App.Error`. This is where you gate what the user sees.

### 1.10 Comparison: error handling strategies

| Strategy | Use for | Status code | Component rendered | Details exposed |
| --- | --- | --- | --- | --- |
| `error(404, msg)` | Missing resources | Any 4xx/5xx | Nearest `+error.svelte` | Your message (safe) |
| `error(403, { message, code })` | Authorization failures | 403 | Nearest `+error.svelte` | Your structured error |
| `redirect(302, url)` | Auth guards, moved content | 3xx | None (browser redirects) | None |
| Unhandled `throw` | Bugs, unexpected failures | 500 | Nearest `+error.svelte` | Sanitised by `handleError` |
| `fail(400, data)` (form actions) | Validation errors | 400 | Same page (re-render) | Structured validation data |

> **In production sidebar.** In our SaaS app, we originally used `error(500, error.message)` for database failures. A Postgres connection timeout leaked `"connection timed out: host=db-prod-001.internal port=5432"` to the client, exposing our internal database hostname. We immediately added a `handleError` hook that logs the real error to our monitoring service and returns `{ message: 'Something went wrong. Please try again.', code: 'DB_ERROR' }` to the client. The client shows the friendly message and the code helps our support team cross-reference with the server logs. Lesson: never pass raw error messages from unexpected exceptions to the client. The `handleError` hook exists specifically to prevent this class of information leak.

### 1.11 Nested error boundaries

You can have `+error.svelte` at multiple depths:

```
src/routes/
  +error.svelte                  (catch-all: 500 errors, global 404s)
  +layout.svelte
  blog/
    +error.svelte                (blog-specific errors)
    +layout.svelte
    [slug]/
      +page.server.ts            (throws error(404) for missing posts)
      +page.svelte
```

When the blog post load throws `error(404)`, SvelteKit finds `blog/+error.svelte` first. The root `+layout.svelte` stays mounted — the navigation, header, and footer are preserved. Only the blog section shows the error. This is important for UX: a missing blog post should not strip the entire site shell.

If `blog/+error.svelte` did not exist, the error would bubble up to `+error.svelte` at the root. If that did not exist either, SvelteKit renders a minimal built-in error page (adequate for development, unbranded for production).

### 1.12 Common interview question

**Q: "What is the difference between `error()`, `fail()`, and throwing a regular `Error` in a SvelteKit load function? When would you use each?"**

**Model answer:** `error(status, message)` is for expected failures where you want to show an error page — a 404 for a missing resource, a 403 for forbidden access. It renders the nearest `+error.svelte`. `fail(status, data)` is only used in form actions — it returns structured validation data to the same page, letting the user correct their input. A regular thrown `Error` is an unexpected failure (a bug, a network timeout). SvelteKit catches it, routes it through `handleError` for sanitisation and logging, and renders `+error.svelte` with a generic message. Use `error()` for "this is normal and the user should see it." Use `fail()` for "the form input was wrong." Let unexpected exceptions propagate for "something broke that I did not anticipate."

## Deep Dive

**Redirect chains.** If a load function throws `redirect(302, '/dashboard')` and the dashboard's own load function throws `redirect(302, '/login')`, SvelteKit follows the chain. During SSR, this produces two 302 responses (the browser follows them). During client navigation, SvelteKit resolves the chain internally via `goto`. There is a limit (typically 10 redirects) to prevent infinite loops. If a redirect chain exceeds the limit, SvelteKit throws a 500 error.

**Errors in layout loads.** If a layout load throws `error()`, every page under that layout is affected. The layout's own `+error.svelte` (if it exists) cannot catch the error because the layout itself failed — it is the layout's *parent's* `+error.svelte` that renders. This means a root layout load error can only be caught by the root-level `+error.svelte`. If the root layout load fails and there is no root `+error.svelte`, the built-in fallback renders.

**Errors in parallel loads.** When multiple loads run in parallel via `Promise.all`, the first one to throw `error()` wins. The other loads are cancelled. If you want partial data, use `Promise.allSettled` and handle failures individually in the component rather than throwing from the load.

## Going Deeper

- **SvelteKit docs:** [Errors](https://svelte.dev/docs/kit/errors) covers expected vs unexpected errors and the `handleError` hook.
- **Advanced pattern:** Create a typed `AppError` class that extends `Error` and includes a `code` field. In `handleError`, check `instanceof AppError` to distinguish your own domain errors from truly unexpected ones, giving more specific client-facing messages for known error types.
- **Challenge:** Build a page with a load that randomly throws `error(503, 'Service unavailable')` 50% of the time. Add an `+error.svelte` that shows a "Retry" button. The retry button should call `invalidateAll()` to re-run the load. How many clicks does it typically take to get a successful render?

## 2. Style it — PE7 for an error surface

The mini-build has an index page that links to three dynamic post slugs. Two of them succeed; one of them is missing and triggers `error(404)`. We style both the success state and the `+error.svelte` with a red/amber personality for the error, and keep the success state blue.

## 3. Interact — throwing a typed error from load

```ts
// [slug]/+page.server.ts
import { error } from '@sveltejs/kit';

const posts: Record<string, { title: string }> = {
    hello: { title: 'Hello' },
    about: { title: 'About' }
};

export const load: PageServerLoad = ({ params }) => {
    const post = posts[params.slug];
    if (!post) {
        throw error(404, `No post with slug "${params.slug}"`);
    }
    return { post };
};
```

## 4. Mini-build — a 404 you can trigger

**Paths:**

- `src/routes/modules/09a-load/08-error-redirect/+page.svelte` — index with three links
- `src/routes/modules/09a-load/08-error-redirect/[slug]/+page.server.ts`
- `src/routes/modules/09a-load/08-error-redirect/[slug]/+page.svelte`
- `src/routes/modules/09a-load/08-error-redirect/[slug]/+error.svelte`

Click **hello** or **about** and see a rendered post. Click **missing** and see the error boundary render a friendly 404.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why do you throw <code>error(...)</code> instead of returning an error object?</summary>

Because throwing it is how SvelteKit knows to stop the load, set the HTTP status, and render the nearest `+error.svelte`. Returning an error object would pass the error through as ordinary data and the page would try to render normally.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between <code>error()</code> and <code>redirect()</code>?</summary>

`error(status, message)` renders an error page with the given status. `redirect(status, location)` sends the browser to a different URL with a 3xx status.
</details>

<details>
<summary><strong>Q3.</strong> Where does <code>page.error</code> come from?</summary>

From the most recent `error(...)` call (or the `App.Error` returned by `handleError` for unexpected errors). It is `null` when there is no error.
</details>

<details>
<summary><strong>Q4.</strong> Why should a regular thrown <code>Error</code> not be shown directly to the user?</summary>

Because it may contain internal details, stack traces or sensitive values. SvelteKit routes unexpected errors through `handleError` so you can log the full thing and return a scrubbed message to the client.
</details>

<details>
<summary><strong>Q5.</strong> Can you throw <code>error()</code> from a component, not just a load function?</summary>

You can, but only from a component that runs during SSR (the initial render). Throwing from a client-only component after mount is too late to change the HTTP status. For runtime errors during interaction, use normal error handling or shallow routing.
</details>

## 6. Common mistakes

- **Returning the error instead of throwing it.** `return error(404, ...)` is a value, not an exception. SvelteKit ignores it and renders the page with garbage data.
- **Leaking internals.** `error(500, exception.message)` can expose stack traces. Use a generic message.
- **Using `error(3xx, ...)`.** Redirects belong in `redirect()`. Error helpers reject any non-error status code.
- **Forgetting a root `+error.svelte`.** Without one, an error at a deep route falls through to SvelteKit's default error page, which is fine for dev but looks unbranded in production.

## 7. What's next

Lesson 9A.9 shows how to return promises (not values) from load to stream slow data in progressively with `{#await}`.
