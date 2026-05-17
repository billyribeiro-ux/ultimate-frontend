---
module: 9A
lesson: 9A.1
title: What load functions are and why they exist
duration: 50 minutes
prerequisites:
  - Module 8 — routing, SSR, hydration
  - Comfort with async/await and typed return values
learning_objectives:
  - Explain the problem load functions solve
  - Write a +page.ts that returns data to its +page.svelte
  - Read data through the typed data prop in the page component
  - Describe when load runs (SSR, hydration, client navigation)
  - Identify which pieces of data belong in load versus in-component state
status: ready
---

# Lesson 9A.1 — What load functions are and why they exist

## 1. Concept — Data that must exist before the page renders

### 1.1 The problem — data flickers and empty screens

Imagine a blog post page that needs to display the post's title, body and publication date. A naive approach would look like this:

```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    let post = $state(null);

    onMount(async () => {
        post = await fetch('/api/posts/hello').then((r) => r.json());
    });
</script>

{#if post}
    <h1>{post.title}</h1>
{:else}
    <p>Loading…</p>
{/if}
```

This *works* in the sense that content eventually appears. But it has four deep problems. **First**, the server ships HTML that says "Loading…" — so Google and social scrapers see nothing meaningful. **Second**, the user sees a flash of "Loading…" before the real title appears, even on fast networks — bad UX. **Third**, the data is typed as `any` unless you manually annotate it — bad type safety. **Fourth**, the same fetch will run in the browser even though the server already had the data and could have embedded it in the initial HTML.

All four of these problems are solved by a single SvelteKit primitive: the **load function**. A load function runs *before* the page component is mounted, gathers the data the page needs, and passes it straight into the component as a typed prop called `data`. On the initial request, load runs on the server, its return value is baked into the HTML, and the page renders with real content on the first byte. On a client-side navigation, load runs in the browser instead, and its return value flows into the component without a round trip through the HTML.

### 1.2 What a load function looks like

A load function is an exported function in a file named `+page.ts` (universal) or `+page.server.ts` (server-only), sitting next to the matching `+page.svelte`:

```ts
// src/routes/blog/hello/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const response = await fetch('/api/posts/hello');
    const post = await response.json();
    return { post };
};
```

The function receives an `event` argument (destructured above as `{ fetch }`), does whatever async work it needs, and returns a plain object. SvelteKit gives that object to your `+page.svelte` through a prop called `data`:

```svelte
<script lang="ts">
    import type { PageProps } from './$types';
    let { data }: PageProps = $props();
</script>

<h1>{data.post.title}</h1>
```

`PageProps` is a type that SvelteKit generates for you from the load function's return type. You do not write the interface; the build system writes it. Lesson 9A.3 goes deep on this.

### 1.3 When load runs

Load functions have a carefully designed lifecycle. They run:

1. **On the server, for the initial request.** When a user types the URL or follows a link from outside your site, SvelteKit runs load on the server, gets the data, and sends rendered HTML + the serialised data back to the browser.
2. **In the browser, for internal navigations** (clicks on `<a href>` links inside your site). Instead of a full-page reload, SvelteKit fetches the new load function's result as JSON and renders the new page entirely client-side.
3. **On the server again if you call `invalidate()` or `invalidateAll()`** on the server-only portion, or **on the client** for universal loads. Lesson 9A.7 covers this.

A universal `+page.ts` load runs on *both* environments — server for the initial request, client for subsequent navigations. A `+page.server.ts` load runs **only on the server** and its result is sent as serialised JSON. You use the server-only variant whenever the code inside the load touches a database, a secret, or a file system.

### 1.4 What goes in load vs what stays in the component

A good rule of thumb: **data that the page cannot render without goes in load**. Data that the page uses for interaction (a counter, a form state, whether a modal is open) stays in the component as `$state`.

- Blog post body — in load.
- "Is the share menu open?" — `$state(false)` in the component.
- List of comments — in load (they belong to the page).
- "Which comment is the user currently editing?" — `$state`.
- Authenticated user's name — in a layout load (it applies to every page).

### 1.5 Why this design is better than client-only fetching

