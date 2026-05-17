---
module: 13
lesson: 13.13
title: Trailing slashes, redirects, canonical issues
duration: 40 minutes
prerequisites:
  - Module 9A — load() and redirect()
  - Lesson 13.3 — SEO component with canonical
learning_objectives:
  - Pick a trailing-slash convention and enforce it site-wide
  - Issue a 301 redirect from a load function
  - Use rel=canonical to collapse duplicates across query strings
  - Explain why /page and /page/ count as separate URLs to Google
  - Avoid redirect chains that waste crawl budget
status: ready
---

# Lesson 13.13 — Trailing slashes, redirects, canonical issues

## 1. Concept — three ways to accidentally ship the same page under two URLs

### 1.1 The duplicate content problem

Google treats every unique URL as a distinct page. `/about` and `/about/` are different URLs to Google, even though they usually serve the same content. Same for `?ref=twitter` vs no query string. Same for `http://` vs `https://`, `www.` vs apex. When the same content lives at multiple URLs, Google has to decide which one to index. If you do not decide for it, three things go wrong:

1. Link equity (the ranking power inherited from inbound links) is split across the variants.
2. Google sometimes indexes the wrong variant.
3. Reports in Search Console become confusing because metrics are divided.

### 1.2 Pick one trailing-slash convention

SvelteKit exposes `kit.trailingSlash` in `svelte.config.js`:

```js
// svelte.config.js
const config = {
    kit: {
        trailingSlash: 'never' // or 'always' or 'ignore'
    }
};
```

- `'never'` — no trailing slash. `/about` is canonical; `/about/` redirects to `/about`.
- `'always'` — trailing slash required. `/about/` is canonical; `/about` redirects.
- `'ignore'` — both work, no redirect. **Bad for SEO** because Google indexes both as duplicates.

Either convention is fine. **Consistency is what matters**. Pick one, enforce it, never mix.

### 1.3 Redirects from load()

Any time you move a URL, you must issue a 301 redirect from the old one to the new one. In SvelteKit, the `redirect()` helper inside a `load()` function is the standard approach:

```ts
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
    if (url.pathname === '/old-blog') {
        redirect(301, '/blog');
    }
    return {};
};
```

301 vs 302: **301 is permanent, 302 is temporary**. For SEO, almost always use 301 — it tells Google to update its index. Use 302 only for truly temporary redirects like A/B tests.

### 1.4 Canonical tags cover the cases redirects can't

Redirects handle server-side path variants. Canonical tags handle cases where you *cannot* redirect — query strings that are meaningful to the user but noise to Google (tracking params, sort params, filter params). Emit a canonical that points to the clean URL:

```html
<link rel="canonical" href="https://yourapp.dev/products/shoe" />
```

Even when the actual URL is `/products/shoe?ref=twitter&sort=newest`. Google treats the canonical as the page of record and consolidates signals.

### 1.5 Avoid redirect chains

A redirect chain is `/a → /b → /c → /d`. Googlebot follows up to about 5 hops, then gives up. Every hop wastes crawl budget. Collapse chains into direct 301s whenever you move content multiple times. Check with `curl -I -L` in a terminal.

> **In production sidebar.** We discovered that Google was indexing both `/blog/hello` and `/blog/hello/` as separate pages — splitting our link equity and causing duplicate content issues. Adding `trailingSlash: 'never'` to `svelte.config.js` fixed the trailing slash issue, and we added canonical URLs to every page via our SEO component. Within one crawl cycle, Google consolidated the duplicates and our blog post rankings improved for 3 competitive keywords.

### 1.x Common interview question

**Q: "What is a canonical URL and why is it important for SEO?"**

**Model answer:** A canonical URL is the preferred version of a page when multiple URLs can access the same content. You declare it with `<link rel="canonical" href="https://example.com/blog/hello">` in the `<head>`. Without a canonical, Google may treat `/blog/hello`, `/blog/hello/`, `/blog/hello?ref=twitter`, and `/BLOG/hello` as separate pages, splitting ranking signals across duplicates. The canonical tells Google: "this is the one true URL for this content — attribute all ranking signals here." In SvelteKit, set `trailingSlash: 'never'` (or `'always'`) for consistency, and include a canonical URL in your SEO component for every page.

## Deep Dive

**Why this matters at scale.** Trailing slash variants create duplicate content, diluting link equity. SvelteKit's trailingSlash config enforces one canonical format.

**The mental model.** Set trailingSlash: 'never' or 'always' in svelte.config.js. SvelteKit redirects the non-canonical version. Add <link rel='canonical'> as a safety net.

**Edge cases.** Changing trailingSlash on an existing site requires redirects from the old format. Search engines may take weeks to reindex.

**Performance implications.** The redirect is a 301 response — fast and cached by browsers. The canonical link tag adds one <link> element to <head>.

**Connection to other modules.** Module 8's routing defines URL structure. Module 13.2's canonical link tag prevents duplicate content.



**Trailing slash configuration in SvelteKit.** In `svelte.config.js`:
- `trailingSlash: 'never'` — `/blog/hello` is canonical, `/blog/hello/` redirects to `/blog/hello`
- `trailingSlash: 'always'` — `/blog/hello/` is canonical, `/blog/hello` redirects to `/blog/hello/`  
- `trailingSlash: 'ignore'` — both are valid (default, but creates duplicate content)

