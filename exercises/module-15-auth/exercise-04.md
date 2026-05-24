---
module: 15
exercise: 4
title: Logout Flow
difficulty: expert
estimated_time: 45
skills_tested:
  - cookie clearing
  - client-side invalidation
  - redirect chains
  - CSRF protection for logout
  - session cleanup patterns
---

# Exercise 15.4 — Logout Flow

## Brief

Implement a complete logout flow that clears the session cookie, invalidates all client-side cached data, and redirects the user to the home page with a confirmation message. The logout must be a POST action (not a GET link) to prevent CSRF attacks. This exercise teaches the often-overlooked complexity of properly ending a session.

## Requirements

1. Create `src/routes/exercises/15-auth/04/+page.svelte` as a dashboard showing the logged-in user
2. Create `src/routes/exercises/15-auth/04/+page.server.ts` with a `load` function and a `logout` action
3. The logout must be triggered by a `<form method="POST" action="?/logout">` (not a link)
4. In the logout action: clear the session cookie using `cookies.delete('session', { path: '/' })`
5. After clearing the cookie, redirect to a logout confirmation page
6. Create `src/routes/exercises/15-auth/04/logged-out/+page.svelte` with a "You have been logged out" message
7. On the client side, use `invalidateAll()` from `$app/navigation` inside `use:enhance` to clear cached data
8. Add a confirmation dialog before logout: "Are you sure you want to log out?"
9. Show a toast-style notification on the logged-out page that auto-dismisses after 5 seconds
10. Style everything with PE7 tokens
11. The flow must work without JavaScript (form submits normally, no confirmation dialog)

## Constraints

- Logout must be a POST request, not a GET — explain why in comments
- TypeScript strict mode with zero errors
- The cookie must be deleted with the exact same path it was created with
- After logout, pressing the browser back button must not show cached authenticated content

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Use `cookies.delete('session', { path: '/' })` to clear the session cookie. The `path` must match the path used when the cookie was set, or the browser will not delete it. After deletion, `redirect(303, '/exercises/15-auth/04/logged-out')`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

In `use:enhance`, return a callback that calls `invalidateAll()` after the form action completes. This forces SvelteKit to re-run all load functions, which will now see `locals.user` as null. For the confirmation dialog, use `onclick` on the submit button to call `confirm()` and prevent submission if the user cancels. The auto-dismissing toast uses `$effect` with `setTimeout`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<form method="POST" action="?/logout" use:enhance={() => {
  return async ({ result, update }) => {
    await invalidateAll();
    await update();
  };
}}>
  <button type="submit" onclick={(e) => {
    if (!confirm('Are you sure you want to log out?')) {
      e.preventDefault();
    }
  }}>
    Log Out
  </button>
</form>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/15-auth/04/+page.server.ts`**

```typescript
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  return {
    user: locals.user
  };
};

export const actions: Actions = {
  logout: async ({ cookies }) => {
    // Logout MUST be a POST action, not a GET endpoint.
    // GET requests can be triggered by <img src>, prefetch, or bookmarks,
    // which would unintentionally log users out (CSRF via GET).
    cookies.delete('session', { path: '/' });

    redirect(303, '/exercises/15-auth/04/logged-out');
  }
};
```

**`src/routes/exercises/15-auth/04/+page.svelte`**

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';

  interface Props {
    data: {
      user: { id: string; email: string; name: string } | null;
    };
  }

  let { data }: Props = $props();
</script>

<main class="page">
  {#if data.user}
    <div class="card">
      <h1>Your Dashboard</h1>
      <p class="greeting">Logged in as <strong>{data.user.name}</strong> ({data.user.email})</p>

      <form
        method="POST"
        action="?/logout"
        use:enhance={() => {
          return async ({ result, update }) => {
            await invalidateAll();
            await update();
          };
        }}
      >
        <button
          type="submit"
          class="btn-logout"
          onclick={(e: MouseEvent) => {
            if (!confirm('Are you sure you want to log out?')) {
              e.preventDefault();
            }
          }}
        >
          Log Out
        </button>
      </form>
    </div>
  {:else}
    <div class="card">
      <h1>Not Authenticated</h1>
      <p>You are not logged in. Set a session cookie to test the logout flow.</p>
    </div>
  {/if}
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
    display: grid;
    place-items: center;
    min-block-size: 60vh;
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    max-inline-size: 28rem;
    inline-size: 100%;
    box-shadow: var(--shadow-md);
    text-align: center;
  }

  h1 {
    font-size: var(--text-xl);
    margin-block-end: var(--space-md);
  }

  .greeting {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-end: var(--space-xl);
  }

  .greeting strong {
    color: var(--color-text);
  }

  .btn-logout {
    padding: var(--space-sm) var(--space-xl);
    background: var(--color-error);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: var(--text-sm);
    cursor: pointer;
  }

  .btn-logout:hover {
    opacity: 0.9;
  }
</style>
```

**`src/routes/exercises/15-auth/04/logged-out/+page.svelte`**

```svelte
<script lang="ts">
  let showToast = $state(true);

  $effect(() => {
    const timer = setTimeout(() => {
      showToast = false;
    }, 5000);

    return () => clearTimeout(timer);
  });
</script>

<main class="page">
  <div class="card">
    <h1>Logged Out</h1>
    <p>You have been successfully logged out. Your session has been cleared.</p>
    <a href="/exercises/15-auth/04" class="btn">Return to Dashboard</a>
  </div>

  {#if showToast}
    <div class="toast" role="status">
      Session ended successfully.
    </div>
  {/if}
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
    display: grid;
    place-items: center;
    min-block-size: 60vh;
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    max-inline-size: 24rem;
    text-align: center;
    box-shadow: var(--shadow-md);
  }

  h1 {
    font-size: var(--text-xl);
    margin-block-end: var(--space-md);
    color: var(--color-success);
  }

  .card p {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-end: var(--space-lg);
  }

  .btn {
    display: inline-block;
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-brand);
    color: var(--color-surface);
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: var(--text-sm);
    text-decoration: none;
  }

  .toast {
    position: fixed;
    inset-block-end: var(--space-lg);
    inset-inline-end: var(--space-lg);
    background: var(--color-success);
    color: var(--color-surface);
    padding: var(--space-sm) var(--space-lg);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 600;
    box-shadow: var(--shadow-lg);
    animation: slideIn 0.3s var(--ease-out);
  }

  @keyframes slideIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
```

### Explanation

This exercise covers the complete logout lifecycle. The key insight is that logout must be a POST action, not a GET link. GET requests can be triggered by image tags, browser prefetch, search engine crawlers, or bookmarks — any of these would unintentionally log the user out if logout were a GET endpoint. This is a real-world CSRF vector that many apps get wrong. The `cookies.delete()` call must specify the same `path` used when setting the cookie, or the browser will not clear it (a common bug). The `use:enhance` callback calls `invalidateAll()` after the server action completes, which forces every client-side load function to re-run — this clears any cached user data from the SvelteKit router. The confirmation dialog uses the native `confirm()` API for zero-dependency implementation. The auto-dismissing toast uses `$effect` with `setTimeout` — the cleanup function (`clearTimeout`) runs when the component unmounts, preventing memory leaks. The toast has a slide-in animation using CSS keyframes and PE7 easing tokens.
</details>
