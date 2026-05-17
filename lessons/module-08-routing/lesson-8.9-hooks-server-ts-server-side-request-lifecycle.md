---
module: 8
lesson: 8.9
title: hooks.server.ts — request lifecycle
duration: 60 minutes
prerequisites:
  - Lesson 8.4 — File-based routing
  - Lesson 8.7 — $app/state
  - Comfort with TypeScript and async functions
learning_objectives:
  - Explain what a "hook" is in SvelteKit and which hooks run on the server
  - Write a handle() hook that adds a value to event.locals
  - Write a handleError() hook that captures and formats errors
  - Use getRequestEvent() from $app/server to access the event outside the hook
  - Understand how the async reroute hook rewrites a URL before matching
status: ready
---

# Lesson 8.9 — `hooks.server.ts` — request lifecycle

## 1. Concept — One file that sees every request

### 1.1 The problem — where does auth live?

Every real application needs code that runs on every request before the route is even selected. Authentication cookies have to be read. Locale has to be resolved from `Accept-Language`. Request IDs have to be generated for tracing. Errors have to be captured and sent somewhere. A database connection has to be attached so load functions do not each create their own.

You could put all of that logic at the top of every `+page.server.ts`, but it would be duplicated everywhere and easy to miss. You could extract it into a helper function, but you still have to remember to call it. The clean answer is a **hook**: a single file whose exported functions SvelteKit calls automatically around every request and every response.

That file is `src/hooks.server.ts`. It is optional, but most real projects have one from day one.

### 1.2 The three server hooks

SvelteKit's server side exposes three hook functions, each with a specific role.

- **`handle`** — the main middleware. It receives `{ event, resolve }` and must call `resolve(event)` to actually render the route. Anything you do before or after `resolve` runs around every request.
- **`handleError`** — called whenever a request throws an unexpected error. You use it to log the error and return a sanitised payload for the client.
- **`reroute`** (async, since SvelteKit 2.18) — rewrites a URL to a different route before matching. Use it for short links, internationalisation prefixes, or experimental redirects.

You export them from `src/hooks.server.ts`:

```ts
import type { Handle, HandleServerError, Reroute } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const start = performance.now();
    event.locals.requestId = crypto.randomUUID();

    const response = await resolve(event);

    response.headers.set('x-request-id', event.locals.requestId);
    console.log(`${event.request.method} ${event.url.pathname} ${performance.now() - start}ms`);
    return response;
};

export const handleError: HandleServerError = ({ error, event }) => {
    console.error('server error', { url: event.url.pathname, error });
    return { message: 'Something went wrong. Please try again.' };
};

export const reroute: Reroute = async ({ url }) => {
    if (url.pathname === '/short/blog') return '/blog/hello';
};
```

### 1.3 `event.locals` — the per-request lunchbox

`event.locals` is a plain object attached to the request. Whatever you put there in a hook is visible to every `load` function and every server endpoint that runs for the same request. Typical contents: an authenticated user object, a database handle, a request ID, a locale string.

Because `locals` is typed in `src/app.d.ts` via the `App.Locals` interface, you get full TypeScript coverage:

```ts
// src/app.d.ts
declare global {
    namespace App {
        interface Locals {
            user: { id: string; email: string } | null;
            requestId: string;
        }
    }
}
export {};
```

Your `handle` hook must populate these, and every downstream `load` can read them from `event.locals.user`.

### 1.4 `getRequestEvent` from `$app/server`

Sometimes you need the current request event from code that is not inside a load function — for example, a helper module that logs with the request ID. SvelteKit 2.20+ exposes `getRequestEvent()` from `$app/server`:

```ts
// src/lib/server/log.ts
import { getRequestEvent } from '$app/server';

export function log(message: string): void {
    const { locals } = getRequestEvent();
    console.log(`[${locals.requestId}] ${message}`);
}
```

`getRequestEvent` uses AsyncLocalStorage under the hood, so the event follows the async call stack. It throws if called outside a request context, which means you cannot accidentally use it on the client or during module initialisation.

### 1.5 `handleError` and client vs server

`handleError` exists in two flavours: one in `hooks.server.ts` for server-side errors, and one in `hooks.client.ts` (we do not cover that file separately in this module — it is identical in shape). Both receive `{ error, event, status, message }` and both must return an object of type `App.Error`. That return value becomes `page.error` in your `+error.svelte` component.

The critical rule: **do not leak raw error messages to the client**. Log the full error on the server; return a generic message in the object. A stack trace in a production response is a security hole.

### 1.6 `reroute` — the URL rewriter

`reroute` is the newest of the three hooks and is how you implement features like:

- Short links that expand to real routes
- A/B experiments that route a percentage of traffic to an alternate version
- Locale prefixes that strip before matching (`/fr/about` becomes `/about` internally, with the locale stored in a cookie)

