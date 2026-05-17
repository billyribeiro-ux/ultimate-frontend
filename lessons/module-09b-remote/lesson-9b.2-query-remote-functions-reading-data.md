---
module: 9B
lesson: 9B.2
title: query remote functions — reading data
duration: 60 minutes
prerequisites:
  - Lesson 9B.1 — what remote functions are
  - Module 4 — promises and `{#await}`
  - Module 8 — file-based routing
learning_objectives:
  - Create a `.remote.ts` file colocated with a route
  - Export a zero-argument `query()` that returns typed data
  - Consume a query from a `+page.svelte` using the `await` promise form
  - Use the query object's `loading`, `error`, and `current` properties
  - Call `.refresh()` to force the query to re-fetch from the server
status: ready
---

# Lesson 9B.2 — `query` remote functions — reading data

## 1. Concept — Your first function that runs in two places

### 1.1 The job of `query`

`query` is the remote function flavour you use to **read** data. Anything that used to be a `GET` endpoint or a `load()` function that just pulls a list of things is a candidate for `query`. A query function always runs on the server. When the browser calls it, SvelteKit turns the call into an HTTP request to an auto-generated URL, runs the handler on the server, serialises the result with `devalue`, and hands the typed value back to your component as a promise.

You declare a query with three ingredients:

1. A file whose name ends in `.remote.ts`. It can live anywhere in `src/` except inside `src/lib/server`. Colocation with the route that uses it is the idiomatic choice.
2. The `query` helper imported from `$app/server`. This is a server-only module; importing it in a `.svelte` file is a compile error.
3. An `async` handler that returns data. The return type is the type the client sees — no DTO interface, no `as` cast.

```ts
// src/routes/modules/09b-remote/02-query-reading-data/posts.remote.ts
import { query } from '$app/server';

export interface Post {
    readonly id: string;
    readonly title: string;
    readonly publishedAt: Date;
}

const posts: Post[] = [
    { id: 'a', title: 'Hello remote world', publishedAt: new Date('2026-04-01') },
    { id: 'b', title: 'query() in five minutes', publishedAt: new Date('2026-04-03') }
];

export const getPosts = query(async (): Promise<Post[]> => {
    return posts;
});
```

### 1.2 Two ways to consume a query

Inside a component, `getPosts()` returns a special object that is *also* a promise. You can use it in two ways.

**The promise form (recommended).** `await` it directly inside an `{#await}` block or — once `experimental.async` is enabled (Lesson 9B.9) — inline in the markup. Types flow through cleanly.

```svelte
<script lang="ts">
    import { getPosts } from './posts.remote';
</script>

{#await getPosts()}
    <p>Loading posts…</p>
{:then posts}
    <ul>
        {#each posts as post (post.id)}
            <li>{post.title}</li>
        {/each}
    </ul>
{:catch error}
    <p>Could not load posts: {error.message}</p>
{/await}
```

**The reactive form.** Assign the query to a variable and read its `loading`, `error`, and `current` properties directly. These are reactive, so the template updates as the fetch progresses.

```svelte
<script lang="ts">
    import { getPosts } from './posts.remote';
    const q = getPosts();
</script>

{#if q.error}<p>Error: {q.error.message}</p>
{:else if q.loading}<p>Loading…</p>
{:else}
    <ul>{#each q.current ?? [] as post (post.id)}<li>{post.title}</li>{/each}</ul>
{/if}
```

Pick whichever reads better for the situation. Both share the same underlying cache: `getPosts() === getPosts()` across a single page, so you do not need to "save" the reference.

### 1.3 Refreshing

A query is cached for the lifetime of the page. To force a fresh fetch — say, after the user clicks a "reload" button — call `.refresh()` on the query.

```svelte
<button onclick={() => getPosts().refresh()}>Check for new posts</button>
```

Because the cache is keyed on arguments (there are none in this case), every component using `getPosts()` sees the new data automatically.

### 1.4 Why devalue, not JSON

JSON has no idea what a `Date` is. It does not know about `Map`, `Set`, `BigInt`, or cyclic references. `devalue` is the library SvelteKit uses to serialise the return value of a query, and it handles all of those types natively. In the example above, `publishedAt` is a real `Date` object on the server *and* a real `Date` object on the client — no `new Date(response.publishedAt)` dance, no string timestamps. You can read more in Lesson 9B.3.

### 1.5 Security is not automatic

A remote function is an HTTP endpoint. Anyone with your URL can call it. "Running on the server" does not mean "unreachable"; it means "runs in a trusted environment where you can reach private resources". If the data should be restricted, check the session inside the handler just as you would in a `+server.ts` route. We will practise this in Lesson 9B.5.

### 1.6 What SvelteKit does under the hood — the RPC mechanism

When you import `getPosts` from `./posts.remote` in a component, you are not importing the server function. You are importing an auto-generated **client stub**. Here is what happens at each stage:

**Build time:**

