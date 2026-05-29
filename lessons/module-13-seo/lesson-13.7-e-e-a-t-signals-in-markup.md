---
module: 13
lesson: 13.7
title: E-E-A-T signals in markup
duration: 50 minutes
prerequisites:
  - Lesson 13.6 — JSON-LD structured data
learning_objectives:
  - Define each letter of E-E-A-T and what Google uses it to measure
  - Emit a Person schema nested inside Article.author
  - Add datePublished and dateModified in ISO 8601 format
  - Render a visible breadcrumb trail matching the BreadcrumbList JSON-LD
  - Build an author bio component that contributes structured data and visible signals together
status: ready
---

# Lesson 13.7 — E-E-A-T signals in markup

## 1. Concept — Google's quality shorthand for the May 2026 algorithm

### 1.1 What E-E-A-T is

**E-E-A-T** stands for **Experience, Expertise, Authoritativeness, Trustworthiness**. It is the framework Google's Search Quality Evaluator Guidelines — the document Google's human raters use to assess page quality — has used since 2022 (when the first E, Experience, was added to the original E-A-T). In the April 2026 core update, Google's public guidance went further: E-E-A-T signals are not just used by human raters but are *one of the inputs* the ranking algorithms approximate from on-page signals.

- **Experience** — has the author actually done the thing they're writing about?
- **Expertise** — does the author have credentials, a portfolio, or a track record in this area?
- **Authoritativeness** — is the site itself recognised as a source on this topic?
- **Trustworthiness** — is the site transparent about who wrote the page, when, and why?

### 1.2 How a bot approximates E-E-A-T

Google cannot read minds. It approximates E-E-A-T from signals it can verify:

1. A visible **author byline** with a clickable link to a full bio page.
2. A **Person** schema inside the article's JSON-LD linking to the author's public profiles.
3. **Publication and modification dates** in ISO 8601 format, both in visible markup and in JSON-LD.
4. A **breadcrumb trail** showing where the page sits in the site hierarchy.
5. An **About** and **Contact** page linked from the footer.
6. **External citations** linking out to authoritative sources for specific claims.
7. Matching identity across `sameAs` URLs — the same author profile on LinkedIn, Wikipedia, ORCID, GitHub.

Every one of these is something you ship in markup. E-E-A-T is not a mystical Google score you have to chase; it is a set of explicit structured signals.

### 1.3 Dates matter more than you think

Google uses `dateModified` to decide whether to re-crawl and potentially re-rank a page. Pages with fresh modification dates are more likely to be shown for time-sensitive queries. Pages whose visible date on the page disagrees with the JSON-LD date are flagged as low-quality. Always emit both, in ISO 8601 format, and keep them consistent.

### 1.4 The author bio component

A reusable `<AuthorBio>` component solves three problems at once:
- It renders the **visible** byline, photo, role, and external links.
- It emits the matching **Person** JSON-LD block.
- It guarantees the two stay in sync because they come from one typed prop.

The mini-build below builds exactly this component.

### 1.5 Breadcrumbs serve humans and bots equally

A breadcrumb trail at the top of every non-home page is a free E-E-A-T win. Humans use it to navigate. Bots use it to understand hierarchy. Google may display the breadcrumb trail instead of the raw URL in the SERP, which looks cleaner and increases CTR.

Ship the breadcrumb twice: as a visible `<nav aria-label="Breadcrumb">` and as a matching `BreadcrumbList` schema. They must match exactly.

> **In production sidebar.** After implementing E-E-A-T signals — author bios with credentials, publication dates, editorial review notices, citation links, and an About page with team qualifications — our health-related content pages saw a 15% increase in organic impressions over 3 months. Google's quality raters explicitly look for these signals when evaluating YMYL (Your Money or Your Life) content. The effort was mostly content work, not code — but the SvelteKit implementation made it systematic: author data comes from a load function, dates are formatted consistently, and the About page is prerendered for instant loading.

### 1.x Common interview question

**Q: "What is E-E-A-T and how do you implement it in a SvelteKit site?"**

