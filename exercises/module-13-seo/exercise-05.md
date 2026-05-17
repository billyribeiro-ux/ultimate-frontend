---
module: 13
exercise: 5
title: AI Search Optimization
difficulty: principal
estimated_time: 60
skills_tested:
  - semantic HTML
  - content structure
  - entity markup
  - LLM-readable patterns
---

# Exercise 13.5 — AI Search Optimization

## Brief

Build a product page optimized for both traditional search engines and AI-powered search (Google AI Overviews, Perplexity, ChatGPT search). The page uses semantic HTML, structured data, and clear content hierarchy that AI models can extract and cite accurately.

## Requirements

1. Create `src/routes/products/[slug]/+page.svelte` with a product detail page
2. Use semantic HTML elements: `<article>`, `<header>`, `<section>`, `<aside>`, `<footer>`, `<dl>` for specs
3. Add JSON-LD with `Product` schema including `name`, `description`, `price`, `availability`, `brand`, `review`, and `aggregateRating`
4. Add FAQ section using `<details>`/`<summary>` with `FAQPage` JSON-LD schema
5. Include breadcrumb navigation with `BreadcrumbList` JSON-LD
6. Every heading must follow a strict h1 > h2 > h3 hierarchy (no skipping levels)
7. Key facts (price, availability, rating) must be in both visible HTML and structured data
8. Add a "Sources" section with outbound links demonstrating E-E-A-T signals
9. Create an invisible `<meta>` description that concisely answers "What is this product?"

## Constraints

- No JavaScript-rendered content — all critical information must be in the initial HTML
- Heading hierarchy must be perfect (h1 > h2 > h3, no skips)
- All structured data must validate against Schema.org
- The page must be prerenderable (`export const prerender = true`)
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

AI search engines extract information from clear semantic HTML. Use `<dl>` for key-value pairs (specs), `<details>` for FAQs, and `<article>` for the main content. JSON-LD provides machine-readable context that AI models use to generate citations.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Combine three JSON-LD blocks: `Product` for the item details, `FAQPage` for the FAQ section, and `BreadcrumbList` for the navigation path. Each helps different AI features: Product schema enables price comparisons, FAQ schema enables featured snippets, and breadcrumbs enable navigation understanding.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(productJsonLd)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>`}
</svelte:head>

<nav aria-label="Breadcrumb">
  <ol><li><a href="/">Home</a></li><li><a href="/products">Products</a></li><li>{product.name}</li></ol>
</nav>

<article>
  <header><h1>{product.name}</h1></header>
  <section aria-labelledby="specs"><h2 id="specs">Specifications</h2><dl>...</dl></section>
  <section aria-labelledby="faq"><h2 id="faq">FAQ</h2>...</section>
</article>
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/routes/products/[slug]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = true;

interface Product {
  slug: string;
  name: string;
  brand: string;
  description: string;
  longDescription: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock';
  rating: number;
  reviewCount: number;
  specs: { label: string; value: string }[];
  faqs: { question: string; answer: string }[];
}

const products: Product[] = [
  {
    slug: 'svelte-starter-kit',
    name: 'Svelte 5 Starter Kit',
    brand: 'Ultimate Frontend',
    description: 'A complete project template for building production Svelte 5 applications with TypeScript, PE7 styling, and SvelteKit.',
    longDescription: 'The Svelte 5 Starter Kit includes a pre-configured SvelteKit project with TypeScript strict mode, the PE7 design token system, GSAP integration, and deployment configurations for Node.js, static hosting, and serverless platforms. It is designed for professional frontend developers who want to ship production-quality applications from day one.',
    price: 49.99,
    currency: 'USD',
    availability: 'InStock',
    rating: 4.8,
    reviewCount: 124,
    specs: [
      { label: 'Framework', value: 'Svelte 5 + SvelteKit' },
      { label: 'Language', value: 'TypeScript (strict)' },
      { label: 'Styling', value: 'PE7 token system + OKLCH' },
      { label: 'Animation', value: 'GSAP 3 + Svelte transitions' },
      { label: 'Testing', value: 'Vitest + Playwright' },
      { label: 'License', value: 'MIT' }
    ],
    faqs: [
      { question: 'What Svelte version does this use?', answer: 'The Starter Kit uses Svelte 5 with runes ($state, $derived, $effect) and TypeScript strict mode enabled.' },
      { question: 'Can I use this for commercial projects?', answer: 'Yes. The MIT license allows unrestricted commercial use, modification, and distribution.' },
      { question: 'Does it include deployment configuration?', answer: 'Yes. Configurations for adapter-node, adapter-static, and adapter-auto are included with environment variable templates.' }
    ]
  }
];

export const load: PageLoad = ({ params }) => {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) error(404, 'Product not found');
  return { product };
};
```

