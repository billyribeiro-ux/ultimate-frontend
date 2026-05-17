---
module: 9B
lesson: 9B.4
title: query.batch — batching multiple server calls
duration: 55 minutes
prerequisites:
  - Lesson 9B.3 — parameterized queries
learning_objectives:
  - Identify an N+1 request pattern in a Svelte component
  - Rewrite it using `query.batch()` with a Valibot schema
  - Explain the "gather inputs, return resolver" shape of a batch handler
  - Measure the number of network requests in DevTools before and after
  - Decide when batching is worth the extra complexity
status: ready
---

# Lesson 9B.4 — `query.batch()` — batching multiple server calls

## 1. Concept — One request for many answers

### 1.1 The N+1 problem, in Svelte shape

Imagine a dashboard that renders a list of ten cities, and for each city fetches the current weather. If you use a parameterized query inside an `{#each}`, the browser fires ten simultaneous HTTP requests. Each one runs a handler, each one hits the database, each one returns a tiny payload. This is the classic N+1 problem: one request to fetch the list, N requests to fetch the details.

N+1 is the single biggest source of slow dashboards on the internet. It is invisible in development (your localhost is fast) and catastrophic in production (ten requests over a spotty 4G connection is ten chances to fail).

### 1.2 The solution: `query.batch()`

`query.batch()` changes the shape of the handler. Instead of running once per call, it runs once per *macrotask* with **all** the arguments that were requested simultaneously. Your handler is given an array of inputs and must return a **resolver function** that maps an input back to its output.

```ts
// src/routes/modules/09b-remote/04-query-batch/weather.remote.ts
import * as v from 'valibot';
import { query } from '$app/server';

export interface Weather {
    readonly cityId: string;
    readonly tempC: number;
    readonly condition: string;
}

const db: Record<string, Weather> = {
    lon: { cityId: 'lon', tempC: 11, condition: 'rain' },
    nyc: { cityId: 'nyc', tempC: 4, condition: 'snow' },
    tyo: { cityId: 'tyo', tempC: 18, condition: 'sun' },
    syd: { cityId: 'syd', tempC: 25, condition: 'sun' }
};

export const getWeather = query.batch(v.string(), async (cityIds) => {
    // cityIds is an array of EVERY id requested in this macrotask.
    // One database call, many answers.
    const lookup = new Map<string, Weather>();
    for (const id of cityIds) {
        const row = db[id];
        if (row) lookup.set(id, row);
    }

    // Return a function that SvelteKit calls once per input to produce
    // the per-call result.
    return (cityId, _index) => lookup.get(cityId) ?? {
        cityId,
        tempC: NaN,
        condition: 'unknown'
    };
});
```

The trick is in the return type. A batch handler returns `(input, index) => output`, not a plain value. SvelteKit calls your resolver once per input and uses the result as the answer for that specific `getWeather(id)` call. From the component's point of view it still looks like a normal query — `await getWeather('lon')` still returns a `Weather`. From the network's point of view it is **one** request with an array of ids.

### 1.3 How batching happens

SvelteKit queues every `getWeather(x)` call on the current **macrotask**. Rendering a `{#each}` block of ten items fires ten calls in the same tick. When the tick ends, SvelteKit bundles them into a single fetch, sends them together, and resolves all ten promises when the response comes back. Batching is invisible; you write `await getWeather(city.id)` inside the loop exactly as if it were a parameterized query.

### 1.4 When NOT to batch

Batching adds server-side complexity: you have to build a lookup map, handle missing entries, and reason about the worst case (what if someone calls `getWeather('nonsense')`?). For queries that are genuinely called *once* per page, or for queries whose argument lookup is cheap individually (in-memory `Map.get`), a regular `query()` is simpler. Reach for `query.batch` when:

- A component renders a list of sibling queries that share a data source.
- The underlying lookup (SQL, external API, key-value store) supports `WHERE id IN (...)` or an equivalent bulk form.
- You can measure a real N+1 waterfall in DevTools.

### 1.5 How the resolver pattern works internally

The resolver function is called synchronously by SvelteKit after the batch handler returns. For each original `getWeather(id)` call that was queued, SvelteKit calls `resolver(id, index)` and uses the return value to resolve that specific call's Promise. This means:

- The resolver is called N times (once per queued call).
- Each call gets the *exact* input that was passed to the original `getWeather(id)`.
- The `index` tells you the position of this call in the batch (useful for position-dependent logic, rare).
- The return type must match the declared return type of the query.

The pattern separates "fetch all data at once" (the handler body) from "route data to individual callers" (the resolver). This two-phase design lets you write a single efficient query (e.g., `SELECT * FROM weather WHERE city_id IN (...)`) and then map results back to individual callers cleanly.

### 1.6 Batching with dashboards

The Module 9B project is a live dashboard. It demonstrates `query.batch` for per-widget data reads — temperature per city, price per stock, latency per region — all resolved in one round trip. The dashboard's responsiveness doubles when batching is on, and the Network tab shows it: one request instead of ten.

## Deep Dive

**Why this matters at scale.** The N+1 problem is the single biggest source of slow API-backed UIs in production. A list of 50 items with a per-item detail query fires 51 requests. On a typical production server (50ms per request), that is 2.5 seconds of serial waiting if not parallelized, or 50 simultaneous connections if parallelized — both are unacceptable. `query.batch()` collapses this to 2 requests (one for the list, one batched for all details). The performance improvement is dramatic and the server load drops by 96%. For any page that renders a list where each item needs additional data, batching should be the default pattern, not an optimization applied later.

