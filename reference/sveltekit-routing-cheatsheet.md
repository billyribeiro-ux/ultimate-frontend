# SvelteKit Routing Cheat Sheet

## File Conventions

| File | Runs On | Purpose |
|------|---------|---------|
| `+page.svelte` | Client | Page component (the UI) |
| `+page.ts` | Both (universal) | Load data for the page (runs on server during SSR, client on navigation) |
| `+page.server.ts` | Server only | Load data with secrets/DB access; exports `actions` for forms |
| `+layout.svelte` | Client | Shared layout wrapping child pages |
| `+layout.ts` | Both (universal) | Load data shared by all child routes |
| `+layout.server.ts` | Server only | Layout data with server-only access |
| `+error.svelte` | Client | Error boundary UI for the route segment |
| `+server.ts` | Server only | API endpoint (GET, POST, PUT, PATCH, DELETE) |

## Route Parameters

| Pattern | Example Path | `params` |
|---------|-------------|----------|
| `[param]` | `/blog/hello` | `{ param: 'hello' }` |
| `[...rest]` | `/a/b/c` | `{ rest: 'a/b/c' }` |
| `[[optional]]` | `/` or `/en` | `{ optional?: 'en' }` |
| `(group)` | N/A (no URL segment) | Groups routes without adding path |
| `[param=matcher]` | `/blog/123` | Only matches if `params/matcher.ts` returns true |

### Param Matcher (src/params/integer.ts)

```ts
import type { ParamMatcher } from '@sveltejs/kit';
export const match: ParamMatcher = (param) => /^\d+$/.test(param);
```

## $app/state

```ts
import { page } from '$app/state';

page.url        // URL object
page.params     // Route params
page.data       // Combined load data
page.status     // HTTP status code
page.error      // Error object (in error pages)
page.form       // Form action result
```

## $app/navigation

| Function | Purpose |
|----------|---------|
| `goto(url, opts?)` | Programmatic navigation |
| `invalidate(url \| fn)` | Re-run load functions that depend on the resource |
| `invalidateAll()` | Re-run every load function |
| `preloadData(href)` | Preload data for a route (hover intent) |
| `beforeNavigate(({ cancel, to, from, type }) => {})` | Intercept before leaving |
| `afterNavigate(({ to, from, type }) => {})` | Run after navigation completes |
| `onNavigate(({ to, from }) => {})` | Runs during navigation (return promise to block view transition) |

## hooks.server.ts

```ts
// src/hooks.server.ts
import type { Handle, HandleServerError, RequestEvent } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Runs for every request — auth, logging, locale detection
  event.locals.user = await getUser(event.cookies);
  return resolve(event, { transformPageChunk: ({ html }) => html });
};

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
  // Runs when unexpected errors occur
  return { message: 'Something went wrong' };
};
```

### hooks.ts (shared/universal hooks)

```ts
import type { Reroute } from '@sveltejs/kit';

export const reroute: Reroute = ({ url }) => {
  if (url.pathname === '/old-path') return '/new-path';
};
```

### getRequestEvent

```ts
import { getRequestEvent } from '$app/server';
// Access current request event inside server load/actions (useful in shared utilities)
const event = getRequestEvent();
```

## Rendering Modes

| Mode | Config | When to Use |
|------|--------|-------------|
| **SSR** (default) | `export const ssr = true` | Dynamic content, personalized pages, SEO needed |
| **SSG** (prerender) | `export const prerender = true` | Static content, blog posts, docs, marketing pages |
| **CSR only** | `export const ssr = false` | Dashboards behind auth, no SEO needed |
| **Hybrid** | Mix per-route | Most real apps — prerender marketing, SSR app |

```ts
// +page.ts or +layout.ts
export const prerender = true;   // SSG
export const ssr = false;        // CSR only
export const csr = false;        // No client JS (static HTML only)
export const trailingSlash = 'always'; // URL trailing slash behavior
```

## Remote Functions (.remote.ts)

```ts
// src/routes/api/posts.remote.ts
import { query, form, command } from '@sveltejs/kit/remote';

// Query — read-only, cacheable, called with GET semantics
export const getPosts = query(async (event) => {
  return await db.posts.findMany();
});

// Form — replaces form actions, handles progressive enhancement
export const createPost = form(async (event, formData) => {
  const title = formData.get('title');
  return await db.posts.create({ data: { title } });
});

// Command — imperative server function (mutations without forms)
export const deletePost = command(async (event, id: string) => {
  await db.posts.delete({ where: { id } });
});
```

## Load Function Patterns

```ts
// +page.server.ts — server load
export const load = async ({ params, locals, cookies, fetch, depends, url }) => {
  depends('app:posts'); // Register custom invalidation key
  return { posts: await db.posts.findMany() };
};

// +page.ts — universal load
export const load = async ({ params, data, fetch, depends, url }) => {
  // `data` contains server load result (if +page.server.ts exists)
  const res = await fetch('/api/extra');
  return { ...data, extra: await res.json() };
};
```

## Form Actions

```ts
// +page.server.ts
export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    // ... validate and process
    return { success: true };
  },
  delete: async ({ request, params }) => {
    await db.posts.delete({ where: { id: params.id } });
  }
};
```

## Common Mistakes

- **Importing `$env/static/*` in client code** — static env is only available server-side unless prefixed with `PUBLIC_`.
- **Using `fetch` from `globalThis` instead of the `fetch` from load** — SvelteKit's fetch handles credentials, relative URLs, and SSR.
- **Forgetting `depends()` when using custom invalidation** — `invalidate('app:posts')` won't re-run load without a matching `depends`.
- **Putting DB calls in `+page.ts`** — universal load runs on the client too; use `+page.server.ts` for secrets/DB.
- **Not returning data from load** — load must return a plain object; forgetting `return` gives `undefined` to the page.
- **Using `goto()` in load functions** — use `redirect(303, '/path')` from `@sveltejs/kit` instead.
- **Nesting layouts deeply without `(group)`** — use route groups to share layouts without affecting URLs.
