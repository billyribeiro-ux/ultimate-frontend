---
module: 9A
lesson: 9A.7
title: depends() and invalidate() — manual cache control
duration: 50 minutes
prerequisites:
  - Lesson 9A.1 — Load functions
  - Lesson 8.8 — $app/navigation
learning_objectives:
  - Explain SvelteKit's load cache and when it is re-run
  - Declare a dependency key in a load with depends()
  - Re-run specific loads with invalidate(key)
  - Re-run every load with invalidateAll()
  - Design fine-grained cache keys for a real feature
status: ready
---

# Lesson 9A.7 — `depends()` and `invalidate()` — manual cache control

## 1. Concept — Teaching SvelteKit when data is stale

### 1.1 The problem — a refresh button that does not refresh

Imagine a dashboard with a list of orders loaded by `+page.server.ts`. The user places a new order in a modal. You close the modal and want the list to update. You call `goto('/orders')` — but SvelteKit sees that you are already on `/orders`, thinks the data is fresh, and serves the cached version. The new order does not appear.

Or worse: the user clicks a "refresh" button you added. You call `location.reload()`, which throws away everything — the client state, the form position, the scroll. That is too aggressive. You want to re-run the load and nothing else.

SvelteKit's answer is a **dependency graph**. You tell each load function which "things" it depends on by calling `depends('key')` inside it. Later, when one of those things changes, you call `invalidate('key')` and SvelteKit re-runs every load that declared that dependency, in parallel, without touching the components that did not care.

### 1.2 `depends(key)` — declaring a dependency

Inside a load function, call `depends(key)` with any string. The key is just an identifier for the thing this load depends on.

```ts
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends }) => {
    depends('app:orders');
    const orders = await db.orders.findMany();
    return { orders };
};
```

The convention `app:something` is not required, but it avoids collisions with built-in URL-based keys. Any string works.

### 1.3 `invalidate(key)` — re-running only what needs to re-run

From anywhere in a component, call `invalidate(key)` and every load that declared that dependency re-runs. Other loads are left alone, so layout data and unrelated page data stays cached.

```svelte
<script lang="ts">
    import { invalidate } from '$app/navigation';

    async function refreshOrders(): Promise<void> {
        await invalidate('app:orders');
    }
</script>

<button onclick={refreshOrders}>Refresh orders</button>
```

You can also pass a URL instead of a custom key. Any load that fetched that URL (via the enhanced fetch) automatically depends on it, and `invalidate('/api/orders')` will re-run them without your having to call `depends` yourself. The custom keys are for dependencies that are not URL-shaped — "the active theme", "the feature flags", "the shopping cart".

### 1.4 `invalidateAll()` — the sledgehammer

`invalidateAll()` re-runs every load on the current page, in parallel. It is correct but wasteful. Use it when you do not know what changed — for example, after a logout that should clear all cached data. Prefer `invalidate(key)` when you can.

### 1.5 Designing good cache keys

Good keys are:

- **Named by what they represent, not by who reads them.** `app:orders` is good; `OrderListLoad` is bad (coupled to the function name).
- **Fine-grained when it helps.** `app:order:${id}` lets you invalidate one order without touching the list.
- **Consistent across the codebase.** Agree on a naming convention (`app:<resource>` is common) and stick to it.

### 1.6 When loads re-run automatically

You do not always need `depends` and `invalidate`. SvelteKit re-runs a load automatically when:

- The URL changes (a new `params.slug`).
- A URL dependency tracked by the enhanced fetch changes.
- A form action that returns `fail()` or succeeds against the same page.
- `goto(url, { invalidateAll: true })` is called.

Custom dependencies are for cases where nothing in the URL changed but the underlying data did — typically after a mutation.

### 1.7 What May 2026 adds

Remote functions (Module 9B) add a different model for mutations that integrates more tightly with `depends`/`invalidate`. In particular, a remote `command` can attach an invalidation key so calling the command automatically invalidates the right queries. That is beyond the scope of this module — we mention it so students know there is a tighter integration waiting for them in the next module.

### 1.8 What SvelteKit does under the hood

The dependency and invalidation system is a graph-based cache manager. Here is the internal lifecycle:

**Registration phase (during load execution):**

1. Every load function starts with an empty dependency set.
2. When you call `depends('app:orders')`, SvelteKit adds that string key to the load's dependency set.
3. When the enhanced `fetch` fetches a URL (e.g., `fetch('/api/orders')`), SvelteKit automatically adds that URL to the dependency set. You do not need to call `depends()` for URL-based dependencies.
4. The dependency set is stored alongside the cached load result.

