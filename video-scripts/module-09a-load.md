# Module 9A — Load Functions: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Keep Network tab visible to show data loading. Split-screen: editor (left), browser (right) for most lessons.

---

## Lesson 9A.1 — What load functions are and why they exist

**Duration:** 11 minutes
**Screen setup:** Split-screen: slides/diagrams (left), browser with Network tab (right)

### Hook (30 seconds)
"Your page needs data. A list of products, a user profile, blog posts. Do you fetch in the component? In an `$effect`? On the server? The answer matters for SEO, performance, and user experience. Load functions are SvelteKit's answer — and they solve problems you didn't know you had."

### Demo sequence
1. **[0:30-2:30] The client-fetch problem** — Show fetching in `$effect`: loading spinner, SEO blank, waterfall requests. "Fetch in the component: no SSR, no SEO, loading spinners, cascading waterfalls."
2. **[2:30-5:00] Load functions** — Create `+page.server.ts` with a `load` function. Return data. Access in `+page.svelte` via `let { data } = $props()`. View page source — data is in the HTML. "Load functions run before rendering. Data is available when the component first renders — on server AND client."
3. **[5:00-7:30] Server vs universal** — `+page.server.ts` runs only on the server (access databases, secrets). `+page.ts` runs on server and client (use browser APIs after hydration).
4. **[7:30-9:30] Build the mini-build** — Blog list page with `+page.server.ts` loading posts from a mock database. View source shows posts in HTML.
5. **[9:30-10:30] Edge case / gotcha** — "Load functions must return serializable data — no functions, no class instances, no Maps. Everything must survive JSON serialization because it's sent from server to client via `<script>` tag."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Where to fetch data?"
- 2:30 — "Load functions: data before render"
- 5:00 — "Server vs universal load"
- 7:30 — "Blog list mini-build"
- 9:30 — "Serialization constraint"

### Callout graphics
- Client fetch vs load function comparison
- Load function data flow diagram
- Serialization rules reference

### Outro (30 seconds)
"Load functions give you data before rendering — no spinners, full SEO. Next lesson: the key difference between `+page.ts` and `+page.server.ts`."

---

## Lesson 9A.2 — `+page.ts` vs `+page.server.ts`

**Duration:** 11 minutes
**Screen setup:** Editor with both files side by side

### Hook (30 seconds)
"Two files. Same purpose. Different powers. `+page.server.ts` can touch your database but never runs in the browser. `+page.ts` runs everywhere but can't access server-only resources. Choosing wrong means security holes or capability gaps."

### Demo sequence
1. **[0:30-3:00] +page.server.ts** — Server-only. Access databases, environment secrets, file system. Never shipped to the browser. Show database query inside it.
2. **[3:00-5:30] +page.ts** — Universal. Runs on server during SSR, then on client during navigation. Can use browser APIs (behind checks). Show fetching from a public API.
3. **[5:30-7:30] When to use which** — Table: database access -> server. API key secrets -> server. Public API -> either. Browser API (geolocation) -> universal.
4. **[7:30-9:30] Both together** — Show `+page.server.ts` loading sensitive data and `+page.ts` merging it with client-side data. "Server load runs first. Universal load receives server data via `parent()`."
5. **[9:30-10:30] Edge case / gotcha** — "If both files exist, `+page.server.ts` runs first and its data is available to `+page.ts` via `parent()`. But you can't import from one to the other — they're separate execution contexts."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Two files, different powers"
- 3:00 — "+page.ts — universal execution"
- 5:30 — "Decision table"
- 7:30 — "Both together"
- 9:30 — "Separate execution contexts"

### Callout graphics
- Server vs universal load comparison table
- Decision flowchart
- Data flow when both files exist

### Outro (30 seconds)
"Choose `+page.server.ts` for secrets and databases, `+page.ts` for public data and browser APIs. Next lesson: auto-generated types that make load functions type-safe end-to-end."

---

## Lesson 9A.3 — Auto-generated `$types` — end-to-end type safety

**Duration:** 10 minutes
**Screen setup:** Editor showing load function and page component with type hints

### Hook (30 seconds)
"You add a field to your load function's return value. Every component that uses that data gets autocomplete and type checking — instantly, automatically, without you touching a type file. SvelteKit generates types from your load functions and injects them via `$types`."

