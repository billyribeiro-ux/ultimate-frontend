---
module: 8
exercise: 2
title: Dynamic Blog Routes
difficulty: intermediate
estimated_time: 20
skills_tested:
  - dynamic route parameters
  - rest parameters
  - param matchers
---

# Exercise 8.2 — Dynamic Blog Routes

## Brief

Create a blog section with dynamic routes that handle individual post slugs, category filtering via rest parameters, and a custom param matcher that validates slug format.

## Requirements

1. Create a blog listing page at `src/routes/blog/+page.svelte` that shows a list of hardcoded posts
2. Create a dynamic post page at `src/routes/blog/[slug]/+page.svelte` that reads the `slug` parameter from `$page.params`
3. Create a category route at `src/routes/blog/category/[...path]/+page.svelte` that handles nested categories like `/blog/category/tech/svelte`
4. Create a param matcher at `src/params/slug.ts` that ensures slugs contain only lowercase letters, numbers, and hyphens
5. Update the dynamic route to use the matcher: `[slug=slug]`
6. Display a "Post not found" message when the slug does not match any hardcoded post
7. Type all page data with TypeScript interfaces

## Constraints

- No load functions yet — use `$page.params` and reactive state
- Slug matcher must reject uppercase, spaces, and special characters
- All styles must use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`$page.params` is available from `$app/state`. A param matcher is a file in `src/params/` that exports a `match` function returning a boolean. Rest parameters use `[...name]` syntax and capture the remaining path segments as a slash-separated string.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The matcher validates the URL before the route resolves. If the slug fails the matcher, SvelteKit skips this route and tries the next match (or returns 404). Inside the page, use `$derived` to find the matching post from your hardcoded array based on `page.params.slug`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// src/params/slug.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(param);
};
```

```svelte
<!-- src/routes/blog/[slug=slug]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/state';

  interface Post {
    slug: string;
    title: string;
    content: string;
  }

  const posts: Post[] = [
    { slug: 'hello-world', title: 'Hello World', content: '...' }
  ];

  let post = $derived(posts.find((p) => p.slug === page.params.slug));
</script>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```typescript
// src/params/slug.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(param);
};
```

```svelte
<!-- src/routes/blog/+page.svelte -->
<script lang="ts">
  interface Post {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
  }

  const posts: Post[] = [
    { slug: 'getting-started-svelte', title: 'Getting Started with Svelte', excerpt: 'Learn the basics...', category: 'tech/svelte' },
    { slug: 'css-layers-explained', title: 'CSS Layers Explained', excerpt: 'Deep dive into @layer...', category: 'tech/css' },
    { slug: 'design-tokens-guide', title: 'Design Tokens Guide', excerpt: 'Building a token system...', category: 'design' }
  ];
</script>

<h1>Blog</h1>

<ul class="post-list">
  {#each posts as post}
    <li>
      <a href="/blog/{post.slug}">{post.title}</a>
      <p>{post.excerpt}</p>
    </li>
  {/each}
</ul>

<style>
  h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-lg);
  }

  .post-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .post-list a {
    font-size: var(--text-lg);
    color: var(--color-accent);
    text-decoration: none;
  }

  .post-list a:hover {
    text-decoration: underline;
  }

  .post-list p {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    margin-block-start: var(--space-2xs);
  }
</style>
```

```svelte
<!-- src/routes/blog/[slug=slug]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/state';

  interface Post {
    slug: string;
    title: string;
    content: string;
    category: string;
  }

  const posts: Post[] = [
    { slug: 'getting-started-svelte', title: 'Getting Started with Svelte', content: 'Svelte is a compiler that turns declarative components into efficient JavaScript...', category: 'tech/svelte' },
    { slug: 'css-layers-explained', title: 'CSS Layers Explained', content: 'The @layer rule lets you declare explicit cascade layers...', category: 'tech/css' },
    { slug: 'design-tokens-guide', title: 'Design Tokens Guide', content: 'Design tokens are the single source of truth for your design system values...', category: 'design' }
  ];

  let post = $derived(posts.find((p) => p.slug === page.params.slug));
</script>

{#if post}
  <article class="post">
    <h1>{post.title}</h1>
    <p class="category">Category: {post.category}</p>
    <div class="content">{post.content}</div>
  </article>
{:else}
  <div class="not-found">
    <h1>Post not found</h1>
    <p>The post "{page.params.slug}" does not exist.</p>
    <a href="/blog">Back to blog</a>
  </div>
{/if}

<style>
  .post h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-sm);
  }

  .category {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-end: var(--space-lg);
  }

  .content {
    font-size: var(--text-base);
    line-height: 1.7;
    color: var(--color-text);
  }

  .not-found {
    text-align: center;
    padding-block: var(--space-2xl);
  }

  .not-found a {
    color: var(--color-accent);
  }
</style>
```

```svelte
<!-- src/routes/blog/category/[...path]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/state';

  let segments = $derived(page.params.path?.split('/') ?? []);
  let breadcrumb = $derived(
    segments.map((seg, i) => ({
      label: seg,
      href: '/blog/category/' + segments.slice(0, i + 1).join('/')
    }))
  );
</script>

<nav class="breadcrumb">
  <a href="/blog">Blog</a>
  {#each breadcrumb as crumb}
    <span class="separator">/</span>
    <a href={crumb.href}>{crumb.label}</a>
  {/each}
</nav>

<h1>Category: {segments.at(-1) ?? 'All'}</h1>
<p>Showing posts in {page.params.path}</p>

<style>
  .breadcrumb {
    display: flex;
    gap: var(--space-xs);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-end: var(--space-lg);
  }

  .breadcrumb a {
    color: var(--color-accent);
    text-decoration: none;
  }

  .separator {
    color: var(--color-border);
  }

  h1 {
    font-size: var(--text-2xl);
    text-transform: capitalize;
  }
</style>
```

### Explanation

Dynamic routes in SvelteKit use bracket notation: `[slug]` captures a single path segment, `[...path]` captures the rest of the URL. Param matchers add validation at the routing level — if the slug does not match, SvelteKit moves to the next route candidate or returns a 404. This is cleaner than validating inside the page. The rest parameter for categories enables arbitrarily nested category paths without defining a route for each depth level. At scale, you would move the post data to a load function (Module 9), but the routing patterns remain identical.
</details>
