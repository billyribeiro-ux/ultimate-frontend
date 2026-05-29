---
chunk: tanstack-table-setup
level: 1
penalty: 0
---

# TanStack Table Setup — Level 1 Hint (free)

TanStack Table is **headless**: it does not render any UI. It gives you state and derived helpers — rows, header groups, filtered rows, sorted rows, paginated rows — and you render them however you want with Svelte. This is a feature, not a gap: it keeps the library small and lets you fully own the markup and the styling.

Four things to assemble:

1. **Features.** Declare which features the table uses with `tableFeatures({ ... })` — for the users table that is `rowSortingFeature`, `columnFilteringFeature`, `globalFilteringFeature`, and `rowPaginationFeature`. Declare it once, statically, outside the component.
2. **Columns.** A typed `ColumnDef<typeof _features, User>[]`. Each column has an `accessorKey` (or an `accessorFn`) and an optional `header`.
3. **Options.** An object with `_features`, `columns`, `data` (a reactive getter), and a `_rowModels` object holding the factory calls you want turned on (`createCoreRowModel()`, `createSortedRowModel(sortFns)`, `createFilteredRowModel(filterFns)`, `createPaginatedRowModel()`).
4. **Table instance.** Call `createTable(options)` — the 2026 Svelte adapter is tiny, it just wires TanStack Table's core to `$state` so changes to sort/filter/pagination are reactive. The returned table is already reactive: no `fromStore`, no `$` prefix.

The rest is pure Svelte: `{#each table.getHeaderGroups() as hg}` and `{#each hg.headers as header}` for the head, `{#each table.getRowModel().rows as row}` for the body.
