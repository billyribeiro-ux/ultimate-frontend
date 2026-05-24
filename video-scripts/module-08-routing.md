# Module 8 — SvelteKit Routing: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Keep the file tree panel visible in the editor to show route structure. Browser URL bar must be visible to demonstrate navigation and URL changes.

---

## Lesson 8.1 — What SvelteKit adds to Svelte

**Duration:** 12 minutes
**Screen setup:** Split-screen: slides/diagrams (left), editor file tree (right)

### Hook (30 seconds)
"Svelte builds components. SvelteKit builds applications. Without SvelteKit, you have a pile of components with no routing, no data loading, no server rendering, no deployment story. SvelteKit is the framework that turns your components into a website people can actually visit."

### Demo sequence
1. **[0:30-3:00] Svelte alone vs SvelteKit** — Show a Svelte component in isolation — no URL, no pages, no server. Then show the same component inside SvelteKit — it has a URL, loads data, renders on the server.
2. **[3:00-5:30] What SvelteKit provides** — Walk through: file-based routing, SSR, data loading, form actions, API endpoints, hooks, adapters. "Seven capabilities that Svelte doesn't have."
3. **[5:30-8:00] The SvelteKit request flow** — Diagram: browser request -> hooks -> router -> load function -> server render -> hydrate. Walk through each step.
4. **[8:00-10:00] Build the mini-build** — Show a minimal SvelteKit app: `+page.svelte`, `+layout.svelte`, `+page.server.ts`. Navigate between two pages. Show SSR in View Source.
5. **[10:00-11:30] Edge case / gotcha** — "SvelteKit conventions are strict. `+page.svelte`, not `page.svelte`. The `+` prefix is required. Misspell it and the route doesn't register — no error, just a 404."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Svelte vs SvelteKit"
- 3:00 — "Seven capabilities"
- 5:30 — "The request flow"
- 8:00 — "Minimal SvelteKit app"
- 10:00 — "The + prefix convention"

### Callout graphics
- SvelteKit architecture diagram
- Request lifecycle flow
- File naming convention reference

### Outro (30 seconds)
"SvelteKit transforms Svelte components into a full application framework. Next lesson: what SSR actually is and why it matters for every page you build."

---

## Lesson 8.2 — What SSR actually is

**Duration:** 12 minutes
**Screen setup:** Browser with View Source, Network tab showing HTML response

### Hook (30 seconds)
"Right-click your React SPA. View Page Source. You see an empty `<div id='root'></div>`. That's what Google sees. That's what a screen reader sees on first load. That's what a user on slow 3G sees for 3 seconds. SSR means the server sends real HTML — content visible before JavaScript loads."

### Demo sequence
1. **[0:30-3:00] CSR vs SSR** — Show a CSR app's page source: empty div. Show a SvelteKit app's page source: full HTML with content. "CSR sends a shell. SSR sends the whole page."
2. **[3:00-5:30] How SvelteKit does SSR** — The server runs your Svelte components, generates HTML, sends it. The browser displays HTML immediately. JavaScript loads. Hydration makes it interactive. "Two phases: instant content (SSR), then interactivity (hydration)."
3. **[5:30-8:00] Why SSR matters** — SEO: crawlers see content. Performance: First Contentful Paint is faster. Accessibility: content before JS. Social sharing: meta tags are in the HTML.
4. **[8:00-10:00] DevTools proof** — Disable JavaScript in DevTools. Load a SvelteKit page — content is visible. Load a CSR app — blank. "SSR works without JavaScript. Your content is accessible even when JS fails."
5. **[10:00-11:30] Edge case / gotcha** — "SSR runs your component on the server — in Node.js, not a browser. `window`, `document`, `localStorage` don't exist on the server. Access them only in `$effect` or behind `browser` checks."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Empty div vs real content"
- 3:00 — "SvelteKit's SSR process"
- 5:30 — "Four reasons SSR matters"
- 8:00 — "Proof: works without JavaScript"
- 10:00 — "No window on the server"

