<script lang="ts">
	interface ColumnInfo {
		name: string;
		type: string;
		constraints: string[];
	}

	interface TableInfo {
		name: string;
		columns: ColumnInfo[];
	}

	const schema: TableInfo[] = [
		{
			name: 'users',
			columns: [
				{ name: 'id', type: 'INTEGER', constraints: ['PRIMARY KEY', 'AUTOINCREMENT'] },
				{ name: 'name', type: 'TEXT', constraints: ['NOT NULL'] },
				{ name: 'email', type: 'TEXT', constraints: ['NOT NULL', 'UNIQUE'] },
				{ name: 'created_at', type: 'TEXT', constraints: ['NOT NULL', '$defaultFn'] }
			]
		},
		{
			name: 'notes',
			columns: [
				{ name: 'id', type: 'INTEGER', constraints: ['PRIMARY KEY', 'AUTOINCREMENT'] },
				{ name: 'title', type: 'TEXT', constraints: ['NOT NULL'] },
				{ name: 'content', type: 'TEXT', constraints: ['NOT NULL', 'DEFAULT ""'] },
				{ name: 'user_id', type: 'INTEGER', constraints: ['NOT NULL', 'FK → users'] },
				{ name: 'created_at', type: 'TEXT', constraints: ['NOT NULL', '$defaultFn'] },
				{ name: 'updated_at', type: 'TEXT', constraints: ['NOT NULL', '$defaultFn'] }
			]
		},
		{
			name: 'tags',
			columns: [
				{ name: 'id', type: 'INTEGER', constraints: ['PRIMARY KEY', 'AUTOINCREMENT'] },
				{ name: 'name', type: 'TEXT', constraints: ['NOT NULL', 'UNIQUE'] }
			]
		},
		{
			name: 'notes_tags',
			columns: [
				{ name: 'note_id', type: 'INTEGER', constraints: ['NOT NULL', 'FK → notes'] },
				{ name: 'tag_id', type: 'INTEGER', constraints: ['NOT NULL', 'FK → tags'] }
			]
		}
	];

	function typeColor(type: string): string {
		switch (type) {
			case 'TEXT': return 'type--text';
			case 'INTEGER': return 'type--integer';
			case 'REAL': return 'type--real';
			default: return '';
		}
	}
</script>

<svelte:head>
	<title>Lesson 16.3 · Schema definition · Ultimate Frontend</title>
	<meta
		name="description"
		content="Visualizing the Drizzle ORM schema: tables, columns, types, and constraints for the Full-Stack Notes App."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/16-database">← Module 16</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 16.3 · Mini-build</p>
		<h1>Schema explorer</h1>
		<p class="lede">
			The four tables that power the Full-Stack Notes App. Each column has a
			type and constraints defined in <code>src/lib/server/db/schema.ts</code>.
		</p>
	</header>

	<div class="schema-grid">
		{#each schema as table (table.name)}
			<article class="table-card">
				<h2 class="table-card__name">{table.name}</h2>
				<ul class="table-card__columns">
					{#each table.columns as col (col.name)}
						<li>
							<span class="col-name">{col.name}</span>
							<span class="col-type {typeColor(col.type)}">{col.type}</span>
							{#each col.constraints as constraint}
								<span class="col-constraint">{constraint}</span>
							{/each}
						</li>
					{/each}
				</ul>
			</article>
		{/each}
	</div>
</section>

<style>
	section.page {
		--color-brand: oklch(62% 0.2 310);
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

	.schema-grid {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.schema-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.table-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.table-card__name {
		font-family: ui-monospace, monospace;
		font-size: var(--text-lg);
		color: var(--color-brand);
		margin: 0 0 var(--space-md);
	}

	.table-card__columns {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.table-card__columns li {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
	}

	.col-name {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.col-type {
		font-size: var(--text-xs);
		padding: 0.1em 0.5em;
		border-radius: var(--radius-full);
		font-weight: 600;
		text-transform: uppercase;
	}

	.type--text {
		background: oklch(65% 0.15 310 / 0.15);
		color: var(--color-brand);
	}

	.type--integer {
		background: oklch(65% 0.15 145 / 0.15);
		color: var(--color-success);
	}

	.type--real {
		background: oklch(65% 0.15 85 / 0.15);
		color: var(--color-warning);
	}

	.col-constraint {
		font-size: var(--text-xs);
		padding: 0.1em 0.4em;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
	}
</style>
