---
chunk: remote-query-setup
level: 3
penalty: high
---

# Remote Query Setup — Level 3 Code Reveal

**`src/lib/server/metrics.remote.ts`**

```ts
import { query } from '$app/server';
import type { Metric } from '$lib/types/metric';

export const getMetrics = query(async (): Promise<Metric[]> => {
	return [
		{ id: 'revenue', label: 'Monthly revenue', value: 42_800, delta: 0.12 },
		{ id: 'users', label: 'Active users', value: 1_204, delta: 0.06 },
		{ id: 'churn', label: 'Churn rate', value: 0.028, delta: -0.004 }
	];
});
```

**`src/routes/dashboard/+page.svelte`**

```svelte
<script lang="ts">
	import { getMetrics } from '$lib/server/metrics.remote';

	const metrics = getMetrics();
</script>

<section class="page stack">
	<h1>Dashboard</h1>
	<button type="button" class="btn" onclick={() => metrics.refresh()}>Refresh</button>

	{#if metrics.current}
		<ul class="metrics">
			{#each metrics.current as metric (metric.id)}
				<li class="metric">
					<p class="metric__label">{metric.label}</p>
					<p class="metric__value">{metric.value.toLocaleString()}</p>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.btn { min-block-size: 44px; padding-inline: var(--space-md); background: var(--color-brand); color: oklch(98% 0.01 0); border-radius: var(--radius-md); }
	.metrics { list-style: none; padding: 0; display: grid; gap: var(--space-md); grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
	.metric { padding: var(--space-md); background: var(--color-surface-2); border-radius: var(--radius-md); }
	.metric__label { font-size: var(--text-sm); color: var(--color-text-muted); margin: 0; }
	.metric__value { font-size: var(--text-xl); font-weight: 700; margin: 0; }
</style>
```

**Note:** Remove the previous `dashboard/+page.server.ts` now — the query replaces it.