1. SvelteKit's Vite plugin scans for `.remote.ts` files.
2. For each exported function, it generates a unique endpoint URL (a hash-based path like `/_remote/getPosts-a1b2c3`).
3. The original file is kept in the server bundle unchanged.
4. A stub module is generated for the client bundle. The stub exports a function with the same name and TypeScript signature, but its implementation is a thin `fetch` wrapper.

**Runtime — SSR (first page load):**

1. The component imports `getPosts` from the stub.
2. During SSR, SvelteKit detects that the call is happening on the server. Instead of making an HTTP request, it calls the real server function directly (in-process), similar to the enhanced fetch's behavior.
3. The result is serialised with `devalue` and embedded in the HTML, just like load function data.
4. On hydration, the client sees the embedded result and does not re-fetch.

**Runtime — Client-side (after hydration):**

1. The component calls `getPosts()`.
2. The client stub serialises the arguments (none in this case) with `devalue`.
3. It sends a `POST` request to the generated endpoint URL.
4. The server receives the request, calls the real `getPosts` handler, serialises the result with `devalue`, and responds.
5. The client stub deserialises the response and returns the typed value.

To see this in action, open the Network tab and filter by "Fetch/XHR". You will see requests to URLs like `/_remote/getPosts-a1b2c3`. The request body is the serialised arguments. The response body is the serialised result in `devalue` format (not plain JSON — that is why `Date` objects survive the trip).

### 1.7 The TypeScript angle

The client stub has the **exact same TypeScript signature** as the server function. This is the core of the type safety guarantee. When you write:

```ts
// Server (posts.remote.ts)
export const getPosts = query(async (): Promise<Post[]> => { ... });
```

The generated client stub is effectively:

```ts
// Client stub (auto-generated, you never see this)
export const getPosts: () => QueryResult<Post[]> = ...;
```

`QueryResult<Post[]>` is both a `Promise<Post[]>` (so you can `await` it) and a reactive object with `loading`, `error`, and `current` properties. The type `Post[]` flows from the server function's return type to the client call site with zero manual intervention.

If you change the server function to return `Promise<Article[]>`, every component using `getPosts()` immediately sees the type change. If you add a required argument, every call site gets a compile error. This is the "end-to-end" guarantee in practice.

### 1.8 Comparison: query vs load vs onMount fetch

| Aspect | `query()` remote function | `load()` function | `onMount` + `fetch` |
| --- | --- | --- | --- |
| Type safety | Automatic (inferred) | Automatic (via `$types`) | Manual (hand-written) |
| Runs during SSR | Yes (if `await`ed) | Always | Never |
| Caching | Per-argument, automatic | Per-navigation, automatic | Manual |
| Refresh mechanism | `.refresh()` | `invalidate()` | Manual re-fetch |
| Network protocol | RPC (devalue) | `__data.json` (devalue) | Standard HTTP (JSON) |
| Can use in event handlers | Yes | No (load runs before render) | Yes |
| Reactive state | Built-in (`loading`, `error`, `current`) | Via `data` prop | Manual `$state` |
| Progressive enhancement | No (JS required) | Yes (SSR renders HTML) | No (JS required) |

> **In production sidebar.** We migrated a 15-endpoint `+server.ts` API layer to remote queries. The migration took two days. We deleted 15 `+server.ts` files, 15 client-side `fetch` wrapper functions, and 15 hand-written response type interfaces. We replaced them with 15 `.remote.ts` files totaling about 40% less code. The type errors we found during migration — three places where the client type had drifted from the server response — had been silently causing bugs in production for weeks. The type safety of remote functions is not a theoretical benefit; it catches real bugs that hand-written types miss.

### 1.9 Common interview question

**Q: "What is the difference between a SvelteKit remote `query` and a traditional REST API endpoint? When would you choose each?"**

**Model answer:** A remote query is a typed RPC function. The client imports and calls it like a regular function; the compiler generates the HTTP plumbing. The return type flows from server to client automatically. A REST endpoint (`+server.ts`) is a traditional HTTP handler with a stable URL, manual type interfaces, and manual validation. Choose a remote query for any data read that is consumed only by your own SvelteKit components — the type safety and reduced boilerplate are compelling. Choose a REST endpoint when external clients need a stable URL (webhooks, mobile apps, third-party integrations) or when you need fine-grained control over HTTP headers, status codes, and caching directives.

## Deep Dive

**The cache identity.** Query results are cached by the combination of function identity and argument. `getPosts()` called from component A and `getPosts()` called from component B on the same page return the same cached value. This is true because the cache is keyed on the function reference (the exported binding) plus the serialised argument. Two different exports with the same logic are separate cache entries. This matters when you refactor: if you rename `getPosts` to `fetchAllPosts`, the cache key changes and existing cached values are orphaned.

