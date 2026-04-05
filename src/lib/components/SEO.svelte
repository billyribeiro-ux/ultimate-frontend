<!--
	Reusable SEO component — Module 13 Lesson 13.3.
	Accepts a typed SEOProps object and emits every tag the page needs
	into the document head via <svelte:head>. Zero visual output.
-->
<script lang="ts" module>
	export interface SEOProps {
		title: string;
		description: string;
		canonical?: string;
		ogImage?: string;
		ogType?: 'website' | 'article';
		twitterCard?: 'summary' | 'summary_large_image';
		noindex?: boolean;
	}
</script>

<script lang="ts">
	import { page } from '$app/state';

	const {
		title,
		description,
		canonical,
		ogImage = 'https://ultimate-frontend.dev/og-default.png',
		ogType = 'website',
		twitterCard = 'summary_large_image',
		noindex = false
	}: SEOProps = $props();

	const resolvedCanonical: string = $derived(
		canonical ?? `https://ultimate-frontend.dev${page.url.pathname}`
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={resolvedCanonical} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
	<meta property="og:type" content={ogType} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={resolvedCanonical} />
	<meta property="og:image" content={ogImage} />
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>
