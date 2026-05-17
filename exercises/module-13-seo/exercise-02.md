---
module: 13
exercise: 2
title: JSON-LD Structured Data
difficulty: intermediate
estimated_time: 20
skills_tested:
  - JSON-LD schema
  - svelte:head script injection
  - Schema.org vocabulary
  - typed structured data
---

# Exercise 13.2 — JSON-LD Structured Data

## Brief

Add JSON-LD structured data to a blog post page using Schema.org's `Article` type. The structured data is generated from the page's load function data and injected via `<svelte:head>`. Validate the output against Google's Rich Results requirements.

## Requirements

1. Create a TypeScript interface `ArticleJsonLd` matching Schema.org's Article type with `@context`, `@type`, `headline`, `author`, `datePublished`, `dateModified`, `image`, and `description`
2. Create a helper function `generateArticleJsonLd(post: Post): string` that builds the JSON-LD string
3. Inject the JSON-LD into `<svelte:head>` as a `<script type="application/ld+json">`
4. Create `src/routes/blog/[slug]/+page.server.ts` that returns post data including SEO fields
5. The page renders the JSON-LD with data from the load function
6. Include an `Organization` JSON-LD block on the home page with `name`, `url`, `logo`, and `sameAs` links
7. Add a visible "Structured Data Preview" section that shows the raw JSON-LD for debugging

## Constraints

- JSON-LD must be valid according to Schema.org
- Use `{@html}` only for the JSON-LD script tag (sanitized via `JSON.stringify`)
- The helper function must escape any HTML entities in the data
- All visible styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

JSON-LD is injected via `<svelte:head>{@html '<script type="application/ld+json">' + jsonString + '</script>'}</svelte:head>`. Use `JSON.stringify()` to safely serialize the object — it handles escaping automatically.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Build the JSON-LD object as a typed TypeScript object, then serialize it. The `@context` is always `"https://schema.org"`. The `@type` is `"Article"` for posts or `"Organization"` for the home page. Google requires at minimum: headline, image, datePublished, and author for Article rich results.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
function generateArticleJsonLd(post: Post): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.date,
    description: post.excerpt
  });
}
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/lib/seo/json-ld.ts
interface ArticleJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  author: { '@type': 'Person'; name: string };
  datePublished: string;
  dateModified?: string;
  image?: string;
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: { '@type': 'ImageObject'; url: string };
  };
}

interface Post {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  modified?: string;
  image?: string;
}

export function generateArticleJsonLd(post: Post): string {
  const data: ArticleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.date,
    dateModified: post.modified ?? post.date,
    image: post.image,
    publisher: {
      '@type': 'Organization',
      name: 'Ultimate Frontend',
      logo: { '@type': 'ImageObject', url: 'https://ultimate-frontend.dev/logo.png' }
    }
  };

  return JSON.stringify(data);
}

export function generateOrgJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ultimate Frontend',
    url: 'https://ultimate-frontend.dev',
    logo: 'https://ultimate-frontend.dev/logo.png',
    sameAs: [
      'https://github.com/ultimate-frontend',
      'https://twitter.com/ultimate_fe'
    ]
  });
}
```

```typescript
// src/routes/blog/[slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const posts = [
  {
    slug: 'svelte-5-runes',
    title: 'Understanding Svelte 5 Runes',
    excerpt: 'A deep dive into the runes system that powers Svelte 5 reactivity.',
    author: 'Ada Lovelace',
    content: 'Svelte 5 runes replace the old reactive let declarations...',
    date: '2026-05-01',
    modified: '2026-05-10',
    image: 'https://ultimate-frontend.dev/images/runes.jpg'
  }
];

export const load: PageServerLoad = ({ params }) => {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) error(404, 'Post not found');
  return { post };
};
```

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { generateArticleJsonLd } from '$lib/seo/json-ld';

  let { data }: { data: PageData } = $props();
  let jsonLd = $derived(generateArticleJsonLd(data.post));
</script>

<svelte:head>
  <title>{data.post.title} | Ultimate Frontend</title>
  <meta name="description" content={data.post.excerpt} />
  {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<article class="post">
  <h1>{data.post.title}</h1>
  <div class="meta">
    <span>By {data.post.author}</span>
    <time datetime={data.post.date}>{new Date(data.post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
  </div>
  <div class="content">
    <p>{data.post.content}</p>
  </div>

  <details class="json-ld-preview">
    <summary>Structured Data Preview</summary>
    <pre>{JSON.stringify(JSON.parse(jsonLd), null, 2)}</pre>
  </details>
</article>

<style>
  .post { max-inline-size: 40rem; margin-inline: auto; padding: var(--space-lg); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .meta { font-size: var(--text-sm); color: var(--color-text-muted); display: flex; gap: var(--space-md); margin-block-end: var(--space-xl); }
  .content { font-size: var(--text-base); line-height: 1.8; margin-block-end: var(--space-2xl); }
  .json-ld-preview { margin-block-start: var(--space-xl); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
  .json-ld-preview summary { padding: var(--space-sm) var(--space-md); cursor: pointer; font-size: var(--text-sm); font-weight: 600; color: var(--color-text-muted); }
  .json-ld-preview pre { padding: var(--space-md); background: var(--color-surface-2); font-size: var(--text-xs); overflow-x: auto; margin: 0; border-radius: 0 0 var(--radius-md) var(--radius-md); }
</style>
```

### Explanation

JSON-LD (JavaScript Object Notation for Linked Data) is Google's preferred format for structured data. It lives in a `<script type="application/ld+json">` tag in the `<head>`, making it invisible to users but machine-readable by search engines. Using `JSON.stringify()` to serialize the data is critical — it handles escaping characters that could break the script tag. The typed helper function ensures all required Schema.org fields are present at compile time. Google uses this data for rich results: article cards in search, organization knowledge panels, and breadcrumb trails. The preview section helps developers verify the output without using external tools.
</details>
