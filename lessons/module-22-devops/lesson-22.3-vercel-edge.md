---
module: 22
lesson: 22.3
title: Vercel Edge Functions
duration: 55 minutes
prerequisites:
  - "22.1 — Adapter deep dive"
  - "22.2 — Cloudflare Workers & Pages"
  - "9A.10 — SSG — Static Site Generation with prerender"
learning_objectives:
  - Explain ISR and why it bridges the gap between SSR and SSG
  - Configure adapter-vercel for edge functions, serverless functions, and ISR
  - Describe Vercel's edge middleware and its role in request-time logic
  - Set up vercel.json for route-level rendering mode overrides
  - Compare Vercel's deployment model with Cloudflare's edge-first approach
status: ready
---

# Lesson 22.3 — Vercel Edge Functions

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — The managed edge with ISR superpowers

### 1.1 The problem: SSR is fresh but slow, SSG is fast but stale

In Lesson 9A.10, you learned that prerendered (SSG) pages are blazing fast — they are served as static HTML from a CDN with no server processing. But they are stale: the content is whatever was true at build time. If a product price changes, you must rebuild and redeploy the entire site.

Server-side rendering (SSR) solves the staleness problem: every request generates fresh HTML with current data. But SSR is slower because it requires server processing on every request, and if the server is far from the user, network latency adds up.

What if you could have both? A page that serves instantly from the CDN like SSG, but regenerates in the background when the content is stale? That is **Incremental Static Regeneration (ISR)**.

### 1.2 How ISR works

ISR combines the speed of static with the freshness of dynamic. Here is the flow:

1. On the first request, the page is server-rendered and cached at the edge.
2. Subsequent requests serve the cached version instantly (like SSG).
3. After a configurable time period (the `revalidate` interval), the next request still serves the cached version but triggers a background regeneration.
4. Once the regeneration completes, the cache is updated and future requests serve the fresh content.

The user never waits for regeneration — they always get an instant response. The page is never more than `revalidate` seconds stale. This is the "stale-while-revalidate" pattern applied at the infrastructure level.

In SvelteKit with adapter-vercel, you enable ISR per route:

```typescript
// src/routes/products/[slug]/+page.server.ts
export const config = {
    isr: {
        expiration: 60 // regenerate every 60 seconds
    }
};
```

### 1.3 Vercel's deployment architecture

Vercel provides three execution environments:

**Serverless Functions** run in AWS Lambda containers in a single region (defaulting to `iad1`, US East). They have full Node.js access, 250MB package limit, and configurable memory (128MB to 3008MB). Cold starts are 100-500ms. Use these for heavy server-side logic, database queries, and anything requiring Node.js APIs.

**Edge Functions** run on Vercel's edge network (powered by Cloudflare's infrastructure). Like Workers, they use V8 isolates with near-zero cold starts. They have the same Web Standards API restrictions as Workers — no Node.js APIs. Use these for lightweight request handling, authentication checks, A/B testing, and personalization.

**Edge Middleware** runs before every request on the edge network. It can rewrite URLs, redirect users, set headers, and modify the request before it reaches your serverless function or static page. Middleware runs on every request, so it must be fast. It is the right place for authentication guards, geolocation-based routing, and feature flag evaluation.

### 1.4 Configuring adapter-vercel

The adapter-vercel configuration in `svelte.config.js`:

```typescript
import adapter from '@sveltejs/adapter-vercel';

const config = {
    kit: {
        adapter: adapter({
            runtime: 'nodejs22.x',  // default serverless runtime
            regions: ['iad1'],       // deploy to US East
            memory: 1024,            // MB per function
            maxDuration: 15          // seconds timeout
        })
    }
};
```

You can override the runtime per route using the `config` export:

```typescript
// This route runs at the edge instead of serverless
export const config = {
    runtime: 'edge'
};
```

### 1.5 vercel.json for advanced configuration

The `vercel.json` file at the project root provides project-level configuration:

```json
{
    "framework": "sveltekit",
    "regions": ["iad1", "sfo1", "lhr1"],
    "headers": [
        {
            "source": "/api/(.*)",
            "headers": [
                { "key": "Cache-Control", "value": "s-maxage=60, stale-while-revalidate=600" }
            ]
        }
    ],
    "redirects": [
        { "source": "/old-page", "destination": "/new-page", "permanent": true }
    ]
}
```

### 1.6 Image optimization

Vercel provides a built-in image optimization service. When you serve images through Vercel, they are automatically converted to WebP/AVIF, resized to the requested dimensions, and cached at the edge. In SvelteKit, you can use the `@vercel/og` package to generate Open Graph images server-side, or use the `/_vercel/image` endpoint to transform any image URL.

### 1.7 Analytics and Web Vitals

Vercel Analytics collects real-user performance data (Core Web Vitals: LCP, CLS, INP) from production traffic without any client-side JavaScript overhead. It uses the browser's `PerformanceObserver` API and Vercel's edge infrastructure to aggregate metrics. You enable it in `vercel.json` or the Vercel dashboard. This gives you production performance data that complements the Lighthouse audits from Module 12.

