# Ultimate Frontend — Full Curriculum

**Stack:** Svelte 5 · SvelteKit 2 · TypeScript strict · PE7 CSS · GSAP · Threlte · TanStack Table · Valibot · Vitest · Playwright
**Syntax:** May 2026 — Svelte 5.55+, SvelteKit 2.60+, Vite 8, TypeScript 6
**Package manager:** pnpm exclusively
**Three.js integration:** woven into Modules 7, 12, and 13 — see **🔺** markers below

---

## Module 1 — The Foundation

Student writes their first typed, styled, mobile-first Svelte component.

- 1.1 — What Svelte is and why it compiles ✅ **ready**
- 1.2 — Project setup with pnpm + SvelteKit 2 + TypeScript strict mode
- 1.3 — The three blocks: `<script lang="ts">`, markup, `<style>`
- 1.4 — TypeScript type annotations on variables
- 1.5 — PE7 CSS architecture: `@layer`, OKLCH tokens, mobile-first baseline
- 1.6 — Fluid typography and spacing with `clamp()`
- 1.7 — Scoped `<style>` blocks — how Svelte's CSS scoping works
- 1.8 — TypeScript interfaces — defining object shapes
- 1.9 — Passing data into the template with `{}` expressions

**Module project:** Personal Portfolio Card.

## Module 2 — Reactivity

Student masters every Svelte 5 rune.

- 2.1 — What state is and why it exists
- 2.2 — `$state` with primitive types
- 2.3 — `$state` with objects
- 2.4 — `$state` with arrays — JS array methods
- 2.5 — `$state.raw()` — non-deep reactive state
- 2.6 — `$state.snapshot()` — serializing reactive state
- 2.7 — `$derived()` — pure functions introduced naturally
- 2.8 — `$derived.by()` — complex derived computations
- 2.9 — `$effect()` — side effects and the JS execution model
- 2.10 — `$effect.pre()` — pre-DOM-update effects
- 2.11 — `$effect` cleanup — preventing memory leaks
- 2.12 — Reactivity with CSS — dynamic styles and class bindings
- 2.13 — TypeScript with reactive state

**Module project:** Interactive Dashboard.

## Module 3 — Components & Props

- 3.1 — What components are and why they exist
- 3.2 — `$props()` — passing data into components
- 3.3 — TypeScript interfaces for props
- 3.4 — Optional props and default values
- 3.5 — `$bindable()` — two-way data binding
- 3.6 — Snippets — `{#snippet}` and `{@render}`
- 3.7 — Passing snippets as props
- 3.8 — Component composition patterns
- 3.9 — CSS custom properties as the bridge
- 3.10 — Responsive components with container queries

**Module project:** UI Component Library Part 1.

## Module 4 — Control Flow

- 4.1 — `{#if}` — conditional rendering and JS boolean logic
- 4.2 — `{:else if}` and `{:else}` — multi-branch logic
- 4.3 — `{#each}` — array iteration and destructuring
- 4.4 — `{#each}` with keys — why keys matter
- 4.5 — Nested `{#each}` — iterating nested data
- 4.6 — `{#key}` block — forcing re-renders
- 4.7 — Promises and async/await — the JS async model
- 4.8 — `{#await}` — Svelte's built-in async handling
- 4.9 — Error handling with `{:catch}` and try/catch
- 4.10 — TypeScript with async — `Promise<T>` return types

**Module project:** Dynamic Product Listing.

## Module 5 — Events & Interaction

- 5.1 — Event handlers in Svelte 5 (lowercase `onclick`)
- 5.2 — JS functions deeply — parameters, return values, arrow functions
- 5.3 — TypeScript event types
- 5.4 — `preventDefault` and `stopPropagation`
- 5.5 — Forwarding events from child to parent
- 5.6 — Closures in event handlers
- 5.7 — Debouncing and throttling
- 5.8 — Custom events and the callback prop pattern
- 5.9 — Touch events and mobile interaction patterns
- 5.10 — Form accessibility and keyboard navigation

**Module project:** Interactive Form with Live Validation.

## Module 6 — Styling Mastery

