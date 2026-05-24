<script lang="ts">
	interface ChunkInfo {
		id: string;
		name: string;
		rawSize: number;
		gzipSize: number;
		category: 'app' | 'vendor' | 'shared';
		isOversized: boolean;
	}

	type SortKey = 'name' | 'rawSize' | 'gzipSize';

	let chunks: ChunkInfo[] = $state([
		{ id: '1', name: 'entry-client.js', rawSize: 24500, gzipSize: 8200, category: 'app', isOversized: false },
		{ id: '2', name: 'page-home.js', rawSize: 6800, gzipSize: 2400, category: 'app', isOversized: false },
		{ id: '3', name: 'page-dashboard.js', rawSize: 18200, gzipSize: 6100, category: 'app', isOversized: false },
		{ id: '4', name: 'vendor-svelte.js', rawSize: 45600, gzipSize: 15300, category: 'vendor', isOversized: false },
		{ id: '5', name: 'vendor-chart.js', rawSize: 285000, gzipSize: 89000, category: 'vendor', isOversized: true },
		{ id: '6', name: 'shared-utils.js', rawSize: 12300, gzipSize: 4500, category: 'shared', isOversized: false },
		{ id: '7', name: 'page-settings.js', rawSize: 4200, gzipSize: 1800, category: 'app', isOversized: false },
		{ id: '8', name: 'vendor-date-fns.js', rawSize: 78000, gzipSize: 24000, category: 'vendor', isOversized: false },
		{ id: '9', name: 'shared-components.js', rawSize: 32100, gzipSize: 11200, category: 'shared', isOversized: false },
		{ id: '10', name: 'page-profile.js', rawSize: 8900, gzipSize: 3100, category: 'app', isOversized: false }
	]);

	let sortKey: SortKey = $state('gzipSize');
	let sortAsc: boolean = $state(false);
	let filterCategory: string = $state('all');

	let sortedChunks: ChunkInfo[] = $derived.by(() => {
		let filtered: ChunkInfo[] = filterCategory === 'all'
			? chunks
			: chunks.filter((c: ChunkInfo) => c.category === filterCategory);

		return [...filtered].sort((a: ChunkInfo, b: ChunkInfo) => {
			const aVal: string | number = a[sortKey];
			const bVal: string | number = b[sortKey];
			if (typeof aVal === 'string' && typeof bVal === 'string') {
				return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
			}
			return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
		});
	});

	let totalRawSize: number = $derived(
		chunks.reduce((sum: number, c: ChunkInfo) => sum + c.rawSize, 0)
	);

	let totalGzipSize: number = $derived(
		chunks.reduce((sum: number, c: ChunkInfo) => sum + c.gzipSize, 0)
	);

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		const kb: number = bytes / 1024;
		if (kb < 1024) return `${kb.toFixed(1)} kB`;
		return `${(kb / 1024).toFixed(2)} MB`;
	}

	function toggleSort(key: SortKey): void {
		if (sortKey === key) {
			sortAsc = !sortAsc;
		} else {
			sortKey = key;
			sortAsc = false;
		}
	}

	function getBarWidth(size: number): number {
		const maxSize: number = Math.max(...chunks.map((c: ChunkInfo) => c.gzipSize));
		return Math.max(5, (size / maxSize) * 100);
	}
</script>

