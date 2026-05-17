---
module: 15
lesson: 15.5
title: Protected routes
duration: 40 minutes
prerequisites:
  - Lesson 15.4 (login, session cookies)
  - Lesson 15.2 (hooks, event.locals)
  - Module 9a (load functions, typed PageData)
learning_objectives:
  - Protect a route by checking event.locals.user in a load function
  - Use redirect(302, '/login') to bounce unauthenticated visitors
  - Type PageData so that user is guaranteed non-null on protected pages
  - Explain the difference between protecting a single page vs a layout group
  - Display user-specific content based on the authenticated user
status: ready
---

# Lesson 15.5 — Protected routes

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Keeping strangers out of private pages

### 1.1 The problem: anyone can type a URL

Authentication without route protection is useless. A user who never logs in can type `/dashboard` into the address bar and see whatever is there. The session cookie tells the hook who the user is — but nothing stops an unauthenticated request from reaching a page unless you explicitly check.

Route protection means: before the page loads, verify that `event.locals.user` exists. If it does not, redirect to the login page. The user never sees a flash of private content.

### 1.2 Protecting a single page

The simplest approach is checking in the page's own load function:

```typescript
// src/routes/dashboard/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(302, '/login');
    }

    return {
        user: locals.user
    };
};
```

If `locals.user` is null (the hook did not find a valid session), we redirect immediately. The page component never renders. If the user is authenticated, we return their data and the page renders with full type safety.

### 1.3 Protecting a group of routes with a layout

If you have many protected pages (dashboard, settings, profile, etc.), checking in every individual page is repetitive. Instead, use a layout load function:

```typescript
// src/routes/(protected)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(302, '/login');
    }

    return {
        user: locals.user
    };
};
```

Every page inside the `(protected)` route group inherits this check. You write it once; it guards everything beneath it.

### 1.4 Type narrowing after the guard

After the redirect check, TypeScript knows that `locals.user` is not null — the `redirect()` has return type `never`, so if execution continues past the check, `locals.user` must be `SafeUser`. This means your page component receives:

```typescript
interface Props {
    data: {
        user: SafeUser; // not SafeUser | null — guaranteed by the guard
    };
}
```

This is type narrowing in action. The guard eliminates the null case, and TypeScript propagates that knowledge.

### 1.5 The user experience of being bounced

When an unauthenticated user hits a protected route:

1. The hook runs — finds no session cookie, sets `locals.user = null`
2. The load function runs — sees null, throws `redirect(302, '/login')`
3. The browser receives a 302 response pointing to `/login`
4. The browser navigates to `/login`

The user sees the login page. No flash of private content, no loading spinner, no JavaScript-dependent check. This works even with JS disabled because the redirect happens on the server before any HTML is sent.

### 1.6 Preserving the intended destination (redirect back after login)

When an unauthenticated user tries to access `/dashboard/settings`, they are bounced to `/login`. After they log in, they should be sent to `/dashboard/settings` — not just `/dashboard`. The pattern:

1. In the protected load function, include the current URL as a query parameter:
   ```typescript
   redirect(302, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
   ```
2. In the login action, after successful authentication, check for the `redirectTo` parameter:
   ```typescript
   const redirectTo = event.url.searchParams.get('redirectTo') || '/dashboard';
   redirect(302, redirectTo);
   ```

This is a small UX detail that makes a large difference. Without it, users who bookmark protected pages or follow deep links from emails must navigate manually after login.

Security note: always validate that `redirectTo` is a relative path on your own domain. An attacker could craft a link like `/login?redirectTo=https://evil.com` to redirect users to a phishing site after login. Check that the URL starts with `/` and does not contain `//`.

### 1.7 Layered protection: layouts vs pages vs hooks

You have three places to check authentication:

1. **In the hook** — you could redirect in the hook itself based on the URL path. This is the most centralized but hardest to maintain (you need a list of protected paths as strings).
2. **In a layout load function** — protects an entire route group. Any route inside the group is automatically guarded.
3. **In a page load function** — protects a single specific page.

The recommended approach for most applications is the **layout strategy**: create a `(protected)` route group with a layout that checks auth. Pages that need different access levels (admin-only, owner-only) add their own page-level checks on top.

