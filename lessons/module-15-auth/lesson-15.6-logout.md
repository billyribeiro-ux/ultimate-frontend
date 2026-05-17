---
module: 15
lesson: 15.6
title: Logout
duration: 35 minutes
prerequisites:
  - Lesson 15.4 (login, session cookies)
  - Lesson 15.5 (protected routes)
  - Module 10 (form actions, use:enhance)
learning_objectives:
  - Build a logout form action that deletes the session and clears the cookie
  - Explain why logout must be a POST action, not a GET link
  - Use invalidateAll() to refresh all load functions after logout
  - Implement the use:enhance callback to handle post-logout navigation
  - Describe what happens to the session record when a user logs out
status: ready
---

# Lesson 15.6 — Logout

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Ending a session cleanly

### 1.1 The problem: "just delete the cookie" is not enough

Logout sounds simple — remove the session cookie and the user is no longer authenticated. But there are two places a session exists:

1. **The cookie** in the browser (the key)
2. **The session record** in your server store (the lock)

If you only delete the cookie, the session record remains in memory. An attacker who somehow captured the session ID (network sniffing before HTTPS, browser extension, physical access to the machine) could still use it. You must delete both: the cookie from the browser and the record from the server store.

### 1.2 Why logout must be a POST, not a GET

It is tempting to make logout a simple link: `<a href="/logout">Log out</a>`. This is wrong for two reasons:

1. **GET requests should not modify state.** This is a foundational principle of HTTP. Logout modifies server state (deletes the session). It must be a POST.
2. **Prefetching attacks.** Browsers, search engines, and link-preview bots follow GET links. If logout is a GET endpoint, a bot crawling your site could log out all your users. SvelteKit itself prefetches links on hover by default — meaning hovering over a GET logout link would log the user out before they even click.

The correct pattern is a `<form>` with `method="POST"` and a submit button styled to look however you want:

```svelte
<form method="POST" action="/logout" use:enhance>
    <button type="submit">Log out</button>
</form>
```

### 1.3 The logout action

```typescript
// src/routes/logout/+page.server.ts
import { redirect } from '@sveltejs/kit';
import { deleteSession } from '$lib/auth/session';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ cookies }) => {
        const sessionId: string | undefined = cookies.get('session_id');

        if (sessionId) {
            deleteSession(sessionId); // Remove from server store
        }

        cookies.delete('session_id', { path: '/' }); // Remove from browser

        redirect(302, '/login');
    }
};
```

Two deletions: `deleteSession()` removes the record from the in-memory Map; `cookies.delete()` tells the browser to discard the cookie by setting it with an expired date.

### 1.4 invalidateAll() — refreshing the client after logout

When using `use:enhance`, the form submission happens via JavaScript without a full page reload. After the server deletes the session, the client-side data is stale — the layout still shows the user's name, protected routes still appear accessible.

`invalidateAll()` tells SvelteKit to re-run all active load functions. Since the session is gone, the hook will set `locals.user = null`, load functions will return null user data, and the UI updates to reflect the logged-out state.

```svelte
<form method="POST" action="?/logout" use:enhance={() => {
    return async ({ update }) => {
        await update();
        await invalidateAll();
    };
}}>
```

In practice, if your logout action redirects (which it should), `use:enhance` handles the navigation automatically and the new page runs fresh load functions. `invalidateAll` is most useful when you stay on the same page after logout.

### 1.5 The flow in full

1. User clicks "Log out" button
2. Form POSTs to the logout action
3. Action reads the session ID from the cookie
4. Action calls `deleteSession(sessionId)` — server record gone
5. Action calls `cookies.delete('session_id', { path: '/' })` — browser cookie gone
6. Action calls `redirect(302, '/login')` — user lands on login page
7. Next request: hook finds no cookie, sets `locals.user = null`

## 2. Style it — The logout confirmation page

The logout page is minimal — a confirmation message and a link back to login. We style the logout button as a destructive action:

- Red-tinted border: `1px solid var(--color-error)`
- Button text in `var(--color-error)` to signal "this ends your session"
- After logout: a success card in `var(--color-surface-2)` confirming the session is ended
- Same 44px touch target on the button

## 3. Interact — the form action enhance callback

