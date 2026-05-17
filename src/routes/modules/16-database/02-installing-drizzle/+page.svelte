<script lang="ts">
	interface DbInfo {
		path: string;
		sqliteVersion: string;
		walMode: string;
		tableCount: number;
		tables: string[];
	}

	let { data }: { data: { dbInfo: DbInfo } } = $props();
</script>

<svelte:head>
	<title>Lesson 16.2 · Installing Drizzle · Ultimate Frontend</title>
	<meta
		name="description"
		content="Verifying the Drizzle ORM + better-sqlite3 installation by displaying database connection metadata."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/16-database">← Module 16</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 16.2 · Mini-build</p>
		<h1>Database connection verified</h1>
		<p class="lede">
			Drizzle ORM is installed and connected to SQLite. Below is live metadata
			from the database proving everything works.
		</p>
	</header>

	<article class="status-card">
		<div class="status-card__header">
			<span class="status-dot"></span>
			<span class="status-label">Connected</span>
		</div>

		<dl class="info-grid">
			<dt>Database path</dt>
			<dd><code>{data.dbInfo.path}</code></dd>

			<dt>SQLite version</dt>
			<dd>{data.dbInfo.sqliteVersion}</dd>

			<dt>Journal mode</dt>
			<dd>{data.dbInfo.walMode}</dd>

			<dt>Table count</dt>
			<dd>{data.dbInfo.tableCount}</dd>

			<dt>Tables</dt>
			<dd>
				<ul class="table-list">
					{#each data.dbInfo.tables as table}
						<li><code>{table}</code></li>
					{/each}
				</ul>
			</dd>
		</dl>
	</article>

	<article class="explanation">
		<h2>How this works</h2>
		<p>
			A <code>+page.server.ts</code> load function imports the <code>db</code> instance from
			<code>$lib/server/db</code> and queries SQLite's internal metadata tables. The results
			are passed as typed page data to this component.
		</p>
		<p>
			The database file lives at <code>data/dev.db</code> — a single file on disk.
			No separate server, no Docker, no configuration beyond what you see in
			<code>drizzle.config.ts</code>.
		</p>
	</article>
</section>

<style>
	section.page {
		--color-brand: oklch(60% 0.2 250);
	}

	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: var(--text-sm);
		min-block-size: 44px;
		display: inline-flex;
		align-items: center;
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lede {
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		max-inline-size: var(--prose-max);
	}

	.status-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.status-card__header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-block-end: var(--space-md);
	}

	.status-dot {
		inline-size: 12px;
		block-size: 12px;
		border-radius: var(--radius-full);
		background: var(--color-success);
		animation: pulse 2s ease-in-out infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.status-dot {
			animation: none;
		}
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.status-label {
		font-weight: 600;
		color: var(--color-success);
		text-transform: uppercase;
		font-size: var(--text-sm);
		letter-spacing: 0.05em;
	}

	.info-grid {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		margin: 0;
	}

	.info-grid dt {
		font-weight: 600;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		padding-block: var(--space-xs);
	}

	.info-grid dd {
		margin: 0;
		padding-block: var(--space-xs);
	}

	.table-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.table-list li {
		background: var(--color-surface);
		padding: 0.15em 0.6em;
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		border: 1px solid var(--color-border);
	}

	.explanation {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}

	.explanation h2 {
		font-size: var(--text-lg);
		margin: 0 0 var(--space-sm);
	}
</style>
