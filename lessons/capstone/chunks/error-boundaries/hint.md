---
chunk: error-boundaries
level: 1
penalty: 0
---

# <svelte:boundary> Error Boundaries — Level 1 Hint (free)

Svelte 5 introduced `<svelte:boundary>` as the official way to catch render errors without crashing the entire component tree. Think of it as a try/catch, but for the template layer.

Three things to get right:

1. **The boundary wraps children, not the erroring component itself.** You place `<svelte:boundary>` around the content that might fail. It catches errors thrown during rendering or in `$effect` blocks of its descendants.
2. **Use the `failed` snippet for the fallback.** `<svelte:boundary>` accepts a `failed` snippet that receives the error and a `reset` function. Call `reset()` to clear the error state and re-render the children.
3. **Type the error as `unknown`.** The `failed` snippet's first parameter is `unknown`, not `Error`. Narrow it with `instanceof Error` before accessing `.message`. This prevents runtime crashes from non-Error throws.

For the retry pattern, the `reset` function provided by the boundary is all you need. Calling it clears the internal error state and re-mounts the child tree. If the underlying cause (e.g., a network issue) is fixed, the re-render succeeds.
