<!--
	Button.svelte — UI component library, Module 3
	-----------------------------------------------
	First introduced in Lesson 3.2 (props), refined in 3.3 (interfaces),
	3.4 (optional props), 3.8 (spread), 3.9 (CSS variables bridge).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'solid' | 'outline' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		children: Snippet;
		variant?: Variant;
		size?: Size;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		children,
		variant = 'solid',
		size = 'md',
		type = 'button',
		disabled = false,
		onclick
	}: Props = $props();
</script>

<button {type} {disabled} {onclick} class="btn btn--{variant} btn--{size}">
	{@render children()}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		font-weight: 600;
		font-size: var(--text-base);
		line-height: 1;
		border: 1px solid transparent;
		background: var(--btn-bg, var(--color-brand));
		color: var(--btn-fg, oklch(99% 0 0));
		cursor: pointer;
		transition:
			background var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out),
			transform var(--dur-fast) var(--ease-out);

		&:hover:not(:disabled) {
			background: var(--btn-bg-hover, var(--color-brand-dim));
		}

		&:active:not(:disabled) {
			transform: translateY(1px);
		}

		&:disabled {
			opacity: 0.55;
			cursor: not-allowed;
		}
	}

	.btn--outline {
		--btn-bg: transparent;
		--btn-fg: var(--color-brand);
		--btn-bg-hover: var(--color-surface-2);
		border-color: var(--color-brand);
	}

	.btn--ghost {
		--btn-bg: transparent;
		--btn-fg: var(--color-text);
		--btn-bg-hover: var(--color-surface-2);
	}

	.btn--sm {
		font-size: var(--text-sm);
		padding-inline: var(--space-sm);
	}

	.btn--lg {
		font-size: var(--text-lg);
		padding-inline: var(--space-lg);
	}

	@media (prefers-reduced-motion: reduce) {
		.btn {
			transition: none;
		}
	}
</style>
