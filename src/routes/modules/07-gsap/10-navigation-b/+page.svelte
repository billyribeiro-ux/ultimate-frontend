<!--
	Lesson 7.10 — ScrollTrigger with SvelteKit navigation — Page B
	Sibling route to prove the navigation-safe pattern works both ways.
-->
<script lang="ts">
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { afterNavigate } from '$app/navigation';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);

	let root: HTMLElement | undefined = $state();

	afterNavigate(() => {
		ScrollTrigger.refresh();
	});

	$effect(() => {
		if (!root) return;

		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			if (reduced) return;

			gsap.utils.toArray<HTMLElement>('.slide').forEach((el, i) => {
				gsap.fromTo(
					el.querySelector('.slide__text'),
					{ xPercent: i % 2 === 0 ? -20 : 20, opacity: 0 },
					{
						xPercent: 0,
						opacity: 1,
						duration: 0.9,
						ease: 'power2.out',
						scrollTrigger: {
							trigger: el,
							start: 'top 70%',
							end: 'bottom 30%',
							toggleActions: 'play none none reverse'
						}
					}
				);
			});
		}, root);

		return () => ctx.revert();
	});
</script>

<svelte:head>
	<title>Lesson 7.10 · Page B · Ultimate Frontend</title>
	<meta name="description" content="Second page proving ScrollTrigger survives SvelteKit navigation." />
</svelte:head>

<main class="page" bind:this={root}>
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 7.10 · Mini-build (Page B)</p>
		<h1>Alternating slide reveals</h1>
		<p class="lead">Three sections that slide in from alternating sides.</p>
		<p><a class="nav-link" href="/modules/07-gsap/10-navigation">← Back to Page A</a></p>
	</header>

	<section class="slide">
		<div class="slide__text">
			<h2>Left in, right out</h2>
			<p>Each slide's text enters from a different direction based on its index.</p>
		</div>
	</section>

	<section class="slide">
		<div class="slide__text">
			<h2>Right in, left out</h2>
			<p>Navigation between this page and Page A must not break the caches.</p>
		</div>
	</section>

	<section class="slide">
		<div class="slide__text">
			<h2>Left in, right out</h2>
			<p>ScrollTrigger.refresh() handles it via afterNavigate.</p>
		</div>
	</section>
</main>

<style>
	.page {
		--color-brand: oklch(75% 0.11 295);
		max-inline-size: 44rem;
		margin-inline: auto;
		padding: var(--space-lg) var(--space-md);
	}

	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lead {
		color: var(--color-text-muted);
	}

	.nav-link {
		display: inline-block;
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-brand);
		color: var(--color-surface);
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 600;
		min-block-size: 2.75rem;
	}

	.slide {
		padding: var(--space-2xl) var(--space-lg);
		margin-block: var(--space-xl);
		background: var(--color-surface-2);
		border-radius: var(--radius-xl);
		min-block-size: 40vh;
		display: grid;
		place-items: center;
	}

	.slide__text {
		max-inline-size: 40ch;
	}

	.slide h2 {
		color: var(--color-brand);
		margin-block-end: var(--space-sm);
	}
</style>
