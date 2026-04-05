---
chunk: tanstack-table-setup
title: TanStack Table Setup
module: 11
---

# TanStack Table Setup — Brief

Build a sortable, filterable users table on the dashboard using TanStack Table in headless mode. The table displays a list of users with columns for name, email, role, and last-active timestamp.

## What to build

- `src/lib/components/UsersTable.svelte` — consumes a typed `User[]` prop and renders a TanStack Table.
- Column definitions for name, email, role, lastActive.
- Client-side sorting — click any column header to toggle ascending/descending.
- Client-side filtering — a search input that filters by name or email substring.
- Pagination — 10 rows per page.
- Uses `$state` and `$derived` for all interactive state. No TanStack adapters except the core.

## Acceptance criteria

- Sorting, filtering, and pagination all work without navigating.
- Typed end-to-end — `ColumnDef<User>[]`.
- 44 px minimum touch targets on header buttons and page buttons.
- Keyboard accessible: Tab reaches every header and page control; Enter/Space activates.

## How it connects to the capstone

The dashboard's centrepiece. Reads from a `getUsers()` query you add to `dashboard.remote.ts`. Uses `shared-state-store` for cross-component filter state. `optimistic-ui-pattern` mutates table rows on delete.
