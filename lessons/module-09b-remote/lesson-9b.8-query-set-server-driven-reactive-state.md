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

### 1.6 What SvelteKit does under the hood — single-flight mutation mechanics

The "single-flight" concept is the key architectural insight of remote functions. Here is the internal protocol:

**When a command calls `getCount().set(count)` on the server:**

1. The command handler finishes executing and returns its result.
2. SvelteKit's runtime inspects the handler's execution context for any `.set()` or `.refresh()` calls that were made during execution.
3. For `.set()` calls, the value is serialised with `devalue` and attached to the response alongside the command result. The response body is structured roughly as: `{ commandResult: ..., queryUpdates: [{ queryId: 'getCount', args: [], value: 42 }] }`.
4. The client receives the response. It processes the command result (resolving the command's promise) and the query updates (writing each value into the corresponding query cache).
5. Every component rendering `getCount()` re-renders with the new value.

**When a command calls `listInventory().refresh()` on the server:**

1. SvelteKit calls the `listInventory` query handler on the server (in-process, no HTTP).
2. The handler runs against the current server state (which includes the mutation just performed by the command).
3. The fresh result is attached to the response, same as with `.set()`.
4. The client updates the cache with the server-provided value.

The difference: `.set()` writes a value you already computed (skips the query handler). `.refresh()` runs the query handler fresh (uses the query's own logic to recompute). Both ride on the same HTTP response as the command.

### 1.7 The TypeScript angle

The typing of `.set()` and `.refresh()` is precise:

```ts
// getCount returns QueryResult<number>
// .set() requires a number argument
getCount().set(42);      // OK
getCount().set('42');     // TypeScript error: string is not number

// For a typed query like getPost(id):
getPost('welcome').set({ id: 'welcome', title: 'Updated', body: '...' }); // Must match Post type
getPost('welcome').set({ id: 'welcome' }); // TypeScript error: missing title, body
```

`.refresh()` takes no arguments and returns `Promise<void>`. It triggers the query handler and updates the cache:

```ts
await listNotes().refresh(); // OK — re-runs the listNotes handler
await getPost('welcome').refresh(); // OK — re-runs getPost with arg 'welcome'
```

### 1.8 Comparison: cache update strategies

| Strategy | Server work | Client sees update | Network cost | Use when |
| --- | --- | --- | --- | --- |
| `query().set(value)` from server | None (skips handler) | Immediate (on response) | 0 extra requests | Handler already knows the new value |
| `query().refresh()` from server | Re-runs query handler | Immediate (on response) | 0 extra requests | Server state has side effects you cannot predict |
| `query().set(value)` from client | None | Immediate (local only) | 0 requests | Optimistic UI |
| `invalidate(key)` | Re-runs loads matching key | After round trip | 1 request | Classic load function cache |
| `invalidateAll()` | Re-runs all loads | After round trip | 1 request | Unknown side effects |
| Manual re-fetch | Depends | After round trip | 1 request | Legacy pattern |

> **In production sidebar.** We built a real-time bid tracker where each bid updates a price display. Initially we used `.refresh()` after every bid command. This was correct but ran a complex aggregation query on every bid — unnecessary because the command already knew the new price. Switching to `.set()` eliminated the aggregation entirely. The server response time dropped from 85ms to 12ms per bid. For a feature where bids arrive every few seconds, the cumulative savings are significant. The rule: if you can compute the new value from the mutation itself, use `.set()`. If the new value depends on database-level logic (triggers, computed columns, joins), use `.refresh()`.

### 1.9 Common interview question

**Q: "Explain the difference between `query.set()` and `query.refresh()` in SvelteKit remote functions. When would you use each?"**

**Model answer:** Both update the client-side query cache from within a server-side command handler. `query.set(value)` writes a value you already have directly into the cache — no query handler re-execution. Use it when the command itself produces the new value (incrementing a counter, updating a profile). `query.refresh()` re-runs the query's handler function on the server and ships the fresh result back to the client. Use it when the mutation has side effects you cannot predict — database triggers updating aggregate tables, background jobs modifying related records. Both methods ride on the same HTTP response as the command (single-flight), so neither adds an extra network round trip. The choice is about whether you trust your own computation or need the query to re-derive from the source of truth.

## Deep Dive

**Client-side `.set()` for optimistic UI.** `.set()` is not limited to server-side use. On the client, `getCount().set(42)` overwrites the local cache immediately. This is useful for optimistic UI patterns where you predict the server's response:

```svelte
<button onclick={async () => {
    getCount().set(count + 1);  // Optimistic: update UI now
    await increment(1);         // Server: do the real work
    // If server disagrees, the command response reconciles
}}>+1</button>
```

This is a simpler alternative to `.withOverride()` when you have a direct value to set rather than a transformation function.

**Multi-query updates in one command.** A single command can update multiple queries:

```ts
export const transferFunds = command(schema, async ({ from, to, amount }) => {
    await db.sql`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${from}`;
    await db.sql`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${to}`;
    
    // Update both account queries in one response
    await getAccount(from).refresh();
    await getAccount(to).refresh();
    await getTransactionHistory(from).refresh();
    await getTransactionHistory(to).refresh();
    
    return { success: true };
});
```

All four query updates ride on one HTTP response. The client updates four cache entries simultaneously.

## Going Deeper

- **SvelteKit docs:** [Remote functions — query](https://svelte.dev/docs/kit/remote-functions#query) covers `.set()` and `.refresh()`.
- **Advanced pattern:** Create a "broadcast" utility that refreshes all queries matching a pattern: `refreshAll('inventory')` triggers `.refresh()` on every inventory-related query. This is the remote function equivalent of `invalidate('app:inventory')`.
- **Challenge:** Create a counter with both `.set()` and `.refresh()` paths. Add an artificial 500ms delay to the query handler. Toggle between `.set()` and `.refresh()` and measure the response time difference. The `.set()` path should be ~500ms faster because it skips the handler.

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
