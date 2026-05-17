---
module: 13
lesson: 13.4
title: Open Graph & Twitter Cards — social sharing
duration: 45 minutes
prerequisites:
  - Lesson 13.3 — typed SEO component
learning_objectives:
  - List the four required Open Graph tags
  - Produce a 1200×630 OG image that looks correct on Facebook, LinkedIn, and Slack
  - Choose between summary and summary_large_image Twitter Cards
  - Test previews with Facebook Sharing Debugger and Twitter Card Validator
  - Explain why absolute URLs are mandatory for og:image
status: ready
---

# Lesson 13.4 — Open Graph & Twitter Cards

## 1. Concept — the tags that control every link preview on every platform

### 1.1 The problem: a raw URL is a terrible advertisement

When a user pastes `https://yourapp.dev/blog/new-feature` into Slack, Discord, iMessage, WhatsApp, LinkedIn, Facebook, or X, each of those platforms fetches the URL and tries to generate a preview card — an image, a title, a description. Every platform uses the same protocol to do that: the **Open Graph Protocol** invented by Facebook in 2010 and universally adopted since.

If your page emits the right OG tags, every platform builds a rich, branded preview card with your hero image. If your page emits nothing, the card is either blank or contains random scraped content — sometimes the first `<p>` on the page, sometimes the first image it finds, sometimes nothing at all. The difference between a card with a designed OG image and a card with a favicon and a URL is measured in click-through rates of 3x or more.

### 1.2 The four required OG tags

```html
<meta property="og:type" content="website" />
<meta property="og:title" content="Your page title" />
<meta property="og:description" content="Your 150-character summary" />
<meta property="og:image" content="https://yourapp.dev/og/page.png" />
```

Every OG tag uses `property=` (not `name=`) because of how the Open Graph spec was defined. Four tags are mandatory; the optional ones (`og:url`, `og:site_name`, `og:locale`, `og:image:width`, `og:image:height`) all have sensible defaults if you omit them.

### 1.3 The 1200×630 image rule

Every major platform renders the OG image at a specific aspect ratio: **1200 pixels wide by 630 pixels tall, 1.91:1 ratio**. Facebook, LinkedIn, and Slack all crop to this ratio. Images that do not match are letterboxed or center-cropped, usually badly. Discord shows a smaller preview but crops to the same ratio. X (Twitter) also accepts this ratio via `summary_large_image`.

Practical rules:
- Actual pixel dimensions: 1200 × 630. Not 1200 × 628, not 1080 × 566 — exactly 1200 × 630.
- Text on the image must be large. A typical card is displayed at around 500 × 262 in a feed. Body text under 32px in your source image is unreadable when rendered.
- Keep important content inside a safe area of 1000 × 500 centered — the edges may be cropped.
- File size under 300 KB. Use PNG or modern WebP.
- **Absolute URL only.** `og:image="/og/page.png"` silently breaks on Facebook. Always include the full `https://` origin.

### 1.4 Twitter Cards: a near-duplicate with a twist

Twitter (now X) honors OG tags as a fallback, but it also reads its own Twitter-specific tags if present. The cleanest pattern is to emit both sets — the shared component in Lesson 13.3 does exactly that.

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Your page title" />
<meta name="twitter:description" content="Your summary" />
<meta name="twitter:image" content="https://yourapp.dev/og/page.png" />
```

Note `name=` instead of `property=` — an annoying inconsistency from history that you just memorise.

The `twitter:card` type chooses the visual treatment. `summary` is a small square thumbnail next to text; `summary_large_image` is the big 1200×630 card. Almost everyone wants the large card; the small one is mostly useful for inline mentions where vertical space is tight.

### 1.5 Testing tools (memorise these URLs)

Before you ship, always test:

- **Facebook Sharing Debugger** — https://developers.facebook.com/tools/debug/
- **LinkedIn Post Inspector** — https://www.linkedin.com/post-inspector/
- **X Card Validator** — the official one was discontinued; use https://cards-dev.twitter.com/validator or simply post to a throwaway account.
- **Slack** — paste the URL into a private channel and read the preview.
- **Discord** — paste into a private channel; Discord cache is aggressive, so append `?v=2` to bust it.

Facebook and LinkedIn both cache OG data aggressively. After a change, click "Scrape again" in the debugger or the preview will show the stale version for hours.

### 1.x What social platforms do under the hood with OG tags

When you share a URL on Twitter, Facebook, Slack, or Discord:

1. The platform's crawler fetches the URL (a simple HTTP GET, no JavaScript execution).
2. It parses the HTML `<head>` for Open Graph (`og:`) and Twitter Card (`twitter:`) meta tags.
3. It extracts the title, description, image URL, and type.
4. It fetches the image URL separately and generates a preview card.
5. The card is cached — typically for hours to days. Updating your OG tags does not immediately update existing shares.

Key requirements: `og:image` must be an absolute URL (relative URLs fail on most platforms). The image should be at least 1200x630 pixels for `summary_large_image` cards. The description should be under 200 characters.

### 1.x Common interview question

**Q: "What are Open Graph tags, and why must the `og:image` URL be absolute?"**

**Model answer:** Open Graph tags are HTML meta tags in the `<head>` that control how a URL appears when shared on social media. Key tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`. The `og:image` URL must be absolute (including `https://`) because social media crawlers fetch the image from their own servers, not from the user's browser. A relative URL like `/images/hero.jpg` has no meaning without the origin. The crawler needs `https://example.com/images/hero.jpg` to locate the file. This is the most common OG tag mistake — and it results in link previews with no image.

## Deep Dive

