---
chunk: load-function-typing
level: 1
penalty: 0
---

# Typed load() Functions — Level 1 Hint (free)

SvelteKit generates types for you. Every `+page.server.ts` has a matching `./$types` module that exports `PageServerLoad` (the function signature) and `PageData` (the shape the component receives).

You never write these types by hand. You import them. That import is what unlocks end-to-end type safety: when you add a field to the load return, `PageData` updates automatically, and the component that was reading `data.x` starts complaining the moment `x` is no longer on the return.

Keep domain types in `$lib/types/` — one interface per file. Import them in both the load and the component. The load is the single writer of the type; the component is a consumer.

Do not destructure the props as implicit any. Always annotate: `const { data }: { data: PageData } = $props();`.
