---
module: 9A
lesson: 9A.10
title: SSG — Static Site Generation with prerender and entries()
duration: 55 minutes
prerequisites:
  - Lesson 8.12 — Four rendering modes
  - Lesson 9A.1 — Load functions
learning_objectives:
  - Declare a route as prerenderable with export const prerender = true
  - Understand what happens during pnpm build for a prerendered route
  - Provide entries() for dynamic routes so SvelteKit knows which slugs to build
  - Choose between prerender = true, prerender = 'auto' and prerender = false
  - Recognise which APIs and patterns are incompatible with prerendering
status: ready
---

# Lesson 9A.10 — SSG — Static Site Generation with `prerender` and `entries()`

## 1. Concept — Build the HTML once, serve it forever

### 1.1 The problem — rendering the same HTML on every request

A blog post at `/blog/hello` is identical for every visitor. Its content changes once a week at most. Yet if you ship it as an SSR page, your server runs the load function, walks the component tree, and renders the HTML on every single request. You are paying CPU every time to produce a byte-for-byte identical output. That is not just wasteful — it is slower than the alternative, because an SSR request requires a running server whereas a static file can be served by a dumb CDN in single-digit milliseconds.

The right model for that blog post is **SSG — Static Site Generation**. Run the load function and render the component once, at build time. Save the result as `blog/hello/index.html`. Deploy the file. Serve it directly. No running server, no database query, no per-request cost.

SvelteKit lets you opt in to SSG per route with a one-line change.

### 1.2 `export const prerender = true`

Add this to any `+page.ts`, `+page.server.ts`, `+layout.ts`, `+layout.server.ts` or `+page.svelte`:

```ts
// +page.server.ts
export const prerender = true;

export const load: PageServerLoad = async () => {
    return { post: await getPost() };
};
```

When you run `pnpm build`, SvelteKit will:

