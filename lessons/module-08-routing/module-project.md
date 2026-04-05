# Module 8 — Module Project: Multi-Page Portfolio Site

## Brief

Build a personal portfolio site with four public pages — Home, About, Projects and Blog — plus dynamic blog post pages at `/blog/[slug]`. The site shares one root layout, uses per-page OKLCH color personalities, animates cross-route navigation with the View Transitions API, and mixes rendering modes: SSG for blog posts and the about page, SSR for the home page (which displays a live build timestamp), and the default hybrid for everything else.

## Goals

You will demonstrate mastery of every concept in Module 8:

- File-based routing, nested layouts, route groups
- Dynamic `[slug]` routes with typed params from `$app/types`
- `$app/state` for reactive active-link highlighting in the nav
- `$app/navigation` for programmatic navigation after an in-page search
- View Transitions via `onNavigate` in the root layout
- Page options: `prerender = true` on blog posts, `ssr = true` on the home page
- Per-page color personalities using the PE7 token override technique

## Required routes

```
src/routes/portfolio/
├── +layout.svelte              ← site shell: header, nav, footer, view transitions
├── +page.svelte                ← Home (SSR, live build timestamp)
├── about/+page.svelte          ← About (prerender = true)
├── projects/+page.svelte       ← Projects (default hybrid)
└── blog/
    ├── +page.svelte            ← Blog index (SSG, lists all posts)
    ├── +page.ts                ← Load function returning the list of posts
    └── [slug]/
        ├── +page.svelte        ← Post page (SSG)
        ├── +page.ts            ← Load function returning a single post
        └── +page.ts            ← with `export const prerender = true;`
```

(Note: `blog/[slug]/+page.ts` must also export an `entries()` function so SvelteKit knows which slugs to build. See Lesson 9A.10.)

## Requirements

### 1. Shared layout

- One root `+layout.svelte` for the portfolio subtree containing the header, nav, footer and the View Transitions `onNavigate` hook.
- The nav lists Home, About, Projects and Blog, and highlights the active link by comparing `page.url.pathname` (from `$app/state`) to each link's `href`. Wrap the comparison in `$derived`.
- Use `normalizeUrl` from `$app/navigation` before comparing so trailing slashes do not confuse the highlight.

### 2. Per-page color personality

Each page overrides one token inside its own scoped `<style>` block. Suggested palette:

- Home: `--color-brand: oklch(70% 0.18 230)` (blue)
- About: `--color-brand: oklch(72% 0.18 340)` (magenta)
- Projects: `--color-brand: oklch(70% 0.16 150)` (green)
- Blog index: `--color-brand: oklch(72% 0.18 55)` (orange)
- Blog post: inherits from blog index

### 3. Dynamic blog posts

- Model posts as an in-file `const posts: Post[]` (no database). Each post has `slug`, `title`, `excerpt`, `body`, `published`.
- `blog/+page.ts` returns the list; `blog/[slug]/+page.ts` returns one post or throws `error(404, 'Post not found')`.
- Export `prerender = true` from `blog/[slug]/+page.ts` and provide `entries()` mapping the post slugs.
- Read `params.slug` in the component via `const slug = $derived(page.params.slug ?? '')` from `$app/state`.

### 4. Rendering mode mix

- Home (`/portfolio`) is SSR with a live build/request timestamp to prove SSR.
- About is `prerender = true`.
- Projects is the default (SSR + hydration).
- Blog index and blog posts are `prerender = true`.

### 5. Page transitions

- In the root portfolio layout, wire up `onNavigate` + `document.startViewTransition` exactly as in Lesson 8.11.
- Provide a reduced-motion-friendly CSS override; the global PE7 rule already covers this.

### 6. Accessibility and PE7 compliance

- Every interactive element has a minimum 44px touch target.
- No raw OKLCH literals outside scoped `<style>` blocks that override tokens.
- Mobile-first layout; use `min-width: 480px` breakpoints only.
- Every image has `alt` text; every link has a visible focus ring.

## Grading rubric (100 points)

| Criterion                                                        | Points |
| ---------------------------------------------------------------- | ------ |
| File-based routing correct (all required files exist)            | 10     |
| Nested layout with active nav highlighting                       | 10     |
| Dynamic blog posts with `$derived(page.params.slug)`             | 10     |
| `prerender = true` set on about + blog + blog/[slug] + `entries()` | 15     |
| SSR home page with visible per-request value                      | 10     |
| View Transitions wired in the root layout                        | 10     |
| Per-page OKLCH personalities applied via token overrides         | 10     |
| Touch targets, `prefers-reduced-motion`, mobile-first             | 10     |
| TypeScript strict, zero `any`, all params typed                  | 10     |
| Lighthouse mobile Accessibility score = 100                      | 5      |

## Stretch goals

- Add a client-side search on the blog index that filters the list as you type.
- Add a 404 `+error.svelte` at the root of the portfolio subtree with its own personality.
- Add a printable version of a blog post at `/portfolio/blog/[slug]/print` with `ssr = true, csr = false`.
