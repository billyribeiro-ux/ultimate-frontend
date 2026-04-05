---
module: 13
lesson: 13.14
title: Google Search Console integration
duration: 40 minutes
prerequisites:
  - Lesson 13.8 — sitemap endpoint
  - Lesson 13.9 — robots.txt
learning_objectives:
  - Verify a site in Search Console using a meta tag in <svelte:head>
  - Submit the sitemap URL and monitor its status
  - Read the Coverage report to find indexing problems
  - Interpret Impressions, Clicks, CTR, and Position in Performance
  - Turn a low-CTR / high-Impression page into a content-improvement task
status: ready
---

# Lesson 13.14 — Google Search Console integration

## 1. Concept — the dashboard where SEO becomes measurable

### 1.1 What GSC actually is

**Google Search Console** is Google's free tool that tells you exactly how your site performs in Google search. It is the only authoritative source for:

- Which pages are indexed and which are not (and why).
- What queries bring users to your pages.
- How often each page shows up in search (impressions) vs how often it gets clicked (clicks).
- Your average ranking position per query.
- Core Web Vitals field data (from real Chrome users).
- Structured data errors detected on your pages.
- Manual actions (if Google has penalised you).
- Security issues.

If you are doing SEO without GSC, you are flying blind.

### 1.2 Verification via meta tag

To prove you own a site, you either add a DNS TXT record, upload a special HTML file, or add a `<meta name="google-site-verification">` tag. The meta-tag method is the easiest for a SvelteKit app — put it in your root `+layout.svelte`:

```svelte
<svelte:head>
    <meta name="google-site-verification" content="YOUR_TOKEN_HERE" />
</svelte:head>
```

Ship it, come back to GSC, click Verify. Done. Leave the tag in place forever — removing it un-verifies you.

### 1.3 Submitting the sitemap

Once verified, the first thing to do is submit your sitemap. Sitemaps → Add new sitemap → paste `https://yourapp.dev/sitemap.xml`. Within a few hours Google reports how many URLs it read from the sitemap and which ones it has indexed, needs-work, or rejected.

### 1.4 The Coverage report

Coverage (now called "Indexing → Pages" in the April 2026 UI) buckets every URL Google knows about into four states:

- **Indexed** — in the index, eligible to rank.
- **Not indexed — crawled, currently not indexed** — Google crawled it but decided not to include it. Often quality related.
- **Not indexed — discovered, not crawled** — Google knows the URL exists but has not crawled it yet. Usually a crawl-budget issue.
- **Errors** — redirect loops, 4xx, 5xx, soft 404s.

Prioritise by bucket size. A thousand "crawled, not indexed" URLs is a quality problem you need to solve by improving content. A hundred 4xx errors is a routing problem.

### 1.5 The Performance report

Performance shows four numbers per query and per page:

- **Impressions** — how many times your URL appeared in a SERP.
- **Clicks** — how many times it was clicked.
- **CTR** — clicks / impressions.
- **Position** — your average ranking for that query.

The most actionable pattern is **high impressions + low CTR**. That means Google is showing your page to the right users and they are not clicking — usually a title or description problem. Rewrite the meta description, redeploy, re-check in a week.

**Low position + high impressions** is a content problem. Google shows you because the query is somewhat relevant, but you rank 15th because your content does not match intent. Expand the page or write a dedicated one.

## 2. Style it — a demo meta tag on a demo page

The mini-build is a page with a fake verification token in its head (clearly labelled as such). PE7 tokens for the display.

## 3. Interact — verifying without committing secrets

Problem: the verification token is not a secret, but it is environment-specific. Hard-coding it in the component is tempting but couples the code to one site. The clean pattern is to read it from an environment variable via `$env/static/public` so staging and production can have different tokens.

## 4. Mini-build — a verification meta + a GSC reference card

**File:** `src/routes/modules/13-seo/14-search-console/+page.svelte`

```svelte
<script lang="ts">
    import SEO from '$lib/components/SEO.svelte';

    // In a real app this comes from $env/static/public:
    // import { PUBLIC_GSC_TOKEN } from '$env/static/public';
    const gscToken: string = 'demo-verification-token-replace-me';
</script>

<SEO
    title="Google Search Console · Lesson 13.14"
    description="How to verify ownership, submit your sitemap, and read the Coverage and Performance reports to guide content improvements."
/>

<svelte:head>
    <meta name="google-site-verification" content={gscToken} />
</svelte:head>

<section class="page stack">
    <p class="eyebrow">Lesson 13.14 · Mini-build</p>
    <h1>Your GSC command center</h1>
    <dl class="report">
        <div>
            <dt>Verification</dt>
            <dd>Meta tag shipped in the head of every page via the root layout.</dd>
        </div>
        <div>
            <dt>Sitemap</dt>
            <dd><a href="/sitemap.xml">/sitemap.xml</a> — submit once in GSC.</dd>
        </div>
        <div>
            <dt>Coverage</dt>
            <dd>Check weekly for new indexing errors.</dd>
        </div>
        <div>
            <dt>Performance</dt>
            <dd>Sort by impressions × (1 − CTR) to find your biggest title-rewrite wins.</dd>
        </div>
    </dl>
</section>

<style>
    section { --color-brand: oklch(68% 0.2 260); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
    .report { display: grid; gap: var(--space-md); }
    .report div {
        padding: var(--space-md);
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        border-inline-start: 4px solid var(--color-brand);
        border-radius: var(--radius-md);
    }
    dt { font-weight: 600; }
    dd { margin: 0; color: var(--color-text-muted); }
</style>
```

### DevTools moment

View source, find the `google-site-verification` meta. If you own a domain, deploy and verify in GSC. Wait 24 hours, then open the Performance report — the first impressions usually appear within a day.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why use the meta-tag verification method for a SvelteKit site?</summary>

It is the easiest to ship — one line in `+layout.svelte`. DNS verification is more robust but requires DNS access.
</details>

<details>
<summary><strong>Q2.</strong> What is the actionable pattern "high impressions + low CTR" telling you?</summary>

Google is showing your page to the right audience but the title/description is not compelling enough to click. Rewrite the meta description or title.
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between "crawled, not indexed" and "discovered, not crawled"?</summary>

"Crawled, not indexed" — Google fetched the page and decided not to index it (usually quality). "Discovered, not crawled" — Google knows the URL but has not fetched it yet (usually crawl budget).
</details>

<details>
<summary><strong>Q4.</strong> Why read the verification token from an environment variable?</summary>

Staging and production have different tokens. Hard-coding one ties the source to one site.
</details>

<details>
<summary><strong>Q5.</strong> How long after deploying the meta tag should you wait before clicking Verify?</summary>

The tag is live as soon as the deploy finishes. Clicking Verify should succeed within seconds. If it fails, check that the tag is in the SSR HTML (View Source), not just hydration.
</details>

## 6. Common mistakes

- **Removing the verification tag after verifying.** That un-verifies you on the next re-check.
- **Verifying localhost.** GSC only accepts live URLs.
- **Submitting the sitemap before deploying it.** Google fetches the sitemap URL; if it 404s, submission fails.
- **Obsessing over the Coverage report on day one.** Indexing takes days to weeks. Check weekly, not hourly.

## 7. What's next

Lesson 13.15 is the last lesson of the teaching curriculum — 3D and SEO, and how to ship a WebGL hero that still earns a 100 on Lighthouse SEO.
