---
chunk: optimistic-ui-pattern
level: 1
penalty: 0
---

# Optimistic UI Pattern — Level 1 Hint (free)

The key insight is that you already have a reactive snapshot of the current state before the server call starts. Svelte 5 gives you `$state.snapshot()` which returns a plain, non-reactive copy of the current value — your rollback point.

Three things to get right:

1. **Snapshot before mutating.** Call `$state.snapshot()` on the data before you apply the optimistic change. This is your rollback value if the server rejects.
2. **Mutate immediately, then await.** Apply the optimistic change to the reactive state first (the UI updates instantly), then `await` the server call. If it throws, restore the snapshot.
3. **Guard against duplicate calls.** Use a `Set<string>` of in-flight IDs. Before starting a mutation, check if the row ID is already in-flight. If so, skip. Remove the ID from the set in a `finally` block so it clears whether the call succeeds or fails.

Think of the optimistic helper as a three-phase transaction: snapshot, mutate, confirm-or-rollback. The generic type parameter `<T>` makes it reusable across toggle, delete, and star operations.
