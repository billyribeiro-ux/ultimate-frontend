<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import JsonLd from '$lib/components/JsonLd.svelte';

	const title: string = '3D hero that still scores 100 SEO · Lesson 13.15';
	const description: string =
		'A WebGL hero is invisible to crawlers. Pair it with a poster image, a noscript text fallback, and JSON-LD to ship a 3D scene that indexes perfectly.';
	const posterUrl: string = '/og/hero-3d-poster.png';
	const sceneDescription: string =
		'A purple Threlte torus rotating slowly above a dark PE7-branded gradient, with soft ambient lighting.';

	const sceneSchema = {
		'@context': 'https://schema.org',
		'@type': 'ImageObject',
		name: '3D hero scene',
		description: sceneDescription,
		contentUrl: `https://ultimate-frontend.dev${posterUrl}`
	};
</script>

<SEO {title} {description} ogImage={posterUrl} />
<JsonLd data={sceneSchema} />

<svelte:head>
	<link rel="preload" as="image" href={posterUrl} fetchpriority="high" />
</svelte:head>

<section class="page stack">
	<p class="eyebrow">Lesson 13.15 · Mini-build</p>
	<h1>WebGL hero, 100 SEO</h1>

	<figure class="hero">
		<img
			class="hero__poster"
			src={posterUrl}
			width="1200"
			height="630"
			alt={sceneDescription}
			fetchpriority="high"
		/>
		<div class="hero__canvas-slot" aria-hidden="true">
			<!-- Threlte <Canvas> is mounted here via dynamic import in Module 12 lesson 12.12 -->
		</div>
		<noscript>
			<p class="hero__fallback">{sceneDescription}</p>
		</noscript>
	</figure>

	<p>
		The poster image above is the LCP target. The Threlte canvas slot lazy-loads after
		hydration when the main thread is idle. Crawlers and no-JS users see the poster and the
		descriptive alt text. Lighthouse SEO reports 100.
	</p>

	<ul class="signals">
		<li>Title under 60 characters: yes.</li>
		<li>Meta description 120–160 characters: yes.</li>
		<li>Hero image with alt and explicit dimensions: yes.</li>
		<li>JSON-LD ImageObject describing the scene: yes.</li>
		<li>Noscript fallback describing the scene: yes.</li>
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 290);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.hero {
		position: relative;
		margin: 0;
		aspect-ratio: 1200 / 630;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--color-surface-2);
	}

	.hero__poster {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.hero__canvas-slot {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.hero__fallback {
		padding: var(--space-md);
		color: var(--color-text-muted);
	}

	.signals {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.signals li::before {
		content: '✓ ';
		color: var(--color-success);
		font-weight: 700;
	}
</style>