The function returns either a string (the new pathname) or nothing (no rewrite). It is called before route matching, so the rewritten path is the one that gets matched against `src/routes`.

### 1.7 Why hooks run only on the server

Everything in `hooks.server.ts` runs in Node (or your adapter's equivalent). It never ships to the browser. This is important for two reasons: you can safely `import` server-only modules (database clients, secrets), and the bundle the client downloads is smaller.



## Going Deeper

**Official documentation:**
- [SvelteKit docs: hooks.server.ts](https://svelte.dev/docs/kit/hooks#Server-hooks)
- [SvelteKit docs: event.locals](https://svelte.dev/docs/kit/types#App.Locals)
- [SvelteKit docs: handle](https://svelte.dev/docs/kit/hooks#Server-hooks-handle)

**Advanced pattern:** Build a `handle` hook that adds a `x-request-id` header to every response and logs the request method, URL, and duration.

**Challenge question:** (Combines Lessons 8.9, 8.4, and 8.2) Build a handle hook that reads a `theme` cookie and injects it into `event.locals`. Use it in a layout load function to render the correct theme. Walk through the full request lifecycle from browser to response.

## 2. Style it — PE7 for a request log

The mini-build reads a request ID that was set in `hooks.server.ts` via `event.locals.requestId` and displays it on the page via a `+page.server.ts` load function. We give the page a slate personality (`oklch(55% 0.05 260)`) to feel like a server console. The request ID is monospaced and bordered with `var(--color-border)`.

## 3. Interact — loading server-only data

The lesson route has a colocated `+page.server.ts` that reads `event.locals.requestId` and returns it to the page. The page renders the value. On every reload the request ID changes — because every request is new and `hooks.server.ts` generates a fresh UUID.

```ts
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
    return { requestId: locals.requestId ?? 'not-set' };
};
```

Note: in this course repository we do not have a project-wide `hooks.server.ts` guaranteed to set `requestId` — this lesson is conceptual about the hook, and the mini-build falls back to `'not-set'` if locals is empty. A real project would set the value in `handle`.

## 4. Mini-build — request ID display

**Paths:**

- `src/routes/modules/08-routing/09-hooks-server/+page.svelte`
- `src/routes/modules/08-routing/09-hooks-server/+page.server.ts`

Open `/modules/08-routing/09-hooks-server`. The page displays the request method, URL, locale (from `Accept-Language` or a safe default) and a per-request ID. Reload a few times; the ID changes every request.

### Prove it

Open DevTools → Network → Doc → reload. Click the response and look at its headers. In a project that wires up the request ID in `handle`, you would see an `x-request-id` header set to the same value displayed on the page. That proves the hook saw the request and wrote into the response.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the role of <code>handle()</code> in <code>hooks.server.ts</code>?</summary>

It is the main server-side middleware. SvelteKit calls `handle` for every request, passes in `{ event, resolve }`, and lets you run code before and after `resolve(event)` — which is the call that actually renders the route.
</details>

<details>
<summary><strong>Q2.</strong> Why do you put things on <code>event.locals</code>?</summary>

Because `locals` is a per-request object that is passed to every load function and server endpoint for the same request. It is the standard channel for "things decided in the hook, used later in the pipeline" — authenticated user, database handle, request ID, locale.
</details>

<details>
<summary><strong>Q3.</strong> What should <code>handleError()</code> return, and why?</summary>

An object matching `App.Error` — typically `{ message: string }` with an optional code. The object becomes `page.error` in the `+error.svelte` component. It must not contain raw error internals, stack traces or secrets, because it is sent to the client.
</details>

<details>
<summary><strong>Q4.</strong> How do you access the current request event from a helper module that is not a load function?</summary>

`import { getRequestEvent } from '$app/server'` and call `getRequestEvent()`. It returns the same event the current request is using, thanks to AsyncLocalStorage. It throws if called outside a request context.
</details>

<details>
<summary><strong>Q5.</strong> When would you use <code>reroute</code> instead of a redirect?</summary>

When you want the URL the user sees to stay the same, but you want a different route to handle it. For example, mapping `/fr/about` to the `/about` route while stashing the locale in a cookie. A redirect would change the URL bar; `reroute` is transparent.
</details>

## 6. Common mistakes

- **Forgetting to call `resolve(event)` in `handle`.** Without it, no route renders and every request hangs.
- **Importing a browser-only module in `hooks.server.ts`.** This file runs in Node. Modules that depend on `window`, `document` or `HTMLElement` will crash the server.
- **Returning the raw error object from `handleError`.** Security hole. Log internally, return a scrubbed message to the client.
- **Declaring `event.locals` without typing `App.Locals` in `src/app.d.ts`.** TypeScript will widen everything to `any`, and mistakes will slip through.

## 7. What's next

Lesson 8.10 extends `hooks.server.ts` with `instrumentation.server.ts` and OpenTelemetry, so every request is traced for production debugging.
