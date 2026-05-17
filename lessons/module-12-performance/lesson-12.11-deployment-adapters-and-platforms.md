---
module: 12
lesson: 12.11
title: Deployment — adapters and platforms
duration: 50 minutes
prerequisites:
  - Module 8 — SSR and SvelteKit rendering modes
  - Lesson 12.3 — bundle size
learning_objectives:
  - Explain what a SvelteKit adapter does
  - Pick between adapter-auto, adapter-node, adapter-vercel, and adapter-cloudflare
  - Configure environment variables correctly for production
  - Analyse a production build with Vite's bundle report
  - Deploy a minimal SvelteKit app to a single target
status: ready
---

# Lesson 12.11 — Deployment — adapters and platforms

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. Your app works on your laptop. The last step before it is "done" is making it work on a server that is not yours, in a way that survives real traffic. SvelteKit adapters make that step smaller than it sounds.

## 1. Concept — Adapters turn your app into a deployable

### 1.1 What a SvelteKit build produces without an adapter

When you run `pnpm build`, SvelteKit processes your routes and produces a pile of JavaScript, CSS, and HTML files *plus* a list of server-side routes that need a runtime. What it does not produce, by itself, is a runnable server. That is the job of an **adapter**.

An adapter is a small package that takes SvelteKit's build output and transforms it into the format your target platform expects. A Node server wants a single JavaScript file that calls `http.createServer`. Vercel wants a specific directory layout and a `vercel.json`. Cloudflare Workers wants a `wrangler.toml` and a single bundled worker file. Each adapter is a handful of lines of config + a build hook that produces the right shape.

### 1.2 The four adapters you will actually use

| Adapter | When to use it |
| --- | --- |
| **`@sveltejs/adapter-auto`** | Development and first deploy. Auto-detects the platform (Vercel, Netlify, Cloudflare) from environment variables and installs the right adapter. Good for zero-config "just ship it" projects. |
| **`@sveltejs/adapter-node`** | Self-hosting on a VPS, Docker container, Fly.io, Railway, or any Node runtime. Produces a standalone Node server. Gives you full control and zero platform lock-in. |
| **`@sveltejs/adapter-vercel`** | Vercel. Produces Vercel's edge-function and serverless-function formats with automatic routing. Best integrated developer experience if you are already on Vercel. |
| **`@sveltejs/adapter-cloudflare`** | Cloudflare Pages or Workers. Produces a worker that runs at the edge. Excellent for global latency; constrained by the Workers runtime (no Node-specific APIs). |

Choose based on where you want your app to run. For the course project you will use `adapter-auto` during development so it works on any platform, and switch to `adapter-node` or `adapter-vercel` for the final production deploy depending on where you choose to host.

### 1.3 Environment variables — `$env/static/*` vs `$env/dynamic/*`

SvelteKit offers two ways to read environment variables, and the distinction matters for deployment:

- **`$env/static/private`** and **`$env/static/public`** — inlined at build time. The values are baked into the build. Changing them requires a new build.
- **`$env/dynamic/private`** and **`$env/dynamic/public`** — read at runtime from `process.env` (or equivalent). Values can change across deployments without a rebuild.

The distinction between `private` and `public` is security: `private` variables are only available on the server and never reach the client bundle. `public` variables are visible to the client and must be prefixed with `PUBLIC_` in your `.env` file. A typical example:

```env
# .env (development)
DATABASE_URL=postgres://...
PUBLIC_SITE_NAME=Ultimate Frontend
```

```ts
// Server code
import { DATABASE_URL } from '$env/static/private';
```

```ts
// Client code — or server code
import { PUBLIC_SITE_NAME } from '$env/static/public';
```

Rule: **anything secret uses `$env/static/private` or `$env/dynamic/private`, never `PUBLIC_*`.** The course's convention is static for config that truly never changes between deploys, dynamic for anything the ops team might want to override without a rebuild.

### 1.4 Configuration tree for a production deploy

A minimal production-ready `svelte.config.js` looks like:

