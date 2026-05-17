---
module: 11
lesson: 11.9
title: TanStack Table with TypeScript — advanced typing
duration: 55 minutes
prerequisites:
  - Lesson 11.8 — sort, filter, pagination
  - Module 3 — TypeScript interfaces for props
learning_objectives:
  - Use ColumnDef<T, V> to type both the row and the accessor value
  - Create a typed row-selection state with RowSelectionState
  - Plug a custom Svelte component as a cell renderer via flexRender
  - Add a custom column meta interface for per-column UI hints
  - Write a generic MembersTable wrapper that accepts any row type
status: ready
---

# Lesson 11.9 — TanStack Table with TypeScript — advanced typing

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This lesson turns the table from Lesson 11.8 into something you could refactor without fear. Every column, cell, and piece of state is fully typed.

## 1. Concept — Typing a library that is already generic

### 1.1 The two generics that matter

TanStack Table's core types are parameterised over two generic arguments you will see everywhere: **`TData`** (the shape of one row) and **`TValue`** (the type of the value returned by the accessor for a specific column). For a table of members where the accessor reads `row.role`, `TData` is `Member` and `TValue` is `'admin' | 'editor' | 'viewer'`.

Most of the time you only need to supply `TData`. The library infers `TValue` from the accessor. But knowing both generics exist lets you write cell components that are typed against the exact value they render, not a loose `unknown`.

```ts
import type { ColumnDef } from '@tanstack/svelte-table';
import type { Member } from '$lib/stores/members';

const columns: ColumnDef<Member>[] = [
	{ accessorKey: 'name', header: 'Name' },
	{ accessorKey: 'role', header: 'Role' }
];
```

Here `TData = Member`. For `accessorKey: 'role'`, the library infers `TValue = Member['role']`. When you write a custom cell for the role column, you get that precise type.

### 1.2 Custom cell renderers — the flexRender bridge

TanStack stores the cell renderer as a function or a Svelte component reference. To actually render it, you pass the reference and the cell context to `flexRender`, which returns a component-and-props pair you hand to `<svelte:component>`:

```svelte
<script lang="ts">
	import { flexRender } from '@tanstack/svelte-table';
	import RoleBadge from './RoleBadge.svelte';
	import type { ColumnDef, CellContext } from '@tanstack/svelte-table';
	import type { Member } from '$lib/stores/members';

	const columns: ColumnDef<Member>[] = [
		{ accessorKey: 'name', header: 'Name' },
		{
			accessorKey: 'role',
			header: 'Role',
			cell: (info: CellContext<Member, Member['role']>) => ({
				Component: RoleBadge,
				props: { role: info.getValue() }
			})
		}
	];
</script>

<td>
	{@const rendered = flexRender(cell.column.columnDef.cell, cell.getContext())}
	<svelte:component this={rendered} />
</td>
```

The fully typed `CellContext<Member, Member['role']>` gives you `info.getValue()` returning the exact union `'admin' | 'editor' | 'viewer'`, which you then pass to the `RoleBadge` component whose prop is typed the same way. No casts, no `any`, no `unknown`.

### 1.3 Row selection — typed and reactive

Row selection uses a single piece of state: `RowSelectionState`, which is a record mapping row IDs to booleans.

```ts
import type { RowSelectionState } from '@tanstack/svelte-table';

let rowSelection = $state<RowSelectionState>({});

const table = createSvelteTable<Member>({
	get data() { return members; },
	columns,
	state: {
		get rowSelection() { return rowSelection; }
	},
	onRowSelectionChange: (updater) => {
		rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
	},
	enableRowSelection: true,
	getCoreRowModel: getCoreRowModel()
});
```

Each row exposes `row.getIsSelected()` and `row.getToggleSelectedHandler()`. A header-level "select all" checkbox uses `table.getIsAllRowsSelected()` and `table.getToggleAllRowsSelectedHandler()`. All four return primitives or event handlers typed against `Member`, so you cannot accidentally mix selection state from two different tables.

