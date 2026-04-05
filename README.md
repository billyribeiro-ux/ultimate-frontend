# Ultimate Frontend

A university-level course that takes a complete beginner from **zero JavaScript** to shipping **production-grade SvelteKit 2** applications using **April 2026 syntax**.

- **Stack:** Svelte 5 · SvelteKit 2 · TypeScript strict mode · PE7 CSS architecture · GSAP · Threlte · TanStack Table · Valibot · Vitest · Playwright
- **Syntax standard:** April 2026 — runes, remote functions, `query.batch()`, async SSR, server error boundaries
- **Target student:** complete beginner — zero JS, zero TS, basic HTML/CSS
- **Philosophy:** root-level understanding — never memorize surface patterns, always understand *why*
- **Package manager:** pnpm exclusively
- **Curriculum:** 13 modules + capstone, ~130 lessons, one mini-build per lesson

## Quick start

```sh
pnpm install
pnpm dev
```

Open http://localhost:5173.

## Repository layout

```
ultimate-frontend/
├── README.md                # this file
├── CURRICULUM.md            # full 13-module lesson index (with Threlte lessons marked)
├── TEMPLATE-lesson.md       # atomic lesson format every lesson must follow
├── src/
│   ├── app.css              # PE7 token system + @layer architecture (Lesson 1.5)
│   ├── routes/              # SvelteKit routes — one folder per module + one route per built lesson
│   └── lib/                 # shared components built across modules
├── lessons/                 # written curriculum — one .md per lesson
│   ├── module-01-foundation/
│   ├── module-02-reactivity/
│   ├── ... through module-13-seo/
│   └── capstone/
│       ├── README.md
│       ├── platform-spec.md # editor + reveal + scoring design doc
│       └── chunks/          # 20 chunk folders with hint/concept/code reveals
└── scripts/                 # one-shot scaffold generators
```

## Current status

This is the **scaffold pass**. What is complete:

- Runnable SvelteKit 2 + Svelte 5 + TypeScript strict project with PE7 `app.css` fully populated
- Module index routes for all 13 modules (each with its own color personality) at `/modules/<slug>`
- **Lesson 1.1 — What Svelte is and why it compiles** — fully written lesson + working mini-build route at `/modules/01-foundation/01-what-is-svelte`
- Stub markdown files for every other lesson (127 stubs) under `lessons/`
- Capstone `registry.ts` with all 20 chunks + folders for every chunk containing `brief.md`, `hint.md`, `concept.md`, `code.md` stubs
- Capstone `platform-spec.md` — design doc for the in-browser editor, reveal system, and score tracking
- `CURRICULUM.md` — complete 13-module outline with Three.js/Threlte integration points marked in **Modules 7, 12, and 13**

What is **not** yet complete:

- Lessons 1.2 through 13.15 (stubs only)
- Capstone reveal content (stubs only)
- The in-browser editor / reveal UI implementation
- Vitest + Playwright test suites

Future passes will fill in each module in order.

## Course principles

- **Atomic lesson unit.** Every lesson has four parts: Concept → Style it (PE7) → Interact → Mini-build.
- **Mobile-first, always.** Every mini-build is tested at 320px, 375px, 768px, 1024px, 1440px. `min-width` media queries only.
- **JS/TS never taught in isolation.** Every JavaScript concept arrives inside a Svelte component solving a real UI problem.
- **PE7 CSS architecture is non-negotiable.** OKLCH colors, `@layer` cascade, fluid `clamp()` typography, scoped `<style>` blocks, logical properties.
- **TypeScript strict from day one.** No `any`. Every lesson compiles under `tsc --strict`.

## Reading order

1. Read [`CURRICULUM.md`](./CURRICULUM.md) for the full 13-module outline.
2. Read [`TEMPLATE-lesson.md`](./TEMPLATE-lesson.md) to understand how every lesson is structured.
3. Start with [`lessons/module-01-foundation/lesson-1.1-what-is-svelte.md`](./lessons/module-01-foundation/lesson-1.1-what-is-svelte.md) — the fully-written exemplar lesson.
4. Run `pnpm dev` and navigate to `/modules/01-foundation/01-what-is-svelte` to see the mini-build in action.

## License

TBD.
