# Architecture Decision Records

> 15 ADRs documenting the key technical decisions for a production SvelteKit application. Use these as references when making similar decisions in your own projects.

---

## ADR Template

Use this template when documenting architecture decisions for your team. The goal is to capture not just what you decided, but why — so future developers understand the trade-offs.

```markdown
**Title:** [short decision name — a noun phrase, not a question]
**Status:** Accepted | Superseded | Deprecated
**Context:** [what prompted this decision — 3-4 sentences describing the problem, constraints, and forces at play]
**Decision:** [what we chose — 1-2 sentences stating the choice clearly]
**Consequences:** [what follows from this — good and bad, 3-4 bullets]
**Alternatives considered:** [what we rejected and why — 2-3 alternatives with brief rationale for rejection]
```

---

## ADR-001: SSR vs SSG for Product Pages

**Title:** Server-Side Rendering for product detail pages
**Status:** Accepted

**Context:** Our e-commerce application displays product detail pages with prices, inventory counts, reviews, and dynamic recommendations. Prices update several times per day based on supplier feeds. Inventory changes in real time as customers purchase items. We need these pages to be indexable by search engines (critical for organic traffic) and display accurate data to prevent overselling. We considered building the entire product catalog as static pages for CDN-edge performance.

**Decision:** We will use SSR (`export const ssr = true`, the SvelteKit default) for all product detail pages, with aggressive `Cache-Control` headers (`s-maxage=60, stale-while-revalidate=300`) at the CDN layer.

**Consequences:**
- Product pages always show current prices and inventory, preventing customer complaints and overselling
- Pages remain fully indexable by search engines with fresh structured data (JSON-LD)
- Time to First Byte increases by 50-150ms compared to static pages, mitigated by CDN edge caching
- Server infrastructure must handle the full request load during cache misses and traffic spikes
- Database queries run on every uncached request, requiring query optimization and connection pooling

**Alternatives considered:**
- **SSG (Static Site Generation):** Rejected because the product catalog has 50,000+ SKUs with prices that change multiple times daily. Rebuilding all pages on every price change would take 30+ minutes and still serve stale data between builds. ISR (Incremental Static Regeneration) could help but adds complexity and still has a staleness window.
- **CSR (Client-Side Rendering):** Rejected because client-rendered product pages are invisible to search engines during the initial crawl. While Googlebot can render JavaScript, it deprioritizes JS-heavy pages and may crawl them less frequently. Product SEO is a core revenue driver.
- **Hybrid SSR + client refresh:** Considered (SSR for initial load, then client-side fetch for real-time price updates). This adds complexity but is a viable progressive enhancement. We may adopt this pattern in a future iteration if real-time pricing becomes a competitive requirement.

---

## ADR-002: Context API vs .svelte.ts for Shared State

**Title:** Reactive classes in .svelte.ts files for application-wide shared state
**Status:** Accepted

**Context:** Multiple components across different pages need access to shared state: the authenticated user, the shopping cart, UI preferences (theme, sidebar state), and notification counts. We need a pattern that is type-safe, testable, and does not require prop drilling through 5+ component layers. The two primary options in Svelte 5 are the context API (`setContext`/`getContext`) and module-level reactive state in `.svelte.ts` files.

**Decision:** We will use reactive classes in `.svelte.ts` files for application-wide singleton state, and reserve the context API for subtree-scoped state that varies per component instance.

**Consequences:**
- Singleton state is importable from anywhere without prop drilling or context boilerplate
- Reactive classes with `$state` and `$derived` provide full TypeScript inference and autocomplete
- State is easily testable — import the class, instantiate it, call methods, assert results
- SSR requires careful handling — module-level singletons persist across requests on the server, so server-specific state (user sessions) must use context or request-scoped patterns
- New developers must understand the distinction between "app-wide" (`.svelte.ts`) and "subtree-scoped" (context) state

**Alternatives considered:**
- **Context API for everything:** Rejected because context is scoped to the component tree. Accessing context requires being inside a component's initialization — it cannot be used in standalone utility functions, API route handlers, or tests without mounting a component. Context also requires passing the reactive object, not the value, which is a common source of bugs.
- **URL state (searchParams) for everything:** Rejected for most state because URLs are visible to users and limited in size. URL state is appropriate for shareable state (filters, pagination, search queries) but not for transient UI state (sidebar open/closed) or sensitive data (auth tokens).

