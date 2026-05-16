<!--
	Lesson 11.7 — TanStack Table basics
	Mini-build: a typed, headless members table with no features enabled.
-->
<script lang="ts">
	import { createTable } from '@tanstack/svelte-table';
	import {
		tableFeatures,
		createCoreRowModel,
		type ColumnDef
	} from '@tanstack/svelte-table';
	import { members, type Member } from '$lib/stores/members';

	const _features = tableFeatures({
		rowModelFns: {
			Core: createCoreRowModel
		}
	});

	type Features = typeof _features;

	const columns: ColumnDef<Features, Member>[] = [
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'email', header: 'Email' },
		{ accessorKey: 'role', header: 'Role' },
		{ accessorKey: 'joined', header: 'Joined' },
		{ accessorKey: 'signals', header: 'Signals' }
	];

	const table = createTable({
		_features,
		get data() {
			return members;
		},
		columns,
		_rowModels: {}
	});
</script>

<svelte:head>
	<title>Lesson 11.7 · TanStack Table basics · Ultimate Frontend</title>
	<meta
		name="description"
		content="A typed, headless table rendered with PE7 tokens. No features enabled — just the skeleton."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/11-state">← Module 11</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 11.7 · Mini-build</p>
		<h1>A headless table, styled your way</h1>
		<p class="lede">
			TanStack Table gives you the logic. You write the markup. The table below is
			<code>createSvelteTable</code> plus a handful of loops, fully typed against the
			<code>Member</code> interface.
		</p>
	</header>

	<div class="table-scroll">
		<table>
			<thead>
				{#each table.getHeaderGroups() as group (group.id)}
					<tr>
						{#each group.headers as header (header.id)}
							<th>{header.column.columnDef.header}</th>
						{/each}
					</tr>
				{/each}
			</thead>
			<tbody>
				{#each table.getRowModel().rows as row (row.id)}
					<tr>
						{#each row.getVisibleCells() as cell (cell.id)}
							<td>{cell.getValue()}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.2 300);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
		}
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.table-scroll {
		overflow-x: auto;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	table {
		inline-size: 100%;
		border-collapse: collapse;
		background: var(--color-surface-2);
	}

	th,
	td {
		padding: var(--space-sm) var(--space-md);
		text-align: start;
		font-size: var(--text-sm);
		min-block-size: 44px;
	}

	thead th {
		background: oklch(from var(--color-brand) 95% 0.03 h);
		color: var(--color-brand);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: var(--text-xs);
	}

	tbody tr {
		border-block-start: 1px solid var(--color-border);
	}

	tbody tr:hover {
		background: oklch(from var(--color-brand) 97% 0.02 h);
	}

	@media (prefers-reduced-motion: reduce) {
		tbody tr {
			transition: none;
		}
	}
</style>
