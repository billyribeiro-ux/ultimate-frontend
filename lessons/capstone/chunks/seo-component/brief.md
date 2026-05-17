---
chunk: seo-component
title: Typed SEO Component + JSON-LD
module: 13
---

# Typed SEO Component + JSON-LD — Brief

Build a reusable, fully-typed SEO component that every page in the capstone imports to emit `<title>`, Open Graph meta tags, Twitter Card meta tags, and JSON-LD structured data into `<svelte:head>`. The component must accept typed props and produce valid schema.org markup for search engines and social sharing.

## What to build

- In `src/lib/components/SEO.svelte`, create a component that accepts typed props for `title`, `description`, `canonicalUrl`, `ogImage`, `ogType`, `twitterCard`, and an optional `jsonLd` object.
- Define a TypeScript interface `SEOProps` in `src/lib/types/seo.ts` that enforces the shape of all SEO data. The `jsonLd` field accepts a discriminated union of schema.org types: `WebSite`, `WebPage`, `Organization`, `BreadcrumbList`, and `SoftwareApplication`.
- Inside the SEO component, use `<svelte:head>` to render: the `<title>`, `<meta name="description">`, `<link rel="canonical">`, all Open Graph `<meta property="og:*">` tags, Twitter Card `<meta name="twitter:*">` tags, and a `<script type="application/ld+json">` block with the serialized JSON-LD.
- In `src/routes/+page.svelte` (marketing home) and `src/routes/dashboard/+page.svelte`, import and use the SEO component with page-specific data passed from `load()` functions.

## Acceptance criteria

- Every page that uses the SEO component passes Google's Rich Results Test for its JSON-LD.
- Open Graph tags render correctly in social share preview tools (Facebook debugger, Twitter card validator).
- The `jsonLd` prop is type-safe — passing an invalid schema.org type is a TypeScript compile error.
- `canonicalUrl` is always absolute (includes origin), never relative.
- No `any` types in the SEO component or type definitions.
- The component renders zero visible DOM — it only writes to `<svelte:head>`.
- JSON-LD output is properly escaped (no XSS via injected `</script>` in user content).

## How it connects to the capstone

This chunk provides the SEO foundation for every page. The `sitemap-endpoint` chunk references the same canonical URLs. The `load-function-typing` chunk provides the typed data that flows into the SEO component's props. The marketing home page combines this with the GSAP-animated hero from `gsap-timeline` and `scroll-trigger-setup`.