- 6.1 — PE7 `@layer` architecture in full depth
- 6.2 — OKLCH color system in depth
- 6.3 — Design token system — spacing, typography, motion, radii, shadows
- 6.4 — Native CSS nesting in Svelte `<style>` blocks
- 6.5 — Logical properties — writing-direction-agnostic CSS
- 6.6 — Responsive layout patterns — CSS Grid
- 6.7 — Responsive layout patterns — Flexbox
- 6.8 — Container queries — component-level responsiveness
- 6.9 — Per-page color personalities
- 6.10 — CSS transitions with motion tokens
- 6.11 — Svelte `transition:` directive — fade, fly, slide, scale, blur, draw
- 6.12 — `in:` and `out:` — different enter and exit animations
- 6.13 — `animate:flip` — list reordering animations
- 6.14 — `svelte/motion` — `tweened` for value interpolation
- 6.15 — `svelte/motion` — `spring` for physics-based motion
- 6.16 — Custom transition functions
- 6.17 — Transition parameters, easing, and stagger patterns
- 6.18 — `@media (prefers-reduced-motion)` — accessible animation

**Module project:** Animated Landing Page.

## Module 7 — GSAP & Threlte 🔺

Student learns where Svelte's built-in animation system ends and GSAP / 3D take over.

- 7.1 — What GSAP is and when to reach for it
- 7.2 — Installing GSAP with pnpm and TypeScript types
- 7.3 — `gsap.to()`, `gsap.from()`, `gsap.fromTo()`
- 7.4 — GSAP Timelines — sequencing multiple animations
- 7.5 — `bind:this` — getting DOM element references in Svelte
- 7.6 — `$effect` as the bridge — triggering GSAP from reactive state
- 7.7 — GSAP cleanup in `$effect` return functions
- 7.8 — Stagger animations
- 7.9 — ScrollTrigger — installing and configuring with SvelteKit
- 7.10 — ScrollTrigger with SvelteKit navigation
- 7.11 — Svelte `use:` actions and the attachment pattern
- 7.12 — Building a scroll reveal action
- 7.13 — GSAP + Svelte transitions together
- 🔺 **7.14 — Introducing Threlte — 3D in Svelte.** What WebGL / Three.js / Threlte are; `pnpm add three @threlte/core @threlte/extras`; first `<Canvas>`, `<T.Mesh>`, `<T.PerspectiveCamera>`; GSAP driving a rotating mesh via `$effect` + `bind:this`. **Mini-build:** a spinning PE7-colored torus reacting to scroll via ScrollTrigger.

**Module project:** Premium Marketing Page.

## Module 8 — SvelteKit Routing & Layouts

- 8.1 — What SvelteKit adds to Svelte
- 8.2 — What SSR actually is
- 8.3 — What Hydration actually is
- 8.4 — File-based routing — how files become pages
- 8.5 — Nested layouts
- 8.6 — Dynamic routes — `[slug]` and `[...rest]`
- 8.7 — `$app/state` — reactive page state
- 8.8 — `$app/navigation` — programmatic navigation
- 8.9 — `hooks.server.ts` — server-side request lifecycle
- 8.10 — `instrumentation.server.ts` — OpenTelemetry support
- 8.11 — Page transitions — animating between routes
- 8.12 — The four rendering modes in depth (SSR, SSG, CSR, Hybrid)

**Module project:** Multi-Page Portfolio Site.

## Module 9A — Data Loading (traditional `load()`)

- 9A.1 — What load functions are and why they exist
- 9A.2 — `+page.ts` vs `+page.server.ts`
- 9A.3 — Auto-generated `$types` — end-to-end type safety
- 9A.4 — `fetch` inside load — SvelteKit's enhanced fetch
- 9A.5 — Layout data — `+layout.ts` and `+layout.server.ts`
- 9A.6 — Parallel data loading
- 9A.7 — `depends()` and `invalidate()` — manual cache control
- 9A.8 — Error handling in load — `error()` and `redirect()`
- 9A.9 — Streaming with Promise returns — progressive rendering
- 9A.10 — SSG — Static Site Generation with `prerender`

**Module project:** Weather Dashboard.

## Module 9B — Remote Functions ✨ April 2026

- 9B.1 — What Remote Functions are and why they exist
- 9B.2 — `query` remote functions — reading data
- 9B.3 — `query` with arguments — parameterized queries
- 9B.4 — `query.batch()` — batching multiple server calls
- 9B.5 — `form` remote functions — server-side form handling with Valibot
- 9B.6 — File upload streaming in form remote functions
- 9B.7 — `command` remote functions — mutations
- 9B.8 — `query.set()` — server-driven reactive state
- 9B.9 — Async SSR — `await` directly in components
- 9B.10 — Remote functions vs `load()` vs `+server.ts` — choosing the right tool

**Module project:** Real-Time Data Application.

