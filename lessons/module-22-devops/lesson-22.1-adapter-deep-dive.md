---
module: 22
lesson: 22.1
title: Adapter deep dive
duration: 55 minutes
prerequisites:
  - "8.1 — What SvelteKit adds to Svelte"
  - "8.12 — The four rendering modes in depth"
  - "12.11 — Deployment — adapters and platforms"
  - "21.1 — What Vite actually does"
learning_objectives:
  - Explain what a SvelteKit adapter does and why the build output differs per platform
  - Compare adapter-node, adapter-vercel, adapter-cloudflare, adapter-netlify, and adapter-static
  - Choose the correct adapter for a given deployment target using a decision matrix
  - Configure adapter options in svelte.config.js for each platform
  - Articulate the trade-offs between serverless, edge, containerized, and static deployments
status: ready
---

# Lesson 22.1 — Adapter deep dive

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — The bridge between your code and where it runs

### 1.1 The problem: one codebase, many deployment targets

You have a SvelteKit application. It uses server-side rendering, form actions, API routes, and dynamic data loading. Now you need to deploy it. The question is: where?

Your team might deploy to Cloudflare Workers for edge-first performance. Another project might land on Vercel for its Git-push deploys. A client with strict compliance requirements might need a Docker container on their own infrastructure. A marketing site might just need static HTML files on a CDN.

Each of these targets expects a fundamentally different output format. A Docker container running Node.js needs a `server.js` entry point and a `node_modules` directory. Cloudflare Workers need a single JavaScript file that conforms to the Workers runtime API. Vercel needs serverless function bundles in a `.vercel/output` directory. A static host needs plain HTML, CSS, and JavaScript files with no server logic at all.

Without an abstraction layer, you would have to rewrite your deployment configuration — and potentially your application code — every time you changed hosting platforms. SvelteKit solves this with **adapters**.

### 1.2 What an adapter actually does

An adapter is a SvelteKit plugin that runs after `pnpm build` and transforms SvelteKit's intermediate build output into the format that a specific platform expects. Think of it as a translator: SvelteKit speaks one language (its internal build format), and each adapter translates that into the dialect of a particular hosting platform.

When you run `pnpm build`, two things happen in sequence:

1. **Vite builds your application** into an intermediate format in `.svelte-kit/output`. This includes compiled server-side code, client-side JavaScript bundles, prerendered HTML pages, and a manifest describing every route.
2. **The adapter runs** and reads `.svelte-kit/output`. It repackages that output into whatever the target platform needs — a Node server, serverless functions, Workers scripts, or static files.

The adapter is configured in `svelte.config.js`:

```typescript
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter({
            out: 'build',
            precompress: true
        })
    }
};

export default config;
```

### 1.3 The five official adapters

**adapter-node** produces a standalone Node.js server. The output directory contains a `handler.js` (the request handler), an `index.js` (the entry point that starts the server), a `client/` directory with static assets, and a `server/` directory with server-side code. You run it with `node build/index.js`. This adapter gives you full control: you choose the Node.js version, you manage the process, you configure the port. It is the adapter you use when deploying to Docker, a VPS, AWS EC2, or any environment where you control the runtime.

**adapter-vercel** produces output in the Vercel Build Output API format. It creates serverless functions (or edge functions, depending on your route configuration) in `.vercel/output/functions`, static assets in `.vercel/output/static`, and a `config.json` that maps routes to functions. Vercel's platform reads this output and deploys it automatically. You get ISR (Incremental Static Regeneration), image optimization, analytics, and preview deployments out of the box.

**adapter-cloudflare** produces a Cloudflare Workers script. The entire server-side portion of your app is compiled into a single JavaScript file that runs on Cloudflare's edge network — over 300 locations worldwide. This adapter supports platform bindings: KV (key-value storage), D1 (SQLite at the edge), R2 (object storage), and Durable Objects (stateful coordination). The cold start is near-zero because Workers use V8 isolates, not containers.

**adapter-netlify** produces Netlify Functions and edge functions. The output includes serverless functions in `.netlify/functions-internal`, static files in the publish directory, and a `_redirects` file for routing. Netlify's platform handles the deployment pipeline, preview deploys, and edge function distribution.

