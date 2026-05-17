---
chunk: seo-component
level: 3
penalty: high
---

# Typed SEO Component + JSON-LD — Level 3 Code Reveal

**`src/lib/types/seo.ts`**

```ts
export interface JsonLdWebSite {
	'@type': 'WebSite';
	name: string;
	url: string;
	description?: string;
}

export interface JsonLdWebPage {
	'@type': 'WebPage';
	name: string;
	url: string;
	description?: string;
}

export interface JsonLdOrganization {
	'@type': 'Organization';
	name: string;
	url: string;
	logo: string;
}

export interface JsonLdBreadcrumbItem {
	'@type': 'ListItem';
	position: number;
	name: string;
	item: string;
}

export interface JsonLdBreadcrumbList {
	'@type': 'BreadcrumbList';
	itemListElement: JsonLdBreadcrumbItem[];
}

export interface JsonLdSoftwareApplication {
	'@type': 'SoftwareApplication';
	name: string;
	applicationCategory: string;
	operatingSystem?: string;
	offers?: { '@type': 'Offer'; price: string; priceCurrency: string };
}

export type JsonLd =
	| JsonLdWebSite
	| JsonLdWebPage
	| JsonLdOrganization
	| JsonLdBreadcrumbList
	| JsonLdSoftwareApplication;

export interface SEOProps {
	title: string;
	description: string;
	canonicalUrl: string;
	ogImage?: string;
	ogType?: 'website' | 'article' | 'product';
	twitterCard?: 'summary' | 'summary_large_image';
	jsonLd?: JsonLd;
}
```

**`src/lib/components/SEO.svelte`**

```svelte
<script lang="ts">
	import type { SEOProps } from '$lib/types/seo';

	let {
		title,
		description,
		canonicalUrl,
		ogImage,
		ogType = 'website',
		twitterCard = 'summary_large_image',
		jsonLd
	}: SEOProps = $props();

	const jsonLdString = $derived(
		jsonLd
			? JSON.stringify({ '@context': 'https://schema.org', ...jsonLd }).replaceAll('</', '<\\/')
			: undefined
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph -->
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:type" content={ogType} />
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
	{/if}

	<!-- Twitter Card -->
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{#if ogImage}
		<meta name="twitter:image" content={ogImage} />
	{/if}

	<!-- JSON-LD Structured Data -->
	{#if jsonLdString}
		{@html `<script type="application/ld+json">${jsonLdString}</script>`}
	{/if}
</svelte:head>
```

**`src/routes/+page.svelte`** (SEO usage excerpt — merge with other chunks)

```svelte
<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import { page } from '$app/state';

	const canonicalUrl = $derived(page.url.origin + page.url.pathname);
</script>

<SEO
	title="PE7 SaaS — Ship production SvelteKit faster"
	description="The capstone project for Ultimate Frontend. A production-grade SaaS dashboard built with Svelte 5, SvelteKit 2, and PE7 CSS."
	{canonicalUrl}
	ogImage="{page.url.origin}/og-home.png"
	jsonLd={{ '@type': 'WebSite', name: 'PE7 SaaS', url: canonicalUrl, description: 'Production SvelteKit dashboard capstone.' }}
/>
```
