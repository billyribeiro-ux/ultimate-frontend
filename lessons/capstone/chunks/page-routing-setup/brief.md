---
chunk: page-routing-setup
title: Page Routing Setup
module: 8
---

# Page Routing Setup — Brief

Stand up the route tree the rest of the capstone depends on. No content yet — just the files, the layouts, and the navigation wiring.

## Files that must exist

- `src/routes/+layout.svelte` — imports `app.css` and wraps children in `PageShell`.
- `src/routes/+page.svelte` — marketing home.
- `src/routes/dashboard/+page.svelte` — dashboard placeholder.
- `src/routes/contact/+page.svelte` — contact form placeholder.
- `src/routes/blog/+page.svelte` — blog index placeholder.
- `src/routes/blog/[slug]/+page.svelte` — dynamic blog post placeholder.
- `src/routes/+error.svelte` — error page fallback.

## Acceptance criteria

- Every route returns 200 in dev.
- The nav in `PageShell` links to Home, Dashboard, Contact, Blog and every link works.
- `/blog/hello` resolves via the `[slug]` param and prints the slug.
- `+error.svelte` renders when a route throws.
- `trailingSlash: 'never'` is set in `svelte.config.js`.

## How it connects to the capstone

Every later chunk drops content into one of these files. The dashboard chunks fill `dashboard/+page.svelte`. The GSAP chunks fill `+page.svelte`. The form validation chunk fills `contact/+page.svelte`. The SEO chunks modify the root layout.
