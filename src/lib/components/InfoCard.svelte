<!--
	InfoCard.svelte — Module 3, introduced in Lesson 3.1.
	No props yet: the point of Lesson 3.1 is to show that *extracting a component*
	removes duplication even before you teach $props().
-->
<script lang="ts">
	const label: string = 'Total users';
	const value: string = '12,384';
</script>

<article class="info-card">
	<p class="info-card__label">{label}</p>
	<p class="info-card__value">{value}</p>
</article>

<style>
	.info-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.info-card__label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0;
	}

	.info-card__value {
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--color-text);
		margin-block-start: var(--space-xs);
	}
</style>
