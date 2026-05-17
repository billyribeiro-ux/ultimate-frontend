---
module: 9B
lesson: 9B.9
title: Async SSR — await directly in components
duration: 60 minutes
prerequisites:
  - Lesson 9B.2 — `query` basics
  - Module 4 — `{#await}`
learning_objectives:
  - Describe what "async SSR" means and why it changes how data loads
  - Compare the classic `{#await}` pattern with top-level `await` in markup
  - Enable `compilerOptions.experimental.async` in `svelte.config.js` (when ready)
  - Use `<svelte:boundary pending={...}>` as a loading fallback for async components
  - Choose the conservative `{#await}` pattern until async SSR is stable
status: ready
---

# Lesson 9B.9 — Async SSR — `await` directly in components

## 1. Concept — The syntax that is coming stable later in 2026

### 1.1 Where we are today

Svelte 5 and SvelteKit 2 support **async components** behind a compiler flag: `compilerOptions.experimental.async: true`. When turned on, you can write `await` at the top level of a `<script>` or directly inside the markup, and Svelte treats the whole component as asynchronous for SSR purposes. The server waits for the awaited values before streaming the HTML; the client hydrates into the already-resolved state.

With remote functions, this makes queries read like synchronous code:

```svelte
<!-- experimental.async enabled -->
<script lang="ts">
    import { getPost } from './post.remote';
    let { params }: { params: { slug: string } } = $props();
    const post = await getPost(params.slug);
</script>

<h1>{post.title}</h1>
<p>{post.body}</p>
```

No `{#await}`, no `{:then}`, no nested indentation. The `post` variable is simply the resolved value.

### 1.2 Why it is still experimental in April 2026

The semantics of top-level `await` during SSR are subtle. What happens if an awaited value errors? What happens during a client-side navigation, when there is no "first render" to stream into? How do you show loading UI when the component itself is suspended? The Svelte team has answers, but they are still iterating on the details. Enabling the flag in production is fine for experimentation and strongly encouraged for learning — but for a course we teach the **conservative pattern** (`{#await}`) as the default and show the async SSR syntax as the future.

### 1.3 The conservative pattern: `{#await}` + `<svelte:boundary>`

The pattern that is stable **today** uses the `{#await}` block you already know from Module 4, optionally wrapped in a `<svelte:boundary>` that catches errors and renders a fallback. `<svelte:boundary>` has a `pending` snippet (since Svelte 5.36) that renders while any `await` inside the boundary is still resolving — a general-purpose loading state without having to repeat `{:pending}` in every block.

```svelte
<script lang="ts">
    import { getPost } from './post.remote';
    let { slug }: { slug: string } = $props();
</script>

<svelte:boundary>
    {#snippet pending()}
        <p class="loading">Loading the post…</p>
    {/snippet}

    {#await getPost(slug) then post}
        <h1>{post.title}</h1>
        <p>{post.body}</p>
    {:catch error}
        <p class="error">Could not load post: {error.message}</p>
    {/await}
</svelte:boundary>
```

The shape is slightly more verbose than the async version but **stable**, explicit, and works today without any compiler flags. Every lesson in Modules 1 through 9A uses this pattern; 9B.1 through 9B.8 do too.

### 1.4 Turning on async SSR (if you want to experiment)

Add the option to `svelte.config.js` alongside `kit.experimental.remoteFunctions`:

```js
/** @type {import('@sveltejs/kit').Config} */
const config = {
    compilerOptions: {
        experimental: { async: true }
    },
    kit: {
        experimental: { remoteFunctions: true }
    }
};
```

Once enabled, you can write `const post = await getPost(slug)` at the top of a `<script>`, and Svelte will handle the suspense during SSR. The same `<svelte:boundary pending={...}>` will render your loading UI while the component is suspended. We do **not** enable this flag in the course project so that every lesson remains reproducible with stable tooling. The mini-build below uses the conservative pattern.

### 1.5 Why this lesson still matters

Even though you will keep using `{#await}` for now, you should know the async SSR syntax exists, because:

- You will see it in examples and tutorials throughout 2026.
- The shape of your data-fetching code is *different* — one `const` at the top instead of blocks in the markup — and the refactor later will be almost mechanical.
- Remote functions were co-designed with async SSR. The full vision is "your component is an `async` function; it calls remote functions like any other function." Once `experimental.async` is stable, that vision lands.

### 1.6 What SvelteKit does under the hood — async SSR mechanics

The async SSR system changes the fundamental rendering model. Here is the internal pipeline:

