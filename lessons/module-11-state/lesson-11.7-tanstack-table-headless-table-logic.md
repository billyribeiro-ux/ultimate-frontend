---
module: 11
lesson: 11.7
title: TanStack Table — headless table logic
duration: 55 minutes
prerequisites:
  - Lesson 11.5 — reactive classes with runes
  - Module 3 — component composition
learning_objectives:
  - Explain what "headless" means and why it is a good fit for Svelte
  - Install @tanstack/svelte-table and import the Svelte 5 adapter
  - Build a typed createSvelteTable instance with columns and data
  - Render headers, rows, and cells from the table's row model
  - Apply PE7 styling without fighting any built-in table styles
status: ready
---

# Lesson 11.7 — TanStack Table — headless table logic

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This lesson opens the three-lesson TanStack Table arc. You will wire up a typed table with no features enabled yet; 11.8 adds sort/filter/pagination; 11.9 pushes the types to their limits.

## 1. Concept — Headless means you write the markup, they write the logic

### 1.1 The problem with "table components"

Every UI kit has a `<DataTable>` component that promises to solve everything. Drop it in, pass an array, get sorting and pagination. It works until you need a custom cell, a custom header, a custom row colour, a custom pagination control, or a custom sort algorithm — and then you discover that the component's markup is baked in and the styling assumptions are wrong for your brand. You end up overriding CSS you did not write, wrestling with props that do not quite fit, and writing more workaround code than it would have taken to build the table from scratch.

The "headless" library pattern inverts the trade-off. A headless library gives you all the *logic* — sorting algorithms, filter engines, pagination bookkeeping, row selection models — and *none* of the markup. You call a single factory function to get back a fully-typed table object, and then you render whatever HTML you want from its data. The library knows nothing about your brand, your tokens, or your spacing. That is the feature, not a gap.

**TanStack Table** is the headless table library for React, Vue, Solid, *and* Svelte 5. It is written by Tanner Linsley, the same author as TanStack Query and TanStack Router. It is widely used, carefully typed, and specifically designed for the pattern above. The Svelte 5 adapter ships as `@tanstack/svelte-table`.

### 1.2 The Svelte 5 adapter in one function

The whole adapter API is one function: `createSvelteTable(options)`. You pass it a configuration object; it returns a reactive table instance that your component reads from.

```ts
import {
	createSvelteTable,
	getCoreRowModel,
	type ColumnDef
} from '@tanstack/svelte-table';
```

A bare-minimum table needs three things:

1. A typed array of rows.
2. A typed array of column definitions.
3. The core row model (the engine that builds the current visible rows from the raw data).

Here is what that looks like for a list of members:

```svelte
<script lang="ts">
	import {
		createSvelteTable,
		getCoreRowModel,
		flexRender,
		type ColumnDef
	} from '@tanstack/svelte-table';
	import { members, type Member } from '$lib/stores/members';

	const columns: ColumnDef<Member>[] = [
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'email', header: 'Email' },
		{ accessorKey: 'role', header: 'Role' },
		{ accessorKey: 'joined', header: 'Joined' }
	];

	const table = createSvelteTable({
		get data() {
			return members;
		},
		columns,
		getCoreRowModel: getCoreRowModel()
	});
</script>
```

Two details to notice. First, `data` is a *getter*, not a static property. TanStack's Svelte 5 adapter expects reactive inputs to be read through getters so that it can re-run the row models when the source changes. If you wrote `data: members` (without the `get`), the table would be frozen to the first reference and would never update when the array mutated. This getter pattern is new in the Svelte 5 adapter and is the single biggest change from the old Svelte 3/4 version of the same library.

Second, `ColumnDef<Member>[]` is the generic type that gives you full auto-complete and type-checking on `accessorKey`. If you write `accessorKey: 'namme'`, TypeScript immediately tells you that `'namme'` is not a key of `Member`. This is the same level of type safety you get from `keyof` in your own code, delivered by the library.

### 1.3 Rendering rows and cells

Once the table exists, rendering it is a matter of reading its methods. The four you need for a basic table:

- `table.getHeaderGroups()` — returns an array of header rows (normally one, unless you use column groups).
- `table.getRowModel().rows` — returns the rows to display.
- Each row has `.getVisibleCells()` — returns the cells for that row.
- Each header and each cell has `.getContext()`, passed to `flexRender()` to produce the rendered value.

```svelte
<table>
	<thead>
		{#each table.getHeaderGroups() as group (group.id)}
			<tr>
				{#each group.headers as header (header.id)}
					<th>
						{#if !header.isPlaceholder}
							<svelte:component
								this={flexRender(header.column.columnDef.header, header.getContext())}
							/>
						{/if}
					</th>
				{/each}
			</tr>
		{/each}
	</thead>
	<tbody>
		{#each table.getRowModel().rows as row (row.id)}
			<tr>
				{#each row.getVisibleCells() as cell (cell.id)}
					<td>
						<svelte:component
							this={flexRender(cell.column.columnDef.cell, cell.getContext())}
						/>
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
```