```js
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: true,
			envPrefix: 'APP_'
		}),
		csrf: { checkOrigin: true }
	}
};
```

- `precompress: true` emits pre-gzipped and pre-brotli versions of static assets so the server can serve them without compressing on the fly. Pure win.
- `csrf: { checkOrigin: true }` is the default and should stay on; it guards form actions against cross-origin POSTs.
- `envPrefix` (optional) lets you scope environment variable names so you do not accidentally leak `NODE_ENV` or other system variables to the client.

### 1.5 Bundle analysis

Before you deploy, look at what you are about to ship. Vite's build command reports the size of every chunk in the console:

```
dist/_app/immutable/chunks/main-abc123.js      42.3 kB │ gzip: 13.8 kB
dist/_app/immutable/chunks/vendor-def456.js   124.5 kB │ gzip: 38.2 kB
```

Anything unexpectedly large is a clue. A 124 KB "vendor" chunk tells you a third-party library is dominating the bundle; the `rollup-plugin-visualizer` package (or Vite's built-in `--mode analyze` in newer versions) produces a treemap that shows exactly which modules take how much space. The first time you run this analysis, you will find at least one library you did not know was that big. Swap it, dynamic-import it, or accept the cost with knowledge.

### 1.6 The deploy checklist

Before pushing a real deploy button, go through this short list:

1. `pnpm check` passes with zero errors and zero warnings.
2. `pnpm build` succeeds without warnings.
3. Lighthouse mobile audit scores 90+ on all four categories (performance, accessibility, best practices, SEO).
4. `pnpm vitest run` and `pnpm playwright test` both pass.
5. No secret values are in `$env/static/public` or `PUBLIC_*` variables.
6. The `adapter` in `svelte.config.js` matches the target platform.
7. The target platform has your environment variables configured.
8. A `+error.svelte` catches route-level errors.
9. Every major widget is wrapped in a `<svelte:boundary>`.
10. The robots.txt, sitemap, and canonical URLs are configured (Module 13).

Once all ten are green, ship it.

### 1.x What SvelteKit adapters do under the hood

An adapter transforms SvelteKit's build output into a format suitable for a specific deployment target:

1. **`adapter-node`:** Produces a standalone Node.js server. The output is a `build/` directory with `index.js` that starts an Express-like HTTP server. Deploy anywhere that runs Node.js: VPS, Docker, Railway, Fly.io.
2. **`adapter-vercel`:** Produces Vercel Serverless Functions. Each route becomes a function. Static assets go to the CDN. Config is auto-generated as `vercel.json`.
3. **`adapter-cloudflare`:** Produces Cloudflare Workers. Each route becomes a Worker handler. Uses the Workers runtime (V8 isolates, not Node.js).
4. **`adapter-static`:** Produces static HTML files only. All routes must be prerenderable. No server-side code runs at request time. Deploy to any static host (GitHub Pages, Netlify, S3).
5. **`adapter-auto`:** Detects your deployment platform from environment variables and picks the right adapter automatically.

The adapter runs as the final step of `pnpm build`. It reads the server manifest (which routes exist, which are prerendered, which need SSR) and packages accordingly.

> **In production sidebar.** We deploy to Vercel with `adapter-vercel`. Our 42-route app deploys in 45 seconds. Prerendered routes (about, blog, docs) are served from the edge CDN in < 10ms. SSR routes (dashboard, settings) run as Serverless Functions with a cold start of ~200ms and warm execution of ~50ms. We tried `adapter-node` on Railway first — it worked but cold starts were 800ms (full Node.js process startup). Vercel's function-per-route model keeps cold starts short because each function is small. The adapter choice directly affects TTFB and cold start performance.

### 1.x Common interview question

**Q: "What is a SvelteKit adapter, and how do you choose the right one?"**

**Model answer:** A SvelteKit adapter transforms the build output for a specific deployment target. `adapter-node` produces a standalone Node.js server for VPS or Docker deployments. `adapter-vercel` and `adapter-cloudflare` produce serverless functions for their respective platforms. `adapter-static` produces only HTML files for static hosting. Choose based on your deployment target: if you deploy to Vercel, use `adapter-vercel`. If you run your own server, use `adapter-node`. If the entire site is static, use `adapter-static`. The adapter does not change how you write code — routes, load functions, and components are the same regardless of adapter. Only the deployment packaging differs.

## Deep Dive

**Why this matters at scale.** The adapter choice determines runtime: cold start, distribution, cost, and feature support. adapter-node, adapter-static, adapter-auto serve different needs.

**The mental model.** adapter-node runs a long-lived server with fastest cold starts. adapter-static generates files with no runtime. adapter-auto detects the platform.

**Edge cases.** adapter-static requires all pages to be prerenderable — no server-side rendering, no form actions, no API routes with request-time logic.

**Performance implications.** adapter-node cold start is ~50ms. adapter-static is 0ms (CDN). Serverless adapters cold start 100-300ms. Runtime cost per request is lowest for adapter-node.

**Connection to other modules.** Module 8's SSR options interact with adapter capabilities. Module 13's prerendering requires adapter support.


## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — Nothing to style

Deployment produces no user-visible styling; the style rules do not apply to this lesson.

## 3. Interact — Read the build output

Students run `pnpm build` on their own project and read the chunk size table. The interaction is reading real data, not writing new code.

## 4. Mini-build — A deploy checklist page

**File:** `src/routes/modules/12-performance/11-deployment/+page.svelte`

A static, styled checklist that mirrors Section 1.6 so students can tick items off before a real deploy. No server code; the page is a reference card.

### DevTools moment

Open the Network panel on a deployed version of any page in this course. Look at the first request's response headers — content-encoding should be `gzip` or `br`. That is `precompress: true` paying off. If it is `identity`, the adapter option was missed.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does an adapter do?</summary>

It transforms SvelteKit's build output into the format a specific target platform expects (Node server, Vercel functions, Cloudflare worker, etc.). Without an adapter, `pnpm build` produces assets but no runnable deployment artefact.
</details>

<details>
<summary><strong>Q2.</strong> When should you use <code>adapter-node</code> instead of <code>adapter-vercel</code>?</summary>

When you are self-hosting on a VPS, Docker, Fly.io, Railway, or any runtime that speaks Node. `adapter-node` produces a standalone server you run yourself. `adapter-vercel` is specific to Vercel and only works on that platform.
</details>

<details>
<summary><strong>Q3.</strong> Why is <code>$env/static/private</code> safer than <code>$env/dynamic/public</code> for a secret?</summary>

Two reasons: `static/private` is never included in the client bundle (the compiler enforces server-only usage), and `public` variables — static or dynamic — are explicitly shipped to the browser. A secret in a `PUBLIC_*` variable is a leak by construction.
</details>

<details>
<summary><strong>Q4.</strong> What does <code>precompress: true</code> do?</summary>

It emits pre-gzipped and pre-brotli versions of every static asset at build time. The server then serves the compressed file directly, without compressing on every request. Less CPU at runtime, identical bytes on the wire.
</details>

<details>
<summary><strong>Q5.</strong> When should you run bundle analysis?</summary>

Before every significant deploy. Every new dependency is a potential regression in bundle size. The first time you analyse a new dependency, you often find it is dramatically larger than its README suggested.
</details>

## 6. Common mistakes

- **Deploying without running the build locally.** The CI build is the first to see the failure; you could have caught it in 30 seconds.
- **Secrets in `PUBLIC_*` variables.** Shipped to the browser. Irreversible on open source.
- **Wrong adapter.** `adapter-auto` is forgiving during development; pick a specific one for production.
- **Skipping Lighthouse before deploy.** You ship an accessibility regression and learn about it from a user.

## 7. What's next

Lesson 12.12 is the last lesson of the module — and the fun one. 3D performance with Threlte, including lazy-loading the canvas, DPR clamping, frame-loop management, and a fallback for users who have reduced motion enabled.
