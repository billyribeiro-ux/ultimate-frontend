---
chunk: tanstack-table-setup
level: 2
penalty: medium
---

# TanStack Table Setup — Level 2 Concept Reveal

TanStack Table is a framework-agnostic library that supplies the logic for data tables — sorting, filtering, grouping, pagination, virtualisation — without ever rendering a `<table>` itself. The Svelte adapter is a thin wrapper around the core that exposes the table instance as a reactive object.

### The four pieces

1. **Features.** Declare the enabled features once with `tableFeatures({ ... })`. The row type — in the capstone, `User`. Column definitions are `ColumnDef<typeof _features, User>`.
2. **Options.** A plain object: `_features`, `columns`, `data`, and a `_rowModels` object of factory calls.
3. **Row models.** Each feature's row model is a factory call placed inside `_rowModels` — `createCoreRowModel()`, `createSortedRowModel(sortFns)`, etc.
4. **Instance.** The result of `createTable(options)` — an object whose methods return the current sorted, filtered, paginated rows.

### Pseudocode

```
import { createTable, tableFeatures, rowSortingFeature, columnFilteringFeature, globalFilteringFeature, rowPaginationFeature, createCoreRowModel, createSortedRowModel, createFilteredRowModel, createPaginatedRowModel, filterFns, sortFns, type ColumnDef, type SortingState, type PaginationState, type Updater } from '@tanstack/svelte-table';

interface User { id: string; name: string; email: string; role: string; lastActive: string }

const { users }: { users: User[] } = $props();

const _features = tableFeatures({ rowSortingFeature, columnFilteringFeature, globalFilteringFeature, rowPaginationFeature });

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
    get data() { return users; },
    columns,
    _rowModels: {
        coreRowModel: createCoreRowModel(),
        sortedRowModel: createSortedRowModel(sortFns),
        filteredRowModel: createFilteredRowModel(filterFns),
        paginatedRowModel: createPaginatedRowModel()
    },
    state: { get sorting() { return sorting }, get globalFilter() { return globalFilter }, get pagination() { return pagination } },
    onSortingChange: (upd: Updater<SortingState>) => sorting = typeof upd === 'function' ? upd(sorting) : upd,
    onGlobalFilterChange: (v: Updater<string>) => globalFilter = (typeof v === 'function' ? v(globalFilter) : v ?? '') as string,
    onPaginationChange: (upd: Updater<PaginationState>) => pagination = typeof upd === 'function' ? upd(pagination) : upd
});
```

Render the header via `table.getHeaderGroups()`, the body via `table.getRowModel().rows`, and a pager via `table.setPageIndex()`.

### Connecting it to the capstone

The users table is the most interactive surface in the dashboard. `shared-state-store` lets multiple components read the current `globalFilter`. `optimistic-ui-pattern` removes rows from the underlying `users` array before the server confirms.
