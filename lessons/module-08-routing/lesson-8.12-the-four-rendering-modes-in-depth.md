---
module: 8
lesson: 8.12
title: The four rendering modes in depth
duration: 60 minutes
prerequisites:
  - Lesson 8.2 — SSR
  - Lesson 8.3 — Hydration
  - Lesson 8.4 — File-based routing
learning_objectives:
  - Define SSR, SSG, CSR and hybrid rendering in one sentence each
  - Pick the right mode for a given route based on freshness, auth and traffic
  - Use page options (prerender, ssr, csr) to declare a route's mode
  - Explain how a single SvelteKit app can mix all four modes at once
  - Know the trade-offs of each mode in bytes, latency and cost
status: ready
---

# Lesson 8.12 — The four rendering modes in depth

## 1. Concept — One codebase, four ways to ship

### 1.1 The problem — one mode rarely fits a whole site

A marketing home page has content that changes once a month, gets thousands of visits an hour, and must score perfectly on Core Web Vitals. A logged-in dashboard has content that is unique per user, cannot be cached, and must be secure. A search results page has content that is unique per query but common across users. A 3D product configurator has no meaningful server-side state at all — everything happens in the browser.

These four pages have nothing in common. Forcing all of them through the same rendering strategy is wasteful. A marketing page rendered server-side on every request wastes CPU; a dashboard prerendered at build time is stale and impossible to secure; a product configurator rendered on the server is pointless because the server has no GPU.

SvelteKit's answer is that you pick the rendering mode **per route**, not per app. One codebase can ship with the marketing pages prerendered, the dashboard server-rendered, the search page streaming, and the product configurator pure CSR — all at the same time.

### 1.2 The four modes

**SSR — Server-Side Rendering.** HTML is generated on the server for every request. Good for per-user, per-request dynamic content. Cost: CPU on every hit. Default mode in SvelteKit.

**SSG — Static Site Generation.** HTML is generated once at build time and saved as a `.html` file. Good for content that rarely changes and must be as fast as possible. Cost: build time; stale until the next build. Lesson 9A.10 covers the `prerender` flag.

**CSR — Client-Side Rendering.** No HTML is generated on the server. The server ships an empty shell, and the browser renders everything from JavaScript. Good for highly interactive, non-SEO-critical pages (authenticated editors, canvases, games). Cost: bad FCP and bad SEO.

**Hybrid — mix two or more of the above.** The common case. Most real apps have marketing pages as SSG, app pages as SSR, and a few special-case routes as CSR.

### 1.3 Declaring the mode with page options

SvelteKit gives you three `export const` values you can put at the top of `+page.ts`, `+page.server.ts` or `+layout.ts`:

```ts
export const prerender = true;  // SSG this route at build time
export const ssr = true;        // default — render HTML on the server
export const csr = true;        // default — hydrate on the client
```

Combinations:

- `prerender = true` → SSG. The page is built once. Dynamic `[slug]` routes also need `entries()` (Lesson 9A.10).
- `ssr = false, csr = true` → pure CSR. The server sends an empty shell; the browser renders.
- `ssr = true, csr = false` → "document mode": HTML is rendered on the server and *no JavaScript ships*. Perfect for a printable receipt or a purely static policy page.
- `ssr = true, csr = true` → the default. SSR + hydration, also known as "universal" rendering.

Page options cascade down the folder tree, same as layouts. Set `prerender = true` in a `+layout.ts` and every route below inherits it.

### 1.4 Decision matrix

| Content type                 | Freshness      | Auth? | Traffic   | Mode          |
| ---------------------------- | -------------- | ----- | --------- | ------------- |
| Marketing home page          | Weeks          | No    | High      | SSG           |
| Blog post                    | Rare edits     | No    | Medium    | SSG           |
| Product search results       | Seconds        | No    | High      | SSR + cache   |
| User dashboard               | Per request    | Yes   | Medium    | SSR           |
| Admin panel                  | Per request    | Yes   | Low       | SSR or CSR    |
| 3D configurator              | None           | Yes   | Low       | CSR           |
| Printable invoice            | Per request    | Yes   | Low       | SSR, `csr=false` |

### 1.5 Hybrid in practice — one app, all four modes

