---
module: 15
lesson: 15.2
title: SvelteKit hooks for auth
duration: 45 minutes
prerequisites:
  - Lesson 15.1 (sessions, cookies, httpOnly)
  - Module 8 (routing, request lifecycle)
  - Module 9a (load functions)
learning_objectives:
  - Explain what hooks.server.ts does and when it runs
  - Write a handle function that reads a session cookie and sets event.locals.user
  - Type App.Locals in app.d.ts so the user object is available throughout the app
  - Describe the order of execution: hook → load → action → response
  - Use the resolve function to continue the request chain
status: ready
---

# Lesson 15.2 — SvelteKit hooks for auth

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — The gatekeeper that runs on every request

### 1.1 The problem: repeating auth checks everywhere

Imagine you have 30 routes in your app. Every single one needs to know who the current user is — to show their name in the header, to decide what data to load, to block unauthenticated visitors. Without a central place to do this, you would copy the same cookie-reading, session-looking-up, user-fetching code into every `+page.server.ts` and every `+layout.server.ts`. That is fragile, repetitive, and a guaranteed source of bugs.

SvelteKit solves this with **hooks** — specifically, the `handle` function inside `src/hooks.server.ts`. This function runs on **every single request** that hits your server, before any load function, before any form action, before anything else. It is the gatekeeper.

### 1.2 How hooks.server.ts works

The `handle` function receives two things:
- `event` — the full request context (URL, headers, cookies, locals)
- `resolve` — a function you must call to continue processing the request

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // 1. Read the session cookie
    const sessionId: string | undefined = event.cookies.get('session_id');

    if (sessionId) {
        // 2. Look up the session in your store
        const session = getSession(sessionId);
        if (session) {
            // 3. Find the user and attach to locals
            const user = findUserById(session.userId);
            if (user) {
                event.locals.user = toSafeUser(user);
            }
        }
    }

    // 4. Always call resolve to continue
    return resolve(event);
};
```

The critical insight: `event.locals` is a per-request object that you populate in the hook. It travels with the request through every load function and form action. By the time your `+page.server.ts` load function runs, `event.locals.user` is already there — populated or null.

### 1.3 Typing App.Locals

SvelteKit provides a global type namespace called `App`. You declare your types in `src/app.d.ts`:

```typescript
declare global {
    namespace App {
        interface Locals {
            user: import('$lib/auth/types').SafeUser | null;
        }
    }
}

export {};
```

Once you add this, TypeScript knows that `event.locals.user` is either a `SafeUser` object or `null` — everywhere in your app. No casting, no `any`, no guessing.

### 1.4 The execution order

Understanding when each piece runs is essential for debugging auth issues:

1. **`hooks.server.ts` → `handle`** runs first on every request
2. **`+layout.server.ts` → `load`** runs next (if present), receives `event.locals`
3. **`+page.server.ts` → `load`** runs for the specific page
4. **Form action** runs instead of load when a form is submitted via POST
5. **Response** is sent back to the browser

The hook always runs first. Always. Even for static assets (though you can short-circuit those). This is why it is the right place for auth — you never forget to check.

### 1.5 What is different from older patterns

In Svelte 3/4 era SvelteKit, people used `getSession` to expose session data to the client. That function is gone. The current pattern:

- Hook populates `event.locals.user`
- A root `+layout.server.ts` passes `locals.user` into page data
- Client components receive user info through the data prop

No stores, no `$session`, no client-side session management. The server is the source of truth.

## 2. Style it — Hook status indicator

The mini-build for this lesson shows a diagnostic panel that displays whether the hook detected a user. We style it as a developer-tools-style panel:

- Monospace font for the session ID display
- `var(--color-surface-2)` background with a left border in `var(--color-brand)` for visual distinction
- Status indicators using `var(--color-success)` for authenticated and `var(--color-error)` for unauthenticated
- Minimum 44px height on all status rows for touch accessibility

## 3. Interact — the sequence function and async flow

The key TypeScript concept is **async function composition**. The `handle` function is async and must `await` both the session lookup and the `resolve` call. A common mistake is forgetting to return `resolve(event)`:

```typescript
// BROKEN — returns undefined, page never renders
export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get('session_id');
    // ... auth logic ...
    resolve(event); // Missing return!
};
```

```typescript
// CORRECT — returns the Response from resolve
export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get('session_id');
    // ... auth logic ...
    return resolve(event); // Always return!
};
```

The `resolve` function produces a `Response`. If you do not return it, SvelteKit has nothing to send to the browser.

## 4. Mini-build — Hook diagnostic page

**File:** `src/routes/modules/15-auth/02-hooks-for-auth/+page.svelte`

This mini-build shows the current auth state as read by the hook. It uses a layout load function to pass the user from locals.

```svelte
<script lang="ts">
    import type { SafeUser } from '$lib/auth/types';

    interface Props {
        data: {
            user: SafeUser | null;
            hookRanAt: string;
        };
    }

    let { data }: Props = $props();
</script>

<svelte:head>
    <title>Lesson 15.2 · Hooks for auth</title>
</svelte:head>