### Callout graphics
- CSR vs SSR page source comparison
- SSR timeline: server render -> HTML sent -> JS loads -> hydration
- Browser APIs unavailable on server list

### Outro (30 seconds)
"SSR gives your users content instantly and search engines something to index. But the HTML is static — next lesson explains how hydration makes it interactive."

---

## Lesson 8.3 — What Hydration actually is

**Duration:** 11 minutes
**Screen setup:** Browser with Network tab, Performance tab showing hydration timing

### Hook (30 seconds)
"The server sent beautiful HTML. The user sees content. They click a button. Nothing happens. For a split second, the page is a painting — it looks real but isn't interactive. Hydration is the process of attaching JavaScript to that server-rendered HTML, turning a painting into an application."

### Demo sequence
1. **[0:30-2:30] The hydration gap** — Show a SvelteKit page loading. Highlight the moment between HTML visible and JS ready. "This gap is hydration time. On a fast connection, it's imperceptible. On slow 3G with a heavy page, it can be seconds."
2. **[2:30-5:00] How hydration works** — Svelte receives the server HTML, walks the DOM, attaches event handlers, initializes state. It does NOT re-render — it reuses the existing DOM nodes. "Hydration is cheaper than rendering from scratch. Svelte matches its virtual component tree to the existing DOM."
3. **[5:00-7:30] Hydration mismatch** — Intentionally create a mismatch: server renders 'Server time: 10:00', client state shows 'Client time: 10:01'. Show the warning. "If server and client render different content, you get a hydration mismatch. Svelte warns you. Fix it by ensuring deterministic rendering."
4. **[7:30-9:30] Performance implications** — Show the Performance tab during hydration. JavaScript parse time + hydration time = Time to Interactive. "Every kilobyte of JS delays interactivity. This is why Svelte's small bundle matters."
5. **[9:30-10:30] Edge case / gotcha** — "Client-only content (like `Date.now()`) will mismatch. Use `{#if browser}` or render time-dependent content only in `$effect`. Server and client must agree on the initial render."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The interactive gap"
- 2:30 — "How hydration attaches JS"
- 5:00 — "Hydration mismatch warnings"
- 7:30 — "Performance cost of hydration"
- 9:30 — "Client-only content"

### Callout graphics
- Hydration timeline: HTML visible -> JS loads -> hydration -> interactive
- Mismatch warning screenshot
- Performance tab showing hydration markers

### Outro (30 seconds)
"Hydration bridges server HTML and client interactivity. Next lesson: file-based routing — how your file system structure becomes your URL structure."

---

## Lesson 8.4 — File-based routing — how files become pages

**Duration:** 12 minutes
**Screen setup:** Editor file tree panel, browser showing navigation between pages

### Hook (30 seconds)
"No router configuration. No route arrays. No `<Route path='/about'>` components. In SvelteKit, you create a file at `src/routes/about/+page.svelte` and you have a page at `/about`. Your file system IS your router."

### Demo sequence
1. **[0:30-3:00] Basic routes** — Create `src/routes/+page.svelte` (home), `src/routes/about/+page.svelte` (/about), `src/routes/contact/+page.svelte` (/contact). Navigate between them. "Three files, three URLs. The folder structure maps 1:1 to the URL structure."
2. **[3:00-5:30] Special files** — `+page.svelte` (UI), `+page.ts` (universal load), `+page.server.ts` (server load), `+layout.svelte` (shared UI), `+error.svelte` (error page). "Each `+` file has a specific role in the route."
3. **[5:30-8:00] Linking between pages** — `<a href="/about">About</a>`. SvelteKit intercepts the click, does client-side navigation. "Standard `<a>` tags. No `<Link>` component. No special API. Just HTML."
4. **[8:00-10:00] Build the mini-build** — Create a 5-page site: home, about, blog, contact, and a 404. Add a navbar with links. Show client-side navigation — instant transitions, no page reload.
5. **[10:00-11:30] Edge case / gotcha** — "Folders without `+page.svelte` are valid — they're layout groups or parent routes for dynamic children. But a folder with only `+layout.svelte` and no `+page.svelte` won't have its own page."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Files become URLs"
- 3:00 — "The + file convention"
- 5:30 — "Navigation with <a> tags"
- 8:00 — "Five-page site"
- 10:00 — "Folders without pages"

