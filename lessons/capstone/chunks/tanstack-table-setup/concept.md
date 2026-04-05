---
chunk: tanstack-table-setup
level: 2
penalty: medium
---

# TanStack Table Setup — Level 2 Concept Reveal

TanStack Table is a framework-agnostic library that supplies the logic for data tables — sorting, filtering, grouping, pagination, virtualisation — without ever rendering a `<table>` itself. The Svelte adapter is a thin wrapper around the core that exposes the table instance as a reactive object.

### The three pieces

1. **Types.** The row type — in the capstone, `User`. Column definitions are `ColumnDef<User>`.
2. **Options.** A plain object: `columns`, `data`, feature row models.
3. **Instance.** The result of `createSvelteTable(options)` — an object whose methods return the current sorted, filtered, paginated rows.

### Pseudocode

```
import { createSvelteTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, type ColumnDef } from '@tanstack/svelte-table';

interface User { id: string; name: string; email: string; role: string; lastActive: string }

const { users }: { users: User[] } = $props();

let sorting = $state<SortingState>([]);
let globalFilter = $state<string>('');
let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });

const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'lastActive', header: 'Last active' }
];

const table = createSvelteTable({
    get data() { return users; },
    get columns() { return columns; },
    state: { get sorting() { return sorting }, get globalFilter() { return globalFilter }, get pagination() { return pagination } },
    onSortingChange: (upd) => sorting = typeof upd === 'function' ? upd(sorting) : upd,
    onGlobalFilterChange: (v) => globalFilter = v,
    onPaginationChange: (upd) => pagination = typeof upd === 'function' ? upd(pagination) : upd,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
});
```

Render the header via `table.getHeaderGroups()`, the body via `table.getRowModel().rows`, and a pager via `table.setPageIndex()`.

### Connecting it to the capstone

The users table is the most interactive surface in the dashboard. `shared-state-store` lets multiple components read the current `globalFilter`. `optimistic-ui-pattern` removes rows from the underlying `users` array before the server confirms.