### 1.8 "In Production" — ISR for an e-commerce catalog

An e-commerce company with 50,000 products migrated from full SSR to ISR with a 5-minute revalidation interval. Server-side rendering had produced 200ms TTFB under load. With ISR, TTFB dropped to 12ms for cached pages (99.7% of requests) and 200ms for the 0.3% of requests that triggered regeneration. The infrastructure cost dropped by 80% because serverless function invocations dropped from 2 million per day (SSR) to 6,000 per day (ISR regenerations). Product prices were at most 5 minutes stale, which was acceptable for their business. For time-sensitive prices (flash sales), they used client-side fetching to overlay the current price on top of the ISR-rendered page.

### 1.9 The TypeScript angle

Adapter-vercel provides typed configuration through the `Config` export type:

```typescript
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
    runtime: 'edge',
    regions: ['iad1'],
    isr: {
        expiration: 60,
        bypassToken: 'my-secret-token'
    }
};
```

The `Config` type validates that you only use valid runtime values, valid region codes, and correctly shaped ISR options at compile time. Using the type prevents typos like `runtime: 'edg'` from reaching production.

### 1.10 Common interview question

**Q: "Explain the trade-offs between ISR and full SSR. When would you choose ISR, and when is full SSR the better option?"**

**Model answer:** ISR serves cached static pages instantly and regenerates them in the background at a configurable interval. It is ideal for content that changes infrequently (product catalogs, blog posts, documentation) where a few seconds of staleness is acceptable. Full SSR generates fresh HTML on every request, which is necessary for personalized content (user dashboards, account pages), real-time data (stock prices, live scores), or pages where even slight staleness causes business problems (inventory counts that prevent overselling). The trade-off is cost and latency: ISR is cheaper and faster because most requests are served from cache, while SSR requires a server-side computation on every request.

## Deep Dive

**How Vercel's ISR cache works internally.** When a page with ISR is first requested, Vercel renders it server-side and stores the HTML in its global CDN cache with a TTL equal to the `expiration` value. Subsequent requests within the TTL serve the cached HTML directly from the nearest edge location. When the TTL expires, the next request serves the stale cached version (so the user does not wait) and simultaneously triggers a background re-render. Once the new HTML is ready, the cache is atomically updated. If the background render fails, the stale cache continues serving — there is no downtime.

**Bypass tokens for ISR.** You can set a `bypassToken` in your ISR configuration. Sending a request with `?x-prerender-revalidate=your-token` forces an immediate regeneration, bypassing the TTL. This is useful for CMS webhooks: when an editor publishes a content change, the CMS sends a revalidation request to clear the cached page instantly.

**Edge middleware patterns.** Common middleware use cases include: (1) checking an authentication cookie and redirecting unauthenticated users to `/login`, (2) reading a `geo` header to redirect users to a country-specific version of the site, (3) evaluating feature flags based on cookies and rewriting the URL to serve the variant. Middleware runs in under 1ms at the edge, so it adds negligible latency.

**Vercel vs Cloudflare edge comparison.** Both run V8 isolates at the edge. Vercel's edge functions are built on Cloudflare's infrastructure but add Vercel-specific features: ISR, image optimization, analytics, preview deployments, and a unified dashboard. Cloudflare offers more granular control: KV, D1, R2, Durable Objects, and direct Workers configuration via `wrangler.toml`. If you need Cloudflare-specific storage services, use adapter-cloudflare directly. If you want a managed deployment experience with ISR, use adapter-vercel.

**Connection to other lessons.** Lesson 22.1 compared all five adapters. Lesson 22.2 explored Cloudflare's edge model in detail. Lesson 22.5 covers preview deployments, which are a Vercel strength. Lesson 13.11 covered prerendering for SEO, which ISR extends with background regeneration.

## Going Deeper

**Official docs to read next:**

