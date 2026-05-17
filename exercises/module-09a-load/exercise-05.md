---
module: 9
exercise: 5
title: SSG Blog with Prerendering
difficulty: principal
estimated_time: 60
skills_tested:
  - prerender option
  - entries() function
  - static adapter
  - dynamic route prerendering
---

# Exercise 9a.5 — SSG Blog with Prerendering

## Brief

Build a fully prerendered blog with a listing page and dynamic post pages. Use SvelteKit's `entries()` function to tell the prerenderer which dynamic routes to generate. The entire blog must work as static HTML with zero server runtime.

## Requirements

1. Create a blog data module at `src/lib/data/posts.ts` exporting a typed array of at least 5 blog posts with `slug`, `title`, `content`, `date`, and `tags` fields
2. Create `src/routes/blog/+page.ts` with `export const prerender = true` and a load function that imports and returns all posts
3. Create `src/routes/blog/[slug]/+page.ts` with `export const prerender = true`, an `entries()` function that returns all valid slugs, and a load function that finds the matching post
4. Create `src/routes/blog/+page.svelte` as a post listing with title, date, and tags
5. Create `src/routes/blog/[slug]/+page.svelte` as a full post view with rendered content
6. Add `<svelte:head>` meta tags on both pages for SEO
7. Each post page must include navigation links to previous and next posts

## Constraints

- Use `+page.ts` (not `+page.server.ts`) since prerendered pages use universal load
- The `entries()` function must be typed and return `{ slug: string }[]`
- No runtime server — everything must be prerenderable
- No markdown parsing libraries — use raw HTML strings or plain text

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

The `entries()` function is exported alongside `load` in `+page.ts` for dynamic routes. It tells SvelteKit's prerenderer which parameter combinations to generate. Return an array of objects matching the route's parameter shape.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Since both pages are prerendered, the load functions run at build time. Import the posts data module in both load functions. The listing page returns all posts; the dynamic page finds the post matching `params.slug`. The `entries()` function maps the posts array to `[{ slug: 'post-1' }, { slug: 'post-2' }, ...]`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// src/routes/blog/[slug]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad, EntryGenerator } from './$types';
import { posts } from '$lib/data/posts';

export const prerender = true;

export const entries: EntryGenerator = () => {
  return posts.map((p) => ({ slug: p.slug }));
};

export const load: PageLoad = ({ params }) => {
  const index = posts.findIndex((p) => p.slug === params.slug);
  if (index === -1) error(404, 'Post not found');
  return { post: posts[index], prev: posts[index - 1] ?? null, next: posts[index + 1] ?? null };
};
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/lib/data/posts.ts
export interface BlogPost {
  slug: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

export const posts: BlogPost[] = [
  {
    slug: 'getting-started-with-svelte-5',
    title: 'Getting Started with Svelte 5',
    content: 'Svelte 5 introduces runes — a new way to declare reactive state. The $state rune replaces let declarations, $derived replaces $: reactive statements, and $effect replaces reactive blocks that produce side effects. This shift makes reactivity explicit and composable.',
    date: '2026-01-15',
    tags: ['svelte', 'tutorial']
  },
  {
    slug: 'css-layers-in-production',
    title: 'CSS Layers in Production',
    content: 'Cascade layers solve the specificity wars. By declaring @layer reset, tokens, base, layout, components, animations; you create a strict priority order. Rules in higher layers always win regardless of specificity, which makes large codebases predictable.',
    date: '2026-02-10',
    tags: ['css', 'architecture']
  },
  {
    slug: 'typescript-strict-mode-guide',
    title: 'TypeScript Strict Mode Guide',
    content: 'Strict mode enables strictNullChecks, noImplicitAny, noImplicitThis, and strictFunctionTypes. Each flag catches a different class of bugs at compile time. The investment pays off immediately in fewer runtime errors and better IDE support.',
    date: '2026-03-05',
    tags: ['typescript', 'tooling']
  },
  {
    slug: 'sveltekit-streaming-patterns',
    title: 'SvelteKit Streaming Patterns',
    content: 'Returning an unresolved Promise from a load function enables streaming. The page renders immediately with fast data and progressively fills in slow sections. Combine with skeleton UI for an excellent user experience on data-heavy pages.',
    date: '2026-04-01',
    tags: ['svelte', 'performance']
  },
  {
    slug: 'design-tokens-with-oklch',
    title: 'Design Tokens with OKLCH',
    content: 'OKLCH is a perceptually uniform color space. Unlike HSL, equal steps in lightness look equally different to the human eye. This makes it ideal for generating consistent color palettes from a single hue angle and building accessible contrast ratios.',
    date: '2026-05-12',
    tags: ['css', 'design']
  }
];
```

```typescript
// src/routes/blog/+page.ts
import type { PageLoad } from './$types';
import { posts } from '$lib/data/posts';

export const prerender = true;

export const load: PageLoad = () => {
  return {
    posts: posts.map(({ slug, title, date, tags }) => ({ slug, title, date, tags }))
  };
};
```

```svelte
<!-- src/routes/blog/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Blog — Ultimate Frontend</title>
  <meta name="description" content="Articles on Svelte, TypeScript, CSS, and modern frontend development." />
</svelte:head>

<div class="blog-listing">
  <h1>Blog</h1>

