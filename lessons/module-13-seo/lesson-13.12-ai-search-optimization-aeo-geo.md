---
module: 13
lesson: 13.12
title: AI Search Optimization (AEO/GEO)
duration: 50 minutes
prerequisites:
  - Lesson 13.6 — JSON-LD
  - Lesson 13.7 — E-E-A-T
learning_objectives:
  - Define AEO and GEO and distinguish them from classic SEO
  - Identify query types that trigger AI Overviews in May 2026
  - Emit a FAQPage schema with question/answer pairs
  - Write content that AI engines are more likely to cite
  - Prioritise commercial/transactional intent pages for AEO
status: ready
---

# Lesson 13.12 — AI Search Optimization (AEO / GEO)

## 1. Concept — a new target next to Google's ten blue links

### 1.1 What AEO and GEO are

**AEO** — Answer Engine Optimization — is the practice of optimising a page so that AI answer engines (Google AI Overviews, ChatGPT with browsing, Perplexity, You.com, Bing Copilot) extract, synthesise, and **cite** your content when they answer a user's question. **GEO** — Generative Engine Optimization — is the same thing under a slightly different name, popularised in 2024 by academic research out of Princeton.

Classic SEO asks: how do I rank in the top ten blue links? AEO asks: how do I become one of the three citations under the AI-generated answer box that now appears *above* the blue links?

### 1.2 Why it matters in May 2026

Google rolled out AI Overviews (the successor to Search Generative Experience) to all US and most European markets by the end of 2025. By April 2026, Overviews trigger on an estimated 25–40% of informational queries. When an Overview appears, click-through rates on the organic results below it drop substantially — but clicks on the citations *inside* the Overview become disproportionately valuable. If your page is cited, you get the traffic that would otherwise have gone to the first five organic results combined.

### 1.3 Query types that trigger Overviews (and therefore deserve AEO)

Not every query triggers an Overview. Google's system currently favours:

- **How-to questions.** "How do I configure a SvelteKit sitemap?"
- **Definitional questions.** "What is E-E-A-T?"
- **Comparative questions.** "SvelteKit vs Next.js for SEO"
- **Listicle questions.** "Best frameworks for mobile-first web apps"

Transactional queries ("buy nike air max size 11") and navigational queries ("twitter login") rarely trigger Overviews in 2026. **Prioritise AEO effort on informational and comparative pages**; keep classic SEO tactics on transactional pages.

### 1.4 What AI engines look for

Research in 2024–2025 and Google's own public statements have converged on six tactical signals:

1. **Explicit, extractable answers early in the page.** A one-sentence answer in the first paragraph, followed by the nuance. AI engines lift that sentence as the extract.
2. **Structured headings that match the question.** An `<h2>` that reads "What is E-E-A-T?" performs better than one that reads "The Framework Google Uses."
3. **FAQPage JSON-LD.** A direct gift to the extraction layer.
4. **Clear citations to authoritative sources.** AI engines prefer to cite pages that themselves cite their sources.
5. **Topical depth.** A site with twenty pages on SvelteKit SEO outranks a site with one long page on every web framework.
6. **Freshness with a reason.** `dateModified` combined with a visible "Last updated" note that explains what changed.

### 1.5 Depth over breadth

A site that covers twenty things superficially loses to a site that covers five things exhaustively. AI engines trust topical authority. The April 2026 core update doubled down on this — sites that had drifted into covering unrelated topics for traffic were penalised.

For this course, the capstone's scoped domain (one PE7 marketing site + dashboard) is itself an AEO play. Twenty pages about one topic outrank fifty pages about everything.

### 1.6 Writing content that AI engines want to cite

AI engines extract content differently from traditional crawlers. They look for:

- **Definitional sentences.** "X is Y" patterns at the start of a section. An AI generating an answer to "What is AEO?" will lift a sentence that starts "AEO is..." directly.
- **Lists and tables.** Structured information is easier for AI to extract and reformat than flowing prose. Use bullet points for features, tables for comparisons.
- **Source citations.** Pages that cite other authoritative sources are themselves considered more trustworthy. Link to research, official documentation, and primary sources.
- **Recency signals.** A visible "Last updated: 2026-04-15" with a `dateModified` in the schema tells AI engines this information is current. Stale pages lose citation priority.
- **First-person expertise.** "In our testing of 50 SvelteKit deployments..." signals original research, which AI engines prefer over content that merely summarizes other sources.

### 1.7 The relationship between AEO and traditional SEO

AEO does not replace SEO — it extends it. Every AEO technique *also* helps traditional ranking:

