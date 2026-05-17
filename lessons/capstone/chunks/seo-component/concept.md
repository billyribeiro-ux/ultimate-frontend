---
chunk: seo-component
level: 2
penalty: medium
---

# Typed SEO Component + JSON-LD — Level 2 Concept Reveal

A reusable SEO component centralizes all search-engine and social-sharing metadata for a SvelteKit app. Instead of repeating `<svelte:head>` blocks with fragile string templates on every page, you write one component that accepts typed props and emits the correct tags.

### The three layers of SEO metadata

1. **Basic meta.** `<title>` and `<meta name="description">` — what appears in search result snippets.
2. **Social cards.** Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) and Twitter Cards (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
3. **Structured data (JSON-LD).** A machine-readable object inside `<script type="application/ld+json">` that tells search engines the semantic meaning of the page — "this is a SoftwareApplication", "this is an Organization with these properties".

### Typing JSON-LD with a discriminated union

Schema.org has hundreds of types, but the capstone needs only a handful. Define each as an interface with a literal `"@type"` field:

```
interface JsonLdWebSite { "@type": "WebSite"; name: string; url: string; }
interface JsonLdOrganization { "@type": "Organization"; name: string; url: string; logo: string; }
interface JsonLdBreadcrumb { "@type": "BreadcrumbList"; itemListElement: { position: number; name: string; item: string }[]; }

type JsonLd = JsonLdWebSite | JsonLdOrganization | JsonLdBreadcrumb | ...
```

TypeScript narrows on `"@type"` so each variant requires exactly the right fields.

### Escaping JSON-LD safely

JSON-LD is rendered inside a `<script>` tag. If any field value contains `</script>`, the browser will close the tag early, creating an XSS vector. The fix: after `JSON.stringify`, replace every `</` with `<\/`. This is a benign substitution — JSON parsers treat `\/` the same as `/`.

### Canonical URL strategy

Every page has exactly one canonical URL. In SvelteKit, `$page.url.origin + $page.url.pathname` gives the absolute URL. The SEO component can accept an override prop for pages with multiple access paths (e.g., paginated pages that canonicalize to page 1).

### Pseudocode

```
<script lang="ts">
    import type { SEOProps } from '$lib/types/seo';
    let { title, description, canonicalUrl, ogImage, ogType, twitterCard, jsonLd }: SEOProps = $props();
    const jsonLdString = $derived(
        JSON.stringify({ "@context": "https://schema.org", ...jsonLd }).replaceAll('</', '<\\/')
    );
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalUrl} />
    <meta property="og:title" content={title} />
    <!-- ...remaining OG and Twitter tags... -->
    {@html `<script type="application/ld+json">${jsonLdString}</script>`}
</svelte:head>
```

### Connecting to the capstone

The typed load functions from `load-function-typing` provide the SEO data. The `sitemap-endpoint` chunk produces a sitemap that references the same canonical URLs. The `ssr-hydration` chunk ensures `<svelte:head>` content is server-rendered so crawlers see it without JavaScript.
