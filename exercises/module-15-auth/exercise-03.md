---
module: 15
exercise: 3
title: Protected Route Redirect
difficulty: advanced
estimated_time: 30
skills_tested:
  - server load functions
  - redirect responses
  - layout-level auth guards
  - URL-based redirect return
  - auth state propagation
---

# Exercise 15.3 — Protected Route Redirect

## Brief

Create a group of protected routes that require authentication. Unauthenticated users are redirected to a login page with a `?redirect=` query parameter so they can be sent back after logging in. This exercise teaches route-level access control using SvelteKit's load functions and redirect mechanism.

## Requirements

1. Create a route group `src/routes/exercises/15-auth/03/(protected)/` with a `+layout.server.ts`
2. The layout load function must check `locals.user` — if null, throw `redirect(303, '/exercises/15-auth/03/login?redirect=' + url.pathname)`
3. Create a protected page at `src/routes/exercises/15-auth/03/(protected)/dashboard/+page.svelte`
4. The dashboard must display the authenticated user's information
5. Create a login page at `src/routes/exercises/15-auth/03/login/+page.svelte`
6. The login page must read the `redirect` query parameter and display it ("You will be redirected to: ...")
7. Create a mock login form action that sets a session cookie and redirects to the `redirect` URL (or a default dashboard)
8. Create a `+layout.svelte` for the protected group that shows a user badge in the header
9. Pass the user data from the layout load function to child pages via layout data
10. Style all pages with PE7 tokens

## Constraints

- No client-side auth checks — all protection happens in server load functions
- The redirect URL must be validated (only allow relative paths, no external URLs)
- TypeScript strict mode with zero errors
- The redirect flow must work without JavaScript

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

SvelteKit route groups (parenthesized folder names like `(protected)`) allow you to apply a layout without affecting the URL. The `+layout.server.ts` load function runs before any child page load functions, making it the perfect place for an auth guard.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

In the layout load function, `throw redirect(303, targetUrl)` immediately stops processing and sends a redirect response. The login page reads `url.searchParams.get('redirect')` to know where to send the user after login. Validate the redirect URL by checking it starts with `/` and does not contain `//` (prevents open redirect attacks).
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// (protected)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.user) {
    const returnTo = encodeURIComponent(url.pathname);
    redirect(303, `/exercises/15-auth/03/login?redirect=${returnTo}`);
  }
  return { user: locals.user };
};
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/15-auth/03/(protected)/+layout.server.ts`**

```typescript
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.user) {
    const returnTo = encodeURIComponent(url.pathname);
    redirect(303, `/exercises/15-auth/03/login?redirect=${returnTo}`);
  }

  return {
    user: locals.user
  };
};
```

**`src/routes/exercises/15-auth/03/(protected)/+layout.svelte`**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    data: {
      user: { id: string; email: string; name: string };
    };
    children: Snippet;
  }

  let { data, children }: Props = $props();
</script>

<div class="protected-layout">
  <header class="topbar">
    <span class="badge">{data.user.name}</span>
    <a href="/exercises/15-auth/03/login?action=logout" class="logout-link">Log out</a>
  </header>

  <div class="content">
    {@render children()}
  </div>
</div>

<style>
  .protected-layout {
    min-block-size: 100vh;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background: var(--color-surface-2);
    border-block-end: 1px solid var(--color-border);
  }

  .badge {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    background: var(--color-surface);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-full);
    border: 1px solid var(--color-border);
  }

  .logout-link {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    text-decoration: none;
  }

  .logout-link:hover {
    color: var(--color-error);
  }

  .content {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
    inline-size: 100%;
  }
</style>
```

**`src/routes/exercises/15-auth/03/(protected)/dashboard/+page.svelte`**