<section class="page stack">
    <header>
        <p class="eyebrow">Lesson 15.2 · Mini-build</p>
        <h1>Hook diagnostic panel</h1>
    </header>

    <article class="hook-panel">
        <h2>Request lifecycle</h2>
        <dl class="hook-info">
            <dt>Hook ran at</dt>
            <dd class="mono">{data.hookRanAt}</dd>

            <dt>Auth status</dt>
            <dd>
                <span class="status-badge" class:status-badge--authed={data.user !== null}>
                    {data.user ? 'Authenticated' : 'Unauthenticated'}
                </span>
            </dd>

            <dt>User</dt>
            <dd class="mono">{data.user ? data.user.email : 'null'}</dd>
        </dl>
    </article>

    <article class="explanation-card">
        <h2>How it works</h2>
        <ol class="steps">
            <li>hooks.server.ts reads the <code>session_id</code> cookie</li>
            <li>If found, looks up the session in the in-memory store</li>
            <li>If valid, fetches the user and sets <code>event.locals.user</code></li>
            <li>The load function passes <code>locals.user</code> into page data</li>
        </ol>
        <p class="hint">Register and log in via Lessons 15.3–15.4 to see this panel change.</p>
    </article>
</section>

<style>
    section.page {
        --color-brand: oklch(65% 0.18 160);
    }

    .eyebrow {
        font-size: var(--text-sm);
        color: var(--color-brand);
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    .hook-panel {
        padding: var(--space-lg);
        background: var(--color-surface-2);
        border-inline-start: 4px solid var(--color-brand);
        border-radius: var(--radius-md);
    }

    .hook-info {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: var(--space-xs) var(--space-md);
        margin-block-start: var(--space-sm);
    }

    .hook-info dt {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        text-transform: uppercase;
        min-block-size: 44px;
        display: flex;
        align-items: center;
    }

    .hook-info dd {
        margin: 0;
        display: flex;
        align-items: center;
        min-block-size: 44px;
    }

    .mono {
        font-family: ui-monospace, monospace;
        font-size: var(--text-sm);
    }

    .status-badge {
        font-size: var(--text-xs);
        padding: 0.2em 0.8em;
        border-radius: var(--radius-full);
        background: var(--color-error);
        color: oklch(98% 0 0);
    }

    .status-badge--authed {
        background: var(--color-success);
        color: oklch(15% 0.02 145);
    }

    .explanation-card {
        padding: var(--space-lg);
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
    }

    .steps {
        padding-inline-start: var(--space-md);
    }

    .steps li {
        padding-block: var(--space-xs);
    }

    .hint {
        margin-block-start: var(--space-sm);
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        font-style: italic;
    }
</style>
```

### DevTools moment

1. Open Application > Cookies and note the absence or presence of a `session_id` cookie.
2. If you have registered and logged in (Lessons 15.3–15.4), you will see the cookie value here — a UUID. That UUID is the key the hook uses to look up your session.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> When does the handle function in hooks.server.ts run relative to load functions?</summary>

It runs before every load function. The hook is the very first server-side code that executes for any request. By the time a load function runs, `event.locals` is already populated by the hook.
</details>

<details>
<summary><strong>Q2.</strong> What happens if you forget to return resolve(event) from the handle function?</summary>

The function returns `undefined` instead of a `Response` object. SvelteKit cannot send anything to the browser, and the request fails. The page never renders. Always return the result of `resolve(event)`.
</details>

<details>
<summary><strong>Q3.</strong> Why do we use event.locals instead of a global variable to store the current user?</summary>

`event.locals` is scoped to a single request. A global variable would be shared across all concurrent requests on the server, meaning User A's data could leak into User B's response. Locals are per-request, per-user, and garbage-collected when the response is sent.
</details>

<details>
<summary><strong>Q4.</strong> What does the App.Locals interface in app.d.ts do?</summary>

It tells TypeScript the shape of `event.locals` throughout the entire application. Once you declare `user: SafeUser | null` in the interface, every load function and form action gets full type safety when accessing `event.locals.user` — no casting or type assertions needed.
</details>

<details>
<summary><strong>Q5.</strong> Why is SafeUser (without passwordHash) used in locals instead of the full User type?</summary>

The full `User` type includes `passwordHash`, which must never leave the server or be serialized into page data. `SafeUser` strips sensitive fields, ensuring that even if locals data accidentally reaches the client through a load function, no secret information is exposed.
</details>

## 6. Common mistakes

- **Forgetting to return resolve(event).** The most common hook bug. Your page appears blank or errors with an unhelpful message. Always check that resolve is returned.
- **Setting event.locals.user without null-checking.** If the session has expired or the cookie is missing, the session lookup returns null. Always guard: `if (session) { ... }`. Otherwise you get a runtime error trying to access properties on undefined.
- **Using a global variable instead of event.locals.** On the server, a global variable is shared across all requests. Two users hitting the server simultaneously would overwrite each other's data. Locals are per-request by design.

## 7. What's next

Lesson 15.3 builds the registration form — a form action that validates input with Valibot, hashes the password, and creates the user in your in-memory store.
