# Module 22 Project — Production Deployment Pipeline

## Overview

Build a SvelteKit application that demonstrates the complete production deployment lifecycle. The app includes a Docker configuration with multi-stage builds, a Cloudflare Workers adapter setup, runtime feature flags, a health endpoint with structured logging, and an interactive deployment dashboard that ties every concept from Module 22 together.

## Requirements

### Functional

1. **Adapter configuration panel:** A route at `/pipeline/adapters` that displays a comparison matrix of all SvelteKit adapters (node, vercel, cloudflare, netlify, static) with their output types, cold start characteristics, and platform features. The student selects a target platform and the panel generates the corresponding `svelte.config.js` adapter configuration.
2. **Docker configuration generator:** A route at `/pipeline/docker` that generates a production-ready Dockerfile and `.dockerignore` for the current SvelteKit project. The generator accepts parameters (Node.js version, port, health check interval) and produces a multi-stage build configuration with `adapter-node`.
3. **Feature flag dashboard:** A route at `/pipeline/flags` with a runtime feature flag system. Flags are stored in cookies, togglable via the dashboard, and consumed throughout the app using a typed `$derived` flag system. At least 4 flags must exist: `new-header`, `dark-mode-beta`, `analytics-v2`, and `experimental-cache`. Percentage rollout is demonstrated for at least one flag.
4. **Health endpoint:** A `+server.ts` API route at `/api/health` that returns JSON with application version, uptime, memory usage, last deployment timestamp, and feature flag summary. The endpoint is consumed by the deployment dashboard.
5. **Structured logging system:** A `$lib/logging.ts` module that produces JSON-formatted log entries with timestamp, level (debug, info, warn, error), message, and optional context object. Logs are displayed in a `/pipeline/logs` route with filtering by level.
6. **Deployment dashboard:** A route at `/pipeline/dashboard` that combines health status, recent deployments (simulated timeline data), active feature flags, and log viewer into a single operational overview. The dashboard auto-refreshes health data every 30 seconds.
7. **Deployment history timeline:** A route at `/pipeline/history` showing a vertical timeline of deployments with version, timestamp, environment (dev/staging/prod), deployment strategy (blue-green, canary, direct), and rollback buttons that simulate reverting to a previous version.

### Technical

- SvelteKit with `adapter-node` as the primary adapter.
- TypeScript strict mode throughout. No `any` types.
- PE7 CSS tokens exclusively — no raw OKLCH, hex, or RGB values in component styles.
- Mobile-first layout with `min-width` media queries only.
- All interactive elements have a minimum 44px touch target.
- `prefers-reduced-motion` respected for all animations.
- Every `{#each}` block uses a key expression.
- Svelte 5 runes: `$state`, `$derived`, `$effect`, `$props()`. No `$:` legacy syntax.

### File organization

| File | Purpose |
| --- | --- |
| `src/lib/flags.svelte.ts` | Typed feature flag system |
| `src/lib/logging.ts` | Structured logging module |
| `src/lib/types/deployment.ts` | TypeScript interfaces for deployment data |
| `src/routes/api/health/+server.ts` | Health check endpoint |
| `src/routes/pipeline/+layout.svelte` | Pipeline layout with navigation |
| `src/routes/pipeline/adapters/+page.svelte` | Adapter comparison panel |
| `src/routes/pipeline/docker/+page.svelte` | Docker config generator |
| `src/routes/pipeline/flags/+page.svelte` | Feature flag dashboard |
| `src/routes/pipeline/logs/+page.svelte` | Log viewer |
| `src/routes/pipeline/dashboard/+page.svelte` | Operational dashboard |
| `src/routes/pipeline/history/+page.svelte` | Deployment history timeline |
| `Dockerfile` | Multi-stage production Dockerfile |
| `.dockerignore` | Docker ignore rules |

### Stretch goals

- Add a deployment diff viewer that compares two deployment versions side-by-side, showing which feature flags changed and which routes were added/removed.
- Implement a canary release simulator that shows traffic percentage shifting from old to new version over time with animated progress bars.
- Add an incident response runbook generator that produces a Markdown checklist based on the type of incident (performance degradation, error spike, data inconsistency).
- Build a cost estimator that compares estimated hosting costs across Cloudflare Workers, Vercel, and a Docker VPS based on request volume inputs.

## Evaluation criteria

| Criterion | Weight |
| --- | --- |
| Adapter configuration correctness | 15% |
| Docker multi-stage build quality | 15% |
| Feature flag system design | 20% |
| Health endpoint and structured logging | 15% |
| Deployment dashboard functionality | 20% |
| PE7 compliance and responsive design | 15% |

## Submission

Push to a branch named `module-22-project`. The health endpoint must return valid JSON. Feature flags must persist across page reloads via cookies. The Docker configuration must produce a valid multi-stage build. All TypeScript must compile with zero errors under strict mode.