**adapter-static** produces plain HTML, CSS, and JavaScript files with no server runtime at all. Every page must be prerenderable — if a route has a `+page.server.ts` with form actions or a `+server.ts` API route that cannot be prerendered, the build fails. This adapter is for sites that are truly static: documentation, marketing pages, blogs built from Markdown.

### 1.4 Decision matrix: choosing the right adapter

The decision depends on five factors:

| Factor | adapter-node | adapter-vercel | adapter-cloudflare | adapter-netlify | adapter-static |
|--------|-------------|----------------|-------------------|-----------------|----------------|
| **Server logic** | Full Node.js | Serverless + Edge | Edge (V8 isolates) | Serverless + Edge | None |
| **Cold start** | None (always running) | ~250ms (serverless) | ~0ms (isolates) | ~250ms (serverless) | N/A |
| **Node.js APIs** | Full access | Limited in edge | Not available | Limited in edge | N/A |
| **Database access** | Any driver | Serverless-compatible | D1, Hyperdrive | Serverless-compatible | Build-time only |
| **Control** | Full | Platform-managed | Platform-managed | Platform-managed | Full |
| **Cost model** | Fixed (server) | Per-invocation | Per-request | Per-invocation | Hosting only |

If you need full Node.js API access (file system, child processes, native modules), choose **adapter-node**. If you want zero-config Git-push deploys with ISR, choose **adapter-vercel**. If edge latency matters and you can work within V8 isolate constraints, choose **adapter-cloudflare**. If you want a similar managed experience to Vercel with good form handling, choose **adapter-netlify**. If your site is entirely static, choose **adapter-static**.

### 1.5 What is different in the May 2026 version

SvelteKit 2.60+ improved adapter configuration with better TypeScript types for platform-specific bindings. The `platform` object in hooks and load functions is now fully typed per adapter — `adapter-cloudflare` provides typed `platform.env` for KV, D1, and R2 bindings. Adapter-node gained a `gracefulShutdown` option for Docker health check integration. Adapter-vercel added first-class support for Vercel's `revalidate` option in ISR mode.

### 1.6 "In Production" — adapter migration at scale

A fintech startup launched on Vercel with `adapter-vercel` for rapid iteration during their MVP phase. As they scaled to 50,000 daily active users, two problems emerged: serverless cold starts added 250ms latency to their first API call per session, and Vercel's per-invocation pricing became significant at scale. They migrated to `adapter-node` running in Docker on AWS ECS. The migration took one afternoon: swap the adapter import, add a Dockerfile, and update the CI pipeline. No application code changed. The adapter abstraction saved them from a rewrite because SvelteKit's internal build output is the same regardless of which adapter consumes it.

### 1.7 The TypeScript angle

Each adapter provides platform-specific types. For adapter-cloudflare, you augment `App.Platform` in `src/app.d.ts`:

```typescript
declare global {
    namespace App {
        interface Platform {
            env: {
                MY_KV: KVNamespace;
                MY_DB: D1Database;
                MY_BUCKET: R2Bucket;
            };
            context: ExecutionContext;
        }
    }
}
```

This gives you type-safe access to `platform.env.MY_KV` in hooks, load functions, and API routes. Without this declaration, `platform` is typed as `Readonly<App.Platform>` with an empty interface, and you get no autocompletion or type checking for platform bindings.

### 1.8 Common interview question

**Q: "You have a SvelteKit app with server-side rendering, form actions, and API routes. A client asks you to deploy it as a static site. What do you tell them?"**

**Model answer:** A fully static deployment is not possible if the app uses server-side features like form actions, non-prerenderable load functions, or dynamic API routes. `adapter-static` requires that every page can be prerendered at build time. I would explain the trade-offs: they could prerender the marketing pages and move the dynamic features to client-side API calls against a separate backend, or they could use `adapter-node` or a managed platform like Vercel that supports both static and dynamic routes in the same deployment. The hybrid approach — prerendering what can be prerendered and server-rendering the rest — is what SvelteKit does best.

## Deep Dive

**How adapters consume SvelteKit's build output.** After Vite produces the intermediate output in `.svelte-kit/output`, the adapter receives a `Builder` object with methods like `writeClient()`, `writeServer()`, `writePrerendered()`, and `generateManifest()`. The adapter calls these methods to extract the pieces it needs. `writeClient()` copies the client-side JavaScript bundles and static assets. `writeServer()` copies the server-side rendering code. `writePrerendered()` copies any pages that were statically generated at build time. The adapter combines these pieces into the target format — for adapter-node, it wraps the server code in an Express-compatible handler; for adapter-cloudflare, it wraps it in a Workers fetch handler.

