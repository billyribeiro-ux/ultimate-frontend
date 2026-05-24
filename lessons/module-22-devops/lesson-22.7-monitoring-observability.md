---
module: 22
lesson: 22.7
title: Monitoring & observability
duration: 55 minutes
prerequisites:
  - "22.6 — Feature flags"
  - "8.10 — instrumentation.server.ts — OpenTelemetry support"
  - "10.1 — +server.ts — building API endpoints"
learning_objectives:
  - Distinguish between monitoring (knowing something is broken) and observability (knowing why)
  - Implement structured logging with JSON format and severity levels
  - Build a health endpoint that reports application status, uptime, and dependency health
  - Describe the error tracking pattern using Sentry-style context capture
  - Connect OpenTelemetry concepts from Module 8.10 to production monitoring
status: ready
---

# Lesson 22.7 — Monitoring & observability

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Knowing what your app is doing when you are not looking

### 1.1 The problem: production is a black box

Your SvelteKit application is deployed. Users are visiting. But you have no idea what is happening. Are pages loading in 200ms or 2000ms? Are API routes returning errors? Is the database connection pool exhausted? Did that feature flag rollout from Lesson 22.6 cause a spike in errors?

Without monitoring and observability, you only learn about problems when users complain — or worse, when they silently leave. By the time a user reports an issue, dozens or hundreds of others have already experienced it.

**Monitoring** tells you **that** something is wrong. A health check fails. An error rate exceeds a threshold. CPU usage spikes above 90%.

**Observability** tells you **why** something is wrong. A distributed trace shows that the `/api/products` endpoint is slow because a database query takes 3 seconds. A structured log entry shows that the slow query is caused by a missing index on the `category` column. An error report includes the user ID, request URL, and stack trace that identify the exact failure path.

### 1.2 The three pillars of observability

Production observability rests on three pillars:

**Logs** — timestamped records of events. When structured as JSON (structured logging), logs become searchable and parseable by automated systems. Instead of `console.log('user logged in')`, you emit `{"level":"info","event":"user.login","userId":"abc123","timestamp":"2026-05-24T10:00:00Z"}`.

**Metrics** — numerical measurements over time. Request count, error rate, response time (p50, p95, p99), memory usage, CPU usage, active connections. Metrics are aggregated and graphed to show trends and anomalies.

**Traces** — records of a single request's journey through your system. A trace starts when a user's browser sends a request and ends when the response arrives. Each step (middleware, load function, database query, external API call) is a **span** within the trace. Traces show where time is spent and where failures occur.

### 1.3 Structured logging in SvelteKit

Structured logging replaces `console.log` with JSON-formatted log entries that include consistent fields:

```typescript
// src/lib/logging.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    traceId?: string;
    spanId?: string;
}

function createLogger(module: string) {
    return {
        info(message: string, context?: Record<string, unknown>): void {
            emit('info', module, message, context);
        },
        warn(message: string, context?: Record<string, unknown>): void {
            emit('warn', module, message, context);
        },
        error(message: string, context?: Record<string, unknown>): void {
            emit('error', module, message, context);
        }
    };
}

function emit(
    level: LogLevel,
    module: string,
    message: string,
    context?: Record<string, unknown>
): void {
    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context: { ...context, module }
    };
    // In production, this goes to stdout where a log collector picks it up
    console.log(JSON.stringify(entry));
}
```

Why JSON? Because log aggregation systems (Datadog, Grafana Loki, AWS CloudWatch) can parse JSON and let you filter by field: "show me all error-level logs from the `auth` module in the last hour." Plain text logs require regex parsing, which is fragile and slow.

### 1.4 Health endpoints

A health endpoint is an API route that reports whether your application is running and healthy. It is consumed by orchestrators (Kubernetes, Docker), load balancers, and uptime monitoring services.

A good health endpoint checks more than "the process is running." It verifies that critical dependencies are reachable:

```typescript
// src/routes/api/health/+server.ts
import type { RequestHandler } from './$types';

interface HealthCheck {
    name: string;
    status: 'pass' | 'fail';
    duration: number;
    message?: string;
}

interface HealthResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    version: string;
    checks: HealthCheck[];
}

export const GET: RequestHandler = async () => {
    const checks: HealthCheck[] = [];
    // Check each dependency...
    const allPassed: boolean = checks.every(
        (c: HealthCheck) => c.status === 'pass'
    );

    const response: HealthResponse = {
        status: allPassed ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        checks
    };

    return new Response(JSON.stringify(response), {
        status: allPassed ? 200 : 503,
        headers: { 'Content-Type': 'application/json' }
    });
};
```

Return 200 for healthy and 503 for unhealthy. The 503 status tells load balancers to route traffic away from this instance.

### 1.5 Error tracking: the Sentry pattern

Errors in production need context. A bare stack trace tells you where the error occurred but not why. Error tracking tools (Sentry is the most popular) capture:

- The error message and stack trace
- The request URL, method, and headers
- The user's browser, OS, and screen size
- Breadcrumbs: a timeline of events leading up to the error (page navigations, button clicks, API calls)
- Custom context: user ID, account ID, feature flags

