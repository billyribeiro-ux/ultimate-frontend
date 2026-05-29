---
chunk: remote-query-setup
title: Remote Query Setup
module: 9B
---

# Remote Query Setup — Brief

Replace the plain `load()` dashboard with a **Remote Function** `query` so the metrics stay live across the client without a full page reload.

## What to build

- Create `src/lib/server/metrics.remote.ts` (or similar) exporting a `query` function named `getMetrics()` that returns `Metric[]`.
- Call `await getMetrics()` inside the dashboard page using the May 2026 async SSR pattern.
- Ensure SSR still ships the rendered list in the first byte.
- Provide a manual refresh button in the dashboard that re-invokes the query without a full navigation.

## Acceptance criteria

- The dashboard renders server-side with the metric list in View Source.
- Clicking Refresh triggers a client-side re-fetch without navigating away.
- The `Metric` type from the previous chunk is reused unchanged.
- No `load()` function remains on the dashboard route.

## How it connects to the capstone

`query` replaces `load()` as the data source for every reactive view in the capstone. `query-batch-pattern` extends this with batching, and `optimistic-ui-pattern` writes to it optimistically.
