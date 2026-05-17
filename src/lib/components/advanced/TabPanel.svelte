<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface TabContext {
		readonly activeTab: string;
		setActiveTab: (id: string) => void;
		isActive: (id: string) => boolean;
	}

	interface TabPanelProps {
		id: string;
		children: Snippet;
	}

	let { id, children }: TabPanelProps = $props();

	const ctx = getContext<TabContext>('tabs');
	let active: boolean = $derived(ctx.isActive(id));
</script>

{#if active}
	<div
		id="panel-{id}"
		role="tabpanel"
		aria-labelledby={id}
		class="tab-panel"
	>
		{@render children()}
	</div>
{/if}

<style>
	.tab-panel {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
</style>
