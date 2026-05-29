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
  - Build a typed createTable instance with columns, features, and data
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

### 1.2 The Svelte 5 adapter: createTable, features, and row models

The v9 adapter centres on one function — `createTable(options)` — plus two ideas that make the configuration explicit. You pass `createTable` a configuration object; it returns a reactive table instance that your component reads from.

```ts
import {
	createTable,
	tableFeatures,
	columnVisibilityFeature,
	createCoreRowModel,
	type ColumnDef
} from '@tanstack/svelte-table';
```

A bare-minimum table needs four things:

1. A *feature declaration* — `tableFeatures({ ... })` lists which features the table can use, declared once and statically outside the component.
2. A typed array of column definitions, parameterised over both the features and the row type.
3. A typed array of rows (passed reactively through a `data` getter).
4. The core row model factory, passed inside `_rowModels` (the engine that builds the current visible rows from the raw data).

Here is what that looks like for a list of members:

```svelte
<script lang="ts">
	import {
		createTable,
		tableFeatures,
		columnVisibilityFeature,
		createCoreRowModel,
		type ColumnDef
	} from '@tanstack/svelte-table';
	import { members, type Member } from '$lib/stores/members';

	const _features = tableFeatures({ columnVisibilityFeature });

	const columns: ColumnDef<typeof _features, Member>[] = [
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'email', header: 'Email' },
		{ accessorKey: 'role', header: 'Role' },
		{ accessorKey: 'joined', header: 'Joined' }
	];

	const table = createTable({
		_features,
		get data() {
			return members;
		},
		columns,
		_rowModels: { coreRowModel: createCoreRowModel() }
	});
</script>
```

Three details to notice. First, `_features` is declared with `tableFeatures({ ... })` *outside* the component and lists every feature the table will use. In v9, features are opt-in and declared up front rather than implied by which row models you pass. The bare table only enables `columnVisibilityFeature`; Lesson 11.8 adds sort, filter, and pagination features alongside their row models.

Second, `data` is a *getter*, not a static property. TanStack's Svelte 5 adapter expects reactive inputs to be read through getters so that it can re-run the row models when the source changes. If you wrote `data: members` (without the `get`), the table would be frozen to the first reference and would never update when the array mutated. This getter pattern is the single biggest reactivity contract in the Svelte 5 adapter.

Third, `ColumnDef<typeof _features, Member>[]` is the generic type that gives you full auto-complete and type-checking on `accessorKey`. Note the *two* type parameters in v9: the features type comes first, then the row type. If you write `accessorKey: 'namme'`, TypeScript immediately tells you that `'namme'` is not a key of `Member`. This is the same level of type safety you get from `keyof` in your own code, delivered by the library.

The core row model is passed as a *factory call* inside `_rowModels` — `_rowModels: { coreRowModel: createCoreRowModel() }` — not as a top-level `getCoreRowModel:` option. Every optional row model (filter, sort, paginate) joins it as another key in that same `_rowModels` object.

### 1.3 Rendering rows and cells

Once the table exists, rendering it is a matter of reading its methods. The four you need for a basic table:

- `table.getHeaderGroups()` — returns an array of header rows (normally one, unless you use column groups). These method names are unchanged from earlier versions.
- `table.getRowModel().rows` — returns the rows to display.
- Each row has `.getVisibleCells()` — returns the cells for that row.
- Each header exposes `header.column.columnDef.header`, and each cell exposes `cell.getValue()`.

```svelte
<table>
	<thead>
		{#each table.getHeaderGroups() as group (group.id)}
			<tr>
				{#each group.headers as header (header.id)}
					<th>{header.column.columnDef.header}</th>
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
```

For the simplest possible case, where the header is a plain string and the cell is the accessed value, reading `columnDef.header` and `cell.getValue()` directly is all you need. You will see in Lesson 11.9 how to plug in custom Svelte components as cells — for example a "role badge" component — by switching on the column id and rendering your own markup.

### 1.4 What "no features" means

The table you build in this lesson does exactly one thing: renders its data. No sort, no filter, no pagination. That is deliberate. Before you add those features, you should be comfortable with the bones: the column definitions, the reactive data getter, the header/body rendering loop. Once those feel natural, adding row models (Lesson 11.8) is a one-line change per feature.

### 1.5 Why not write the table yourself?

It is a fair question. For a five-row table, you absolutely should. A handful of `{#each}` blocks and a `items.sort()` call will do the job. You reach for TanStack Table the moment the *combination* of features starts to multiply: sort *and* filter *and* paginate *and* select *and* expand *and* group. Writing those five features by hand, composed correctly so that sorting a filtered page does not lose the selection, is surprisingly hard. TanStack has done the hard work, type-checked the result, and tested it on thousands of consumer codebases. This is exactly what a library is for.

### 1.x What TanStack Table does under the hood — the row model pipeline

TanStack Table processes your data through a pipeline of "row models," each transforming the data:

```
Raw Data -> Core Row Model -> Filtered Row Model -> Sorted Row Model -> Paginated Row Model -> Final Rows
```

