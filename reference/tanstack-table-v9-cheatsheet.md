# TanStack Table v9 + Svelte 5 Cheat Sheet

## Core Imports

```ts
import {
  createTable,
  tableFeatures,
  createCoreRowModel,
  createSortedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createGroupedRowModel,
} from '@tanstack/svelte-table';

import type { ColumnDef, TableFeatures } from '@tanstack/svelte-table';
```

## Feature Setup

```ts
// Declare which features your table uses
const features = tableFeatures({
  columnVisibilityFeature,
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  columnPinningFeature,
  rowSelectionFeature,
  groupingFeature,
});
```

## Creating a Table

```ts
type Features = typeof features;

let sorting = $state<SortingState>([]);
let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
let globalFilter = $state('');

const table = createTable({
  _features: features,
  _rowModels: {
    coreRowModel: createCoreRowModel(),
    sortedRowModel: createSortedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
  },
  columns,
  data: () => items,           // reactive getter
  state: {
    get sorting() { return sorting; },
    get pagination() { return pagination; },
    get globalFilter() { return globalFilter; },
  },
  onSortingChange: (updater) => {
    sorting = typeof updater === 'function' ? updater(sorting) : updater;
  },
  onPaginationChange: (updater) => {
    pagination = typeof updater === 'function' ? updater(pagination) : updater;
  },
  onGlobalFilterChange: (updater) => {
    globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
  },
});
```

## Column Definitions

```ts
const columns: ColumnDef<Features, User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'email',
    header: () => 'Email',
    cell: (info) => info.getValue<string>(),
    enableSorting: true,
  },
  {
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    id: 'fullName',
    header: 'Full Name',
  },
  {
    id: 'actions',
    header: '',
    cell: (info) => info.row.original, // access raw row data
    enableSorting: false,
  },
];
```

## State Binding Pattern

| State | Type | Callback |
|-------|------|----------|
| `sorting` | `SortingState` (array of `{ id, desc }`) | `onSortingChange` |
| `pagination` | `{ pageIndex: number, pageSize: number }` | `onPaginationChange` |
| `columnFilters` | `ColumnFiltersState` | `onColumnFiltersChange` |
| `globalFilter` | `string` | `onGlobalFilterChange` |
| `rowSelection` | `Record<string, boolean>` | `onRowSelectionChange` |
| `columnVisibility` | `Record<string, boolean>` | `onColumnVisibilityChange` |
| `grouping` | `string[]` | `onGroupingChange` |

## Row Models

| Row Model | Factory | Purpose |
|-----------|---------|---------|
| Core | `createCoreRowModel()` | Base rows from data (always required) |
| Sorted | `createSortedRowModel()` | Apply sorting state |
| Filtered | `createFilteredRowModel()` | Apply column/global filters |
| Paginated | `createPaginatedRowModel()` | Slice to current page |
| Grouped | `createGroupedRowModel()` | Group rows by column values |

## Template Patterns

```svelte
<table>
  <thead>
    {#each table.getHeaderGroups() as headerGroup}
      <tr>
        {#each headerGroup.headers as header}
          <th
            class:sortable={header.column.getCanSort()}
            onclick={header.column.getToggleSortingHandler()}
          >
            {#if !header.isPlaceholder}
              <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
              {#if header.column.getIsSorted() === 'asc'}↑
              {:else if header.column.getIsSorted() === 'desc'}↓
              {/if}
            {/if}
          </th>
        {/each}
      </tr>
    {/each}
  </thead>
  <tbody>
    {#each table.getRowModel().rows as row}
      <tr>
        {#each row.getVisibleCells() as cell}
          <td>
            <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
```

## Pagination Controls

```svelte
<button onclick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>
  «
</button>
<button onclick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
  ‹
</button>
<span>
  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
</span>
<button onclick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
  ›
</button>
<button onclick={() => table.lastPage()} disabled={!table.getCanNextPage()}>
  »
</button>
```

## Reactive State Access

```ts
// Read any table state reactively in Svelte 5
table.getState().sorting          // current sorting
table.getState().pagination       // current page info
table.getState().globalFilter     // current search term
table.getRowModel().rows.length   // visible row count
table.getFilteredRowModel().rows.length // total filtered (before pagination)
```

## FlexRender Component

```svelte
<!-- Required for rendering column defs that can be strings, functions, or components -->
<script lang="ts">
  import { FlexRender } from '@tanstack/svelte-table';
</script>

<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
```

## Common Mistakes

- **Forgetting `createCoreRowModel()`** — table won't render any rows without the core row model.
- **Passing `data` directly instead of a getter** — use `data: () => items` for reactivity, not `data: items`.
- **Not handling the updater function pattern** — `onXChange` receives either a value or an updater function; check `typeof`.
- **Missing `_features` declaration** — features must be declared upfront; adding them later won't register.
- **Using `row.original` when you need `getValue()`** — `getValue()` respects accessors; `original` is raw data.
- **Not importing FlexRender** — cell/header rendering requires FlexRender for dynamic content.
- **Sorting without `createSortedRowModel()`** — sorting state updates but rows stay unsorted without the model.
- **Accessing `table.getPageCount()` without pagination model** — returns 0 without `createPaginatedRowModel()`.