For SEO, always choose `'never'` or `'always'` — never `'ignore'`. Duplicate URLs split link equity.

**Redirect chains and SEO.** Every redirect costs ~50-100ms of latency and a small amount of link equity. A chain of redirects (A -> B -> C) is worse than a direct redirect (A -> C). Audit your redirects periodically. In SvelteKit, redirects are handled in hooks or load functions. Keep them minimal and direct.

**Canonical URL implementation.** Every page should have a canonical URL that resolves to itself:

```svelte
<svelte:head>
    <link rel="canonical" href="https://example.com{page.url.pathname}" />
</svelte:head>
```

For paginated content (`?page=2`), the canonical should include the pagination parameter — each page is unique content. For filtered views (`?color=blue`), decide: is the filtered view unique content (canonical includes params) or a variant of the main page (canonical points to the unfiltered URL)?

**The `www` vs non-`www` decision.** Pick one and redirect the other. Configure this at the CDN/hosting level, not in SvelteKit. Both Google Search Console properties (www and non-www) should point to the same canonical.

## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — a visible redirect-source page

The mini-build includes two routes: one that redirects, and one that receives. The receiver has a small banner that notes "You arrived here via a 301 redirect." PE7 tokens only.

## 3. Interact — the redirect() function throws

Problem: `redirect()` in SvelteKit does not return normally — it throws a special exception that the framework catches and turns into a 301 response. Code after `redirect()` in your load function never runs. The compiler does not enforce this, so it is easy to write dead code after a redirect and be confused when it never executes.

## 4. Mini-build — a redirect source, a receiver, and a canonical page

**File:** `src/routes/modules/13-seo/13-canonical/+page.ts`

```ts
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
    // If the user arrived with a tracking param, do NOT redirect.
    // The canonical tag in the component handles the dedup.
    // If they arrived with ?legacy=1, redirect to the clean URL.
    if (url.searchParams.has('legacy')) {
        redirect(301, '/modules/13-seo/13-canonical');
    }
    return { ref: url.searchParams.get('ref') };
};
```

**File:** `src/routes/modules/13-seo/13-canonical/+page.svelte`

```svelte
<script lang="ts">
    import SEO from '$lib/components/SEO.svelte';
    import type { PageData } from './$types';

    const { data }: { data: PageData } = $props();
</script>

<SEO
    title="Trailing slashes and canonical · Lesson 13.13"
    description="How to pick a trailing-slash convention, redirect legacy URLs with a 301, and collapse tracking-param variants with rel=canonical."
    canonical="https://ultimate-frontend.dev/modules/13-seo/13-canonical"
/>

<section class="page stack">
    <p class="eyebrow">Lesson 13.13 · Mini-build</p>
    <h1>Canonical URL pinned</h1>
    <p>
        The canonical URL for this page is the clean one, regardless of the <code>ref</code>
        query parameter you may see in the address bar.
    </p>
    {#if data.ref}
        <p class="muted">You arrived with ref={data.ref}. The canonical tag ignores it.</p>
    {/if}
    <p>
        Try visiting <a href="?legacy=1">?legacy=1</a> — the load function redirects you back
        here with a 301.
    </p>
</section>

<style>
    section { --color-brand: oklch(68% 0.2 80); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
    .muted { color: var(--color-text-muted); font-size: var(--text-sm); }
</style>
```

### DevTools moment

Network tab → visit `/modules/13-seo/13-canonical?legacy=1`. First response is 301. Second is 200. View source on the final page and confirm the canonical tag points to the clean URL without the query string.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does <code>/about</code> differ from <code>/about/</code> to Google?</summary>

They are literally different URL strings. Without a canonical or redirect, Google treats them as separate pages and may split link equity between them.
</details>

<details>
<summary><strong>Q2.</strong> When do you use 301 vs 302?</summary>

301 for permanent moves — Google updates its index. 302 for temporary redirects like A/B tests — Google keeps the original URL in the index.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>redirect()</code> in SvelteKit actually do under the hood?</summary>

It throws a special exception the framework catches and converts into a 301 (or other) response. Code after it in the load function never runs.
</details>

<details>
<summary><strong>Q4.</strong> When should you use a canonical tag instead of a redirect?</summary>

When the alternate URL must remain accessible to users (tracking params, filters) but should not be indexed separately.
</details>

<details>
<summary><strong>Q5.</strong> What is a redirect chain and why is it bad?</summary>

A chain of multiple redirects like `/a → /b → /c`. Googlebot only follows about 5 hops, and each hop wastes crawl budget and slows the user.
</details>

## 6. Common mistakes

- **Mixing trailing-slash conventions across a site.** Pick one.
- **Using 302 for permanent moves.** Google keeps the old URL indexed.
- **Writing code after `redirect()`.** It never runs.
- **Forgetting the canonical on pages that accept tracking params.** Result is duplicate-content dilution.

## 7. What's next

Lesson 13.14 wires everything you have built into Google Search Console — the dashboard where SEO actually gets measured.
