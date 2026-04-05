# Capstone — The PE7 Flagship Project

> A production-grade, multi-page SvelteKit 2 + Svelte 5 application that demonstrates mastery of every module in this course simultaneously.

## What the capstone is

A real application — not a tutorial follow-along — that the student builds independently using every skill from every module:

- Multi-page routing with nested layouts and dynamic routes
- Full PE7 CSS architecture (all six `@layer` layers, OKLCH throughout)
- Distinct per-section visual identities via scoped custom property overrides
- Component library built from scratch — typed, variant systems, accessible
- GSAP ScrollTrigger throughout — choreographed scroll experience
- Remote functions for all data operations (`query`, `form`, `command`, `query.batch()`)
- Form actions with Valibot validation + progressive enhancement
- TanStack Table for data-heavy views
- Shared reactive state via reactive classes in `.svelte.ts`
- Optimistic UI patterns
- Server-side error boundaries (`<svelte:boundary>`)
- Full SEO — JSON-LD, Open Graph, sitemap, robots.txt, E-E-A-T
- TypeScript strict mode — zero `any` anywhere
- Accessible — keyboard navigable, ARIA complete
- Tested — Vitest + Playwright suites
- Mobile-first — Lighthouse mobile 100 on all pages
- Deployed to production

## The reveal system

The capstone is pre-divided into **20 chunks** — see [`chunks/registry.ts`](./chunks/registry.ts). Each chunk tests a specific skill from a specific module.

When a student gets stuck, they can progressively reveal help:

1. **Level 1 — Hint** (free, full credit) — a written clue pointing toward the concept without revealing code.
2. **Level 2 — Concept reveal** (partial credit) — the concept explained in the capstone context, still no code.
3. **Level 3 — Code reveal** (reduced credit, still counted) — the exact code for that chunk and nothing else.

A **15-minute time gate** applies before Level 2 or 3 unlocks, ensuring students genuinely attempt the problem first.

See [`platform-spec.md`](./platform-spec.md) for the full platform design.

## Score tiers

| Chunks solved independently | Tier                              |
| --------------------------- | --------------------------------- |
| 20 / 20                     | Distinguished Engineer            |
| 16–19 / 20                  | Staff Engineer candidate          |
| 12–15 / 20                  | Senior Engineer candidate         |
| 8–11 / 20                   | Mid-Level Engineer                |
| Below 8 / 20                | Review the weak modules and retry |

## Starter project

A blank SvelteKit project with only the PE7 token system pre-populated in `src/app.css`. Everything else — components, routes, layouts, server endpoints, SEO, tests — the student writes themselves.
