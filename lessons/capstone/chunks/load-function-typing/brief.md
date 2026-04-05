---
chunk: load-function-typing
title: Typed load() Functions
module: 9A
---

# Typed load() Functions — Brief

Wire the dashboard data pipe end-to-end with strict TypeScript and SvelteKit's auto-generated `$types`.

## What to build

- Convert the placeholder `dashboard/+page.server.ts` into a real `load()` that returns a list of typed `Metric` records.
- Type the return value using `PageServerLoad` from `./$types`.
- In `dashboard/+page.svelte`, read `data` with `PageData` from `./$types` and render the metrics in a list.
- Define the `Metric` interface in `src/lib/types/metric.ts` and import it in the load function.

## Acceptance criteria

- Zero `any` anywhere in the data flow.
- Hovering `data.metrics` in VS Code shows the full typed shape.
- Removing a field from the load return causes a compile error in the component.
- SSR still puts the metric list in View Source.

## How it connects to the capstone

Establishes the typing contract the rest of the data flow depends on. `remote-query-setup` swaps the mechanism but keeps the same `Metric` type. `tanstack-table-setup` renders the same shape as a sortable table.