```
src/routes/
├── (public)/          ← no auth check
│   ├── +page.svelte   ← home page
│   └── login/
├── (protected)/       ← layout checks auth
│   ├── +layout.server.ts  ← redirects if !user
│   ├── dashboard/
│   ├── settings/
│   └── admin/
│       └── +page.server.ts  ← additional role check
```

### 1.8 Authorization beyond authentication

This lesson proves identity (authentication). But knowing who someone is does not mean they can do everything. A regular user should not access admin pages. A user should not edit another user's profile.

Authorization checks happen after the auth guard:

```typescript
export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(302, '/login');
    if (locals.user.role !== 'admin') error(403, 'Admin access required');
    return { user: locals.user };
};
```

The `403 Forbidden` response (via SvelteKit's `error()`) is different from the `302 Redirect` for unauthenticated users. A 403 means "I know who you are, but you are not allowed here." A 302 to login means "I do not know who you are yet."

## Deep Dive

**Why this matters at scale.** In a real application with dozens of routes, forgetting to protect a single page is a data breach waiting to happen. The layout-based approach makes protection structural rather than manual — you cannot accidentally forget because new pages inside the protected group inherit the guard automatically. Code review only needs to verify that new routes are placed in the correct group, not that each individual page has auth logic.

**The mental model.** Think of route protection as building security zones in a physical building. The `(public)` zone is the lobby — anyone can enter. The `(protected)` zone is behind a badge reader — only people with valid badges (session cookies) pass through. The `admin/` area is behind a second badge reader that checks your badge level. Each zone inherits the restrictions of its parent. You never have to post a guard at every individual office door because the zone entrance handles it.

**Edge cases.** A user's session expires while they are actively using a protected page. Their next navigation (clicking a link inside the app) triggers a load function that finds `locals.user = null` and redirects to login. This is correct behavior but can be jarring. Some applications detect "session about to expire" and show a warning toast, giving the user time to save work before being bounced. Another edge case: server-side vs client-side navigation. During SSR (first page load), the redirect is a proper 302 HTTP response — the browser never sees the protected HTML. During client-side navigation (SvelteKit's router), the redirect happens in JavaScript after the load function returns — there is no flash because SvelteKit does not render the page until load completes.

**Performance.** Route protection via load functions adds zero latency beyond the session lookup (which already happened in the hook). The `if (!locals.user)` check is a single null comparison — nanoseconds. The `redirect()` call short-circuits the load function, so no unnecessary database queries run for unauthenticated users. This is efficient by design: unauthenticated requests to protected routes are the cheapest possible requests because they bail out immediately.

