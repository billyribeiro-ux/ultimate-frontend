# Module 9A — Data Loading (traditional `load()`)

**Goal:** Master SvelteKit's `load` functions — the typed, cacheable, universal way to fetch data before a page renders.

## Lessons

- [Lesson 9A.1 — What load functions are and why they exist](./lesson-9a.1-what-load-functions-are-and-why-they-exist.md)
- [Lesson 9A.2 — +page.ts vs +page.server.ts](./lesson-9a.2-page-ts-vs-page-server-ts.md)
- [Lesson 9A.3 — Auto-generated $types — end-to-end type safety](./lesson-9a.3-auto-generated-types-end-to-end-type-safety.md)
- [Lesson 9A.4 — fetch inside load — SvelteKit's enhanced fetch](./lesson-9a.4-fetch-inside-load-sveltekit-s-enhanced-fetch.md)
- [Lesson 9A.5 — Layout data and parent()](./lesson-9a.5-layout-data-layout-ts-and-layout-server-ts.md)
- [Lesson 9A.6 — Parallel data loading — Promise.all and the waterfall](./lesson-9a.6-parallel-data-loading.md)
- [Lesson 9A.7 — depends() and invalidate() — manual cache control](./lesson-9a.7-depends-and-invalidate-manual-cache-control.md)
- [Lesson 9A.8 — Error handling in load — error() and redirect()](./lesson-9a.8-error-handling-in-load-error-and-redirect.md)
- [Lesson 9A.9 — Streaming with Promise returns — progressive rendering](./lesson-9a.9-streaming-with-promise-returns-progressive-rendering.md)
- [Lesson 9A.10 — SSG — Static Site Generation with prerender and entries()](./lesson-9a.10-ssg-static-site-generation-with-prerender.md)

## Module project

See [module-project.md](./module-project.md) — a Weather Dashboard that uses every concept in the module against the real, auth-free Open-Meteo public API.

## Learning outcomes

By the end of Module 9A you can:

1. Write a typed universal or server load function for any page.
2. Pick between `+page.ts` and `+page.server.ts` correctly every time.
3. Read `data` in a component with generated `PageProps` and never write a manual interface.
4. Use the enhanced fetch for deduplication, cookie forwarding and inlining.
5. Share data across pages through `+layout.ts` and `parent()`.
6. Parallelise independent fetches with `Promise.all` and avoid network waterfalls.
7. Refresh specific loads with `depends()` + `invalidate()`.
8. Throw typed errors and redirects from load with `error()` and `redirect()`.
9. Stream slow data progressively with `{#await}` and server-returned promises.
10. Prerender static routes and use `entries()` for dynamic ones.

## Forward references

- **Module 9B** introduces remote functions — a runes-native alternative to `load` enabled via `experimental.remoteFunctions: true` in `svelte.config.js`. Remote functions and load functions can coexist; remote functions shine for mutations and fine-grained queries, load still shines for page-level data with cache keys. Module 9B is written by a separate agent and does not depend on content from this module beyond the basics.
- **Module 10** builds form actions on top of load for mutations.
- **Module 12** measures the rendering mode trade-offs against Core Web Vitals.