<svelte:head>
	<title>21.6 — Build Analysis · Vite, Vitest & The Svelte Playground</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 21.6 · Mini-build</p>
		<h1>Bundle Stats Dashboard</h1>
		<p class="lede">
			Sort and filter chunks by size to identify optimization targets.
			Oversized chunks are highlighted with a warning indicator.
		</p>
	</header>

	<div class="summary">
		<div class="summary__stat">
			<span class="summary__label">Total (raw)</span>
			<span class="summary__value">{formatBytes(totalRawSize)}</span>
		</div>
		<div class="summary__stat">
			<span class="summary__label">Total (gzip)</span>
			<span class="summary__value">{formatBytes(totalGzipSize)}</span>
		</div>
		<div class="summary__stat">
			<span class="summary__label">Chunks</span>
			<span class="summary__value">{chunks.length}</span>
		</div>
	</div>

	<div class="controls">
		<div class="filter-tabs" role="tablist" aria-label="Filter by category">
			{#each ['all', 'app', 'vendor', 'shared'] as cat (cat)}
				<button
					type="button"
					role="tab"
					class="tab-btn"
					class:tab-btn--active={filterCategory === cat}
					aria-selected={filterCategory === cat}
					onclick={() => { filterCategory = cat; }}
				>
					{cat}
				</button>
			{/each}
		</div>
		<div class="sort-btns">
			<button type="button" class="sort-btn" class:sort-btn--active={sortKey === 'name'} onclick={() => toggleSort('name')}>Name</button>
			<button type="button" class="sort-btn" class:sort-btn--active={sortKey === 'rawSize'} onclick={() => toggleSort('rawSize')}>Raw Size</button>
			<button type="button" class="sort-btn" class:sort-btn--active={sortKey === 'gzipSize'} onclick={() => toggleSort('gzipSize')}>Gzip Size</button>
		</div>
	</div>

	<ul class="chunk-list">
		{#each sortedChunks as chunk (chunk.id)}
			<li class="chunk-card" class:chunk-card--oversized={chunk.isOversized}>
				<div class="chunk-card__header">
					<code class="chunk-card__name">{chunk.name}</code>
					{#if chunk.isOversized}
						<span class="chunk-card__warn">oversized</span>
					{/if}
				</div>
				<div class="chunk-card__bar-container">
					<div
						class="chunk-card__bar"
						class:chunk-card__bar--app={chunk.category === 'app'}
						class:chunk-card__bar--vendor={chunk.category === 'vendor'}
						class:chunk-card__bar--shared={chunk.category === 'shared'}
						style="inline-size: {getBarWidth(chunk.gzipSize)}%"
					></div>
				</div>
				<div class="chunk-card__sizes">
					<span>{formatBytes(chunk.rawSize)}</span>
					<span class="chunk-card__gzip">gzip: {formatBytes(chunk.gzipSize)}</span>
				</div>
			</li>
		{/each}
	</ul>
</section>

<style>
	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 50ch;
	}

	.summary {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.summary__stat {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		display: grid;
		gap: var(--space-xs);
	}

	.summary__label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.summary__value {
		font-size: var(--text-lg);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.controls {
		display: grid;
		gap: var(--space-sm);
	}

	.filter-tabs, .sort-btns {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	.tab-btn, .sort-btn {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: 600;
		min-block-size: 44px;
		text-transform: capitalize;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.tab-btn--active, .sort-btn--active {
		border-color: var(--color-brand);
		color: var(--color-brand);
	}

	.chunk-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.chunk-card {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		display: grid;
		gap: var(--space-xs);
	}

	.chunk-card--oversized {
		border-color: var(--color-error);
		border-inline-start-width: 3px;
	}

	.chunk-card__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.chunk-card__name {
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.chunk-card__warn {
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--color-error);
		text-transform: uppercase;
	}

	.chunk-card__bar-container {
		block-size: 0.5rem;
		background: var(--color-surface);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.chunk-card__bar {
		block-size: 100%;
		border-radius: var(--radius-full);
		transition: inline-size var(--dur-base) var(--ease-out);
	}

	.chunk-card__bar--app { background: var(--color-brand); }
	.chunk-card__bar--vendor { background: var(--color-warning); }
	.chunk-card__bar--shared { background: var(--color-success); }

	.chunk-card__sizes {
		display: flex;
		justify-content: space-between;
		font-size: var(--text-xs);
		font-variant-numeric: tabular-nums;
		color: var(--color-text-muted);
	}

	.chunk-card__gzip {
		font-weight: 600;
	}
</style>
