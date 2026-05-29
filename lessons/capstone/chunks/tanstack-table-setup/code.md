---
chunk: tanstack-table-setup
level: 3
penalty: high
---

# TanStack Table Setup — Level 3 Code Reveal

**`src/lib/types/user.ts`**

```ts
export interface User {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'editor' | 'viewer';
	lastActive: string;
}
```

**`src/lib/components/UsersTable.svelte`**

```svelte
<script lang="ts" module>
	import type { User } from '$lib/types/user';
	export interface UsersTableProps {
		users: User[];
	}
</script>

<script lang="ts">
	import {
		createTable,
		tableFeatures,
		columnVisibilityFeature,
		rowSortingFeature,
		columnFilteringFeature,
		globalFilteringFeature,
		rowPaginationFeature,
		createCoreRowModel,
		createSortedRowModel,
		createFilteredRowModel,
		createPaginatedRowModel,
		filterFns,
		sortFns,
		type ColumnDef,
		type SortingState,
		type PaginationState,
		type Updater
	} from '@tanstack/svelte-table';
	import type { User } from '$lib/types/user';

	const { users }: UsersTableProps = $props();

	const _features = tableFeatures({
		columnVisibilityFeature,
		rowSortingFeature,
		columnFilteringFeature,
		globalFilteringFeature,
		rowPaginationFeature
	});

	let sorting = $state<SortingState>([]);
	let globalFilter = $state<string>('');
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });

	const columns: ColumnDef<typeof _features, User>[] = [
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'email', header: 'Email' },
		{ accessorKey: 'role', header: 'Role' },
		{ accessorKey: 'lastActive', header: 'Last active' }
	];

	const table = createTable({
		_features,
		get data() {
			return users;
		},
		columns,
		_rowModels: {
			coreRowModel: createCoreRowModel(),
			sortedRowModel: createSortedRowModel(sortFns),
			filteredRowModel: createFilteredRowModel(filterFns),
			paginatedRowModel: createPaginatedRowModel()
		},
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
		onSortingChange: (updater: Updater<SortingState>) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		},
		onGlobalFilterChange: (v: Updater<string>) => {
			globalFilter = (typeof v === 'function' ? v(globalFilter) : v ?? '') as string;
			pagination = { ...pagination, pageIndex: 0 };
		},
		onPaginationChange: (updater: Updater<PaginationState>) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater;
		}
	});
</script>

<label class="search">
	Search
	<input
		type="search"
		value={globalFilter}
		oninput={(e) => (globalFilter = (e.currentTarget as HTMLInputElement).value)}
		placeholder="Name or email"
	/>
</label>

<table>
	<thead>
		{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
			<tr>
				{#each headerGroup.headers as header (header.id)}
					<th>
						<button type="button" onclick={header.column.getToggleSortingHandler()}>
							{header.column.columnDef.header}
							{#if header.column.getIsSorted() === 'asc'}↑{:else if header.column.getIsSorted() === 'desc'}↓{/if}
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

<nav class="pager">
	<button type="button" onclick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Prev</button>
	<span>Page {table.state.pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}</span>
	<button type="button" onclick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button>
</nav>

<style>
	.search { display: grid; gap: var(--space-xs); margin-block-end: var(--space-md); }
	.search input { min-block-size: 44px; padding-inline: var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
	table { inline-size: 100%; border-collapse: collapse; }
	th, td { padding: var(--space-sm); text-align: start; border-block-end: 1px solid var(--color-border); }
	th button { min-block-size: 44px; inline-size: 100%; text-align: start; font-weight: 700; }
	.pager { display: flex; gap: var(--space-sm); align-items: center; justify-content: center; margin-block-start: var(--space-md); }
	.pager button { min-block-size: 44px; padding-inline: var(--space-md); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
	.pager button:disabled { opacity: 0.5; }
</style>
```
