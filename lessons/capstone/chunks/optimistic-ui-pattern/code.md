---
chunk: optimistic-ui-pattern
level: 3
penalty: high
---

# Optimistic UI Pattern — Level 3 Code Reveal

**`src/lib/stores/dashboard.svelte.ts`** (optimistic helper addition)

```ts
import { untrack } from 'svelte';

interface OptimisticOptions<T> {
	getCurrent: () => T;
	setCurrent: (val: T) => void;
	applyMutation: () => void;
	serverCall: () => Promise<void>;
}

const inflight = new Set<string>();

export async function optimisticUpdate<T>(
	id: string,
	options: OptimisticOptions<T>
): Promise<{ success: boolean; error?: string }> {
	if (inflight.has(id)) {
		return { success: false, error: 'Already in-flight' };
	}

	inflight.add(id);
	const snapshot = $state.snapshot(options.getCurrent()) as T;
	options.applyMutation();

	try {
		await options.serverCall();
		return { success: true };
	} catch (err) {
		options.setCurrent(snapshot);
		const message = err instanceof Error ? err.message : 'Update failed';
		return { success: false, error: message };
	} finally {
		inflight.delete(id);
	}
}
```

**`src/lib/components/Toast.svelte`**

```svelte
<script lang="ts">
	let { message, onDismiss }: { message: string; onDismiss: () => void } = $props();

	$effect(() => {
		const timer = setTimeout(onDismiss, 5000);
		return () => clearTimeout(timer);
	});
</script>

<div class="toast" role="alert">
	<p>{message}</p>
	<button onclick={onDismiss} aria-label="Dismiss notification">
		<span aria-hidden="true">&times;</span>
	</button>
</div>

<style>
	.toast {
		position: fixed;
		inset-block-end: var(--space-lg);
		inset-inline-end: var(--space-lg);
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid oklch(65% 0.2 25);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		color: var(--color-text);
		z-index: 1000;
	}

	button {
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		cursor: pointer;
		min-block-size: 44px;
		min-inline-size: 44px;
		display: grid;
		place-items: center;
	}
</style>
```

**`src/routes/dashboard/+page.svelte`** (relevant toggle excerpt)

```svelte
<script lang="ts">
	import { optimisticUpdate } from '$lib/stores/dashboard.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { toggleRowStatus } from '$lib/server/dashboard';

	let { data } = $props();
	let rows = $state(data.rows);
	let toastMessage = $state<string | undefined>();

	async function handleToggle(rowId: string): Promise<void> {
		const result = await optimisticUpdate<typeof rows>(rowId, {
			getCurrent: () => rows,
			setCurrent: (val) => { rows = val; },
			applyMutation: () => {
				const row = rows.find((r) => r.id === rowId);
				if (row) row.status = row.status === 'active' ? 'inactive' : 'active';
			},
			serverCall: () => toggleRowStatus(rowId)
		});

		if (!result.success && result.error !== 'Already in-flight') {
			toastMessage = result.error;
		}
	}
</script>

<!-- Inside the table row loop: -->
<button
	onclick={() => handleToggle(row.id)}
	aria-label={`Toggle status for ${row.name}`}
>
	{row.status}
</button>

{#if toastMessage}
	<Toast message={toastMessage} onDismiss={() => { toastMessage = undefined; }} />
{/if}
```
