---
module: 9A
lesson: 9A.6
title: Parallel data loading — Promise.all and the waterfall
duration: 45 minutes
prerequisites:
  - Lesson 9A.4 — Enhanced fetch
learning_objectives:
  - Recognise a network waterfall and explain why it is slow
  - Use Promise.all to fetch three independent sources in parallel
  - Compare the total time of sequential vs parallel loads
  - Decide when sequential is actually required
  - Keep each branch of Promise.all typed
status: ready
---

# Lesson 9A.6 — Parallel data loading — `Promise.all` and the waterfall

## 1. Concept — Three fetches that are waiting on nothing, and still taking three times as long

### 1.1 The problem — the accidental waterfall

A dashboard page needs three things: the current user, the list of notifications, and the weekly stats. You write the load function honestly:

```ts
export const load: PageServerLoad = async ({ fetch }) => {
    const user = await fetch('/api/me').then((r) => r.json());
    const notifications = await fetch('/api/notifications').then((r) => r.json());
    const stats = await fetch('/api/stats').then((r) => r.json());
    return { user, notifications, stats };
};
```

This works. It also takes the sum of three request durations. If each call takes 200 ms, the total is 600 ms. The user's page flickers in the browser for two thirds of a second, and Core Web Vitals goes yellow.

Look at the code again. None of the three calls depend on any of the others. `notifications` does not need `user`; `stats` does not need `notifications`. They are three independent network requests, and you wrote them as if the second had to wait for the first to come back. That is a **network waterfall**: each request blocks the next, even though there is no data dependency between them. Browsers do not love waterfalls, servers do not love them, and users really do not love them.

### 1.2 The fix — `Promise.all`

JavaScript's `Promise.all` runs an array of promises at the same time and resolves once all of them have finished. You start all three fetches without awaiting, then await them together:

```ts
export const load: PageServerLoad = async ({ fetch }) => {
    const [user, notifications, stats] = await Promise.all([
        fetch('/api/me').then((r) => r.json()),
        fetch('/api/notifications').then((r) => r.json()),
        fetch('/api/stats').then((r) => r.json())
    ]);
    return { user, notifications, stats };
};
```

Now the total time is the duration of the **slowest** request, not the sum. If all three take 200 ms, the total is 200 ms — a 3× improvement.

### 1.3 When sequential is actually correct

Not every load can be parallelised. If step two needs data from step one — for example, you fetch a user, then use `user.id` to fetch their posts — those two calls are sequential by necessity. The waterfall is an anti-pattern only when the requests are independent. Always ask yourself: "does step B need anything from step A?". If yes, it is a dependency and must wait. If no, parallelise.

### 1.4 Typing parallel loads

`Promise.all` is well typed in TypeScript. Given an array of promises with known return types, TypeScript infers the tuple type of the resolved values:

```ts
const [user, notifications, stats] = await Promise.all([
    fetch('/api/me').then((r) => r.json() as Promise<User>),
    fetch('/api/notifications').then((r) => r.json() as Promise<Notification[]>),
    fetch('/api/stats').then((r) => r.json() as Promise<Stats>)
]);
```

Casting to a typed promise inside the chain gives each element of the tuple a known type. Now `user.name` is typed, and so on.

### 1.5 Mixing parallel and sequential

A common real-world shape: fetch the user in parallel with feature flags, then fetch the user's dashboard data once you know both. You can express this cleanly with nested `Promise.all`:

```ts
const [user, flags] = await Promise.all([fetchUser(), fetchFlags()]);
const dashboard = await fetchDashboard(user.id, flags);
```

Two layers: the parallel step runs first, the dependent step waits.

### 1.6 Error handling in parallel loads

`Promise.all` rejects as soon as *any* of its promises reject. If you want the others to complete even when one fails, use `Promise.allSettled` and inspect each result:

```ts
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()]);
```

For a strict dashboard where every piece is required, `Promise.all` with a caught error is right. For a best-effort layout (a sidebar with three widgets that may or may not show), `Promise.allSettled` is better.

### 1.7 What May 2026 changes

Nothing at the `Promise.all` level — it has been in JavaScript since ES2015. What has changed is that SvelteKit's streaming feature (Lesson 9A.9) lets you send the **fast** parts of a load to the browser immediately and stream the slow parts in later, which is an even better pattern for some dashboards. Streaming is complementary to parallelism, not a replacement for it.

### 1.8 Measuring the improvement in DevTools

