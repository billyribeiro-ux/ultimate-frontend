<!--
	Lesson 7.10 — ScrollTrigger with SvelteKit navigation
	Navigation-safe pattern: gsap.context + afterNavigate + ScrollTrigger.refresh()
-->
<script lang="ts">
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { afterNavigate } from '$app/navigation';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);

	let root: HTMLElement | undefined = $state();

	$effect(() => {
		if (!root) return;

		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			if (reduced) return;

			gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
				gsap.from(el, {
					y: 40,
					opacity: 0,
					duration: 0.7,
					ease: 'power2.out',
					scrollTrigger: {
						trigger: el,
						start: 'top 85%',
						toggleActions: 'play none none reverse'
					}
				});
			});
		}, root);

		afterNavigate(() => {
			ScrollTrigger.refresh();
		});

		return () => ctx.revert();
	});
</script>

<svelte:head>
	<title>Lesson 7.10 · Navigation-safe ScrollTrigger · Ultimate Frontend</title>
	<meta
		name="description"
		content="The canonical pattern for ScrollTrigger in SvelteKit: gsap.context, afterNavigate, and ctx.revert."
	/>
</svelte:head>

<main class="page" bind:this={root}>
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 7.10 · Mini-build (Page A)</p>
		<h1>Navigation-safe ScrollTrigger</h1>
		<p class="lead">
			This page uses <code>afterNavigate</code> to refresh ScrollTrigger after every SvelteKit
			navigation. Use the link below to jump to Page B, scroll, then come back.
		</p>
		<p><a class="nav-link" href="/modules/07-gsap/10-navigation-b">Go to Page B →</a></p>
	</header>

	<section class="reveal">
		<h2>Section 1 · Reveal on entry</h2>
		<p>Each section uses a one-shot <code>gsap.from</code> with a ScrollTrigger that fires when the top of the section hits 85% of the viewport.</p>
	</section>

	<section class="reveal">
		<h2>Section 2 · Reverse on exit</h2>
		<p><code>toggleActions: 'play none none reverse'</code> replays the animation backwards when you scroll the section above the viewport.</p>
	</section>

	<section class="reveal">
		<h2>Section 3 · Context cleanup</h2>
		<p>Leaving this page calls <code>ctx.revert()</code>, which tears down every trigger and tween created inside the context. No leaks.</p>
	</section>

	<section class="reveal">
		<h2>Section 4 · Refresh on return</h2>
		<p>Coming back to this page recreates the triggers. The <code>afterNavigate</code> hook calls <code>ScrollTrigger.refresh()</code> so cached measurements are correct.</p>
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
		max-inline-size: 56ch;
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

	.reveal {
		padding: var(--space-xl) var(--space-lg);
		margin-block: var(--space-xl);
		background: var(--color-surface-2);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}

	.reveal h2 {
		color: var(--color-brand);
		margin-block-end: var(--space-md);
	}
</style>