```svelte
<!-- src/routes/products/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const product = data.product;
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency });

  const productJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount
    }
  });

  const faqJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: product.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer }
    }))
  });

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ultimate-frontend.dev/' },
      { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://ultimate-frontend.dev/products' },
      { '@type': 'ListItem', position: 3, name: product.name }
    ]
  });
</script>

<svelte:head>
  <title>{product.name} — {product.brand}</title>
  <meta name="description" content={product.description} />
  {@html `<script type="application/ld+json">${productJsonLd}</script>`}
  {@html `<script type="application/ld+json">${faqJsonLd}</script>`}
  {@html `<script type="application/ld+json">${breadcrumbJsonLd}</script>`}
</svelte:head>

<div class="product-page">
  <nav aria-label="Breadcrumb" class="breadcrumb">
    <ol>
      <li><a href="/">Home</a></li>
      <li><a href="/products">Products</a></li>
      <li aria-current="page">{product.name}</li>
    </ol>
  </nav>

  <article>
    <header class="product-header">
      <h1>{product.name}</h1>
      <p class="brand">by {product.brand}</p>
      <div class="key-facts">
        <span class="price">{formatter.format(product.price)}</span>
        <span class="availability" data-status={product.availability}>
          {product.availability === 'InStock' ? 'In Stock' : 'Out of Stock'}
        </span>
        <span class="rating">{product.rating} / 5 ({product.reviewCount} reviews)</span>
      </div>
    </header>

    <section aria-labelledby="description-heading">
      <h2 id="description-heading">Description</h2>
      <p class="long-description">{product.longDescription}</p>
    </section>

    <section aria-labelledby="specs-heading">
      <h2 id="specs-heading">Specifications</h2>
      <dl class="specs-list">
        {#each product.specs as spec}
          <div class="spec-row">
            <dt>{spec.label}</dt>
            <dd>{spec.value}</dd>
          </div>
        {/each}
      </dl>
    </section>

    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading">Frequently Asked Questions</h2>
      {#each product.faqs as faq}
        <details class="faq-item">
          <summary>
            <h3>{faq.question}</h3>
          </summary>
          <p>{faq.answer}</p>
        </details>
      {/each}
    </section>

    <aside aria-labelledby="sources-heading" class="sources">
      <h2 id="sources-heading">Sources & Further Reading</h2>
      <ul>
        <li><a href="https://svelte.dev/docs" rel="noopener">Svelte 5 Official Documentation</a></li>
        <li><a href="https://kit.svelte.dev/docs" rel="noopener">SvelteKit Documentation</a></li>
        <li><a href="https://www.typescriptlang.org/docs/" rel="noopener">TypeScript Handbook</a></li>
      </ul>
    </aside>
  </article>
</div>

<style>
  .product-page { max-inline-size: 40rem; margin-inline: auto; padding: var(--space-lg); }

  .breadcrumb ol { list-style: none; padding: 0; display: flex; gap: var(--space-xs); font-size: var(--text-sm); color: var(--color-text-muted); margin-block-end: var(--space-lg); }
  .breadcrumb li + li::before { content: '/'; margin-inline-end: var(--space-xs); }
  .breadcrumb a { color: oklch(55% 0.2 250); text-decoration: none; }

  .product-header { margin-block-end: var(--space-xl); padding-block-end: var(--space-lg); border-block-end: 1px solid var(--color-border); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-2xs); }
  .brand { font-size: var(--text-sm); color: var(--color-text-muted); margin-block-end: var(--space-md); }
  .key-facts { display: flex; gap: var(--space-lg); align-items: center; flex-wrap: wrap; }
  .price { font-size: var(--text-xl); font-weight: 700; color: oklch(45% 0.2 145); }
  .availability { font-size: var(--text-sm); font-weight: 600; }
  .availability[data-status='InStock'] { color: oklch(45% 0.2 145); }
  .availability[data-status='OutOfStock'] { color: oklch(55% 0.2 25); }
  .rating { font-size: var(--text-sm); color: var(--color-text-muted); }

  section { margin-block-end: var(--space-xl); }
  h2 { font-size: var(--text-xl); margin-block-end: var(--space-md); }

  .long-description { font-size: var(--text-base); line-height: 1.7; color: var(--color-text); }

  .specs-list { margin: 0; }
  .spec-row { display: flex; padding: var(--space-sm) 0; border-block-end: 1px solid var(--color-border); }
  .spec-row dt { font-weight: 600; inline-size: 10rem; flex-shrink: 0; font-size: var(--text-sm); color: var(--color-text-muted); }
  .spec-row dd { margin: 0; font-size: var(--text-sm); }

  .faq-item { border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-block-end: var(--space-sm); }
  .faq-item summary { padding: var(--space-md); cursor: pointer; list-style: none; }
  .faq-item summary h3 { font-size: var(--text-base); margin: 0; }
  .faq-item p { padding: 0 var(--space-md) var(--space-md); font-size: var(--text-sm); color: var(--color-text-muted); line-height: 1.6; }

  .sources { background: var(--color-surface-2); border-radius: var(--radius-md); padding: var(--space-lg); }
  .sources ul { padding-inline-start: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-xs); }
  .sources a { color: oklch(55% 0.2 250); font-size: var(--text-sm); }
</style>
```

### Explanation

AI search optimization extends traditional SEO with patterns that help large language models extract, understand, and cite your content. Three layers work together: semantic HTML (`<article>`, `<section>`, `<dl>`, `<details>`) provides structural meaning; JSON-LD (Product, FAQPage, BreadcrumbList) provides machine-readable facts; and clear heading hierarchy enables AI models to understand the document outline. The FAQ section using `<details>` maps directly to Google's FAQ rich result and is easily extractable by AI. The "Sources" section demonstrates E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) by linking to authoritative references. Prerendering ensures all content is in the initial HTML, which is critical because AI crawlers often do not execute JavaScript.
</details>
