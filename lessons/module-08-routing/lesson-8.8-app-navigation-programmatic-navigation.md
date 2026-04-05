---
module: 8
lesson: 8.8
title: $app/navigation — programmatic navigation
duration: 55 minutes
prerequisites:
  - Lesson 8.7 — $app/state
learning_objectives:
  - Navigate from code with goto()
  - Trigger a re-run of load functions with invalidate() and invalidateAll()
  - Preload a route's data in the background with preloadData()
  - Register beforeNavigate / afterNavigate callbacks to confirm or log navigations
  - Use normalizeUrl() to canonicalise a URL before comparing it
status: ready
---

# Lesson 8.8 — `$app/navigation` — programmatic navigation

## 1. Concept — When a link is not enough

### 1.1 The problem — not every navigation starts with a click

Most navigations come from clicking a link. SvelteKit handles that automatically. But plenty of navigations start somewhere else: after a successful login you redirect to `/dashboard`; after a form submission you go back to the list; in a SPA wizard you step forward; when an offline-queued action succeeds you refresh only the affected pages without a full reload. None of those are a user clicking an `<a>`.

`$app/navigation` is the module that gives you programmatic control. It exports a small set of imperative functions that feel like `location.assign`, but are SvelteKit-aware: they use the client router, they trigger the right load functions, they preserve focus and scroll according to your options, and they integrate with `navigating` from `$app/state` so your loading spinners still work.

### 1.2 `goto(url, options)`

```ts
import { goto } from '$app/navigation';

await goto('/dashboard');
await goto('/login?redirectTo=/account', { replaceState: true, invalidateAll: true });
```

`goto` is the client-side equivalent of `location.assign`. It returns a promise that resolves when the navigation completes. Options include:

- `replaceState` — replace the current history entry instead of pushing a new one
- `noScroll` — do not scroll to the top after navigation
- `keepFocus` — do not shift focus (useful during form re-submissions)
- `invalidateAll` — re-run every load function after the navigation
- `state` — arbitrary state attached to the history entry

Use `goto` for redirects that happen inside client code. For redirects from a load function or a server hook, use the `redirect()` helper (Lesson 9A.8) instead — that throws a typed redirect that SvelteKit handles specially.

### 1.3 `invalidate(dependency)` and `invalidateAll()`

Load functions cache their data by default. If the user stays on `/blog/hello` and you know the data has changed — say, because the user just edited the post — you need to tell SvelteKit to re-run the `load` function. That is `invalidate`.

```ts
import { invalidate } from '$app/navigation';

await invalidate('app:posts');       // re-run any load that called depends('app:posts')
await invalidate('/api/posts/hello'); // re-run any load that fetched this URL
```

`invalidateAll()` is the sledgehammer — it re-runs every load function for the current page. Lesson 9A.7 goes deeper on `depends()` and how to design fine-grained invalidation keys.

### 1.4 `preloadData(href)`

When you hover a link, SvelteKit already preloads the JavaScript chunk for that route by default. `preloadData` goes one step further: it also runs the load function so that when the user clicks, the page is already rendered. You typically attach it to an `onmouseenter` or a custom interaction:

```ts
import { preloadData } from '$app/navigation';

function handleHover(): void {
    preloadData('/blog/hello');
}
```

Preloading is cheap on modern networks and can eliminate all perceived latency on link clicks. Use it generously for above-the-fold links.

### 1.5 `beforeNavigate` and `afterNavigate`

These are lifecycle hooks that let your component react to navigations.

```ts
import { beforeNavigate, afterNavigate } from '$app/navigation';

beforeNavigate(({ to, cancel }) => {
    if (hasUnsavedChanges) cancel();
});

afterNavigate(({ to }) => {
    console.log('arrived at', to?.url.pathname);
});
```

`beforeNavigate` receives the new navigation object and a `cancel()` function. Calling `cancel()` aborts the navigation — the classic "you have unsaved changes, are you sure?" pattern. `afterNavigate` fires once the new route is mounted. Both are fully reactive and scoped to the component they are called in.

