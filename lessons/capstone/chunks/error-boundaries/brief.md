---
chunk: error-boundaries
title: <svelte:boundary> Error Boundaries
module: 12
---

# <svelte:boundary> Error Boundaries — Brief

Implement scoped error boundaries throughout the capstone so that a failure in one component (a crashed widget, a failed network request, a broken 3D canvas) does not take down the entire page. Users see a graceful fallback and can retry without a full reload.

## What to build

- In `src/lib/components/ErrorBoundary.svelte`, create a generic error boundary wrapper using `<svelte:boundary>` that catches render errors and displays a styled fallback with the error message and a retry button.
- In `src/routes/dashboard/+page.svelte`, wrap the TanStack Table widget in an error boundary so a data-loading failure shows a retry card instead of a blank page.
- In `src/routes/+page.svelte`, wrap the 3D Threlte canvas in an error boundary so WebGL context failures (common on low-power devices) degrade to a static image fallback.
- In `src/routes/+layout.svelte`, wrap the `{@render children()}` call in a top-level boundary that catches any unhandled error and renders a full-page "Something went wrong" screen with a link to reload.
- Each boundary must log the error to the console in development and (conceptually) to an error-reporting service in production.
- The retry button must reset the boundary and re-render the children.

## Acceptance criteria

- A thrown error inside the dashboard table does not crash the entire page — only the table section shows the error fallback.
- A WebGL context failure on the marketing home shows a static image instead of a broken canvas.
- The top-level layout boundary catches any uncaught error and shows a full-page recovery screen.
- Clicking "Retry" on any boundary re-renders the child content (the boundary resets).
- All error boundaries are accessible — the fallback is focused on appear and announced to screen readers.
- No `any` types. Error is typed as `unknown` and narrowed before use.
- The error boundary component is generic and reusable — it accepts a fallback snippet.

## How it connects to the capstone

Error boundaries protect the work of every other chunk. The `tanstack-table-setup` chunk's widget is wrapped in one. The `gsap-timeline` and Threlte chunks benefit from the canvas boundary. The `accessibility-audit` chunk requires that error fallbacks are keyboard-operable and announced. The `ssr-hydration` chunk ensures server-side errors also trigger appropriate boundaries.
