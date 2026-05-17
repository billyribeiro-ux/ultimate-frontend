# Ultimate Frontend — Learning Paths

Five curated paths through the course for different goals. Each path lists modules in order, a daily schedule, estimated hours, what to skip, what to double-down on, and which exercises to complete.

---

## Path 1: The Sprint (2 Weeks)

**Goal:** Minimum viable SvelteKit developer. You can build and deploy a full-stack SvelteKit application with typed, styled, interactive components.

**Who this is for:** Experienced developers switching to Svelte from React/Vue/Angular, or bootcamp graduates who need to be job-productive fast.

**Total estimated hours:** 50–60 hours (roughly 4–5 hours per day for 14 days)

### Week 1 — Foundations through Data Loading

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 1.1, 1.2, 1.3 | What Svelte is, project setup, the three blocks | 4 |
| Tue | 1.4, 1.5, 1.7 | TypeScript annotations, PE7 CSS basics, scoped styles | 4 |
| Wed | 2.1, 2.2, 2.3, 2.7 | State concept, `$state` primitives, objects, `$derived` | 4 |
| Thu | 2.9, 2.11, 3.1, 3.2 | `$effect`, effect cleanup, components, `$props` | 4 |
| Fri | 3.3, 3.5, 3.6, 4.1 | Typed props, `$bindable`, snippets, `{#if}` | 4 |
| Sat | 4.3, 4.4, 4.7, 4.8 | `{#each}` with keys, async/await, `{#await}` | 4 |
| Sun | 5.1, 5.2, 5.3, 5.6 | Event handlers, functions, TypeScript events, closures | 4 |

### Week 2 — SvelteKit through Deployment

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 8.1, 8.2, 8.3, 8.4 | SvelteKit intro, SSR, hydration, file-based routing | 4 |
| Tue | 8.5, 8.6, 8.7, 8.9 | Layouts, dynamic routes, `$app/state`, hooks | 4 |
| Wed | 9A.1, 9A.2, 9A.3, 9A.4 | Load functions, page vs server, `$types`, enhanced fetch | 4 |
| Thu | 9A.8, 10.1, 10.3, 10.5 | Error handling, API routes, form actions, `use:enhance` | 4 |
| Fri | 10.6, 11.2, 11.3, 11.4 | Server validation, context API, `.svelte.ts` modules, shared state | 4 |
| Sat | 12.1, 12.7, 12.9, 12.11 | Core Web Vitals, error boundaries, Vitest basics, deployment | 4 |
| Sun | Capstone chunks 1–5 | Apply everything: routing, data loading, forms, styling | 5 |

### What to skip

- Module 1: Lessons 1.6 (fluid clamp depth), 1.8 (interfaces depth), 1.9 (expressions detail)
- Module 2: Lessons 2.4 (arrays depth), 2.5 (`$state.raw`), 2.6 (`$state.snapshot`), 2.8 (`$derived.by`), 2.10 (`$effect.pre`), 2.12 (reactive CSS), 2.13 (TS with reactive state)
- Module 3: Lessons 3.4 (optional props), 3.7 (snippet props), 3.8 (composition), 3.9 (CSS custom props bridge), 3.10 (container queries)
- Module 4: Lessons 4.2, 4.5, 4.6, 4.9, 4.10
- Module 5: Lessons 5.4, 5.5, 5.7, 5.8, 5.9, 5.10
- Modules 6, 7 entirely (styling mastery and GSAP/Threlte)
- Module 8: Lessons 8.8, 8.10, 8.11, 8.12
- Module 9A: Lessons 9A.5, 9A.6, 9A.7, 9A.9, 9A.10
- Module 9B entirely (remote functions — learn later)
- Module 10: Lessons 10.2, 10.4, 10.7, 10.8
- Module 11: Lessons 11.1, 11.5, 11.6, 11.7–11.10
- Module 12: Lessons 12.2–12.6, 12.8, 12.10, 12.12
- Modules 13, 14 entirely (SEO depth and Threlte)

### What to double-down on

