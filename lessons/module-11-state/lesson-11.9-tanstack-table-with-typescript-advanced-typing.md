---
module: 11
lesson: 11.9
title: TanStack Table with TypeScript — advanced typing
duration: 55 minutes
prerequisites:
  - Lesson 11.8 — sort, filter, pagination
  - Module 3 — TypeScript interfaces for props
learning_objectives:
  - Use ColumnDef<Features, T> to type the features, the row, and the accessor value
  - Create a typed row-selection state with RowSelectionState
  - Plug a custom Svelte component as a cell renderer via renderComponent + <FlexRender>
  - Add a custom column meta interface for per-column UI hints
  - Write a generic MembersTable wrapper that accepts any row type
status: ready
---

# Lesson 11.9 — TanStack Table with TypeScript — advanced typing

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This lesson turns the table from Lesson 11.8 into something you could refactor without fear. Every column, cell, and piece of state is fully typed.

## 1. Concept — Typing a library that is already generic

### 1.1 The two generics that matter

In v9, `ColumnDef` is parameterised over three generic arguments, two of which you will use constantly: **`TFeatures`** (the set of enabled features, from `tableFeatures({ ... })`), **`TData`** (the shape of one row), and an inferred **`TValue`** (the type of the value returned by the accessor for a specific column). For a table of members where the accessor reads `row.role`, `TData` is `Member` and `TValue` is `'admin' | 'editor' | 'viewer'`.

Most of the time you only supply `TFeatures` and `TData`. The library infers `TValue` from the accessor. But knowing the value generic exists lets you write cell components that are typed against the exact value they render, not a loose `unknown`.

```ts
import {
	tableFeatures,
	columnVisibilityFeature,
	rowSelectionFeature,
	type ColumnDef
} from '@tanstack/svelte-table';
import type { Member } from '$lib/stores/members';

const _features = tableFeatures({ columnVisibilityFeature, rowSelectionFeature });
type Features = typeof _features;

const columns: ColumnDef<Features, Member>[] = [
	{ accessorKey: 'name', header: 'Name' },
	{ accessorKey: 'role', header: 'Role' }
];
```

Here `TFeatures = Features` and `TData = Member`. For `accessorKey: 'role'`, the library infers `TValue = Member['role']`. When you write a custom cell for the role column, you get that precise type.

### 1.2 Custom cell renderers — the FlexRender bridge

TanStack stores the cell renderer as a string, a Svelte component, or a snippet. In the v9 Svelte adapter you mark a component renderer with `renderComponent(Component, props)` inside the column definition, then render whatever the column produced with the adapter's `<FlexRender>` component — passing it the `content` (the column's `cell`/`header` template) and the cell's `context`. `<FlexRender>` decides at runtime whether to mount a string, a component, or a snippet, so you never reach for the legacy `<svelte:component>` tag:

```svelte
<script lang="ts">
	import { FlexRender, renderComponent } from '@tanstack/svelte-table';
	import RoleBadge from './RoleBadge.svelte';
	import type { ColumnDef, CellContext } from '@tanstack/svelte-table';
	import type { Member } from '$lib/stores/members';

	const columns: ColumnDef<Features, Member>[] = [
		{ accessorKey: 'name', header: 'Name' },
		{
			accessorKey: 'role',
			header: 'Role',
			cell: (info: CellContext<Features, Member, Member['role']>) =>
				renderComponent(RoleBadge, { role: info.getValue() })
		}
	];
</script>

<td>
	<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
</td>
```

The fully typed `CellContext<Features, Member, Member['role']>` gives you `info.getValue()` returning the exact union `'admin' | 'editor' | 'viewer'`, which you then pass to the `RoleBadge` component whose prop is typed the same way. No casts, no `any`, no `unknown`.

### 1.3 Row selection — typed and reactive

Row selection uses a single piece of state: `RowSelectionState`, which is a record mapping row IDs to booleans.

```ts
import {
	createTable,
	createCoreRowModel,
	type RowSelectionState,
	type Updater
} from '@tanstack/svelte-table';

let rowSelection = $state<RowSelectionState>({});

const table = createTable({
	_features,
	get data() { return members; },
	columns,
	_rowModels: { coreRowModel: createCoreRowModel() },
	state: {
		get rowSelection() { return rowSelection; }
	},
	onRowSelectionChange: (updater: Updater<RowSelectionState>) => {
		rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
	},
	enableRowSelection: true
});
```