---

## ADR-003: load() vs Remote Functions for Dashboard Data

**Title:** Remote functions (query) for the dashboard data layer
**Status:** Accepted

**Context:** Our admin dashboard displays 8 different data panels (user metrics, revenue charts, recent orders, activity feed, server health, etc.), each requiring a separate database query. With traditional `load()` functions, all data must be fetched before the page renders. The dashboard is internal-facing (not SEO-critical) and used by authenticated admin users who expect real-time-ish data. SvelteKit's remote functions feature (introduced May 2026) offers a new pattern for data loading.

**Decision:** We will use `query` remote functions for each dashboard panel, allowing independent loading, caching, and invalidation per panel.

**Consequences:**
- Each panel loads independently — fast panels appear immediately while slow ones show skeleton loaders
- Individual panels can be invalidated without refetching all dashboard data
- `query.batch()` allows combining multiple queries into a single network request when desired
- The pattern is newer (May 2026) with a smaller community ecosystem and fewer examples available
- Requires SvelteKit 2.60+ and may have behavior changes in minor releases during the stabilization period

**Alternatives considered:**
- **Traditional load() with parallel fetching:** Rejected because `load()` must return all data before the page renders. Even with parallel `Promise.all()`, the slowest query blocks the entire page. Streaming with deferred promises is possible but more complex and less ergonomic than remote functions.
- **Client-side fetch in $effect:** Rejected because this approach has no SSR benefit, requires manual loading/error states, and duplicates data-fetching logic that remote functions handle declaratively. It also creates waterfall issues — the page renders, then JavaScript loads, then fetches fire.

---

## ADR-004: Form Actions vs Remote Form for Checkout

**Title:** SvelteKit form actions with use:enhance for the checkout flow
**Status:** Accepted

**Context:** The checkout process involves a multi-step form: shipping address, payment method selection, order review, and confirmation. The form must work without JavaScript (progressive enhancement) for accessibility and resilience. It handles sensitive data (addresses, payment tokens) that must be processed server-side. We considered both SvelteKit's native form actions and remote `form` functions.

**Decision:** We will use SvelteKit form actions (`+page.server.ts` actions export) with `use:enhance` for progressive enhancement.

**Consequences:**
- Checkout works without JavaScript — critical for users on slow connections, older devices, or with JS disabled
- Built-in CSRF protection via SvelteKit's Origin header checking
- Server-side validation with Valibot runs before any data processing, returning typed errors via `fail()`
- `use:enhance` provides client-side optimistic UI without sacrificing the HTML form fallback
- Form actions are page-scoped, which maps naturally to the multi-step checkout flow (one page per step)

**Alternatives considered:**
- **Remote `form` functions:** Considered because they offer a more ergonomic API with built-in Valibot integration. However, remote forms require JavaScript — they do not have the native HTML form fallback. For a checkout flow where payment processing must succeed regardless of client-side conditions, progressive enhancement is non-negotiable.
- **Client-side fetch to API routes:** Rejected because it provides no progressive enhancement, requires manual CSRF handling, and separates form logic from page logic. API routes are better suited for programmatic access (webhooks, mobile apps) than user-facing forms.

---

## ADR-005: Drizzle vs Prisma for Database ORM

**Title:** Drizzle ORM for database access
**Status:** Accepted

**Context:** Our application needs a TypeScript ORM for PostgreSQL access. We need type-safe queries, migrations, and a schema definition language that integrates with our TypeScript-strict codebase. The two leading options are Prisma and Drizzle. Our team has experience with both. The application runs on both Node.js (adapter-node) and edge runtimes (Cloudflare Workers for some microservices), which constrains our ORM choice.

**Decision:** We will use Drizzle ORM with the `drizzle-kit` migration tool for all database access.

**Consequences:**
- Drizzle generates SQL-like TypeScript queries that map 1:1 to the underlying SQL, making debugging straightforward
- Bundle size is significantly smaller than Prisma (~30KB vs ~2MB), critical for edge deployment
- No binary engine required — Drizzle runs in any JavaScript runtime, including Cloudflare Workers and Deno
- Drizzle's relational query API provides type-safe joins without the N+1 problems common in naive ORMs
- Migration workflow is less polished than Prisma Migrate — `drizzle-kit` requires more manual oversight