**SSR and the `{#await}` block.** When you use `{#await getPosts()}` during SSR, SvelteKit waits for the query to resolve before sending any HTML for that block. This means the post list is in the initial HTML, making it SEO-friendly. If you use the reactive form (`q.current`) without an `{#await}` wrapper, SvelteKit does not wait — the server sends `null` for `q.current` and the fetch starts on hydration. For SEO-critical data, always use `{#await}`.

**Error propagation.** If the server handler throws (via `error()` from `@sveltejs/kit` or an unhandled exception), the error is serialised and rethrown on the client. In an `{#await}` block, it lands in the `{:catch error}` branch. The error object has a `message` property and, for expected errors, a `status` property. Unexpected errors are sanitised by SvelteKit's error handling pipeline — the client never sees internal stack traces.

## Going Deeper

- **SvelteKit docs:** [Remote functions](https://svelte.dev/docs/kit/remote-functions) covers the full API for `query`, `form`, and `command`.
- **Advanced pattern:** Create a typed wrapper that adds error toasts automatically: `function queryWithToast<T>(q: () => QueryResult<T>): QueryResult<T>`. This wrapper catches errors from the query and displays a toast notification, so individual components do not need error handling boilerplate.
- **Challenge:** Export two queries from the same `.remote.ts` file: `getPosts()` and `getPostCount()`. Call both from the same component. Open the Network tab. Do they fire as separate requests or are they batched? (Answer: separate requests — batching only happens with `query.batch()`. Each query is an independent endpoint.)

## 2. Style it — A list of posts with skeleton loading

PE7 rules apply unchanged. The per-page brand colour for this lesson is a cool teal. We use `--color-brand` to tint both the active list item and the skeleton loader pulse. The skeleton is a single `animation` keyframed with respect for `prefers-reduced-motion`.

## 3. Interact — The shape of an `await`ed query

The concept this lesson introduces is the round trip. Write the wrong version first: put a `fetch('/api/posts')` in a `$effect`, juggle the result with `$state`, invent an interface, and watch the types drift. Then delete it all and replace it with four lines: import, `{#await getPosts()}`, render, done. Open DevTools → Network, filter by "Fetch/XHR", and watch the auto-generated endpoint appear with the name of your export in the URL.

## 4. Mini-build — A colocated query

### File tree

```
src/routes/modules/09b-remote/02-query-reading-data/
├── +page.svelte
└── posts.remote.ts
```

`posts.remote.ts` exports `getPosts`. The `+page.svelte` imports it and renders the list with `{#await}`.

### DevTools moment

1. Open Network, filter by "Fetch/XHR".
2. Reload the page. You will see one request to a URL containing `getPosts`. That is the auto-generated endpoint for your query.
3. Click the request and look at the **Response** tab. It is not plain JSON — it is the `devalue` format, which preserves `Date` objects.
4. Click the **Refresh** button in the page. One more request fires, bypassing the cache.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Where can a <code>.remote.ts</code> file live?</summary>

Anywhere inside `src/` except `src/lib/server`. Colocating it with the route that uses it is the idiomatic choice.
</details>

<details>
<summary><strong>Q2.</strong> Why does <code>getPosts() === getPosts()</code> return true on the same page?</summary>

Query results are cached by argument. A zero-argument query has a single cache slot, so every call within the same page returns the same underlying object.
</details>

<details>
<summary><strong>Q3.</strong> What happens to a <code>Date</code> when it is returned from a query?</summary>

It stays a real `Date`. SvelteKit uses `devalue` instead of JSON, which preserves `Date`, `Map`, `Set`, `BigInt`, and custom transports.
</details>

<details>
<summary><strong>Q4.</strong> How do you force a query to re-fetch?</summary>

Call `.refresh()` on the query, e.g. `getPosts().refresh()`. This bypasses the cache and updates every component that renders the query.
</details>

<details>
<summary><strong>Q5.</strong> If you import <code>query</code> from <code>$app/server</code> inside a <code>.svelte</code> file, what happens?</summary>

A compile error. `$app/server` is server-only; it cannot be imported into client code. The only legal place to import it is a `.remote.ts` or `+page.server.ts` file.
</details>

## 6. Common mistakes

- **Using `fetch` inside a query handler to call your own API.** A query handler *is* the endpoint. Calling another endpoint from inside it is a pointless round trip. Reach directly into the database (or static data) and return the result.
- **Returning a class instance with methods.** Only plain data survives `devalue`. Move any logic to the client side of the pair.
- **Treating the query as a one-shot promise.** `getPosts()` is a reactive object that happens to be awaitable. Re-creating it on every render is fine because it is cached; "saving" it to a variable is optional.
- **Forgetting that queries do not run during SSR unless you `await` them.** If your template only references `q.current`, SvelteKit kicks off the fetch on hydration. Use `await` in an `{#await}` block to make the server wait for the data and ship it in the first HTML response.

## 7. What's next

Lesson 9B.3 adds arguments to a query, introduces Valibot schema validation for those arguments, and demonstrates devalue serialisation with `Date` and `Map`.