- `$state`, `$derived`, `$effect` — these are the core mental model. Do every check-your-understanding question.
- Load functions (`+page.ts` vs `+page.server.ts`) — this is where most beginners get confused.
- Form actions and `use:enhance` — forms are how users interact with your app.
- File-based routing and layouts — spend extra time drawing the route tree on paper.

### Exercises to complete

- Module 1 project: Personal Portfolio Card
- Module 2 project: Interactive Dashboard (simplified — just the counter and derived state parts)
- Capstone chunks 1–5 (routing, basic data loading, form, layout, deployment)

---

## Path 2: The Full Course (8 Weeks)

**Goal:** Complete mastery of the entire curriculum. You finish the capstone and can claim Distinguished or Staff-level assessment.

**Who this is for:** Dedicated learners who want comprehensive knowledge, career changers investing seriously, or teams going through the course together.

**Total estimated hours:** 160–200 hours (roughly 4–5 hours per day, 5 days per week)

### Week 1 — Module 1: The Foundation

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 1.1, 1.2 | What Svelte is, project setup with pnpm + SvelteKit + TS strict | 4 |
| Tue | 1.3, 1.4 | The three blocks, TypeScript type annotations | 4 |
| Wed | 1.5, 1.6 | PE7 CSS architecture (`@layer`, OKLCH), fluid typography with `clamp()` | 4 |
| Thu | 1.7, 1.8 | Scoped `<style>` blocks, TypeScript interfaces | 4 |
| Fri | 1.9 + Module project | Template expressions, build the Personal Portfolio Card | 5 |

### Week 2 — Module 2: Reactivity

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 2.1, 2.2, 2.3 | What state is, `$state` primitives, `$state` objects | 4 |
| Tue | 2.4, 2.5, 2.6 | `$state` arrays, `$state.raw()`, `$state.snapshot()` | 4 |
| Wed | 2.7, 2.8, 2.9 | `$derived`, `$derived.by()`, `$effect` | 4 |
| Thu | 2.10, 2.11, 2.12 | `$effect.pre()`, effect cleanup, reactive CSS | 4 |
| Fri | 2.13 + Module project | TypeScript with reactive state, build Interactive Dashboard | 5 |

### Week 3 — Modules 3 & 4: Components, Props, Control Flow

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 3.1, 3.2, 3.3, 3.4 | Components, `$props()`, typed props, optional props | 4 |
| Tue | 3.5, 3.6, 3.7, 3.8 | `$bindable`, snippets, snippet props, composition | 4 |
| Wed | 3.9, 3.10 + Module project | CSS custom props bridge, container queries, build UI Component Library Part 1 | 5 |
| Thu | 4.1, 4.2, 4.3, 4.4, 4.5 | `{#if}`, `{:else if}`, `{#each}`, keys, nested `{#each}` | 4 |
| Fri | 4.6, 4.7, 4.8, 4.9, 4.10 + Module project | `{#key}`, async/await, `{#await}`, error handling, build Dynamic Product Listing | 5 |

### Week 4 — Modules 5 & 6: Events, Interaction, Styling Mastery

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 5.1, 5.2, 5.3, 5.4 | Event handlers, JS functions, TypeScript events, preventDefault | 4 |
| Tue | 5.5, 5.6, 5.7, 5.8 | Event forwarding, closures, debouncing/throttling, custom events | 4 |
| Wed | 5.9, 5.10 + Module project | Touch events, form accessibility, build Interactive Form | 5 |
| Thu | 6.1, 6.2, 6.3, 6.4, 6.5 | `@layer` depth, OKLCH depth, token system, CSS nesting, logical properties | 4 |
| Fri | 6.6, 6.7, 6.8, 6.9, 6.10 | CSS Grid, Flexbox, container queries, page color personalities, CSS transitions | 5 |

