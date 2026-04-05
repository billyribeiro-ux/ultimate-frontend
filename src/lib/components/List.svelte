<!--
	List.svelte — Module 3, Lesson 3.7.
	A generic render-prop list component. The caller supplies an `item` snippet
	that is invoked once per entry with the entry and its index.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	interface Props {
		items: T[];
		item: Snippet<[T, number]>;
	}

	let { items, item }: Props = $props();
</script>

<ul class="list">
	{#each items as entry, i (i)}
		<li class="list__row">
			{@render item(entry, i)}
		</li>
	{/each}
</ul>

<style>
	.list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.list__row {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		min-block-size: 44px;
		transition: background var(--dur-fast) var(--ease-out);

		&:nth-child(even) {
			background: var(--color-surface-2);
		}

		&:hover {
			background: oklch(from var(--color-brand) 96% 0.04 h);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.list__row {
			transition: none;
		}
	}
</style>