## Module 10 — API Routes & Forms

- 10.1 — `+server.ts` — building API endpoints
- 10.2 — TypeScript in API routes
- 10.3 — Form actions — `+page.server.ts` and the `actions` export
- 10.4 — Named actions — multiple forms on one page
- 10.5 — `use:enhance` — progressive enhancement
- 10.6 — Server-side validation and `ActionData`
- 10.7 — Environment variables in SvelteKit
- 10.8 — File uploads via form actions

**Module project:** Full CRUD Note-Taking App.

## Module 11 — State Management at Scale

- 11.1 — The prop drilling problem
- 11.2 — Svelte context API — `setContext` and `getContext`
- 11.3 — `.svelte.ts` files — universal reactive state
- 11.4 — Shared `$state` across pages
- 11.5 — Reactive classes with runes
- 11.6 — URL as state — `$page.url.searchParams`
- 11.7 — TanStack Table — headless table logic
- 11.8 — TanStack Table — sorting, filtering, pagination
- 11.9 — TanStack Table with TypeScript — advanced typing
- 11.10 — Optimistic UI — updating before the server responds

**Module project:** Admin Dashboard.

## Module 12 — Performance & Production Patterns 🔺

- 12.1 — Performance fundamentals — Core Web Vitals (LCP, CLS, INP)
- 12.2 — Image optimization
- 12.3 — Code splitting and lazy loading
- 12.4 — `$effect` performance — avoiding unnecessary re-runs
- 12.5 — Memoization with `$derived`
- 12.6 — Reusable Svelte actions — `use:`
- 12.7 — Error boundaries — `<svelte:boundary>` (incl. server-side, kit 2.54+)
- 12.8 — Accessibility — ARIA, keyboard navigation, focus management
- 12.9 — Testing with Vitest — unit testing
- 12.10 — E2E testing with Playwright
- 12.11 — Deployment — adapters and platforms
- 🔺 **12.12 — 3D Performance with Threlte.** When 3D is worth it, when it tanks INP; `<Canvas>` lazy loading via dynamic import; DPR clamping; `frameloop="demand"`; on-visible pausing; GPU memory profiling. **Mini-build:** a lazy-loaded 3D hero that respects `prefers-reduced-motion`.

**Module project:** Production-Ready SvelteKit Application.

## Module 13 — SEO 🔺

Aligned with Google's March/April 2026 updates (Core Update, Spam Update, E-E-A-T, INP as ranking factor, AI Overviews).

- 13.1 — Why SvelteKit is already an SEO advantage
- 13.2 — `<svelte:head>` — the foundation
- 13.3 — Building a reusable typed SEO component
- 13.4 — Open Graph & Twitter Cards
- 13.5 — SEO data from `load()` functions
- 13.6 — JSON-LD structured data — `Course`, `Article`, `Organization`, `BreadcrumbList`, `FAQPage`
- 13.7 — E-E-A-T signals in markup
- 13.8 — Dynamic sitemap generation
- 13.9 — Robots.txt
- 13.10 — Core Web Vitals optimization in SvelteKit
- 13.11 — Prerendering for SEO
- 13.12 — AI Search Optimization (AEO/GEO)
- 13.13 — Trailing slashes, redirects, canonical issues
- 13.14 — Google Search Console integration
- 🔺 **13.15 — 3D & SEO: invisible canvas content and LCP fixes.** Canvas content is invisible to crawlers; SSR-safe textual fallbacks via `<svelte:boundary>` and `<noscript>`; LCP strategy when the hero is a WebGL canvas (poster image + hydrate). **Mini-build:** a hero section with a 3D scene that still ships a 100 SEO score.

**Module project:** SEO-Optimized Multi-Page Content Site.

---

## Module 14 — 3D with Threlte 🔺

Student builds production-ready 3D experiences with Threlte from scene fundamentals through physics, post-processing, and performance optimization.

- 14.1 — What Threlte is (Three.js abstraction for Svelte 5, `<Canvas>`, `<T.*>` components, declarative scene graph)
- 14.2 — Scene fundamentals (PerspectiveCamera, OrbitControls, DirectionalLight, AmbientLight, MeshStandardMaterial)
- 14.3 — Loading 3D models (GLTF/GLB via `useGltf` from @threlte/extras, loading states, error handling)
- 14.4 — Interactivity (`interactivity` plugin from @threlte/extras, onclick/onpointerenter on meshes, cursor changes)
- 14.5 — Scroll-driven 3D scenes (GSAP ScrollTrigger driving camera position and mesh rotation via $effect)
- 14.6 — Post-processing (EffectComposer from @threlte/extras, bloom, vignette, chromatic aberration)
- 14.7 — Physics with Rapier (@threlte/rapier, RigidBody, Collider, gravity, bounce, user interaction)
- 14.8 — Production 3D (lazy loading, DPR clamping, frameloop="demand", dispose patterns, prefers-reduced-motion fallback to poster image, SSR safety with `{#if browser}`)