In SvelteKit, you capture errors in `hooks.server.ts`:

```typescript
// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
    const errorId: string = crypto.randomUUID();
    console.error(JSON.stringify({
        level: 'error',
        errorId,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url: event.url.pathname,
        method: event.request.method,
        status
    }));
    return { message: 'An unexpected error occurred', errorId };
};
```

The `errorId` lets users report issues with a reference that maps to the server-side log entry.

### 1.6 OpenTelemetry revisited for production

In Lesson 8.10, you learned about `instrumentation.server.ts` and OpenTelemetry. In production, OpenTelemetry becomes the backbone of observability. Traces from SvelteKit flow into a collector (Jaeger, Grafana Tempo, Datadog APM), where you can visualize the complete request lifecycle:

```
[Browser] → [CDN] → [SvelteKit hooks] → [load function] → [database query]
   50ms       5ms        10ms               30ms              200ms
```

This trace shows that the database query accounts for 68% of the total response time. Without tracing, you would only know that the page took 295ms — not where the time was spent.

### 1.7 "In Production" — monitoring saves a product launch

A startup launched a new feature on a Friday afternoon (a classic mistake). Within 30 minutes, their structured logging showed a 400% increase in error-level entries from the `checkout` module. Their health endpoint began returning `degraded` status because the payment API was returning 429 (rate limited) — the new feature triggered 3x more payment API calls per checkout. Because they had monitoring dashboards, the on-call engineer noticed within 5 minutes and disabled the feature flag (Lesson 22.6). Total user impact: 5 minutes of degraded checkout experience for 10% of users (the percentage in the flag rollout). Without monitoring, they would not have noticed until Monday.

### 1.8 The TypeScript angle

Typed log entries and health responses ensure consistency across your application:

```typescript
// A discriminated union for log events
type AppEvent =
    | { event: 'request.start'; url: string; method: string }
    | { event: 'request.complete'; url: string; duration: number; status: number }
    | { event: 'flag.evaluated'; flagId: string; value: boolean; source: string }
    | { event: 'error.unhandled'; errorId: string; message: string };
```

Using a discriminated union means each event type has its own required fields. You cannot emit a `request.complete` event without a `duration` field — TypeScript enforces this at compile time.

### 1.9 Common interview question

**Q: "What is the difference between monitoring and observability? Give an example of each."**

**Model answer:** Monitoring tells you that something is wrong — it is a binary signal. An uptime check pings your health endpoint every 30 seconds and alerts you when it fails. Observability tells you why something is wrong — it provides the data to diagnose the root cause. A distributed trace shows that your `/api/products` endpoint is slow because a database query scans 2 million rows due to a missing index. Monitoring is "the error rate doubled." Observability is "the error rate doubled because users with accounts created before 2025 have a null `preferences` column, and the new code does not handle null."

## Deep Dive

**Log levels and when to use each.** `debug`: detailed information only useful during development (variable values, function entry/exit). `info`: normal operations worth recording (user login, payment processed, feature flag evaluated). `warn`: unexpected but handled situations (retry after timeout, deprecated API call). `error`: unhandled failures that require investigation (unhandled exception, database connection failure). In production, set the minimum level to `info`. Debug logs are too noisy and too voluminous for production log storage.

**Uptime monitoring.** External uptime monitors (Pingdom, Better Uptime, UptimeRobot) ping your health endpoint from multiple global locations. They detect outages that internal monitoring cannot see — for example, a DNS failure or a CDN outage that makes your site unreachable even though the server is running. An uptime monitor that pings every 30 seconds from 5 locations catches outages within 1 minute.

**Alerting fatigue.** The biggest risk in monitoring is too many alerts. If your team receives 50 alerts per day, they will start ignoring them — including the critical ones. Set alert thresholds carefully: alert on anomalies (error rate 3x higher than baseline), not absolute values (error count > 0). Group related alerts. Require a runbook for every alert: "when this fires, do X."

**Synthetic monitoring.** In addition to real-user monitoring, run synthetic tests — automated scripts that simulate user flows (log in, add item to cart, check out) on a schedule. Synthetic tests catch issues before real users encounter them and provide consistent baselines for performance comparison.

