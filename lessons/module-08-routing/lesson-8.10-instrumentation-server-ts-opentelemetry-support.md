---
module: 8
lesson: 8.10
title: instrumentation.server.ts — OpenTelemetry basics
duration: 50 minutes
prerequisites:
  - Lesson 8.9 — hooks.server.ts
  - Basic familiarity with HTTP requests and latency metrics
learning_objectives:
  - Explain what OpenTelemetry is and why it matters for production SvelteKit apps
  - Describe the role of instrumentation.server.ts and why SvelteKit loads it before any other file
  - Wire up a minimal request span around every route render
  - Attach useful attributes (route ID, method, status) to each span
  - Know the difference between traces, metrics and logs
status: ready
---

# Lesson 8.10 — `instrumentation.server.ts` — OpenTelemetry basics

## 1. Concept — Observing what happens in production

### 1.1 The problem — "the site feels slow", but where?

A user emails you at 9 a.m.: the dashboard is slow. You open it locally and it feels fine. You open it on the staging server: fine. You ask "which page?" and they reply "the one with the chart". There are eight pages with a chart. You have no idea which route, which load function, which database query, or which network call is to blame.

Observability is the collective name for the tools that answer these questions. The industry-standard vendor-neutral specification is **OpenTelemetry** (OTel). It defines three kinds of signals:

- **Traces** — a timeline of spans showing how a single request flowed through your code, with parent/child relationships.
- **Metrics** — aggregated numbers over time, like "requests per second" or "p95 latency".
- **Logs** — textual events with timestamps, associated with a trace when possible.

For a SvelteKit app, traces are usually the most useful of the three: one trace per request, one span per load function, one span per database query, and you can see exactly where the 800 ms went.

### 1.2 `instrumentation.server.ts` — the earliest possible hook

OpenTelemetry SDKs need to be initialised **before any user code runs**. If you try to initialise OTel inside `hooks.server.ts`, the module will already have loaded other modules that did HTTP or database work, and those will not be instrumented.