For the simplest possible case, where the header is a plain string and the cell is the accessed value, `flexRender` handles both. You will see in Lesson 11.9 how to plug in custom Svelte components as cells — for example a "role badge" component — through the same `flexRender` call.

### 1.4 What "no features" means

The table you build in this lesson does exactly one thing: renders its data. No sort, no filter, no pagination. That is deliberate. Before you add those features, you should be comfortable with the bones: the column definitions, the reactive data getter, the header/body rendering loop. Once those feel natural, adding row models (Lesson 11.8) is a one-line change per feature.

### 1.5 Why not write the table yourself?

It is a fair question. For a five-row table, you absolutely should. A handful of `{#each}` blocks and a `items.sort()` call will do the job. You reach for TanStack Table the moment the *combination* of features starts to multiply: sort *and* filter *and* paginate *and* select *and* expand *and* group. Writing those five features by hand, composed correctly so that sorting a filtered page does not lose the selection, is surprisingly hard. TanStack has done the hard work, type-checked the result, and tested it on thousands of consumer codebases. This is exactly what a library is for.

## 2. Style it — PE7 tokens on a raw `<table>`

The mini-build uses a plain HTML `<table>` with PE7 tokens applied directly. Per-page accent: `oklch(72% 0.2 300)` (table purple). Key rules:

- `border-collapse: collapse` with horizontal `border-block-end` on `tr`.
- `padding-inline: var(--space-md); padding-block: var(--space-sm)` on every cell for a comfortable touch target.
- A subtle hover on `tbody tr` that is disabled under `prefers-reduced-motion`.
- The table is wrapped in a `.table-scroll` container with `overflow-x: auto` so it does not break the page on mobile.

## 3. Interact — The reactive data getter

Students add a "shuffle" button that mutates the `members` array (via a local reactive copy). Because `data` is a *getter*, the table re-reads the reference on every dependency change and updates accordingly. Remove the `get` keyword to watch the table go stale — a live demonstration of the reactivity contract.

## 4. Mini-build — A typed members table

**File:** `src/routes/modules/11-state/07-tanstack-table-basics/+page.svelte`

Imports `@tanstack/svelte-table` and the `members` dataset. Defines four columns, creates the table, and renders the headers and rows. Styled with PE7 tokens.

### DevTools moment

Open the Svelte DevTools and inspect the component. You will see a `table` object in the scope — look at `table.getRowModel().rows`. That is what the markup renders. Change `members` (for example, click a shuffle button) and watch the row model re-derive. Now break the `data` getter by replacing `get data() { return members; }` with `data: members`. Reload — the table renders once, and every future change to `members` silently fails to re-render. That getter is load-bearing.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Explain "headless" in your own words.</summary>

A headless library provides the logic of a feature (sorting, filtering, row models, selection) without any markup or styling. You decide how the output looks; the library decides how the data gets processed. The trade-off is slightly more code per table in exchange for total control over the rendered HTML.
</details>

<details>
<summary><strong>Q2.</strong> Why is <code>data</code> a getter in the Svelte 5 adapter?</summary>

The adapter re-reads reactive inputs on every dependency change. If `data` were a plain property, the reference would be captured once at construction time and would never update when the underlying array changed. A getter lets the adapter re-read the current reference on each reactive re-run, which keeps the table in sync with the source.
</details>

<details>
<summary><strong>Q3.</strong> Why is <code>ColumnDef&lt;Member&gt;[]</code> better than <code>any[]</code> for the columns array?</summary>

`ColumnDef<Member>` constrains `accessorKey` to actual keys of `Member`, so a typo in a column name becomes a TypeScript error instead of a runtime surprise. It also propagates the row type into every cell renderer so that `row.original.name` is known to be a `string`.
</details>

<details>
<summary><strong>Q4.</strong> What is the minimum set of options required to construct a table?</summary>

`data` (typed array), `columns` (array of column definitions), and `getCoreRowModel: getCoreRowModel()`. The core row model is what turns raw rows into the table's internal row format. Everything else — sorting, filtering, pagination — is an opt-in row model you add in Lesson 11.8.
</details>

<details>
<summary><strong>Q5.</strong> When should you <em>not</em> use TanStack Table?</summary>

When the table is small and static and the features you need are trivial. A five-row read-only list of settings does not need a library. Reach for TanStack when you need two or more of: sorting, filtering, pagination, row selection, expansion, grouping — because the combinatorics of doing those features correctly is where TanStack pays for itself.
</details>

## 6. Common mistakes

- **`data: members` instead of `get data() { return members; }`.** Silent loss of reactivity.
- **Using `<DataTable>`-style wrapper components from other libraries.** Those fight TanStack's headless contract. Stick to plain HTML plus `flexRender`.
- **Declaring columns inside the `createSvelteTable` call without a type.** Lose auto-complete on `accessorKey` and any typos go unnoticed until runtime.
- **Rendering headers as string literals instead of via `flexRender`.** Works for plain strings; breaks the moment you add a custom header component in 11.9.

## 7. What's next

Lesson 11.8 flips on `getSortedRowModel`, `getFilteredRowModel`, and `getPaginationRowModel` — three one-line additions that transform the static table into a working data grid.
