<!--
	Toolbar.svelte — Module 3, Lesson 3.8.
	A compositional container: a flex row that accepts arbitrary children.
	Demonstrates the simplest kind of composition — layout only.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		align?: 'start' | 'end' | 'between';
	}

	let { children, align = 'start' }: Props = $props();
</script>

<div class="toolbar toolbar--{align}">
	{@render children()}
</div>

<style>
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		align-items: center;
		padding: var(--space-sm);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}

	.toolbar--end {
		justify-content: flex-end;
	}

	.toolbar--between {
		justify-content: space-between;
	}
</style>
