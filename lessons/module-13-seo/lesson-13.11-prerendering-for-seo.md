---
module: 13
lesson: 13.11
title: Prerendering for SEO
duration: 45 minutes
prerequisites:
  - Module 9A — load() and adapters
  - Lesson 13.10 — Core Web Vitals
learning_objectives:
  - Use export const prerender = true to turn a page into static HTML
  - Mix prerendered and SSR routes in the same SvelteKit app
  - Use entries() to enumerate dynamic routes for prerendering
  - Inspect the build output to confirm which routes were prerendered
  - Choose between prerender, SSR, and CSR on a per-route basis
status: ready
---

# Lesson 13.11 — Prerendering for SEO

## 1. Concept — the fastest HTML is the HTML you already wrote

### 1.1 What prerendering is

**Prerendering** means running your page component once at *build time*, serializing the HTML, and serving that static file forever (or until the next deploy). The crawler and the user receive exactly the same bytes you generated during `pnpm build`, directly from a CDN edge, with no server work at request time.

For a marketing home page, an About page, a Privacy page, or a blog archive, prerendering is unambiguously better than SSR: it is cheaper, faster, and more reliable. LCP drops because the response is already on the edge. Server cost drops because there is no server. Reliability rises because there is no database to be down.

### 1.2 How SvelteKit does it

Opt a page in with a single line at the top of its `+page.ts` (or `+page.server.ts`):

```ts
export const prerender = true;
```

When you run `pnpm build`, SvelteKit invokes the `prerender` crawler, visits every route with `prerender = true`, and writes the output to `.svelte-kit/output/prerendered`. Your adapter (adapter-static, adapter-netlify, adapter-vercel, etc.) ships those files as static assets.

### 1.3 Hybrid apps: mix prerender and SSR

SvelteKit does not force you to choose once for the whole app. Each route declares its own rendering mode:

```ts
// +page.ts on a marketing page
export const prerender = true;

// +page.server.ts on a dashboard page
export const prerender = false; // or omit — SSR is the default
```

This is the single biggest architectural advantage SvelteKit has over strict SSG-only frameworks. A course platform can prerender every lesson page (they do not change per user), SSR the student dashboard (it does), and CSR the editor playground (interactive only).

### 1.4 Dynamic routes and `entries()`

`/blog/[slug]` is a dynamic route. SvelteKit cannot know which slugs exist at build time unless you tell it. Export an `entries()` function that returns the list of param objects:

```ts
export const prerender = true;
export const entries = async () => {
    const slugs: string[] = await fetchAllSlugs();
    return slugs.map((slug) => ({ slug }));
};
```

SvelteKit calls `entries()` at build time, generates one HTML file per slug, and ships them all.

### 1.5 The `auto` mode

Setting `prerender = 'auto'` at the root layout tells SvelteKit to prerender any route it *can* — any route whose load function is deterministic and has no dynamic params it cannot discover. This is convenient for simple sites but opaque for complex ones; in production code prefer explicit per-route declarations.

## Deep Dive

**Why this matters at scale.** Prerendered pages have zero TTFB from CDN edge. Best possible LCP. No server runtime means infinite scalability.

**The mental model.** Set prerender = true per page or globally. entries() enumerates dynamic params. The build generates static HTML files.

**Edge cases.** Prerendered pages cannot personalize per-request. No cookies, no user-specific data. Combine with client-side hydration for personalization.

**Performance implications.** Build time scales with page count. 1000 pages might take 2-5 minutes. Each page is a static file with sub-10ms serving time.

**Connection to other modules.** Module 9A.10 teaches prerendering in depth. Module 12.11's static adapter generates output.

## 2. Style it — the prerendered page looks no different

Prerendering affects how the page reaches the user, not how it looks. PE7 tokens all work identically. The mini-build is a standard marketing-style page with a single flag at the top of the load file.

## 3. Interact — reading the build output

Problem: after you add `export const prerender = true`, how do you *verify* the route was actually prerendered? The answer is to inspect the `.svelte-kit/output/prerendered/pages/` directory after `pnpm build`. Prerendered pages appear there as real `.html` files. Non-prerendered pages do not. Opening the HTML in a text editor reveals the fully-rendered content Googlebot will see.

## 4. Mini-build — a prerendered marketing page

**File:** `src/routes/modules/13-seo/11-prerender/+page.ts`

```ts
import type { PageLoad } from './$types';

export const prerender = true;

interface MarketingData {
    headline: string;
    subhead: string;
    builtAt: string;
}

export const load: PageLoad = () => {
    const data: MarketingData = {
        headline: 'Prerendered at build time',
        subhead:
            'This page is a static HTML file. No server runs for your request — the CDN edge ships the exact bytes the build produced.',
        builtAt: new Date().toISOString()
    };
    return data;
};
```

**File:** `src/routes/modules/13-seo/11-prerender/+page.svelte`

```svelte
<script lang="ts">
    import SEO from '$lib/components/SEO.svelte';
    import type { PageData } from './$types';

    const { data }: { data: PageData } = $props();
</script>

<SEO title="Prerendered pages · Lesson 13.11" description="Static HTML at build time — the fastest LCP SvelteKit can ship." />

<section class="page stack">
    <p class="eyebrow">Lesson 13.11 · Mini-build</p>
    <h1>{data.headline}</h1>
    <p>{data.subhead}</p>
    <p class="muted">Built at <time datetime={data.builtAt}>{data.builtAt}</time>.</p>
</section>

<style>
    section { --color-brand: oklch(68% 0.2 160); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
    .muted { color: var(--color-text-muted); font-size: var(--text-sm); }
</style>
```

### DevTools moment

After `pnpm build`, open `.svelte-kit/output/prerendered/pages/modules/13-seo/11-prerender.html` and confirm the headline, subhead, and built-at timestamp are all in the raw HTML. Notice that the timestamp is frozen at build time — reload the live page and the value does not change until the next deploy.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is prerendering faster than SSR for a marketing page?</summary>

The HTML is already on the CDN edge. No server invocation, no database round trip, no cold start.
</details>

<details>
<summary><strong>Q2.</strong> How do you prerender a dynamic route like /blog/[slug]?</summary>

Export an `entries()` function that returns the list of params (e.g. `[{ slug: 'a' }, { slug: 'b' }]`). SvelteKit generates one HTML file per entry at build time.
</details>

<details>
<summary><strong>Q3.</strong> Can you mix prerendered and SSR routes in one SvelteKit app?</summary>

Yes. Each route declares its own rendering mode via `export const prerender = true|false` in its `+page` file.
</details>

<details>
<summary><strong>Q4.</strong> Why is a built-at timestamp frozen on a prerendered page?</summary>

The load function ran once at build time. The string is literally baked into the HTML. It will not update until the next deploy.
</details>

<details>
<summary><strong>Q5.</strong> How do you verify a route was prerendered?</summary>

Inspect `.svelte-kit/output/prerendered/pages/<route>.html` after `pnpm build`. If the file exists, it was prerendered.
</details>

## 6. Common mistakes

- **Prerendering a page that uses request-scoped data.** The built HTML will contain stale or wrong data. Either remove the dependency or switch to SSR.
- **Forgetting `entries()` for dynamic routes.** The build fails or generates zero HTML files.
- **Using `prerender = true` in `+layout.ts` when some children are dynamic.** Put it on the specific pages instead.
- **Expecting search params to work on prerendered pages.** They don't — prerender generates one file per param-less URL. Use `load()` branches or SSR for per-query-string content.

## 7. What's next

Lesson 13.12 moves from search engines to AI engines — Answer Engine Optimization and how to rank inside AI Overviews.