**Without `experimental.async` (today's stable model):**

1. The component renders synchronously. `{#await getPosts()}` starts the query but renders the pending branch immediately.
2. On the server, SvelteKit does NOT wait for the promise to resolve. The pending branch HTML ships in the initial response.
3. On the client, after hydration, the promise resolves and the `{:then}` branch replaces the pending branch. The user sees a flash of loading state.
4. If you want the server to wait, you must use a `load()` function instead — load blocks SSR until all awaited values resolve.

**With `experimental.async` (the future model):**

1. The component is treated as an async function. `const post = await getPost(slug)` suspends the component during SSR.
2. SvelteKit tracks all suspended components. While a component is suspended, its parent `<svelte:boundary>` renders the `pending` snippet.
3. The server waits for all awaited values to resolve before sending the HTML for that boundary.
4. Once resolved, the component renders with the real data. The HTML ships with content, not loading states.
5. On the client, hydration mounts the component against the already-rendered HTML. No loading flash.

This is conceptually similar to React Suspense but integrated at the Svelte compiler level. The compiler transforms top-level `await` expressions into suspension points that the SSR runtime can track.

### 1.7 The TypeScript angle

The type system behaves identically with both patterns, but the developer experience differs:

```svelte
<!-- Conservative pattern -->
<script lang="ts">
    import { getPost } from './post.remote';
    let { slug }: { slug: string } = $props();
    // getPost(slug) returns QueryResult<Post> (awaitable + reactive)
</script>
{#await getPost(slug) then post}
    <!-- post: Post -->
    <h1>{post.title}</h1>
{/await}
```

```svelte
<!-- Async SSR pattern (experimental) -->
<script lang="ts">
    import { getPost } from './post.remote';
    let { slug }: { slug: string } = $props();
    const post = await getPost(slug);
    // post: Post (already resolved)
</script>
<h1>{post.title}</h1>
```

In the async version, `post` is typed as `Post` directly — no wrapping, no nesting. The template reads like synchronous code. Error handling moves from `{:catch}` to `try/catch` in the script or to `<svelte:boundary>`:

```svelte
<svelte:boundary>
    {#snippet failed(error)}
        <p>Error: {error.message}</p>
    {/snippet}
    
    <PostComponent slug={slug} />
</svelte:boundary>
```

### 1.8 Comparison: data fetching patterns across frameworks

| Pattern | SvelteKit `load()` | SvelteKit `{#await}` | SvelteKit async SSR | React Server Components | Next.js `getServerSideProps` |
| --- | --- | --- | --- | --- | --- |
| Where data is fetched | Separate load file | Inside component | Inside component | Inside component | Separate function |
| SSR behavior | Blocks render | Pending branch ships | Suspends, waits | Server-only render | Blocks render |
| Type safety | Via `$types` | Manual | Full (inferred) | Manual | Manual |
| Syntax | Function export | Template block | `await` in script | `async` component | Function export |
| Colocation | Separate file | Inline | Inline | Inline | Separate function |

> **In production sidebar.** We experimented with `experimental.async` on a feature branch for three months. The code reduction was meaningful — removing `{#await}` blocks and `{:then}` nesting cut template complexity by about 25% on data-heavy pages. The SSR performance was comparable to `load()` functions. The one issue we hit: error handling is less granular. With `{#await}`, each data source has its own `{:catch}` branch. With async SSR, errors bubble up to the nearest `<svelte:boundary>`, which catches everything — you lose per-source error messages unless you wrap individual awaits in try/catch. We ultimately decided to wait for the stable release before merging, but the syntax is worth learning now.

### 1.9 Common interview question

**Q: "What is the difference between fetching data in a load function and using top-level await in a Svelte component with async SSR? When would you choose each?"**

**Model answer:** A load function runs in a separate file (`+page.ts` or `+page.server.ts`) before the component mounts, and its return value is passed to the component as a typed `data` prop. Top-level `await` with async SSR runs inside the component itself, suspending the component during SSR until the awaited values resolve. The results are similar — both produce SSR'd HTML with real data. The differences: load functions have built-in caching, `depends()` / `invalidate()` support, and are the stable, documented API. Async SSR is experimental and provides better colocation (the data fetch is next to the template that uses it) and cleaner syntax (no `{#await}` nesting). Choose load functions for SSR-critical page data that needs caching and invalidation. Use async SSR (when stable) for component-level data that benefits from colocation — especially for reusable components that need their own data and cannot rely on a parent page's load.

## Deep Dive

**The `<svelte:boundary>` component.** `<svelte:boundary>` is Svelte's error and suspense boundary. It serves two purposes:

1. **Error boundary:** Catches errors thrown by descendant components and renders a `failed` snippet instead of crashing the app (covered in Lesson 12.7).
2. **Suspense boundary:** When async SSR is enabled, renders a `pending` snippet while any descendant component is suspended (awaiting a promise).

The dual role means one boundary element handles both loading and error states. This is more concise than having separate loading and error wrappers.

**Migration path from `{#await}` to async SSR.** When `experimental.async` becomes stable, the refactoring is mechanical:

1. Move `{#await query() then value}` to `const value = await query()` in `<script>`.
2. Move the `{:catch}` block to a `<svelte:boundary>` around the component or a `try/catch` in the script.
3. Move the template out of the `{:then}` block into the top-level markup.
4. Remove the `{/await}` closing tag.

Each step is a safe, type-preserving transformation.

## Going Deeper

- **SvelteKit docs:** [Async](https://svelte.dev/docs/svelte/async) covers the async SSR experimental feature.
- **Advanced pattern:** Create a wrapper component `<AsyncData query={getPost} args={[slug]}>` that handles the `{#await}` boilerplate and renders a standardized skeleton/error UI. This pattern makes migration to async SSR even simpler — replace the wrapper with inline `await`.
- **Challenge:** Enable `experimental.async` in a test branch. Rewrite one page's `{#await}` blocks as top-level `await`. Compare the template line counts. Does the page still SSR correctly? Check by viewing the page source.

## 2. Style it — A suspense boundary with a skeleton

Per-page brand is a soft lavender. The pending snippet renders a skeleton card with the same shape as the final post card — the UI does not jump when the data arrives. Skeletons respect reduced motion.

## 3. Interact — Two versions, side by side

In the mini-build we render two implementations: the conservative `{#await}` version (left) and a commented-out snippet (right) that *would* use top-level `await` if `experimental.async` were enabled. The point of the lesson is the comparison, not the execution.

## 4. Mini-build — Suspense boundary with pending snippet

### File tree

```
src/routes/modules/09b-remote/09-async-ssr/
├── +page.svelte       (uses {#await} + <svelte:boundary pending>)
└── article.remote.ts  (getArticle query)
```

### DevTools moment

1. Reload the page. In the Network tab you see the query fire once, and the HTML response contains the fully rendered article body — SSR worked. Open "Disable cache" and reload a couple of times to see the skeleton flash.
2. Throttle the network to "Slow 3G". Reload again. The skeleton snippet now stays visible for a noticeable fraction of a second, giving you a real feel for the user experience of a slow query.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is "async SSR" in one sentence?</summary>

Svelte's ability to pause server-side rendering while a component awaits a value, then stream the resolved HTML to the browser.
</details>

<details>
<summary><strong>Q2.</strong> What option in <code>svelte.config.js</code> enables top-level <code>await</code> in components?</summary>

`compilerOptions.experimental.async: true`.
</details>

<details>
<summary><strong>Q3.</strong> What does the <code>pending</code> snippet on <code>&lt;svelte:boundary&gt;</code> do?</summary>

It renders a fallback while any awaited value inside the boundary is still resolving. It provides a general-purpose loading state without per-block `{:pending}` duplication.
</details>

<details>
<summary><strong>Q4.</strong> Why does this course still teach <code>{#await}</code> as the default?</summary>

Because async SSR is experimental in April 2026. The Svelte team still reserves the right to change details. `{#await}` is stable today and reproducible for every student.
</details>

<details>
<summary><strong>Q5.</strong> When async SSR becomes stable, how hard will it be to refactor?</summary>

Almost mechanical. Replace `{#await query() then value}...{/await}` with `const value = await query()` in `<script>` and move the markup out of the block. Nothing else changes.
</details>

## 6. Common mistakes

- **Enabling `experimental.async` without reading the changelog.** The flag has changed meaning twice in 2026. Check the version notes before turning it on in a real project.
- **Assuming `{#await}` blocks SSR.** They do not — SvelteKit streams the HTML *around* them by default. Use `<svelte:boundary>` when you want the whole block to suspend as a unit.
- **Forgetting to handle the error path.** Every `{#await}` should have a `{:catch}` or live inside a `<svelte:boundary>` that renders an error fallback.
- **Mixing top-level `await` with `$effect`.** `$effect` runs after render; top-level `await` runs *during* render. They are different phases of the component lifecycle.

## 7. What's next

Lesson 9B.10 closes the module with a decision framework: when to use `load()`, when to use a remote function, and when to reach for `+server.ts`.
