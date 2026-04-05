---
chunk: remote-query-setup
level: 2
penalty: medium
---

# Remote Query Setup — Level 2 Concept Reveal

**Remote Functions** are SvelteKit's April 2026 answer to "I want a typed, end-to-end-safe RPC call I can import directly into my component." A `.remote.ts` file exports one or more of four function kinds:

- `query` — read, cacheable, re-invocable
- `command` — write, not cached
- `form` — form handler bound to `<form method="POST">`
- `prerender` — read, evaluated at build time

For a live dashboard you want `query`. It returns a reactive handle whose value flows into SSR HTML on the first request and updates on demand when you call the returned object's methods.

### Pseudocode

```
// src/lib/server/metrics.remote.ts
import { query } from '$app/server';
import type { Metric } from '$lib/types/metric';

export const getMetrics = query(async (): Promise<Metric[]> => {
    // runs on the server
    return fetchMetrics();
});
```

```
// dashboard/+page.svelte
import { getMetrics } from '$lib/server/metrics.remote';
const metrics = getMetrics();
// During SSR, metrics.current is the resolved value.
// On the client, metrics.refresh() re-invokes the server.
```

### Why not just load()?

`load()` runs once per navigation. To re-fetch without navigating you had to call `invalidate()`, which is verbose and does not return the result. `query` returns a handle that has a `.current` accessor and a `.refresh()` method — both typed, both reactive.

### Connecting it to the capstone

Once the dashboard uses `query`, `query-batch-pattern` groups several queries into one round trip, and `optimistic-ui-pattern` uses the `command` cousin to mutate then rollback. The shared `Metric` type flows through all three. Keep the server function dead simple; extensions happen on the component side.