### Callout graphics
- File tree to URL mapping diagram
- Special file reference table (+page, +layout, +error, etc.)
- Navigation flow: click -> intercept -> client-side load

### Outro (30 seconds)
"File-based routing makes your URL structure visible in your editor. Next lesson: nested layouts and route groups — sharing UI across multiple pages."

---

## Lesson 8.5 — Nested layouts and route groups

**Duration:** 12 minutes
**Screen setup:** Editor file tree, browser showing layout nesting

### Hook (30 seconds)
"Your marketing pages have a big hero header. Your dashboard pages have a sidebar. Your auth pages have a centered card. Three different layouts, one app. Nested layouts and route groups let you share UI exactly where you need it — no more, no less."

### Demo sequence
1. **[0:30-3:00] Nested layouts** — Create `routes/+layout.svelte` (root: navbar + footer). Create `routes/dashboard/+layout.svelte` (adds sidebar). Dashboard pages get both layouts nested. "Layouts nest automatically based on the folder hierarchy."
2. **[3:00-5:30] @render children** — Show `{@render children()}` in layouts — the slot where child content renders. "Every layout must render its children, or nested pages won't appear."
3. **[5:30-8:00] Route groups** — Create `(marketing)/+layout.svelte` and `(app)/+layout.svelte`. Parenthesized folders don't affect the URL but group routes under shared layouts. "Group routes visually and structurally without changing URLs."
4. **[8:00-10:00] Build the mini-build** — Three layout groups: `(marketing)` with hero header, `(app)` with sidebar, `(auth)` with centered card. Routes distributed across groups.
5. **[10:00-11:30] Edge case / gotcha** — "Layout groups can't be navigated to — they have no URL. But they can have their own `+layout.svelte`, `+layout.server.ts`, and error pages. Use `+layout@.svelte` to break out of a parent layout."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Different layouts for different sections"
- 3:00 — "Rendering children"
- 5:30 — "Route groups with (parentheses)"
- 8:00 — "Three layout groups"
- 10:00 — "Breaking out of layouts"

### Callout graphics
- Layout nesting hierarchy diagram
- Route group file structure
- Layout reset with @

### Outro (30 seconds)
"Layouts and route groups give you flexible shared UI structures. Next lesson: dynamic routes — [slug], [...rest], and matchers for parameterized URLs."

---

## Lesson 8.6 — Dynamic routes — [slug], [...rest], matchers

**Duration:** 12 minutes
**Screen setup:** Editor file tree showing dynamic route folders, browser URL bar

### Hook (30 seconds)
"A blog has 500 posts. You don't create 500 `+page.svelte` files. You create ONE at `[slug]/+page.svelte` and SvelteKit fills in the slug from the URL. `/blog/my-first-post`, `/blog/svelte-is-great` — same component, different data. Dynamic routes are how real applications work."

### Demo sequence
1. **[0:30-3:00] [slug] parameter** — Create `routes/blog/[slug]/+page.svelte`. Access `$page.params.slug`. Show different URLs rendering the same component with different slugs.
2. **[3:00-5:30] [...rest] catch-all** — Create `routes/docs/[...path]/+page.svelte`. Show it matching `/docs/getting-started`, `/docs/api/reference/types`. "`path` captures everything after `/docs/`."
3. **[5:30-8:00] Matchers** — Create `routes/users/[id=integer]/+page.svelte` with a matcher that only accepts digits. Show `/users/42` working and `/users/abc` returning 404. "Matchers validate parameters at the routing level."
4. **[8:00-10:00] Build the mini-build** — Blog with dynamic post routes: list page at `/blog`, individual posts at `/blog/[slug]`, categories at `/blog/category/[category]`.
5. **[10:00-11:30] Edge case / gotcha** — "Multiple dynamic routes at the same level create ambiguity: `[slug]` and `[id]` in the same folder. SvelteKit can't distinguish them. Use matchers or different path prefixes to avoid conflicts."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "One component, infinite URLs"
- 3:00 — "[...rest] catch-all routes"
- 5:30 — "Matchers for validation"
- 8:00 — "Blog route structure"
- 10:00 — "Dynamic route conflicts"