The Network panel's waterfall column is your proof. Sequential fetches appear as stair-steps: each request starts only after the previous one finishes. Parallel fetches appear as a vertical stack: all requests start at the same horizontal position. The total duration is the height of the tallest bar, not the sum of all bars. Train yourself to look for stair-steps in the waterfall — every stair-step on independent data sources is a parallelization opportunity.

### 1.9 What SvelteKit does under the hood

SvelteKit itself performs parallelization at the layout/page level. When a user navigates to a route, SvelteKit identifies all the load functions in the route's layout chain. If none of them call `parent()`, SvelteKit runs them all in parallel automatically. This is "framework-level parallelism" — you do not need `Promise.all` for it.

`Promise.all` is what you use for **intra-load parallelism** — multiple independent fetches within a single load function. The two levels work together:

```
Framework-level parallelism (automatic):
  Root layout load ─────────┐
  Dashboard layout load ────┤── all start at the same time
  Analytics page load ──────┘

Intra-load parallelism (your Promise.all):
  Inside analytics page load:
    fetchMetrics() ──────────┐
    fetchAlerts() ───────────┤── all start at the same time
    fetchBudget() ───────────┘
```

Total time = max(root_load, dashboard_load, max(metrics, alerts, budget)). Without either level of parallelism, total time = sum of everything.

### 1.10 The TypeScript angle

`Promise.all` preserves tuple types, which is essential for load functions that return multiple typed values:

```ts
const [user, notifications, stats] = await Promise.all([
    fetchUser(userId),           // returns Promise<User>
    fetchNotifications(userId),  // returns Promise<Notification[]>
    fetchStats()                 // returns Promise<DashboardStats>
]);
// TypeScript knows:
// user: User
// notifications: Notification[]
// stats: DashboardStats
```

This works because `Promise.all` is overloaded in TypeScript's standard library to preserve up to 10 tuple positions. If you have more than 10 parallel fetches (unusual but possible), the type inference falls back to a union array. In that case, use explicit typing:

```ts
const results = await Promise.all(
    cities.map(c => fetchWeather(c.id))
) as Weather[];
```

For `Promise.allSettled`, each result is typed as `PromiseSettledResult<T>`, which is a discriminated union of `PromiseFulfilledResult<T>` and `PromiseRejectedResult`. You narrow with `result.status === 'fulfilled'`:

```ts
const results = await Promise.allSettled([fetchA(), fetchB()]);
for (const r of results) {
    if (r.status === 'fulfilled') {
        console.log(r.value); // typed as the resolved value
    } else {
        console.error(r.reason); // typed as any
    }
}
```

### 1.11 Common interview question

**Q: "You have a SvelteKit load function with five independent API calls. The page takes 2 seconds to load. How do you diagnose and fix this?"**

**Model answer:** Open the DevTools Network panel and look for a waterfall pattern — five sequential requests where each starts after the previous finishes. If each takes ~400ms, the total is 2 seconds. The fix is `Promise.all`: start all five fetches without awaiting, then await them together. The total drops to ~400ms (the slowest single request). If one of the five is much slower than the others and its data is below the fold, consider streaming it (Lesson 9A.9): return the slow fetch as a bare promise and render it with `{#await}`. The page paints the fast data immediately and the slow data streams in later. This combination of parallelism and streaming is the standard optimization for data-heavy dashboard pages.

## Deep Dive

**Why this matters at scale.** In a dashboard with 5 data widgets, sequential loading means the page takes the *sum* of all widget data fetches to render. If each takes 200ms, that is 1 second of load time. With `Promise.all`, it is 200ms — a 5x improvement. This directly affects LCP, which Google uses for search ranking. At scale (thousands of daily visitors), the compounding impact is enormous: every visitor gets a faster page, bounce rates drop, and the Lighthouse score goes from amber to green without any other optimization. Parallel loading is the highest-ROI performance fix available in most data-heavy applications.

**The mental model.** Sequential loading is like ordering from a restaurant one dish at a time — you order the appetizer, wait for it to arrive, then order the main course, wait for it, then order dessert. Parallel loading is like ordering everything at once — the kitchen prepares all three simultaneously and delivers them together when the slowest one is ready. The total wait is the slowest dish, not the sum of all dishes. You would never order sequentially at a restaurant; do not fetch sequentially in your load functions.

**Edge cases.** `Promise.all` rejects on the first rejection. If you have five parallel fetches and one fails, you lose all five results — even the four that succeeded. If partial data is acceptable (e.g., a widget that can show "unavailable"), use `Promise.allSettled` instead and handle each result individually. Another edge case: if parallel fetches share a common sub-dependency (both need a user session token), make sure the token is available before starting the parallel group, or both fetches will fail. Structure as: get token first (sequential), then parallel fetches with the token.