**The mental model.** Think of batch queries as a shopping list. Without batching, you send a person to the store 10 times, once for each item. Each trip takes time and costs energy. With batching, you write all 10 items on one list, the person makes one trip, and brings back everything at once. The resolver is the person unpacking the shopping bag — "this milk goes to widget A, these eggs go to widget B, this bread goes to widget C." The store (your database) prefers bulk orders too — a single `WHERE id IN (1,2,3,4,5)` query is faster than five individual `WHERE id = N` queries because the database can plan and execute a single scan.

**Edge cases.** What if a batched call happens on a different macrotask than its siblings? SvelteKit batches per-macrotask. If component A renders synchronously with 5 queries and component B renders on the next tick with 3 queries, you get two batched requests (one with 5, one with 3), not one with 8. In practice, Svelte renders an `{#each}` block synchronously, so all iterations within a single each block are guaranteed to batch together. But if queries are scattered across `$effect` blocks that run on different ticks, they may not batch. Structure your queries to fire during the same render pass for optimal batching.

**Performance implications.** A single batched request with 50 inputs is almost always faster than 50 individual requests, even if the server processes them identically. The savings come from: (1) one TCP connection setup instead of 50, (2) one HTTP overhead instead of 50, (3) one database query plan instead of 50. On the server side, the batch handler can use a single `IN (...)` query or a single Redis `MGET` — operations that are O(n) but with much lower constant factors than n individual lookups. The only case where batching hurts is if the batch makes the single request so large that it exceeds size limits or times out — extremely rare for typical per-item queries.

**Connection to other modules.** Batching connects to Module 4 Lesson 4.7 (Promises — each batched call returns a Promise), Module 9A Lesson 9A.6 (parallel loading — `Promise.all` is the load-function equivalent of batching), Module 11 (state management — batched queries integrate with reactive stores), and Module 12 (performance — reducing network requests directly improves LCP and TTFB). The capstone's dashboard uses `query.batch()` for its per-widget data loads, demonstrating the pattern at production scale.

## 2. Style it — Grid of city cards

A responsive grid of cards. Per-page brand is a sunrise orange. Cards tint their border-inline-start by the city's temperature range using `color-mix`. The grid uses `auto-fit` with a `minmax(14rem, 1fr)` to adapt from mobile (one column) to desktop (as many as fit).

## 3. Interact — Count the requests

Run the mini-build with a `query()` (not `query.batch()`) first and count the network requests in DevTools. Then switch to `query.batch()` and count again. This before/after is the entire lesson: you should see the request count collapse from N+1 down to 2 (one for the city list, one batched call for all weathers).

## 4. Mini-build — Weather for many cities

### File tree

```
src/routes/modules/09b-remote/04-query-batch/
├── +page.svelte       (renders a grid of WeatherCard)
└── weather.remote.ts  (listCities + getWeather batch)
```

### DevTools moment

1. Open Network → Fetch/XHR.
2. Reload. You see *one* request to `getWeather` and *one* request to `listCities`. Click into the `getWeather` request: its body is an array of every city id, and its response is an array of every answer.
3. Change `query.batch(...)` back to `query(...)` temporarily. Reload. You now see one request per card. That is the N+1 problem made visible.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does the "N" in N+1 stand for?</summary>

N is the number of items in the parent list. The "+1" is the request that fetches the list itself. A list of 20 items with a per-item detail call produces 21 HTTP requests.
</details>

<details>
<summary><strong>Q2.</strong> What must a <code>query.batch</code> handler return?</summary>

A function of the form `(input, index) => output`. SvelteKit calls this function once per input to resolve each individual call.
</details>

<details>
<summary><strong>Q3.</strong> When does SvelteKit actually send the batched request?</summary>

At the end of the macrotask during which the calls were made. All calls queued in the same tick are collapsed into a single fetch.
</details>

<details>
<summary><strong>Q4.</strong> Why might you choose plain <code>query()</code> over <code>query.batch()</code>?</summary>

Because batching adds complexity. If a query is only called once per page, or the data source does not support bulk reads, the extra machinery costs more than it saves.
</details>

<details>
<summary><strong>Q5.</strong> How do you handle a missing entry in a batch handler?</summary>

The resolver function must return *something* for every input. You typically return a sentinel (`null`, an error object, or a "not found" value) so the per-call promise can resolve and the component can render a fallback.
</details>

## 6. Common mistakes

- **Returning a value directly from the batch handler.** A batch handler returns a resolver *function*, not the data. Returning data directly makes every call resolve to the same value and is a TypeScript error once you notice.
- **Calling a batched query once per page with no siblings.** There is nothing to batch. Use `query()`.
- **Forgetting to handle missing entries in the lookup.** A user can request any id, even one that does not exist. Your resolver must return a safe fallback for unknown inputs.
- **Assuming batching happens across components.** It happens across calls in the same macrotask. If a second component's query fires a tick later, it is a second request.

## 7. What's next

Lesson 9B.5 pivots to mutations: `form` remote functions, Valibot schemas for field validation, and the preflight pattern.