- [vercel.com/docs/functions/edge-functions](https://vercel.com/docs/functions/edge-functions) — Edge function documentation and API reference.
- [vercel.com/docs/incremental-static-regeneration](https://vercel.com/docs/incremental-static-regeneration) — ISR configuration and patterns.
- [svelte.dev/docs/kit/adapter-vercel](https://svelte.dev/docs/kit/adapter-vercel) — SvelteKit's Vercel adapter configuration.

**Advanced pattern: per-route rendering strategies.** In a large SvelteKit application, different routes benefit from different rendering strategies. Marketing pages can be fully prerendered (SSG). Product pages can use ISR with 5-minute revalidation. User dashboards must be fully SSR with no caching. The Vercel adapter lets you set different `config` exports per route file, giving you granular control without changing adapters.

**Challenge question (combines Lesson 22.3 + Lesson 22.2 + Lesson 9A.10):** You are building a news site with 10,000 articles. Articles older than 24 hours rarely change, while breaking news articles update every few minutes. Design a rendering strategy that minimizes server costs while keeping breaking news fresh. Which combination of SSG, ISR, and SSR would you use, and how would you decide which strategy applies to each article?

## 2. Style it — PE7 applied to the ISR product page simulator

The mini-build simulates an ISR product page with cache status indicators. The product card uses `var(--color-surface-2)` with `var(--radius-lg)` and `var(--shadow-md)`. Cache status badges use `var(--color-success)` for "cached," `var(--color-warning)` for "regenerating," and `var(--color-brand)` for "fresh." The revalidation countdown timer uses `var(--text-2xl)` with monospace font. The layout stacks on mobile and splits into a two-column grid at `min-width: 768px` using `var(--space-lg)` gap.

## 3. Interact — simulating ISR cache behavior

The problem: ISR is invisible infrastructure — developers cannot see it working. The interactive element simulates ISR behavior with a configurable revalidation interval. The student sets a TTL, requests the page, and watches the cache status change from "cached" to "stale" to "regenerating" to "fresh." A `$effect` runs a countdown timer showing seconds until the next revalidation.

```typescript
type CacheStatus = 'fresh' | 'cached' | 'stale' | 'regenerating';

interface ProductPage {
    title: string;
    price: number;
    renderedAt: number;
    cacheStatus: CacheStatus;
    ttlSeconds: number;
}
```

## 4. Mini-build — ISR product page simulator

**File:** `src/routes/modules/22-devops/03-vercel-edge/+page.svelte`

This page simulates an ISR product page with a configurable revalidation interval. The student sees a product card with its cache status, rendered timestamp, and a countdown to the next revalidation. Clicking "request page" demonstrates the stale-while-revalidate pattern.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/22-devops/03-vercel-edge`.

### Prove the concept

1. Set the TTL to 10 seconds and click "Request Page." The status shows "fresh."
2. Wait for the countdown to reach zero. The status changes to "stale."
3. Click "Request Page" again — you get the stale version instantly, while "regenerating" appears.
4. After regeneration completes, the next request shows "fresh" with an updated timestamp.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does ISR stand for, and what problem does it solve?</summary>

Incremental Static Regeneration. It solves the trade-off between SSG (fast but stale) and SSR (fresh but slow) by serving cached static pages instantly while regenerating them in the background at a configurable interval. Users always get fast responses, and content is never more than the revalidation interval stale.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between a Vercel Serverless Function and an Edge Function?</summary>

Serverless Functions run in AWS Lambda containers in a single region with full Node.js API access and 100-500ms cold starts. Edge Functions run in V8 isolates on Vercel's global edge network with near-zero cold starts but no Node.js APIs — only Web Standards APIs. Choose Serverless for heavy computation and Node.js dependencies; choose Edge for lightweight, latency-sensitive request handling.
</details>

<details>
<summary><strong>Q3.</strong> How does Vercel Edge Middleware differ from an Edge Function?</summary>

Middleware runs before every request and can rewrite URLs, redirect users, or modify headers — but it cannot generate a full response. Edge Functions handle complete request-response cycles. Middleware is for cross-cutting concerns like authentication checks and geolocation routing; Edge Functions are for serving actual page content or API responses.
</details>

<details>
<summary><strong>Q4.</strong> What happens if an ISR background regeneration fails?</summary>

The stale cached version continues to be served. Vercel does not replace the cached page until a new version is successfully rendered. This means ISR is self-healing — a temporary backend failure does not cause downtime because users still see the last good version.
</details>

<details>
<summary><strong>Q5.</strong> How do you force an ISR page to regenerate immediately, for example when a CMS editor publishes new content?</summary>

By sending a request with the `x-prerender-revalidate` query parameter set to the bypass token configured in the ISR options. This forces immediate regeneration regardless of the TTL. CMS webhooks typically trigger this on content publish events.
</details>

## 6. Common mistakes

- **Setting ISR revalidation to 0 seconds thinking it means "always fresh."** A TTL of 0 disables ISR caching entirely, making every request a full SSR render — the opposite of what ISR is designed for. If you need every request to be fresh, use SSR without ISR.
- **Using Edge Functions for routes that import Node.js dependencies.** If your route imports a package that uses `fs`, `net`, or other Node.js APIs, it will fail at the edge. Check your dependency tree before setting `runtime: 'edge'`.
- **Not configuring regions for latency-sensitive applications.** By default, Vercel deploys Serverless Functions to a single region. If your users are global, configure multiple regions in the adapter options or use Edge Functions.
- **Forgetting that ISR cached pages are shared across all users.** ISR pages are not personalized — every user sees the same cached HTML. If your page includes user-specific content (a logged-in user's name, their cart count), that content must be loaded client-side after the initial ISR-rendered page loads.

## 7. What's next

Lesson 22.4 takes a different approach to deployment — containerizing your SvelteKit application with Docker for environments where you need full control over the runtime.
