---
module: 13
exercise: 1
title: Head Tags and Meta Component
difficulty: beginner
estimated_time: 10
skills_tested:
  - svelte:head
  - title and meta tags
  - typed SEO props
---

# Exercise 13.1 — Head Tags and Meta Component

## Brief

Build a reusable `<Seo>` component that renders all essential head tags (title, description, canonical URL) using `<svelte:head>`. Use it on three different pages to prove it adapts per-page while maintaining consistent formatting.

## Requirements

1. Create `src/lib/components/Seo.svelte` accepting typed props: `title`, `description`, `canonicalUrl`, and optional `noindex`
2. The component renders `<title>`, `<meta name="description">`, `<link rel="canonical">`, and optionally `<meta name="robots" content="noindex">`
3. The title must follow the pattern: `{title} | Site Name`
4. Create three pages that use the component with different data: home, about, and blog
5. Each page must have a unique title, description, and canonical URL
6. The component must handle missing optional props gracefully
7. Type all props with a TypeScript interface

## Constraints

- No third-party SEO libraries
- All meta tags must be inside `<svelte:head>`
- The component renders no visible DOM elements
- Props must be typed — no `any`

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`<svelte:head>` can contain any valid `<head>` elements. A component can use `<svelte:head>` to inject tags into the document head. SvelteKit handles deduplication when multiple components inject head tags.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The component accepts props and renders them inside `<svelte:head>`. It has no `<style>` block because it produces no visible output. The optional `noindex` prop uses an `{#if}` block to conditionally render the robots meta tag.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  interface SeoProps {
    title: string;
    description: string;
    canonicalUrl: string;
    noindex?: boolean;
  }

  let { title, description, canonicalUrl, noindex = false }: SeoProps = $props();
</script>

<svelte:head>
  <title>{title} | Site Name</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  {#if noindex}<meta name="robots" content="noindex" />{/if}
</svelte:head>
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```svelte
<!-- src/lib/components/Seo.svelte -->
<script lang="ts">
  const SITE_NAME = 'Ultimate Frontend';

  interface SeoProps {
    title: string;
    description: string;
    canonicalUrl: string;
    noindex?: boolean;
  }

  let { title, description, canonicalUrl, noindex = false }: SeoProps = $props();
</script>

<svelte:head>
  <title>{title} | {SITE_NAME}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  {#if noindex}
    <meta name="robots" content="noindex, nofollow" />
  {/if}
</svelte:head>
```

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
</script>

<Seo
  title="Home"
  description="Learn Svelte 5, TypeScript, and modern CSS in the Ultimate Frontend course."
  canonicalUrl="https://ultimate-frontend.dev/"
/>

<h1>Welcome to Ultimate Frontend</h1>
<p>The most comprehensive Svelte 5 course.</p>
```

```svelte
<!-- src/routes/about/+page.svelte -->
<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
</script>

<Seo
  title="About"
  description="Learn about the team behind Ultimate Frontend and our teaching philosophy."
  canonicalUrl="https://ultimate-frontend.dev/about"
/>

<h1>About Us</h1>
<p>We build courses for professional frontend developers.</p>
```

```svelte
<!-- src/routes/blog/+page.svelte -->
<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
</script>

<Seo
  title="Blog"
  description="Articles on Svelte, TypeScript, CSS, and frontend architecture."
  canonicalUrl="https://ultimate-frontend.dev/blog"
/>

<h1>Blog</h1>
<p>Latest articles and tutorials.</p>
```

### Explanation

A reusable `<Seo>` component ensures every page has consistent, correct meta tags without copy-pasting `<svelte:head>` blocks. The component renders zero visible DOM — it only emits `<head>` elements. TypeScript props enforce that every page provides the required SEO data. The `| Site Name` suffix creates brand consistency in search results. The `noindex` option is useful for utility pages (login, settings) that should not appear in search engines. This component is the foundation for all SEO work in the course — Open Graph tags, JSON-LD, and Twitter Cards build on top of it.
</details>