**Custom adapters.** You can write your own adapter for platforms that do not have an official one. An adapter is a function that returns an object with a `name` string and an `adapt(builder)` method. Inside `adapt()`, you use the `builder` API to extract build output and write it wherever you need. Teams deploy to AWS Lambda, Google Cloud Run, Deno Deploy, and Bun using community or custom adapters. The adapter API is stable and well-documented — writing one is typically 50-100 lines of code.

**Precompression.** Both adapter-node and adapter-static support a `precompress` option that generates `.gz` and `.br` (Brotli) versions of every static asset at build time. This means your server or CDN can serve pre-compressed files without doing the compression on every request, saving CPU time and reducing response latency. Always enable precompression for production deployments.

**The `paths.base` configuration.** If your app is not deployed at the root of a domain (e.g., it lives at `example.com/app/`), you set `paths.base` in `svelte.config.js`. Every adapter respects this setting and adjusts its output accordingly. Forgetting to set `paths.base` is a common source of broken asset URLs after deployment.

**Connection to other lessons.** Lesson 22.2 explores adapter-cloudflare in depth, including KV, D1, and R2 bindings. Lesson 22.3 covers adapter-vercel with ISR and edge functions. Lesson 22.4 pairs adapter-node with Docker for containerized deployment.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/kit/adapters](https://svelte.dev/docs/kit/adapters) — the official adapter documentation, including how to write a custom adapter.
- [svelte.dev/docs/kit/adapter-node](https://svelte.dev/docs/kit/adapter-node) — adapter-node configuration options.
- [svelte.dev/docs/kit/adapter-cloudflare](https://svelte.dev/docs/kit/adapter-cloudflare) — Cloudflare adapter with Workers bindings.

**Advanced pattern: multi-adapter builds.** Some teams maintain multiple `svelte.config.js` variants (via environment variables) to build the same app for different targets. A staging environment might use adapter-node in Docker for debugging, while production uses adapter-cloudflare for edge performance. This works because the application code is identical — only the adapter configuration changes.

**Challenge question (combines Lesson 22.1 + Lesson 22.2 + Lesson 22.4):** Your company runs a SvelteKit app on adapter-node in Docker. The CEO wants to reduce latency for users in Asia-Pacific. You have two options: (a) deploy additional Docker containers in an APAC region behind a load balancer, or (b) migrate to adapter-cloudflare to serve from 300+ edge locations. What questions would you ask before deciding, and what technical constraints might block option (b)?

## 2. Style it — PE7 applied to the adapter comparison dashboard

The mini-build is a comparison dashboard showing all five adapters as cards in a responsive grid. Each card uses `var(--color-surface-2)` background, `var(--radius-lg)` corners, and `var(--shadow-sm)` elevation. The selected adapter highlights with a `var(--color-brand)` left border and `var(--shadow-md)` lift. The detail panel below uses `var(--color-surface)` with `var(--color-border)` separation. Typography uses `var(--text-lg)` for adapter names and `var(--text-sm)` for descriptions. The grid is single-column on mobile and auto-fills to 3 columns at `min-width: 768px`.

## 3. Interact — selecting an adapter and viewing its output details

The problem: developers often pick an adapter without understanding what it actually produces. The interactive element lets you click each adapter card to see its output structure, configuration example, platform features, and trade-offs. A `$derived` computation updates the detail panel based on the selected adapter, and a second `$derived` generates the corresponding `svelte.config.js` snippet.

```typescript
type AdapterName = 'node' | 'vercel' | 'cloudflare' | 'netlify' | 'static';

interface AdapterInfo {
    id: AdapterName;
    label: string;
    outputDescription: string;
    coldStart: string;
    runtime: string;
    configSnippet: string;
    features: string[];
}
```

When you select an adapter, the detail panel transitions smoothly to show the new content. The config snippet updates to show the exact `svelte.config.js` code you would write for that adapter.

## 4. Mini-build — adapter comparison dashboard

**File:** `src/routes/modules/22-devops/01-adapter-deep-dive/+page.svelte`

This page renders an interactive comparison of all five SvelteKit adapters. The student clicks an adapter card and sees its output format, configuration code, platform features, and trade-offs. A generated `svelte.config.js` snippet updates live based on the selection.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/22-devops/01-adapter-deep-dive`.

### Prove the concept

1. Open DevTools **Elements** tab and inspect the adapter cards. Notice the scoped class hashes Svelte applies.
2. Click each adapter and watch the detail panel update. In the Svelte DevTools extension, observe the `$derived` values recalculating.
3. Check the config snippet — copy it into a temporary `svelte.config.js` to verify it is valid JavaScript.
4. Resize the browser to see the grid reflow from single column (mobile) to multi-column (desktop).

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does a SvelteKit adapter do, and when does it run in the build process?</summary>

An adapter runs after Vite has built the application into an intermediate format in `.svelte-kit/output`. It transforms that intermediate output into the format a specific deployment platform expects — a Node.js server, serverless functions, Workers scripts, or static HTML files. The adapter is the last step in `pnpm build`.
</details>

<details>
<summary><strong>Q2.</strong> Why can you not use adapter-static for an app with form actions?</summary>

Form actions require a server to receive and process POST requests. `adapter-static` produces only static HTML, CSS, and JavaScript files with no server runtime. Since there is no server to handle form submissions, the build will fail if any route has form actions that cannot be prerendered. You would need adapter-node, adapter-vercel, or another server-capable adapter.
</details>

<details>
<summary><strong>Q3.</strong> What is the practical difference between a cold start of ~250ms (serverless) and ~0ms (Workers isolates)?</summary>

Serverless functions (Vercel, Netlify) run in containers that are spun up on demand. The first request after a period of inactivity pays a ~250ms penalty while the container initializes. Workers isolates reuse a pre-warmed V8 engine and start a new isolate in microseconds, so there is effectively no cold start penalty. For user-facing applications where first-request latency matters (e.g., API calls that block page rendering), this difference directly affects perceived performance.
</details>

<details>
<summary><strong>Q4.</strong> How does the App.Platform interface help when using adapter-cloudflare?</summary>

By augmenting `App.Platform` in `src/app.d.ts`, you declare the types of your Cloudflare bindings (KV namespaces, D1 databases, R2 buckets). This gives you type-safe access to `platform.env` in hooks, load functions, and API routes — you get autocompletion, type checking, and compile-time errors if you misspell a binding name or use the wrong API.
</details>

<details>
<summary><strong>Q5.</strong> An app works perfectly in development but fails after deploying with adapter-static. What is the most likely cause?</summary>

The app likely has routes that require server-side logic at request time — dynamic load functions in `+page.server.ts`, form actions, or API routes in `+server.ts` that cannot be prerendered. In development, SvelteKit runs a full server that handles all these cases. With adapter-static, only prerenderable routes are supported. The fix is either to make those routes prerenderable (by adding `export const prerender = true` and ensuring they do not depend on request-time data) or to switch to an adapter that supports server-side rendering.
</details>

## 6. Common mistakes

- **Using adapter-cloudflare and then calling Node.js-specific APIs like `fs.readFile`.** Cloudflare Workers run in a V8 isolate, not Node.js. There is no file system, no `child_process`, no native modules. If your server code depends on Node.js APIs, you must use adapter-node or polyfill the specific APIs you need.
- **Forgetting to set `paths.base` when deploying to a subdirectory.** If your app lives at `example.com/app/` instead of the domain root, all asset URLs and navigation links will break unless you set `paths.base: '/app'` in `svelte.config.js`. This affects every adapter.
- **Assuming all adapters support the same features.** Streaming, WebSockets, and long-running processes work with adapter-node but may have limitations or different implementations on serverless and edge platforms. Always check the adapter documentation for platform-specific constraints.
- **Not enabling `precompress` for production.** Both adapter-node and adapter-static support pre-generating gzip and Brotli versions of static files. Without this, your server compresses files on every request, wasting CPU cycles and adding latency.

## 7. What's next

Lesson 22.2 dives deep into Cloudflare Workers and Pages — the edge-first deployment model with KV, D1, and R2 bindings accessed through `platform.env` in SvelteKit.
