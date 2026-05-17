---
module: 9A
lesson: 9A.5
title: Layout data and parent()
duration: 50 minutes
prerequisites:
  - Lesson 9A.1 — Load functions
  - Lesson 8.5 — Nested layouts
learning_objectives:
  - Load data for a layout with +layout.ts or +layout.server.ts
  - Access the merged data from any descendant page via page.data
  - Use parent() in a child load to read a parent layout's data
  - Understand how layout data flows through nested subtrees
  - Decide what belongs in layout data vs page data
status: ready
---

# Lesson 9A.5 — Layout data and `parent()`

## 1. Concept — Data that many pages share

### 1.1 The problem — copy-pasting "current user" into every load

Most pages in a typical app need a small amount of shared data: the current user's name, their preferences, the site's navigation menu. If you put that query inside every `+page.server.ts`, you duplicate the same code in dozens of files, and every new page has to remember to add it.

Layouts solve this for markup — one shell wraps many pages. Layout loads solve the same problem for data. A `+layout.ts` (or `+layout.server.ts`) next to a `+layout.svelte` runs a load function that produces data available to the layout **and to every descendant page**. You write the query once and every page below inherits the result.

### 1.2 How layout data flows into pages

```ts
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    return { user: locals.user };
};
```

Every page under the root layout now receives `user` in its `data` prop, merged with whatever the page's own load returned:

```svelte
<!-- any child +page.svelte -->
<script lang="ts">
    import type { PageProps } from './$types';
    let { data }: PageProps = $props();
    // data.user comes from the layout load
    // data.post comes from this page's own load
</script>
```

You can also read the layout data from anywhere in the component tree via `page.data` from `$app/state`:

```svelte
<script lang="ts">
    import { page } from '$app/state';
    const userName: string = $derived(page.data.user?.name ?? 'Guest');
</script>
```

### 1.3 `parent()` — a child load asking its parent for data

Sometimes a page load needs to use the layout's data inside its own query. For example, the layout loads the current user, and the page load needs to filter a list by `user.id`. The page load can call `await parent()`:

```ts
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
    const { user } = await parent();
    if (!user) return { posts: [] };
    const posts = await db.posts.findMany({ where: { authorId: user.id } });
    return { posts };
};
```

`parent()` returns a promise that resolves to everything the parent load returned. **Use it only when you actually need the parent data inside the child load.** Calling `parent()` unnecessarily serialises the two loads — the child now has to wait for the parent to finish, even though they could have run in parallel.

### 1.4 Layout data cascades down, not sideways

Layout data flows from parents to children only. A page cannot modify its layout's data, and sibling pages cannot see each other's data. This is a deliberate simplification — it keeps the data flow predictable and the types clean.

If you need cross-page shared mutable state (a shopping cart, a draft being written), that is module-level state in a `.svelte.ts` file (Module 11), not layout data.

### 1.5 Choosing between `+layout.ts` and `+layout.server.ts`

Same rule as pages: server-only when you touch a database or a secret, universal otherwise. A layout that just fetches a public API should be `+layout.ts`; a layout that reads the session cookie to resolve the user should be `+layout.server.ts`.

### 1.6 What to put in layout data

Good candidates:

- **Authenticated user** — every page needs it, it never changes within a request.
- **Site navigation menu** — loaded once per request, reused everywhere.
- **Theme / locale preferences** — read from a cookie.
- **Feature flags** — evaluated once, available everywhere.

Bad candidates:

- **Data specific to one page** — it belongs in that page's own load.
- **Data that changes frequently** — layout data is cached for the whole navigation, so stale layout data becomes a correctness bug.

### 1.7 What SvelteKit does under the hood

The layout data system is elegant but has non-obvious mechanics. Here is the full request lifecycle when a user visits `/dashboard/analytics` and the route tree has three load functions:

```
src/routes/+layout.server.ts          -> returns { user }
src/routes/dashboard/+layout.ts       -> returns { sidebar }
src/routes/dashboard/analytics/+page.server.ts -> returns { metrics }
```

**Full page load:**

1. SvelteKit identifies all load functions in the route's layout chain: root layout, dashboard layout, analytics page.
2. **Root layout load** runs first (it is the outermost). It returns `{ user }`.
3. **Dashboard layout load** runs next. If it calls `await parent()`, it waits for the root layout to finish first. If it does not call `parent()`, SvelteKit can run it **in parallel** with the root layout load. This is a critical optimization: never call `parent()` unless you actually need the parent's data inside your load logic.
4. **Analytics page load** runs. Same rule: if it calls `parent()`, it waits; if not, it can overlap with other loads.
5. All results are merged into a single data object. The merge is shallow: `{ ...rootLayoutData, ...dashboardLayoutData, ...pageData }`. Later values overwrite earlier values with the same key, so be careful not to use the same field name in a layout and a child page.
6. The merged data is serialised with `devalue` and embedded in the HTML.
7. Each layout and page component receives its slice: `+layout.svelte` at each level gets the data from its own load plus all ancestor layout loads. `+page.svelte` gets everything.

