---
module: 11
lesson: 11.8
title: TanStack Table — sorting, filtering, pagination
duration: 55 minutes
prerequisites:
  - Lesson 11.7 — TanStack Table basics
learning_objectives:
  - Add sort with getSortedRowModel and a clickable sort state
  - Add global filter with getFilteredRowModel and a search input
  - Add pagination with getPaginationRowModel and previous/next controls
  - Keep sort, filter, and pagination state in the URL via Lesson 11.6 technique
  - Recognise the row-model pipeline order and why it matters
status: ready
---

# Lesson 11.8 — TanStack Table — sorting, filtering, pagination

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. Now that the skeleton works, you add three row models: sort, filter, and paginate. Each is a one-line import plus a handful of table options.

## 1. Concept — The row model pipeline

### 1.1 Row models, and why they stack

The table you built in Lesson 11.7 had exactly one row model, `getCoreRowModel`. Its job is to convert the raw `data` array into the internal row format TanStack uses for everything else. Every optional feature adds its own row model, and the models run in a fixed order — a pipeline.

The pipeline is: **core → filter → sort → paginate**.

Core turns the source array into rows. Filter removes rows that do not match the current search. Sort re-orders the remaining rows. Paginate trims the sorted, filtered rows down to the current page. You rarely need to think about the order — it is the obviously correct order for human expectations ("I search, then sort the results, then flip through pages of them") — but it is worth knowing so that you do not go looking for bugs that are not there. If your sort does not affect the current page, that is because pagination runs *after* sort, which is exactly right.

Each model is added with one import and one option:

```ts
import {
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	getPaginationRowModel
} from '@tanstack/svelte-table';

const table = createSvelteTable({
	get data() { return members; },
	columns,
	getCoreRowModel: getCoreRowModel(),
	getFilteredRowModel: getFilteredRowModel(),
	getSortedRowModel: getSortedRowModel(),
	getPaginationRowModel: getPaginationRowModel()
});
```

That is the whole pipeline wired up. The row models are functions that return functions (so you can pass arguments to customise their behaviour), but the out-of-the-box behaviour is fine for most tables.

### 1.2 State, and where it lives

Each row model has associated *state* — which column is currently sorted, what the global filter string is, which page is active. TanStack stores that state internally by default, which is convenient but opaque. For real apps you want the state to live somewhere you control so you can share it, persist it, or put it in the URL.

The Svelte 5 adapter lets you pass reactive state in via the same getter pattern you used for `data`:

```svelte
<script lang="ts">
	import type { SortingState, ColumnFiltersState, PaginationState } from '@tanstack/svelte-table';

	let sorting = $state<SortingState>([]);
	let globalFilter = $state<string>('');
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 5 });

	const table = createSvelteTable({
		get data() { return members; },
		columns,
		state: {
			get sorting() { return sorting; },
			get globalFilter() { return globalFilter; },
			get pagination() { return pagination; }
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		},
		onGlobalFilterChange: (value) => {
			globalFilter = value as string;
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel()
	});
</script>
```

That block of code is where most students get lost on their first read. Let it settle in three steps:

1. **`$state` variables at the top** hold the current sort, filter, and pagination state.
2. **Getters inside `state: { ... }`** let the table *read* the current state reactively.
3. **`on*Change` callbacks** let the table *write* new state when the user interacts. The updater is sometimes a value and sometimes a function (that takes the old state and returns the new) — the ternary handles both.

Once this is wired up, every interaction flows: click a header → TanStack calls `onSortingChange` with a new sorting state → your `$state` updates → the table re-reads through its getter → the render loop produces the new order.

### 1.3 Making columns sortable

A column is sortable when its definition allows it. The defaults sort any column with an `accessorKey`. A sortable header is usually a button that calls `column.getToggleSortingHandler()`:

```svelte
<th>
	<button
		type="button"
		onclick={header.column.getToggleSortingHandler()}
		class="sort-button"
	>
		{header.column.columnDef.header}
		{#if header.column.getIsSorted() === 'asc'}↑
		{:else if header.column.getIsSorted() === 'desc'}↓
		{:else}↕{/if}
	</button>
</th>
```

The button is a real `<button>` element for accessibility — keyboard users must be able to focus and activate it. `getIsSorted()` returns `'asc'`, `'desc'`, or `false`, which you render as an arrow glyph. The click handler toggles through the three states.

### 1.4 Global filter — one input, whole table

Global filter is the simplest of the three features. Bind an input to the `globalFilter` state, and TanStack searches every column for a match:

```svelte
<input
	type="search"
	placeholder="Search…"
	value={globalFilter}
	oninput={(e) => (globalFilter = (e.currentTarget as HTMLInputElement).value)}
/>
```

For anything more sophisticated — fuzzy matching, per-column filters, range filters — TanStack exposes `getColumnFilters` and `columnFilters` state. This lesson sticks to global filter for clarity.

### 1.5 Pagination — three controls and a page size

Pagination needs a previous button, a next button, and a page indicator. The table exposes `table.getCanPreviousPage()`, `table.getCanNextPage()`, `table.previousPage()`, and `table.nextPage()`:

