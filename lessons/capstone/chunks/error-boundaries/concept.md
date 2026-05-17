---
chunk: error-boundaries
level: 2
penalty: medium
---

# <svelte:boundary> Error Boundaries — Level 2 Concept Reveal

Error boundaries provide scoped error recovery in component trees. Without them, a single thrown error during rendering crashes the entire application. With boundaries, only the affected subtree is replaced by a fallback — the rest of the page continues to function.

### How `<svelte:boundary>` works

Svelte 5 provides `<svelte:boundary>` as a built-in element. It wraps child content and catches any error thrown during rendering or in `$effect` blocks of its descendants.

When an error occurs, the boundary:
1. Removes the errored children from the DOM.
2. Renders the `failed` snippet instead.
3. Provides a `reset` function that, when called, clears the error and re-mounts the original children.

### The `failed` snippet

The `failed` snippet receives two arguments: the error (typed as `unknown`) and a `reset` function. You must narrow the error type before using it:

```
<svelte:boundary>
    {#snippet failed(error, reset)}
        <div role="alert">
            <p>{error instanceof Error ? error.message : 'Something went wrong'}</p>
            <button onclick={reset}>Try again</button>
        </div>
    {/snippet}

    <DangerousComponent />
</svelte:boundary>
```

### Nesting boundaries for granular recovery

The capstone uses boundaries at three levels:

1. **Widget-level.** Each independent section (table, chart, canvas) has its own boundary. A failure in the table does not affect the chart.
2. **Canvas-level.** The 3D Threlte canvas has a dedicated boundary because WebGL context loss is a known failure mode on mobile GPUs. The fallback is a static poster image.
3. **Layout-level.** A top-level boundary in `+layout.svelte` catches anything that escapes widget boundaries — the ultimate safety net.

### Making a reusable boundary component

To avoid repeating the same fallback markup everywhere, create a generic wrapper component that accepts a `children` snippet for the protected content and optionally a custom `fallback` snippet. If no custom fallback is provided, render a default error card.

### Accessibility of error fallbacks

When an error boundary activates, keyboard focus may be lost (the focused element was inside the removed subtree). The fallback must:
- Have `role="alert"` so screen readers announce it.
- Programmatically receive focus via `tabindex="-1"` and a `$effect` that calls `.focus()` on mount.

### Connecting to the capstone

The `tanstack-table-setup` chunk benefits from the widget-level boundary. The Threlte canvas from `gsap-timeline` and the 3D scene get the canvas-level boundary. The `accessibility-audit` chunk requires that fallbacks are properly announced and keyboard-accessible.
