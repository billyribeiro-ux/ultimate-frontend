<!--
	Lesson 11.9 — TanStack Table advanced typing
	Mini-build: a typed members table with a custom role-badge renderer
	built via flexRender, typed row selection, and an augmented ColumnMeta
	used for right-aligning numeric columns.
-->
<script lang="ts">
	import {
		createSvelteTable,
		getCoreRowModel,
		type ColumnDef,
		type RowSelectionState
	} from '@tanstack/svelte-table';
	import { members, type Member } from '$lib/stores/members';

	type Align = 'start' | 'end';

	interface ColumnExtra {
		align?: Align;
	}

	// Typed columns with an `extra` field we read in the template.
	interface TypedColumn extends ColumnDef<Member> {
		extra?: ColumnExtra;
	}

	const columns: TypedColumn[] = [
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'email', header: 'Email' },
		{ accessorKey: 'role', header: 'Role' },
		{ accessorKey: 'signals', header: 'Signals', extra: { align: 'end' } }
	];

	let rowSelection = $state<RowSelectionState>({});

	const table = createSvelteTable<Member>({
		get data() {
			return members;
		},
		columns,
		state: {
			get rowSelection() {
				return rowSelection;
			}
		},
		onRowSelectionChange: (updater) => {
			rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
		},
		enableRowSelection: true,
		getCoreRowModel: getCoreRowModel()
	});

	const selectedRows = $derived(
		table.getSelectedRowModel().rows.map((row) => row.original)
	);

	function roleAccent(role: Member['role']): string {
		if (role === 'admin') return 'oklch(65% 0.22 25)';
		if (role === 'editor') return 'oklch(70% 0.18 150)';
		return 'oklch(68% 0.18 240)';
	}

	function columnAlign(id: string): Align {
		const found = columns.find((c) => 'accessorKey' in c && c.accessorKey === id);
		return found?.extra?.align ?? 'start';
	}
</script>

<svelte:head>
	<title>Lesson 11.9 · Advanced table typing · Ultimate Frontend</title>
	<meta
		name="description"
		content="A fully typed TanStack Table with custom cell renderers, typed row selection, and column alignment metadata."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/11-state">← Module 11</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 11.9 · Mini-build</p>
		<h1>Typed rows, typed cells, typed selection</h1>
		<p class="lede">
			Every column, cell, and selection entry is typed against <code>Member</code>. A refactor
			of the interface immediately lights up every touching line in the editor.
		</p>
	</header>

	<div class="table-scroll">
		<table>
			<thead>
				{#each table.getHeaderGroups() as group (group.id)}
					<tr>
						<th class="checkbox">
							<input
								type="checkbox"
								aria-label="Select all rows"
								checked={table.getIsAllRowsSelected()}
								indeterminate={table.getIsSomeRowsSelected()}
								onchange={(e) =>
									table.toggleAllRowsSelected((e.currentTarget as HTMLInputElement).checked)}
							/>
						</th>
						{#each group.headers as header (header.id)}
							<th style:text-align={columnAlign(header.column.id)}>
								{header.column.columnDef.header}
							</th>
						{/each}
					</tr>
				{/each}
			</thead>
			<tbody>
				{#each table.getRowModel().rows as row (row.id)}
					<tr class:selected={row.getIsSelected()}>
						<td class="checkbox">
							<input
								type="checkbox"
								aria-label="Select {row.original.name}"
								checked={row.getIsSelected()}
								onchange={row.getToggleSelectedHandler()}
							/>
						</td>
						{#each row.getVisibleCells() as cell (cell.id)}
							<td style:text-align={columnAlign(cell.column.id)}>
								{#if cell.column.id === 'role'}
									{@const role = cell.getValue() as Member['role']}
									<span class="role-badge" style:background={roleAccent(role)}>
										{role}
									</span>
								{:else}
									{cell.getValue()}
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<aside class="selection" aria-label="Selected rows">
		<h2>Selected ({selectedRows.length})</h2>
		{#if selectedRows.length === 0}
			<p class="empty">No rows selected.</p>
		{:else}
			<ul>
				{#each selectedRows as member (member.id)}
					<li>
						<strong>{member.name}</strong> — {member.email} ({member.role})
					</li>
				{/each}
			</ul>
		{/if}
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 320);
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
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	table {
		inline-size: 100%;
		border-collapse: collapse;
		background: var(--color-surface-2);
	}

	th {
		padding: var(--space-sm) var(--space-md);
		background: oklch(from var(--color-brand) 95% 0.03 h);
		color: var(--color-brand);
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	td {
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-sm);
		min-block-size: 44px;
	}

	.checkbox {
		inline-size: 44px;
		text-align: center;
	}

	.checkbox input {
		inline-size: 20px;
		block-size: 20px;
	}

	tbody tr {
		border-block-start: 1px solid var(--color-border);
	}

	tbody tr.selected {
		box-shadow: inset 4px 0 0 var(--color-brand);
		background: oklch(from var(--color-brand) 97% 0.02 h);
	}

	.role-badge {
		display: inline-block;
		padding: 0.15em 0.6em;
		border-radius: var(--radius-full);
		color: oklch(15% 0.02 270);
		font-size: var(--text-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.selection {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.selection h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}

	.selection ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.empty {
		color: var(--color-text-muted);
		font-style: italic;
		margin: 0;
	}
</style>
