---
chunk: shared-state-store
level: 1
penalty: 0
---

# Shared Reactive Class Store — Level 1 Hint (free)

A `.svelte.ts` file is a TypeScript module that is allowed to use Svelte 5 runes. The compiler treats it the same as a component's `<script>` block — you can declare `$state`, `$derived`, even `$effect` — and any value you export from it is reactive wherever it is imported.

The idiomatic shape for a shared store in 2026 is a **class with rune fields**. Methods on the class can read and mutate those fields, and any component that imports the instance automatically re-renders when the fields change.

Two common pitfalls:

1. **Export the instance, not the class.** You want a singleton — one shared instance for the whole app. Export `export const dashboardFilter = new DashboardFilterStore()`.
2. **Do not rely on context for cross-route state.** Context only lives inside a single component tree. A reactive class instance exported from a module is global, which is exactly what you want for a filter that spans pages.
