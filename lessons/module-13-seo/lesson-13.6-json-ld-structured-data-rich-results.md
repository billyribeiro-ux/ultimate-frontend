---
module: 13
lesson: 13.6
title: JSON-LD Structured Data — rich results
duration: 60 minutes
prerequisites:
  - Lesson 13.5 — SEO data from load()
learning_objectives:
  - Explain what schema.org types are and why Google requires them for rich results
  - Emit a valid Article JSON-LD block inside <svelte:head>
  - Model a Course, BreadcrumbList, FAQPage, Organization, Product, and WebSite in JSON-LD
  - Validate JSON-LD with Google's Rich Results Test
  - Use {@html} safely to emit a raw <script type="application/ld+json"> tag
status: ready
---

# Lesson 13.6 — JSON-LD Structured Data

## 1. Concept — the machine-readable layer that unlocks rich results

### 1.1 The problem: crawlers can only guess what your page means

A `<h1>`, a paragraph, an `<img>` — these are human-readable. A crawler can extract text from them but it cannot tell whether `$29.99` is a price, a zip code, or a phone extension. Whether `Jane Doe` is the author, the subject, or a random mention. Whether this page is a recipe, a product, a course, or a legal notice.

Google added a way around the guessing game in 2011: **structured data**. A page can embed machine-readable metadata describing its contents using a shared vocabulary called **schema.org**. Google reads the structured data and — if the data meets its quality bar — displays your result with a **rich snippet**: star ratings, prices, FAQ accordions, recipe thumbnails, course details, breadcrumb trails. Rich snippets have measurably higher click-through rates than plain blue-link snippets.

### 1.2 The three formats, and why JSON-LD wins

Schema.org supports three serialization formats: Microdata, RDFa, and JSON-LD. Google officially recommends **JSON-LD** because it lives in a `<script type="application/ld+json">` tag and never touches your visible markup. You can add, remove, or edit structured data without changing a single rendered element. Microdata and RDFa entangle metadata with HTML; JSON-LD stays separate.

```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Why load() is the right place for SEO data",
    "author": { "@type": "Person", "name": "Jane Doe" },
    "datePublished": "2026-04-05"
}
</script>
```

### 1.3 The schema.org types you will actually use

Schema.org has over a thousand types. In practice an SEO engineer uses maybe eight:

| Type           | When to use                                               |
| -------------- | --------------------------------------------------------- |
| `Article`      | Blog posts, news, how-tos                                 |
| `Course`       | Individual courses with provider and aggregate rating     |
| `Product`      | E-commerce product pages                                  |
| `Organization` | Your company — put this on the root layout                |
| `WebSite`      | Enables site-wide search box in SERP — also root layout   |
| `BreadcrumbList` | Breadcrumb trail for any non-home page                 |
| `FAQPage`      | Pages with clearly structured Q/A sections — huge for AEO |
| `Person`       | Nested inside Article.author for E-E-A-T signals          |

Every type has required fields and recommended fields. Google's documentation at search.google.com/search-console/docs is the authoritative list. When in doubt, paste your JSON-LD into the **Rich Results Test** at search.google.com/test/rich-results — it tells you exactly which required fields are missing.

### 1.4 The `{@html}` trick for raw script tags

Svelte's templater is careful with `<script>` elements — it does not want you accidentally shipping runtime JavaScript as if it were HTML. If you write `<script type="application/ld+json">{...}</script>` inside a `<svelte:head>`, Svelte treats it as a component script block and gets confused.

The standard SvelteKit-community workaround is to use the `{@html}` tag to emit the script element as a raw string. You build the whole `<script>…</script>` string in JS and inject it:

```svelte
<svelte:head>
    {@html `<script type="application/ld+json">${JSON.stringify(data)}</script>`}
</svelte:head>
```

This is one of the very few legitimate uses of `{@html}`. It is safe **only because you control the input** — `data` is a typed object you built yourself, not user input. Never emit user-submitted strings via `{@html}` without escaping first.

Even so, because `JSON.stringify` can produce `</script>` substrings if an author name contains them, the safest version escapes the forward slash:

```ts
const json: string = JSON.stringify(data).replace(/</g, '\\u003c');
```

### 1.5 One block per concept, not one big block per page

Google prefers multiple small JSON-LD blocks over one monolithic mega-block. A product page might have three: `Product`, `BreadcrumbList`, and `Organization`. A blog post might have `Article`, `BreadcrumbList`, and `Person` (as the author nested inside the Article). Keep them separate — they are easier to debug, easier to update, and easier for Google to parse.