**Alternatives considered:**
- **Prisma:** Rejected primarily because of the binary engine requirement (~15MB), which prevents deployment to edge runtimes. Prisma's query engine also adds 200-500ms cold start on serverless. The Prisma Data Proxy solves this but adds another service dependency and latency.
- **Raw SQL with typed wrappers:** Considered for maximum control and performance. Rejected because hand-written SQL lacks the type safety guarantees of an ORM — schema changes do not produce compile-time errors in queries, leading to runtime failures.

---

## ADR-006: adapter-node vs adapter-vercel vs adapter-cloudflare

**Title:** adapter-node as the primary deployment adapter with adapter-vercel for preview environments
**Status:** Accepted

**Context:** Our application needs to run in production with server-side rendering, form actions, API routes, WebSocket support (for real-time features), and long-lived database connections. We deploy to a Kubernetes cluster for production but want easy preview deployments for pull requests. The choice of adapter determines our runtime environment, available APIs, and operational constraints.

**Decision:** We will use `adapter-node` for production deployment on Kubernetes, and `adapter-vercel` for PR preview environments.

**Consequences:**
- Full Node.js runtime in production — access to `fs`, `child_process`, `net`, and other Node APIs
- WebSocket support is native with adapter-node (not available on serverless platforms)
- Long-lived database connection pools reduce query latency vs. serverless cold connections
- Kubernetes provides horizontal scaling, health checks, and rolling deployments
- Preview environments on Vercel provide instant PR previews without Kubernetes overhead
- Two adapters means two slightly different runtime environments to test against

**Alternatives considered:**
- **adapter-vercel for everything:** Rejected because Vercel's serverless functions have a 10-second timeout (or 60s on Pro), which is insufficient for our long-running data export endpoints. Vercel also does not support native WebSockets (requires workarounds). Cost scales linearly with invocations, which becomes expensive at our traffic levels.
- **adapter-cloudflare:** Rejected because Cloudflare Workers use the V8 isolate runtime, not Node.js. Many npm packages (including some of our dependencies) assume Node.js APIs. The Worker size limit (10MB compressed on paid plans) is restrictive for our application. Cloudflare is excellent for edge-first apps but constraining for a full-stack Node.js application.

---

## ADR-007: TanStack Table vs Custom Table Component

**Title:** TanStack Table v9 for data-intensive table views
**Status:** Accepted

**Context:** Our admin dashboard displays tabular data with sorting, filtering, pagination, column resizing, row selection, and CSV export. The tables handle datasets from 100 to 50,000 rows. We considered building a custom table component from scratch to maintain full control over the implementation, versus adopting TanStack Table's headless table logic.

**Decision:** We will use TanStack Table v9 with its Svelte adapter for all data-intensive table views, wrapping it in a custom `<DataTable>` component for consistent styling and behavior.

**Consequences:**
- Sorting, filtering, pagination, and column management are handled by a battle-tested library
- Headless architecture means we control all markup and styling — no fighting with opinionated component libraries
- TypeScript generics provide end-to-end type safety from data source to cell renderer
- The learning curve is significant — TanStack Table's API is powerful but complex (`Updater<T>` pattern, column def generics, feature flags)
- Upgrading TanStack Table major versions requires adapting to API changes across all table usages

**Alternatives considered:**
- **Custom table component:** Rejected because building production-quality sorting (multi-column, stable sort), filtering (per-column, global, custom matchers), pagination (client-side and server-side), column resizing, and virtualization from scratch would take 2-3 months. TanStack Table provides all of this with extensive edge-case handling.
- **AG Grid / Handsontable:** Rejected because opinionated table components bundle their own markup and CSS, making it difficult to match our PE7 design system. License costs for AG Grid Enterprise are significant. The headless approach of TanStack Table is a better fit for a custom design system.

---

## ADR-008: GSAP vs Svelte Transitions for Marketing Pages

**Title:** GSAP for scroll-driven and orchestrated marketing page animations
**Status:** Accepted

**Context:** Our marketing pages require complex, scroll-driven animations: text reveals that stagger by line, parallax backgrounds, pinned sections that animate as the user scrolls, and orchestrated multi-element timelines. Svelte provides built-in transitions (`transition:fade`, `transition:fly`, etc.) and the `spring`/`tweened` motion primitives. We need to decide whether these are sufficient for marketing-grade animation or whether we need GSAP.

