---
chunk: shared-state-store
title: Shared Reactive Class Store
module: 11
---

# Shared Reactive Class Store — Brief

The users table filter in `tanstack-table-setup` lives in the table component. A sibling component — the header's result count — needs to read the same filter. Prop drilling is the wrong answer for a shared piece of state like this.

Build a **reactive class store** in a `.svelte.ts` file that both components import directly.

## What to build

- `src/lib/stores/dashboardFilter.svelte.ts` — exports a singleton `DashboardFilterStore` instance. The class has `query = $state('')` and `setQuery(next: string)` methods.
- Refactor `UsersTable.svelte` to read `globalFilter` from the store.
- Add a header chip in the dashboard that reads the same store and displays the current query, updating live.

## Acceptance criteria

- Typing in the search box updates both the table and the header chip instantly.
- The store is a single instance — no context API needed.
- TypeScript strict: zero `any`.

## How it connects to the capstone

Shared state in the capstone should live in reactive classes, not in props passed through three levels of components. `optimistic-ui-pattern` uses a similar store for the optimistic row-removal pattern.
