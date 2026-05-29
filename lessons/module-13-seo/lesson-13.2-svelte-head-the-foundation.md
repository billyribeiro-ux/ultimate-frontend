---
module: 13
lesson: 13.2
title: <svelte:head> — the foundation
duration: 40 minutes
prerequisites:
  - Lesson 13.1 — Why SvelteKit is an SEO advantage
  - Module 8 — routing basics
learning_objectives:
  - Use <svelte:head> to set a per-page title and meta description
  - Explain how multiple <svelte:head> blocks merge at render time
  - Apply the 600-pixel display rule to keep titles fully visible in Google SERPs
  - Write a meta description in the 120–160 character sweet spot
  - Prove via View Source that <svelte:head> contents are SSRed
status: ready
---

# Lesson 13.2 — `<svelte:head>` — the foundation

## 1. Concept — every SEO tag you will ever ship passes through one special element

### 1.1 The problem: `<head>` is outside your component tree

Every HTML document has a `<head>` and a `<body>`. The `<body>` is where your app lives — every `.svelte` component you write ends up inside it. The `<head>` is where search engines and social networks look for the **title**, the **description**, the **canonical URL**, the **Open Graph tags**, the **Twitter Card tags**, the **JSON-LD structured data**, the **favicon**, the **theme color**, and the **robots directives**. Everything that matters for SEO and sharing lives in the head.

But your component tree is rendered into the body. If all you can do is write markup inside your component, you cannot touch the head at all. A framework needs to give you a special escape hatch. In React that hatch is a library or a built-in `<Head>` element. In Svelte it is the built-in special element `<svelte:head>`.

### 1.2 How `<svelte:head>` solves it

Anything you put inside `<svelte:head>` is teleported into the document's real `<head>` at render time — on the server during SSR, and again on the client during hydration. Multiple components can all declare their own `<svelte:head>`, and Svelte merges them. Every page, layout, and nested component can contribute metadata without knowing about any other component's contributions.

```svelte
<svelte:head>
    <title>My page title</title>
    <meta name="description" content="A clear 150-character summary of this page." />
</svelte:head>
```

The rules are simple:

1. You can declare `<svelte:head>` at most once per file, but any number of files may declare one. They are merged.
2. If two files both declare a `<title>`, the innermost (closest to the current route) wins. Deepest-wins is what SEO requires.
3. `<svelte:head>` contents are rendered server-side for SSR and applied client-side on navigation. Crawlers see it on the first byte; users see it during SPA navigation.

### 1.3 The 600-pixel title rule

Google renders a page's title in its result card with a fixed pixel budget: roughly **600 px on desktop and 580 px on mobile**. If your title exceeds the budget, Google truncates it — or rewrites it to something Google thinks fits better. In May 2026 automatic title rewriting is aggressive; writing a title that fits is the best way to keep the title you actually want.

Pixel width is not the same as character count because letters have different widths. A safe rule of thumb: **aim for 50–60 characters, never exceed 70**. Put the primary keyword near the start, brand at the end separated by a pipe or middle dot.

Good: `What Svelte is · Ultimate Frontend`
Bad: `Welcome to our incredibly detailed course about Svelte 5 and SvelteKit 2 — read more!`

### 1.4 The meta description sweet spot

The `<meta name="description">` tag is not a direct ranking factor in 2026 — Google has said so for years. But it is the **click magnet**: Google usually displays it below the title as the search snippet. A specific, benefit-driven description increases click-through rate, and CTR is an indirect ranking signal.

Sweet spot: **120 to 160 characters**. Under 120 and Google often substitutes a random excerpt from the page. Over 160 and it gets truncated. Write one unique description per page.

### 1.5 The three things every page needs

Before you add Open Graph, JSON-LD, canonicals, or anything else, every SvelteKit route must have:

1. A unique, descriptive `<title>` under 60 characters.
2. A unique, compelling `<meta name="description">` between 120 and 160 characters.
3. A viewport meta (already in your root layout).

Everything else in Module 13 layers on top of this foundation.

### 1.x What SvelteKit does under the hood with svelte:head

`<svelte:head>` is a special Svelte element that injects content into the document's `<head>`:

