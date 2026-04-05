<!--
	Card.svelte — UI component library
	Introduced in Lesson 3.6 (snippets) and 3.7 (snippet props).
	Demonstrates multiple named snippet props with typed fallback content.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		header?: Snippet;
		children: Snippet;
		footer?: Snippet;
	}

	let { header, children, footer }: Props = $props();
</script>

<article class="card">
	{#if header}
		<header class="card__header">
			{@render header()}
		</header>
	{/if}

	<div class="card__body">
		{@render children()}
	</div>

	{#if footer}
		<footer class="card__footer">
			{@render footer()}
		</footer>
	{/if}
</article>

<style>
	.card {
		display: flex;
		flex-direction: column;
		background: var(--card-bg, var(--color-surface-2));
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		container-type: inline-size;
	}

	.card__header,
	.card__footer {
		padding: var(--space-md) var(--space-lg);
		background: var(--color-surface);
	}

	.card__header {
		border-block-end: 1px solid var(--color-border);
	}

	.card__footer {
		border-block-start: 1px solid var(--color-border);
	}

	.card__body {
		padding: var(--space-lg);
	}
</style>
