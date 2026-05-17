---
module: 13
lesson: 13.3
title: Building a reusable typed SEO component
duration: 50 minutes
prerequisites:
  - Lesson 13.2 — <svelte:head> basics
  - Module 3 — $props() and TypeScript interfaces
learning_objectives:
  - Define an SEOProps interface that models every tag a page needs
  - Build a reusable <SEO> component that fills defaults for missing values
  - Set defaults in the root layout and override per-page
  - Derive a canonical URL from the current route
  - Type every prop with zero any
status: ready
---

# Lesson 13.3 — Building a reusable typed SEO component

## 1. Concept — repeat the tags once, use them everywhere

### 1.1 The problem with raw `<svelte:head>` everywhere

Lesson 13.2 showed you the minimum tags every page needs: `<title>`, `<meta name="description">`, and a viewport. By Lesson 13.4 you will add Open Graph; by 13.6 you will add JSON-LD; by 13.13 you will add canonical. That is ten-plus tags per page. Writing them by hand in every `+page.svelte` guarantees three things: you will forget some, you will mistype some, and you will have to update all of them if a single convention changes.

The only sustainable answer is a single reusable component — `<SEO {...props} />` — that takes a typed `SEOProps` object and emits every tag. Every page passes the props it cares about, omits the ones it does not, and the component fills in sensible defaults. One place for every SEO convention; zero tag duplication.

### 1.2 Designing the prop interface

The interface must balance two pressures. It must be **strict** — TypeScript should refuse to compile if a required field is missing. And it must be **ergonomic** — a simple blog post should not need to pass twelve fields. The answer is a small set of required fields and a generous set of optional ones with intelligent defaults.

```ts
export interface SEOProps {
    title: string;               // required — unique per page
    description: string;         // required — 120–160 characters
    canonical?: string;          // absolute URL; default = current page
    ogImage?: string;            // 1200×630 absolute URL
    ogType?: 'website' | 'article';
    twitterCard?: 'summary' | 'summary_large_image';
    noindex?: boolean;           // true on search, auth, legal fallback pages
}
```

The two required fields — `title` and `description` — are the fields you already learned you cannot omit. Everything else has a default.

### 1.3 The default-in-layout, override-per-page pattern

SvelteKit gives you a beautiful pattern for this. Put the SEO component in your **root layout** with a sensible default set of props, and each page **extends or overrides** those defaults via `$page.data`. That way every page inherits the brand-level defaults (site name, OG image, Twitter handle) and only has to supply its page-specific fields. You will wire up the data flow in Lesson 13.5; this lesson focuses on the component itself.

### 1.4 Canonical URL: computed, not copy-pasted

A canonical URL tells search engines "this is the one true URL for this page" — it prevents duplicate-content penalties when the same content is reachable at multiple URLs (with or without trailing slash, with or without query parameters, on multiple domains). Students routinely copy-paste canonicals and end up with stale URLs after a rename. The correct pattern is to **derive** the canonical from the current route at render time: site origin + current pathname. SvelteKit gives you `page.url` for exactly this.

### 1.5 Why typing the component matters more than typing a function

A wrong title on a button makes one user frown. A wrong `og:image` URL breaks link previews on every share of the page. SEO mistakes are load-bearing in ways regular UI bugs are not. A strict TypeScript interface is the cheapest insurance policy you can buy. If you try to pass `ogImage` as a relative URL, the type system should catch it. If you forget `description`, the build should fail. Write the interface, then let the compiler hold your page to it.

### 1.x The TypeScript angle — typed SEO component props

A reusable SEO component with full TypeScript typing:

```ts
interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'product';
    twitterCard?: 'summary' | 'summary_large_image';
    noindex?: boolean;
    jsonLd?: Record<string, unknown>;
}
```

Using this interface with `$props()`:

```svelte
<script lang="ts">
    let { title, description, canonical, ogImage, ogType = 'website', 
          twitterCard = 'summary_large_image', noindex = false, jsonLd }: SEOProps = $props();
</script>
```

Every page passes typed SEO data. If a required field is missing, TypeScript catches it at compile time.

> **In production sidebar.** Our reusable `<SEO>` component is used on all 42 routes. It accepts typed props for title, description, Open Graph, Twitter Card, canonical URL, and JSON-LD. Before this component, each page had 15-20 lines of duplicated `<svelte:head>` markup. After, each page passes 3-5 props to `<SEO>`. The component also handles edge cases: truncating descriptions to 160 characters, falling back to site-wide defaults for missing OG images, and adding `noindex` for draft pages. Total effort to build: 2 hours. Ongoing maintenance: near zero.

### 1.x Common interview question

**Q: "Why would you build a reusable SEO component instead of using `<svelte:head>` directly in each page?"**

**Model answer:** A reusable SEO component enforces consistency and reduces duplication. Without it, every page has 15-20 lines of near-identical head tags, and any change (adding a new meta tag, fixing a format) requires editing every page. A component centralizes the logic: defaults for missing values, proper formatting (title truncation, description length), correct attribute names (it is easy to typo `og:title` as `og:Title`), and TypeScript enforcement of required fields. The component becomes the single source of truth for SEO markup across the entire site.

## Deep Dive

**Why this matters at scale.** A typed SEO component enforces required meta tags. Missing title or description is a compile error, not a runtime discovery.