### Callout graphics
- Dynamic route parameter extraction diagram
- Matcher validation flow
- Blog route tree structure

### Outro (30 seconds)
"Dynamic routes make your app data-driven. Next lesson: `$app/state` — accessing reactive page state like the current URL, params, and navigation status."

---

## Lesson 8.7 — `$app/state` — reactive page state

**Duration:** 10 minutes
**Screen setup:** Editor with `.svelte` file, browser showing reactive URL state

### Hook (30 seconds)
"Which page am I on? What are the URL parameters? Is the page currently navigating? In SvelteKit, all of this is reactive state — change the URL and your components automatically respond. `$app/state` is the reactive lens into your application's routing state."

### Demo sequence
1. **[0:30-2:30] page state** — Import `page` from `$app/state`. Show `page.url.pathname`, `page.params`, `page.data`, `page.status`. "Everything about the current page in one reactive object."
2. **[2:30-5:00] Reactive URL reading** — Build a breadcrumb component that reads `page.url.pathname`, splits it, and renders links. Navigate — breadcrumbs update automatically.
3. **[5:00-7:00] Search params** — Read `page.url.searchParams.get('q')`. Show it updating when the URL changes. Build a search page that reads its query from the URL.
4. **[7:00-8:30] navigating state** — Show `navigating` from `$app/state` — `null` when idle, an object during navigation. Build a loading bar that shows during page transitions.
5. **[8:30-9:30] Edge case / gotcha** — "`page.data` contains data from ALL load functions in the current route hierarchy — page AND layout load functions merged together. If a layout and page load function return the same key, the page's value wins."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Reactive routing state"
- 2:30 — "Dynamic breadcrumbs"
- 5:00 — "URL search params"
- 7:00 — "Navigation loading indicator"
- 8:30 — "Data merging from layouts"

### Callout graphics
- page state properties reference
- Breadcrumb component from URL path
- navigating state lifecycle

### Outro (30 seconds)
"Reactive page state lets your components respond to URL changes automatically. Next lesson: programmatic navigation with `$app/navigation`."

---

## Lesson 8.8 — `$app/navigation` — programmatic navigation

**Duration:** 10 minutes
**Screen setup:** Editor with `.svelte` file, browser showing programmatic redirects

### Hook (30 seconds)
"A form submits successfully — redirect to the dashboard. A user's session expires — redirect to login. A search query changes — update the URL without a full navigation. `$app/navigation` gives you functions to control routing from JavaScript."

### Demo sequence
1. **[0:30-2:30] goto()** — `import { goto } from '$app/navigation'`. `await goto('/dashboard')`. Show navigation happening programmatically.
2. **[2:30-5:00] goto options** — `goto('/search?q=svelte', { replaceState: true })` — replaces history entry. `goto('/dashboard', { invalidateAll: true })` — reloads all data.
3. **[5:00-7:00] beforeNavigate and afterNavigate** — `beforeNavigate(({ cancel }) => { if (hasUnsavedChanges) cancel() })`. Show unsaved changes prompt. `afterNavigate` for scroll restoration or analytics.
4. **[7:00-8:30] invalidate and invalidateAll** — `invalidate('app:user')` — re-run load functions that depend on 'app:user'. `invalidateAll()` — re-run all load functions.
5. **[8:30-9:30] Edge case / gotcha** — "`goto()` returns a Promise. If you don't await it and immediately run more code, the navigation might not have started yet. Always `await goto()` when subsequent code depends on the navigation completing."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Navigation from JavaScript"
- 2:30 — "goto() options"
- 5:00 — "Navigation guards"
- 7:00 — "Invalidation"
- 8:30 — "Awaiting goto()"

