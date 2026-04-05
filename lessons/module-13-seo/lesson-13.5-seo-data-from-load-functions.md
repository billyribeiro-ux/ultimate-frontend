---
module: 13
lesson: 13.5
title: SEO data from load() functions
duration: 45 minutes
prerequisites:
  - Module 9A — load() and $types
  - Lesson 13.3 — typed SEO component
learning_objectives:
  - Return typed SEO data from +page.server.ts and consume it in +layout.svelte
  - Merge layout-level defaults with page-level overrides via $page.data
  - Type the merged data with a shared SEOData interface
  - Fetch a blog post's metadata and turn it into SEO tags in a single round trip
  - Explain why SEO data should come from the server, not the client
status: ready
---

# Lesson 13.5 — SEO data from `load()` functions

## 1. Concept — the data flow that makes dynamic pages rank

### 1.1 The problem: static strings do not scale

Lesson 13.3 hard-coded a title and description inside each `+page.svelte`. That is fine for six lesson pages. It is catastrophic for a real app with a thousand blog posts, ten thousand products, or a hundred thousand user profiles, each of which needs its own unique title, description, and OG image.

Dynamic pages need **dynamic SEO**. The title of `/blog/[slug]` depends on the slug. The description depends on the post body. The OG image depends on whatever hero image the author uploaded. None of those can be hard-coded; all of them must come from data that is fetched at request time.

### 1.2 The single correct flow: server load → page data → layout head

SvelteKit's `load()` function is the single correct place for SEO data. A `+page.server.ts` (or `+page.ts`) returns a typed object containing the data for the page *and* the SEO metadata for the page. The root `+layout.svelte` reads `page.data.seo` and pipes it into the `<SEO>` component. Every page automatically gets its metadata rendered in the head without having to import or call the component itself.

```
+page.server.ts ─► returns { seo: { title, description, … }, post }
                                     │
                                     ▼
+layout.svelte reads page.data.seo ─► <SEO {...page.data.seo} />
+page.svelte reads page.data.post ──► <article>…</article>
```

This pattern has three wins. **Single source of truth**: SEO lives next to the data that produced it. **Type safety**: the same `SEOData` interface is shared between the load function, the layout, and the component. **No accidental omissions**: if a page returns no `seo` field, a default from a shallower layout kicks in.

### 1.3 Typing the contract

Place the shared interface in `$lib/types/seo.ts` so every `load()` function imports it:

```ts
// $lib/types/seo.ts
export interface SEOData {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article';
    noindex?: boolean;
}
```

Every `load()` function either returns `{ seo: SEOData }` or returns nothing and inherits from a shallower layout. TypeScript will catch the moment you forget.

### 1.4 Server vs universal: which `load()` runs SEO?

- `+page.server.ts` runs **only on the server**. Use it when the SEO data depends on database rows, environment secrets, or anything else not safe in the browser.
- `+page.ts` runs on **both server and client**. Use it for SEO data derived from a public API that can be fetched equally from both.

For most apps, `+page.server.ts` is the safer default. The crawler gets the SEO data on the first byte either way, but the server version guarantees you never leak a private field into a client bundle.

### 1.5 The merge semantics

SvelteKit gives every page access to every parent layout's data via `page.data`. If the root layout returns a default `seo` object and a page returns its own, the page's version replaces the default key-by-key. You can either do a full replace (the simple approach — the page sends a complete `seo` object) or a shallow merge (the layout reads both and spreads them). The mini-build below uses the full replace because it is the harder-to-get-wrong pattern.

## 2. Style it — no new styles, pure data flow

This lesson's mini-build renders a blog post snippet using data from the server. The existing PE7 tokens cover everything. Focus on *where* the data is coming from, not how it looks.

## 3. Interact — typed data across three files

Problem: three files have to agree on a single shape — the server load, the layout consumer, and the page renderer. If any of them drifts, the others break silently. The fix is a single shared `SEOData` interface imported in all three. This is the purest use of TypeScript in Module 13: one source of truth, three consumers, zero drift.

## 4. Mini-build — a fake blog post rendered with server-sourced SEO