### Week 5 — Module 6 (continued) & Module 7: Animation & GSAP/Threlte

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 6.11, 6.12, 6.13, 6.14, 6.15 | Svelte transitions, in/out, animate:flip, tweened, spring | 4 |
| Tue | 6.16, 6.17, 6.18 + Module project | Custom transitions, easing/stagger, prefers-reduced-motion, build Animated Landing Page | 5 |
| Wed | 7.1, 7.2, 7.3, 7.4 | What GSAP is, installation, to/from/fromTo, timelines | 4 |
| Thu | 7.5, 7.6, 7.7, 7.8 | `bind:this`, `$effect` as bridge, GSAP cleanup, stagger | 4 |
| Fri | 7.9, 7.10, 7.11, 7.12, 7.13, 7.14 + Module project | ScrollTrigger, navigation, actions, scroll reveal, GSAP+transitions, Threlte intro, build Premium Marketing Page | 6 |

### Week 6 — Modules 8, 9A, 9B: SvelteKit Routing & Data Loading

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 8.1, 8.2, 8.3, 8.4, 8.5 | SvelteKit intro, SSR, hydration, routing, layouts | 4 |
| Tue | 8.6, 8.7, 8.8, 8.9, 8.10 | Dynamic routes, `$app/state`, `$app/navigation`, hooks, instrumentation | 4 |
| Wed | 8.11, 8.12 + Module project | Page transitions, rendering modes, build Multi-Page Portfolio Site | 5 |
| Thu | 9A.1–9A.5 | Load functions, page vs server, `$types`, enhanced fetch, layout data | 4 |
| Fri | 9A.6–9A.10 + Module project | Parallel loading, depends/invalidate, errors, streaming, SSG, build Weather Dashboard | 5 |

### Week 7 — Modules 9B, 10, 11, 12: Remote Functions through Performance

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 9B.1–9B.5 | Remote functions intro, query, query args, batch, form | 4 |
| Tue | 9B.6–9B.10 + Module project | File uploads, command, query.set, async SSR, choosing tools, build Real-Time Data App | 5 |
| Wed | 10.1–10.4 | API routes, TS in APIs, form actions, named actions | 4 |
| Thu | 10.5–10.8 + Module project | `use:enhance`, server validation, env vars, file uploads, build Full CRUD Note-Taking App | 5 |
| Fri | 11.1–11.6 | Prop drilling, context, `.svelte.ts`, shared state, reactive classes, URL as state | 5 |

### Week 8 — Modules 11 (continued), 12, 13, 14, Capstone

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 11.7–11.10 + Module project | TanStack Table (setup, sort/filter/paginate, TypeScript, optimistic UI), build Admin Dashboard | 5 |
| Tue | 12.1–12.6 | Core Web Vitals, image optimization, code splitting, `$effect` performance, memoization, reusable actions | 4 |
| Wed | 12.7–12.12 + Module project | Error boundaries, accessibility, Vitest, Playwright, deployment, 3D performance, build Production-Ready App | 5 |
| Thu | 13.1–13.8 | SEO advantage, svelte:head, SEO component, Open Graph, load+SEO, JSON-LD, E-E-A-T, sitemap | 5 |
| Fri | 13.9–13.15 + Module project | Robots.txt, CWV, prerendering, AEO, canonicals, Search Console, 3D+SEO, build SEO-Optimized Site | 5 |
| Sat | 14.1–14.4 | Threlte intro, scene fundamentals, loading models, interactivity | 4 |
| Sun | 14.5–14.8 + Module project | Scroll-driven 3D, post-processing, physics, production 3D, build 3D Product Showcase | 5 |

**Week 8 overflow / Week 9 (if needed):**

| Day | Activity | Hours |
|-----|----------|-------|
| Mon–Fri | Capstone chunks 1–20 with three-level reveal system | 25–30 |

### What to skip

Nothing. This is the complete path.

### What to double-down on

- Module 2 (Reactivity): do every check-your-understanding question and common mistake review. Runes are the foundation of everything.
- Module 9A/9B (Data Loading): understand the mental model differences between load functions and remote functions.
- Module 12 (Performance): run Lighthouse on every module project and fix issues.
- Capstone: aim for Distinguished tier. Use the 15-minute time gate honestly.

### Exercises to complete

All module projects. All capstone chunks. All check-your-understanding questions.

---

## Path 3: The Designer's Path

**Goal:** Master visual design implementation with Svelte — CSS, animation, 3D, accessibility. Build a portfolio of stunning, accessible web experiences.