### 1.6 Building a type-safe JSON-LD helper

In a production codebase, raw JSON objects for structured data are error-prone. Property names must match schema.org exactly (`datePublished`, not `publishedDate`; `@type`, not `type`). The fix is to define TypeScript interfaces for each schema type and use them to construct your JSON-LD objects:

```ts
interface ArticleSchema {
    '@context': 'https://schema.org';
    '@type': 'Article';
    headline: string;
    description: string;
    author: { '@type': 'Person'; name: string; url?: string };
    datePublished: string;
    dateModified?: string;
    publisher: {
        '@type': 'Organization';
        name: string;
        logo: { '@type': 'ImageObject'; url: string };
    };
    image?: string;
}
```

With this interface, your IDE autocompletes property names, TypeScript catches typos, and you cannot accidentally omit required fields. The `JsonLd.svelte` component in the mini-build accepts `Record<string, unknown>` for flexibility, but in production you would narrow the type per schema.

### 1.7 JSON-LD and SvelteKit load functions

The ideal pattern is to compute JSON-LD data in your load function and pass it to the page component. This keeps the structured data close to the data source and ensures it is always consistent with the rendered content:

```ts
// +page.ts
export const load: PageLoad = async ({ fetch, params }) => {
    const post = await fetch(`/api/posts/${params.slug}`).then(r => r.json());
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        datePublished: post.publishedAt,
        author: { '@type': 'Person', name: post.author.name }
    };
    return { post, articleSchema };
};
```

The page component receives `data.articleSchema` and passes it directly to `<JsonLd data={data.articleSchema} />`. The structured data is always in sync with the page content because both come from the same data source.

## Deep Dive

**Why this matters at scale.** In a 20-route content site, structured data is the difference between plain blue links in search results and rich snippets with star ratings, FAQ accordions, breadcrumbs, and publication dates. Rich snippets have measurably higher click-through rates (CTR) — studies consistently show 20-40% CTR improvement for results with rich snippets compared to plain results. For a site with 10,000 monthly search impressions, that is 2,000-4,000 additional clicks per month from the same ranking position. At scale, structured data is one of the highest-ROI SEO investments available.

**The mental model.** JSON-LD is a translator between your human-readable page and Google's machine-readable understanding. Your page says "by Jane Doe, published April 5." Google's crawler can *guess* that "Jane Doe" is an author and "April 5" is a date, but guessing is unreliable. JSON-LD removes the guessing: it explicitly says "this entity is of type Article, its author is a Person named Jane Doe, and its publication date is 2026-04-05." The machine does not have to infer — you told it directly. That directness is why JSON-LD unlocks features (rich snippets) that are unavailable to pages relying on crawler inference alone.

**Edge cases.** JSON-LD must match the visible page content. Google has explicitly stated that structured data that contradicts what users see is a violation of their guidelines and can result in manual penalties. If your JSON-LD says the price is $29.99 but the visible page shows $49.99, that is a violation. Always derive JSON-LD from the same data source as the rendered content — which is exactly what the load-function pattern above achieves. Another edge case: the `</script>` problem. If any field in your JSON-LD contains the literal string `</script>`, it will prematurely close the script tag. Always escape `<` to `<` in the stringified output.

**Performance implications.** JSON-LD has zero performance impact on rendering. It lives in a `<script>` tag with `type="application/ld+json"`, which the browser does not execute — it is treated as inert data. The only cost is the bytes in the HTML: a typical Article schema is 300-500 bytes, a BreadcrumbList is 200-400 bytes. For a total of 1-2 KB per page, this is negligible compared to even a small image. There is no JavaScript execution, no DOM manipulation, no layout cost. Structured data is the rare SEO technique that is entirely free of performance trade-offs.

**Connection to other modules.** JSON-LD builds on Module 8 (SSR — structured data must be in the server-rendered HTML for crawlers to see it), Module 9A (load functions provide the data that JSON-LD schemas are built from), and Module 13 Lessons 13.3-13.5 (the SEO component system that JSON-LD integrates with). Lesson 13.7 adds E-E-A-T signals to Article schemas. Lesson 13.12 uses FAQPage schema as AEO fuel. The capstone project ships structured data on every content page, validated by the Rich Results Test.

## 2. Style it — JSON-LD emits nothing visual

Structured data has zero visual footprint. The mini-build renders the raw JSON-LD in a styled `<pre>` alongside the article so you can see what you just shipped, but that is a debug aid, not a design element.

## 3. Interact — escaping and typing the JSON