### 1.4 Custom column meta

Sometimes a column needs extra information the library does not know about — a right-align flag, a CSS class name, a custom empty-state label. TanStack supports this through a `meta` property on `ColumnDef`, but to get typed access you must *augment* the library's `ColumnMeta` interface via TypeScript module augmentation:

```ts
// src/lib/types/table-meta.ts
import '@tanstack/svelte-table';

declare module '@tanstack/svelte-table' {
	interface ColumnMeta<TData extends unknown, TValue> {
		align?: 'start' | 'center' | 'end';
		truncate?: boolean;
	}
}
```

Once that file is imported anywhere in the app (for example, from `src/app.d.ts`), every `columnDef.meta` access is typed:

```ts
const columns: ColumnDef<Member>[] = [
	{
		accessorKey: 'signals',
		header: 'Signals',
		meta: { align: 'end' }
	}
];
```

And in the markup:

```svelte
<td style:text-align={cell.column.columnDef.meta?.align ?? 'start'}>
```

TypeScript knows that `meta.align` is `'start' | 'center' | 'end' | undefined`. No cast.

### 1.5 A generic table wrapper

Once the patterns above feel comfortable, you can write a generic `<DataTable>` component that takes any row type and delegates column definitions to the caller:

```svelte
<!-- DataTable.svelte -->
<script lang="ts" generics="T">
	import {
		createSvelteTable,
		getCoreRowModel,
		flexRender,
		type ColumnDef
	} from '@tanstack/svelte-table';

	interface Props {
		data: T[];
		columns: ColumnDef<T>[];
	}

	const { data, columns }: Props = $props();

	const table = createSvelteTable<T>({
		get data() { return data; },
		columns,
		getCoreRowModel: getCoreRowModel()
	});
</script>

<table>
	<!-- header + body loops identical to previous lessons -->
</table>
```

The `generics="T"` attribute on the `<script>` tag is a Svelte 5 feature that lets a component be parameterised over a type variable. Every consumer passes its own `T`:

```svelte
<DataTable data={members} columns={memberColumns} />
<DataTable data={products} columns={productColumns} />
```

Each use gets its own fully-typed table without a single cast. That is the ceiling of TanStack Table plus Svelte 5 plus strict TypeScript — and it is reachable in about 30 lines of code.

### 1.6 Why any of this matters

TypeScript's job is to tell you about a mistake at 9:15 AM instead of at 3:30 AM. The generic patterns above do exactly that. Mistype a column name, and the IDE lights up immediately. Change a field's type in `Member`, and every cell component that reads it is flagged. Remove a column from the interface, and every dependent cell is a compile error. This is the entire argument for TypeScript-strict, and TanStack Table is designed to pay it off.

## Deep Dive

**Why this matters at scale.** Generics flow from data type through column defs to cell renderers. ColumnDef<Employee> constrains accessor keys to actual Employee properties.

**The mental model.** createColumnHelper<T>() provides typed accessor methods. columnHelper.accessor('name', {...}) is type-safe — 'naem' is a compile error.

**Edge cases.** Custom cell renderers receive typed info objects. info.getValue() returns the typed value. Custom header renderers receive the column's meta type.

**Performance implications.** Type checking is build-time only. Zero runtime cost. The generics prevent a class of bugs that would otherwise surface as undefined values in cells.

**Connection to other modules.** Module 11.7-8 provide runtime foundation. Module 9A's auto-types follow a similar generic flow.

## 2. Style it — Badges, alignment, and selection highlights

The mini-build renders a custom `<RoleBadge>` in the role column, right-aligned numerics via the `meta.align` column meta, and a left-border highlight on selected rows. Per-page accent: `oklch(70% 0.2 320)` (magenta).

- Role badges use `border-radius: var(--radius-full)` and per-role OKLCH hues.
- Selected rows get `box-shadow: inset 4px 0 0 var(--color-brand)`.
- The custom component respects `prefers-reduced-motion` by disabling its hover transition.