### 1.6 `normalizeUrl(url)`

Two URLs that look different can represent the same route: `/blog/hello`, `/blog/hello/`, `/blog/hello?`. `normalizeUrl` canonicalises them so you can compare them safely.

```ts
import { normalizeUrl } from '$app/navigation';

const { url } = normalizeUrl('/blog/hello?');
// url.pathname === '/blog/hello', no trailing ?
```

Use it when you need to match URLs exactly — for example, to highlight an active link.

### 1.7 Why imperative navigation exists alongside `<a href>`

A principle you will see throughout SvelteKit: **use HTML first, reach for JavaScript only when HTML cannot do the job.** A plain `<a href="/blog">` works without JavaScript, is fast, is accessible, and gets you through SSR and hydration for free. `$app/navigation` is for the cases where you genuinely need code — conditional redirects, programmatic refreshes, preloading before a click. It is not a replacement for links.

## 2. Style it — PE7 for a control panel

The mini-build is a control panel with buttons for each `$app/navigation` helper. We give the page a rose personality (`oklch(70% 0.2 15)`). Every button hits a 44px minimum block size. The panel layout stacks on mobile and becomes two columns at the 480px breakpoint.

## 3. Interact — event handlers that call imperative helpers

Every button is an `onclick` handler that calls a function from `$app/navigation`. No runes beyond a small `$state` message for the on-screen log. The log proves each helper fired.

## 4. Mini-build — the navigation control panel

**Path:** `src/routes/modules/08-routing/08-app-navigation/+page.svelte`

The page has five buttons: Go to router dashboard, Replace history, Invalidate all, Preload 8.7, and a checkbox for the beforeNavigate guard. Click the buttons and watch the log panel update; try navigating with the guard enabled and you will see a confirm-style block.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> When would you reach for <code>goto()</code> instead of an <code>&lt;a href&gt;</code>?</summary>

When the navigation must be triggered from code — for example, after a successful login redirect, after a form submission, or inside a multi-step wizard. Plain links should still be the default for anything a user clicks directly.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between <code>invalidate('app:posts')</code> and <code>invalidateAll()</code>?</summary>

`invalidate('app:posts')` only re-runs load functions that declared a dependency on the key `app:posts` via `depends()`. `invalidateAll()` re-runs every load function for the current page. Use fine-grained invalidation when you can; use `invalidateAll` as a fallback.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>preloadData()</code> do that hovering a link does not already do?</summary>

Hovering a link preloads the JavaScript chunk for the destination by default, but not the data. `preloadData` also runs the load function and caches the result, so when the user actually clicks the page renders instantly.
</details>

<details>
<summary><strong>Q4.</strong> You want to warn the user "are you sure?" if they try to leave a form with unsaved changes. Which hook do you use?</summary>

`beforeNavigate`. It receives a `cancel()` function that aborts the navigation when called. Check for unsaved state and call `cancel()` conditionally.
</details>

<details>
<summary><strong>Q5.</strong> Why might <code>normalizeUrl('/blog/hello/')</code> and <code>normalizeUrl('/blog/hello')</code> be useful to compare?</summary>

Both are the same route in practice. Without normalisation, a naive string comparison would say they are different URLs and your "active link" highlight would miss the trailing-slash case.
</details>

## 6. Common mistakes

- **Using `goto()` from a server `load` function.** It only works in the browser. To redirect from a load function, throw `redirect(302, '/login')` from `@sveltejs/kit` instead.
- **Calling `invalidateAll()` on every mutation.** It is correct but wasteful. Use `depends()` and `invalidate()` with a key to refresh only what changed.
- **Forgetting `await` on `goto()`.** It returns a promise. Not awaiting means the caller cannot know when the navigation is done, which matters when you want to run code after the new page mounts.
- **Registering `beforeNavigate` outside a component.** The hook must be called during component setup so it can be cleaned up when the component unmounts. Inside a store or a module it will leak.

## 7. What's next

Lesson 8.9 leaves the browser and moves to the server: `hooks.server.ts`, the middleware that sees every request before it reaches a load function.
