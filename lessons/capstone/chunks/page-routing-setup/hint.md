---
chunk: page-routing-setup
level: 1
penalty: 0
---

# Page Routing Setup — Level 1 Hint (free)

SvelteKit maps file paths to URLs in a strict, predictable way. The conversation between you and the router is entirely about file names. You never register a route in a config file.

Three naming rules to keep in your head:

1. A folder becomes a URL segment. `src/routes/dashboard` → `/dashboard`. `src/routes/blog/[slug]` → `/blog/:slug`.
2. Every route folder needs a `+page.svelte` (or `+page.ts` + `+page.svelte` pair) to render at that URL.
3. `+layout.svelte` applies to its folder and all subfolders. `+error.svelte` catches errors for its subtree.

Dynamic segments use square brackets. Inside the page you read them via `page.params` from `$app/state`.

Do not write any feature content yet. The goal of this chunk is structural: render a title per route so you can click through every URL in your header nav and see the right placeholder.