SvelteKit 2.50+ introduces a dedicated file for this: `src/instrumentation.server.ts`. SvelteKit runs it as the very first thing when the server boots, before any route module is imported. This is the place to call `opentelemetry.initialize()` (or your observability vendor's initialiser).

```ts
// src/instrumentation.server.ts
// This file is the first thing SvelteKit loads on the server.
// Put OpenTelemetry SDK initialisation here, nothing else.

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
    serviceName: 'ultimate-frontend',
    traceExporter: new OTLPTraceExporter({ url: 'http://localhost:4318/v1/traces' }),
    instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();
```

Once this file runs, `fetch`, `http`, database drivers and many other Node libraries are auto-wrapped — every call becomes a span, with duration, attributes and parent/child structure. You do not instrument your code; the instrumentation instruments itself.

### 1.3 Adding custom spans from a `handle` hook

Auto-instrumentation covers the builtins. For SvelteKit-specific information (the route ID, the load function name, the rendered status) you add custom spans from inside `handle`:

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('sveltekit-app');

export const handle: Handle = async ({ event, resolve }) => {
    return tracer.startActiveSpan(`${event.request.method} ${event.url.pathname}`, async (span) => {
        span.setAttribute('http.method', event.request.method);
        span.setAttribute('http.route', event.route.id ?? 'unknown');
        try {
            const response = await resolve(event);
            span.setAttribute('http.status_code', response.status);
            return response;
        } catch (error) {
            span.recordException(error as Error);
            throw error;
        } finally {
            span.end();
        }
    });
};
```

Now every request produces a top-level span named after the route, with the status code and route ID attached. Drop this into a backend like Jaeger, Honeycomb, Grafana Tempo or the Chrome OTLP viewer, and you can click any slow request and see exactly which spans inside it took time.

### 1.4 Traces vs metrics vs logs — pick the right signal

- Use **traces** to answer *"what happened in this one slow request?"*.
- Use **metrics** to answer *"is the site getting slower week over week?"*.
- Use **logs** to answer *"why did this specific error occur?"*.

A good production setup uses all three. SvelteKit's instrumentation.server.ts is mostly about traces — metrics and logs have their own SDK calls.

### 1.5 What this lesson does *not* cover

We do not wire up a real OpenTelemetry backend in this course repository, because doing so requires either a local collector or a paid service and would make `pnpm dev` slower and less reliable. The mini-build is a small console that *simulates* a trace locally — it measures the load function duration on the server and displays it on the client, so you can see the shape of a span without the external dependencies. In a real project, swap the console for the real OTel SDK and everything else stays identical.





### The TypeScript angle

The instrumentation file exports `init(): void` which runs before any other server code.

> **In production sidebar.** On a 100K-daily-user dashboard, OpenTelemetry traces revealed 70% of p95 latency on `/dashboard` came from a single database query in a layout load function — not the page load the team had been optimising.

### Common interview question

**Q: What is `instrumentation.server.ts` and why does SvelteKit load it first?**

**Model answer:** It runs before any other server code for OpenTelemetry SDK initialisation. If you initialise OTel in hooks, modules imported before hooks would miss instrumentation. The instrumentation file ensures complete tracing coverage from the first import.

## Going Deeper

**Official documentation:**
- [SvelteKit docs: instrumentation](https://svelte.dev/docs/kit/hooks#Instrumentation)
- [OpenTelemetry JS docs](https://opentelemetry.io/docs/languages/js/)
- [OpenTelemetry: Getting Started](https://opentelemetry.io/docs/getting-started/)

**Advanced pattern:** Set up a minimal `instrumentation.server.ts` that logs "OTel initialized" on server boot. Verify it runs before `hooks.server.ts` by comparing log timestamps.

**Challenge question:** (Combines Lessons 8.10, 8.9, and 8.2) Set up OpenTelemetry tracing with a console exporter. Add a custom span inside a `handle` hook. View the trace output showing the request flow: instrumentation → handle → load → render → response.

## Deep Dive

**Why this matters at scale.** Observability in production requires structured telemetry. instrumentation.server.ts runs once at server start, before any request handling.

**The mental model.** The file exports init() which runs at startup. Register OpenTelemetry providers, initialize APM agents, or set up custom metrics. This runs before hooks.server.ts.

**Edge cases.** The init function is async but must complete before the server accepts requests. Long-running initialization delays server startup. Keep it under 2 seconds.

**Performance implications.** Telemetry collection adds per-request overhead: typically 0.1-0.5ms for span creation and attribute setting. The overhead is negligible compared to load function execution.

**Connection to other modules.** Module 12's performance monitoring connects to telemetry established here. Module 8.9's hooks can create request-scoped spans.

## 2. Style it — PE7 for a trace viewer

The mini-build displays a "simulated trace" panel with one parent row (the whole request) and two child rows (load function, render). We give the page a deep-purple personality (`oklch(55% 0.2 300)`) and use monospaced values. Durations are formatted in milliseconds with `.toFixed(1)`.

## 3. Interact — measuring duration on the server

```ts
// +page.server.ts
export const load: PageServerLoad = async () => {
    const start = performance.now();
    // Simulate a small amount of work so the duration is visible.
    await new Promise((r) => setTimeout(r, 30));
    const duration = performance.now() - start;
    return { loadDuration: duration };
};
```

The load function returns its own duration. The page displays it. In a real trace, this number would be the duration of a child span whose parent is the request span created in `hooks.server.ts`.

## 4. Mini-build — a simulated trace

**Paths:**

- `src/routes/modules/08-routing/10-instrumentation/+page.svelte`
- `src/routes/modules/08-routing/10-instrumentation/+page.server.ts`

Open `/modules/08-routing/10-instrumentation`. You will see a two-row trace: the parent span (made up on the client using `performance.now()` around the page mount) and the load function span (measured on the server). Reload a few times to see the load duration vary.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does SvelteKit have a separate file, <code>instrumentation.server.ts</code>, instead of putting OTel init in <code>hooks.server.ts</code>?</summary>

Because OpenTelemetry needs to be initialised before any other module is loaded. `hooks.server.ts` is already too late — by the time it runs, other modules have been imported and their network calls would not be instrumented. SvelteKit guarantees `instrumentation.server.ts` runs first.
</details>

<details>
<summary><strong>Q2.</strong> What is a "span"?</summary>

A span is one unit of work in a trace, with a name, a start time, a duration and a set of attributes. Spans nest — a parent span can contain child spans, representing the sub-operations it triggered. A trace is the tree of all spans for a single request.
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between traces and metrics?</summary>

Traces describe a single request in detail; metrics describe aggregated numbers across many requests. Traces answer "what happened here?"; metrics answer "is this getting better or worse?".
</details>

<details>
<summary><strong>Q4.</strong> In a SvelteKit <code>handle</code> hook, why would you wrap <code>resolve(event)</code> in <code>tracer.startActiveSpan()</code>?</summary>

So that every request has a named top-level span with the route ID and HTTP method attached. Any spans produced by load functions or by auto-instrumented libraries will then become children of that span, giving you a complete trace per request.
</details>

<details>
<summary><strong>Q5.</strong> Does <code>instrumentation.server.ts</code> ship to the browser?</summary>

No. The file name ends in `.server.ts`, so SvelteKit never includes it in the client bundle. It runs only in Node (or your adapter's server runtime).
</details>

## 6. Common mistakes

- **Initialising OTel inside a `+page.server.ts` or a component.** Too late. Auto-instrumentation of builtins has to happen before those modules are imported.
- **Forgetting `span.end()` in a `finally` block.** Spans that never end appear as "in progress" forever in your trace viewer, which hides real issues.
- **Instrumenting development mode heavily.** Auto-instrumentation has overhead. Leave it on in staging and production; consider disabling it in local dev unless you are actively debugging.
- **Treating OTel as a logger.** Logs and traces are different signals. Use `span.addEvent()` for trace-attached events and a separate logger (or the OTel logs SDK) for plain logs.

## 7. What's next

Lesson 8.11 returns to the user experience layer and uses `onNavigate` plus the View Transitions API to animate transitions between routes.
