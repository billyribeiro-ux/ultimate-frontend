<!--
	Modal.svelte — UI component library
	Introduced in Lesson 3.5 ($bindable) and 3.7 (snippet props).
	Uses the native <dialog> element for accessibility.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		children: Snippet;
		footer?: Snippet;
	}

	let { open = $bindable(), title, children, footer }: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();

	$effect((): void => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});

	function onClose(): void {
		open = false;
	}
</script>

<dialog bind:this={dialog} onclose={onClose} aria-labelledby="modal-title">
	<header class="modal__header">
		<h2 id="modal-title">{title}</h2>
		<button type="button" class="modal__close" onclick={onClose} aria-label="Close dialog">
			×
		</button>
	</header>

	<div class="modal__body">
		{@render children()}
	</div>

	{#if footer}
		<footer class="modal__footer">
			{@render footer()}
		</footer>
	{/if}
</dialog>

<style>
	dialog {
		inline-size: min(92vw, 32rem);
		padding: 0;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		color: var(--color-text);
		box-shadow: var(--shadow-lg);

		&::backdrop {
			background: oklch(0% 0 0 / 0.5);
		}
	}

	.modal__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-lg);
		border-block-end: 1px solid var(--color-border);
	}

	.modal__header h2 {
		font-size: var(--text-lg);
		margin: 0;
	}

	.modal__close {
		font-size: var(--text-xl);
		line-height: 1;
		min-inline-size: 44px;
		min-block-size: 44px;
		color: var(--color-text-muted);
		border-radius: var(--radius-full);

		&:hover {
			color: var(--color-brand);
		}
	}

	.modal__body {
		padding: var(--space-lg);
	}

	.modal__footer {
		padding: var(--space-md) var(--space-lg);
		border-block-start: 1px solid var(--color-border);
		display: flex;
		justify-content: flex-end;
		gap: var(--space-sm);
	}
</style>