### Callout graphics
- goto() options reference
- beforeNavigate guard flow
- invalidate dependency diagram

### Outro (30 seconds)
"Programmatic navigation gives you full control over routing from JavaScript. Next lesson: `hooks.server.ts` — the server-side request lifecycle that runs before any page loads."

---

## Lesson 8.9 — `hooks.server.ts` — request lifecycle

**Duration:** 12 minutes
**Screen setup:** Editor with `hooks.server.ts`, terminal showing server logs

### Hook (30 seconds)
"Every request to your SvelteKit app — every page load, every API call, every form submission — passes through `hooks.server.ts` first. It's the bouncer at the door: checking auth, adding headers, logging requests, transforming responses. If you need to run code on every request, hooks is where it lives."

### Demo sequence
1. **[0:30-3:00] The handle hook** — `export async function handle({ event, resolve }) { return resolve(event) }`. Add logging: `console.log(event.url.pathname)`. Every request logs.
2. **[3:00-5:30] Modifying requests** — Add auth checking: read cookies, validate session, set `event.locals.user`. "locals is the request-scoped storage that load functions and form actions can access."
3. **[5:30-8:00] Modifying responses** — `const response = await resolve(event); response.headers.set(...)`. Add security headers, CORS headers, custom headers.
4. **[8:00-10:00] Build the mini-build** — Complete hooks setup: auth check, request logging with timing, security headers, error tracking.
5. **[10:00-11:30] Edge case / gotcha** — "`hooks.server.ts` runs on the SERVER only. It never runs in the browser. If you need client-side hooks, use `hooks.client.ts` for error handling. Don't try to access `window` or `document` in server hooks."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The request gatekeeper"
- 3:00 — "Auth in hooks"
- 5:30 — "Response modification"
- 8:00 — "Production hooks setup"
- 10:00 — "Server-only execution"

### Callout graphics
- Request flow through handle hook
- event.locals data flow diagram
- Security headers reference

### Outro (30 seconds)
"Server hooks give you control over every request. Next lesson: `instrumentation.server.ts` — adding observability and OpenTelemetry to your application."

---

## Lesson 8.10 — `instrumentation.server.ts` — OpenTelemetry basics

**Duration:** 11 minutes
**Screen setup:** Editor with instrumentation file, terminal showing traces

### Hook (30 seconds)
"Your app is slow. But WHERE is it slow? The database query? The external API call? The template rendering? Without instrumentation, you're guessing. OpenTelemetry via `instrumentation.server.ts` gives you distributed traces — a timeline of every operation in every request."

### Demo sequence
1. **[0:30-2:30] What instrumentation is** — Show a slow request with no visibility. "You know it took 2 seconds. You don't know which 2 seconds."
2. **[2:30-5:00] instrumentation.server.ts** — Create the file. Export `init()`. Set up basic OpenTelemetry tracing. Show traces in the console.
3. **[5:00-7:30] Tracing a request** — Show a trace: hooks (5ms) -> load function (200ms) -> database query (150ms) -> render (50ms). Identify the bottleneck.
4. **[7:30-9:30] Custom spans** — Add custom spans around database queries and external API calls. Show them in the trace.
5. **[9:30-10:30] Edge case / gotcha** — "Instrumentation runs before SvelteKit boots. It's the first code that executes. Don't import SvelteKit modules in it — they may not be initialized yet."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Finding the slow part"
- 2:30 — "instrumentation.server.ts setup"
- 5:00 — "Reading a trace"
- 7:30 — "Custom spans"
- 9:30 — "Boot order"

### Callout graphics
- Trace waterfall diagram
- OpenTelemetry span hierarchy
- Instrumentation boot sequence

### Outro (30 seconds)
"Instrumentation gives you visibility into every request's journey through your server. Next lesson: page transitions — animating between routes with the View Transitions API."

---

## Lesson 8.11 — Page transitions with `onNavigate` and View Transitions

**Duration:** 12 minutes
**Screen setup:** Editor with layout file, browser showing smooth page transitions

