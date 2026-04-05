<!--
	MetricCard.svelte — Module 3, introduced in Lesson 3.2 ($props), refined in 3.3 and 3.4.
	A typed reusable metric card: label + value, plus an optional trend direction in 3.4.
-->
<script lang="ts">
	let { label = '', value = '' } = $props();
</script>

<article class="metric-card">
	<p class="metric-card__label">{label}</p>
	<p class="metric-card__value">{value}</p>
</article>

<style>
	.metric-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
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
</style>
