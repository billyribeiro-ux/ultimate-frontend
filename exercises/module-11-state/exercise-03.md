---
module: 11
exercise: 3
title: TanStack Table Feature
difficulty: advanced
estimated_time: 30
skills_tested:
  - TanStack Table Svelte adapter
  - column definitions
  - sorting and filtering
  - typed accessors
---

# Exercise 11.3 — TanStack Table Feature

## Brief

Build a sortable, filterable data table using TanStack Table's Svelte adapter. The table displays a list of employees with typed column definitions, clickable sort headers, and a search input that filters across all columns.

## Requirements

1. Install and configure `@tanstack/svelte-table` with typed column definitions
2. Define an `Employee` interface with `id`, `name`, `department`, `role`, `salary`, and `startDate`
3. Create at least 8 employee rows of sample data
4. Implement column sorting — clicking a header toggles asc/desc/none
5. Implement a global filter input that searches across name, department, and role
6. Format the salary column with `Intl.NumberFormat`
7. Display sort direction indicators (arrows) in the header
8. All table styles use PE7 tokens with proper alignment (numbers right-aligned)

## Constraints

- Use TanStack Table's official Svelte adapter
- All column definitions must be typed with `ColumnDef<Employee>`
- No custom sort logic — use TanStack's built-in sorting
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Import `createSvelteTable` and `getCoreRowModel` from `@tanstack/svelte-table`. Define columns with `columnHelper.accessor()` for typed access. The table instance provides `getHeaderGroups()` and `getRowModel()` for rendering.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Enable sorting with `getSortedRowModel()` and filtering with `getFilteredRowModel()`. The table state manages sort and filter internally. Use `header.column.getToggleSortingHandler()` on header clicks and `table.setGlobalFilter()` for the search input.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  import { createSvelteTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, createColumnHelper } from '@tanstack/svelte-table';

  const columnHelper = createColumnHelper<Employee>();
  const columns = [
    columnHelper.accessor('name', { header: 'Name' }),
    columnHelper.accessor('salary', { header: 'Salary', cell: (info) => formatter.format(info.getValue()) })
  ];
</script>
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```svelte
<!-- src/routes/employees/+page.svelte -->
<script lang="ts">
  import {
    createSvelteTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper
  } from '@tanstack/svelte-table';
  import type { SortingState } from '@tanstack/svelte-table';

  interface Employee {
    id: number;
    name: string;
    department: string;
    role: string;
    salary: number;
    startDate: string;
  }

  const data: Employee[] = [
    { id: 1, name: 'Ada Lovelace', department: 'Engineering', role: 'Principal', salary: 195000, startDate: '2020-03-15' },
    { id: 2, name: 'Grace Hopper', department: 'Engineering', role: 'Staff', salary: 175000, startDate: '2019-07-01' },
    { id: 3, name: 'Alan Turing', department: 'Security', role: 'Senior', salary: 155000, startDate: '2021-01-10' },
    { id: 4, name: 'Margaret Hamilton', department: 'Engineering', role: 'Manager', salary: 185000, startDate: '2018-11-20' },
    { id: 5, name: 'Hedy Lamarr', department: 'Product', role: 'Lead', salary: 165000, startDate: '2022-04-05' },
    { id: 6, name: 'Katherine Johnson', department: 'Data', role: 'Senior', salary: 150000, startDate: '2021-06-15' },
    { id: 7, name: 'Linus Torvalds', department: 'Infrastructure', role: 'Principal', salary: 200000, startDate: '2017-09-01' },
    { id: 8, name: 'Tim Berners-Lee', department: 'Platform', role: 'Staff', salary: 180000, startDate: '2020-01-12' }
  ];

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const columnHelper = createColumnHelper<Employee>();

  const columns = [
    columnHelper.accessor('name', { header: 'Name', enableGlobalFilter: true }),
    columnHelper.accessor('department', { header: 'Department', enableGlobalFilter: true }),
    columnHelper.accessor('role', { header: 'Role', enableGlobalFilter: true }),
    columnHelper.accessor('salary', {
      header: 'Salary',
      cell: (info) => formatter.format(info.getValue()),
      enableGlobalFilter: false
    }),
    columnHelper.accessor('startDate', {
      header: 'Start Date',
      cell: (info) => new Date(info.getValue()).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      enableGlobalFilter: false
    })
  ];

  let sorting = $state<SortingState>([]);
  let globalFilter = $state('');

  const table = createSvelteTable({
    get data() { return data; },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      get sorting() { return sorting; },
      get globalFilter() { return globalFilter; }
    },
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater;
    },
    onGlobalFilterChange: (updater) => {
      globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
    }
  });
</script>

<div class="table-page">
  <header>
    <h1>Employees</h1>
    <input
      type="search"
      placeholder="Search employees..."
      bind:value={globalFilter}
      class="search-input"
    />
  </header>

  <div class="table-wrapper">
    <table>
      <thead>
        {#each table.getHeaderGroups() as headerGroup}
          <tr>
            {#each headerGroup.headers as header}
              <th
                class:sortable={header.column.getCanSort()}
                class:numeric={header.id === 'salary'}
                onclick={header.column.getToggleSortingHandler()}
              >
                {#if !header.isPlaceholder}
                  <div class="header-cell">
                    <svelte:component this={flexRender(header.column.columnDef.header, header.getContext())} />
                    {#if header.column.getIsSorted() === 'asc'}
                      <span class="sort-indicator">&#9650;</span>
                    {:else if header.column.getIsSorted() === 'desc'}
                      <span class="sort-indicator">&#9660;</span>
                    {/if}
                  </div>
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
              <td class:numeric={cell.column.id === 'salary'}>
                <svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <p class="row-count">{table.getFilteredRowModel().rows.length} of {data.length} employees</p>
</div>

<style>
  .table-page { max-inline-size: 56rem; margin-inline: auto; padding: var(--space-lg); }
  header { display: flex; justify-content: space-between; align-items: center; margin-block-end: var(--space-lg); }
  h1 { font-size: var(--text-2xl); }
  .search-input { padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-sm); background: var(--color-surface-1); color: var(--color-text); inline-size: 16rem; }
  .table-wrapper { overflow-x: auto; }
  table { inline-size: 100%; border-collapse: collapse; }
  th, td { padding: var(--space-sm) var(--space-md); text-align: start; border-block-end: 1px solid var(--color-border); font-size: var(--text-sm); }
  th { font-weight: 600; color: var(--color-text-muted); background: var(--color-surface-2); }
  th.sortable { cursor: pointer; user-select: none; }
  th.sortable:hover { color: var(--color-text); }
  .header-cell { display: flex; align-items: center; gap: var(--space-xs); }
  .sort-indicator { font-size: var(--text-xs); color: oklch(55% 0.2 250); }
  .numeric { text-align: end; }
  tr:hover td { background: var(--color-surface-2); }
  .row-count { margin-block-start: var(--space-sm); font-size: var(--text-sm); color: var(--color-text-muted); }
</style>
```

### Explanation

TanStack Table is a headless table library — it manages sorting, filtering, pagination, and selection logic, while you write all the markup and styles. The `createSvelteTable` function takes column definitions and row models, then provides reactive helpers like `getHeaderGroups()` and `getRowModel()`. State is managed outside the table via reactive `$state` variables, connected through the `state` and `onChange` callbacks. This separation gives you complete control over the UI while the library handles the complex table interactions. The column helper provides type-safe accessors that prevent referencing non-existent fields.
</details>
