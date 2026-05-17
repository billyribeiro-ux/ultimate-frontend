<script lang="ts">
	interface ComparisonItem {
		label: string;
		session: string;
		token: string;
	}

	const comparisons: ComparisonItem[] = [
		{ label: 'State location', session: 'Server', token: 'Client' },
		{ label: 'Revocation', session: 'Instant', token: 'Wait for expiry' },
		{ label: 'Request size', session: 'Tiny (ID only)', token: 'Large (full payload)' },
		{ label: 'Scaling', session: 'Shared store needed', token: 'Stateless' }
	];

	interface StorageOption {
		name: string;
		secure: boolean;
		reason: string;
	}

	const storageOptions: StorageOption[] = [
		{ name: 'localStorage', secure: false, reason: 'Readable by any script (XSS vulnerable)' },
		{ name: 'httpOnly cookie', secure: true, reason: 'Invisible to JavaScript, sent automatically' }
	];
</script>

<svelte:head>
	<title>Lesson 15.1 · What authentication is</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 15.1 · Mini-build</p>
		<h1>Authentication: sessions vs tokens</h1>
	</header>

	<article class="comparison-card">
		<h2>Sessions vs Tokens</h2>
		<table class="comparison-table">
			<thead>
				<tr>
					<th>Factor</th>
					<th>Sessions</th>
					<th>Tokens</th>
				</tr>
			</thead>
			<tbody>
				{#each comparisons as item (item.label)}
					<tr>
						<td class="factor">{item.label}</td>
						<td>{item.session}</td>
						<td>{item.token}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</article>

	<article class="storage-card">
		<h2>Where to store the session ID</h2>
		<ul class="storage-list">
			{#each storageOptions as option (option.name)}
				<li class="storage-item" class:storage-item--secure={option.secure}>
					<span class="storage-name">{option.name}</span>
					<span class="storage-badge">
						{option.secure ? 'Recommended' : 'Avoid'}
					</span>
					<p class="storage-reason">{option.reason}</p>
				</li>
			{/each}
		</ul>
	</article>
</section>

<style>
	section.page {
		--color-brand: oklch(65% 0.18 160);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.comparison-card,
	.storage-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.comparison-table {
		width: 100%;
		border-collapse: collapse;
		margin-block-start: var(--space-sm);
	}

	.comparison-table th,
	.comparison-table td {
		padding: var(--space-sm);
		text-align: left;
		border-block-end: 1px solid var(--color-border);
	}

	.comparison-table th {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
	}

	.factor {
		font-weight: 600;
	}

	.storage-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
		margin-block-start: var(--space-sm);
	}

	.storage-item {
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-xs);
	}

	.storage-item--secure {
		border-color: var(--color-success);
	}

	.storage-name {
		font-weight: 600;
		font-family: ui-monospace, monospace;
	}

	.storage-badge {
		font-size: var(--text-xs);
		padding: 0.15em 0.6em;
		border-radius: var(--radius-full);
		background: var(--color-error);
		color: oklch(98% 0 0);
		align-self: center;
	}

	.storage-item--secure .storage-badge {
		background: var(--color-success);
		color: oklch(15% 0.02 145);
	}

	.storage-reason {
		grid-column: 1 / -1;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
