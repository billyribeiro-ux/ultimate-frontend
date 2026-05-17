<script lang="ts">
	import { setContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface TabsProps {
		defaultValue?: string;
		children: Snippet;
	}

	let { defaultValue = '', children }: TabsProps = $props();

	let activeTab: string = $state('');

	function setActiveTab(id: string): void {
		activeTab = id;
	}

	function isActive(id: string): boolean {
		return activeTab === id;
	}

	setContext('tabs', {
		get activeTab() { return activeTab; },
		setActiveTab,
		isActive
	});
</script>

<div class="tabs" role="tablist">
	{@render children()}
</div>

<style>
	.tabs {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}
</style>