**Why this matters at scale.** OG tags control link previews on social media. og:image must be absolute and ideally 1200x630px.

**The mental model.** og:title, og:description, og:image, og:url are the minimum. Twitter uses twitter:card, twitter:title, twitter:description, twitter:image.

**Edge cases.** og:image must be an absolute URL. Relative paths silently fail. Test with Facebook's sharing debugger and Twitter's card validator.

**Performance implications.** Meta tags are static HTML — zero runtime cost. The og:image URL triggers a separate fetch by the social platform's crawler.

**Connection to other modules.** Module 13.3's SEO component contains these tags. Module 9's load functions provide dynamic data.


## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — the preview card we design in CSS

PE7 tokens already give us everything we need to draw a 1200×630 preview at scale inside the mini-build. The page renders a scaled-down replica of the OG card using the same tokens as the SEO component — one source of truth for brand color across the whole system.

## 3. Interact — why `og:image` must be absolute

Problem: a student sets `og:image="/og/default.png"` in development, the preview works on localhost because localhost resolves relative URLs, and ships it. In production Facebook fetches the page, sees a relative URL in the OG tag, and silently discards it. The card falls back to a random scraped image. The fix is to always build the URL as `` `${origin}${path}` `` — a lesson in knowing *whose* resolver runs on the string.

## 4. Mini-build — a page with full OG/Twitter tags and a preview card

**File:** `src/routes/modules/13-seo/04-open-graph/+page.svelte`

```svelte
<script lang="ts">
    import SEO from '$lib/components/SEO.svelte';

    const title: string = 'Open Graph & Twitter Cards · Lesson 13.4';
    const description: string =
        'Four required OG tags, one 1200×630 image, and a Twitter Card — how to make every link preview look intentional.';
    const ogImage: string = 'https://ultimate-frontend.dev/og/lesson-13-4.png';
</script>

<SEO {title} {description} {ogImage} ogType="article" />

<section class="page stack">
    <p class="eyebrow">Lesson 13.4 · Mini-build</p>
    <h1>What a share preview looks like</h1>

    <figure class="og-card" aria-label="Simulated Open Graph share card">
        <div class="og-card__image" role="img" aria-label="Lesson 13.4 cover art">
            <span>Lesson 13.4</span>
            <strong>Open Graph &amp; Twitter Cards</strong>
        </div>
        <figcaption class="og-card__meta">
            <p class="og-card__url">ultimate-frontend.dev</p>
            <p class="og-card__title">{title}</p>
            <p class="og-card__desc">{description}</p>
        </figcaption>
    </figure>
</section>

<style>
    section { --color-brand: oklch(68% 0.2 20); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
    .og-card {
        max-inline-size: 540px;
        margin: 0;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        overflow: hidden;
        background: var(--color-surface-2);
    }
    .og-card__image {
        aspect-ratio: 1200 / 630;
        display: grid;
        place-items: center;
        gap: var(--space-xs);
        background: linear-gradient(135deg, var(--color-brand), oklch(from var(--color-brand) 40% 0.2 h));
        color: oklch(98% 0.01 0);
        text-align: center;
        padding: var(--space-md);
    }
    .og-card__image span { font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.1em; }
    .og-card__image strong { font-size: var(--text-xl); }
    .og-card__meta { padding: var(--space-md); }
    .og-card__url { font-size: var(--text-xs); color: var(--color-text-muted); margin: 0; }
    .og-card__title { font-size: var(--text-lg); font-weight: 600; margin-block: var(--space-xs); }
    .og-card__desc { font-size: var(--text-sm); color: var(--color-text-muted); margin: 0; }
</style>
```

### DevTools moment

View source, confirm all `og:*` and `twitter:*` tags are present, each with an absolute URL. Copy the localhost URL (or deploy) and paste into the Facebook Sharing Debugger — every tag should parse cleanly.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What are the four required Open Graph tags?</summary>

`og:type`, `og:title`, `og:description`, `og:image`.
</details>

<details>
<summary><strong>Q2.</strong> Why is 1200×630 the target image size?</summary>

It is the 1.91:1 aspect ratio Facebook, LinkedIn, Slack, and X all crop to. Non-matching images get letterboxed or badly cropped.
</details>

<details>
<summary><strong>Q3.</strong> Why must <code>og:image</code> be an absolute URL?</summary>

Facebook and most platforms fetch the page from their own servers and refuse to resolve relative URLs against your origin. An absolute URL is unambiguous.
</details>

<details>
<summary><strong>Q4.</strong> What is the difference between <code>summary</code> and <code>summary_large_image</code> Twitter Cards?</summary>

`summary` shows a small square thumbnail next to text; `summary_large_image` shows the full 1200×630 card. Large is the default choice for shareable content.
</details>

<details>
<summary><strong>Q5.</strong> Why use <code>property=</code> for OG tags but <code>name=</code> for Twitter tags?</summary>

Historical accident — OG uses RDFa-style `property=` attributes; Twitter's earlier implementation chose `name=`. Both are still required today.
</details>

## 6. Common mistakes

- **Relative `og:image` URLs.** Silently break on Facebook. Always absolute.
- **Tiny text in the OG image.** Your 16px headline is unreadable when the card is shown at 500 pixels wide. Design for display size, not source size.
- **Forgetting to re-scrape after a change.** Facebook and LinkedIn cache aggressively; trigger a manual re-scrape.
- **Serving an OG image behind authentication.** The crawler is unauthenticated; it gets a 401 and shows nothing.

## 7. What's next

Lesson 13.5 wires SEO data through `load()` functions so titles, descriptions, and images come from typed server data instead of hard-coded strings.