- Structured headings improve SEO passage indexing.
- FAQ schema creates rich snippets in traditional results.
- Clear definitional answers improve featured snippet likelihood.
- Topical depth builds domain authority for link-based ranking.
- Fast, accessible pages (Core Web Vitals) are required for both AI Overview inclusion and traditional ranking.

The only AEO-specific technique that has no traditional SEO benefit is optimizing for citation format — making your content "quotable" in a way that AI engines prefer to extract. This is a bonus, not a trade-off.

### 1.x What AI systems do under the hood — how AI Overviews select cited sources

Google's AI Overviews and similar AI search features (Perplexity, Bing Chat) select cited sources through:

1. **Content quality signals:** E-E-A-T factors (author credentials, publication authority, content depth).
2. **Structured data:** JSON-LD structured data helps AI systems understand what a page is about and extract key facts.
3. **Clear, factual writing:** AI systems prefer content that states facts directly rather than burying them in marketing language.
4. **Heading structure:** Well-organized H2/H3 headings help AI systems extract specific answers to specific questions.
5. **FAQ markup:** FAQPage JSON-LD gives AI systems pre-structured question-answer pairs to cite.
6. **Freshness:** Recent publication dates (from `<time>` elements or `dateModified` in JSON-LD) favor newer content.

To optimize for AI citation, write content that directly answers common questions, structure it with clear headings, include FAQ sections with JSON-LD markup, and maintain E-E-A-T signals.

> **In production sidebar.** After implementing AEO (Answer Engine Optimization) on our technical documentation — adding FAQ JSON-LD, restructuring content around common questions, and ensuring every page has a direct answer in the first paragraph — we saw our content cited in Google AI Overviews for 12 different queries within 2 months. Each AI Overview citation drives traffic because users click through for the full article. The optimization was primarily content restructuring, not code — but SvelteKit's load functions and JSON-LD component made the structured data implementation systematic.

### 1.x Common interview question

**Q: "What is AEO (Answer Engine Optimization) and how does it differ from traditional SEO?"**

**Model answer:** AEO optimizes content for AI-powered search systems (Google AI Overviews, Perplexity, Bing Chat) that extract and cite information directly in their responses. Traditional SEO focuses on ranking URLs in a list of blue links. AEO focuses on being cited as a source in AI-generated answers. The techniques overlap but differ in emphasis: AEO prioritizes direct answers to questions (AI systems extract clear, factual statements), FAQ-structured content with JSON-LD markup (AI systems can identify Q&A pairs), and E-E-A-T signals (AI systems prefer authoritative sources). In SvelteKit, implement AEO by structuring content around questions, using FAQPage JSON-LD, and ensuring every page has a clear, direct answer in its first paragraph or section.

## Deep Dive

**Why this matters at scale.** AI Overviews now appear on 25-40% of informational queries. For sites that depend on organic search traffic for revenue (blogs, SaaS documentation, e-commerce guides), losing visibility in Overviews means losing traffic to competitors who are cited instead. Conversely, being cited in an AI Overview can produce traffic equivalent to a top-3 organic ranking — from a single well-structured page. For a 20-page content site, optimizing the top 5 pages for AEO can produce measurable traffic increases within weeks of the pages being recrawled.

**The mental model.** Traditional SEO is like placing an ad in a newspaper's classifieds section — you want your listing to appear when someone searches. AEO is like being quoted in the newspaper's editorial section — the journalist (AI engine) writes the article, and your content is one of the sources they cite. Being quoted is more valuable than being listed because readers trust editorial citations more than classified ads. To be quote-worthy, your content must be authoritative, specific, clearly structured, and directly answer the question the journalist (AI) is addressing.

**Edge cases.** AI Overviews can cite content that contradicts other cited sources — they synthesize, not just extract. This means your page might be cited alongside a competitor with a different opinion. Ensure your content is clearly attributed (author name, credentials, methodology) so the AI can accurately represent your position. Another edge case: AI engines may paraphrase rather than quote directly. Your structured data (JSON-LD) and clear formatting increase the chances of accurate extraction, but you cannot control how the AI ultimately presents your information. Focus on being the best source, not on controlling the output.

**Performance implications.** AEO has zero direct performance cost — it is a content strategy, not a technical implementation. The technical implementations (FAQPage schema, structured headings, dateModified meta) are all zero-cost additions to the HTML. The indirect performance consideration: AI engines (like Google) penalize slow pages in their source selection. A page with poor Core Web Vitals is less likely to be cited in an AI Overview than an identical page with good scores. This means Module 12's performance optimizations directly support AEO success.

**Connection to other modules.** AEO builds on Module 8 (SSR — AI engines read the HTML, not JavaScript-rendered content), Module 13 Lesson 13.6 (JSON-LD — FAQPage schema is the primary AEO signal), Module 13 Lesson 13.7 (E-E-A-T — expertise signals increase citation likelihood), and Module 12 (Core Web Vitals — fast pages are preferred sources). The capstone project includes an FAQ section with FAQPage schema, structured headings that match target queries, and visible freshness signals — a complete AEO implementation.


## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — the FAQ section as a component

The mini-build is a page with a visible FAQ accordion that doubles as FAQPage schema. The accordion uses `<details>` / `<summary>` — accessible by default, no JS needed, and the plain text inside is fully indexable. PE7 tokens give it the open/closed visual states.

## 3. Interact — typing the FAQPage schema

Problem: FAQPage schema expects a specific shape — `mainEntity` is an array of `Question` objects, each with a nested `acceptedAnswer` of type `Answer`. One typo in the property names disables the rich result. The fix is a typed `FaqItem` interface shared between the visible accordion and the JSON-LD stringifier — the pattern you now see repeatedly in Module 13.

## 4. Mini-build — a FAQ page that doubles as AEO fuel

**File:** `src/routes/modules/13-seo/12-aeo-geo/+page.svelte`

```svelte
<script lang="ts">
    import SEO from '$lib/components/SEO.svelte';
    import JsonLd from '$lib/components/JsonLd.svelte';

    interface FaqItem {
        question: string;
        answer: string;
    }

    const faqs: FaqItem[] = [
        {
            question: 'What is AEO?',
            answer:
                'AEO stands for Answer Engine Optimization — the practice of structuring content so AI answer engines cite it in generated summaries.'
        },
        {
            question: 'How is AEO different from SEO?',
            answer:
                'Classic SEO targets the ten blue links. AEO targets the three citations inside the AI Overview above them.'
        },
        {
            question: 'Which queries trigger AI Overviews in May 2026?',
            answer:
                'Informational, how-to, definitional, and comparative queries trigger Overviews most often. Transactional and navigational queries rarely do.'
        }
    ];

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer }
        }))
    };
</script>

<SEO
    title="AEO and GEO · Lesson 13.12"
    description="How to structure pages so AI answer engines extract and cite your content — FAQPage schema, explicit answers, topical depth."
/>
<JsonLd data={faqSchema} />

<section class="page stack">
    <p class="eyebrow">Lesson 13.12 · Mini-build</p>
    <h1>FAQ that doubles as AEO fuel</h1>
    <p>
        Every question below is an extractable answer for an AI engine and a rich-result
        candidate for Google at the same time.
    </p>
    <ul class="faq">
        {#each faqs as item (item.question)}
            <li>
                <details>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                </details>
            </li>
        {/each}
    </ul>
</section>

<style>
    section { --color-brand: oklch(68% 0.2 330); }
    .eyebrow { font-size: var(--text-sm); color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; }
    .faq { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-sm); }
    .faq details {
        padding: var(--space-md);
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
    }
    .faq summary { font-weight: 600; cursor: pointer; min-block-size: 44px; display: flex; align-items: center; }
    .faq p { margin-block-start: var(--space-sm); color: var(--color-text-muted); }
</style>
```

### DevTools moment

Paste the URL into the Rich Results Test — confirm FAQPage is detected. View source and find the JSON-LD block. Test the accordion keyboard behaviour (Enter/Space toggles).

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between AEO and classic SEO?</summary>

Classic SEO optimises for ranking in the ten blue links. AEO optimises for being cited inside AI-generated answer boxes that appear above them.
</details>

<details>
<summary><strong>Q2.</strong> Which query types trigger AI Overviews most in May 2026?</summary>

Informational, how-to, definitional, and comparative queries.
</details>

<details>
<summary><strong>Q3.</strong> Why does FAQPage schema help AEO?</summary>

It gives AI engines a clean, typed list of question/answer pairs they can extract and cite.
</details>

<details>
<summary><strong>Q4.</strong> Why prioritise depth over breadth for AEO?</summary>

AI engines reward topical authority. Twenty pages on one topic beat fifty pages across unrelated topics.
</details>

<details>
<summary><strong>Q5.</strong> What visible signal pairs with <code>dateModified</code> for freshness?</summary>

A visible "Last updated" note that briefly explains what changed in the most recent edit.
</details>

## 6. Common mistakes

- **Stuffing FAQ items with unrelated questions.** AI engines detect padding.
- **Hiding the answer behind JavaScript.** Extraction happens on the SSR HTML.
- **Writing vague one-line answers.** Extract-worthy answers are specific, concrete, and immediately useful.
- **Ignoring FAQPage schema validity.** One missing `acceptedAnswer` field disables the whole rich result.

## 7. What's next

Lesson 13.13 handles the unglamorous but essential housekeeping: trailing slashes, redirects, and canonical URLs.
