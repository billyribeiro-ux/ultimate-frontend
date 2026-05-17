---
chunk: optimistic-ui-pattern
level: 2
penalty: medium
---

# Optimistic UI Pattern — Level 2 Concept Reveal

Optimistic UI is a UX pattern where the interface updates as though the server already succeeded — before the response arrives. If the server disagrees, you revert (rollback). The user perceives zero latency for the 99% of requests that succeed.

### Why this matters in a dashboard

The capstone's data table shows dozens of rows. Each row has a "status" toggle. If every toggle shows a spinner for 200-400 ms, the interface feels sluggish. With optimistic updates, the toggle flips immediately. The user keeps working while the network catches up.

### The three-phase pattern

1. **Snapshot.** Before mutating, capture the current reactive state into a plain object. In Svelte 5, `$state.snapshot(rows)` returns a deep, non-reactive copy. This is your rollback point.
2. **Mutate.** Apply the intended change to the reactive state immediately. Because the state is reactive and drives the table UI, the DOM updates on the same tick — no round-trip.
3. **Confirm or rollback.** `await` the server call. If it resolves, you are done — the state was already correct. If it rejects, assign the snapshot back to the reactive state. The DOM reverts.

### Pseudocode

```
async function optimisticUpdate<T>(
    getCurrent: () => T,
    setCurrent: (val: T) => void,
    applyMutation: () => void,
    serverCall: () => Promise<void>
): Promise<boolean> {
    const snapshot = $state.snapshot(getCurrent());
    applyMutation();               // UI updates now
    try {
        await serverCall();        // network call
        return true;               // confirmed
    } catch {
        setCurrent(snapshot);      // rollback
        return false;              // failed — show toast
    }
}
```

### Preventing duplicate calls

Maintain a reactive `Set<string>` of row IDs currently in-flight. Before starting a mutation, check membership. If the ID exists, return early. Add the ID at the start and delete it in a `finally` block so it always clears.

### Announcing rollback to screen readers

When rollback occurs, update a string in the `aria-live="polite"` region from the accessibility-audit chunk. A `$derived` binding ensures the live region text changes, which triggers the screen reader announcement.

### Connecting to the capstone

The `shared-state-store` chunk gives you the reactive class that holds `rows`. The optimistic helper wraps mutations to that class. The `command` remote function from `remote-query-setup` is the server call. The toast appears via the same pattern used in `form-remote-validation` for server errors.