Problem: hand-written JSON-LD strings rot. Typos in property names silently disable rich results. The fix is to model the data as a typed TypeScript object and stringify it. Your types match Google's documented schemas; your stringifier produces valid JSON every time.

## 4. Mini-build — an Article JSON-LD helper and a demo page

**File:** `src/lib/components/JsonLd.svelte`

```svelte
<script lang="ts">
    interface JsonLdProps {
        data: Record<string, unknown>;
    }
    const { data }: JsonLdProps = $props();
    const json: string = JSON.stringify(data).replace(/</g, '\\u003c');
</script>

<svelte:head>
    {@html `<script type="application/ld+json">${json}</script>`}
</svelte:head>
```

**File:** `src/routes/modules/13-seo/06-json-ld/+page.svelte`

```svelte
<script lang="ts">
    import SEO from '$lib/components/SEO.svelte';
    import JsonLd from '$lib/components/JsonLd.svelte';

    const title: string = 'JSON-LD structured data · Lesson 13.6';
    const description: string =
        'Rich results — the machine-readable layer Google needs to display star ratings, FAQs, and breadcrumbs next to your page.';

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        author: {
            '@type': 'Person',
            name: 'Ultimate Frontend Course'
        },
        datePublished: '2026-04-05',
        dateModified: '2026-04-05',
        publisher: {
            '@type': 'Organization',
            name: 'Ultimate Frontend',
            logo: {
                '@type': 'ImageObject',
                url: 'https://ultimate-frontend.dev/logo.png'
            }
        }
    } as const;

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Modules', item: 'https://ultimate-frontend.dev/modules' },
            { '@type': 'ListItem', position: 2, name: 'Module 13', item: 'https://ultimate-frontend.dev/modules/13-seo' },
            { '@type': 'ListItem', position: 3, name: 'Lesson 13.6', item: 'https://ultimate-frontend.dev/modules/13-seo/06-json-ld' }
        ]
    } as const;
</script>

<SEO {title} {description} ogType="article" />
<JsonLd data={articleSchema} />
<JsonLd data={breadcrumbSchema} />

<section class="page stack">
    <p class="eyebrow">Lesson 13.6 · Mini-build</p>
    <h1>JSON-LD emits two schemas into the head</h1>
    <p>This page ships both an <code>Article</code> schema and a <code>BreadcrumbList</code> schema.</p>
    <p>Paste the URL into <a href="https://search.google.com/test/rich-results">Google's Rich Results Test</a> to see them parse.</p>
</section>

<style>
    section { --color-brand: oklch(68% 0.2 60); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
</style>
```

### DevTools moment

View source and search for `application/ld+json`. You will find two script blocks, one per schema, each with a validated payload. Then paste your deployed URL (or use ngrok/localtunnel for localhost) into the Rich Results Test and confirm it reports "Article eligible for rich results."

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does Google prefer JSON-LD over Microdata or RDFa?</summary>

JSON-LD lives in a script tag separate from visible markup, so it can be edited without touching the rendered HTML. Microdata and RDFa entangle metadata with the DOM.
</details>

<details>
<summary><strong>Q2.</strong> Why use <code>{@html}</code> to emit the JSON-LD script?</summary>

Svelte's templater special-cases literal `<script>` elements and will not emit them inside `<svelte:head>` the way you need. `{@html}` bypasses that, and it is safe here because the input is a typed object you built yourself.
</details>

<details>
<summary><strong>Q3.</strong> Why escape <code>&lt;</code> to <code>\u003c</code> in the stringified JSON?</summary>

To prevent a stray `</script>` substring inside a field from ending the script block early and turning the page into a security hole.
</details>

<details>
<summary><strong>Q4.</strong> Why emit multiple smaller JSON-LD blocks instead of one big one?</summary>

They are easier to debug, easier to update independently, and Google's parser handles them equally well.
</details>

<details>
<summary><strong>Q5.</strong> What tool validates your JSON-LD before you ship?</summary>

Google's Rich Results Test at search.google.com/test/rich-results. It reports which rich result types your page is eligible for and what required fields are missing.
</details>

## 6. Common mistakes

- **Wrong `@type` capitalisation.** `article` instead of `Article` silently disables the rich result.
- **Relative URLs in JSON-LD.** Use absolute URLs for every `url`, `image`, and `logo` field.
- **Missing `publisher.logo` on Article.** Google requires it for news rich results.
- **Emitting user-generated strings via `{@html}` without escaping.** That is an XSS vector. This lesson only uses server-controlled data.

## 7. What's next

Lesson 13.7 layers E-E-A-T signals — author bios, dates, and structured credentials — on top of the Article schema you just shipped.