**Cross-module connections.** Protected routes connect to Module 8 (routing — route groups and layout inheritance), Module 9a (load functions — the load/redirect pattern), Module 15.2 (hooks — `event.locals.user` is populated before load runs), and Module 1 (TypeScript — type narrowing via `redirect`'s `never` return type). The `$derived` usage in the mini-build for formatting the date connects back to Module 2's derived state concepts.

## 2. Style it — The protected dashboard card

Protected pages get a slightly different visual treatment to signal "you are inside the authenticated area":

- A welcome banner using the user's name in `var(--text-xl)`
- Session metadata (email, creation date) displayed in a `var(--color-surface-2)` card
- A subtle left border in `var(--color-brand)` to echo the hook diagnostic style
- All interactive elements maintain 44px touch targets

## 3. Interact — TypeScript type narrowing with redirect

The TypeScript concept is **control-flow type narrowing via `never`-returning functions**. When you call `redirect()` inside a conditional that checks `if (!locals.user)`, TypeScript understands that after that block, `locals.user` cannot be null:

```typescript
// Before the check: locals.user is SafeUser | null
if (!locals.user) {
    redirect(302, '/login'); // return type: never
}
// After the check: locals.user is SafeUser (null eliminated)
return { user: locals.user }; // TypeScript knows this is SafeUser
```

A common mistake is assigning the redirect to a variable or wrapping it in logic that prevents TypeScript from recognizing the narrowing:

```typescript
// BROKEN — TypeScript cannot narrow through this
const shouldRedirect: boolean = !locals.user;
if (shouldRedirect) {
    redirect(302, '/login');
}
// locals.user is still SafeUser | null here — TypeScript lost the connection
```

Always check `locals.user` directly in the condition for proper narrowing.

## 4. Mini-build — Protected dashboard page

**File:** `src/routes/modules/15-auth/05-protected-routes/+page.svelte`

```svelte
<script lang="ts">
    import type { SafeUser } from '$lib/auth/types';

    interface Props {
        data: {
            user: SafeUser;
            sessionExpiresAt: string;
        };
    }

    let { data }: Props = $props();

    const memberSince: string = $derived(
        new Date(data.user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    );
</script>

<svelte:head>
    <title>Lesson 15.5 · Protected routes</title>
</svelte:head>

<section class="page stack">
    <header>
        <p class="eyebrow">Lesson 15.5 · Mini-build</p>
        <h1>Welcome, {data.user.name}</h1>
    </header>

    <article class="dashboard-card">
        <h2>Your account</h2>
        <dl class="account-info">
            <dt>Email</dt>
            <dd>{data.user.email}</dd>

            <dt>Member since</dt>
            <dd>{memberSince}</dd>

            <dt>Session expires</dt>
            <dd class="mono">{data.sessionExpiresAt}</dd>
        </dl>
    </article>

    <article class="protected-badge">
        <p>This page is protected. If you were not authenticated, you would have been
        redirected to the <a href="/modules/15-auth/04-login">login page</a>.</p>
    </article>

    <nav class="auth-nav">
        <a href="/modules/15-auth/06-logout">Log out</a>
    </nav>
</section>
```

### DevTools moment

1. Open a private/incognito window and navigate directly to this route. You should be redirected to the login page instantly.
2. Check the Network tab — you will see a 302 response for the protected route, followed by the login page loading. No private content was leaked.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is it important that the auth check happens in a server load function rather than in the client component?</summary>

A server load function runs before any HTML is sent to the browser. The redirect happens at the HTTP level — the browser never receives the protected page's content. If you checked in a client component, the page HTML would be sent first (visible briefly), then JavaScript would redirect — exposing private content momentarily and to anyone who disables JS.
</details>

<details>
<summary><strong>Q2.</strong> What is a route group like (protected) and why is it useful for auth?</summary>

A route group is a directory in SvelteKit's routes folder wrapped in parentheses. It does not affect the URL (no `/protected/` segment appears) but allows you to share a layout. By placing an auth-checking `+layout.server.ts` in a `(protected)` group, every page inside inherits the guard without repeating the check.
</details>

<details>
<summary><strong>Q3.</strong> After calling redirect(302, '/login') in a load function, can code after it still execute?</summary>

No. `redirect()` throws an exception (return type `never`). Execution stops immediately. SvelteKit catches the thrown redirect internally and sends a 302 HTTP response. Any code written after `redirect()` is dead code.
</details>

<details>
<summary><strong>Q4.</strong> Why does TypeScript narrow locals.user to non-null after the redirect guard?</summary>

Because `redirect()` has return type `never`, TypeScript knows that if execution reaches the code after the `if (!locals.user) { redirect(...) }` block, the condition must have been false — meaning `locals.user` is not null. This is control-flow narrowing based on the `never` type.
</details>

<details>
<summary><strong>Q5.</strong> What status code does a typical auth redirect use and why 302 instead of 301?</summary>

302 (Found/Temporary Redirect). A 301 is permanent — the browser caches it and never requests the original URL again. An auth redirect is not permanent; once the user logs in, they should be able to access the route. Using 301 would break the flow because the browser would skip the route forever.
</details>

## 6. Common mistakes

- **Checking auth in the client component.** The page HTML is already sent by the time client JS runs. Private content is visible in the page source and briefly on screen. Always check on the server.
- **Using 301 instead of 302.** A 301 redirect is cached permanently by the browser. The user will never be able to access the protected route again (even after logging in) until they clear their cache.
- **Forgetting to return user data after the guard.** If you check auth but do not return `{ user: locals.user }`, your page component has no data. Always return what the page needs after confirming the user is authenticated.

## 7. What's next

Lesson 15.6 builds the logout action — a form action that deletes the session, clears the cookie, and uses `invalidateAll` to refresh the client-side auth state.
