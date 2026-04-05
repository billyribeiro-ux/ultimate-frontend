<!--
	Lesson 7.9 — ScrollTrigger — installing and configuring with SvelteKit
-->
<script lang="ts">
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);

	let root: HTMLElement | undefined = $state();

	$effect(() => {
		if (!root) return;

		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			if (reduced) return;

			gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((section) => {
				gsap.from(section.querySelectorAll('h2, p'), {
					y: 40,
					opacity: 0,
					stagger: 0.1,
					duration: 0.7,
					ease: 'power2.out',
					scrollTrigger: {
						trigger: section,
						start: 'top 80%',
						toggleActions: 'play none none reverse'
					}
				});
			});

			gsap.to('.hero-image', {
				yPercent: 20,
				ease: 'none',
				scrollTrigger: {
					trigger: '.hero',
					start: 'top top',
					end: 'bottom top',
					scrub: 1
				}
			});
		}, root);

		return () => ctx.revert();
	});
</script>

<svelte:head>
	<title>Lesson 7.9 · ScrollTrigger · Ultimate Frontend</title>
	<meta name="description" content="Scroll-triggered section reveals and a parallax hero driven by GSAP ScrollTrigger." />
</svelte:head>

<main class="article" bind:this={root}>
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header class="hero">
		<div class="hero-image" aria-hidden="true"></div>
		<div class="hero-text">
			<p class="eyebrow">Lesson 7.9 · Mini-build</p>
			<h1>A scroll-driven article</h1>
			<p class="lead">Scroll down. Sections reveal as they enter the viewport. The hero parallaxes.</p>
		</div>
	</header>

	<section class="reveal-section">
		<h2>Introduction</h2>
		<p>ScrollTrigger ties animation progress to scroll position. Start and end strings define when each trigger fires, and <code>scrub</code> couples the animation clock to the scrollbar.</p>
		<p>The simplest form is a one-shot reveal — each section's heading and paragraphs fly in when the section reaches 80% of the viewport.</p>
	</section>

	<section class="reveal-section">
		<h2>How it works</h2>
		<p>The trigger element's position is measured once on creation. Each scroll event compares the scroll position to the cached start and end values.</p>
		<p>Because the comparison is cheap, ScrollTrigger is efficient even with many triggers. The cost shows up only when you use <code>scrub</code>, which samples every frame.</p>
	</section>

	<section class="reveal-section">
		<h2>Cleanup matters</h2>
		<p>Every ScrollTrigger you create must be cleaned up when the component unmounts. The cleanest way is to create them inside a <code>gsap.context</code> and call <code>ctx.revert()</code> in the effect's return function.</p>
		<p>Next lesson covers the navigation-safe pattern.</p>
	</section>

	<section class="reveal-section">
		<h2>Conclusion</h2>
		<p>ScrollTrigger is powerful, but reach for <code>IntersectionObserver</code> first for simple one-shot reveals. Both are used in the module project.</p>
	</section>
</main>

<style>
	.article {
		--color-brand: oklch(50% 0.06 260);
		max-inline-size: 44rem;
		margin-inline: auto;
		padding: var(--space-md);
	}

	.crumbs {
		margin-block: var(--space-lg);
	}

	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.hero {
		position: relative;
		display: grid;
		gap: var(--space-lg);
		padding-block: var(--space-2xl);
		overflow: hidden;
	}

	.hero-image {
		height: 200px;
		background: linear-gradient(
			135deg,
			oklch(50% 0.06 260),
			oklch(70% 0.1 260)
		);
		border-radius: var(--radius-lg);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lead {
		color: var(--color-text-muted);
		font-size: var(--text-lg);
	}

	.reveal-section {
		padding-block: var(--space-2xl);
		border-top: 1px solid var(--color-border);
	}

	.reveal-section h2 {
		color: var(--color-brand);
		margin-block-end: var(--space-md);
	}

	.reveal-section p {
		margin-block-end: var(--space-md);
	}
</style>
