<!--
    FancyButton — reusable child for Lesson 5.5.
    Demonstrates the callback prop pattern. The parent passes onPress;
    the child calls it when the DOM click fires.
-->
<script lang="ts">
	interface Props {
		label: string;
		onPress?: (event: MouseEvent) => void;
		variant?: 'primary' | 'ghost';
	}

	let { label, onPress = () => {}, variant = 'primary' }: Props = $props();
</script>

<button type="button" class="fancy {variant}" onclick={onPress}>
	{label}
</button>

<style>
	.fancy {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		font-weight: 600;
		transition: transform var(--dur-fast) var(--ease-out);
	}

	.fancy.primary {
		background: var(--color-brand);
		color: oklch(15% 0.02 270);
	}

	.fancy.ghost {
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.fancy.ghost:hover {
		border-color: var(--color-brand);
	}

	.fancy:active {
		transform: translateY(1px);
	}

	@media (prefers-reduced-motion: reduce) {
		.fancy {
			transition: none;
		}
	}
</style>