### Demo sequence
1. **[0:30-2:30] The problem without types** — A load function returns `{ title, posts }`. The page accesses `data.titl` — no error. "Typo silently returns undefined."
2. **[2:30-5:00] Auto-generated types** — Import `PageLoad` from `./$types`. Type the function: `export const load: PageLoad = async () => { ... }`. Now `data` in the page is fully typed.
3. **[5:00-7:00] End-to-end flow** — Change the return type in load — the page's `data` type updates. Add a new field — autocomplete shows it. Remove a field — red squiggly in the page.
4. **[7:00-8:30] Layout types** — `LayoutLoad`, `LayoutServerLoad`. Same auto-generation for layout load functions.
5. **[8:30-9:30] Edge case / gotcha** — "Auto-generated types are created by `vite dev` or `vite build`. If types seem wrong, restart the dev server. The `.svelte-kit/types` folder is regenerated on each restart."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The typo that returns undefined"
- 2:30 — "$types auto-generation"
- 5:00 — "End-to-end type flow"
- 7:00 — "Layout types"
- 8:30 — "Regenerating types"

### Callout graphics
- Type flow: load function -> $types -> page component
- Auto-generated type file location
- Before/after: untyped vs typed data access

### Outro (30 seconds)
"Auto-generated types eliminate the gap between load functions and page components. Next lesson: SvelteKit's enhanced `fetch` inside load functions."

---

## Lesson 9A.4 — `fetch` inside load — SvelteKit's enhanced fetch

**Duration:** 11 minutes
**Screen setup:** Editor with load function, browser Network tab

### Hook (30 seconds)
"SvelteKit gives your load function a special `fetch` that does things the global `fetch` can't: it forwards cookies, deduplicates requests, and on the server it can call your own API routes without making an HTTP request. Same API, superpowered behavior."

### Demo sequence
1. **[0:30-2:30] The enhanced fetch** — Show `export async function load({ fetch }) { const res = await fetch('/api/posts') }`. Explain: this `fetch` is not `globalThis.fetch`.
2. **[2:30-5:00] Cookie forwarding** — On the server, the load function's `fetch` automatically forwards the user's cookies to internal API routes. No manual header passing. "Authentication just works across internal requests."
3. **[5:00-7:30] Deduplication** — Two load functions (page + layout) both fetch `/api/user`. SvelteKit deduplicates to one request. Show in Network tab.
4. **[7:30-9:30] Internal optimization** — `fetch('/api/posts')` on the server doesn't make an HTTP request — it calls the handler directly. Zero network overhead.
5. **[9:30-10:30] Edge case / gotcha** — "External API calls (e.g., `fetch('https://api.example.com')`) don't get cookie forwarding or deduplication. Those features only apply to same-origin requests."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Superpowered fetch"
- 2:30 — "Automatic cookie forwarding"
- 5:00 — "Request deduplication"
- 7:30 — "Internal call optimization"
- 9:30 — "External API limitations"

### Callout graphics
- Enhanced fetch vs global fetch comparison
- Internal request optimization diagram
- Deduplication flow

### Outro (30 seconds)
"SvelteKit's enhanced fetch handles cookies, deduplication, and internal optimization automatically. Next lesson: layout data and the `parent()` function."

---

## Lesson 9A.5 — Layout data and `parent()`

**Duration:** 11 minutes
**Screen setup:** Editor with layout and page load functions, browser showing inherited data

### Hook (30 seconds)
"Your root layout loads the current user. Every page needs it. Do you re-fetch the user in every page's load function? No — layout data flows down automatically. And when a page needs to ACCESS layout data, `parent()` gives it the complete merged result."

### Demo sequence
1. **[0:30-2:30] Layout load functions** — Create `+layout.server.ts` that loads user data. Show that every child page receives `data.user` automatically.
2. **[2:30-5:00] parent()** — In a page load function: `const { user } = await parent()`. Access the layout's data to make page-specific decisions. "parent() gives you the merged data from all ancestor layouts."
3. **[5:00-7:30] Waterfall warning** — Show that calling `parent()` creates a sequential dependency. The page waits for all ancestor layouts to load first. "Use parent() only when you need ancestor data for your own load logic."
4. **[7:30-9:30] Build the mini-build** — Root layout loads user. Dashboard layout loads sidebar data. Page loads page-specific data using user from parent(). All three merge into `data`.
5. **[9:30-10:30] Edge case / gotcha** — "Layout data re-runs when you call `invalidate()`. But if the layout's load function hasn't changed its dependencies, SvelteKit skips re-running it. Use `depends()` to control when layouts re-run."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Data inheritance from layouts"
- 2:30 — "parent() for accessing ancestor data"
- 5:00 — "The waterfall trade-off"
- 7:30 — "Three-level data flow"
- 9:30 — "Controlling re-runs"

### Callout graphics
- Layout data inheritance diagram
- parent() waterfall timeline
- Three-level data merge illustration

### Outro (30 seconds)
"Layout data flows down automatically. Use `parent()` sparingly to avoid waterfalls. Next lesson: parallel data loading with `Promise.all`."

---

## Lesson 9A.6 — Parallel data loading — `Promise.all` and the waterfall