### Hook (30 seconds)
"Click a link. The old page vanishes. The new page appears. Instant, jarring, disconnected. View Transitions API lets you animate between pages — cross-fading content, sliding elements, morphing shared components. It turns navigation into cinema."

### Demo sequence
1. **[0:30-3:00] The View Transitions API** — Explain `document.startViewTransition()`. SvelteKit integrates it via `onNavigate`. Show the default cross-fade.
2. **[3:00-5:30] Setting up in SvelteKit** — In root layout: `import { onNavigate } from '$app/navigation'; onNavigate((navigation) => { if (!document.startViewTransition) return; return new Promise(resolve => { document.startViewTransition(async () => { resolve(); await navigation.complete; }); }); })`.
3. **[5:30-8:00] Custom animations** — Use CSS `view-transition-name` to mark elements for morphing. Same element on both pages morphs between positions. "A product image on the list page morphs into the product image on the detail page."
4. **[8:00-10:00] Build the mini-build** — Photo gallery: grid page -> detail page with shared image morph. Smooth, native-feeling transition.
5. **[10:00-11:30] Edge case / gotcha** — "View Transitions API requires Chrome 111+. Firefox and Safari support is newer and may have quirks. Always feature-detect with `if (!document.startViewTransition) return`. The app works without it — transitions are progressive enhancement."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Navigation as cinema"
- 3:00 — "SvelteKit + View Transitions"
- 5:30 — "Shared element morphing"
- 8:00 — "Photo gallery mini-build"
- 10:00 — "Browser support"

### Callout graphics
- View Transition lifecycle diagram
- view-transition-name matching illustration
- Browser support table

### Outro (30 seconds)
"Page transitions turn navigation into smooth, connected experiences. Last lesson of this module: the four rendering modes — understanding SSR, CSR, SSG, and ISR in depth."

---

## Lesson 8.12 — The four rendering modes in depth

**Duration:** 13 minutes
**Screen setup:** Slides with diagrams, browser showing each mode's behavior

### Hook (30 seconds)
"SSR, CSR, SSG, ISR — four acronyms, four rendering strategies, four different trade-offs. Choosing the wrong one means slow pages, stale data, or expensive server bills. Choosing the right one per route — yes, you can mix them — is an architecture decision that affects everything."

### Demo sequence
1. **[0:30-3:00] SSR (Server-Side Rendering)** — Every request: server runs load + renders HTML. Fresh data. Server cost per request. "Default in SvelteKit. Best for personalized, dynamic content."
2. **[3:00-5:30] CSR (Client-Side Rendering)** — `export const ssr = false` in `+page.ts`. Server sends empty shell. Client does everything. "Best for admin dashboards, apps behind auth. Worst for SEO."
3. **[5:30-8:00] SSG (Static Site Generation)** — `export const prerender = true`. Built at deploy time. Served from CDN. Zero server cost. "Best for blogs, docs, landing pages. Content can't change without a rebuild."
4. **[8:00-10:30] Mixing modes** — Show different routes with different modes: marketing pages (SSG), dashboard (CSR), product pages (SSR). "SvelteKit lets you choose per route. One app, four strategies."
5. **[10:30-12:30] Edge case / gotcha** — "SSG with `entries()` requires you to tell SvelteKit which dynamic routes to prerender. Forget a route and it's missing from the build. Use `entries()` that queries your database or CMS for all slugs."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Four strategies, four trade-offs"
- 3:00 — "CSR: client-only rendering"
- 5:30 — "SSG: build-time rendering"
- 8:00 — "Mixing modes per route"
- 10:30 — "Dynamic SSG with entries()"

### Callout graphics
- Four rendering modes comparison table (speed, SEO, freshness, cost)
- Request flow diagram for each mode
- Mixed-mode architecture diagram

### Outro (30 seconds)
"SvelteKit gives you four rendering modes and lets you mix them per route. Module 8 is complete — you understand routing, SSR, hydration, and rendering strategies. Module 9A introduces data loading: getting data from server to page."

---