**Who this is for:** Designers learning to code, frontend developers who specialize in UI/UX implementation, or developers joining a team where another engineer handles backend concerns.

**Total estimated hours:** 80–100 hours (roughly 3–4 weeks at 4 hours/day, 5 days/week)

### Phase 1: Foundations (Week 1)

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 1.1, 1.2, 1.3 | What Svelte is, project setup, the three blocks | 4 |
| Tue | 1.4, 1.5, 1.6 | TypeScript basics, PE7 CSS architecture, fluid typography | 4 |
| Wed | 1.7, 1.8, 1.9 | Scoped styles, interfaces (for prop types), template expressions | 4 |
| Thu | 2.1, 2.2, 2.7, 2.12 | State basics, `$state`, `$derived`, reactive CSS and class bindings | 4 |
| Fri | 3.1, 3.2, 3.6, 3.9, 3.10 | Components, props, snippets, CSS custom props bridge, container queries | 4 |

### Phase 2: Styling Mastery (Week 2)

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 6.1, 6.2, 6.3 | `@layer` in full depth, OKLCH color system depth, full token system | 5 |
| Tue | 6.4, 6.5, 6.6, 6.7 | CSS nesting, logical properties, CSS Grid, Flexbox | 4 |
| Wed | 6.8, 6.9, 6.10 | Container queries depth, page color personalities, CSS transitions | 4 |
| Thu | 6.11, 6.12, 6.13, 6.14, 6.15 | Svelte transitions (fade, fly, slide, scale, blur, draw), in/out, animate:flip, tweened, spring | 5 |
| Fri | 6.16, 6.17, 6.18 + Module project | Custom transitions, easing/stagger, prefers-reduced-motion, build Animated Landing Page | 5 |

### Phase 3: GSAP & 3D (Week 3)

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 7.1, 7.2, 7.3, 7.4 | GSAP intro, installation, to/from/fromTo, timelines | 4 |
| Tue | 7.5, 7.6, 7.7, 7.8 | `bind:this`, `$effect` bridge, GSAP cleanup, stagger | 4 |
| Wed | 7.9, 7.10, 7.11, 7.12, 7.13 | ScrollTrigger, SvelteKit navigation, actions, scroll reveal, GSAP+transitions | 5 |
| Thu | 7.14 + Module project | Threlte intro, build Premium Marketing Page | 5 |
| Fri | 14.1, 14.2, 14.3, 14.4 | Threlte scene fundamentals, loading models, interactivity | 4 |

### Phase 4: Production 3D & Polish (Week 4)

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 14.5, 14.6 | Scroll-driven 3D, post-processing (bloom, vignette) | 4 |
| Tue | 14.7, 14.8 + Module project | Physics with Rapier, production 3D optimizations, build 3D Product Showcase | 5 |
| Wed | 12.1, 12.2, 12.8, 12.12 | Core Web Vitals, image optimization, accessibility, 3D performance | 4 |
| Thu | 8.1, 8.4, 8.5, 8.11 | SvelteKit basics for routing, layouts, page transitions | 4 |
| Fri | 13.1, 13.2, 13.15 | SEO basics, svelte:head, 3D + SEO (SSR fallbacks) | 4 |

### What to skip

- Module 2: Lessons 2.3–2.6, 2.8, 2.9, 2.10, 2.11, 2.13 (deep reactivity patterns, effect lifecycle — learn only what animations need)
- Module 3: Lessons 3.3, 3.4, 3.5, 3.7, 3.8 (TypeScript prop depth, bindable, composition — get the basics only)
- Module 4 entirely (control flow — learn `{#if}` and `{#each}` from context in other lessons)
- Module 5 entirely (events — learn `onclick` from context in other lessons)
- Modules 8, 9A, 9B: only the routing/layout basics listed above
- Module 10 entirely (API routes and forms)
- Module 11 entirely (state management depth)
- Module 12: only the four lessons listed above
- Module 13: only the three lessons listed above
- Capstone: optional, but try chunks 1, 4, 8, 15 (routing, styling, animation, 3D)

### What to double-down on

