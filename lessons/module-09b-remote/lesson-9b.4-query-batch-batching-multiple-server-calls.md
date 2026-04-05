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

### 1.5 Batching with dashboards

The Module 9B project is a live dashboard. It demonstrates `query.batch` for per-widget data reads — temperature per city, price per stock, latency per region — all resolved in one round trip. The dashboard's responsiveness doubles when batching is on, and the Network tab shows it: one request instead of ten.

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
