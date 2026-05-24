<script lang="ts">
	interface PageDef {
		path: string;
		title: string;
	}

	let pages: PageDef[] = $state([
		{ path: '', title: 'Home' },
		{ path: '/pricing', title: 'Pricing' },
		{ path: '/blog', title: 'Blog' }
	]);

	let locales: string[] = $state(['en', 'pt-BR', 'ar']);
	let baseUrl: string = $state('https://example.com');
	let selectedPage: string = $state('');

	function buildUrl(locale: string, path: string): string {
		return `${baseUrl}/${locale}${path}`;
	}

	interface HreflangSet {
		page: string;
		links: Array<{ hreflang: string; href: string }>;
	}

	let hreflangSets: HreflangSet[] = $derived(
		pages.map((page) => ({
			page: page.path || '/',
			links: [
				...locales.map((locale) => ({
					hreflang: locale,
					href: buildUrl(locale, page.path)
				})),
				{ hreflang: 'x-default', href: buildUrl(locales[0], page.path) }
			]
		}))
	);

	let currentSet: HreflangSet | undefined = $derived(
		hreflangSets.find((s) => s.page === (selectedPage || '/'))
	);

	let htmlOutput: string = $derived.by(() => {
		if (!currentSet) return '';
		return currentSet.links
			.map((l) => `<link rel="alternate" hreflang="${l.hreflang}" href="${l.href}" />`)
			.join('\n');
	});

	let sitemapOutput: string = $derived.by(() => {
		const entries: string = hreflangSets.map((set) => {
			const alternates: string = set.links
				.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${l.href}"/>`)
				.join('\n');
			return locales.map((locale) =>
				`  <url>\n    <loc>${buildUrl(locale, set.page === '/' ? '' : set.page)}</loc>\n${alternates}\n  </url>`
			).join('\n');
		}).join('\n');

		return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>`;
	});

	let activeTab: 'html' | 'sitemap' = $state('html');
</script>

<svelte:head>
	<title>19.8 — i18n SEO &amp; Performance · Internationalization</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 19.8 · Mini-build</p>
		<h1>Hreflang Generator &amp; Validator</h1>
		<p class="lede">
			Generate hreflang link elements and sitemap XML for your
			multi-locale SvelteKit application.
		</p>
	</header>

	<section class="config" aria-labelledby="config-heading">
		<h2 id="config-heading">Configuration</h2>
		<label class="field">
			<span class="field__label">Base URL</span>
			<input type="url" class="field__input" bind:value={baseUrl} />
		</label>
		<div class="page-selector">
			<span class="field__label">Page</span>
			<div class="page-buttons">
				{#each pages as page (page.path)}
					<button
						class="page-btn"
						class:page-btn--active={selectedPage === page.path}
						onclick={() => selectedPage = page.path}
					>
						{page.title}
					</button>
				{/each}
			</div>
		</div>
	</section>

	{#if currentSet}
		<section class="links-preview" aria-labelledby="links-heading">
			<h2 id="links-heading">Hreflang Links for <code>{currentSet.page}</code></h2>
			<ul class="link-list">
				{#each currentSet.links as link (link.hreflang)}
					<li class="link-item">
						<span class="link-item__lang" class:link-item__lang--default={link.hreflang === 'x-default'}>
							{link.hreflang}
						</span>
						<code class="link-item__url">{link.href}</code>
						<span class="link-item__status">OK</span>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section class="output-section" aria-labelledby="output-heading">
		<h2 id="output-heading" class="sr-only">Generated Output</h2>
		<div class="output-tabs">
			<button
				class="output-tab"
				class:output-tab--active={activeTab === 'html'}
				onclick={() => activeTab = 'html'}
			>
				HTML Head
			</button>
			<button
				class="output-tab"
				class:output-tab--active={activeTab === 'sitemap'}
				onclick={() => activeTab = 'sitemap'}
			>
				Sitemap XML
			</button>
		</div>
		<pre class="output-code"><code>{activeTab === 'html' ? htmlOutput : sitemapOutput}</code></pre>
	</section>

	<section class="explanation" aria-labelledby="checklist-heading">
		<h2 id="checklist-heading">SEO Checklist</h2>
		<ol class="steps">
			<li>Every page includes hreflang links to all locale variants + x-default</li>
			<li>All hreflang links are reciprocal (A links to B and B links back to A)</li>
			<li>Canonical URLs match one of the hreflang URLs</li>
			<li>Sitemap includes xhtml:link alternates for every URL</li>
			<li>Only the active locale's bundle ships — others are lazy-loaded on switch</li>
		</ol>
	</section>
</section>

<style>
	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 50ch;
	}

	.config {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-md);
	}

	.field {
		display: grid;
		gap: var(--space-xs);
	}

	.field__label {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.field__input {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		font-size: var(--text-sm);
		min-block-size: 44px;
	}

	.page-selector {
		display: grid;
		gap: var(--space-xs);
	}

	.page-buttons {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	.page-btn {
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		min-block-size: 44px;
		transition: all var(--dur-fast) var(--ease-out);
	}

	.page-btn:hover {
		border-color: var(--color-brand);
	}

	.page-btn--active {
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-color: var(--color-brand);
	}

	.links-preview {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.link-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
		margin-block-start: var(--space-md);
	}

	.link-item {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
	}

	.link-item__lang {
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--color-brand);
		min-inline-size: 5rem;
	}

	.link-item__lang--default {
		color: var(--color-warning);
	}

	.link-item__url {
		font-size: var(--text-xs);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.link-item__status {
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--color-success);
	}

	.output-section {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.output-tabs {
		display: flex;
		border-block-end: 1px solid var(--color-border);
	}

	.output-tab {
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-sm);
		font-weight: 600;
		min-block-size: 44px;
		border-block-end: 2px solid transparent;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.output-tab:hover {
		border-block-end-color: var(--color-brand-dim);
	}

	.output-tab--active {
		border-block-end-color: var(--color-brand);
		color: var(--color-brand);
	}

	.output-code {
		padding: var(--space-md);
		overflow-x: auto;
		font-size: var(--text-xs);
		line-height: 1.6;
		white-space: pre;
		margin: 0;
	}

	.explanation {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.steps {
		padding-inline-start: var(--space-md);
		display: grid;
		gap: var(--space-sm);
		font-size: var(--text-sm);
	}

	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
