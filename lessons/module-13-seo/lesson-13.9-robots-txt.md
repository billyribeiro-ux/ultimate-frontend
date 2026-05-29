---
module: 13
lesson: 13.9
title: Robots.txt
duration: 30 minutes
prerequisites:
  - Lesson 13.8 — Dynamic sitemap
learning_objectives:
  - Write a robots.txt that allows, blocks, and references a sitemap
  - Serve robots.txt from a SvelteKit +server.ts endpoint with text/plain headers
  - Block /admin, /auth, and /api from indexing without breaking crawling
  - Understand the difference between Disallow and noindex
  - Explain why AI bots now respect (or ignore) robots.txt
status: ready
---

# Lesson 13.9 — Robots.txt

## 1. Concept — the smallest file with the loudest voice

### 1.1 The problem: not every URL should be crawled

A SvelteKit app has routes you want Google to find (`/blog/[slug]`, `/modules/13-seo`) and routes you absolutely do not (`/admin`, `/auth/callback`, `/api/internal`, `/preview?token=…`). Without an explicit instruction, Googlebot crawls everything it can reach. That wastes crawl budget, leaks internal URLs into the index, and occasionally exposes private data in SERPs.

The **Robots Exclusion Protocol** is the standard for telling crawlers which paths they may fetch. The instructions live in a plain-text file at `/robots.txt` — the single most well-known URL on the web after `/favicon.ico`.

### 1.2 The format

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth
Disallow: /api

Sitemap: https://yourapp.dev/sitemap.xml
```

- `User-agent` — which bot these rules apply to. `*` is all bots.
- `Allow` — explicit allow. Usually unnecessary because Allow-All is the default, but useful when overriding a broad Disallow.
- `Disallow` — paths the bot must not fetch. Prefix-based; `Disallow: /admin` blocks `/admin` and everything under it.
- `Sitemap` — absolute URL to the sitemap. Bots fetch this independently of the Disallow rules.

You can have multiple `User-agent` blocks targeting different bots:

```
User-agent: Googlebot
Disallow: /drafts

User-agent: GPTBot
Disallow: /

User-agent: *
Disallow: /admin
```

### 1.3 Disallow vs noindex: a crucial distinction

**Disallow** says "do not crawl". The bot never fetches the URL, so it never sees its content. But if another site links to the URL, Google can still *list* the URL in SERPs — just with no snippet because it never read the page.

**noindex** (the `<meta name="robots">` tag or HTTP header) says "crawl if you want, but do not index". The bot fetches the page, reads the noindex directive, and drops the URL from the index.

Rule of thumb: **use noindex for pages you want removed from SERPs**. Use Disallow only for paths the bot should not waste time on. For a login page, the safest combination is `noindex` in the HTML head plus a Disallow that only kicks in once Google has already seen the noindex.

### 1.4 AI bots in May 2026

Since 2023, major AI crawlers — OpenAI's GPTBot, Google-Extended (for Gemini training), CCBot (Common Crawl), anthropic-ai — all respect robots.txt. If you do not want your content used to train models, adding `Disallow: /` under those user-agents opts you out. The April 2026 EU AI Act made this opt-out legally meaningful for EU-based sites. Decide your policy explicitly.

### 1.5 Serving robots.txt from SvelteKit

Just like the sitemap, robots.txt is best served from a `+server.ts` endpoint. The advantages: environment-aware content (staging servers can Disallow everything while production only blocks admin routes), and automatic sitemap URL generation from the request origin.

### 1.x What search engines do under the hood with robots.txt

When a search engine crawler visits your site:

1. **First request:** The crawler fetches `/robots.txt` before crawling any other page.
2. **Parsing:** The crawler reads `User-agent` directives to find rules that apply to it. `User-agent: *` applies to all crawlers. `User-agent: Googlebot` applies only to Google.
3. **Disallow rules:** `Disallow: /admin` tells the crawler not to request any URL starting with `/admin`. The crawler respects this voluntarily — it is not an access control mechanism.
4. **Allow rules:** `Allow: /admin/public` overrides a broader `Disallow`. More specific rules take precedence.
5. **Sitemap directive:** `Sitemap: https://example.com/sitemap.xml` tells the crawler where to find your sitemap.
6. **Caching:** Crawlers cache `robots.txt` for up to 24 hours. Changes take effect after the cache expires.

In SvelteKit, serve `robots.txt` as a prerendered route or a static file in the `static/` directory.

> **In production sidebar.** Our `robots.txt` blocks `/api/` (internal API endpoints), `/admin/` (admin panel), and `/preview/` (draft content). We also block `User-agent: GPTBot` and `User-agent: ChatGPT-User` to prevent AI training crawlers from scraping our content. The `Sitemap` directive points to our dynamic sitemap. One mistake we caught early: we accidentally had `Disallow: /` in a staging environment's `robots.txt` that was deployed to production for 2 hours. Google deindexed 30 pages before we fixed it. Lesson: robots.txt changes affect indexing immediately and can be destructive. Always review before deploying.

### 1.x Common interview question

**Q: "What is `robots.txt` and what is a common mistake when using it?"**

**Model answer:** `robots.txt` is a text file at the root of a website that tells search engine crawlers which URLs they may or may not request. It uses `User-agent`, `Allow`, `Disallow`, and `Sitemap` directives. A common mistake: using `Disallow` to "hide" sensitive pages. `robots.txt` is public — anyone can read it, and it only tells well-behaved crawlers to not fetch those URLs. Malicious actors will ignore it. It is not a security mechanism. Another common mistake: accidentally deploying `Disallow: /` (block everything) to production, which can deindex your entire site within hours. Always test robots.txt changes in staging first.

