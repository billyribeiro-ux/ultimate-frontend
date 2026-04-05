---
chunk: tanstack-table-setup
level: 1
penalty: 0
---

# TanStack Table Setup — Level 1 Hint (free)

TanStack Table is **headless**: it does not render any UI. It gives you state and derived helpers — rows, header groups, filtered rows, sorted rows, paginated rows — and you render them however you want with Svelte. This is a feature, not a gap: it keeps the library small and lets you fully own the markup and the styling.

Three things to assemble:

1. **Columns.** A typed `ColumnDef<User>[]`. Each column has an `accessorKey` (or an `accessorFn`) and an optional `header`.
2. **Options.** An object with `columns`, `data`, and the feature models you want turned on (`getCoreRowModel`, `getSortedRowModel`, `getFilteredRowModel`, `getPaginationRowModel`).
3. **Table instance.** Call `createSvelteTable(options)` — the 2026 Svelte adapter is tiny, it just wires TanStack Table's core to `$state` so changes to sort/filter/pagination are reactive.

The rest is pure Svelte: `{#each table.getHeaderGroups() as hg}` and `{#each hg.headers as header}` for the head, `{#each table.getRowModel().rows as row}` for the body.
