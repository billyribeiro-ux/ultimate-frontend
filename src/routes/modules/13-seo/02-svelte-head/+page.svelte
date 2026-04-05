<script lang="ts">
	const title: string = 'Page titles are SEO real estate · Lesson 13.2';
	const description: string =
		'A per-page title and meta description is the minimum viable SEO setup for any SvelteKit route — here is how to write them.';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
</svelte:head>

<section class="page stack">
	<p class="eyebrow">Lesson 13.2 · Mini-build</p>
	<h1>What Google sees</h1>

	<article class="serp">
		<p class="serp__url">ultimate-frontend.dev › modules › 13-seo › 02-svelte-head</p>
		<h2 class="serp__title">{title}</h2>
		<p class="serp__desc">{description}</p>
	</article>

	<p class="muted">
		This card simulates Google's result snippet for this page. Title under 60 characters,
		description between 120 and 160. View source to see the tags that produced it.
	</p>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 280);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.serp {
		max-inline-size: 600px;
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.serp__url {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
	}

	.serp__title {
		font-size: var(--text-lg);
		color: var(--color-brand);
		margin-block: var(--space-xs);
	}

	.serp__desc {
		font-size: var(--text-sm);
		margin: 0;
	}

	.muted {
		color: var(--color-text-muted);
	}
</style>