**Duration:** 11 minutes
**Screen setup:** Editor with load function, browser Network tab showing parallel requests

### Hook (30 seconds)
"Your page needs users AND posts AND comments. You `await` each one sequentially: 200ms + 150ms + 100ms = 450ms. With `Promise.all`, they run in parallel: max(200, 150, 100) = 200ms. You just saved 55% of your loading time with one line change."

### Demo sequence
1. **[0:30-2:30] The waterfall** — Sequential awaits in a load function. Network tab shows requests firing one after another. Total: sum of all durations.
2. **[2:30-5:00] Promise.all** — `const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()])`. Network tab shows parallel requests. Total: max duration.
3. **[5:00-7:30] Dependent vs independent** — Show when you CAN'T parallelize: fetching a user, then fetching their posts (dependent). Show the pattern: `const user = await fetchUser(); const [posts, settings] = await Promise.all([fetchPosts(user.id), fetchSettings(user.id)])`.
4. **[7:30-9:30] Build the mini-build** — Dashboard with four data sources loaded in parallel. Show the Network waterfall before and after optimization.
5. **[9:30-10:30] Edge case / gotcha** — "`Promise.all` fails fast. If ONE promise rejects, the entire batch rejects. Use `Promise.allSettled` when you want partial results — show data that loaded even if some failed."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The sequential waterfall"
- 2:30 — "Promise.all: parallel loading"
- 5:00 — "Dependent vs independent data"
- 7:30 — "Dashboard with parallel loading"
- 9:30 — "Promise.all fails fast"

### Callout graphics
- Waterfall vs parallel loading timeline
- Dependent/independent data decision diagram
- Promise.all vs Promise.allSettled comparison

### Outro (30 seconds)
"Parallel loading eliminates unnecessary waterfalls. Next lesson: `depends()` and `invalidate()` — controlling exactly when your load functions re-run."

---

## Lesson 9A.7 — `depends()` and `invalidate()` — manual cache control

**Duration:** 11 minutes
**Screen setup:** Editor with load function and page component, browser showing re-fetching

### Hook (30 seconds)
"A user likes a post. The like count should update. But the load function doesn't re-run because nothing about the URL changed. `invalidate('app:posts')` tells SvelteKit: 'the data I labeled `app:posts` is stale — reload it.' Fine-grained, manual cache control."

### Demo sequence
1. **[0:30-2:30] The staleness problem** — Like a post via form action. Return to the list — count is stale. "The load function ran once. It doesn't know the data changed."
2. **[2:30-5:00] depends() and invalidate()** — In load: `depends('app:posts')`. After the like action: `invalidate('app:posts')`. Load function re-runs. Data refreshes.
3. **[5:00-7:30] Granular dependencies** — Multiple dependencies: `depends('app:posts')`, `depends('app:user')`. Invalidate only what changed: `invalidate('app:posts')` re-runs post loading without touching user loading.
4. **[7:30-9:30] invalidateAll** — Show `invalidateAll()` — re-runs every load function. "Nuclear option. Use when you don't know exactly what changed."
5. **[9:30-10:30] Edge case / gotcha** — "URL-based dependencies are automatic. If your load function fetches `/api/posts`, navigating to a new URL that changes the path automatically invalidates. Custom `depends()` strings are for non-URL-based invalidation."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Stale data after mutation"
- 2:30 — "depends + invalidate"
- 5:00 — "Granular dependencies"
- 7:30 — "invalidateAll"
- 9:30 — "Automatic URL dependencies"

### Callout graphics
- Dependency graph: load functions -> dependency keys -> invalidation triggers
- Granular vs full invalidation comparison
- Auto-detection of URL dependencies

### Outro (30 seconds)
"Dependencies and invalidation give you precise control over data freshness. Next lesson: error handling in load functions — `error()` and `redirect()`."

---

## Lesson 9A.8 — Error handling in load — `error()` and `redirect()`

**Duration:** 10 minutes
**Screen setup:** Editor with load function, browser showing error pages and redirects

### Hook (30 seconds)
"A user requests `/blog/nonexistent-post`. Your load function queries the database — no result. What do you return? Not `null`. Not an empty object. You throw `error(404, 'Post not found')` — and SvelteKit renders your `+error.svelte` page with the correct HTTP status code."