In the module project you will build a site where the home page is SSG, a dashboard route is SSR, a client-only WebGL route is CSR, and a printable receipt route is SSR-only (no JavaScript). All four live in the same `src/routes` tree with different page options.

### 1.6 What changes between modes

- **SSG** has zero per-request cost on the server, but changes require a rebuild. You lose per-user dynamic content entirely.
- **SSR** gives you fresh per-request data at the cost of CPU. Mitigate with caching and with streaming (Lesson 9A.9).
- **CSR** gives up FCP and SEO in exchange for a simpler mental model. Use only when SEO is irrelevant.
- **SSR+CSR (default)** is the best balance for most real content. The server sends real HTML; the client takes over after hydration.
- **SSR-only (`csr=false`)** is underused — it is perfect for pages that do not need interactivity and want to ship zero JS. Your Lighthouse score will be grateful.

### 1.7 What April 2026 adds

SvelteKit 2.50+ supports ISR-like behaviour on some adapters (Vercel, Netlify) where a prerendered page is revalidated on a schedule. Setting `prerender = true` + an adapter-specific revalidate option gives you the speed of SSG with the freshness of SSR. This is adapter territory and beyond the scope of this lesson, but it is good to know it exists.

## 2. Style it — PE7 for a mode comparison

The mini-build shows a table of the four modes with PE7 styling and per-mode color coding. We use a neutral brand (`oklch(70% 0.1 200)`) and assign each mode its own accent color via CSS variables scoped to the row.

## 3. Interact — typed mode descriptions

```svelte
<script lang="ts">
    interface Mode {
        id: string;
        name: 'SSR' | 'SSG' | 'CSR' | 'Hybrid';
        when: string;
        accent: string;
    }
</script>
```

`name` is a union so typos are caught at compile time.

## 4. Mini-build — the mode cheat sheet

**Path:** `src/routes/modules/08-routing/12-rendering-modes/+page.svelte`

A reference card for the four modes. Each row has the mode name, when to use it, the page options that enable it, and an accent color. Fully static — this is a cheat sheet, not an interactive lesson.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Define SSR, SSG, CSR and hybrid in one sentence each.</summary>

SSR generates HTML on the server on every request. SSG generates HTML once at build time and serves the files statically. CSR generates HTML in the browser from JavaScript. Hybrid means mixing two or more of the above in the same app, chosen per route.
</details>

<details>
<summary><strong>Q2.</strong> Which two page options do you set to ship a page as SSR-only with no client JavaScript?</summary>

`export const ssr = true;` and `export const csr = false;`. The first turns on server rendering; the second turns off hydration so no JavaScript is shipped for the route.
</details>

<details>
<summary><strong>Q3.</strong> Can a logged-in dashboard page be prerendered?</summary>

No, because prerendering produces one HTML file used for every visitor. A logged-in dashboard has per-user content and must be rendered per request. Use SSR.
</details>

<details>
<summary><strong>Q4.</strong> Why might a marketing home page be faster as SSG than as SSR?</summary>

Because SSG has no per-request server cost — the file is already on the CDN. SSR has to run the server for every hit, which adds latency and cost, and on Vercel/Cloudflare also uses cold-start CPU. For content that rarely changes, SSG is strictly better.
</details>

<details>
<summary><strong>Q5.</strong> Does setting <code>prerender = true</code> on a layout affect the whole subtree?</summary>

Yes. Page options cascade from layouts to pages below them. A `+layout.ts` with `export const prerender = true` prerenders every route under it unless a child opts out.
</details>

## 6. Common mistakes

- **Assuming SSR is always better than SSG.** SSG is faster and cheaper for any content that does not change per request. SSR is only needed when the content is per-user or per-second.
- **Forgetting to set `entries()` when prerendering dynamic routes.** Without `entries()`, SvelteKit does not know which `[slug]` values to build. Lesson 9A.10 covers the fix.
- **Setting `csr = false` on a page with interactivity.** The page will render and look correct but no clicks will work. Only use `csr = false` on truly static pages.
- **Mixing modes unintentionally via layout inheritance.** If a parent layout sets `prerender = true`, every descendant inherits it and a child setting `prerender = false` explicitly is required to break the chain.

## 7. What's next

Module 8 is complete. Module 9A opens with `load` functions — the typed, cacheable way to fetch data on the server or the client before rendering a page.
