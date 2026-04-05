# Module 8 — SvelteKit Routing & Layouts

**Goal:** Understand how a SvelteKit project turns files into URLs, how SSR and hydration interact, how to read the current route reactively, and how to ship a single app using all four rendering modes.

## Lessons

- [Lesson 8.1 — What SvelteKit adds to Svelte](./lesson-8.1-what-sveltekit-adds-to-svelte.md)
- [Lesson 8.2 — What SSR actually is](./lesson-8.2-what-ssr-actually-is.md)
- [Lesson 8.3 — What Hydration actually is](./lesson-8.3-what-hydration-actually-is.md)
- [Lesson 8.4 — File-based routing — how files become pages](./lesson-8.4-file-based-routing-how-files-become-pages.md)
- [Lesson 8.5 — Nested layouts and route groups](./lesson-8.5-nested-layouts.md)
- [Lesson 8.6 — Dynamic routes — [slug], [...rest], matchers](./lesson-8.6-dynamic-routes-slug-and-rest.md)
- [Lesson 8.7 — $app/state — reactive page state](./lesson-8.7-app-state-reactive-page-state.md)
- [Lesson 8.8 — $app/navigation — programmatic navigation](./lesson-8.8-app-navigation-programmatic-navigation.md)
- [Lesson 8.9 — hooks.server.ts — request lifecycle](./lesson-8.9-hooks-server-ts-server-side-request-lifecycle.md)
- [Lesson 8.10 — instrumentation.server.ts — OpenTelemetry basics](./lesson-8.10-instrumentation-server-ts-opentelemetry-support.md)
- [Lesson 8.11 — Page transitions with onNavigate and View Transitions](./lesson-8.11-page-transitions-animating-between-routes.md)
- [Lesson 8.12 — The four rendering modes in depth](./lesson-8.12-the-four-rendering-modes-in-depth.md)

## Module project

See [module-project.md](./module-project.md) — a Multi-Page Portfolio Site that uses every concept in this module.

## Learning outcomes

By the end of Module 8 you can:

1. Turn a folder tree into a URL tree without touching a config file.
2. Explain SSR and hydration in concrete bytes, not marketing language.
3. Share layout shells across pages and break them deliberately when needed.
4. Capture dynamic route parameters with full type safety via `$app/types`.
5. Read `page.url`, `page.params`, `page.data` from `$app/state` reactively with `$derived`.
6. Drive navigation from code with `$app/navigation` and handle unsaved-changes guards.
7. Intercept every request in `hooks.server.ts` and instrument it with `instrumentation.server.ts`.
8. Animate between routes using the View Transitions API.
9. Pick SSR, SSG, CSR or hybrid per route based on the content's real requirements.

## Forward references

- **Module 9A** uses every file convention introduced here to attach typed `load` functions to pages and layouts.
- **Module 9B** introduces remote functions, an alternative data model that coexists with `load` and is enabled via `experimental.remoteFunctions` in `svelte.config.js`.
- **Module 10** builds on `hooks.server.ts` for auth and adds form actions.
- **Module 12** returns to the rendering modes chapter and measures their impact on Core Web Vitals.