**Invalidation phase (when `invalidate()` is called):**

1. You call `invalidate('app:orders')` from a component.
2. SvelteKit walks every cached load function on the current page (page loads and every layout load in the tree).
3. For each cached load, SvelteKit checks: does this load's dependency set contain `'app:orders'`? If yes, mark it as stale.
4. All stale loads are re-run **in parallel**. Non-stale loads keep their cached values.
5. For server loads, the re-run happens via the `__data.json` internal endpoint. For universal loads, the re-run happens in the browser.
6. The component receives the new data via the `data` prop. Svelte's reactivity handles the re-render.

**URL-based invalidation works the same way.** `invalidate('/api/orders')` matches any load that fetched that URL via the enhanced fetch. The URL is compared as a string — exact match, including query parameters.

**`invalidateAll()` skips the matching step** and marks every load on the current page as stale. All of them re-run in parallel. This is a sledgehammer but guarantees freshness.

### 1.9 The TypeScript angle

The `depends` and `invalidate` functions are typed but loosely. `depends()` accepts any string, and `invalidate()` accepts any string or a `URL` object. There is no compile-time guarantee that the key you pass to `invalidate` matches a key registered with `depends`. This is a deliberate design choice — dependency keys are dynamic values (they might include an entity ID like `app:order:${id}`), and TypeScript cannot track runtime string values.

To prevent typos, use constants:

```ts
// src/lib/cache-keys.ts
export const CACHE_KEYS = {
    orders: 'app:orders',
    orderById: (id: string) => `app:order:${id}`,
    cart: 'app:cart',
    user: 'app:user'
} as const;
```

```ts
// In a load function
import { CACHE_KEYS } from '$lib/cache-keys';
depends(CACHE_KEYS.orders);
```

```svelte
<!-- In a component -->
<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { CACHE_KEYS } from '$lib/cache-keys';
    const refresh = () => invalidate(CACHE_KEYS.orders);
</script>
```

Now renaming a key is a single-file change, and your IDE can find all references.

### 1.10 Comparison: invalidation strategies

| Strategy | Scope | When to use | Cost |
| --- | --- | --- | --- |
| `invalidate('app:orders')` | Only loads that depend on this key | After a mutation that affects orders | Minimal — one or two loads re-run |
| `invalidate('/api/orders')` | Only loads that fetched this URL | After you know the API data changed | Minimal — same as above |
| `invalidateAll()` | Every load on the current page | After logout, after unknown side effects | Moderate — all loads re-run |
| `goto(url, { invalidateAll: true })` | Navigate + invalidate everything | After a major state change | Full page data refresh |
| Page navigation (same URL) | Nothing re-runs (cached) | Never intentional | Zero |
| `location.reload()` | Full page reload | Avoid this | Maximum — destroys all client state |

> **In production sidebar.** Our team built a project management app where creating a task should update three views: the task list, the project summary, and the team member's workload. Initially we used `invalidateAll()` after every mutation. This worked but re-ran 7 load functions per task creation, including the navigation menu and user preferences — loads that had nothing to do with tasks. We switched to fine-grained keys: `app:tasks:${projectId}`, `app:project:${projectId}`, `app:workload:${memberId}`. After a task creation, we invalidate exactly those three keys. The result: 3 loads re-run instead of 7, and the perceived latency dropped by 40% because the cache-hit loads (nav, preferences) return instantly.

### 1.11 Common interview question

**Q: "You have a SvelteKit page that shows a list of orders. The user deletes an order in a modal. The modal closes, but the deleted order is still visible. What happened, and how do you fix it?"**

**Model answer:** The load function that fetches the order list is cached. Closing the modal did not change the URL, so SvelteKit sees no reason to re-run the load. The fix: call `invalidate('app:orders')` after the delete mutation completes, and make sure the load function has `depends('app:orders')` registered. Alternatively, if the delete is done via a form action, `use:enhance` with `update()` calls `invalidateAll()` automatically, which would re-run the load. For a remote function mutation (`command`), call `.refresh()` on the related query or use `invalidate()` manually. The key principle: mutations do not automatically invalidate reads. You must explicitly connect the two via dependency keys.

## Deep Dive

**Combining `depends` with streaming.** A streamed promise (Lesson 9A.9) can also have dependencies. If you return a bare promise from a server load and the load also calls `depends('app:analytics')`, invalidating that key will re-run the entire load — including the streamed part. The streamed promise is not cached independently; it is part of the load's return value. This means invalidation replaces everything the load returned, both fast and slow parts.

