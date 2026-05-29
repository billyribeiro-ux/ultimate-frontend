---
module: 8
lesson: 8.7
title: $app/state — reactive page state
duration: 50 minutes
prerequisites:
  - Lesson 8.6 — Dynamic routes
  - Familiarity with runes ($state, $derived)
learning_objectives:
  - Import page, navigating and updated from $app/state
  - Read page.url, page.params, page.data, page.status and page.route.id
  - Use $derived(page.x) to get a reactive read of any page property
  - Explain why $app/stores is deprecated and when you would still see it
  - Detect an in-progress navigation with the navigating object
status: ready
---

# Lesson 8.7 — `$app/state` — reactive page state

## 1. Concept — One object for everything the router knows

### 1.1 The problem — how do components at the bottom of the tree know what URL they are on?

Imagine a header component, twelve levels deep in your layout, that wants to highlight the currently active navigation link. It needs to know the URL. Passing the URL down through twelve `$props` calls is absurd. Reading it from `window.location` is worse, because `window` does not exist during server-side rendering, so the component would crash on SSR.

Every framework answers this with some kind of shared router object. SvelteKit's answer is a single module, `$app/state`, that exports reactive objects any component can import directly. No prop drilling, no context API, no manual subscriptions.

### 1.2 The three exports

```ts
import { page, navigating, updated } from '$app/state';
```

- **`page`** is a reactive object with everything about the current page: `url`, `params`, `data`, `status`, `route`, `form`, `error`, `state`.
- **`navigating`** is a reactive object with `from`, `to`, `type` and `delta`, populated while a navigation is in flight and `null` otherwise. Use it to render loading indicators.
- **`updated`** is a reactive flag set to `true` when SvelteKit detects a new version of your app has been deployed. Use it to prompt the user to reload.

All three are **read-only**. You cannot assign to them. They are the router's view of the world, not your state.

### 1.3 `page` — what is in it

| Property         | Type                               | What it is                                            |
| ---------------- | ---------------------------------- | ----------------------------------------------------- |
| `page.url`       | `URL`                              | The full current URL, including search params and hash |
| `page.params`    | `{ [name: string]: string }`       | Matched route parameters (typed from the file tree)   |
| `page.data`      | Merged load-function data          | Everything your `load` functions returned             |
| `page.status`    | `number`                           | HTTP status of the current response                   |
| `page.route`     | `{ id: string \| null }`           | The route ID (e.g., `/blog/[slug]`)                   |
| `page.form`      | Form action response               | Populated after a form submission                     |
| `page.error`     | `App.Error \| null`                | Populated when +error.svelte is rendered              |
| `page.state`     | `App.PageState`                    | Shallow routing state (pushState / replaceState)      |

### 1.4 Reading page reactively with `$derived`

This is the most common trap for new SvelteKit 2 users. Reading `page.params.slug` at the top of a script gives you the value **for the current render**, which is correct. But if you want a local variable that always mirrors the current slug across navigations, you must wrap it in `$derived`:

```svelte
<script lang="ts">
    import { page } from '$app/state';
    const slug: string = $derived(page.params.slug ?? '');
</script>
```

`$derived` tells Svelte: "this value depends on `page.params.slug`; re-compute it whenever that changes". Without `$derived`, the variable captures the value on first render and does not update when the user navigates from `/blog/a` to `/blog/b` on the same route. Inside markup, writing `{page.params.slug}` directly works fine — the markup is already reactive.

### 1.5 `navigating` — loading indicators done right

```svelte
<script lang="ts">
    import { navigating } from '$app/state';
</script>

{#if navigating.to}
    <div class="route-spinner" aria-live="polite">Loading…</div>
{/if}
```

`navigating.to` is `null` when nothing is happening and becomes a `URL` the moment the user clicks a link. When the new page has finished loading, it resets to `null`. This is how you show a route-level spinner without writing a single `$state` variable yourself.

### 1.6 `updated` — telling the user to reload

If you deploy a new version of your app and a user has been on the old version for two hours, their JavaScript is stale. `updated.current` will become `true` when SvelteKit polls and detects a new build (the interval is configured in `svelte.config.js`). Show a toast:

```svelte
{#if updated.current}
    <button onclick={() => location.reload()}>A new version is available — reload?</button>
{/if}
```

### 1.7 Why `$app/stores` is deprecated

Before SvelteKit 2.12, reactive router state was exported as Svelte stores from `$app/stores`. You imported `page` and read it as `$page.params.slug` — the `$` prefix auto-subscribed to the store. Runes changed the best way to build reactive values, and `$app/stores` was retired in favour of `$app/state`, which is runes-native. You may still see `$page.params.slug` in old blog posts and old Stack Overflow answers. Treat them as outdated. **In this course, we only use `$app/state`.**





### The TypeScript angle

All `$app/state` exports are fully typed: `page.url` is `URL`, `page.params` is `Record<string, string>`, `navigating` is `Navigation | null`.

> **In production sidebar.** On a 100K-daily-user SPA, the `navigating` object drove a thin progress bar during slow navigations. Users reported feeling "less frustrated" with the visual feedback.