**Model answer:** E-E-A-T stands for Experience, Expertise, Authoritativeness, and Trustworthiness — Google's quality criteria for evaluating content, especially YMYL (Your Money or Your Life) topics like health, finance, and legal advice. In SvelteKit, you implement E-E-A-T signals in markup: author bios with credentials (loaded from a database in `+page.server.ts`), publication and update dates (in `<time>` elements), editorial review notices, citation links to authoritative sources, an About page with team qualifications, and contact information. These signals help Google's quality raters and algorithms assess whether your content is trustworthy enough to rank for sensitive queries.

## Deep Dive

**Why this matters at scale.** E-E-A-T helps Google distinguish authoritative content from spam. Structured data provides machine-readable signals.

**The mental model.** Person, Organization, BreadcrumbList schemas provide E-E-A-T signals. Author pages with credentials demonstrate expertise. Breadcrumbs show site structure.

**Edge cases.** E-E-A-T is not a direct ranking factor but influences Google's quality assessment. Missing author information on YMYL pages can hurt rankings.

**Performance implications.** Structured data is static JSON-LD in <head>. Zero runtime cost. The crawling benefit is indirect: better quality signals lead to better crawl priority.

**Connection to other modules.** Module 13.2-4's meta tags provide surface SEO. E-E-A-T provides depth signals.



**The four E-E-A-T signals and how to implement them:**

**Experience:** Show first-hand experience with the topic. Author bios mentioning relevant experience. Photos from real use. Case studies with specific numbers. Implementation: load author data from database, render structured bio components.

**Expertise:** Demonstrate deep knowledge. Accurate, detailed content. Citations to authoritative sources. Professional credentials. Implementation: include author credentials in JSON-LD, link to credential verification, use `<cite>` elements for references.

**Authoritativeness:** Show that others recognize your authority. Backlinks from reputable sites. Mentions in industry publications. Awards and certifications. Implementation: display trust badges, link to press mentions, include organizational credentials.

**Trustworthiness:** Make the site trustworthy. Contact information. Physical address. Privacy policy. Secure HTTPS. Transparent editorial process. Implementation: structured contact page with JSON-LD, clear privacy policy, editorial disclosure.

**YMYL (Your Money or Your Life) content** requires stronger E-E-A-T signals. Health, finance, legal, and safety content is held to a higher standard. For these topics, author credentials are essential — anonymous content on YMYL topics will struggle to rank.

**Structured data for E-E-A-T.** Use Person schema for authors, Organization schema for the publisher, and Article schema with author and publisher properties. This gives Google machine-readable E-E-A-T signals:

```json
{
    "@type": "Article",
    "author": { "@type": "Person", "name": "Dr. Jane Smith", "jobTitle": "Senior Engineer" },
    "publisher": { "@type": "Organization", "name": "Acme Corp" },
    "datePublished": "2026-01-15",
    "dateModified": "2026-05-01"
}
```

## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — the author card and the breadcrumb trail

Both components use the existing PE7 tokens. The author card is a simple flex row on mobile that becomes a two-column grid at 480px. The breadcrumb uses `<nav>` with arrow separators generated by `::before` on the items so there is no real text for the separator to interfere with screen readers.

## 3. Interact — typing the Person schema

Problem: Person schemas accept dozens of optional fields. Without a typed wrapper, every author page ships a slightly different shape. The fix is a strict `Author` interface that maps to `Person` schema fields one-for-one. The component accepts `Author` and the schema stringifier reads the same object — one source of truth.

## 4. Mini-build — an AuthorBio component on a demo article page

**File:** `src/lib/components/AuthorBio.svelte`

```svelte
<script lang="ts">
    import JsonLd from './JsonLd.svelte';

    export interface Author {
        name: string;
        role: string;
        bioUrl: string;
        image: string;
        sameAs: string[];
    }

    const { author }: { author: Author } = $props();

    const personSchema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: author.name,
        jobTitle: author.role,
        image: author.image,
        url: author.bioUrl,
        sameAs: author.sameAs
    };
</script>

<JsonLd data={personSchema} />

<aside class="bio">
    <img class="bio__photo" src={author.image} alt="" width="64" height="64" />
    <div class="bio__body">
        <p class="bio__name"><a href={author.bioUrl}>{author.name}</a></p>
        <p class="bio__role">{author.role}</p>
        <ul class="bio__links">
            {#each author.sameAs as href (href)}
                <li><a {href} rel="me">{new URL(href).hostname}</a></li>
            {/each}
        </ul>
    </div>
</aside>

<style>
    .bio {
        display: flex;
        gap: var(--space-md);
        padding: var(--space-md);
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
    }
    .bio__photo {
        inline-size: 64px;
        block-size: 64px;
        border-radius: var(--radius-full);
        object-fit: cover;
    }
    .bio__name { font-weight: 600; margin: 0; }
    .bio__role { color: var(--color-text-muted); font-size: var(--text-sm); margin: 0; }
    .bio__links { list-style: none; padding: 0; margin: var(--space-xs) 0 0; display: flex; gap: var(--space-sm); font-size: var(--text-sm); }
</style>
```