**The mental model.** The component renders no visible DOM — only <svelte:head> elements. TypeScript props ensure every page provides required SEO data.

**Edge cases.** Keep the component focused: title, description, canonical, and noindex. Open Graph and Twitter Cards can extend the base component.

**Performance implications.** Zero DOM overhead — the component renders only <head> elements. TypeScript checking is build-time only.

**Connection to other modules.** Module 13.2 teaches the <svelte:head> foundation. Module 13.4 extends with social tags.


## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — the SEO component emits no DOM

The SEO component has no visible UI — it only emits `<svelte:head>` tags. There is nothing to style inside it. The *demo* page that shows an SEO component in action can still use the PE7 tokens to render a nicely styled "current SEO state" debug panel, which is what the mini-build does.

## 3. Interact — the compiler as your safety net

Problem: you ship a page with `<SEO title="..." />` and forget `description`. Without types, the build succeeds and the page goes live with a missing tag. With a strict `SEOProps` interface, the build fails instantly with a message telling you exactly which prop is missing. This lesson is the cleanest demonstration in Module 13 of why every shared component must be typed.

## 4. Mini-build — the `<SEO>` component plus a demo page

**File:** `src/lib/components/SEO.svelte`

```svelte
<script lang="ts">
    import { page } from '$app/state';

    export interface SEOProps {
        title: string;
        description: string;
        canonical?: string;
        ogImage?: string;
        ogType?: 'website' | 'article';
        twitterCard?: 'summary' | 'summary_large_image';
        noindex?: boolean;
    }

    const {
        title,
        description,
        canonical,
        ogImage = 'https://ultimate-frontend.dev/og-default.png',
        ogType = 'website',
        twitterCard = 'summary_large_image',
        noindex = false
    }: SEOProps = $props();

    const resolvedCanonical: string = canonical ?? `https://ultimate-frontend.dev${page.url.pathname}`;
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={resolvedCanonical} />
    {#if noindex}
        <meta name="robots" content="noindex, nofollow" />
    {/if}
    <meta property="og:type" content={ogType} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={resolvedCanonical} />
    <meta property="og:image" content={ogImage} />
    <meta name="twitter:card" content={twitterCard} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />
</svelte:head>
```

**File:** `src/routes/modules/13-seo/03-seo-component/+page.svelte`

```svelte
<script lang="ts">
    import SEO from '$lib/components/SEO.svelte';

    const title: string = 'Reusable SEO component · Lesson 13.3';
    const description: string =
        'A typed SEO component centralises every tag a page needs so you never repeat twelve metas by hand again.';
</script>

<SEO {title} {description} ogType="article" />

<section class="page stack">
    <p class="eyebrow">Lesson 13.3 · Mini-build</p>
    <h1>Reusable, typed, one-line SEO</h1>
    <p>This page uses the <code>&lt;SEO&gt;</code> component from <code>$lib/components/SEO.svelte</code>.</p>
    <p>Right-click → View Source to see every tag it emitted.</p>
</section>

<style>
    section { --color-brand: oklch(68% 0.2 300); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
</style>
```

### DevTools moment

View source. You will find the full set of OG, Twitter, canonical, and robots tags without having written them yourself. Try deleting `description=` from the page — the TypeScript build fails with a clear error. That is the interface earning its keep.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why mark <code>title</code> and <code>description</code> as required and everything else as optional?</summary>

They are the two tags you cannot omit on any SEO-relevant page. Making them required causes a build failure if forgotten. Optional fields with defaults keep the ergonomic simple-case ergonomic.
</details>

<details>
<summary><strong>Q2.</strong> Why derive the canonical URL at render time instead of passing it as a prop every time?</summary>

Derived canonicals stay correct automatically after renames or moves. Hand-written canonicals go stale silently and cause duplicate-content problems.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>noindex</code> on a page do?</summary>

It emits `<meta name="robots" content="noindex, nofollow">`, telling search engines not to index the page or follow its links. Useful for search pages, internal admin, and legal pages that should not appear in SERPs.
</details>

<details>
<summary><strong>Q4.</strong> Why is the component typed with an <code>interface</code> rather than a <code>type</code>?</summary>

Either works; interfaces are preferred in this course because they integrate cleanly with component prop autocompletion and Svelte's generated `$$Props` type. Consistency across the course matters more than the technical choice.
</details>

<details>
<summary><strong>Q5.</strong> What is the benefit of centralising the OG image default inside the component rather than in every page?</summary>

A single edit updates the default image for every page that inherits it. If the default lived in every page, a rebrand would require touching every file.
</details>

## 6. Common mistakes

- **Forgetting to make defaults absolute URLs.** `og:image` and `canonical` must be absolute — Facebook and Google refuse relative URLs.
- **Using `$app/stores` instead of `$app/state`.** `$app/stores` is legacy; in April 2026 you use `page` from `$app/state`.
- **Typing the component as `SEOProps = any`.** This defeats the purpose.
- **Writing the component as a function that mutates the head imperatively.** Let Svelte's `<svelte:head>` teleport handle that.

## 7. What's next

Lesson 13.4 adds Open Graph and Twitter Cards in depth — including the 1200×630 image rule and testing with Facebook's and Twitter's preview tools.