**Connection to other lessons.** Lesson 8.10 introduced `instrumentation.server.ts` for OpenTelemetry. Lesson 22.6 covered feature flags, which should be monitored for rollout impact. Lesson 22.8 covers incident response, which depends on monitoring to detect incidents.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/kit/hooks#handleError](https://svelte.dev/docs/kit/hooks) — SvelteKit error handling hooks.
- [opentelemetry.io/docs/concepts](https://opentelemetry.io/docs/concepts/) — OpenTelemetry concepts (traces, spans, metrics, logs).
- [sentry.io/for/svelte](https://sentry.io/for/svelte/) — Sentry integration for Svelte and SvelteKit.

**Advanced pattern: custom SvelteKit metrics middleware.** Create a `handle` hook in `hooks.server.ts` that measures and logs the duration of every request. Emit a structured log entry with the route ID, method, status code, and response time. Aggregate these logs in your monitoring system to build dashboards showing p50/p95/p99 latency per route.

**Challenge question (combines Lesson 22.7 + Lesson 22.6 + Lesson 22.8):** Your monitoring shows that the p99 response time for `/api/checkout` increased from 200ms to 2000ms after a feature flag rollout. How would you use structured logs, traces, and the health endpoint to identify whether the issue is in your application code, the database, or a third-party payment API? What is your rollback strategy?

## 2. Style it — PE7 applied to the health dashboard

The mini-build is a health monitoring dashboard. The health status indicator uses a large circle: `var(--color-success)` for healthy, `var(--color-warning)` for degraded, `var(--color-error)` for unhealthy, with `var(--shadow-md)` glow. Individual health checks are list items with pass/fail badges. The uptime counter uses `var(--text-2xl)` monospace. Log entries display in a scrollable list with `var(--color-surface-2)` background, color-coded left borders by level: `var(--color-text-muted)` for info, `var(--color-warning)` for warn, `var(--color-error)` for error.

## 3. Interact — viewing real-time health status and simulated log stream

The problem: monitoring dashboards are something developers see in production but never build themselves. The interactive element simulates a health dashboard with a live log stream. A `$effect` periodically generates new log entries and updates the health status. The student can filter logs by level and see how a simulated degradation (injected by clicking a "simulate failure" button) appears in the logs and health status.

```typescript
interface DashboardLogEntry {
    id: string;
    timestamp: string;
    level: LogLevel;
    message: string;
    module: string;
}
```

## 4. Mini-build — health dashboard

**File:** `src/routes/modules/22-devops/07-monitoring-observability/+page.svelte`

This page renders a simulated health monitoring dashboard with a live log stream, health status indicator, uptime counter, and log filtering. The student can simulate failures and watch the dashboard respond.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/22-devops/07-monitoring-observability`.

### Prove the concept

1. Watch the log stream populate with simulated entries. Notice the color-coded level indicators.
2. Use the level filter to show only "error" logs — the list updates reactively.
3. Click "Simulate Failure" and watch the health status change from green (healthy) to yellow (degraded) or red (unhealthy).
4. In Svelte DevTools, observe the `$state` array of log entries growing and the `$derived` filtered list updating.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why use JSON-formatted structured logs instead of plain text console.log statements?</summary>

Structured JSON logs can be parsed by log aggregation systems (Datadog, Grafana, CloudWatch) and filtered by any field — level, module, user ID, error ID. Plain text logs require regex parsing, which is fragile, slow, and cannot support arbitrary field queries. Structured logs also enforce consistent fields across the application, making it easier to correlate events.
</details>

<details>
<summary><strong>Q2.</strong> What HTTP status code should a health endpoint return when the application is running but a non-critical dependency is down?</summary>

It depends on the dependency's criticality. If the dependency is critical (database), return 503 (Service Unavailable) so load balancers route traffic away. If it is non-critical (analytics service), return 200 with a status of "degraded" in the response body. The health endpoint should distinguish between "unhealthy — stop sending traffic" and "degraded — still functional but impaired."
</details>

<details>
<summary><strong>Q3.</strong> What are the three pillars of observability, and what question does each answer?</summary>

Logs answer "what happened" — timestamped records of discrete events. Metrics answer "how much" — numerical measurements like request count, error rate, and response time over time. Traces answer "where did the time go" — a request's journey through the system, showing the duration of each step (middleware, load function, database query, external API call).
</details>

<details>
<summary><strong>Q4.</strong> Why is an error ID important in the handleError hook?</summary>

The error ID creates a link between the user-facing error message and the server-side log entry. When a user reports "I got an error," they can provide the error ID. The engineer searches the logs for that ID and finds the full stack trace, request context, and user information — without asking the user to reproduce the issue.
</details>

<details>
<summary><strong>Q5.</strong> What is alerting fatigue, and how do you prevent it?</summary>

Alerting fatigue occurs when a team receives so many alerts that they start ignoring them — including critical ones. Prevention strategies include: alerting on anomalies (3x baseline) rather than absolute thresholds, grouping related alerts, requiring a runbook for every alert, and regularly reviewing and removing alerts that consistently fire without requiring action.
</details>

## 6. Common mistakes

- **Using `console.log` in production without structure.** Plain text logs are nearly impossible to search at scale. Always emit JSON with consistent fields (timestamp, level, message, context).
- **Health endpoints that only check "the process is running."** A process can be running while the database is down, the disk is full, or the external API is unreachable. Health endpoints should verify critical dependencies and return 503 when any of them fail.
- **Not including request context in error logs.** An error message without the request URL, method, user ID, and feature flags is nearly impossible to diagnose. Always include context in error log entries.
- **Logging sensitive data (passwords, tokens, PII).** Logs are often stored in centralized systems with broad access. Never log passwords, authentication tokens, credit card numbers, or personally identifiable information. Mask or omit sensitive fields before logging.

## 7. What's next

Lesson 22.8 covers rollback and incident response — what to do when monitoring tells you something is wrong, including blue-green deployments, canary releases, and instant rollback strategies.
