<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';

	const title: string = 'Open Graph & Twitter Cards · Lesson 13.4';
	const description: string =
		'Four required OG tags, one 1200×630 image, and a Twitter Card — how to make every link preview look intentional.';
	const ogImage: string = 'https://ultimate-frontend.dev/og/lesson-13-4.png';
</script>

<SEO {title} {description} {ogImage} ogType="article" />

<section class="page stack">
	<p class="eyebrow">Lesson 13.4 · Mini-build</p>
	<h1>What a share preview looks like</h1>

	<figure class="og-card" aria-label="Simulated Open Graph share card">
		<div class="og-card__image" role="img" aria-label="Lesson 13.4 cover art">
			<span>Lesson 13.4</span>
			<strong>Open Graph &amp; Twitter Cards</strong>
		</div>
		<figcaption class="og-card__meta">
			<p class="og-card__url">ultimate-frontend.dev</p>
			<p class="og-card__title">{title}</p>
			<p class="og-card__desc">{description}</p>
		</figcaption>
	</figure>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 20);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.og-card {
		max-inline-size: 540px;
		margin: 0;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--color-surface-2);
	}

	.og-card__image {
		aspect-ratio: 1200 / 630;
		display: grid;
		place-items: center;
		gap: var(--space-xs);
		background: linear-gradient(
			135deg,
			var(--color-brand),
			oklch(from var(--color-brand) 40% 0.2 h)
		);
		color: oklch(98% 0.01 0);
		text-align: center;
		padding: var(--space-md);
	}

	.og-card__image span {
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.og-card__image strong {
		font-size: var(--text-xl);
	}

	.og-card__meta {
		padding: var(--space-md);
	}

	.og-card__url {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
	}

	.og-card__title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-block: var(--space-xs);
	}

	.og-card__desc {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}
</style>
