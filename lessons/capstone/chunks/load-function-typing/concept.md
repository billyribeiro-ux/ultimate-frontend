---
chunk: load-function-typing
level: 2
penalty: medium
---

# Typed load() Functions — Level 2 Concept Reveal

SvelteKit synthesises a `./$types` module next to every route file. Two interfaces matter most:

- **`PageServerLoad`** / **`PageLoad`** — the function signature for the load. Annotating your load with this forces correct parameters and a correctly typed return.
- **`PageData`** — the shape the load returned, as seen by the component. Using it to annotate `$props()` closes the loop.

### Pseudocode

```
// $lib/types/metric.ts
interface Metric { id: string; label: string; value: number; delta: number }

// dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import type { Metric } from '$lib/types/metric';
export const load: PageServerLoad = async () => {
    const metrics: Metric[] = await fetchMetrics();
    return { metrics };
};

// dashboard/+page.svelte
import type { PageData } from './$types';
const { data }: { data: PageData } = $props();
// data.metrics is Metric[]
```

### Three guarantees

1. **No drift.** Adding a field to `Metric` makes the component aware automatically.
2. **No accidental `any`.** Missing annotations fall back to `unknown` and TypeScript complains loudly.
3. **Refactor-safe.** Rename a field and the refactor updates server, type, and component in one go.

### Connecting it to the capstone

`remote-query-setup` swaps `load()` for `query`, keeping the `Metric` type unchanged. `tanstack-table-setup` reads the same type for column definitions. `optimistic-ui-pattern` mutates the same arrays. One type, four chunks, zero drift.