1. **Core Row Model:** Converts your raw data array into `Row` objects with metadata (id, index, original data).
2. **Filtered Row Model:** Applies column filters and global filter, removing rows that do not match.
3. **Sorted Row Model:** Sorts the remaining rows by the active sort columns and directions.
4. **Paginated Row Model:** Slices the sorted rows to the current page's range.

Each model is computed lazily — it only recalculates when its input changes. In Svelte, you wrap the table instance in a `$derived` or read it reactively, so changes to sort/filter/pagination state automatically trigger the correct recomputation.

### 1.x Comparison: TanStack Table vs native HTML table vs AG Grid

| Aspect | TanStack Table | Native HTML `<table>` | AG Grid |
| --- | --- | --- | --- |
| Rendering | You control (headless) | Browser default | AG Grid renders |
| Bundle size | ~15 KB | 0 KB | ~200+ KB |
| Sorting/filtering | Built-in state machine | Manual JavaScript | Built-in |
| TypeScript | Full generic typing | Manual | Partial |
| Styling | Your CSS entirely | Your CSS | AG Grid theme system |
| Virtual scrolling | Via TanStack Virtual | Manual | Built-in |
| Best for | Custom-designed data tables | Simple lists | Enterprise data grids |

> **In production sidebar.** We switched from a hand-built table component (800 lines of sorting/filtering/pagination logic) to TanStack Table. The migration took 3 days and the replacement code was 200 lines. The headless approach meant our existing CSS and component structure were untouched — we only swapped the state management layer. The biggest win: column resize, which took us a week to build manually, came free with TanStack Table's column sizing API.

### 1.x Common interview question

**Q: "What does 'headless UI' mean in the context of TanStack Table?"**

**Model answer:** Headless UI means the library provides the logic (state management, data processing, event handling) but not the rendering. TanStack Table gives you a table instance with methods and state for sorting, filtering, pagination, and column management. You render the actual HTML — `<table>`, `<tr>`, `<td>`, or any other markup — yourself. This separation means you have complete control over styling, accessibility, and layout. The library never outputs DOM elements. You call its API to get the current rows, headers, and cell values, then render them however you want.

## Deep Dive

**Why this matters at scale.** Headless UI separates logic from presentation. You control all markup and styling while TanStack handles sorting, filtering, pagination.

**The mental model.** createTable takes a feature declaration, column definitions, and a `_rowModels` object of factory calls. getHeaderGroups() and getRowModel() provide data for rendering. State lives outside the table.

**Edge cases.** Column accessors must match data properties. The table re-renders when state changes. The returned table is already reactive — no `fromStore`, no `$` prefix.

**Performance implications.** TanStack processes the full dataset through its row model pipeline on every state change. For 10,000+ rows, consider server-side processing.

**Connection to other modules.** Module 11.8 adds features. Module 11.9 adds typing. Module 6's PE7 tokens style the output.


## Going Deeper

- **Svelte docs:** Check the relevant section in the [Svelte documentation](https://svelte.dev/docs).
- **Challenge:** Apply the pattern from this lesson to a real component in your own project. Measure the before and after in terms of code lines and type safety.

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
<summary><strong>Q3.</strong> Why is <code>ColumnDef&lt;typeof _features, Member&gt;[]</code> better than <code>any[]</code> for the columns array?</summary>

`ColumnDef<typeof _features, Member>` constrains `accessorKey` to actual keys of `Member`, so a typo in a column name becomes a TypeScript error instead of a runtime surprise. It also propagates the row type into every cell renderer so that `row.original.name` is known to be a `string`. The first type parameter ties the columns to the enabled features; the second is the row type.
</details>

<details>
<summary><strong>Q4.</strong> What is the minimum set of options required to construct a table?</summary>

`_features` (from `tableFeatures({ ... })`), `data` (typed array via a getter), `columns` (array of column definitions), and `_rowModels: { coreRowModel: createCoreRowModel() }`. The core row model is what turns raw rows into the table's internal row format. Everything else — sorting, filtering, pagination — is an opt-in feature plus row model you add in Lesson 11.8.
</details>

<details>
<summary><strong>Q5.</strong> When should you <em>not</em> use TanStack Table?</summary>

When the table is small and static and the features you need are trivial. A five-row read-only list of settings does not need a library. Reach for TanStack when you need two or more of: sorting, filtering, pagination, row selection, expansion, grouping — because the combinatorics of doing those features correctly is where TanStack pays for itself.
</details>

## 6. Common mistakes

- **`data: members` instead of `get data() { return members; }`.** Silent loss of reactivity.
- **Using `<DataTable>`-style wrapper components from other libraries.** Those fight TanStack's headless contract. Stick to plain HTML and the table's own helpers.
- **Declaring columns inside the `createTable` call without a type.** Lose auto-complete on `accessorKey` and any typos go unnoticed until runtime. Annotate with `ColumnDef<typeof _features, Member>[]`.
- **Passing row models as top-level options (`getCoreRowModel: ...`).** In v9 the row models live inside `_rowModels` as factory calls. A top-level `getCoreRowModel` does nothing.

## 7. What's next

Lesson 11.8 adds the `rowSortingFeature`, `columnFilteringFeature`, `globalFilteringFeature`, and `rowPaginationFeature` plus their row-model factories — turning the static table into a working data grid.