**Decision:** We will use GSAP with ScrollTrigger for scroll-driven and orchestrated animations on marketing pages, and use Svelte's built-in transitions for simple enter/exit animations in the application UI.

**Consequences:**
- GSAP provides sub-millisecond timing control, timeline orchestration, and ScrollTrigger for scroll-driven animations
- Marketing animations match the quality bar of studios that charge premium rates for motion design
- GSAP adds ~25KB (gzipped) to the bundle — acceptable for marketing pages, loaded lazily for app pages
- Developers need to learn GSAP's API in addition to Svelte's transition system — two animation models to maintain
- GSAP cleanup in `$effect` is essential — ScrollTrigger instances must be killed on navigation to prevent memory leaks

**Alternatives considered:**
- **Svelte transitions only:** Rejected for marketing pages because Svelte transitions are component-lifecycle-based (enter/exit). They cannot orchestrate multi-element timelines, do not support scroll-driven triggering natively, and lack the easing library and physics simulation that GSAP provides. Svelte transitions are excellent for UI micro-interactions but insufficient for cinematic scroll experiences.
- **CSS animations with Intersection Observer:** Considered as a zero-JS approach. Rejected because CSS `@keyframes` cannot be scrubbed by scroll position, cannot orchestrate timelines across elements, and have limited easing options. Intersection Observer only provides binary "in view / not in view" — not the continuous scroll progress that ScrollTrigger provides.

---

## ADR-009: Valibot vs Zod for Schema Validation

**Title:** Valibot for runtime schema validation
**Status:** Accepted

**Context:** We need runtime validation for form submissions, API request bodies, environment variables, and external API responses. The schema definitions should integrate with TypeScript's type system to avoid maintaining types and validation rules separately. The two leading options are Zod (established, large ecosystem) and Valibot (newer, significantly smaller bundle). Our application is performance-sensitive and deployed to edge environments where bundle size matters.

**Decision:** We will use Valibot for all runtime validation, using its tree-shakeable architecture to minimize bundle impact.

**Consequences:**
- Valibot's tree-shakeable design means we only ship the validation functions we use — typical bundle impact is 1-3KB vs. Zod's ~12KB baseline
- Type inference works identically to Zod — `v.InferOutput<typeof schema>` produces the validated TypeScript type
- Valibot integrates with SvelteKit's form actions and remote `form` functions for server-side validation
- Smaller community and ecosystem than Zod — fewer third-party integrations, fewer Stack Overflow answers
- Migration from Zod is straightforward — the API is similar, with `v.object()`, `v.string()`, `v.pipe()` replacing `z.object()`, `z.string()`, `.refine()`

**Alternatives considered:**
- **Zod:** Zod is the industry standard with excellent documentation and ecosystem support (trpc, react-hook-form, etc.). Rejected primarily on bundle size — Zod's 12KB baseline is acceptable for server-side-only validation but adds up in client-side bundles, especially on edge deployments. If our app were server-only, Zod would be a fine choice.
- **ArkType:** Considered as a compile-time-focused alternative. Rejected because its API diverges significantly from Zod/Valibot patterns, has a steeper learning curve, and the ecosystem is still maturing.

---

## ADR-010: Monorepo vs Polyrepo for Multi-App Architecture

**Title:** pnpm workspace monorepo for the multi-application platform
**Status:** Accepted

**Context:** Our platform consists of three applications: the customer-facing storefront, the admin dashboard, and the marketing site. They share a design system, TypeScript types, database schema, and utility functions. We need to decide whether to maintain these in a single repository (monorepo) or separate repositories (polyrepo). Team size is 8 developers across 3 squads.

**Decision:** We will use a pnpm workspace monorepo with the following structure: `apps/storefront`, `apps/admin`, `apps/marketing`, `packages/ui`, `packages/types`, `packages/db`.

**Consequences:**
- Shared packages are linked locally with `workspace:*` — changes propagate immediately without publishing
- A single `pnpm install` sets up the entire development environment
- Atomic commits across apps and packages ensure consistency — a type change in `packages/types` can be updated in all three apps in one PR
- CI/CD must be configured to detect which apps/packages changed and only rebuild affected targets (Turborepo or pnpm filtering)
- The repository grows larger over time, requiring attention to clone times, CI cache strategies, and developer tooling