### Common interview question

**Q: What is `$app/state` and how does it differ from `$app/stores`?**

**Model answer:** `$app/state` exports reactive objects (`page`, `navigating`, `updated`) read with plain property access. Unlike deprecated `$app/stores` (which required `$page` store prefix), values are reactive without subscriptions. Reading in components or `$derived` creates automatic dependencies.

## Going Deeper

**Official documentation:**
- [SvelteKit docs: $app/state](https://svelte.dev/docs/kit/$app-state)
- [SvelteKit docs: page](https://svelte.dev/docs/kit/$app-state#page)
- [SvelteKit docs: navigating](https://svelte.dev/docs/kit/$app-state#navigating)

**Advanced pattern:** Build a navigation component that highlights the active link by comparing `page.url.pathname` against each link's href.

**Challenge question:** (Combines Lessons 8.7, 8.6, and 6.9) Build a breadcrumb component that reads `page.url.pathname`, splits it into segments, and renders each as a link. Use `page.params` to display the current route parameter. Override `--color-brand` based on the route module.

## Deep Dive

**Why this matters at scale.** The page object is the canonical source of truth for URL, params, status, and error state. Reading it reactively drives UI updates on every navigation.

**The mental model.** page.url, page.params, page.status, page.error, page.data are all reactive. Derive computed values from them. page.url.searchParams updates on every param change.

**Edge cases.** page.url updates on hash changes and search param modifications, not just path changes. Subscribing to page.url in a $derived expression captures all URL mutations.

**Performance implications.** Reading page state has zero overhead — it is a reactive reference that updates when navigation occurs. Deriving from it adds standard Svelte 5 reactivity cost.

**Connection to other modules.** Module 11 uses page.url.searchParams as state. Module 13 reads page data for SEO meta tags. Module 9's load function return becomes page.data.

## 2. Style it — PE7 for a router introspector

The mini-build is a dashboard that shows every relevant field from `page` updating live. We give the page a brand-blue personality (`oklch(68% 0.18 250)`) and use PE7's monospace convention for values. The dashboard updates as you navigate, edit the URL or add query parameters.

## 3. Interact — $derived for every read

Every displayed field is a `$derived`, so changes to the URL flow through immediately:

```svelte
<script lang="ts">
    import { page, navigating } from '$app/state';

    const pathname: string = $derived(page.url.pathname);
    const search: string = $derived(page.url.search);
    const routeId: string = $derived(page.route.id ?? '');
    const status: number = $derived(page.status);
    const isNavigating: boolean = $derived(navigating.to !== null);
</script>
```

## 4. Mini-build — the router dashboard

**Path:** `src/routes/modules/08-routing/07-app-state/+page.svelte`

Open `/modules/08-routing/07-app-state`. You will see a dashboard of router values. Add `?hello=world` to the URL and press Enter — the "search" field updates without a page reload, because `page.url` is reactive.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> How do you import the reactive page object in May 2026?</summary>

`import { page } from '$app/state';`. Do not use `$app/stores`; that is the deprecated API.
</details>

<details>
<summary><strong>Q2.</strong> Why might <code>const slug = page.params.slug</code> in a script fail to update when the user navigates from <code>/blog/a</code> to <code>/blog/b</code> on the same dynamic route?</summary>

Because a plain `const` captures the value at the first render and does not re-run. Wrap it in `$derived(page.params.slug)` so Svelte knows the value depends on a reactive source and should be recomputed on updates.
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between <code>page.url.pathname</code> and <code>page.route.id</code>?</summary>

`page.url.pathname` is the literal URL the user visited, e.g. `/blog/hello`. `page.route.id` is the matched route template, e.g. `/blog/[slug]`. Use `url.pathname` for display; use `route.id` for conditionals like "if we are on a blog detail page".
</details>

<details>
<summary><strong>Q4.</strong> How do you show a site-wide loading spinner while a navigation is in progress?</summary>

Import `navigating` from `$app/state` and render the spinner when `navigating.to` is not `null`. The value resets to `null` automatically when navigation finishes.
</details>

<details>
<summary><strong>Q5.</strong> You find a tutorial that writes <code>$page.params.id</code>. Is it current?</summary>

No. The `$` prefix is store syntax from `$app/stores`, which is deprecated. In SvelteKit 2.12+, read `page.params.id` (no `$`) after importing `page` from `$app/state`.
</details>

## 6. Common mistakes

- **Mixing `$app/state` and `$app/stores` in the same file.** Pick one. In this course, always pick `$app/state`.
- **Reading `page.url` outside a rendering context on the server.** In a server `load` function, use the `event.url` argument, not `page.url`. `$app/state` is for components.
- **Writing to `page.data` directly.** It is read-only. To change the data a page sees, update the load function or use `invalidate()` (Lesson 8.8).
- **Forgetting `$derived` when assigning page properties to local constants.** Without `$derived`, the value is frozen at mount time.

## 7. What's next

Lesson 8.8 covers `$app/navigation` — the programmatic side of routing: `goto`, `invalidate`, `preloadData`, `beforeNavigate` and `afterNavigate`.
