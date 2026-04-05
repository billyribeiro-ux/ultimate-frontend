<!--
	Badge.svelte — UI component library
	Introduced in Lesson 3.3 (typed props) and used across Module 3.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'error';

	interface Props {
		children: Snippet;
		tone?: Tone;
	}

	let { children, tone = 'neutral' }: Props = $props();
</script>

<span class="badge badge--{tone}">
	{@render children()}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		padding-inline: var(--space-sm);
		padding-block: 0.2em;
		font-size: var(--text-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		border-radius: var(--radius-full);
		background: var(--badge-bg, var(--color-surface-2));
		color: var(--badge-fg, var(--color-text));
	}

	.badge--brand {
		--badge-bg: var(--color-brand);
		--badge-fg: oklch(99% 0 0);
	}

	.badge--success {
		--badge-bg: var(--color-success);
		--badge-fg: oklch(15% 0.02 145);
	}

	.badge--warning {
		--badge-bg: var(--color-warning);
		--badge-fg: oklch(15% 0.02 85);
	}

	.badge--error {
		--badge-bg: var(--color-error);
		--badge-fg: oklch(99% 0 0);
	}
</style>
