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

### 1.4 AI bots in April 2026

Since 2023, major AI crawlers — OpenAI's GPTBot, Google-Extended (for Gemini training), CCBot (Common Crawl), anthropic-ai — all respect robots.txt. If you do not want your content used to train models, adding `Disallow: /` under those user-agents opts you out. The April 2026 EU AI Act made this opt-out legally meaningful for EU-based sites. Decide your policy explicitly.

### 1.5 Serving robots.txt from SvelteKit

Just like the sitemap, robots.txt is best served from a `+server.ts` endpoint. The advantages: environment-aware content (staging servers can Disallow everything while production only blocks admin routes), and automatic sitemap URL generation from the request origin.

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
