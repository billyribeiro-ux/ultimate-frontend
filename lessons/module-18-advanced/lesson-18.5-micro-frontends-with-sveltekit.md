---
module: 18
lesson: 18.5
title: Micro-frontends with SvelteKit
duration: 70 minutes
prerequisites:
  - "8.1 — What SvelteKit adds to Svelte"
  - "8.5 — Nested layouts"
  - "12.11 — Deployment — adapters and platforms"
  - "18.4 — State machines with runes"
learning_objectives:
  - Explain when a single SvelteKit app is insufficient and micro-frontends become necessary
  - Describe module federation concepts and how they apply to SvelteKit applications
  - Implement cross-app communication via shared events and typed message contracts
  - Design a shared design token strategy that keeps multiple apps visually cohesive
  - Configure independent deployment pipelines for teams working on separate applications
status: ready
---

# Lesson 18.5 — Micro-frontends with SvelteKit

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — When one SvelteKit app is not enough

### 1.1 The problem: organizational scale breaks monolithic apps

Your company has grown from 3 engineers to 30. The monolithic SvelteKit application that once served everyone now has merge conflicts on every PR, a 12-minute build, and a deploy queue where team A blocks team B. The authentication team cannot ship a login redesign without waiting for the dashboard team's feature freeze. The marketing team cannot update their landing pages without risking a regression in the billing flow.

This is not a code quality problem. It is an **organizational architecture** problem. When the number of teams exceeds 4-5, a single codebase creates coupling that slows everyone down regardless of how clean the code is. Conway's Law states that organizations ship software that mirrors their communication structure. If teams cannot deploy independently, they cannot iterate independently.

### 1.2 What micro-frontends are

**Micro-frontends** extend the microservices philosophy to the frontend. Instead of one monolithic application that serves all routes and features, you split into multiple independently deployed applications that compose into a single user experience. Each application:

- Is owned by one team
- Has its own repository (or monorepo workspace)
- Deploys on its own schedule
- Can use different library versions (within reason)
- Communicates with siblings through defined contracts

The user sees one cohesive website. Behind the scenes, the `/dashboard` route is served by the Dashboard app, `/billing` by the Billing app, and `/marketing` by the Marketing app. They share a common shell (navigation, header, footer) and design tokens, but their internals are isolated.

### 1.3 Composition strategies for SvelteKit

There are three primary ways to compose micro-frontends:

**1. Route-level composition (recommended for SvelteKit).** Each micro-frontend owns a set of URL paths. A reverse proxy or edge function routes requests to the appropriate application. The `/dashboard/*` paths hit the Dashboard SvelteKit instance. The `/billing/*` paths hit the Billing instance. Shared chrome (nav, footer) is either duplicated in a shared package or served by a shell app that wraps the others via iframes or server-side includes.

**2. Build-time composition via module federation.** Vite's Module Federation plugin (available since Vite 5) allows one application to import components from another at build time. The Dashboard app can `import { BillingWidget } from '@billing/exports'` and the actual code is fetched from the Billing app's deployed assets at runtime. This gives component-level composition without route boundaries.

**3. Runtime composition via Web Components.** Each micro-frontend exports Web Components that the shell app renders. This provides the strongest isolation (shadow DOM, independent reactivity) but the weakest integration (no shared Svelte context, heavier bundle for Svelte components exposed as custom elements).

### 1.4 Module federation with Vite and SvelteKit

Module Federation enables applications to share code at runtime without building a monolith. The key concepts:

- **Host**: the application that consumes remote modules (the shell)
- **Remote**: the application that exposes modules (each micro-frontend)
- **Shared**: dependencies that both host and remote agree to use from a single instance (Svelte, SvelteKit runtime)

Configuration in the remote's `vite.config.ts`:

```typescript
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    federation({
      name: 'dashboard',
      filename: 'remoteEntry.js',
      exposes: {
        './Widget': './src/lib/exports/DashboardWidget.svelte'
      },
      shared: ['svelte', 'svelte/internal']
    })
  ]
});
```

The host imports dynamically:

```typescript
const DashboardWidget = await import('dashboard/Widget');
```

### 1.5 Cross-app communication

Micro-frontends need to communicate: the auth app tells the dashboard app who is logged in, the cart app tells the checkout app what items are selected. Communication channels, ranked by coupling:

1. **URL (lowest coupling).** Pass state via URL parameters or path segments. Each app reads from `$page.url`. Works across deployments, survives page refreshes, is inherently shareable.

2. **Custom Events.** The browser's `CustomEvent` API broadcasts typed messages: `window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: { user } }))`. Listeners in other apps react accordingly. Loosely coupled but not type-safe across boundaries without shared type packages.

3. **Shared store (higher coupling).** A shared `.svelte.ts` module in a workspace package that both apps import. Provides full reactivity and type safety but couples apps to a shared dependency version.

4. **postMessage (iframe isolation).** If apps are composed via iframes, use `window.postMessage` with typed payloads. Maximum isolation but worst DX.

### 1.6 Shared design tokens across apps

Visual cohesion is non-negotiable in micro-frontends. Users should not notice they are crossing application boundaries. The solution: a shared tokens package (`@org/tokens`) that exports:

- CSS custom properties file (imported in each app's `app.css`)
- TypeScript constants for programmatic access
- Tailwind/UnoCSS theme configuration (if using utility frameworks)

Each app imports the tokens package as a workspace dependency. When tokens change, all apps update on their next build. The tokens package has its own version and changelog, making design updates explicit and auditable.

### 1.7 Independent deployment

Each micro-frontend deploys independently. The architecture:

1. Each app has its own CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
2. Each app deploys to its own origin (e.g., `dashboard.internal.company.com`)
3. A reverse proxy / edge function (Cloudflare Workers, Vercel Edge Middleware, nginx) routes public URLs to the correct app
4. Shared assets (fonts, token CSS) are served from a CDN or the shell app

Rollback is per-app: if the billing deploy breaks, roll back billing without touching dashboard. This is the key operational advantage over monoliths.

### 1.8 When NOT to use micro-frontends

Micro-frontends add real complexity: cross-app routing, shared dependency management, integration testing, deployment orchestration. Use them only when:

- You have 5+ teams that need to deploy independently
- The monolith's build/deploy time exceeds 10 minutes
- Teams are blocked by each other's release schedules
- Different parts of the app have fundamentally different release cadences

For teams of 1-4, a well-structured monorepo (Lesson 18.10) with good boundaries is almost always better. Micro-frontends are an organizational solution, not a technical one.

### 1.9 The SvelteKit advantage

SvelteKit's adapter system makes micro-frontends easier than in other frameworks. Each micro-frontend can use a different adapter: the marketing site uses `adapter-static` for CDN deployment, the dashboard uses `adapter-node` for SSR, and the billing app uses `adapter-cloudflare` for edge rendering. The unified routing and layout system means each app still benefits from SvelteKit's full feature set internally.

## Deep Dive

**Scale implications.** Companies like IKEA, Spotify, and Zalando run micro-frontends at scale — hundreds of teams, thousands of routes, dozens of independently deployed applications. The pattern enables organizational scaling that monoliths cannot achieve. However, the tax is real: you need a platform team to maintain the infrastructure (routing, shared dependencies, deployment pipelines, integration testing). For a 30-person company with 5 teams, the benefit is clear. For a 5-person startup, the overhead is prohibitive.

**Mental model.** Micro-frontends are like a **shopping mall**. Each store (app) has its own inventory, staff, hours, and interior design. The mall (shell) provides the shared infrastructure: hallways (navigation), parking (auth), and a consistent exterior. Stores can renovate independently without closing the mall. A store going out of business does not affect its neighbors. The mall management sets standards (design tokens) but does not dictate each store's internal layout.

**Edge cases.** Shared state that spans micro-frontends is the hardest problem. If the cart badge count needs to update when the product page adds an item, you need real-time cross-app communication. Event-based approaches (CustomEvent, BroadcastChannel) work but are eventually consistent — the badge might flicker 50ms after the add. For truly synchronous shared state, consider a shared service worker or a dedicated state-sync micro-service that both apps subscribe to via WebSocket.

**Performance.** Module federation adds a runtime cost: the remote entry file must be fetched and evaluated before any imported component can render. This adds 50-200ms of latency on the first load of a federated component. Mitigate with: preloading remote entries in `<link rel="modulepreload">`, caching aggressively at the CDN layer, and lazy-loading non-critical federated components below the fold. Shared dependencies (`svelte`, `svelte/internal`) are loaded once and shared across all remotes — no duplication.

**Cross-module connections.** This lesson connects to Module 8 (routing and SSR — each micro-frontend runs its own SvelteKit routing), Module 12 (performance — federation latency impacts LCP), and Lesson 18.10 (monorepo — micro-frontends often live in a monorepo for shared tooling while deploying independently). The design token strategy from Lesson 18.7 (build-time data) generates the shared token package consumed by all apps.

## 2. Style it — PE7 tokens as the cross-app design contract

In a micro-frontend architecture, PE7 tokens are the shared visual language. Each app imports the same `@org/tokens` CSS file, ensuring `var(--color-brand)` resolves identically everywhere. The shell app owns the global reset and base layers; each micro-frontend owns its component and layout layers.

The mini-build demonstrates this with two simulated "apps" (actually two sections) sharing the same token set. The shell provides navigation styled with `var(--color-surface-2)` background, `var(--space-md)` padding, and `min-block-size: 44px` for touch-target nav links. Each "app" section has its own scoped styles but references the same token variables — proving visual cohesion without style coupling.

## 3. Interact — Implementing typed cross-app events

The problem: App A (the auth micro-frontend) needs to tell App B (the dashboard) that the user has logged out. Without a typed contract, App B listens for a string event and hopes the payload shape has not changed.

The mistake:

```typescript
// App A fires
window.dispatchEvent(new CustomEvent('user-logout', { detail: { userId: 123 } }));

// App B listens — no type safety, breaks silently if payload changes
window.addEventListener('user-logout', (e: any) => {
  console.log(e.detail.userId); // hope this exists
});
```

The fix: a shared types package with typed event definitions:

```typescript
// @org/events/src/auth.ts
export interface AuthEvents {
  'auth:login': { userId: string; email: string };
  'auth:logout': { userId: string };
  'auth:session-expired': { reason: string };
}

export function emitAuthEvent<K extends keyof AuthEvents>(
  event: K, detail: AuthEvents[K]
): void {
  window.dispatchEvent(new CustomEvent(event, { detail }));
}

export function onAuthEvent<K extends keyof AuthEvents>(
  event: K, handler: (detail: AuthEvents[K]) => void
): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<AuthEvents[K]>).detail);
  window.addEventListener(event, listener);
  return () => window.removeEventListener(event, listener);
}
```

Now both apps import from `@org/events`. TypeScript enforces the contract. If the auth team changes the logout payload shape, every consumer gets a compile error.

## 4. Mini-build — A micro-frontend shell with two apps

**File:** `src/routes/modules/18-advanced/05-micro-frontends/+page.svelte`

This page simulates a micro-frontend architecture with a shared shell (nav bar) and two "apps" (auth panel and dashboard panel) that communicate via typed custom events. Switching users in the auth panel updates the dashboard greeting in real-time.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/18-advanced/05-micro-frontends`.

You will see a top navigation bar (the "shell"), a user switcher on the left (the "auth app"), and a personalized dashboard on the right (the "dashboard app"). Clicking a different user fires a CustomEvent that the dashboard listens to.

### Prove cross-app communication works

1. Click a different user in the auth panel. The dashboard greeting updates immediately — proof that the CustomEvent bridge works.
2. Open the Console. You will see `[AuthApp] emitted auth:login` and `[DashboardApp] received auth:login` messages — showing the event flow.
3. Inspect the DOM. The auth section and dashboard section have independent scoped styles (different hash suffixes), simulating independent applications.
4. Look at the shared nav — it uses the same PE7 tokens as both panels, demonstrating visual cohesion from a shared token source.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> When should you choose micro-frontends over a monolithic SvelteKit app?</summary>

When you have 5+ teams that need independent deployment schedules, when the monolith's build exceeds 10 minutes, when teams are blocked by each other's releases, or when different sections have fundamentally different infrastructure needs (SSR vs static vs edge). Micro-frontends solve organizational problems, not code quality problems.
</details>

<details>
<summary><strong>Q2.</strong> What are the three primary composition strategies for micro-frontends?</summary>

(1) Route-level composition: a reverse proxy routes different URL paths to different SvelteKit instances. (2) Build-time composition via Module Federation: apps import components from other apps' deployed assets at runtime. (3) Runtime composition via Web Components: each app exports custom elements that a shell app renders.
</details>

<details>
<summary><strong>Q3.</strong> How do shared design tokens maintain visual cohesion across independently deployed apps?</summary>

A shared package (`@org/tokens`) exports CSS custom properties and TypeScript constants. Each app imports this package as a dependency and references tokens by variable name (`var(--color-brand)`) rather than raw values. When tokens are updated, all apps receive the change on their next build. The tokens package versioning makes design changes explicit and auditable.
</details>

<details>
<summary><strong>Q4.</strong> What is the performance cost of Module Federation, and how do you mitigate it?</summary>

The remote entry file must be fetched and evaluated before any federated component renders, adding 50-200ms latency on first load. Mitigate with: `<link rel="modulepreload">` for remote entries, aggressive CDN caching, shared dependencies loaded once (not duplicated per remote), and lazy-loading non-critical federated components below the fold.
</details>

<details>
<summary><strong>Q5.</strong> Why is URL-based communication the lowest-coupling option for cross-app state?</summary>

URL state (parameters, path segments) requires no shared runtime, no event listeners, and no shared packages. Each app reads its relevant state from `$page.url` independently. It survives page refreshes, works across hard navigations (different origins), and is inherently shareable (users can bookmark or share the URL). The trade-off is that only serializable, non-sensitive data belongs in URLs.
</details>

## 6. Common mistakes

- **Adopting micro-frontends too early.** Teams of 1-4 engineers rarely benefit. The overhead of cross-app testing, shared dependency management, and deployment orchestration outweighs the independence gains. Start with a well-structured monorepo and split only when organizational pain demands it.
- **Coupling shared dependencies too tightly.** If all micro-frontends must use the exact same Svelte version simultaneously, you have rebuilt a monolith with extra steps. Allow minor version drift in non-shared dependencies. Pin shared dependencies (Svelte runtime) via Module Federation's `shared` config.
- **Neglecting integration testing.** Unit testing each app independently is not enough. You need integration tests that verify cross-app communication, shared auth, and visual cohesion. Run these in CI against deployed preview environments.
- **Forgetting the user experience.** If navigating between micro-frontends causes full page reloads, flashes of unstyled content, or broken back-button behavior, the architecture is leaking. Use client-side routing within each app and ensure smooth transitions at boundaries.

## 7. What's next

Lesson 18.6 dives into custom Svelte preprocessors — writing build-time transformations that modify your markup, script, or styles before the compiler sees them. This is how you create custom syntax sugar, auto-import icons, or inject analytics code.