**Client-side navigation from `/dashboard/analytics` to `/dashboard/settings`:**

1. SvelteKit compares the old and new routes. The root layout and dashboard layout are the same; only the page changed.
2. **Layout loads do NOT re-run** unless they have been invalidated. This is the caching behavior that makes layout data so efficient.
3. Only the new page's load runs. It receives the cached layout data via `parent()` or `data`.
4. The root `+layout.svelte` and dashboard `+layout.svelte` stay mounted. Only `+page.svelte` swaps.

This is why layout data is perfect for the current user, navigation menus, and theme preferences: the data loads once and persists across all navigations within the layout boundary.

### 1.8 The TypeScript angle

Layout types work like page types but cascade differently:

```ts
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    return { user: locals.user }; // { user: User | null }
};
```

```ts
// src/routes/dashboard/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
    // data.user is typed from the parent layout's return
    return {
        ...data,
        sidebar: { collapsed: false, items: ['Overview', 'Settings'] }
    };
};
```

```svelte
<!-- src/routes/dashboard/analytics/+page.svelte -->
<script lang="ts">
    import type { PageProps } from './$types';
    let { data }: PageProps = $props();
    // data.user    -> User | null (from root layout)
    // data.sidebar -> { collapsed: boolean, items: string[] } (from dashboard layout)
    // data.metrics -> Metric[] (from this page's own load)
</script>
```

The `PageProps` type at any depth is the recursive merge of all ancestor `LayoutLoad` return types plus the page's own load return type. This is entirely automatic. If you add a field to the root layout, every `PageProps` in the entire app updates.

One important typing subtlety: when a layout load and a page load both return a field with the same name, the page's field wins in the merge. TypeScript reflects this: `PageProps.data` uses the page's type for that field, not the layout's. This is rarely what you want, so use distinct field names across the hierarchy.

### 1.9 Comparison: layout data vs context vs module stores

| Aspect | Layout data | Svelte context | `.svelte.ts` module store |
| --- | --- | --- | --- |
| Scope | Current layout + all descendants | Current component + all descendants | Global (all pages, all components) |
| Survives navigation | Within the layout boundary | No (destroyed on unmount) | Yes (module-level singleton) |
| Reactive | Via `page.data` (read-only) | Via `$state` in context value | Via `$state` |
| Mutable from children | No | Yes (if value is reactive) | Yes |
| Server-side | Yes (loads run on server) | No (component-only) | No (component-only) |
| TypeScript | Auto-generated from load return | Manual (key + type) | Manual (exported type) |
| Best for | Read-only data from the server | Component tree communication | Cross-page mutable state |

> **In production sidebar.** Our SaaS app has a root layout load that fetches the current user, their subscription plan, and feature flags. This single load serves 42 descendant pages. Early on, we made the mistake of also including the user's notification count in the root layout data. The problem: the count needed to update in real time, but layout data is cached for the navigation session. We ended up calling `invalidateAll()` every 30 seconds, which re-ran all 42 pages' loads. The fix was moving the notification count to a module store (`.svelte.ts` file) that polls independently, leaving the layout data for truly stable values like the user identity and plan. Rule of thumb: if the data changes more often than the user navigates, it does not belong in layout data.

### 1.10 Common interview question

**Q: "A junior developer put the shopping cart total in a root layout load. Why is this a problem, and what should they use instead?"**

**Model answer:** Layout data is cached for the duration of the layout's mount. While the user navigates between pages inside that layout, the layout load does not re-run unless explicitly invalidated. A shopping cart total changes whenever the user adds or removes an item, which is far more frequent than page navigations. If the total is in layout data, the displayed total goes stale after every cart mutation until the user navigates to a page outside the layout (forcing a re-mount) or until someone calls `invalidateAll()`. The correct solution is a `.svelte.ts` module store (Lesson 11.3-11.4) for the cart, with a reactive `$derived` total that updates instantly on every mutation. Layout data should be reserved for values that change infrequently and are loaded from the server, like the current user, theme preferences, or feature flags.

## Deep Dive

**The `parent()` waterfall trap.** Calling `parent()` in a child load forces that child to wait for all ancestor loads to complete. In a deep layout tree (root -> section -> subsection -> page), calling `parent()` at every level creates a waterfall: root finishes, then section starts, then subsection starts, then page starts. If each takes 100 ms, the total is 400 ms. If none of them call `parent()`, SvelteKit runs all four in parallel — total 100 ms. The rule: only call `parent()` when you genuinely need a value from the parent load inside your own load logic. If you just need the parent's data in the component template, it is already merged into `data` automatically.

