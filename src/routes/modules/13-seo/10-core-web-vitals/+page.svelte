<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';

	const heroImage: string = '/og/lesson-13-10.png';
	const heroWidth: number = 1200;
	const heroHeight: number = 630;
</script>

<SEO
	title="Core Web Vitals in SvelteKit · Lesson 13.10"
	description="LCP under 2.5 s, CLS under 0.1, INP under 200 ms — the SvelteKit-specific levers that get every page into the green zone."
/>

<svelte:head>
	<link rel="preload" as="image" href={heroImage} fetchpriority="high" />
</svelte:head>

<section class="page stack">
	<p class="eyebrow">Lesson 13.10 · Mini-build</p>
	<h1>Hero with zero layout shift</h1>
	<figure class="hero">
		<img
			src={heroImage}
			width={heroWidth}
			height={heroHeight}
			alt="Lesson 13.10 hero illustration"
			fetchpriority="high"
		/>
	</figure>
	<p>Open DevTools → Lighthouse → Run. LCP, CLS, and INP should all be green.</p>
	<nav>
		<a data-sveltekit-preload-data="hover" href="/modules/13-seo">Back to Module 13</a>
	</nav>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 100);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.hero {
		margin: 0;
		aspect-ratio: 1200 / 630;
		background: var(--color-surface-2);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.hero img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}
</style>
