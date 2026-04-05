<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';

	// In a real app this comes from $env/static/public:
	// import { PUBLIC_GSC_TOKEN } from '$env/static/public';
	const gscToken: string = 'demo-verification-token-replace-me';
</script>

<SEO
	title="Google Search Console · Lesson 13.14"
	description="How to verify ownership, submit your sitemap, and read the Coverage and Performance reports to guide content improvements."
/>

<svelte:head>
	<meta name="google-site-verification" content={gscToken} />
</svelte:head>

<section class="page stack">
	<p class="eyebrow">Lesson 13.14 · Mini-build</p>
	<h1>Your GSC command center</h1>
	<dl class="report">
		<div>
			<dt>Verification</dt>
			<dd>Meta tag shipped in the head of every page via the root layout.</dd>
		</div>
		<div>
			<dt>Sitemap</dt>
			<dd><a href="/sitemap.xml">/sitemap.xml</a> — submit once in GSC.</dd>
		</div>
		<div>
			<dt>Coverage</dt>
			<dd>Check weekly for new indexing errors.</dd>
		</div>
		<div>
			<dt>Performance</dt>
			<dd>Sort by impressions × (1 − CTR) to find your biggest title-rewrite wins.</dd>
		</div>
	</dl>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 260);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.report {
		display: grid;
		gap: var(--space-md);
	}

	.report div {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
	}

	dt {
		font-weight: 600;
	}

	dd {
		margin: 0;
		color: var(--color-text-muted);
	}
</style>
