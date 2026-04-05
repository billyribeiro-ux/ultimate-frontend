# Module 9B Project — Real-Time Data Application

**Brief:** build a live dashboard that brings together every concept introduced in the module. The dashboard shows a grid of "widgets" — tiny cards that display a different kind of live data each — and lets the user add, remove, and reconfigure them through a settings form. All data goes through remote functions; there is no hand-written `fetch`, no `+server.ts`, and no hand-maintained DTO interface anywhere in the project.

## Target feature set

1. **Widget grid.** A responsive grid of 4–8 widgets (temperatures for cities, currency rates, server latencies — your choice). Each widget fetches its data through a **batched query** so all widgets are loaded in a single round trip.
2. **Auto-refresh.** A single button at the top of the grid calls `.refresh()` on the batched query, updating every widget in one HTTP request.
3. **Add/remove widgets.** Clicking a `+` button on the grid inserts a new widget via a **command** mutation. Clicking the `×` on an existing widget deletes it, with an optimistic UI update using `.withOverride()`.
4. **Settings form.** A side panel lets the user configure the refresh interval, dashboard title, and a checkbox for dark accents. Built with a **`form` remote function**, a Valibot schema, and a client-side preflight for instant feedback.
5. **Async SSR or `<svelte:boundary>` skeletons.** Initial load shows skeleton placeholders matching the final widget shape. Choose either the conservative `{#await}` + `<svelte:boundary pending={...}>` pattern or enable `compilerOptions.experimental.async` and use top-level `await`.
6. **Single-flight updates.** The command and form handlers use `query.set()` or `query.refresh()` internally so mutations and data reads travel on the same HTTP round trip.

## Required file shape

```
src/routes/projects/9b-dashboard/
├── +page.svelte                    # grid + settings panel
├── widgets.remote.ts               # batched query + list/add/remove commands
├── settings.remote.ts              # form() with Valibot schema
└── _lib/
    ├── widget-store.ts             # in-memory widget state (module-level)
    └── widget-types.ts             # shared interfaces for widgets
```

In-memory storage is fine — note in the README that production would use a database.

## PE7 requirements

- Per-project color personality via a single `--color-brand` override at `:root` inside the page `<style>` block.
- Fluid spacing/typography tokens throughout. No raw OKLCH literals outside the tokens file.
- Mobile-first responsive grid: `1` column on mobile, `2` on tablet (`min-width: 480px`), `3+` on desktop via `auto-fit minmax(14rem, 1fr)`.
- `prefers-reduced-motion` suppresses skeleton pulses and widget entry transitions.
- 44 px minimum touch target on every interactive element.
- `aria-invalid` applied to form fields via the `.as(...)` helper.

## TypeScript requirements

- `strict` mode, zero `any`.
- Every Valibot schema is the single source of truth for its data shape; TypeScript types flow from `v.InferInput<typeof schema>` or via automatic inference in remote function handlers.
- Every component prop is typed via `$props()` with an explicit interface.

## Deliverables

- All files above, committed to `src/routes/projects/9b-dashboard`.
- A short project README at `lessons/module-09b-remote/project/README.md` explaining how to run the project and which lesson each feature maps back to.
- Every `.svelte` file validated with `svelte-autofixer`.
- Lighthouse mobile Accessibility score 100.

## Grading rubric

| Criterion                                     | Weight |
| --------------------------------------------- | ------ |
| Every remote function has a Valibot schema    | 20%    |
| Batched query is actually batched             | 15%    |
| Form preflight works offline                  | 10%    |
| Optimistic delete is visibly instant          | 10%    |
| Single-flight mutation (no double round-trip) | 15%    |
| PE7 compliance (tokens, mobile-first, a11y)   | 15%    |
| TypeScript zero-`any` + end-to-end inference  | 15%    |