  <ul class="post-list">
    {#each data.posts as post}
      <li>
        <a href="/blog/{post.slug}" class="post-link">
          <h2>{post.title}</h2>
          <div class="post-meta">
            <time datetime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
            <div class="tags">
              {#each post.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          </div>
        </a>
      </li>
    {/each}
  </ul>
</div>

<style>
  .blog-listing {
    max-inline-size: 40rem;
    margin-inline: auto;
    padding: var(--space-lg);
  }

  h1 {
    font-size: var(--text-2xl);
    color: var(--color-text);
    margin-block-end: var(--space-xl);
  }

  .post-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .post-link {
    display: block;
    padding: var(--space-lg);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: box-shadow 150ms ease;
  }

  .post-link:hover {
    box-shadow: var(--shadow-md);
  }

  .post-link h2 {
    font-size: var(--text-lg);
    color: var(--color-text);
    margin-block-end: var(--space-sm);
  }

  .post-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  time {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .tags {
    display: flex;
    gap: var(--space-xs);
  }

  .tag {
    font-size: var(--text-xs);
    padding: var(--space-2xs) var(--space-xs);
    background: var(--color-surface-3);
    border-radius: var(--radius-full);
    color: var(--color-text-muted);
  }
</style>
```

```typescript
// src/routes/blog/[slug]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad, EntryGenerator } from './$types';
import { posts } from '$lib/data/posts';

export const prerender = true;

export const entries: EntryGenerator = () => {
  return posts.map((p) => ({ slug: p.slug }));
};

export const load: PageLoad = ({ params }) => {
  const index = posts.findIndex((p) => p.slug === params.slug);

  if (index === -1) {
    error(404, 'Post not found');
  }

  return {
    post: posts[index],
    prev: index > 0 ? { slug: posts[index - 1].slug, title: posts[index - 1].title } : null,
    next: index < posts.length - 1 ? { slug: posts[index + 1].slug, title: posts[index + 1].title } : null
  };
};
```

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.post.title} — Blog</title>
  <meta name="description" content={data.post.content.slice(0, 160)} />
</svelte:head>

<article class="post">
  <header>
    <h1>{data.post.title}</h1>
    <div class="meta">
      <time datetime={data.post.date}>
        {new Date(data.post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </time>
      <div class="tags">
        {#each data.post.tags as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
    </div>
  </header>

  <div class="content">
    <p>{data.post.content}</p>
  </div>

  <nav class="post-nav">
    {#if data.prev}
      <a href="/blog/{data.prev.slug}" class="nav-link prev">
        <span class="nav-label">Previous</span>
        <span class="nav-title">{data.prev.title}</span>
      </a>
    {:else}
      <div></div>
    {/if}
    {#if data.next}
      <a href="/blog/{data.next.slug}" class="nav-link next">
        <span class="nav-label">Next</span>
        <span class="nav-title">{data.next.title}</span>
      </a>
    {/if}
  </nav>
</article>

<style>
  .post {
    max-inline-size: 40rem;
    margin-inline: auto;
    padding: var(--space-lg);
  }

  header {
    margin-block-end: var(--space-xl);
    padding-block-end: var(--space-lg);
    border-block-end: 1px solid var(--color-border);
  }

  h1 {
    font-size: var(--text-2xl);
    color: var(--color-text);
    margin-block-end: var(--space-sm);
  }

  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  time {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .tags {
    display: flex;
    gap: var(--space-xs);
  }

  .tag {
    font-size: var(--text-xs);
    padding: var(--space-2xs) var(--space-xs);
    background: var(--color-surface-3);
    border-radius: var(--radius-full);
    color: var(--color-text-muted);
  }

  .content {
    font-size: var(--text-base);
    line-height: 1.8;
    color: var(--color-text);
    margin-block-end: var(--space-2xl);
  }

  .post-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
    padding-block-start: var(--space-lg);
    border-block-start: 1px solid var(--color-border);
  }

  .nav-link {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    padding: var(--space-md);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    text-decoration: none;
  }

  .nav-link:hover {
    background: var(--color-surface-3);
  }

  .nav-link.next {
    text-align: end;
  }

  .nav-label {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .nav-title {
    font-size: var(--text-sm);
    color: var(--color-text);
    font-weight: 600;
  }
</style>
```

### Explanation

SSG (Static Site Generation) with SvelteKit turns your dynamic app into static HTML files at build time. The `entries()` function solves the key challenge: how does the prerenderer know which values of `[slug]` to generate? You tell it explicitly. Combined with `adapter-static`, this gives you a zero-runtime blog hosted on any CDN. The prev/next navigation is computed at build time since all posts are known. This pattern extends to documentation sites, marketing pages, and any content that does not change between builds. For content that changes frequently, consider ISR (Incremental Static Regeneration) or hybrid rendering instead.
</details>
