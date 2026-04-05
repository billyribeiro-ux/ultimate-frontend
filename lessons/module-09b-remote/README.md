# Module 9B — Remote Functions (April 2026 paradigm)

**Goal:** Student masters SvelteKit's new type-safe server-communication paradigm — `query`, `form`, `command`, `prerender` — and learns to choose it over classic `load()` / `+server.ts` when appropriate.

**Stack:** Svelte 5.55+, SvelteKit 2.50+ with `experimental.remoteFunctions: true`, Valibot, TypeScript strict.

## Lessons

- [Lesson 9B.1 — What Remote Functions are and why they exist](./lesson-9b.1-what-remote-functions-are-and-why-they-exist.md) — the two-codebases problem, end-to-end type safety, the four flavours. **ready**
- [Lesson 9B.2 — `query` remote functions — reading data](./lesson-9b.2-query-remote-functions-reading-data.md) — `.remote.ts` files, `query()` basics, two consumption forms, `.refresh()`. **ready**
- [Lesson 9B.3 — `query` with arguments — parameterized queries](./lesson-9b.3-query-with-arguments-parameterized-queries.md) — Valibot schemas, devalue serialisation, argument-based caching. **ready**
- [Lesson 9B.4 — `query.batch()` — batching multiple server calls](./lesson-9b.4-query-batch-batching-multiple-server-calls.md) — the N+1 problem, gather-inputs/return-resolver shape. **ready**
- [Lesson 9B.5 — `form` remote functions with Valibot](./lesson-9b.5-form-remote-functions-server-side-form-handling-with-valibot.md) — spread form object, `.as(...)` helpers, `issues()`, preflight schemas. **ready**
- [Lesson 9B.6 — File upload streaming in form remote functions](./lesson-9b.6-file-upload-streaming-in-form-remote-functions.md) — `v.file`, `v.mimeType`, `v.maxSize`, custom enhance. **ready**
- [Lesson 9B.7 — `command` remote functions — mutations](./lesson-9b.7-command-remote-functions-mutations.md) — JS-only mutations, optimistic UI with `.withOverride`. **ready**
- [Lesson 9B.8 — `query.set()` + `query.refresh()`](./lesson-9b.8-query-set-server-driven-reactive-state.md) — single-flight mutations, push-style updates. **ready**
- [Lesson 9B.9 — Async SSR — await directly in components](./lesson-9b.9-async-ssr-await-directly-in-components.md) — `<svelte:boundary pending={...}>`, the conservative pattern, the forward-looking pattern. **ready**
- [Lesson 9B.10 — Choosing the right tool](./lesson-9b.10-remote-functions-vs-load-vs-server-ts-choosing-the-right-too.md) — `load` vs `query` vs `form` vs `command` vs `+server.ts` decision framework. **ready**

## Module project

See [`module-project.md`](./module-project.md) — **Real-Time Data Application**.

A live dashboard that combines every concept in the module:

- `query.batch()` for per-widget data reads
- A `form` remote function for settings, with a Valibot schema and preflight validation
- `command` mutations for add/remove widgets with optimistic UI
- `<svelte:boundary pending={...}>` skeletons for initial SSR-critical data
- Single-flight refreshes via `query.set()` after each mutation
- PE7 styling with a dashboard-specific color personality, mobile-first responsive grid, reduced-motion support
- Every remote function validated with Valibot and typed end-to-end — zero `any`

## Why this module is separate from 9A

Module 9A teaches classic `load()` functions — the stable, battle-tested SvelteKit data-loading API that every existing codebase uses. Module 9B teaches the April 2026 paradigm that replaces most of 9A's use cases with something simpler and more type-safe. Both modules are valuable: 9A is the foundation you need to read any existing project; 9B is the direction of travel and the pattern you will reach for on new work.

## Prerequisites

- Module 1 (TypeScript strict)
- Module 2 (runes)
- Module 4 (`{#await}` and promises)
- Module 8 (routing, SSR)
- Module 9A (understanding of `load()` for comparison)
