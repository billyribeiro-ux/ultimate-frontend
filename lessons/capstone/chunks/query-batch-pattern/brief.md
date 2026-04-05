---
chunk: query-batch-pattern
title: query.batch() Pattern
module: 9B
---

# query.batch() Pattern — Brief

The dashboard displays a metric grid **and** a list of recent activity **and** the current user's profile. Without batching, that is three separate server round trips. With `query.batch()`, it is one.

## What to build

- Add two more queries alongside `getMetrics()`:
  - `getRecentActivity()` returns `ActivityItem[]`.
  - `getCurrentUser()` returns `User`.
- Use `query.batch()` on the client to group the three into a single request.
- Render all three sections in the dashboard — metric grid, activity feed, user chip — each reading from its own handle.

## Acceptance criteria

- DevTools Network panel shows exactly one request to `/_app/remote/...` on page load, not three.
- All three sections render with real data from the first byte during SSR.
- Each query retains its own typed return.

## How it connects to the capstone

Batching is the pragmatic production answer to waterfall requests. Once this chunk ships, every new dashboard widget drops into the existing batch. `optimistic-ui-pattern` mutates individual queries inside the batched set.
