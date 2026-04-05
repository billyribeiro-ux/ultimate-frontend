---
chunk: ssr-hydration
title: SSR + Hydration
module: 8
---

# SSR + Hydration — Brief

Prove that your capstone is shipping real SSR HTML and that hydration takes over cleanly. Pick one route — the dashboard — and make it a teaching example for the rendering pipeline.

## What to build

- Add a `+page.server.ts` to `src/routes/dashboard/` that returns a server-computed value: a timestamp of when the page was rendered on the server.
- In the page component, display the timestamp and a small client-only counter button that increments when clicked.
- Add an SSR assertion: use View Source on `/dashboard` to confirm the timestamp is in the response HTML before any JS runs.

## Acceptance criteria

- The timestamp in View Source matches the one on screen on first load.
- The counter increments after hydration (JS-only feature).
- Disabling JavaScript in DevTools still renders the timestamp — the counter simply does not work.
- TypeScript strict: no `any`.

## How it connects to the capstone

Every data-fetching chunk (`load-function-typing`, `remote-query-setup`) depends on the student understanding which code runs where. This chunk is the practical demonstration that SSR is real and that hydration is the handoff between the server render and the client runtime.
