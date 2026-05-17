---
chunk: optimistic-ui-pattern
title: Optimistic UI Pattern
module: 11
---

# Optimistic UI Pattern — Brief

Implement optimistic updates in the capstone's dashboard so that user actions (toggling row status, deleting a record, starring an item) feel instantaneous. The UI reflects the expected outcome immediately, then reconciles with the server response — rolling back if the request fails.

## What to build

- In `src/lib/stores/dashboard.svelte.ts`, add an `optimisticUpdate<T>` helper function that accepts the current state snapshot, a mutation function, and an async server call. It applies the mutation immediately, awaits the server call, and rolls back to the snapshot if the call throws.
- In `src/routes/dashboard/+page.svelte`, wire the "toggle status" button on each table row to the optimistic helper. When a user clicks the toggle, the row status flips instantly. If the server rejects the mutation (e.g., 409 conflict), the row reverts to its prior state and a toast appears.
- In `src/lib/components/Toast.svelte`, show a dismissible error toast when a rollback occurs. The toast must be announced via the `aria-live` region from the `accessibility-audit` chunk.
- Ensure that rapid double-clicks on the same row do not result in duplicate requests — debounce or ignore while in-flight.

## Acceptance criteria

- Toggling a row status updates the table cell immediately (no spinner, no loading state).
- If the server returns an error, the row reverts within one tick and a toast appears.
- Rapid successive clicks on the same row do not send duplicate server calls.
- The optimistic helper is generic — it works for any mutation shape, not just toggle.
- All state uses Svelte 5 runes (`$state`, `$state.snapshot()`). No legacy stores.
- No `any` types. The helper is fully generic with `<T>`.
- Screen readers announce rollback errors via `aria-live="polite"`.

## How it connects to the capstone

This chunk builds directly on the shared reactive class from `shared-state-store` — the optimistic mutation operates on the same `.svelte.ts` state that drives the TanStack Table in `tanstack-table-setup`. The toast component reuses the live region from `accessibility-audit`. The server call uses the `command` remote function pattern introduced in `remote-query-setup`.
