<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface AccordionContext {
		toggle: (id: string) => void;
		isOpen: (id: string) => boolean;
		readonly openItems: Set<string>;
	}

	interface AccordionItemProps {
		id: string;
		title: string;
		children: Snippet;
	}

	let { id, title, children }: AccordionItemProps = $props();

	const ctx = getContext<AccordionContext>('accordion');
	let open: boolean = $derived(ctx.isOpen(id));

	function handleToggle(): void {
		ctx.toggle(id);
	}
</script>

<div class="accordion-item" class:accordion-item--open={open}>
	<button
		class="accordion-item__trigger"
		aria-expanded={open}
		aria-controls="content-{id}"
		onclick={handleToggle}
	>
		<span class="accordion-item__title">{title}</span>
		<span class="accordion-item__icon" aria-hidden="true">
			{open ? '−' : '+'}
		</span>
	</button>

	{#if open}
		<div
			id="content-{id}"
			class="accordion-item__content"
			role="region"
			aria-labelledby={id}
		>
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.accordion-item {
		border-block-end: 1px solid var(--color-border);
	}

	.accordion-item:last-child {
		border-block-end: none;
	}

	.accordion-item__trigger {
		display: flex;
		justify-content: space-between;
		align-items: center;
		inline-size: 100%;
		padding: var(--space-md);
		min-block-size: 44px;
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-text);
		text-align: start;
		transition: background var(--dur-fast) var(--ease-out);
	}

	.accordion-item__trigger:hover {
		background: var(--color-surface-2);
	}

	.accordion-item__icon {
		font-size: var(--text-lg);
		color: var(--color-brand);
		transition: transform var(--dur-fast) var(--ease-out);
	}

	.accordion-item--open .accordion-item__icon {
		transform: rotate(180deg);
	}

	.accordion-item__content {
		padding: 0 var(--space-md) var(--space-md);
		color: var(--color-text-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.accordion-item__icon {
			transition: none;
		}
	}
</style>
