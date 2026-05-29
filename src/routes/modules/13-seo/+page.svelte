<!--
	Module 13 index — SEO.
	Lists every lesson and links to its mini-build route.
	Pattern copied from the Module 8 index.
-->
<script lang="ts">
	interface Lesson {
		id: string;
		number: string;
		title: string;
		href: string;
		summary: string;
	}

	const lessons: Lesson[] = [
		{
			id: '13-1',
			number: '13.1',
			title: 'Why SvelteKit is already an SEO advantage',
			href: '/modules/13-seo/01-why-sveltekit',
			summary: 'SSR vs CSR for indexing, zero-runtime baseline, mobile-first indexing.'
		},
		{
			id: '13-2',
			number: '13.2',
			title: '<svelte:head> — the foundation',
			href: '/modules/13-seo/02-svelte-head',
			summary: 'Per-page title and description, the 600 px display rule, and head merging.'
		},
		{
			id: '13-3',
			number: '13.3',
			title: 'Building a reusable typed SEO component',
			href: '/modules/13-seo/03-seo-component',
			summary: 'SEOProps interface, layout defaults, per-page overrides, derived canonical.'
		},
		{
			id: '13-4',
			number: '13.4',
			title: 'Open Graph & Twitter Cards',
			href: '/modules/13-seo/04-open-graph',
			summary: 'The four required OG tags, 1200×630 images, testing with Facebook and Twitter.'
		},
		{
			id: '13-5',
			number: '13.5',
			title: 'SEO data from load() functions',
			href: '/modules/13-seo/05-load-seo',
			summary: 'Typed SEO flowing from +page.server.ts into page.data and the root layout head.'
		},
		{
			id: '13-6',
			number: '13.6',
			title: 'JSON-LD Structured Data',
			href: '/modules/13-seo/06-json-ld',
			summary: 'Article, BreadcrumbList, FAQPage, Organization — rich results with safe {@html}.'
		},
		{
			id: '13-7',
			number: '13.7',
			title: 'E-E-A-T signals in markup',
			href: '/modules/13-seo/07-e-e-a-t',
			summary: 'Author bios, datePublished/dateModified, breadcrumbs, Person schema.'
		},
		{
			id: '13-8',
			number: '13.8',
			title: 'Dynamic Sitemap generation',
			href: '/modules/13-seo/08-sitemap',
			summary: 'A +server.ts endpoint that returns application/xml for every static + dynamic URL.'
		},
		{
			id: '13-9',
			number: '13.9',
			title: 'Robots.txt',
			href: '/modules/13-seo/09-robots',
			summary: 'A +server.ts endpoint serving text/plain, blocking admin/auth/api, referencing the sitemap.'
		},
		{
			id: '13-10',
			number: '13.10',
			title: 'Core Web Vitals optimization',
			href: '/modules/13-seo/10-core-web-vitals',
			summary: 'LCP preload, CLS dimensions, INP avoidance, data-sveltekit-preload-data.'
		},
		{
			id: '13-11',
			number: '13.11',
			title: 'Prerendering for SEO',
			href: '/modules/13-seo/11-prerender',
			summary: 'export const prerender = true, hybrid SSG + SSR, entries() for dynamic routes.'
		},
		{
			id: '13-12',
			number: '13.12',
			title: 'AI Search Optimization (AEO/GEO)',
			href: '/modules/13-seo/12-aeo-geo',
			summary: 'FAQPage schema, topical authority, citation-worthy content for AI Overviews.'
		},
		{
			id: '13-13',
			number: '13.13',
			title: 'Trailing slashes, redirects, canonical',
			href: '/modules/13-seo/13-canonical',
			summary: 'trailingSlash config, 301 from load(), canonical for tracking-param variants.'
		},
		{
			id: '13-14',
			number: '13.14',
			title: 'Google Search Console integration',
			href: '/modules/13-seo/14-search-console',
			summary: 'Meta-tag verification, sitemap submission, Coverage and Performance reports.'
		},
		{
			id: '13-15',
			number: '13.15',
			title: '3D & SEO — invisible canvas content',
			href: '/modules/13-seo/15-3d-seo',
			summary: 'Noscript fallbacks, poster images for LCP, JSON-LD describing WebGL scenes.'
		}
	];
</script>

<svelte:head>
	<title>Module 13 · SEO · Ultimate Frontend</title>
	<meta
		name="description"
		content="Module 13 — SEO for SvelteKit in May 2026: head tags, JSON-LD, sitemaps, Core Web Vitals, AEO, and 3D SEO."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules">← All modules</a>
	</nav>

	<header>
		<p class="eyebrow">Module 13</p>
		<h1>SEO</h1>
		<p class="lede">
			Make a SvelteKit app rank. Fifteen lessons, every May 2026 SEO signal, every Google
			ranking factor, a 100-on-Lighthouse target, and a full 3D-and-SEO finale.
		</p>
	</header>

	<ol class="lessons">
		{#each lessons as lesson (lesson.id)}
			<li class="lesson">
				<a class="lesson__link" href={lesson.href}>
					<span class="lesson__number">{lesson.number}</span>
					<span class="lesson__title">{lesson.title}</span>
					<span class="lesson__summary">{lesson.summary}</span>
				</a>
			</li>
		{/each}
	</ol>

	<aside class="project">
		<h2>Module project — SEO-Optimized Multi-Page Content Site</h2>
		<p>
			Prerendered blog, SSR dynamic search, full JSON-LD, sitemap, robots.txt, Open Graph,
			Twitter Cards, E-E-A-T signals, and a 100 Lighthouse SEO score on every page.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 350);
	}

	.crumbs a {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-decoration: none;

		&:hover {
			color: var(--color-brand);
		}
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.lessons {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.lesson__link {
		display: grid;
		gap: var(--space-xs);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		min-block-size: 44px;
		transition: transform var(--dur-fast) var(--ease-out);

		&:hover {
			transform: translateX(2px);
		}
	}

	.lesson__number {
		font-size: var(--text-xs);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 700;
	}

	.lesson__title {
		font-size: var(--text-lg);
		font-weight: 600;
	}

	.lesson__summary {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.project {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		border-inline-start: 4px solid var(--color-brand);
	}

	.project h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}
</style>