**Performance implications.** The time saved by parallelization equals `(sum of all durations) - (max of all durations)`. For three 200ms requests, you save 400ms. For five 100ms requests, you save 400ms. The savings scale linearly with the number of independent requests. There is no meaningful CPU overhead to `Promise.all` — it simply starts all promises without awaiting and collects their results. The only consideration: very many parallel requests (50+) might overwhelm the server or hit HTTP/2 connection limits. For typical load functions (2-8 parallel fetches), there is zero downside.

**Connection to other modules.** Parallel loading connects to Module 4 Lesson 4.7 (Promise fundamentals), Module 9A Lesson 9A.9 (streaming as a complementary technique), Module 12 Lesson 12.1 (LCP optimization — faster load = better LCP), and the module project (a dashboard with multiple data sources loaded in parallel). Module 9B's `query.batch()` is the remote-function equivalent: instead of parallelizing separate calls, you batch them into one. Both techniques fight the same enemy: network waterfalls.

## 2. Style it — PE7 for a three-city forecast

The mini-build fetches weather for three European cities in parallel from Open-Meteo and displays them as three cards. We use a cool blue brand (`oklch(70% 0.16 210)`) and a mobile-first grid that becomes three columns at 480px.

## 3. Interact — `Promise.all` over three public API calls

```ts
const cities = [
    { name: 'Berlin', lat: 52.52, lon: 13.41 },
    { name: 'Lisbon', lat: 38.72, lon: -9.14 },
    { name: 'Reykjavík', lat: 64.14, lon: -21.94 }
];

const results = await Promise.all(
    cities.map((c) =>
        fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m`
        ).then((r) => r.json() as Promise<Forecast>)
    )
);
```

Each `fetch` starts immediately; `Promise.all` waits for the slowest to finish. Total time ≈ slowest city, not sum of all cities.

## 4. Mini-build — three cities in parallel

**Paths:**

- `src/routes/modules/09a-load/06-parallel-loading/+page.svelte`
- `src/routes/modules/09a-load/06-parallel-loading/+page.ts`

Open the page. You see three cards side by side with live temperatures. Open DevTools → Network and reload — the three requests to `api.open-meteo.com` fire simultaneously (their start times line up vertically in the waterfall column).

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is a "network waterfall" and why is it slow?</summary>

A waterfall is a chain of network requests where each one waits for the previous to finish before starting, even though no data flows between them. It is slow because the total time equals the sum of all request durations, instead of the duration of the slowest one.
</details>

<details>
<summary><strong>Q2.</strong> When should you use <code>Promise.all</code> in a load function?</summary>

Whenever you need to fetch two or more pieces of data that do not depend on each other. Starting the promises at once lets them run in parallel, and `await Promise.all(...)` gives you all the results when the slowest finishes.
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between <code>Promise.all</code> and <code>Promise.allSettled</code>?</summary>

`Promise.all` rejects as soon as any promise rejects, losing the results of the others. `Promise.allSettled` always resolves with an array of success/failure objects, so you can render partial data when one of the sources fails.
</details>

<details>
<summary><strong>Q4.</strong> You need a user object, and then the user's posts. Can you use <code>Promise.all</code>?</summary>

Not for the two calls together — the second depends on the first. You can still parallelise other independent calls alongside the user fetch: `[user, flags] = await Promise.all([...])` first, then `posts = await fetchPosts(user.id)`.
</details>

<details>
<summary><strong>Q5.</strong> How is <code>Promise.all</code> typed when each branch returns a different shape?</summary>

TypeScript infers a tuple type from the positions of the promises. If branch 0 returns `User` and branch 1 returns `Notification[]`, the resolved array is typed as `[User, Notification[]]`. Destructuring gives you each variable with the correct type.
</details>

## 6. Common mistakes

- **Writing `await` in front of each fetch individually.** That is the waterfall. Collect the promises first, then await them together.
- **Assuming `Promise.all` is slower because "it runs them at once".** It does run them at once, which is the entire point — the network can handle many in-flight requests in parallel.
- **Forgetting to type the branches.** Without per-branch typing, the resolved tuple is `any[]`, and you lose every benefit of TypeScript downstream.
- **Using `Promise.all` when one branch depends on another.** That is a logic bug. Keep dependent calls sequential; only parallelise independent ones.

## 7. What's next

Lesson 9A.7 introduces `depends()` and `invalidate()` — fine-grained cache control for re-running only the load functions that depend on changed data.
