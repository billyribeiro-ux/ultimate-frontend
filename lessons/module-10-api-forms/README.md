# Module 10 — API Routes & Forms

**Goal:** Student masters the stable, progressive-enhancement-first SvelteKit patterns for talking to the server — `+server.ts` endpoints and classic form actions — and knows exactly when to reach for each over the Module 9B remote functions.

**Stack:** SvelteKit 2.50+, TypeScript strict, Valibot (for validation inside actions), PE7 CSS.

## Lessons

- [Lesson 10.1 — `+server.ts` — building API endpoints](./lesson-10.1-server-ts-building-api-endpoints.md) — GET/POST/PUT/DELETE handlers, `json()` + `error()` helpers, typed `RequestHandler`. **ready**
- [Lesson 10.2 — TypeScript in API routes](./lesson-10.2-typescript-in-api-routes.md) — `RequestHandler<Params, OutputBody, InputBody>`, generated `./$types`, Valibot for runtime safety. **ready**
- [Lesson 10.3 — Form actions — the `actions` export](./lesson-10.3-form-actions-page-server-ts-and-the-actions-export.md) — `+page.server.ts`, default actions, `fail()` and `redirect()`, works without JavaScript. **ready**
- [Lesson 10.4 — Named actions — multiple forms on one page](./lesson-10.4-named-actions-multiple-forms-on-one-page.md) — `?/actionName`, `formaction` on buttons, discriminated-union form results. **ready**
- [Lesson 10.5 — `use:enhance` — progressive enhancement](./lesson-10.5-use-enhance-progressive-enhancement.md) — `SubmitFunction`, custom callbacks, `applyAction` + `invalidateAll`. **ready**
- [Lesson 10.6 — Server-side validation and `ActionData`](./lesson-10.6-server-side-validation-and-actiondata.md) — Valibot inside actions, typed errors, value repopulation. **ready**
- [Lesson 10.7 — Environment variables in SvelteKit](./lesson-10.7-environment-variables-in-sveltekit.md) — the four `$env` modules, `PUBLIC_` prefix, build-time guard rails. **ready**
- [Lesson 10.8 — File uploads via form actions](./lesson-10.8-file-uploads-via-form-actions.md) — `enctype="multipart/form-data"`, `FormData.get` as `File`, size and MIME validation. **ready**

## Module project

See [`module-project.md`](./module-project.md) — **Full CRUD Note-Taking App**.

A complete notes application that exercises every idea in the module:

- `+server.ts` endpoint for a public read-only JSON feed (for the "share link" feature)
- `actions` for create, update, delete on the main page
- Named actions with clear `which` discriminators in every return value
- `use:enhance` on every form with pending states and automatic reset
- Server-side Valibot validation with typed `ActionData`
- Environment variables (`PUBLIC_APP_NAME`, `DATABASE_URL` placeholder) demonstrating both access patterns
- File upload for an optional attachment per note
- PE7 styling, responsive layout, full accessibility

## Why classic patterns still matter

Module 9B taught you the newest, most type-safe way to talk to the server. Module 10 teaches the oldest and most battle-tested. Both matter:

- **Classic form actions** are the only way to build a form that works without JavaScript. For account creation, payment, and consent flows, that still matters in 2026.
- **`+server.ts`** is the only way to expose a public URL that third parties can call — webhooks, OAuth callbacks, mobile app APIs.
- The classic patterns are also the foundation that remote functions build on top of; understanding them helps you debug remote functions when something goes wrong.

## Prerequisites

- Modules 1, 2, 4, 5, 8
- Module 9B is a useful comparison but not required — Module 10 stands on its own.