The TypeScript concept is **callback functions as arguments to `use:enhance`**. The `enhance` action accepts an optional function that runs before the form submits and returns a function that runs after:

```typescript
use:enhance(() => {
    // Before submit — show loading state
    return async ({ result, update }) => {
        // After submit — handle the result
        if (result.type === 'redirect') {
            await update(); // Follow the redirect
        }
    };
}}
```

The mistake:

```typescript
// BROKEN — forgetting to call update() means the page never transitions
use:enhance={() => {
    return async ({ result }) => {
        console.log('Logged out!');
        // Page is stuck — no navigation happens
    };
}}
```

Always call `update()` (or manually navigate with `goto()`) in the callback to ensure the UI reflects the action's result.

## 4. Mini-build — Logout page with session deletion

**File:** `src/routes/modules/15-auth/06-logout/+page.svelte`

```svelte
<script lang="ts">
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import type { SafeUser } from '$lib/auth/types';

    interface Props {
        data: {
            user: SafeUser | null;
        };
    }

    let { data }: Props = $props();
</script>

<svelte:head>
    <title>Lesson 15.6 · Logout</title>
</svelte:head>

<section class="page stack">
    <header>
        <p class="eyebrow">Lesson 15.6 · Mini-build</p>
        <h1>Logout</h1>
    </header>

    {#if data.user}
        <article class="logout-card">
            <p>You are currently logged in as <strong>{data.user.email}</strong>.</p>
            <form method="POST" use:enhance>
                <button type="submit" class="logout-btn">Log out</button>
            </form>
        </article>
    {:else}
        <article class="logged-out-card">
            <h2>Session ended</h2>
            <p>You are not logged in.</p>
            <a href="/modules/15-auth/04-login" class="login-link">Go to login</a>
        </article>
    {/if}
</section>
```

### DevTools moment

1. Open Application > Cookies before clicking logout. Note the `session_id` cookie.
2. Click "Log out."
3. Check Application > Cookies again — the `session_id` cookie is gone.
4. Try navigating to Lesson 15.5 (the protected route). You should be redirected to login.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why must logout be a POST request instead of a GET link?</summary>

GET requests should not modify server state (this is an HTTP principle). Additionally, browsers, bots, and SvelteKit's link prefetching follow GET links automatically — meaning a GET logout endpoint could be triggered without the user's intent. POST requires an explicit form submission.
</details>

<details>
<summary><strong>Q2.</strong> What are the two things that must be deleted during logout?</summary>

(1) The session record on the server (via `deleteSession(sessionId)` — removes it from the in-memory store). (2) The session cookie in the browser (via `cookies.delete('session_id', { path: '/' })` — tells the browser to discard it). Deleting only one leaves a dangling reference.
</details>

<details>
<summary><strong>Q3.</strong> Why pass { path: '/' } to cookies.delete()?</summary>

The path must match the path used when the cookie was originally set. If you set the cookie with `path: '/'` but try to delete it without specifying the path, the deletion targets only the current path. The original cookie remains intact on all other routes.
</details>

<details>
<summary><strong>Q4.</strong> What does invalidateAll() do after logout?</summary>

It tells SvelteKit to re-run all currently active load functions. Since the session cookie is now deleted, the hook sets `locals.user = null`, and all load functions return updated data reflecting the unauthenticated state. The UI re-renders accordingly.
</details>

<details>
<summary><strong>Q5.</strong> What would happen if you only deleted the cookie but not the server session record?</summary>

The cookie is gone from the user's browser, so they appear logged out. But the session record still exists in the server store. If an attacker had previously captured the session ID, they could craft a request with that ID in a cookie and the server would still accept it as valid until the session expires naturally.
</details>

## 6. Common mistakes

- **Making logout a GET link.** Prefetching, bots, and the principle of safe GET requests all make this dangerous. Always use a POST form.
- **Forgetting { path: '/' } when deleting the cookie.** The cookie silently persists because the deletion targets the wrong path. The user appears to log out but is still authenticated on the next request.
- **Not calling update() in the enhance callback.** The page stays frozen. The server processed the logout, but the client never navigates or refreshes.

## 7. What's next

Lesson 15.7 introduces OAuth — the protocol that lets users log in with a third-party provider (Google, GitHub, etc.) instead of creating a password on your site.
