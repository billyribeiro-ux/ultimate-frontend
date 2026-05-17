<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface TabContext {
		readonly activeTab: string;
		setActiveTab: (id: string) => void;
		isActive: (id: string) => boolean;
	}

	interface TabProps {
		id: string;
		children: Snippet;
	}

	let { id, children }: TabProps = $props();

	const ctx = getContext<TabContext>('tabs');
	let active: boolean = $derived(ctx.isActive(id));

	function handleClick(): void {
		ctx.setActiveTab(id);
	}
</script>

<button
	role="tab"
	aria-selected={active}
	aria-controls="panel-{id}"
	class="tab"
	class:tab--active={active}
	onclick={handleClick}
>
	{@render children()}
</button>

<style>
	.tab {
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text-muted);
		border-block-end: 2px solid transparent;
		min-block-size: 44px;
		min-inline-size: 44px;
		transition: color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	.tab--active {
		color: var(--color-brand);
		border-block-end-color: var(--color-brand);
	}

	.tab:hover {
		color: var(--color-brand-dim);
	}
</style>