- Module 6 (Styling Mastery): this is your core module. Do every exercise twice. Build variations.
- OKLCH color system: master creating harmonious palettes, dark mode, and page personalities.
- Svelte transitions + GSAP: understand when to use each and how they combine.
- Module 14 (Threlte): build three different 3D scenes beyond the module project.
- Accessibility (12.8): designers who understand WCAG are rare and valuable.

### Exercises to complete

- Module 1 project: Personal Portfolio Card (focus on PE7 styling)
- Module 6 project: Animated Landing Page (your showcase piece)
- Module 7 project: Premium Marketing Page (GSAP + scroll animations)
- Module 14 project: 3D Product Showcase (Threlte portfolio piece)
- Build a personal project: redesign a real website with PE7 + GSAP + Threlte

---

## Path 4: The Backend-First Path

**Goal:** Master SvelteKit's server-side capabilities — routing, data loading, remote functions, API routes, authentication, database patterns, testing, and deployment. Build production-ready full-stack applications.

**Who this is for:** Backend developers moving to full-stack, developers who will work with a designer handling UI, or anyone building data-heavy applications where the server architecture matters more than visual polish.

**Total estimated hours:** 80–100 hours (roughly 3–4 weeks at 4 hours/day, 5 days/week)

### Phase 1: Svelte Essentials (Week 1, Mon–Wed)

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 1.1, 1.2, 1.3, 1.4 | Svelte overview, project setup, three blocks, TypeScript annotations | 4 |
| Tue | 2.1, 2.2, 2.3, 2.7, 2.9, 2.11 | State, `$state`, `$derived`, `$effect`, effect cleanup (fast pass through reactivity) | 5 |
| Wed | 3.1, 3.2, 3.3, 4.1, 4.3, 4.4, 4.8 | Components, props, typed props, `{#if}`, `{#each}` with keys, `{#await}` | 5 |

### Phase 2: SvelteKit Architecture (Week 1, Thu–Fri + Week 2)

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Thu | 8.1, 8.2, 8.3, 8.4, 8.5, 8.6 | SvelteKit intro, SSR, hydration, file-based routing, layouts, dynamic routes | 5 |
| Fri | 8.7, 8.8, 8.9, 8.10, 8.12 | `$app/state`, `$app/navigation`, hooks.server.ts, instrumentation, rendering modes | 5 |
| Mon | 9A.1, 9A.2, 9A.3, 9A.4, 9A.5 | Load functions deep dive: universal vs server, `$types`, enhanced fetch, layout data | 5 |
| Tue | 9A.6, 9A.7, 9A.8, 9A.9, 9A.10 | Parallel loading, depends/invalidate, error handling, streaming, SSG | 5 |
| Wed | 9A Module project | Build Weather Dashboard | 4 |
| Thu | 9B.1, 9B.2, 9B.3, 9B.4, 9B.5 | Remote functions: intro, query, query args, batch, form | 5 |
| Fri | 9B.6, 9B.7, 9B.8, 9B.9, 9B.10 + Module project | File uploads, command, query.set, async SSR, choosing tools, build Real-Time Data App | 5 |

### Phase 3: APIs, Forms, State, Auth (Week 3)

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 10.1, 10.2, 10.3, 10.4 | API routes, TypeScript in APIs, form actions, named actions | 4 |
| Tue | 10.5, 10.6, 10.7, 10.8 + Module project | `use:enhance`, server validation, env vars, file uploads, build Full CRUD Note-Taking App | 5 |
| Wed | 11.1, 11.2, 11.3, 11.4, 11.5 | Prop drilling, context, `.svelte.ts` modules, shared state, reactive classes | 5 |
| Thu | 11.6, 11.7, 11.8, 11.9, 11.10 + Module project | URL as state, TanStack Table (all), optimistic UI, build Admin Dashboard | 5 |
| Fri | 5.1, 5.3, 5.4, 5.10 | Event handlers, TypeScript events, preventDefault, form accessibility | 4 |

