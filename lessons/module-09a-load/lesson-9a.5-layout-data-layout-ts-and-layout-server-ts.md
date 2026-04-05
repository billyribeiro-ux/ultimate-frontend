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