**File:** `src/lib/types/seo.ts`

```ts
export interface SEOData {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article';
    noindex?: boolean;
}
```

**File:** `src/routes/modules/13-seo/05-load-seo/+page.server.ts`

```ts
import type { PageServerLoad } from './$types';
import type { SEOData } from '$lib/types/seo';

interface Post {
    slug: string;
    title: string;
    excerpt: string;
    body: string;
    coverImage: string;
}

export const load: PageServerLoad = async () => {
    // In a real app this would hit a database or CMS.
    const post: Post = {
        slug: 'why-load-seo',
        title: 'Why SEO data belongs in load()',
        excerpt:
            'Hard-coded titles and descriptions do not scale past six pages. load() is the only sustainable place for SEO metadata in SvelteKit.',
        body: 'Full article body would live here. The SEO tags above came from this same server round trip.',
        coverImage: 'https://ultimate-frontend.dev/og/why-load-seo.png'
    };

    const seo: SEOData = {
        title: `${post.title} · Ultimate Frontend`,
        description: post.excerpt,
        ogImage: post.coverImage,
        ogType: 'article'
    };

    return { post, seo };
};
```

**File:** `src/routes/modules/13-seo/05-load-seo/+page.svelte`

```svelte
<script lang="ts">
    import SEO from '$lib/components/SEO.svelte';
    import type { PageData } from './$types';

    const { data }: { data: PageData } = $props();
</script>

<SEO {...data.seo} />

<section class="page stack">
    <p class="eyebrow">Lesson 13.5 · Mini-build</p>
    <h1>{data.post.title}</h1>
    <p class="lede">{data.post.excerpt}</p>
    <article>{data.post.body}</article>
    <p class="muted">
        Everything in the head — title, description, OG image — came from the same load()
        function that produced this article body.
    </p>
</section>

<style>
    section { --color-brand: oklch(68% 0.2 130); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
    .lede { font-size: var(--text-lg); color: var(--color-text-muted); }
    .muted { color: var(--color-text-muted); font-size: var(--text-sm); }
</style>
```

### DevTools moment

View source. Confirm the title matches `post.title` and the OG image matches `post.coverImage`. Edit the server file to change `post.title` and reload — the head updates immediately. That is the data flow earning its keep.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between <code>+page.server.ts</code> and <code>+page.ts</code> for SEO?</summary>

`+page.server.ts` runs only on the server; `+page.ts` runs on both. Use the server version when SEO depends on secrets or private data; use the universal version when the data is public and fetching it from the client is safe.
</details>

<details>
<summary><strong>Q2.</strong> Why put the SEO component in the root layout instead of every page?</summary>

So every page automatically emits SEO tags by reading `page.data.seo` without having to import the component. It also centralises defaults.
</details>

<details>
<summary><strong>Q3.</strong> Why share a single <code>SEOData</code> interface across files?</summary>

To guarantee the load function, the layout, and the component all agree on the same shape. TypeScript catches drift at build time instead of silently shipping wrong metadata.
</details>

<details>
<summary><strong>Q4.</strong> What happens if a page returns no <code>seo</code> field?</summary>

It inherits the parent layout's `seo` field via `page.data`. That is why the root layout should always provide a default.
</details>

<details>
<summary><strong>Q5.</strong> Why fetch SEO data on the server instead of in <code>$effect</code>?</summary>

`$effect` runs only after hydration. The HTML sent to Googlebot would contain no title or description. Fetching in `load()` puts the tags in the first byte.
</details>

## 6. Common mistakes

- **Returning `seo` as an untyped object.** Without the shared interface, drift is inevitable.
- **Fetching SEO data in `onMount`.** Same problem as client-only content — invisible to crawlers.
- **Forgetting to destructure `data` from `$props()`.** `data` is the top-level prop; reach `seo` via `data.seo`.
- **Merging `seo` in the component instead of the layout.** Keep merging logic in one place; the layout is the correct place.

## 7. What's next

Lesson 13.6 adds JSON-LD structured data — Google's rich-results pipeline — on top of the load-based flow you just built.