**Alternatives considered:**
- **Polyrepo (separate repositories):** Rejected because shared code (design system, types, utilities) would need to be published to a private npm registry and versioned independently. This creates a coordination tax — changing a shared type requires publishing a new package version, then updating each consuming app's dependency. With 8 developers and rapid iteration, this coordination overhead is unacceptable.
- **Git submodules:** Rejected because submodules add complexity to git workflows (checkout, branching, CI) without solving the dependency management problem. Developers frequently forget to update submodule pointers, leading to stale shared code.

---

## ADR-011: PE7 @layer Architecture vs Tailwind for CSS

**Title:** PE7 CSS architecture with @layer for the design system
**Status:** Accepted

**Context:** We need a CSS architecture that scales across three applications with a shared design system. The architecture must support scoped component styles (Svelte's `<style>` blocks), a global token system (colors, spacing, typography), and predictable cascade ordering. The team has experience with both utility-class CSS (Tailwind) and token-based architectures.

**Decision:** We will use the PE7 CSS architecture: `@layer reset, tokens, base, components, utilities` with OKLCH color tokens, fluid typography, and CSS custom properties as the styling API between components.

**Consequences:**
- `@layer` provides deterministic cascade ordering — utility overrides component overrides base overrides reset, regardless of source order
- OKLCH color system provides perceptually uniform color manipulation — adjusting lightness produces predictable results across the gamut
- CSS custom properties as component API means consumers customize with `--btn-bg: oklch(...)` instead of class overrides
- No build step required for CSS — no PostCSS, no purging, no JIT compilation
- The team must learn OKLCH (unfamiliar color model), `@layer` (newer CSS feature), and fluid `clamp()` (requires mathematical intuition)

**Alternatives considered:**
- **Tailwind CSS:** Rejected for several reasons: (1) utility classes in Svelte templates conflict with Svelte's scoped `<style>` philosophy — you end up with two styling systems; (2) Tailwind's class-based approach does not compose well with `@layer` ordering; (3) the design system needs precise color control with OKLCH, which Tailwind's color palette does not support natively; (4) Tailwind's purge step adds build complexity. Tailwind is excellent for rapid prototyping but works against Svelte's component model for a production design system.
- **CSS Modules:** Rejected because Svelte already provides scoped CSS via `<style>` blocks. Adding CSS Modules on top would mean two scoping mechanisms with different rules, confusing developers and adding configuration overhead.

---

## ADR-012: Vitest vs Jest for Unit Testing

**Title:** Vitest as the unit and integration test runner
**Status:** Accepted

**Context:** We need a test runner for unit tests (utility functions, reactive stores, validation schemas), component tests (rendering, interaction, snapshot), and integration tests (API route handlers, form actions). The test runner must integrate with our Vite-based build pipeline, support TypeScript without separate compilation, and run fast enough for watch mode during development.

**Decision:** We will use Vitest for all unit and integration tests, with @testing-library/svelte for component tests.

**Consequences:**
- Vitest shares Vite's transform pipeline — TypeScript, Svelte files, and import aliases (`$lib`, `$env`) work without additional configuration
- Watch mode uses Vite's module graph for targeted re-runs — only tests affected by a file change re-execute
- `vi.mock()`, `vi.spyOn()`, and timer mocking provide comprehensive test double support
- Vitest's API is Jest-compatible (`describe`, `it`, `expect`, `beforeEach`), minimizing learning curve for developers with Jest experience
- `.svelte.ts` files with runes can be tested directly — Vitest processes them through the Svelte compiler

**Alternatives considered:**
- **Jest:** Rejected because Jest requires separate TypeScript compilation (`ts-jest` or `@swc/jest`), does not understand Svelte files natively (requires `svelte-jester`), and does not support Vite's import aliases without manual configuration. Jest is also slower in watch mode because it cannot leverage Vite's module graph for targeted invalidation.
- **Playwright Test for everything:** Considered running all tests as browser-based E2E tests. Rejected because E2E tests are 10-100x slower than unit tests, require a running dev server, and provide less precise error messages. Playwright is excellent for E2E but overkill for testing a pure function or a reactive class.

---

## ADR-013: SSE vs WebSocket for Real-Time Features

**Title:** Server-Sent Events (SSE) for real-time notifications and data updates
**Status:** Accepted

**Context:** Our application needs real-time features: notification badges, live activity feeds, and dashboard metric updates. The update frequency is moderate (1-10 messages per second per client). Communication is primarily server-to-client — the client rarely needs to send real-time messages to the server (form submissions and API calls handle that). We need to choose between WebSocket (full-duplex) and SSE (server-to-client streaming).

**Decision:** We will use Server-Sent Events via SvelteKit's streaming response API for real-time server-to-client updates, combined with `invalidate()` for cache refresh on data changes.

**Consequences:**
- SSE works over standard HTTP — no special server configuration, no WebSocket upgrade handling, no sticky sessions
- Automatic reconnection is built into the `EventSource` API — the browser handles disconnects and retries transparently
- SSE integrates with SvelteKit's `+server.ts` endpoints using standard `ReadableStream` responses
- Server-to-client only — if we need client-to-server real-time messaging (chat, collaborative editing), SSE is insufficient
- SSE connections count against the browser's per-domain connection limit (6 in HTTP/1.1, unlimited in HTTP/2)

**Alternatives considered:**
- **WebSocket:** Rejected for our current requirements because WebSocket adds infrastructure complexity (load balancer configuration, sticky sessions or Redis pubsub for horizontal scaling, custom reconnection logic). WebSocket is the right choice for bidirectional real-time communication (chat, collaborative editing, multiplayer games) but is over-engineered for our server-push notification use case.
- **Polling:** Rejected because polling wastes bandwidth (sending requests even when nothing has changed), has latency proportional to the polling interval, and creates unnecessary server load. With 1,000 connected clients polling every 5 seconds, that is 200 requests/second of wasted work. SSE maintains one connection per client with zero overhead when idle.

---

## ADR-014: Paraglide vs i18next for Internationalization

**Title:** Paraglide.js for internationalization
**Status:** Accepted

**Context:** Our application needs to support 4 languages (English, Spanish, French, German) with locale-specific formatting for dates, numbers, and currencies. The translation workflow must support external translators (non-developers) and integrate with SvelteKit's routing. Message extraction, type-safe translation keys, and tree-shaking of unused translations are all requirements.

**Decision:** We will use Paraglide.js with the SvelteKit adapter for compile-time internationalization.

**Consequences:**
- Paraglide compiles translations into tree-shakeable JavaScript functions — only translations used on a page are included in that page's bundle
- Translation keys are type-safe — referencing a non-existent key is a TypeScript compile error
- Message format uses ICU MessageFormat for pluralization, gender, and interpolation
- SvelteKit integration provides locale-based routing (`/en/about`, `/es/about`) with automatic `hreflang` link generation
- Paraglide is newer and less battle-tested than i18next — edge cases in complex ICU patterns may not be documented

**Alternatives considered:**
- **i18next with svelte-i18next:** Rejected primarily because i18next loads all translations at runtime (no tree-shaking), adding 20-50KB of translation JSON to the initial bundle. Translation keys are strings checked at runtime, not at compile time — a typo in a translation key silently shows the key string instead of the translation. i18next is mature and feature-rich, but its runtime approach conflicts with our performance goals.
- **Custom solution with JSON files:** Rejected because building a production i18n system (pluralization rules, ICU format, locale negotiation, SEO integration) from scratch takes months and inevitably misses edge cases that established libraries handle.

---

## ADR-015: Prerender vs On-Demand Rendering for Blog Posts

**Title:** Prerendering for blog posts with on-demand rendering for dynamic content
**Status:** Accepted

**Context:** Our blog publishes 2-3 posts per week. Posts are written in Markdown, stored in the Git repository (content-as-code), and do not change after publication. The blog needs excellent SEO performance (fast TTFB, proper structured data) and minimal server load. We need to decide whether blog pages are prerendered at build time or rendered on demand with each request.

**Decision:** We will prerender all blog posts at build time using `export const prerender = true` in the blog route layout, with an `entries()` function that generates all known slugs.

**Consequences:**
- Blog pages are static HTML files served from CDN edge locations — Time to First Byte is under 50ms worldwide
- No server processing per request — blog traffic costs virtually nothing to serve
- Search engine crawlers receive instant HTML without waiting for server rendering
- Adding a new blog post requires a new deployment (git push, CI build, CDN invalidation)
- Blog content cannot include user-specific or request-specific data (no personalization, no auth-gated content)

**Alternatives considered:**
- **SSR for blog posts:** Rejected because blog content does not change between requests. SSR would execute database queries or file reads on every page view, wasting server resources for identical output. The 50-150ms TTFB penalty of SSR is unnecessary for static content.
- **SSG with ISR (Incremental Static Regeneration):** Considered for reducing deployment frequency. Rejected because our content is in Git (not a CMS) — there is no external data source that changes independently of deployments. ISR adds complexity (stale-while-revalidate logic, cache invalidation) without benefit when content changes are already gated by git push. If we move to a headless CMS in the future, ISR becomes more compelling and we will revisit this decision.

---

---

## Appendix: How to Write Good ADRs

### When to Write an ADR

Write an ADR when you face a decision that is difficult to reverse, affects multiple team members, or will be questioned six months from now. Day-to-day coding decisions (variable names, function structure, file organization) do not need ADRs. Technology choices, architecture patterns, and infrastructure decisions do.

Signs you need an ADR:
- Two or more team members disagree on the approach
- The decision involves a dependency that will be expensive to replace later
- The decision affects the system's security, performance, or scalability boundaries
- You are choosing between options that each have significant trade-offs
- A future developer will ask "why did we do it this way?"

### How to Write the Context Section

The context section is the most important part of an ADR. It captures the forces that led to the decision — the constraints, requirements, pressures, and trade-offs that shaped the choice. Without good context, the decision seems arbitrary.

Bad context: "We needed a database ORM."
Good context: "Our application needs a TypeScript ORM for PostgreSQL access. We need type-safe queries, migrations, and a schema definition language that integrates with our TypeScript-strict codebase. The application runs on both Node.js and edge runtimes, which constrains our ORM choice."

The good version explains what is needed, why it is needed, and what constraints exist. A future developer reading this understands the decision even if they were not present for the discussion.

### How to Write the Alternatives Section

The alternatives section demonstrates due diligence. It shows that you considered other approaches and rejected them for specific reasons, not because of bias or ignorance. Always list at least two alternatives, and explain the specific reason each was rejected — not just "we preferred option A."

Bad alternative: "We considered Prisma but chose Drizzle instead."
Good alternative: "Prisma was rejected primarily because of the binary engine requirement (~15MB), which prevents deployment to edge runtimes. Prisma's query engine also adds 200-500ms cold start on serverless."

The good version gives a specific, measurable reason for rejection. A future developer who encounters a new Prisma version without the binary engine limitation can revisit this decision with new information.

### How to Supersede an ADR

When technology evolves or requirements change, an ADR may need revision. Do not edit the original ADR — mark it as "Superseded by ADR-XXX" and write a new ADR that references the original. This preserves the decision history and shows how thinking evolved.

```markdown
**Title:** Drizzle ORM for database access
**Status:** Superseded by ADR-025
**Context:** [original context unchanged]
**Decision:** [original decision unchanged]
**Note (2027-03):** Superseded because Prisma released Edge Runtime support
in v6, eliminating the binary engine requirement that originally drove our
Drizzle choice. See ADR-025 for the updated decision.
```

The original ADR becomes a historical document that explains why Drizzle was chosen. The new ADR explains why the team switched to Prisma. Together, they tell the complete story of the decision and its evolution.

### ADR Anti-Patterns

**Recording decisions after they are made.** ADRs are most valuable when written during the decision process, not months later from memory. Retrospective ADRs miss the nuances of the alternatives considered and the forces at play.

**Writing ADRs for non-decisions.** If there is only one reasonable option (e.g., "use TypeScript" in a TypeScript course), an ADR adds bureaucracy without value. ADRs are for genuine trade-off decisions with multiple viable options.

**Not reviewing ADRs periodically.** Technology changes. An ADR that says "rejected library X because it lacks feature Y" may be outdated if library X has since added feature Y. Schedule annual ADR reviews as part of your team's technical debt process.

**Making ADRs too long.** An ADR is not a research paper. Each section should be concise — 3-4 sentences for context, 1-2 sentences for the decision, 3-4 bullets for consequences. If you need more space, the decision may need to be broken into smaller decisions.

---

*Review these ADRs annually. Technology evolves, team needs change, and decisions that were correct a year ago may need revision. Mark superseded ADRs as such and create new ones documenting why the decision changed.*
