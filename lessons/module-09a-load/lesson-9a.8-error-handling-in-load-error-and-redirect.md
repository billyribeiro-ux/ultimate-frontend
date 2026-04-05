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

### 1.7 What April 2026 changes

Nothing in the API shape. `error` and `redirect` have been stable since SvelteKit 1.0. What did change is that in April 2026 the `error` helper throws synchronously (no `throw` keyword needed in newest SvelteKit versions), but the `throw error(...)` form still works and is what we teach for clarity.

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
