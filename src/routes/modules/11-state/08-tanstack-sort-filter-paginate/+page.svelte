<!--
	Lesson 11.8 — TanStack Table sort, filter, pagination
	Mini-build: same members table with three row models enabled and
	controlled state held in local $state.
-->
<script lang="ts">
	import {
		createSvelteTable,
		getCoreRowModel,
		getFilteredRowModel,
		getSortedRowModel,
		getPaginationRowModel,
		type ColumnDef,
		type SortingState,
		type PaginationState
	} from '@tanstack/svelte-table';
	import { members, type Member } from '$lib/stores/members';

	const columns: ColumnDef<Member>[] = [
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'email', header: 'Email' },
		{ accessorKey: 'role', header: 'Role' },
		{ accessorKey: 'joined', header: 'Joined' },
		{ accessorKey: 'signals', header: 'Signals' }
	];

	let sorting = $state<SortingState>([]);
	let globalFilter = $state<string>('');
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 5 });

	const table = createSvelteTable<Member>({
		get data() {
			return members;
		},
		columns,
		state: {
			get sorting() {
				return sorting;
			},
			get globalFilter() {
				return globalFilter;
			},
			get pagination() {
				return pagination;
			}
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		},
		onGlobalFilterChange: (value) => {
			globalFilter = (value ?? '') as string;
			pagination = { ...pagination, pageIndex: 0 };
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel()
	});

	function sortGlyph(state: false | 'asc' | 'desc'): string {
		if (state === 'asc') return '↑';
		if (state === 'desc') return '↓';
		return '↕';
	}
</script>

<svelte:head>
	<title>Lesson 11.8 · Sort, filter, paginate · Ultimate Frontend</title>
	<meta
		name="description"
		content="A TanStack Table with sort, global filter, and pagination wired to reactive $state."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/11-state">← Module 11</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 11.8 · Mini-build</p>
		<h1>Three row models, one pipeline</h1>
		<p class="lede">
			Core → filter → sort → paginate. Each feature is a one-line import and a reactive
			state binding.
		</p>
	</header>

	<label class="search">
		<span>Search all columns</span>
		<input
			type="search"
			placeholder="Type to filter…"
			value={globalFilter}
			oninput={(e) => (globalFilter = (e.currentTarget as HTMLInputElement).value)}
		/>
	</label>

	<div class="table-scroll">
		<table>
			<thead>
				{#each table.getHeaderGroups() as group (group.id)}
					<tr>
						{#each group.headers as header (header.id)}
							<th>
								<button
									type="button"
									class="sort-btn"
									onclick={header.column.getToggleSortingHandler()}
								>
									<span>{header.column.columnDef.header}</span>
									<span class="glyph">{sortGlyph(header.column.getIsSorted())}</span>
								</button>
							</th>
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

	<nav class="pager" aria-label="Pagination">
		<button
			type="button"
			onclick={() => table.previousPage()}
			disabled={!table.getCanPreviousPage()}
		>
			← Previous
		</button>
		<span>
			Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
		</span>
		<button
			type="button"
			onclick={() => table.nextPage()}
			disabled={!table.getCanNextPage()}
		>
			Next →
		</button>
	</nav>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.18 260);
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

	.search {
		display: grid;
		gap: var(--space-xs);
	}

	.search span {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.search input {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		max-inline-size: 24rem;
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
		padding: 0;
		text-align: start;
		background: oklch(from var(--color-brand) 95% 0.03 h);
	}

	.sort-btn {
		display: flex;
		inline-size: 100%;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: none;
		color: var(--color-brand);
		font-size: var(--text-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.glyph {
		font-family: ui-monospace, monospace;
	}

	td {
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-sm);
		min-block-size: 44px;
	}

	tbody tr {
		border-block-start: 1px solid var(--color-border);
	}

	.pager {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.pager button {
		padding: var(--space-xs) var(--space-md);
		min-block-size: 44px;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.pager button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