**Module project:** 3D Product Showcase.

---

## Capstone — The PE7 Flagship Project 🏁

See [`lessons/capstone/README.md`](./lessons/capstone/README.md) and [`lessons/capstone/platform-spec.md`](./lessons/capstone/platform-spec.md).

20 pre-divided chunks with a three-level reveal system (hint → concept → code) and a 15-minute time gate. Final score maps to engineer tier (Distinguished → Staff → Senior → Mid-Level → retry).

---

## Threlte / 3D lesson summary

| Lesson   | Module   | Focus                                                      |
| -------- | -------- | ---------------------------------------------------------- |
| 7.14     | GSAP     | Threlte setup, first `<Canvas>`, GSAP-driven 3D scroll     |
| 12.12    | Perf     | Lazy canvas, DPR, `frameloop="demand"`, reduced-motion     |
| 13.15    | SEO      | SSR fallbacks for canvas content, LCP strategy for WebGL   |
| 14.1     | Threlte  | What Threlte is — declarative scene graph, `<T.*>`         |
| 14.2     | Threlte  | Scene fundamentals — camera, lights, PBR materials         |
| 14.3     | Threlte  | Loading GLTF/GLB models with useGltf                       |
| 14.4     | Threlte  | Interactivity — raycasting, pointer events on meshes       |
| 14.5     | Threlte  | Scroll-driven 3D via GSAP ScrollTrigger                    |
| 14.6     | Threlte  | Post-processing — bloom, vignette, chromatic aberration    |
| 14.7     | Threlte  | Physics with Rapier — RigidBody, Collider, gravity         |
| 14.8     | Threlte  | Production 3D — lazy load, DPR clamp, demand frameloop     |

All use `@threlte/core` and `@threlte/extras` — installed with `pnpm add three @threlte/core @threlte/extras`. Physics lessons also require `pnpm add @threlte/rapier`.

---

## Module 18 — Advanced Patterns & Architecture

Student masters principal-engineer-level patterns for scalable design systems, tooling, and multi-app architectures.

- 18.1 — Compound components
- 18.2 — Polymorphic components
- 18.3 — Headless components
- 18.4 — State machines with runes
- 18.5 — Micro-frontends with SvelteKit
- 18.6 — Custom preprocessors
- 18.7 — Build-time data with Vite plugins
- 18.8 — Advanced TypeScript patterns in Svelte
- 18.9 — Performance profiling and optimization
- 18.10 — Monorepo architecture

**Module project:** Advanced Design System.

---

## Module 19 — Internationalization (i18n)

Student builds a production-ready multi-language application with locale-aware formatting, RTL layout, and SEO hreflang.

- 19.1 — What i18n means and why it's hard
- 19.2 — Message extraction and ICU MessageFormat
- 19.3 — Paraglide.js with SvelteKit
- 19.4 — Locale routing strategies
- 19.5 — Formatting dates, numbers, and currencies
- 19.6 — RTL and bidirectional text
- 19.7 — Pluralization and gender
- 19.8 — i18n SEO and performance

**Module project:** Multi-language Marketing Site.

---

## Module 20 — Testing Deep Dive

Student builds a comprehensive testing strategy from unit tests through CI/CD pipelines.

- 20.1 — Testing philosophy (pyramid, behavior vs implementation, coverage lies)
- 20.2 — Vitest configuration for SvelteKit
- 20.3 — Unit testing .svelte.ts stores (reactive classes with runes)
- 20.4 — Component testing with @testing-library/svelte
- 20.5 — Testing async components ({#await}, load(), streaming)
- 20.6 — Testing form actions and API routes
- 20.7 — Playwright fundamentals (locators, auto-waiting, page objects)
- 20.8 — E2E flows: auth, CRUD, navigation
- 20.9 — Visual regression testing (screenshots, snapshots)
- 20.10 — CI/CD testing pipeline (GitHub Actions workflow)

**Module project:** Full-Stack Test Suite.
