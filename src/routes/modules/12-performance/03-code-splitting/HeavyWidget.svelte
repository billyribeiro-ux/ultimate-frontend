<!--
	Heavy widget loaded lazily via dynamic import.
	Module 12 Lesson 12.3.
-->
<script lang="ts">
	interface Row {
		id: number;
		label: string;
		value: number;
	}

	const rows: Row[] = Array.from({ length: 24 }, (_, i) => ({
		id: i,
		label: `Row ${i + 1}`,
		value: Math.round(Math.sin(i) * 100 + 100)
	}));
</script>

<div class="widget">
	<h3>Heavy widget loaded on demand</h3>
	<p>This component was not in the initial bundle. Its chunk downloaded when you clicked.</p>
	<ul>
		{#each rows as row (row.id)}
			<li>
				<span>{row.label}</span>
				<span class="value">{row.value}</span>
			</li>
		{/each}
	</ul>
</div>

<style>
	.widget {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	h3 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
		grid-template-columns: 1fr;

		@media (min-width: 480px) {
			grid-template-columns: repeat(2, 1fr);
		}

		@media (min-width: 768px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	li {
		display: flex;
		justify-content: space-between;
		padding: var(--space-xs) var(--space-sm);
		border-block-end: 1px solid var(--color-border);
	}

	.value {
		font-family: ui-monospace, monospace;
		font-weight: 700;
	}
</style>