```svelte
<nav class="pager" aria-label="Pagination">
	<button
		type="button"
		onclick={() => table.previousPage()}
		disabled={!table.getCanPreviousPage()}
	>
		← Previous
	</button>

	<span>
		Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
	</span>

	<button
		type="button"
		onclick={() => table.nextPage()}
		disabled={!table.getCanNextPage()}
	>
		Next →
	</button>
</nav>
```

`disabled` handles the edge cases automatically — you cannot click previous on page 1 or next on the last page.

### 1.6 Putting the state in the URL (optional but recommended)

Combine this lesson with Lesson 11.6 and the sort/filter/pagination state can live in the URL instead of component-local `$state`. The structure is the same — you read from `page.url.searchParams` in a `$derived`, and you write via `goto()` in the `on*Change` callbacks. The mini-build for this lesson keeps the state in `$state` for simplicity; the module project at the end of the module puts it in the URL.

## Deep Dive

**Why this matters at scale.** Sorting, filtering, and pagination are composable row model processors. Each transforms data in sequence, creating a pipeline.

**The mental model.** State for each feature lives in $state variables connected via state/onChange. getSortedRowModel, getFilteredRowModel, getPaginationRowModel compose in order.

**Edge cases.** The pipeline order matters: filter first reduces the dataset, then sort, then paginate. Reversing the order produces different results.

**Performance implications.** Each row model processor runs O(n) or O(n log n) on the data. For filtered+sorted+paginated, total cost is dominated by the sort step.

**Connection to other modules.** Module 11.7 provides the foundation. Module 11.9 adds TypeScript. Module 12 addresses large datasets.

## 2. Style it — Real dashboard ergonomics

The mini-build puts a search input above the table, clickable sort headers inside the table, and pagination controls below. Per-page accent: `oklch(68% 0.18 260)` (indigo).

- The search input is full-width on mobile and fixed at 24rem at `min-width: 480px`.
- Sort headers have a focus ring (inherited from the PE7 reset) and a 44px minimum click target.
- Pagination controls are a flex row with `gap: var(--space-md)` and wrap on narrow screens.

## 3. Interact — Sort, filter, page, all at once

The mini-build lets students click every header (sort), type in the search (filter), and click previous/next (page). All three features compose correctly because TanStack runs the row models in order.

## 4. Mini-build — A fully interactive members table

**File:** `src/routes/modules/11-state/08-tanstack-sort-filter-paginate/+page.svelte`

Extends the basic table from 11.7 with sort, filter, and pagination state, wired via the getter/callback pattern.

### DevTools moment

Open the Svelte DevTools and watch the three reactive variables (`sorting`, `globalFilter`, `pagination`) update in real time as you interact. Click a header twice to confirm the sort flips through asc/desc/none. Type a query and watch the total page count drop. Notice that when the filter narrows the result set below the current page, TanStack keeps your `pageIndex` the same — you may now be on an empty page, and the "next" button is disabled. This is a known sharp edge of row-model pagination; you handle it in the module project by resetting `pageIndex` to 0 whenever the filter changes.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In what order do the row models run?</summary>

Core → filter → sort → paginate. Core builds the base row set; filter removes non-matches; sort re-orders what remains; paginate trims to the current page. That is also the order a human expects the features to apply.
</details>

<details>
<summary><strong>Q2.</strong> Why pass <code>state</code> as an object of getters instead of as plain properties?</summary>

Getters let TanStack re-read the reactive state on every render pass. Plain properties capture the reference once and freeze it. The Svelte 5 adapter needs reactivity to flow in both directions, which is why both `data` and `state` use the getter pattern.
</details>

<details>
<summary><strong>Q3.</strong> Why use a real <code>&lt;button&gt;</code> for the sort header instead of a div with an onclick?</summary>

Accessibility. A `<button>` is keyboard-focusable, Enter- and Space-activatable, announced correctly by screen readers, and already styled by the PE7 reset to be a click target. A div with an onclick has none of those properties and requires you to add them manually, badly.
</details>

<details>
<summary><strong>Q4.</strong> Your filter narrows the result to two rows but the page is empty. Why?</summary>

`pageIndex` is retained across filter changes. If you were on page 3 of 10 and the filter drops the total pages to 1, `pageIndex === 2` now points past the end. Reset `pageIndex` to 0 in the `onGlobalFilterChange` callback to avoid the empty-page state.
</details>

<details>
<summary><strong>Q5.</strong> Why might you want the sort state in the URL rather than in <code>$state</code>?</summary>

So that a user can bookmark or share a sorted view. "Here is the dashboard, sorted by joined-date descending, filtered to admins" becomes a single link. That is exactly the URL-as-state pattern from Lesson 11.6.
</details>

## 6. Common mistakes

- **Forgetting to reset `pageIndex` on filter change.** Empty pages.
- **Updating state directly inside the template.** Always flow updates through the `on*Change` callbacks.
- **Assuming sort is server-side.** TanStack's sort is client-side by default and sorts the entire `data` array. For very large datasets, flip to `manualSorting: true` and perform the sort on the server.
- **Binding the search input with `bind:value`.** Works, but the `oninput`/`value=` pattern aligns with the URL-as-state lesson and scales better when you add debouncing.

## 7. What's next

Lesson 11.9 pushes the types — generic row types, typed cell components, row selection — so that a future refactor cannot silently break your table.
