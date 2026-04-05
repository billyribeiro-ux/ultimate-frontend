---
chunk: ssr-hydration
level: 1
penalty: 0
---

# SSR + Hydration — Level 1 Hint (free)

SSR and hydration are not alternatives — they are two phases of the same render. Phase one: the server runs your component, produces HTML, and ships it. Phase two: the browser downloads the JS bundle, re-runs the component with the same props, and wires up the event listeners. After phase two the page is "hydrated" and fully interactive.

Two questions to ask before you write any data-loading code:

1. Does this value need to exist in the HTML the server sends? (If yes, compute it in a `load()` function, not in `onMount` or `$effect`.)
2. Does this value need to be reactive after hydration? (If yes, it is `$state`, even if its initial value came from `load()`.)

The server-rendered timestamp in this chunk answers "yes" to question 1 and "no" to question 2 — it is static data. The counter answers "no" to question 1 and "yes" to question 2 — it is client-only reactive state. Putting those two in the same file is the cleanest demonstration of the handoff.