Each row exposes `row.getIsSelected()` and `row.getToggleSelectedHandler()`. A header-level "select all" checkbox uses `table.getIsAllRowsSelected()` and `table.getToggleAllRowsSelectedHandler()`. All four return primitives or event handlers typed against `Member`, so you cannot accidentally mix selection state from two different tables.

### 1.4 Custom column meta

Sometimes a column needs extra information the library does not know about — a right-align flag, a CSS class name, a custom empty-state label. TanStack supports this through a `meta` property on `ColumnDef`, but to get typed access you must *augment* the library's `ColumnMeta` interface via TypeScript module augmentation:

```ts
// src/lib/types/table-meta.ts
import '@tanstack/svelte-table';

declare module '@tanstack/svelte-table' {
	interface ColumnMeta<TFeatures extends TableFeatures, TData extends RowData, TValue> {
		align?: 'start' | 'center' | 'end';
		truncate?: boolean;
	}
}
```

Once that file is imported anywhere in the app (for example, from `src/app.d.ts`), every `columnDef.meta` access is typed:

```ts
const columns: ColumnDef<Features, Member>[] = [
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
		createTable,
		tableFeatures,
		columnVisibilityFeature,
		createCoreRowModel,
		type ColumnDef
	} from '@tanstack/svelte-table';

	const _features = tableFeatures({ columnVisibilityFeature });

	interface Props {
		data: T[];
		columns: ColumnDef<typeof _features, T>[];
	}

	const { data, columns }: Props = $props();

	const table = createTable({
		_features,
		get data() { return data; },
		columns,
		_rowModels: { coreRowModel: createCoreRowModel() }
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

### 1.x What TanStack Table does under the hood — the generic type pipeline

TanStack Table's TypeScript architecture uses generic type parameters — the features set and `TData` — that flow through the entire API:

```ts
const _features = tableFeatures({ columnVisibilityFeature });
type Features = typeof _features;

const table = createTable({
    _features,
    get data() { return users; },   // User[]
    columns: columnDefs,            // ColumnDef<Features, User>[]
    _rowModels: { coreRowModel: createCoreRowModel() }
});