Four concrete wins:

1. **No loading flicker.** The page renders with real data on first paint.
2. **Typed end-to-end.** The return type of load flows into the page as `PageProps`; no `any`, no manual interfaces.
3. **SEO and scraping work.** Googlebot and Twitter see the rendered content, not a spinner.
4. **Deduplication and caching.** SvelteKit caches load results, deduplicates fetches, and re-runs only what changed on navigation.

### 1.6 How April 2026 differs from Svelte 3/4

In pre-SvelteKit-1.0 tutorials you may see `export async function load()` as a module-level function without the `PageLoad` type, returning `{ props: { ... } }`. That was the legacy API. The April 2026 shape is `export const load: PageLoad = async (event) => { return { ... }; }` — a typed arrow function returning a plain object. If a tutorial uses `return { props: { post } }`, it is outdated.

### 1.7 The load function event object

The `event` parameter passed to load functions is rich with context. For a universal `+page.ts`, it includes:

- `fetch` — SvelteKit's enhanced fetch (deduplicates, uses credentials, works on both server and client).
- `params` — the route parameters (e.g., `{ slug: 'hello' }` for `/blog/[slug]`).
- `url` — the full URL object with `searchParams` for query strings.
- `depends(key)` — registers a dependency for `invalidate()` (Lesson 9A.7).
- `parent()` — awaits the parent layout's load data.

For a server-only `+page.server.ts`, the event additionally includes:

- `cookies` — read and write HTTP cookies.
- `locals` — data set by hooks (Lesson 8.9).
- `platform` �� adapter-specific context.

Understanding this event object is essential. It is the single interface between your data-fetching logic and SvelteKit's infrastructure.

### 1.8 Load functions and caching

SvelteKit caches load function results during a client-side navigation session. If you navigate from page A to page B and back to page A, the second visit to A uses the cached result from the first visit — load does not re-run. This is why the page feels instant on "back" navigations. If you need to force a re-run (because data has changed), you call `invalidate()` or `invalidateAll()` (Lesson 9A.7). This caching behavior is one of the key performance advantages of load functions over manual `fetch` in `onMount` — the framework handles the caching strategy for you.

## Deep Dive

**Why this matters at scale.** In a 20-route production app, load functions are the backbone of data architecture. Every page depends on them for initial data. A poorly-structured load function — one that fetches too much data, one that creates a waterfall, one that is not typed — compounds into a slow, fragile, hard-to-maintain application. Conversely, a well-structured load function — parallel fetches, minimal data, typed return, proper `depends()` registration — gives you a fast, type-safe, cache-friendly data layer with zero boilerplate. The difference between a senior engineer's load functions and a junior's load functions is typically 3-5x performance improvement and complete type coverage.

**The mental model.** Think of a load function as a waiter at a restaurant. Before you sit down (before the page component mounts), the waiter goes to the kitchen (server), gets your order (fetches data), and brings it to your table (passes it as the `data` prop). You never have to go to the kitchen yourself (no `fetch` in `onMount`). You never see an empty plate that slowly fills (no loading spinner). The food is there when you sit down. The waiter also remembers what you ordered — if you leave and come back (navigate away and back), the same plate reappears instantly from memory (caching).

**Edge cases.** A universal load function (`+page.ts`) runs on both server and client. If it uses `Date.now()` or `Math.random()`, the server produces one value and the client re-runs and produces a different value — causing a hydration mismatch. Put non-deterministic work in `+page.server.ts` instead, where it runs only once (on the server) and the result is serialized to the client. Another edge case: if a load function throws, SvelteKit renders the nearest `+error.svelte` page. If it throws `redirect(303, '/login')`, the user is redirected before the page renders. If it calls `error(404, 'Not found')`, the 404 page renders. These are part of the load function's control flow, not exceptional failures.

**Performance implications.** Load functions run before the page renders, so their duration directly affects Time to First Byte (TTFB) and LCP. A load function that takes 500ms means the user waits 500ms before seeing anything (in SSR). The optimizations available: `Promise.all` for parallel fetches (Lesson 9A.6), streaming for slow data sources (Lesson 9A.9), caching with `depends` and `invalidate` (Lesson 9A.7), and SSG for static content (Lesson 9A.10). Every millisecond you shave from load function execution directly improves LCP.

