# Deployment Checklist

## Adapter Selection Guide

| Adapter | Platform | When to Use |
|---------|----------|-------------|
| `@sveltejs/adapter-auto` | Auto-detects | Default — works on Vercel, Netlify, Cloudflare Pages |
| `@sveltejs/adapter-node` | Any Node.js host | Docker, Railway, Fly.io, self-hosted |
| `@sveltejs/adapter-vercel` | Vercel | Edge functions, ISR, image optimization |
| `@sveltejs/adapter-cloudflare` | Cloudflare Pages/Workers | Edge compute, KV/D1/R2 bindings |
| `@sveltejs/adapter-netlify` | Netlify | Netlify Functions, Edge Functions |
| `@sveltejs/adapter-static` | Any static host | Fully prerendered sites (no SSR) |

```ts
// svelte.config.js
import adapter from '@sveltejs/adapter-node';
export default { kit: { adapter: adapter({ out: 'build' }) } };
```

## Environment Variables

| Module | Replaced At | Available In | Use For |
|--------|-------------|--------------|---------|
| `$env/static/private` | Build time | Server only | API keys, DB URLs (inlined, tree-shaken) |
| `$env/static/public` | Build time | Server + Client | Public API base URL, feature flags |
| `$env/dynamic/private` | Runtime | Server only | Secrets that change without rebuild |
| `$env/dynamic/public` | Runtime | Server + Client | Runtime config (CDN URL, feature toggles) |

```ts
import { SECRET_KEY } from '$env/static/private';      // server-only, build-time
import { PUBLIC_API_URL } from '$env/static/public';   // shared, build-time
import { env } from '$env/dynamic/private';            // env.SECRET_KEY at runtime
import { env } from '$env/dynamic/public';             // env.PUBLIC_API_URL at runtime
```

**Naming rule:** `PUBLIC_` prefix required for any env var accessible on the client.

## Build Output Verification

```bash
pnpm build

# Check output
ls -la build/                    # adapter output directory
du -sh build/                    # total bundle size
find build -name "*.js" | head   # verify JS output exists

# Analyze bundle (if using vite-plugin-inspect or rollup-plugin-visualizer)
npx vite-bundle-visualizer
```

### Size Budget Checks

| Asset | Budget | Check |
|-------|--------|-------|
| Total JS (gzipped) | < 200KB | `find build -name "*.js" -exec gzip -c {} \; \| wc -c` |
| Total CSS (gzipped) | < 50KB | `find build -name "*.css" -exec gzip -c {} \; \| wc -c` |
| Largest single chunk | < 100KB gzipped | Review build output warnings |
| Prerendered HTML pages | Verify list | Check `build/prerendered/` |

## Security Headers

```ts
// src/hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",  // SvelteKit requires unsafe-inline
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.example.com",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  return response;
};
```

### Security Header Checklist

- [ ] `Strict-Transport-Security` (HSTS) — enforce HTTPS
- [ ] `Content-Security-Policy` — restrict resource loading
- [ ] `X-Frame-Options: DENY` — prevent clickjacking
- [ ] `X-Content-Type-Options: nosniff` — prevent MIME sniffing
- [ ] `Referrer-Policy` — control referrer leakage
- [ ] `Permissions-Policy` — disable unused browser APIs

## Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| JS bundle (gzipped) | < 200KB | Build output |
| CSS bundle (gzipped) | < 50KB | Build output |
| LCP | < 2.5s | Lighthouse / CrUX |
| CLS | < 0.1 | Lighthouse / CrUX |
| INP | < 200ms | Lighthouse / CrUX |
| Time to First Byte | < 600ms | WebPageTest |
| Total page weight | < 1MB | DevTools Network |

## Monitoring Setup

### Error Tracking

```ts
// src/hooks.server.ts
export const handleError: HandleServerError = async ({ error, event }) => {
  Sentry.captureException(error, { extra: { url: event.url.href } });
  return { message: 'Internal error' };
};

// src/hooks.client.ts
export const handleError: HandleClientError = async ({ error }) => {
  Sentry.captureException(error);
  return { message: 'Something went wrong' };
};
```

### Monitoring Checklist

- [ ] Server error tracking (Sentry, Datadog, etc.)
- [ ] Client error tracking (unhandled rejections, component errors)
- [ ] Uptime monitoring (Checkly, Better Uptime, Pingdom)
- [ ] Real User Monitoring (RUM) for Core Web Vitals
- [ ] Log aggregation (structured JSON logs)
- [ ] Alerting thresholds (error rate > 1%, p95 latency > 2s)

## CI/CD Pipeline Template

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile

      # Parallel checks
      - run: pnpm check          # svelte-check (types)
      - run: pnpm lint           # eslint + prettier
      - run: pnpm test:unit      # vitest
      - run: pnpm build          # production build

      # E2E tests against preview
      - run: pnpm preview &
      - run: pnpm test:e2e       # playwright

  deploy:
    needs: ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: # deploy command (adapter-specific)
```

### Pipeline Stages

| Stage | Tool | Fails On |
|-------|------|----------|
| Type check | `svelte-check` | Type errors |
| Lint | ESLint + Prettier | Style/logic violations |
| Unit tests | Vitest | Test failures |
| Build | `vite build` | Compilation errors, bundle budget |
| Preview | `vite preview` | Runtime crashes |
| E2E tests | Playwright | User flow failures |
| Deploy | Adapter-specific | Deployment failures |

## Pre-Deploy Final Checks

- [ ] All environment variables set in production
- [ ] Database migrations applied
- [ ] DNS/SSL configured
- [ ] Error pages (`+error.svelte`) tested
- [ ] 404 page renders correctly
- [ ] Redirects from old URLs configured
- [ ] Analytics/tracking verified
- [ ] Sitemap and robots.txt accessible
- [ ] Social preview images rendering (og:image)
- [ ] HTTPS enforced (HTTP redirects to HTTPS)

## Common Mistakes

- **Committing `.env` files** — use `.env.example` for documentation; actual secrets go in platform settings.
- **Using `$env/static/private` for values that change per environment** — use `$env/dynamic/private` instead.
- **Missing `PUBLIC_` prefix on client-accessible vars** — build succeeds but client gets `undefined`.
- **Skipping `--frozen-lockfile` in CI** — can install different versions than local dev.
- **Not setting `adapter` explicitly** — `adapter-auto` may pick wrong adapter if deploy target is ambiguous.
- **Forgetting HSTS preload consequences** — once submitted to preload list, HTTPS is permanent; test first.
- **CSP too restrictive** — blocks SvelteKit's inline scripts; test thoroughly in staging.
- **No error monitoring** — production errors go unnoticed; always ship with error tracking.