1. Run the load function.
2. Render the page to HTML.
3. Write the HTML to `build/blog/hello/index.html` (or your adapter's equivalent).
4. Not generate any runtime server code for this route.

At deploy time the static file is served directly. The component's JavaScript is still shipped to the client for hydration if `csr = true` (the default) — prerender only handles the HTML.

### 1.3 `entries()` for dynamic routes

A plain `prerender = true` works for static routes (`/about`, `/blog`). For dynamic routes like `/blog/[slug]`, SvelteKit needs a list of every `slug` it should render. You provide that list with an exported `entries` function:

```ts
// +page.server.ts
import type { EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
    return [{ slug: 'hello' }, { slug: 'about' }, { slug: 'svelte-5' }];
};

export const load: PageServerLoad = async ({ params }) => {
    return { post: await getPostBySlug(params.slug) };
};
```

Each object in the returned array is a set of route parameters. SvelteKit calls `load` once per entry, renders the page, and writes the result to the right path. If a new slug appears you rebuild and redeploy.

`entries` can be async — read a directory of markdown files, query a CMS, hit a database — but it runs only at build time, not on every request.

### 1.4 `prerender = 'auto'` and crawling

Setting `prerender = true` on a layout makes every descendant prerenderable by default. You can opt out of a specific child with `prerender = false`. You can also set `prerender = 'auto'`, which means "prerender if SvelteKit's crawler finds a link to this route at build time". The crawler follows every `<a href>` from known pages and only builds what it can reach.

Most real projects use an explicit `entries()` for dynamic routes rather than relying on the crawler, because the crawler can miss pages that are only linked from user-generated content.

### 1.5 What breaks under prerendering

Prerendered pages cannot use any per-request information:

- **`request.headers`** — there is no request at build time.
- **`cookies`** — there is no request at build time.
- **`url.searchParams`** — the URL is just the pathname.
- **`event.locals`** (populated by server hooks) — hooks do not run at build time.
- **Any form action that mutates state** — prerendered pages are static.

If your load needs any of these, do not prerender it. If your load only uses `params` and the results of pure `fetch` calls against other routes or public APIs, it is prerenderable.

### 1.6 Mixing prerendered and dynamic in one app

Your app can have prerendered home and about pages, prerendered blog posts, and SSR-rendered dashboards in the same codebase. The build output contains the static HTML for the first group and the server code for the second. Your adapter chooses the right thing at deploy time.

### 1.7 What April 2026 adds

Some adapters (Vercel, Netlify) now support incremental static regeneration (ISR) on top of prerender — the static HTML is served immediately, then regenerated in the background on a schedule. That gives you SSG speed with near-SSR freshness. This is adapter-specific; check your adapter's docs.

### 1.8 What SvelteKit does under the hood

The prerendering pipeline is a build-time simulation of SSR. Here is the exact sequence during `pnpm build`:

1. **Build phase 1: Compile.** SvelteKit compiles all components, loads, and server code into the output directory. This produces the server-side rendering code and the client-side hydration code, just like a normal SSR build.

2. **Build phase 2: Prerender.** SvelteKit starts an in-process HTTP server using the compiled code. For every route marked with `prerender = true`:
   a. If the route is static (`/about`), SvelteKit navigates to it internally.
   b. If the route is dynamic (`/blog/[slug]`), SvelteKit calls `entries()` to get the list of parameter objects, then navigates to each one.
   c. For each navigation, the full SSR pipeline runs: layout loads, page loads, component rendering. The result is a complete HTML page.
   d. The HTML is written to the output directory as a static file: `build/about/index.html`, `build/blog/hello/index.html`, etc.
   e. Any data fetched during the load (via the enhanced fetch) is also embedded, so hydration works on the static file.

3. **Build phase 3: Crawl (for `prerender = 'auto'`).** After rendering explicitly prerendered pages, SvelteKit's crawler scans the generated HTML for `<a href>` links. Any link that points to a route with `prerender = 'auto'` is added to the prerender queue. The crawler repeats until no new pages are found. This is how `prerender = 'auto'` discovers pages without you listing them in `entries()`.

4. **Output.** The build directory contains two kinds of files:
   - Static HTML files for prerendered routes (served directly by the CDN or static file server).
   - Server code for dynamic routes (requires a Node/edge runtime).

The adapter (Vercel, Netlify, Cloudflare, Node) decides how to deploy each kind.

### 1.9 The TypeScript angle

The `entries()` function is typed via `EntryGenerator` from `./$types`:

```ts
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = async () => {
    const posts = await db.posts.findMany({ select: { slug: true } });
    return posts.map(p => ({ slug: p.slug }));
};
```

`EntryGenerator` constrains the return type to `Array<RouteParams>`, where `RouteParams` is derived from the folder name. If your folder is `[slug]`, the return must be `Array<{ slug: string }>`. If your folder is `[category]/[id]`, the return must be `Array<{ category: string; id: string }>`. TypeScript catches missing or misnamed parameters at compile time.

The `prerender` export itself is typed as `boolean | 'auto'`. There is no string union beyond those two — TypeScript prevents typos like `'true'` or `'yes'`.

### 1.10 Comparison: SSG vs SSR vs CSR vs ISR

| Aspect | SSG (prerender) | SSR | CSR (csr only) | ISR (adapter-specific) |
| --- | --- | --- | --- | --- |
| When HTML is generated | Build time | Request time | Never (JS renders) | Build + background regen |
| Server needed at runtime | No | Yes | No (static host) | Yes (for regen) |
| TTFB | Fastest (CDN edge) | Medium (server compute) | Fast (empty HTML) | Fast (cached) |
| Data freshness | Stale until rebuild | Always fresh | Always fresh | Configurable staleness |
| Works with cookies | No | Yes | Yes (client-side) | Depends on setup |
| Works with form actions | No | Yes | No | Limited |
| SEO | Excellent | Excellent | Poor (JS-dependent) | Excellent |
| Build time scales with | Number of pages | N/A | N/A | Number of pages (initial) |

> **In production sidebar.** Our documentation site has 340 pages of technical content. Each page takes ~200ms to render during build. With SSG, the full build takes about 70 seconds. We deploy to Cloudflare Pages, where each page is served from the edge in under 10ms — faster than any SSR setup. The trade-off: when we fix a typo, we have to rebuild and redeploy the entire site. For a docs site that changes a few times a week, this is acceptable. For a product catalog that changes hourly, we would use ISR or SSR instead. The decision framework: if the data changes less often than you deploy, prerender. If it changes between deployments, use SSR or ISR.

### 1.11 Common interview question

**Q: "When should you prerender a SvelteKit route, and what are the limitations?"**

**Model answer:** Prerender a route when its content is the same for every visitor and changes infrequently — blog posts, documentation, marketing pages, about pages. The route's load function must not use per-request information: no cookies, no request headers, no `event.locals`, no URL search params. It can only use `params` (provided by `entries()`) and the results of deterministic fetch calls. Prerendered pages cannot host form actions that mutate server state. The limitation is staleness: prerendered content is frozen at build time and only updates on the next build+deploy. For dynamic routes, you must provide an `entries()` function that lists every parameter combination. If the list is unknown at build time (user-generated content with arbitrary slugs), prerendering is not practical — use SSR or ISR instead.

## Deep Dive

**`prerender = 'auto'` and the crawler.** The crawler follows `<a href>` links in rendered HTML. It does not follow links generated by JavaScript after hydration, links inside `{#if}` blocks that are false during SSR, or links built from user input. For dynamic routes, the crawler is a best-effort discovery tool — it may miss pages that are only linked from dynamically rendered content. Always use explicit `entries()` for routes that must be prerendered reliably.

**Combining `prerender = true` with `csr = false`.** Setting both produces a fully static page with zero client-side JavaScript. The page cannot hydrate — no event handlers, no reactivity, no `$state`. This is ideal for pure content pages (privacy policy, terms of service) where interactivity is unnecessary. The page loads faster because there is no JS to download, parse, or execute.

**Prerendering and trailing slashes.** The `trailingSlash` config affects how prerendered files are named. With `trailingSlash: 'always'`, `/about/` renders to `about/index.html`. With `trailingSlash: 'never'`, `/about` renders to `about.html`. The default (`trailingSlash: 'ignore'`) renders to `about/index.html`. This matters for deployment because some static hosts (GitHub Pages) require trailing slashes, while others (Netlify) handle both.

## Going Deeper

- **SvelteKit docs:** [Page options — prerender](https://svelte.dev/docs/kit/page-options#prerender) covers every option including `entries()` and the crawler.
- **Advanced pattern:** Use `entries()` to query a CMS at build time, fetching all published slugs. Combine with a GitHub Actions workflow that triggers a rebuild whenever the CMS publishes new content (via a webhook).
- **Challenge:** Create a dynamic route with `prerender = true` and `entries()`. Build the project. Find the generated HTML files in the output directory. Now add a new entry to `entries()`, rebuild, and verify the new file appears. What happens if `entries()` returns a slug that the load function cannot find? (Answer: the build fails with an error from the load function.)

## 2. Style it — PE7 for a build-time stamp

The mini-build shows a prerendered page with a build-time timestamp. Every time you reload the page in `pnpm dev` the timestamp changes (because `dev` does not actually prerender); after `pnpm build && pnpm preview` the timestamp is frozen. We use a cool teal (`oklch(70% 0.15 170)`).

## 3. Interact — a prerendered page with inline data

```ts
// +page.server.ts
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = () => {
    return {
        builtAt: new Date().toISOString(),
        note: 'This page was prerendered at build time.'
    };
};
```

For the course repository we prefer `+page.ts` because `pnpm dev` uses it in both environments without requiring a rebuild — but the `prerender = true` export is honoured during `pnpm build`.

## 4. Mini-build — a prerenderable page

**Paths:**

- `src/routes/modules/09a-load/10-ssg-prerender/+page.svelte`
- `src/routes/modules/09a-load/10-ssg-prerender/+page.ts`

The file declares `export const prerender = true`. In dev the page behaves like any other universal load; in a production build it becomes a static `.html` file.

### Prove it

1. Run `pnpm build` and look at `.svelte-kit/output/prerendered/pages/modules/09a-load/10-ssg-prerender.html`. That is the prerendered HTML file.
2. Run `pnpm preview` and visit the page. No server code runs for this route — the preview server serves the file directly.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does <code>export const prerender = true</code> do?</summary>

It tells SvelteKit to render the route once at build time and save the result as a static HTML file. At request time the server just serves the file without running any component or load code.
</details>

<details>
<summary><strong>Q2.</strong> Why does a dynamic route need <code>entries()</code> when prerendered?</summary>

Because SvelteKit does not know which parameter values to build without being told. `entries()` returns the list of every params object the route should be rendered with.
</details>

<details>
<summary><strong>Q3.</strong> Can a prerendered page read <code>cookies</code>?</summary>

No. There is no request at build time, so there are no cookies. If your load needs cookies, it cannot be prerendered.
</details>

<details>
<summary><strong>Q4.</strong> What is the difference between <code>prerender = true</code> and <code>prerender = 'auto'</code>?</summary>

`true` always prerenders the route. `'auto'` prerenders only if SvelteKit's crawler finds a link to the route while building. Use `true` for routes that must be static; use `'auto'` when you want the crawler to decide.
</details>

<details>
<summary><strong>Q5.</strong> Does prerendering mean the page ships no JavaScript?</summary>

No. Prerendering only affects the HTML. The component still hydrates on the client unless you also set `csr = false`. If you want both the static HTML and no client JavaScript, use `prerender = true` together with `csr = false`.
</details>

## 6. Common mistakes

- **Prerendering a route that depends on cookies, query params or locals.** The build will fail with a clear error. Move the per-request parts to a different route or skip prerendering.
- **Forgetting `entries()` for a dynamic route.** The build will warn that it could not determine the slugs and will skip those pages.
- **Combining `prerender = true` with form actions that mutate state.** Form actions need a runtime server; a prerendered page cannot host them. Use a sibling route for the action.
- **Testing prerendering in `pnpm dev`.** Dev always runs loads per request. You must run `pnpm build && pnpm preview` to see the real behaviour.

## 7. What's next

Module 9A is complete. Module 9B introduces **remote functions** — a typed, runes-native alternative to load that is gated by `experimental.remoteFunctions` in `svelte.config.js`. The two systems can coexist; remote functions often win for small mutations and load still wins for page-level data with cache keys.
