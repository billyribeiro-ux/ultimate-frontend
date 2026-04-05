---
chunk: ssr-hydration
level: 2
penalty: medium
---

# SSR + Hydration — Level 2 Concept Reveal

**SSR** (Server-Side Rendering) is the process of running your component on a Node server, serializing the result to an HTML string, and sending that string as the HTTP response. The user's browser receives painted HTML on the first byte — no waiting for JS, no blank screen.

**Hydration** is the process of re-running the same component in the browser, walking the existing DOM that SSR produced, and attaching event listeners and reactive state to it. After hydration the page behaves like a normal client-side app.

### What runs where

| File              | Server | Browser |
| ----------------- | ------ | ------- |
| `+page.server.ts` | Yes    | No      |
| `+page.ts`        | Yes    | Yes     |
| `+page.svelte` script | Yes | Yes  |
| `$effect`         | No     | Yes     |
| `onMount`         | No     | Yes     |

The key takeaway: anything in `$effect` or `onMount` never runs during SSR. If the value you want in the HTML depends on an `$effect`, move the computation into a `load()` function.

### Pseudocode for this chunk

```
// dashboard/+page.server.ts
export const load = () => {
    const renderedAt = new Date().toISOString();
    return { renderedAt };
};

// dashboard/+page.svelte
const { data } = $props();
let count = $state(0);

<p>Rendered at {data.renderedAt}</p>
<button onclick={() => count++}>Count: {count}</button>
```

### Proving it works

1. `View Source` on `/dashboard` — the `renderedAt` value is in the raw HTML before any `<script>` tag.
2. DevTools → Network → disable JavaScript → reload — the timestamp still shows, the counter is dead.
3. DevTools → Performance → record a load — there is a visible "Hydration" span after the initial HTML parse where the handoff happens.

### Connecting it to the capstone

Every later data chunk builds on this model. `load-function-typing` adds `$types`. `remote-query-setup` replaces the plain `load()` with a `query` function that keeps its value live across the client. But the handoff semantics never change: SSR produces HTML, hydration wakes it up.