### Phase 4: Testing, Performance, Deployment, SEO (Week 4)

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 12.1, 12.2, 12.3, 12.4, 12.5 | Core Web Vitals, image optimization, code splitting, `$effect` performance, memoization | 5 |
| Tue | 12.6, 12.7, 12.8, 12.9, 12.10, 12.11 | Reusable actions, error boundaries, accessibility, Vitest, Playwright, deployment | 5 |
| Wed | Module 12 project | Build Production-Ready SvelteKit Application | 5 |
| Thu | 13.1, 13.2, 13.3, 13.5, 13.6, 13.8 | SEO advantage, svelte:head, SEO component, SEO from load, JSON-LD, sitemap | 5 |
| Fri | 13.9, 13.10, 13.11, 13.13, 13.14 + Module project | Robots.txt, CWV optimization, prerendering, canonicals, Search Console, build SEO-Optimized Site | 5 |

### What to skip

- Module 1: Lessons 1.5, 1.6, 1.7, 1.8, 1.9 (PE7 CSS depth, scoped styles depth, interfaces depth — get minimal CSS knowledge)
- Module 2: Lessons 2.4, 2.5, 2.6, 2.8, 2.10, 2.12, 2.13 (deep reactivity nuances — learn what you need for data flow)
- Module 3: Lessons 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10 (component composition depth)
- Module 4: Lessons 4.2, 4.5, 4.6, 4.7, 4.9, 4.10 (control flow depth)
- Module 5: Lessons 5.2, 5.5, 5.6, 5.7, 5.8, 5.9 (JS functions depth, closures, debouncing)
- Module 6 entirely (styling mastery — use PE7 tokens from reference sheets)
- Module 7 entirely (GSAP and Threlte — not needed for backend focus)
- Module 8: Lesson 8.11 (page transitions)
- Module 13: Lessons 13.4, 13.7, 13.12, 13.15 (Open Graph, E-E-A-T, AEO, 3D+SEO)
- Module 14 entirely (Threlte 3D)
- Capstone: focus on chunks 1–12 (routing, data, auth, forms, state, testing, deployment)

### What to double-down on

- Module 9A and 9B (Data Loading): this is your core strength. Understand every nuance of load functions vs remote functions.
- Module 10 (API Routes & Forms): build multiple CRUD apps beyond the module project.
- `hooks.server.ts`: master auth patterns, error handling, and request transformation.
- Module 12 (Testing): write comprehensive Vitest and Playwright tests for every project.
- Environment variables and deployment: practice deploying to multiple platforms.

### Exercises to complete

- Module 9A project: Weather Dashboard
- Module 9B project: Real-Time Data Application
- Module 10 project: Full CRUD Note-Taking App
- Module 11 project: Admin Dashboard
- Module 12 project: Production-Ready SvelteKit Application
- Module 13 project: SEO-Optimized Multi-Page Content Site
- Capstone chunks 1–12

---

## Path 5: The Job-Ready Path (4 Weeks)

**Goal:** Maximize employability in the shortest responsible time. Cover the skills most commonly tested in interviews and required on the job: Svelte reactivity, SvelteKit full-stack, TypeScript, responsive CSS, basic testing, and deployment.

**Who this is for:** Job seekers preparing for frontend or full-stack roles at companies using (or considering) Svelte. Career changers with limited study time. Anyone building a portfolio for job applications.

**Total estimated hours:** 100–120 hours (roughly 5 hours/day, 5 days/week)

### Week 1 — Svelte Core + Styling Foundations

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 1.1, 1.2, 1.3, 1.4 | What Svelte is, project setup, three blocks, TypeScript annotations | 5 |
| Tue | 1.5, 1.6, 1.7 | PE7 CSS architecture, fluid typography, scoped styles | 4 |
| Wed | 2.1, 2.2, 2.3, 2.4 | State concept, `$state` primitives, objects, arrays | 5 |
| Thu | 2.5, 2.6, 2.7, 2.8 | `$state.raw()`, `$state.snapshot()`, `$derived`, `$derived.by()` | 5 |
| Fri | 2.9, 2.10, 2.11, 2.12, 2.13 + Module project | Effects, `$effect.pre`, cleanup, reactive CSS, TS with state, build Interactive Dashboard | 6 |

