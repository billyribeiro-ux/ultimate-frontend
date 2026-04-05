<!--
	TonedMetricCard.svelte — Module 3, Lesson 3.3.
	Demonstrates a strict TypeScript `interface Props` with a string-literal union
	for a constrained `tone` prop. Each tone remaps a single custom property.
-->
<script lang="ts">
	type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'error';

	interface Props {
		label: string;
		value: string;
		tone: Tone;
	}

	let { label, value, tone }: Props = $props();
</script>

<article class="metric-card metric-card--{tone}">
	<p class="metric-card__label">{label}</p>
	<p class="metric-card__value">{value}</p>
</article>

<style>
	.metric-card {
		--accent: var(--color-border);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--accent);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.metric-card__label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0;
	}

	.metric-card__value {
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--color-text);
		margin-block-start: var(--space-xs);
	}

	.metric-card--brand {
		--accent: var(--color-brand);
	}

	.metric-card--success {
		--accent: var(--color-success);
	}

	.metric-card--warning {
		--accent: var(--color-warning);
	}

	.metric-card--error {
		--accent: var(--color-error);
	}
</style>
