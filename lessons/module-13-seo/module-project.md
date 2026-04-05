# Module 13 — Module Project — SEO-Optimized Multi-Page Content Site

## Brief

Build a production-quality multi-page content site that passes every SEO audit you will ever run it through. The student applies every lesson in Module 13 in a single project. No shortcuts.

## Shape of the site

A small content site with four kinds of page, each testing a different rendering mode:

1. **Home** (`/`) — **prerendered**. Headline, value proposition, hero poster image, CTA. FAQ section with FAQPage schema. Organization + WebSite schema in the root layout.
2. **About** (`/about`) — **prerendered**. Team bios, each contributing a `Person` schema. Visible E-E-A-T signals: founding date, mission, links to external profiles.
3. **Blog index** (`/blog`) — **prerendered**. Lists every blog post via `entries()`.
4. **Blog post** (`/blog/[slug]`) — **prerendered via `entries()`**. Each post has a unique title, description, OG image, Article schema, BreadcrumbList schema, nested author Person schema, and `datePublished` + `dateModified`.
5. **Dynamic search** (`/search?q=…`) — **SSR**. Returns SSRed results with `noindex` set (search pages should not compete with product pages).

## Required deliverables

### Routing & rendering

- Hybrid rendering: prerender home, about, blog index, and all blog posts; SSR the search page.
- Dynamic sitemap at `/sitemap.xml` that includes every static route plus every blog post slug.
- Robots.txt at `/robots.txt` that allows everything except `/search`, references the sitemap, and opts out of GPTBot and Google-Extended under the student's stated policy.
- `trailingSlash: 'never'` enforced in `svelte.config.js`, and a 301 redirect in place for at least one legacy URL.

### SEO components

- `$lib/components/SEO.svelte` — typed reusable component with `SEOProps` interface.
- `$lib/components/JsonLd.svelte` — safe raw-script emitter using `{@html}` with `<` escaped.
- `$lib/components/AuthorBio.svelte` — visible author card plus Person schema.
- `$lib/types/seo.ts` — shared `SEOData` interface used by every `load()` function.

### SEO data

- Root layout returns a default `seo` object.
- Every page's `+page.server.ts` (or `+page.ts`) returns a typed `seo` field. No hard-coded strings in `+page.svelte`.
- Canonical URLs derived from `page.url` — never hand-written.
- Blog post load functions fetch post data and produce matching `Article` + `BreadcrumbList` JSON-LD.

### Structured data

- Organization + WebSite schemas on the root layout.
- Article schema on every blog post.
- BreadcrumbList on every non-home page.
- FAQPage schema on the home page FAQ.
- Person schema nested inside each Article and inside the About page team cards.

### Social sharing

- Unique 1200×630 OG image per blog post (can be reused for MVP).
- Open Graph + Twitter Card tags on every page.
- Facebook Sharing Debugger confirms no errors.

### Core Web Vitals

- Lighthouse mobile audit — Performance, Accessibility, Best Practices, SEO **all 100**.
- Hero image preloaded with `rel=preload` and `fetchpriority="high"`.
- Every image has explicit `width` and `height`.
- `data-sveltekit-preload-data="hover"` on primary nav links.
- INP under 200 ms on a mid-range mobile device in PageSpeed Insights field data.

### Google-facing verification

- Google Rich Results Test reports Article, FAQPage, BreadcrumbList, Organization, and WebSite as eligible.
- GSC verification meta tag shipped in the root layout (fake token acceptable for the module project; real token for deployed builds).
- Sitemap submission screenshot in the project's `README.md`.

## Acceptance criteria

- [ ] `pnpm build` completes without errors.
- [ ] `pnpm check` reports zero TypeScript errors.
- [ ] `/sitemap.xml` returns `application/xml` and validates against sitemaps.org XSD.
- [ ] `/robots.txt` returns `text/plain`.
- [ ] Every page has a unique title (≤ 60 chars) and description (120–160 chars).
- [ ] Every page renders the correct JSON-LD blocks.
- [ ] Lighthouse mobile SEO score: 100 on every page.
- [ ] Google Rich Results Test passes for every schema type shipped.
- [ ] Visible E-E-A-T signals on every article: byline, dates, bio card.
- [ ] No `any` anywhere in the codebase. TypeScript strict.
- [ ] 44px minimum touch targets on every interactive element.
- [ ] `prefers-reduced-motion` respected on all animations.

## Stretch goals

- Add a `3DModel` JSON-LD block describing a WebGL hero on the home page (Lesson 13.15).
- Add hreflang tags for a second language.
- Add a Web Vitals reporter that POSTs INP to a `/+server.ts` analytics endpoint.
- Pre-generate one OG image per post with a build-time script.