### Week 2 — Components, Control Flow, Events, CSS

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 3.1, 3.2, 3.3, 3.4, 3.5 | Components, `$props()`, typed props, optional props, `$bindable` | 5 |
| Tue | 3.6, 3.7, 3.8, 3.10 + Module project | Snippets, snippet props, composition, container queries, build UI Component Library | 5 |
| Wed | 4.1, 4.3, 4.4, 4.7, 4.8, 4.9 | `{#if}`, `{#each}` with keys, async/await, `{#await}`, error handling | 5 |
| Thu | 5.1, 5.2, 5.3, 5.6, 5.7, 5.10 | Events, JS functions, TS events, closures, debouncing, form accessibility | 5 |
| Fri | 6.1, 6.2, 6.4, 6.5, 6.6, 6.8 | `@layer`, OKLCH, CSS nesting, logical properties, CSS Grid, container queries | 5 |

### Week 3 — SvelteKit Full-Stack

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 8.1, 8.2, 8.3, 8.4, 8.5, 8.6 | SvelteKit, SSR, hydration, routing, layouts, dynamic routes | 5 |
| Tue | 8.7, 8.9, 8.12, 9A.1, 9A.2, 9A.3 | `$app/state`, hooks, rendering modes, load functions, page vs server, `$types` | 5 |
| Wed | 9A.4, 9A.7, 9A.8, 9B.1, 9B.2, 9B.7 | Enhanced fetch, depends/invalidate, errors, remote functions intro, query, command | 5 |
| Thu | 10.1, 10.3, 10.5, 10.6, 10.7 | API routes, form actions, `use:enhance`, server validation, env vars | 5 |
| Fri | 11.2, 11.3, 11.4, 11.10 + Module projects | Context, `.svelte.ts`, shared state, optimistic UI, build Weather Dashboard + CRUD App | 6 |

### Week 4 — Testing, Performance, SEO, Capstone

| Day | Lessons | Focus | Hours |
|-----|---------|-------|-------|
| Mon | 12.1, 12.2, 12.3, 12.7, 12.8 | Core Web Vitals, images, code splitting, error boundaries, accessibility | 5 |
| Tue | 12.9, 12.10, 12.11 | Vitest, Playwright, deployment | 5 |
| Wed | 13.1, 13.2, 13.3, 13.6, 13.8, 13.10 | SEO advantage, svelte:head, SEO component, JSON-LD, sitemap, CWV optimization | 5 |
| Thu | Capstone chunks 1–10 | Routing, data loading, forms, auth, state, styling, testing | 6 |
| Fri | Capstone chunks 11–15 + interview prep review | Deployment, performance, SEO, accessibility, review interview guide | 6 |

### What to skip

- Module 1: Lessons 1.8, 1.9 (interface depth, expressions depth)
- Module 3: Lesson 3.9 (CSS custom props bridge)
- Module 4: Lessons 4.2, 4.5, 4.6, 4.10 (else-if depth, nested each, key block, Promise types)
- Module 5: Lessons 5.4, 5.5, 5.8, 5.9 (stopPropagation, event forwarding, custom events, touch)
- Module 6: Lessons 6.3, 6.7, 6.9, 6.10, 6.11–6.18 (token depth, flexbox depth, page personalities, all transitions and animation lessons)
- Module 7 entirely (GSAP/Threlte — impressive but not commonly tested in interviews)
- Module 8: Lessons 8.8, 8.10, 8.11 (programmatic nav, instrumentation, page transitions)
- Module 9A: Lessons 9A.5, 9A.6, 9A.9, 9A.10 (layout data, parallel loading, streaming, SSG depth)
- Module 9B: Lessons 9B.3–9B.6, 9B.8, 9B.9, 9B.10 (remote function depth)
- Module 10: Lessons 10.2, 10.4, 10.8 (TS in APIs, named actions, file uploads)
- Module 11: Lessons 11.1, 11.5, 11.6, 11.7–11.9 (prop drilling, reactive classes, URL state, TanStack depth)
- Module 12: Lessons 12.4, 12.5, 12.6, 12.12 (performance tuning depth, reusable actions, 3D perf)
- Module 13: Lessons 13.4, 13.5, 13.7, 13.9, 13.11–13.15 (OG/Twitter, SEO load, E-E-A-T, robots, prerender, AEO, canonicals, Search Console, 3D+SEO)
- Module 14 entirely (Threlte)
- Capstone chunks 16–20 (advanced/polish — complete if time allows)