```svelte
<script lang="ts">
  interface Props {
    data: {
      user: { id: string; email: string; name: string };
    };
  }

  let { data }: Props = $props();
</script>

<main>
  <h1>Dashboard</h1>
  <p class="subtitle">You are authenticated and viewing a protected page.</p>

  <div class="info-card">
    <h2>Your Profile</h2>
    <dl>
      <dt>Name</dt>
      <dd>{data.user.name}</dd>
      <dt>Email</dt>
      <dd>{data.user.email}</dd>
      <dt>User ID</dt>
      <dd><code>{data.user.id}</code></dd>
    </dl>
  </div>
</main>

<style>
  h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-xs);
  }

  .subtitle {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    margin-block-end: var(--space-xl);
  }

  .info-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    max-inline-size: 24rem;
  }

  .info-card h2 {
    font-size: var(--text-lg);
    margin-block-end: var(--space-md);
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-xs) var(--space-md);
  }

  dt {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-muted);
  }

  dd {
    font-size: var(--text-sm);
    color: var(--color-text);
  }

  code {
    font-size: var(--text-xs);
    background: var(--color-surface);
    padding: 0.1em 0.4em;
    border-radius: var(--radius-sm);
  }
</style>
```

**`src/routes/exercises/15-auth/03/login/+page.server.ts`**

```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

function isValidRedirect(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}

export const load: PageServerLoad = async ({ url }) => {
  const redirectTo = url.searchParams.get('redirect');
  return {
    redirectTo: redirectTo && isValidRedirect(redirectTo) ? redirectTo : null
  };
};

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email')?.toString().trim() ?? '';
    const password = formData.get('password')?.toString() ?? '';
    const redirectTo = formData.get('redirect')?.toString() ?? '';

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required', email });
    }

    // Mock authentication — accept any valid-looking credentials
    const user = {
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email
    };

    cookies.set('session', JSON.stringify(user), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60 * 24 * 7
    });

    const target = redirectTo && isValidRedirect(redirectTo)
      ? redirectTo
      : '/exercises/15-auth/03/dashboard';

    redirect(303, target);
  }
};
```

**`src/routes/exercises/15-auth/03/login/+page.svelte`**

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';

  interface Props {
    data: { redirectTo: string | null };
    form: { error?: string; email?: string } | null;
  }

  let { data, form }: Props = $props();
</script>

<main class="page">
  <div class="card">
    <h1>Log In</h1>

    {#if data.redirectTo}
      <p class="redirect-notice">After login, you will be redirected to: <code>{data.redirectTo}</code></p>
    {/if}

    {#if form?.error}
      <p class="error">{form.error}</p>
    {/if}

    <form method="POST" action="?/login" use:enhance>
      {#if data.redirectTo}
        <input type="hidden" name="redirect" value={data.redirectTo} />
      {/if}

      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required value={form?.email ?? ''} />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" required />
      </div>

      <button type="submit" class="btn">Log In</button>
    </form>
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
    display: grid;
    place-items: center;
    min-block-size: 70vh;
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    max-inline-size: 24rem;
    inline-size: 100%;
    box-shadow: var(--shadow-md);
  }

  h1 {
    font-size: var(--text-xl);
    margin-block-end: var(--space-md);
  }

  .redirect-notice {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    background: var(--color-surface);
    padding: var(--space-sm);
    border-radius: var(--radius-sm);
    margin-block-end: var(--space-md);
  }

  .redirect-notice code {
    font-weight: 600;
    color: var(--color-brand);
  }

  .error {
    font-size: var(--text-sm);
    color: var(--color-error);
    margin-block-end: var(--space-md);
  }

  form {
    display: grid;
    gap: var(--space-md);
  }

  .field {
    display: grid;
    gap: var(--space-xs);
  }

  label {
    font-size: var(--text-sm);
    font-weight: 600;
  }

  input {
    padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    background: var(--color-surface);
    color: var(--color-text);
  }

  input:focus {
    outline: 2px solid var(--color-brand);
    outline-offset: 1px;
  }

  .btn {
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-brand);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    margin-block-start: var(--space-sm);
  }
</style>
```

### Explanation

This exercise demonstrates the production auth guard pattern. The `(protected)` route group applies a layout server load function without adding a URL segment. By throwing `redirect(303, ...)` when `locals.user` is null, SvelteKit short-circuits the entire request — no child load functions run, no page components render. The redirect URL includes the original path as a `?redirect=` parameter, enabling the login page to send the user back after authentication. The `isValidRedirect` function prevents open redirect attacks by ensuring the URL starts with `/` and does not start with `//` (which browsers interpret as protocol-relative URLs to external domains). The layout component renders a user badge and logout link for all protected pages. The login form action reads the `redirect` hidden input and, after setting the session cookie, redirects the user to their original destination. This is the exact pattern used by production apps like GitHub and Vercel.
</details>