## 3. Interact — Selecting rows and reading the typed result

A "show selection" panel below the table prints the currently-selected `Member` objects, pulled from `table.getFilteredSelectedRowModel().rows.map(r => r.original)`. Because `r.original` is typed as `Member`, the displayed JSON is typed end-to-end.

## 4. Mini-build — A typed, selectable members table with custom cells

**File:** `src/routes/modules/11-state/09-tanstack-typescript/+page.svelte`

Extends 11.8 with: a custom `<RoleBadge>` cell component, a typed selection state, the `ColumnMeta` augmentation for alignment, and a panel that reads the typed selection.

### DevTools moment

Open the TypeScript language server in your editor. Hover over `table.getFilteredSelectedRowModel().rows[0].original` — the tooltip shows `Member`. Hover over `info.getValue()` inside the role cell — the tooltip shows `'admin' | 'editor' | 'viewer'`. Delete a field from `Member` in `$lib/stores/members.ts` and watch every place that reads the deleted field light up with errors. That is the refactor safety TypeScript-strict is designed to give you.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What do <code>TData</code> and <code>TValue</code> mean on ColumnDef?</summary>

`TData` is the type of one row; `TValue` is the type of the value an accessor returns for a particular column. For a `role` accessor on `Member`, `TValue` is `'admin' | 'editor' | 'viewer'`. Most of the time you only supply `TData` and the library infers `TValue`.
</details>

<details>
<summary><strong>Q2.</strong> Why does custom column meta require module augmentation?</summary>

`ColumnDef.meta` is typed as `ColumnMeta<TData, TValue>` inside the library. To add your own fields with types that the library can see, you reopen the `ColumnMeta` interface via `declare module '@tanstack/svelte-table'`. That tells the TypeScript compiler your fields are part of the type, which gives you autocomplete and refactor safety.
</details>

<details>
<summary><strong>Q3.</strong> How does <code>generics="T"</code> on a Svelte <code>&lt;script&gt;</code> tag help a table component?</summary>

It turns the component itself into a generic, parameterised over the row type. A single `DataTable` component can now be reused across every dataset in the app without losing type safety. Each caller passes its own `T`, and the columns, rows, and cells are all typed against that `T`.
</details>

<details>
<summary><strong>Q4.</strong> Why is the custom RoleBadge component passed via <code>flexRender</code> rather than directly in the template?</summary>

TanStack stores the cell renderer on the column definition so that the same renderer is applied consistently regardless of whether you render the table with a Svelte loop, a debugger view, or a test. `flexRender` is the bridge that turns the stored reference into something `<svelte:component>` can mount.
</details>

<details>
<summary><strong>Q5.</strong> What TypeScript safety do you lose if you declare <code>const columns = [...]</code> without a type annotation?</summary>

TypeScript infers the array as a union of the exact column shapes you wrote. Autocomplete on `accessorKey` still works, but methods like `table.getColumn('name')` return `Column<unknown>` and every downstream cell loses its `TData` connection. Always annotate with `ColumnDef<Member>[]`.
</details>

## 6. Common mistakes

- **Omitting the `<T>` on `createSvelteTable<T>(...)`.** Without it, every row in the body is typed as `unknown`.
- **Forgetting to import the module-augmentation file.** Declaring the augmentation does nothing unless some module actually imports the file. Hook it into `src/app.d.ts` or a central barrel file.
- **Casting `row.original` instead of typing the table.** If you find yourself writing `row.original as Member`, you missed a generic somewhere. Fix the source of the `unknown`, not the symptom.
- **Mixing `enableRowSelection: false` with a selection state.** TanStack silently ignores the state. If selection is not working, check that you enabled it.

## 7. What's next

Lesson 11.10 closes Module 11 with the optimistic UI pattern — updating the client immediately and rolling back if the server rejects the change.