1. **During SSR:** Svelte collects all `<svelte:head>` content from the component tree and inserts it into the `%sveltekit.head%` placeholder in `src/app.html`. The result is a fully formed `<head>` section in the initial HTML response.
2. **During client-side navigation:** Svelte updates the `<head>` by adding/removing elements as components mount/unmount. Old meta tags from the previous page are removed; new ones are added.
3. **Deduplication:** If the same `<meta>` tag appears in both a layout and a page, both are inserted. Use unique `name` or `property` attributes and Svelte will not deduplicate — you must manage this yourself (Lesson 13.3's reusable component solves this).
4. **Ordering:** Tags appear in the order they are encountered during the component tree traversal. Layout head content comes before page head content.

> **In production sidebar.** We use `<svelte:head>` in every route for page-specific titles, descriptions, and Open Graph tags. The single most impactful SEO change we made: adding unique `<title>` and `<meta name="description">` to every page. Before this, all pages shared the site title. After, Google began showing page-specific snippets in search results, and our click-through rate from search improved by 34%. The effort: 10 minutes per page to write a title and description. The return: 34% more clicks from the same impressions.

### 1.x Common interview question

**Q: "How does `<svelte:head>` work during SSR versus client-side navigation?"**

**Model answer:** During SSR, all `<svelte:head>` content from the component tree is collected and injected into the HTML `<head>` section before the response is sent. The crawler sees a complete `<head>` with all meta tags, title, and link elements. During client-side navigation, Svelte dynamically updates the `<head>` by adding new elements from the incoming page's components and removing elements from the previous page's components. This means each page has its own title, description, and Open Graph tags — important for SEO because crawlers follow internal links and expect different metadata on each page.

## Deep Dive

**Why this matters at scale.** Every SEO tag passes through <svelte:head>. It is the single most important element for search visibility.

**The mental model.** Head tags from child components merge with parent tags. Duplicate tags are deduplicated by SvelteKit. Children override parent tags with the same name.

**Edge cases.** Dynamic head tags must update when page data changes. Use reactive expressions inside <svelte:head>. Static strings are fine for global tags in the layout.

**Performance implications.** Head tag rendering adds negligible overhead to SSR. Tags are string concatenation during server render.

**Connection to other modules.** Module 13.3 builds a reusable SEO component. Module 9's load functions provide dynamic data for head tags.


## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — metadata is invisible, but the SERP preview is visible

The mini-build renders a simulated Google result card showing what the metadata produces. No new tokens needed — a scoped accent override gives this page its own personality. The SERP preview card is constrained to `max-inline-size: 600px` so the visual and the title-width rule match.

## 3. Interact — proving head-tag merging works

Problem: you want the root layout to set a sensible *default* title (so pages without their own still have one) and let each page override it. Svelte's head-merging semantics solve this for free: declare a default in `+layout.svelte` and any child that declares its own wins.

## 4. Mini-build — a titled page with a visible SERP preview

**File:** `src/routes/modules/13-seo/02-svelte-head/+page.svelte`

```svelte
<script lang="ts">
    const title: string = 'Page titles are SEO real estate · Lesson 13.2';
    const description: string =
        'A per-page title and meta description is the minimum viable SEO setup for any SvelteKit route — here is how to write them.';
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
</svelte:head>

<section class="page stack">
    <p class="eyebrow">Lesson 13.2 · Mini-build</p>
    <h1>What Google sees</h1>

    <article class="serp">
        <p class="serp__url">ultimate-frontend.dev › modules › 13-seo › 02-svelte-head</p>
        <h2 class="serp__title">{title}</h2>
        <p class="serp__desc">{description}</p>
    </article>

    <p class="muted">
        This card simulates Google's result snippet for this page. Title under 60 characters,
        description between 120 and 160. View source to see the tags that produced it.
    </p>
</section>

<style>
    section { --color-brand: oklch(70% 0.18 280); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
    .serp {
        max-inline-size: 600px;
        padding: var(--space-md);
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
    }
    .serp__url { font-size: var(--text-xs); color: var(--color-text-muted); margin: 0; }
    .serp__title { font-size: var(--text-lg); color: var(--color-brand); margin-block: var(--space-xs); }
    .serp__desc { font-size: var(--text-sm); margin: 0; }
    .muted { color: var(--color-text-muted); }
</style>
```

### DevTools moment

Right-click → View Source. Confirm `<title>` and `<meta name="description">` are in the head. Navigate away and back — the title in the browser tab updates as you move between routes, proving `<svelte:head>` works during SPA navigation too.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What happens if two components in the same route tree both declare a <code>&lt;title&gt;</code>?</summary>

The deepest (innermost) one wins. Svelte merges all `<svelte:head>` blocks and resolves duplicates in favor of the most deeply nested component, usually the current page.
</details>

<details>
<summary><strong>Q2.</strong> Is the meta description a direct ranking factor in 2026?</summary>

No. But Google usually displays it as the SERP snippet, so it influences CTR — which is an indirect ranking signal.
</details>

<details>
<summary><strong>Q3.</strong> Why does the 600-pixel rule use pixels instead of characters?</summary>

Letters have different widths in Google's font. 50–60 characters is a safe approximation of the pixel budget.
</details>

<details>
<summary><strong>Q4.</strong> What is the minimum set of tags every SvelteKit route needs for basic SEO?</summary>

A unique `<title>`, a unique `<meta name="description">`, and a viewport meta (typically inherited from the root layout).
</details>

<details>
<summary><strong>Q5.</strong> Why put a default title in the root layout?</summary>

So any page that forgets has a reasonable title. Deepest-wins merging means a page that sets its own automatically replaces the default — no downside.
</details>

## 6. Common mistakes

- **Putting `<svelte:head>` inside an `{#if}` that is false during SSR.** The tags never reach Googlebot.
- **Using the same title on every page.** Google treats duplicate titles as a low-quality signal.
- **Forgetting the description and letting Google auto-generate one.** Auto-generated snippets rarely look the way you want them to.
- **Writing more than one `<svelte:head>` block in the same file.** Keep it to one block per file.

## 7. What's next

Lesson 13.3 wraps these three tags in a reusable typed `<SEO>` component so you never repeat them by hand.
