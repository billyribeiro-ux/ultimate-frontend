---
chunk: load-function-typing
level: 3
penalty: high
---

# Typed load() Functions — Level 3 Code Reveal

**`src/lib/types/metric.ts`**

```ts
export interface Metric {
	id: string;
	label: string;
	value: number;
	delta: number;
}
```

**`src/routes/dashboard/+page.server.ts`**

```ts
import type { PageServerLoad } from './$types';
import type { Metric } from '$lib/types/metric';

export const load: PageServerLoad = () => {
	const metrics: Metric[] = [
		{ id: 'revenue', label: 'Monthly revenue', value: 42_800, delta: 0.12 },
		{ id: 'users', label: 'Active users', value: 1_204, delta: 0.06 },
		{ id: 'churn', label: 'Churn rate', value: 0.028, delta: -0.004 }
	];
	return { metrics };
};
```

**`src/routes/dashboard/+page.svelte`**

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	const { data }: { data: PageData } = $props();
</script>

<section class="page stack">
	<h1>Dashboard</h1>
	<ul class="metrics">
		{#each data.metrics as metric (metric.id)}
			<li class="metric">
				<p class="metric__label">{metric.label}</p>
				<p class="metric__value">{metric.value.toLocaleString()}</p>
				<p class="metric__delta" class:down={metric.delta < 0}>
					{(metric.delta * 100).toFixed(1)}%
				</p>
			</li>
		{/each}
	</ul>
</section>

<style>
	.metrics { list-style: none; padding: 0; display: grid; gap: var(--space-md); grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
	.metric { padding: var(--space-md); background: var(--color-surface-2); border-radius: var(--radius-md); }
	.metric__label { font-size: var(--text-sm); color: var(--color-text-muted); margin: 0; }
	.metric__value { font-size: var(--text-xl); font-weight: 700; margin: 0; }
	.metric__delta { color: var(--color-success); margin: 0; }
	.metric__delta.down { color: var(--color-error); }
</style>
```