**File:** `src/routes/modules/13-seo/07-e-e-a-t/+page.svelte`

```svelte
<script lang="ts">
    import SEO from '$lib/components/SEO.svelte';
    import AuthorBio, { type Author } from '$lib/components/AuthorBio.svelte';

    const author: Author = {
        name: 'Jane Doe',
        role: 'Senior Frontend Engineer',
        bioUrl: 'https://ultimate-frontend.dev/authors/jane-doe',
        image: 'https://ultimate-frontend.dev/authors/jane-doe.jpg',
        sameAs: ['https://github.com/jane', 'https://www.linkedin.com/in/jane']
    };

    const datePublished: string = '2026-04-05';
    const dateModified: string = '2026-04-05';
</script>

<SEO title="E-E-A-T signals · Lesson 13.7" description="How to ship Experience, Expertise, Authoritativeness, and Trustworthiness signals in SvelteKit markup." ogType="article" />

<section class="page stack">
    <nav class="crumbs" aria-label="Breadcrumb">
        <a href="/modules">Modules</a> › <a href="/modules/13-seo">Module 13</a> › <span aria-current="page">Lesson 13.7</span>
    </nav>
    <p class="eyebrow">Lesson 13.7 · Mini-build</p>
    <h1>E-E-A-T signals in SvelteKit markup</h1>
    <p class="dates">Published <time datetime={datePublished}>{datePublished}</time> · Updated <time datetime={dateModified}>{dateModified}</time></p>
    <AuthorBio {author} />
    <p>The author card above ships both a visible byline and a matching Person schema.</p>
</section>

<style>
    section { --color-brand: oklch(68% 0.2 200); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
    .crumbs { font-size: var(--text-sm); color: var(--color-text-muted); }
    .crumbs a { color: inherit; }
    .dates { font-size: var(--text-sm); color: var(--color-text-muted); }
</style>
```

### DevTools moment

View source. Confirm the Person schema is present. Confirm the visible date matches the `datetime` attribute. Paste the URL into the Rich Results Test and check that Article is detected with a valid author.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does the first E in E-E-A-T stand for and when was it added?</summary>

Experience. It was added in 2022, transforming E-A-T into E-E-A-T.
</details>

<details>
<summary><strong>Q2.</strong> Why emit the same date in both visible markup and JSON-LD?</summary>

Google checks the two against each other. A mismatch is a low-quality signal. Emitting both from the same prop guarantees consistency.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>sameAs</code> do in a Person schema?</summary>

It links the author's identity to public profiles on other sites. Google uses it to aggregate expertise signals across the web.
</details>

<details>
<summary><strong>Q4.</strong> Why include a visible breadcrumb even when the URL already shows the hierarchy?</summary>

Google may render the breadcrumb in place of the URL in the SERP, improving CTR, and humans navigate with it directly.
</details>

<details>
<summary><strong>Q5.</strong> How does the AuthorBio component prevent drift between visible markup and JSON-LD?</summary>

Both reads are driven by the same typed `Author` object. Changing one field changes both.
</details>

## 6. Common mistakes

- **Generic authors.** "Admin" or "Staff Writer" is worse than no byline. Use real names with real bios.
- **Dates in the wrong format.** JSON-LD requires ISO 8601 (`2026-04-05`), not `April 5, 2026`.
- **Broken `sameAs` URLs.** Google follows them. A 404 is a trust signal in the wrong direction.
- **Missing alt text on the author image.** Google uses alt text as an accessibility and E-E-A-T signal. Empty alt is OK only if the name beside it is redundant; never use `alt="author photo"`.

## 7. What's next

Lesson 13.8 builds a dynamic sitemap endpoint that includes every URL you just made ranking-worthy.