## Deep Dive

**Why this matters at scale.** robots.txt is the first file crawlers request. Incorrect configuration can block your entire site from indexing.

**The mental model.** User-agent and Disallow control access. Allow overrides Disallow for specific paths. Include a Sitemap directive pointing to your sitemap URL.

**Edge cases.** robots.txt is advisory — malicious crawlers ignore it. Do not use it for security. Use it for crawl budget optimization: block admin pages, API routes, and duplicates.

**Performance implications.** robots.txt is a static text file with zero processing cost. Serve it as a prerendered +server.ts endpoint.

**Connection to other modules.** Module 13.8's sitemap URL is referenced here. Module 10.1's endpoint pattern generates the file.



**Robots.txt best practices for SvelteKit:**

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_app/

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

Key rules: Block `/api/` (internal endpoints have no SEO value), block `/admin/` (authenticated pages), block `/_app/` (SvelteKit's internal assets). Block AI training crawlers if you do not want your content used for model training.

**Static file vs dynamic endpoint.** You can serve `robots.txt` as a static file in `static/robots.txt` or as a dynamic endpoint at `src/routes/robots.txt/+server.ts`. The static file is simpler and always consistent. The dynamic endpoint lets you vary rules by environment (block everything on staging, allow on production).

**Testing robots.txt.** Use Google's `robots.txt` Tester in Search Console to verify your rules. Test specific URLs against your rules to confirm they are allowed or blocked as expected. Remember: changes to `robots.txt` take up to 24 hours to be reflected by crawlers.

**The Crawl-delay directive.** Some crawlers (Bing) support `Crawl-delay: 10` (wait 10 seconds between requests). Google ignores this directive — use Search Console's crawl rate settings instead. Do not rely on `Crawl-delay` for rate limiting; use proper rate limiting at the server level.

## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — robots.txt has no UI

This lesson's route is purely a reference page that links to the live robots.txt. Standard PE7 styling.

## 3. Interact — Content-Type is the whole game

Problem: robots.txt must be served with `text/plain`. If you accidentally ship it as `text/html` (SvelteKit's default for +server.ts without explicit headers), some crawlers ignore it. The fix is one line in the Response constructor.

## 4. Mini-build — robots.txt endpoint + reference page

**File:** `src/routes/robots.txt/+server.ts`

```ts
import type { RequestHandler } from './$types';

const SITE_ORIGIN = 'https://ultimate-frontend.dev';

const body: string = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth
Disallow: /api

User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;

export const GET: RequestHandler = () => {
    return new Response(body, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, must-revalidate'
        }
    });
};
```

**File:** `src/routes/modules/13-seo/09-robots/+page.svelte`

```svelte
<script lang="ts">
    import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
    title="robots.txt · Lesson 13.9"
    description="A text/plain +server.ts endpoint that allows, blocks, and references a sitemap — the final SEO primitive."
/>

<section class="page stack">
    <p class="eyebrow">Lesson 13.9 · Mini-build</p>
    <h1>robots.txt, served from SvelteKit</h1>
    <p>Open <a href="/robots.txt">/robots.txt</a> — confirm the response is text/plain.</p>
    <p class="muted">
        Your admin, auth, and API routes are blocked. GPTBot and Google-Extended are opted out
        of training. Your sitemap is advertised.
    </p>
</section>

<style>
    section { --color-brand: oklch(68% 0.2 30); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
    .muted { color: var(--color-text-muted); }
</style>
```

### DevTools moment

Network tab → fetch `/robots.txt` → confirm `content-type: text/plain`. Paste the URL into Google's robots.txt Tester in Search Console and verify your rules parse.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between Disallow and noindex?</summary>

Disallow blocks crawling entirely; noindex allows crawling but blocks indexing. A Disallowed URL can still appear in SERPs as a linkless listing if other sites link to it.
</details>

<details>
<summary><strong>Q2.</strong> Why serve robots.txt from a +server.ts endpoint instead of static/?</summary>

So the content can vary by environment (staging vs production) and so the sitemap URL can be built from the request origin.
</details>

<details>
<summary><strong>Q3.</strong> How do you opt out of AI training on your content?</summary>

Add `Disallow: /` under user-agents GPTBot, Google-Extended, CCBot, and anthropic-ai. Note that not every AI bot respects robots.txt.
</details>

<details>
<summary><strong>Q4.</strong> Why advertise the sitemap in robots.txt when you can submit it directly to GSC?</summary>

Bots that are not Googlebot (Bing, DuckDuckBot, AI crawlers) use robots.txt to discover the sitemap automatically. GSC submission only covers Google.
</details>

<details>
<summary><strong>Q5.</strong> What content-type must robots.txt have?</summary>

`text/plain`. HTML content-type is ignored by some bots.
</details>

## 6. Common mistakes

- **Forgetting the Content-Type header.** Default is `text/html`, which some bots reject.
- **Using Disallow for pages that need noindex.** Disallow leaves the URL discoverable via inbound links.
- **Relative sitemap URL.** Always absolute.
- **Blocking /api when SSR needs to hit it.** Remember Disallow affects external bots, not your own server-side fetch — this is rarely a real problem but worth stating.

## 7. What's next

Lesson 13.10 pivots from metadata to performance — Core Web Vitals in SvelteKit.