**Layout groups.** SvelteKit supports layout groups with parenthesized folder names: `(marketing)`, `(app)`. Routes inside `(marketing)` share a layout that routes inside `(app)` do not see. Layout loads follow the same grouping. A load in `src/routes/(marketing)/+layout.ts` runs only for marketing pages. This lets you avoid loading dashboard data (sidebar config, permissions) for public marketing pages, and vice versa. Layout groups are an architecture tool that directly reduces unnecessary data fetching.

**Reading layout data from any component.** You do not need the `data` prop to access layout data. Any component in the tree can read it via `page.data` from `$app/state`. This is especially useful for deeply nested components that need the user object but are not direct children of the layout. `page.data.user` works from anywhere, without prop drilling.

## Going Deeper

- **SvelteKit docs:** [Layout data](https://svelte.dev/docs/kit/load#Layout-data) covers the merge behavior and `parent()` in detail.
- **Advanced pattern:** Create a typed utility function `getLayoutData<T extends keyof LayoutData>(key: T): LayoutData[T]` that wraps `page.data[key]` with type narrowing. This avoids the `page.data` being typed as the union of all possible page data shapes.
- **Challenge:** Create a route with three levels of nested layouts. In each layout load, log `performance.now()` before and after. Run with `parent()` in every child, then remove all `parent()` calls. Compare the total load time. The parallel version should be roughly 3x faster.

## 2. Style it — PE7 for a "preferences" shell

The mini-build adds a layout to this lesson that loads a "user preference" (a chosen accent color) and passes it to the page. The page displays the layout-supplied value. We use a rose personality (`oklch(70% 0.2 15)`) with an accent color override from the layout data.

## 3. Interact — a layout load + a page load

```ts
// +layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = () => {
    return {
        preferences: {
            accent: 'oklch(70% 0.2 15)',
            locale: 'en-GB'
        }
    };
};
```

```ts
// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    const { preferences } = await parent();
    return {
        greeting: `Hello from the page load — your locale is ${preferences.locale}`
    };
};
```

## 4. Mini-build — layout data + page.data usage

**Paths:**

- `src/routes/modules/09a-load/05-layout-data/+layout.ts`
- `src/routes/modules/09a-load/05-layout-data/+layout.svelte`
- `src/routes/modules/09a-load/05-layout-data/+page.ts`
- `src/routes/modules/09a-load/05-layout-data/+page.svelte`

The layout loads preferences, the page reads them via `parent()` and returns a greeting, and the component renders both.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Where does a layout load function live, and what does it produce?</summary>

In a `+layout.ts` or `+layout.server.ts` alongside a `+layout.svelte`. Its return value is merged into the `data` prop of every descendant page, and is accessible anywhere via `page.data` from `$app/state`.
</details>

<details>
<summary><strong>Q2.</strong> When should a page load call <code>parent()</code>?</summary>

Only when it actually needs a value from the parent layout's data inside its own logic — for example, to filter a query by the current user's id. Calling `parent()` forces the page load to wait for the layout load, so do not call it unnecessarily.
</details>

<details>
<summary><strong>Q3.</strong> Does every descendant page automatically receive layout data in its <code>data</code> prop?</summary>

Yes. The merge is automatic, and `PageProps` from `./$types` contains both the page's and every ancestor layout's data.
</details>

<details>
<summary><strong>Q4.</strong> Can a page modify its layout's data?</summary>

No. Layout data is read-only in the descendant. If a descendant needs to change shared state, use module-level state in a `.svelte.ts` file or use form actions that trigger an invalidation.
</details>

<details>
<summary><strong>Q5.</strong> Where does <code>data.user</code> come from if neither <code>+page.ts</code> nor <code>+page.server.ts</code> returned it?</summary>

From an ancestor layout's load function. Layout data cascades down and merges into every descendant page's `data` prop.
</details>

## 6. Common mistakes

- **Calling `parent()` when you do not use its result.** It serialises the loads and slows the page down.
- **Putting per-page data into a layout load.** It pollutes every descendant and caches data that is not actually shared.
- **Forgetting the `await` on `parent()`.** It returns a promise. Without `await`, you get a promise object, not the data.
- **Assuming layout data refreshes on every navigation inside the layout.** It is cached; the layout load re-runs only when you invalidate it. This is covered in Lesson 9A.7.

## 7. What's next

Lesson 9A.6 tackles the waterfall problem — how to load three independent pieces of data in parallel instead of one after another.
