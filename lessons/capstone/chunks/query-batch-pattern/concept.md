---
chunk: query-batch-pattern
level: 2
penalty: medium
---

# query.batch() Pattern — Level 2 Concept Reveal

`query.batch()` is a helper from `$app/server` that collects multiple `query` invocations and sends them to the server as a single request. It is the April 2026 successor to ad-hoc request deduplication.

The key insight: **batching is opt-in at the call site, not at the declaration**. Your individual `query` functions stay unchanged. You decide *at the point of use* whether a particular call should participate in a batch.

### Pseudocode

```
// src/lib/server/dashboard.remote.ts
import { query } from '$app/server';

export const getMetrics = query(async () => { … });
export const getRecentActivity = query(async () => { … });
export const getCurrentUser = query(async () => { … });
```

```
// dashboard/+page.svelte
import { batch } from '$app/server';
import { getMetrics, getRecentActivity, getCurrentUser } from '$lib/server/dashboard.remote';

const [metrics, activity, user] = batch(() => [
    getMetrics(),
    getRecentActivity(),
    getCurrentUser()
]);

// metrics.current is Metric[]
// activity.current is ActivityItem[]
// user.current is User
```

(Exact import names depend on the SvelteKit version's current naming. The pattern holds.)

### What happens on the wire

Without batching: three `POST /_app/remote/...` requests, each with its own TCP round trip.
With batching: one `POST /_app/remote/batch` request containing all three query descriptors, returning a single JSON payload with all three results keyed.

### Trade-offs

- **Latency** — batching always wins on round-trip-limited networks (mobile).
- **Cacheability** — individual queries cache by their own key; batches still respect that cache, they just coalesce misses.
- **Error isolation** — a batched request still reports errors per-query, not per-batch.

### Connecting it to the capstone

The dashboard is where the batching pattern first earns its keep. As the capstone grows — notifications, feature flags, recent users, pending approvals — each new widget drops into the same batch. One request, N widgets.