// Every API method is typed against User:
table.getRowModel().rows  // Row<Features, User>[]
row.original              // User
cell.getValue()           // inferred from column accessor
```

The `ColumnDef<Features, TData>` type constrains column accessors to valid keys of `TData`. If you define `accessorKey: 'name'`, TypeScript checks that `User` has a `name` property. If you define `accessorFn: (row) => row.email`, `row` is typed as `User` and the return type determines the cell's value type.

### 1.x Comparison: TanStack Table typing approaches

| Approach | Type safety | Flexibility | Verbosity |
| --- | --- | --- | --- |
| `accessorKey: 'name'` | Full (key must exist on TData) | Low (flat access only) | Minimal |
| `accessorFn: (row) => row.address.city` | Full (row is typed as TData) | High (nested, computed) | Low |
| `cell: (info) => info.getValue()` | Partial (getValue returns unknown without explicit typing) | Maximum | Higher |
| `createColumnHelper<Features, TData>().accessor('name', {...})` | Full (helper preserves types) | Medium | Minimal |

### 1.x Common interview question

**Q: "How does TanStack Table achieve type safety in column definitions?"**

**Model answer:** TanStack Table uses generic type parameters — the enabled features set and `TData` — that flow from the table creation to every column definition. When you create a table with `createTable({ _features, ... })` and type columns as `ColumnDef<Features, User>`, the type constrains `accessorKey` to valid keys of `User` and types `accessorFn` with `(row: User) => T`. The column helper provides even stronger inference: `createColumnHelper<Features, User>().accessor('name', { header: 'Name' })` infers that the column's value type is `string` (from `User.name`), so the `cell` renderer receives a typed value. If you rename a field on `User`, every column definition that references the old name gets a compile error. This end-to-end typing from data model to rendered cell is what makes TanStack Table's TypeScript integration exceptional.

## Deep Dive

**Why this matters at scale.** Generics flow from data type through column defs to cell renderers. ColumnDef<Features, Employee> constrains accessor keys to actual Employee properties.

**The mental model.** createColumnHelper<Features, T>() provides typed accessor methods. helper.accessor('name', {...}) is type-safe — 'naem' is a compile error.

**Edge cases.** Custom cell renderers receive typed info objects. info.getValue() returns the typed value. Custom header renderers receive the column's meta type.

**Performance implications.** Type checking is build-time only. Zero runtime cost. The generics prevent a class of bugs that would otherwise surface as undefined values in cells.

**Connection to other modules.** Module 11.7-8 provide runtime foundation. Module 9A's auto-types follow a similar generic flow.


## Going Deeper

- **Svelte docs:** Check the relevant section in the [Svelte documentation](https://svelte.dev/docs).
- **Challenge:** Apply the pattern from this lesson to a real component in your own project. Measure the before and after in terms of code lines and type safety.

## 2. Style it — Badges, alignment, and selection highlights

The mini-build renders a custom `<RoleBadge>` in the role column, right-aligned numerics via the `meta.align` column meta, and a left-border highlight on selected rows. Per-page accent: `oklch(70% 0.2 320)` (magenta).

- Role badges use `border-radius: var(--radius-full)` and per-role OKLCH hues.
- Selected rows get `box-shadow: inset 4px 0 0 var(--color-brand)`.
- The custom component respects `prefers-reduced-motion` by disabling its hover transition.

## 3. Interact — Selecting rows and reading the typed result

A "show selection" panel below the table prints the currently-selected `Member` objects, pulled from `table.getSelectedRowModel().rows.map((row: Row<Features, Member>) => row.original)`. Because `row.original` is typed as `Member`, the displayed JSON is typed end-to-end.

## 4. Mini-build — A typed, selectable members table with custom cells

**File:** `src/routes/modules/11-state/09-tanstack-typescript/+page.svelte`

Extends 11.8 with: a custom `<RoleBadge>` cell component, a typed selection state, the `ColumnMeta` augmentation for alignment, and a panel that reads the typed selection.

### DevTools moment

Open the TypeScript language server in your editor. Hover over `table.getSelectedRowModel().rows[0].original` — the tooltip shows `Member`. Hover over `info.getValue()` inside the role cell — the tooltip shows `'admin' | 'editor' | 'viewer'`. Delete a field from `Member` in `$lib/stores/members.ts` and watch every place that reads the deleted field light up with errors. That is the refactor safety TypeScript-strict is designed to give you.

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
<summary><strong>Q4.</strong> Why is the custom RoleBadge component passed via <code>renderComponent</code> in the column definition rather than placed directly in the template?</summary>

TanStack stores the cell renderer on the column definition so that the same renderer is applied consistently regardless of whether you render the table with a Svelte loop, a debugger view, or a test. The `<FlexRender>` component is the bridge that renders the stored reference — string, component, or snippet — at the point of use.
</details>

<details>
<summary><strong>Q5.</strong> What TypeScript safety do you lose if you declare <code>const columns = [...]</code> without a type annotation?</summary>

TypeScript infers the array as a union of the exact column shapes you wrote. Autocomplete on `accessorKey` still works, but methods like `table.getColumn('name')` return `Column<unknown>` and every downstream cell loses its `TData` connection. Always annotate with `ColumnDef<Features, Member>[]`.
</details>

## 6. Common mistakes

- **Omitting the features/row type on `ColumnDef<Features, Member>[]`.** Without the annotation, every row in the body is typed as `unknown`.
- **Forgetting to import the module-augmentation file.** Declaring the augmentation does nothing unless some module actually imports the file. Hook it into `src/app.d.ts` or a central barrel file.
- **Casting `row.original` instead of typing the table.** If you find yourself writing `row.original as Member`, you missed a generic somewhere. Fix the source of the `unknown`, not the symptom.
- **Mixing `enableRowSelection: false` with a selection state.** TanStack silently ignores the state. If selection is not working, check that you enabled it.

## 7. What's next

Lesson 11.10 closes Module 11 with the optimistic UI pattern — updating the client immediately and rolling back if the server rejects the change.
