# Module 21 Project — Custom Dev Toolkit

## Overview

Build a SvelteKit application that functions as a developer toolkit — combining every concept from Module 21 into a cohesive, production-ready tool. The toolkit includes a custom Vite plugin exposing build metadata, a comprehensive Vitest test suite covering unit, component, and snapshot tests, environment variable management across dev/staging/prod modes, bundle analysis integration, and an embedded Svelte playground for documentation pages.

## Requirements

### Functional

1. **Custom Vite plugin:** A `virtual:build-info` plugin that exposes git commit hash, build timestamp, branch name, Node.js version, and Vite version. The plugin must work correctly in both dev and build modes.
2. **Build metadata footer:** A reusable `<BuildFooter />` component that imports from `virtual:build-info` and displays the metadata. The footer appears on every page via `+layout.svelte`.
3. **Environment dashboard:** A route at `/toolkit/env` that displays all available environment variables (public only — never expose private vars on the client), the current mode, and which `.env` files are loaded.
4. **Bundle analysis page:** A route at `/toolkit/bundle` that reads and visualizes the build output manifest, showing module sizes, chunk counts, and dependency relationships. In dev mode it shows a placeholder explaining that analysis requires a production build.
5. **Vitest test suite:**
   - At least 5 unit tests for utility functions (formatBytes, formatDuration, parseEnvFile, etc.)
   - At least 3 component tests for the BuildFooter, EnvDashboard, and BundleAnalysis components
   - At least 3 snapshot tests for rendered component output
   - All tests pass with `pnpm vitest run`
6. **Embedded playground:** A route at `/toolkit/playground` with a client-side Svelte compiler that accepts Svelte source code in a textarea, compiles it using `svelte/compiler`, and displays the JavaScript output, CSS output, and AST.
7. **HMR diagnostic panel:** A route at `/toolkit/hmr` that displays HMR connection status, recent module updates, and a counter component that demonstrates state preservation across edits.

### Technical

- Vite 8 with `@sveltejs/vite-plugin-svelte`.
- TypeScript strict mode throughout. No `any` types.
- PE7 CSS tokens exclusively — no raw OKLCH, hex, or RGB values in component styles.
- Mobile-first layout with `min-width` media queries only.
- All interactive elements have a minimum 44px touch target.
- `prefers-reduced-motion` respected for all animations.
- Every `{#each}` block uses a key expression.

### File organization

| File | Purpose |
| --- | --- |
| `src/lib/plugins/build-info.ts` | Custom Vite plugin |
| `src/lib/components/BuildFooter.svelte` | Build metadata display |
| `src/lib/utils/format.ts` | Formatting utilities |
| `src/lib/utils/env.ts` | Environment variable helpers |
| `src/routes/toolkit/+layout.svelte` | Toolkit layout with navigation |
| `src/routes/toolkit/env/+page.svelte` | Environment dashboard |
| `src/routes/toolkit/bundle/+page.svelte` | Bundle analysis |
| `src/routes/toolkit/playground/+page.svelte` | Embedded Svelte compiler |
| `src/routes/toolkit/hmr/+page.svelte` | HMR diagnostic panel |
| `tests/unit/format.test.ts` | Unit tests for formatting |
| `tests/unit/env.test.ts` | Unit tests for env helpers |
| `tests/component/BuildFooter.test.ts` | Component tests |
| `tests/snapshot/components.test.ts` | Snapshot tests |

### Stretch goals

- Add a Vite plugin that generates a `virtual:route-manifest` module listing all SvelteKit routes with their load function signatures.
- Implement a "config explorer" that reads `vite.config.ts` and visualizes each option with its current value and documentation link.
- Add a test coverage visualization page that parses Vitest's JSON coverage output and renders an interactive treemap.
- Build a "plugin inspector" that lists all active Vite plugins, their hook registrations, and execution order.

## Evaluation criteria

| Criterion | Weight |
| --- | --- |
| Custom Vite plugin correctness | 20% |
| Vitest suite quality and coverage | 20% |
| Environment variable handling (security) | 15% |
| Embedded playground functionality | 15% |
| PE7 compliance and responsive design | 15% |
| TypeScript strictness | 15% |

## Submission

Push to a branch named `module-21-project`. All Vitest tests must pass. The build metadata footer must display correct information in both dev and production modes. The embedded playground must successfully compile basic Svelte components.
