<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import JsonLd from '$lib/components/JsonLd.svelte';

	const title: string = 'JSON-LD structured data · Lesson 13.6';
	const description: string =
		'Rich results — the machine-readable layer Google needs to display star ratings, FAQs, and breadcrumbs next to your page.';

	const articleSchema = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: title,
		description,
		author: {
			'@type': 'Person',
			name: 'Ultimate Frontend Course'
		},
		datePublished: '2026-04-05',
		dateModified: '2026-04-05',
		publisher: {
			'@type': 'Organization',
			name: 'Ultimate Frontend',
			logo: {
				'@type': 'ImageObject',
				url: 'https://ultimate-frontend.dev/logo.png'
			}
		}
	};

	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Modules',
				item: 'https://ultimate-frontend.dev/modules'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Module 13',
				item: 'https://ultimate-frontend.dev/modules/13-seo'
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: 'Lesson 13.6',
				item: 'https://ultimate-frontend.dev/modules/13-seo/06-json-ld'
			}
		]
	};
</script>

<SEO {title} {description} ogType="article" />
<JsonLd data={articleSchema} />
<JsonLd data={breadcrumbSchema} />

<section class="page stack">
	<p class="eyebrow">Lesson 13.6 · Mini-build</p>
	<h1>JSON-LD emits two schemas into the head</h1>
	<p>This page ships both an <code>Article</code> schema and a <code>BreadcrumbList</code> schema.</p>
	<p>
		Paste the URL into
		<a href="https://search.google.com/test/rich-results">Google's Rich Results Test</a> to see
		them parse.
	</p>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 60);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
</style>