**Connection to other modules.** Load functions were previewed in Module 8 (how SvelteKit works). This lesson is the full introduction. The rest of Module 9A covers typing (9A.3), enhanced fetch (9A.4), layout data (9A.5), parallel loading (9A.6), cache control (9A.7), error handling (9A.8), streaming (9A.9), and SSG (9A.10). Module 9B's remote functions are an alternative data-fetching pattern that complements load functions. Module 10's form actions are the mutation counterpart. Module 12 optimizes load function performance. Module 13 uses load functions to inject SEO data into pages. Load functions are the data spine of the entire application.

## 2. Style it — PE7 for a data card

The mini-build displays a single fetched "post" from a local inline data source. No real HTTP yet — that is Lesson 9A.4. We style it as a content card with PE7 tokens and a brand-blue personality (`oklch(68% 0.18 250)`).

## 3. Interact — typed data prop with `$props()`

```svelte
<script lang="ts">
    import type { PageProps } from './$types';
    let { data }: PageProps = $props();
</script>
```

`PageProps` is the generated type. Its shape comes directly from whatever the colocated `+page.ts` returned. Change the load function's return shape and the component's `data` type changes automatically.

## 4. Mini-build — a load function returning inline data

**Paths:**

- `src/routes/modules/09a-load/01-what-is-load/+page.svelte`
- `src/routes/modules/09a-load/01-what-is-load/+page.ts`

The load function returns a typed post object from an inline constant. The page reads `data.post.title`, `data.post.body` and `data.post.publishedAt`.

### Prove it

1. View Source on the page. The title and body are in the HTML — baked in by SSR because load ran on the server.
2. Click **Home** (or any other module link) and navigate away. Then click back into this lesson. The load function runs again — in the browser this time — and the same data appears. No network panel entry for HTML; only a small JSON request for the load data.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In your own words, what is a load function?</summary>

A function exported from a `+page.ts` or `+page.server.ts` file that runs before the page component mounts, returns an object, and hands that object to the page as a typed `data` prop. Load is where data that must exist for the page to render lives.
</details>

<details>
<summary><strong>Q2.</strong> Where does the data returned from load appear in the component?</summary>

As the `data` prop. You destructure it with `let { data }: PageProps = $props();` — the type is auto-generated from the load's return type.
</details>

<details>
<summary><strong>Q3.</strong> Does a <code>+page.ts</code> load function run on the server, the client, or both?</summary>

Both. On the initial request it runs on the server so the HTML can be rendered with data. On subsequent client-side navigations it runs in the browser. That is why it is called a "universal" load.
</details>

<details>
<summary><strong>Q4.</strong> Why is loading data inside <code>onMount</code> worse than using a load function?</summary>

Because `onMount` runs only on the client, after hydration. The initial HTML has no data in it, so users on slow networks see a flash of "Loading…", and search engines see nothing. A load function puts the data into the HTML on the first byte and gives you type safety at the same time.
</details>

<details>
<summary><strong>Q5.</strong> Should the current state of an open modal live in load or in the component?</summary>

In the component, as `$state`. Load is for data the page cannot render without. UI interaction state belongs to the component and does not need to survive a reload.
</details>

## 6. Common mistakes

- **Returning `{ props: { ... } }`.** That is the ancient API. Return a plain object; SvelteKit attaches it to the `data` prop automatically.
- **Fetching data inside the component with `onMount` alongside a load function.** Pick one. Load is the correct place for data the page depends on.
- **Using `any` because `data` was not typed.** Always import `PageProps` from `./$types` and annotate the destructured prop. That gives you full type safety for free.
- **Doing non-deterministic work in a universal load.** Because a universal load runs on both the server and the client, any randomness or time-sensitivity produces a hydration mismatch. Put non-deterministic work in `+page.server.ts`.

## 7. What's next

Lesson 9A.2 compares `+page.ts` and `+page.server.ts` head-to-head and gives you a rule for picking the right one every time.
