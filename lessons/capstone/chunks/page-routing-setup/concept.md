---
chunk: page-routing-setup
level: 2
penalty: medium
---

# Page Routing Setup — Level 2 Concept Reveal

SvelteKit is **file-based routing**: the shape of `src/routes/` is the shape of your URLs. There is no router config and no route registry. Every file whose name starts with `+` is reserved with a specific role:

- `+page.svelte` — renders the page at this URL.
- `+page.ts` — runs on server and client, loads data, can declare `prerender`, `ssr`.
- `+page.server.ts` — runs only on the server; use for secrets or actions.
- `+layout.svelte` — wraps this folder and all descendants.
- `+error.svelte` — error boundary for this folder and all descendants.
- `+server.ts` — API endpoint (no component).

Dynamic segments:

- `[slug]` — required param. URL `/blog/hello` sets `page.params.slug === 'hello'`.
- `[[optional]]` — optional param.
- `[...rest]` — rest param that captures everything after.

### Pseudocode tree

```
src/routes/
├── +layout.svelte          # imports app.css, renders <PageShell>
├── +page.svelte            # marketing home
├── +error.svelte           # global error fallback
├── dashboard/
│   └── +page.svelte
├── contact/
│   └── +page.svelte
└── blog/
    ├── +page.svelte
    └── [slug]/
        └── +page.svelte
```

### Typed params

Inside `blog/[slug]/+page.svelte`, the type of `page.params.slug` is `string`, not `string | undefined`, because required params are guaranteed. SvelteKit auto-generates the type in `./$types`.

### trailingSlash

In `svelte.config.js` set `kit.trailingSlash = 'never'`. This pins one canonical URL per route and prevents the duplicate-content problems the SEO module warned about.

### Connecting it to the capstone

Every chunk from here onward assumes this tree exists. The dashboard chunks modify `dashboard/+page.svelte`. The form chunk edits `contact/+page.svelte`. The SEO chunks layer data on top of `+layout.svelte` and each `+page.server.ts`.
