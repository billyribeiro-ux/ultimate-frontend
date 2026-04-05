---
chunk: query-batch-pattern
level: 3
penalty: high
---

# query.batch() Pattern — Level 3 Code Reveal

**`src/lib/types/dashboard.ts`**

```ts
import type { Metric } from './metric';

export type { Metric };

export interface ActivityItem {
	id: string;
	kind: 'signup' | 'payment' | 'churn';
	at: string;
	actor: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
}
```

**`src/lib/server/dashboard.remote.ts`**

```ts
import { query } from '$app/server';
import type { Metric, ActivityItem, User } from '$lib/types/dashboard';

export const getMetrics = query(async (): Promise<Metric[]> => {
	return [
		{ id: 'revenue', label: 'Monthly revenue', value: 42_800, delta: 0.12 },
		{ id: 'users', label: 'Active users', value: 1_204, delta: 0.06 },
		{ id: 'churn', label: 'Churn rate', value: 0.028, delta: -0.004 }
	];
});

export const getRecentActivity = query(async (): Promise<ActivityItem[]> => {
	return [
		{ id: 'a1', kind: 'signup', at: '2026-04-05T10:00:00Z', actor: 'jane@example.com' },
		{ id: 'a2', kind: 'payment', at: '2026-04-05T09:44:00Z', actor: 'acme-corp' }
	];
});

export const getCurrentUser = query(async (): Promise<User> => {
	return { id: 'u1', name: 'Ada Lovelace', email: 'ada@pe7.dev' };
});
```

**`src/routes/dashboard/+page.svelte`**

```svelte
<script lang="ts">
	import { batch } from '$app/server';
	import {
		getMetrics,
		getRecentActivity,
		getCurrentUser
	} from '$lib/server/dashboard.remote';

	const [metrics, activity, user] = batch(() => [
		getMetrics(),
		getRecentActivity(),
		getCurrentUser()
	]);
</script>

<section class="page stack">
	<header class="head">
		<h1>Dashboard</h1>
		{#if user.current}
			<p class="user-chip">{user.current.name}</p>
		{/if}
	</header>

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

	{#if activity.current}
		<ol class="activity">
			{#each activity.current as item (item.id)}
				<li>{item.kind} — {item.actor}</li>
			{/each}
		</ol>
	{/if}
</section>

<style>
	.head { display: flex; justify-content: space-between; align-items: center; }
	.user-chip { padding: var(--space-xs) var(--space-sm); background: var(--color-surface-2); border-radius: var(--radius-full); }
	.metrics { list-style: none; padding: 0; display: grid; gap: var(--space-md); grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
	.metric { padding: var(--space-md); background: var(--color-surface-2); border-radius: var(--radius-md); }
	.metric__label { font-size: var(--text-sm); color: var(--color-text-muted); margin: 0; }
	.metric__value { font-size: var(--text-xl); font-weight: 700; margin: 0; }
	.activity { list-style: decimal inside; padding: 0; }
</style>
```