### What to double-down on

- **Runes (Module 2):** Interviewers test `$state`, `$derived`, `$effect` understanding heavily. Know the mental model cold. Complete every check-your-understanding question.
- **Load functions and data flow (Module 9A):** The most common SvelteKit interview topic. Be able to whiteboard the flow from `+page.server.ts` to the component.
- **TypeScript strict mode:** Every lesson you complete, make sure you understand the TypeScript concepts. Interviewers will ask about types.
- **Testing (Module 12):** Write tests for every module project you build. Be able to explain your testing strategy in an interview.
- **Interview Preparation Guide:** After completing Week 4, spend 2–3 days reviewing the interview prep guide (`reference/interview-prep.md`). Cover all 100 questions. Practice answering aloud.

### Exercises to complete

Priority order (complete as many as time allows):

1. **Module 2 project: Interactive Dashboard** — demonstrates reactivity mastery
2. **Module 3 project: UI Component Library** — demonstrates component architecture
3. **Module 9A/10 projects: Weather Dashboard + CRUD App** — demonstrates full-stack SvelteKit
4. **Capstone chunks 1–15** — demonstrates end-to-end project capability
5. Module 1 project: Personal Portfolio Card — use as your actual portfolio
6. Module 12 project: Production-Ready App — demonstrates testing and deployment
7. Module 13 project: SEO site — demonstrates production awareness

### Portfolio strategy

Build these three projects to show in interviews:

1. **The CRUD App (Module 10):** demonstrates data loading, form handling, validation, and server interaction. Add auth as a bonus.
2. **The Dashboard (Module 11/12):** demonstrates component architecture, state management, data tables, and performance awareness. Add Vitest tests.
3. **Your Personal Portfolio (Module 1 + Module 8):** host it on Vercel or Netlify. Include a blog section with prerendered content. Add JSON-LD structured data. Get a 100 Lighthouse score.

These three projects cover the skills that hiring managers look for: data fetching, forms, state management, component design, testing awareness, and deployment competence.

---

## Choosing Your Path — Quick Reference

| Path | Duration | Hours | Best for |
|------|----------|-------|----------|
| The Sprint | 2 weeks | 50–60 | Experienced devs, quick ramp-up |
| The Full Course | 8 weeks | 160–200 | Complete mastery, career investment |
| The Designer's Path | 3–4 weeks | 80–100 | UI/UX focus, visual portfolio |
| The Backend-First Path | 3–4 weeks | 80–100 | Full-stack/backend focus, data-heavy apps |
| The Job-Ready Path | 4 weeks | 100–120 | Job seekers, interview preparation |

### Can I switch paths?

Yes. The paths overlap significantly. If you start with The Sprint and want to go deeper, continue with the lessons you skipped from The Full Course. If you start The Designer's Path and realize you need backend skills, add The Backend-First Path's Phase 2 and 3. The module structure makes it easy to add depth in any area.

### What if I have less than 2 weeks?

Read the reference materials (`svelte5-runes-cheatsheet.md`, `sveltekit-routing-cheatsheet.md`, `pe7-css-cheatsheet.md`), complete Module 1 and Module 2 (Lessons 2.1–2.9 only), build one SvelteKit page with a load function (Module 9A, Lessons 9A.1–9A.3), and review the interview prep guide for the topics most relevant to your target role.

### What if I have more than 8 weeks?

After completing The Full Course, go back to the capstone and aim for Distinguished tier. Then build a real-world project: an open-source component library, a SaaS MVP, or a portfolio site that showcases every module's concepts. Contribute to the Svelte ecosystem — write an adapter, a Threlte plugin, or a Valibot schema library.

---

*End of Learning Paths — five curated journeys through the Ultimate Frontend curriculum.*