### Demo sequence
1. **[0:30-2:30] error()** — `import { error } from '@sveltejs/kit'`. In load: `if (!post) error(404, 'Post not found')`. Show the error page rendering.
2. **[2:30-5:00] Custom error pages** — Create `+error.svelte` at route and root levels. Show `page.error.message` and `page.status`. Style the error page.
3. **[5:00-7:00] redirect()** — `import { redirect } from '@sveltejs/kit'`. `if (!session) redirect(303, '/login')`. Show the redirect happening.
4. **[7:00-8:30] Error hierarchy** — Route-level `+error.svelte` catches errors in that route. Root catches everything else. Layout errors need special handling.
5. **[8:30-9:30] Edge case / gotcha** — "`error()` and `redirect()` work by throwing exceptions. Don't wrap them in try/catch inside load functions — the catch will swallow them and SvelteKit won't see the error/redirect."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The right way to handle missing data"
- 2:30 — "Custom error pages"
- 5:00 — "Redirects in load"
- 7:00 — "Error page hierarchy"
- 8:30 — "Don't catch error() throws"

### Callout graphics
- error() and redirect() usage patterns
- Error page hierarchy diagram
- HTTP status code reference for common cases

### Outro (30 seconds)
"Proper error handling in load functions gives users clear feedback and search engines correct status codes. Next lesson: streaming — progressive rendering with Promise returns."

---

## Lesson 9A.9 — Streaming with `Promise` returns — progressive rendering

**Duration:** 12 minutes
**Screen setup:** Editor with load function, browser showing progressive content appearance

### Hook (30 seconds)
"Your page needs fast data (user profile: 50ms) and slow data (analytics: 2 seconds). Do you make the user wait 2 seconds for everything? No. Stream it. The page renders immediately with the fast data, and the slow data appears when it's ready — no loading spinner for the whole page."

### Demo sequence
1. **[0:30-2:30] The blocking problem** — `await` both — page waits 2 seconds. User sees nothing until everything is ready.
2. **[2:30-5:30] Streaming pattern** — Return the slow promise unwrapped: `return { user: await getUser(), analytics: getAnalytics() }`. The page renders with `user` immediately. `analytics` streams in when ready.
3. **[5:30-8:00] Template pattern** — `{#await data.analytics}<Skeleton />{:then analytics}<AnalyticsChart {analytics} />{/await}`. Fast data renders instantly. Slow data shows a skeleton, then resolves.
4. **[8:00-10:00] Build the mini-build** — Dashboard: user info (fast), recent activity (fast), analytics charts (slow), recommendations (slow). Fast sections render instantly. Slow sections stream in.
5. **[10:00-11:30] Edge case / gotcha** — "Streaming only works with SSR. If the page is CSR-only (`ssr = false`), everything loads on the client anyway. Also, the streamed promise's rejection isn't caught by `+error.svelte` — handle errors inside the `{#await}` block."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Fast data waits for slow data"
- 2:30 — "Return the promise, don't await"
- 5:30 — "Template streaming pattern"
- 8:00 — "Dashboard with streaming"
- 10:00 — "SSR requirement and error handling"

### Callout graphics
- Blocking vs streaming timeline
- Load function return: awaited vs unawaited
- Dashboard streaming architecture

### Outro (30 seconds)
"Streaming gives your users instant content for fast data while slow data loads progressively. Last lesson of Module 9A: Static Site Generation with `prerender`."

---

## Lesson 9A.10 — SSG — Static Site Generation with `prerender` and `entries()`

**Duration:** 11 minutes
**Screen setup:** Editor with page config and entries function, terminal showing build output

### Hook (30 seconds)
"Your blog has 200 posts. None change after publish. Why render them on every request? `prerender = true` builds each page to static HTML at deploy time. Zero server cost. CDN-fast delivery. The page exists before anyone requests it."

### Demo sequence
1. **[0:30-2:30] prerender option** — `export const prerender = true` in `+page.ts`. Build — show the HTML file generated in the build output.
2. **[2:30-5:00] entries() for dynamic routes** — `export function entries() { return [{ slug: 'post-1' }, { slug: 'post-2' }] }`. Tell SvelteKit which dynamic slugs to prerender.
3. **[5:00-7:30] Data from CMS/DB at build time** — Show `entries()` fetching all slugs from a database or CMS. "The build process queries your data source for all valid routes."
4. **[7:30-9:30] Build the mini-build** — Blog with prerendered list and detail pages. Show build output. Deploy to static hosting. Show instant page loads.
5. **[9:30-10:30] Edge case / gotcha** — "Prerendered pages can't use cookies, request headers, or form actions — there's no request at runtime. If you need personalization, use SSR instead. Or use client-side JS to add personalized elements after the static page loads."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Build once, serve forever"
- 2:30 — "entries() for dynamic routes"
- 5:00 — "Data from CMS at build time"
- 7:30 — "Blog with static generation"
- 9:30 — "No request-time features"

### Callout graphics
- SSG build process flow diagram
- entries() function producing route list
- SSR vs SSG decision table

### Outro (30 seconds)
"Static Site Generation gives you maximum speed at zero server cost. Module 9A is complete — you understand load functions from basic data fetching to streaming and static generation. Module 9B introduces Remote Functions — a new way to call server code directly from components."

---
