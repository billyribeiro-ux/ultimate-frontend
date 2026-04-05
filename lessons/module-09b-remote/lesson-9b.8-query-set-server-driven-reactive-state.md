---
module: 9B
lesson: 9B.8
title: query.set and query.refresh — server-driven reactive state
duration: 55 minutes
prerequisites:
  - Lesson 9B.7 — `command` remote functions
learning_objectives:
  - Distinguish `query.set()` from `query.refresh()`
  - Push a freshly computed value back from a command without a second round trip
  - Use `query.set()` to drive reactive UI updates from the server
  - Explain "single-flight mutation" in one paragraph
  - Recognise which pattern a real-time dashboard needs
status: ready
---

# Lesson 9B.8 — `query.set()` + `query.refresh()` — server-driven reactive state

## 1. Concept — The server decides what the client sees next

### 1.1 Two ways to invalidate

After a mutation, the client-side cache for any related query is stale. You have three ways to handle it.

1. **Do nothing.** The cache stays stale until a manual refresh or a navigation. Fine for unrelated queries.
2. **Refresh.** `await somequery().refresh()` — from the server, inside the command/form handler — forces a re-run of the query handler and ships the new data back on the *same* HTTP response as the mutation. One round trip, two jobs.
3. **Set.** `somequery(arg).set(value)` — also from the server — writes a value you already computed directly into the cache. No re-run, no extra work.

`refresh` and `set` are the two sides of **single-flight mutation**: your mutation and the query update travel together.

### 1.2 When to prefer `set`

If the mutation itself produces the new value — an "increment counter" that already knows the new count, an "update profile" that already has the new profile object — `set` is cheaper than `refresh`, because it skips running the query handler again.

```ts
// src/routes/modules/09b-remote/08-query-set/counter.remote.ts
import * as v from 'valibot';
import { query, command } from '$app/server';

let count = 0;

export const getCount = query(async (): Promise<number> => count);

export const increment = command(v.optional(v.number(), 1), async (delta) => {
    count += delta;
    // Push the new value directly into the cache — no handler re-run.
    getCount().set(count);
    return count;
});
```

### 1.3 When to prefer `refresh`

If the mutation's side effects propagate in a way the handler does not know about — a database trigger recomputed a summary, a webhook modified a related record, a background job adjusted totals — use `refresh`. The query handler re-reads from the source of truth.

```ts
export const buy = command(v.string(), async (itemId) => {
    await db.sql`INSERT INTO sale (item_id) VALUES (${itemId})`;
    // Inventory view depends on aggregate counts updated by a trigger.
    await listInventory().refresh();
});
```

### 1.4 `set` for server-driven push-style updates

Because `set` writes directly to the client's query cache, it is the foundation for *server-decides-what-the-client-sees* patterns. In a real-time dashboard, a command might tick a simulation forward by one second and `set` the new snapshot into every watching client's query. The client does not poll; it re-renders when the cache changes.

Real push delivery (SSE or WebSockets) is out of scope for this lesson — but the receiving side, the cache write, is exactly `set`.

### 1.5 `refresh` for the audience that was not in the conversation

`refresh` also has a useful property: it re-runs the server handler fresh, which means any other client that requests the same query gets the new value via its own natural cache. `set` only affects the *current* client.

## 2. Style it — A counter card that glows when it updates

Per-page brand is a bright cyan. The counter value briefly pulses when it changes — we trigger the animation by adding a class on mutation and removing it after the duration. The animation is suppressed under `prefers-reduced-motion`.

## 3. Interact — The difference, in the Network tab

Click the `+1` button twice. You see two requests (two commands). If you used `refresh`, you would see two commands *and* two query responses; with `set`, you see two commands whose responses already contain the updated query value. The number of network requests is the same, but the payloads are different — and in a dashboard with many queries, `set` lets you update only the one that changed.

## 4. Mini-build — Increment + reset counter with `set`

### File tree

```
src/routes/modules/09b-remote/08-query-set/
├── +page.svelte
└── counter.remote.ts
```

### DevTools moment

1. Click `+1`. Look at the response to the command in the Network tab. The body contains both the command result *and* the refreshed `getCount` value. Single-flight.
2. Click `reset`. Same — but the reset handler uses `refresh()` instead of `set()`, and the response still carries the new count. Observe that both paths work; `set` is the micro-optimisation.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between <code>query.refresh()</code> and <code>query.set()</code>?</summary>

`refresh` re-runs the query handler on the server and returns the new value. `set` writes a value you already have directly into the cache, skipping the handler entirely.
</details>

<details>
<summary><strong>Q2.</strong> Why is this called "single-flight mutation"?</summary>

Because the mutation and the query update travel on the same HTTP round trip. One flight, two deliveries.
</details>

<details>
<summary><strong>Q3.</strong> When is <code>set</code> the wrong choice?</summary>

When the mutation has side effects you cannot compute locally — database triggers, aggregate tables, external webhooks. Refresh runs the handler fresh against the source of truth; set would write a stale-but-looks-fresh value.
</details>

<details>
<summary><strong>Q4.</strong> Does <code>getCount().set(value)</code> on the server update every connected client?</summary>

No. It updates the cache for the current request's client. Other clients will see the update the next time they refresh or navigate — or when they receive a push (outside scope).
</details>

<details>
<summary><strong>Q5.</strong> Can you call <code>.set()</code> from the client side?</summary>

Yes — `.set()` on a client-side query reference overrides the cached value locally. It is commonly used with optimistic UI. Server-side `.set()` is the single-flight flavour.
</details>

## 6. Common mistakes

- **Setting stale data.** If the server hasn't finished the write when you call `.set(value)`, you might cache a value that is about to be overwritten. Call `set` after all writes are persisted.
- **Using `set` when you need `refresh`.** Cheaper is not always correct. If you are unsure whether the handler's output has changed in ways you did not compute, use `refresh`.
- **Calling `refresh` in a loop.** `await` each refresh; do not fire-and-forget in parallel if the queries depend on each other's side effects.
- **Forgetting that `set` only affects the current client.** For multi-client real-time sync, you need a push channel (SSE/WebSockets). `set` is the local write, not the broadcast.

## 7. What's next

Lesson 9B.9 enables `experimental.async` and writes queries inline in the markup using top-level `await` — the cleanest syntax you will ever see for fetch-driven UI.