**Fine-grained vs coarse-grained keys.** There is no right answer to how granular your keys should be. A single `app:data` key that covers everything is equivalent to `invalidateAll()` — useless granularity. A key per database row (`app:order:abc123`) gives you surgical precision but means you need to know every affected row when invalidating. The sweet spot for most apps is **one key per resource type** (`app:orders`, `app:users`, `app:products`) with optional per-entity keys for detail pages (`app:order:${id}`). Start coarse and refine as profiling reveals unnecessary re-runs.

**`invalidate` with a predicate.** `invalidate()` also accepts a function: `invalidate((url) => url.pathname.startsWith('/api/'))`. This re-runs every load that fetched any URL matching the predicate. It is powerful but hard to reason about — prefer string keys for readability.

## Going Deeper

- **SvelteKit docs:** [Rerunning load functions](https://svelte.dev/docs/kit/load#Rerunning-load-functions) covers every invalidation trigger.
- **Advanced pattern:** Build a `createInvalidator(key: string)` utility that returns both the `depends` call (for use in loads) and the `invalidate` call (for use in components), ensuring the key is always consistent.
- **Challenge:** Create two pages under the same layout. Give them different dependency keys. Navigate between them and call `invalidate` with each key. Observe which loads re-run and which are cached. What happens if you invalidate a key that no load depends on? (Answer: nothing — `invalidate` resolves immediately.)

## 2. Style it — PE7 for a refreshable counter

The mini-build shows a server-generated random number and a refresh button. Clicking refresh calls `invalidate('app:lesson-9a-7')` and the load re-runs, producing a new number. We use a warm amber personality (`oklch(72% 0.18 65)`).

## 3. Interact — `depends` + `invalidate` round-trip

```ts
// +page.server.ts
export const load: PageServerLoad = ({ depends }) => {
    depends('app:lesson-9a-7');
    return { value: Math.random(), at: new Date().toISOString() };
};
```

```svelte
<script lang="ts">
    import { invalidate } from '$app/navigation';

    async function refresh(): Promise<void> {
        await invalidate('app:lesson-9a-7');
    }
</script>
```

## 4. Mini-build — a manually cache-refreshed value

**Paths:**

- `src/routes/modules/09a-load/07-depends-invalidate/+page.svelte`
- `src/routes/modules/09a-load/07-depends-invalidate/+page.server.ts`

The page shows a random number and a timestamp. Click **Refresh** and watch the values change — because SvelteKit re-ran the server load, not because the component did the work.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does <code>depends('app:orders')</code> do inside a load?</summary>

It registers a dependency on the custom key `app:orders`. The load will be re-run whenever `invalidate('app:orders')` is called.
</details>

<details>
<summary><strong>Q2.</strong> Can you <code>invalidate</code> a URL without calling <code>depends</code> first?</summary>

Yes. The enhanced fetch registers URL dependencies automatically, so `invalidate('/api/orders')` re-runs any load that fetched that URL. Custom string keys are for non-URL dependencies.
</details>

<details>
<summary><strong>Q3.</strong> When should you use <code>invalidateAll()</code>?</summary>

When you do not know what changed and want a safe reset — for example, after a logout. For targeted refreshes, prefer `invalidate(key)`.
</details>

<details>
<summary><strong>Q4.</strong> What is a good naming convention for custom dependency keys?</summary>

A namespace prefix followed by a resource name, for example `app:orders`, `app:user`, `app:cart`. Namespaces avoid collisions with URL-based keys and with third-party libraries.
</details>

<details>
<summary><strong>Q5.</strong> Does <code>invalidate</code> rerun the component's <code>$state</code>?</summary>

No. `invalidate` only re-runs load functions. Component state is untouched, which is the point — the form position, scroll and local UI state are preserved across the data refresh.
</details>

## 6. Common mistakes

- **Using `location.reload()` when you mean "refresh this data".** Full reload throws away everything. Use `invalidate(key)` for the targeted refresh.
- **Forgetting to call `depends` and then expecting `invalidate('app:x')` to re-run the load.** Without the declaration, the load is not subscribed to the key.
- **Calling `invalidateAll` after every button click.** Wasteful. It re-runs every load, including layout loads.
- **Using the same key for unrelated loads.** Every `invalidate` fires every one. Keys should be as fine-grained as the data they represent.

## 7. What's next

Lesson 9A.8 handles the other side of load: what to do when it fails, using the `error()` and `redirect()` helpers from `@sveltejs/kit`.
