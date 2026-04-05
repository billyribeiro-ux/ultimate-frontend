<!--
	Lesson 7.12 — Building a scroll reveal action
	Long marketing page where every block uses use:revealOnScroll.
-->
<script lang="ts">
	import { revealOnScroll } from '$lib/actions/revealOnScroll';
</script>

<svelte:head>
	<title>Lesson 7.12 · revealOnScroll · Ultimate Frontend</title>
	<meta
		name="description"
		content="A long marketing page where every major block reveals on scroll via an IntersectionObserver + GSAP action."
	/>
</svelte:head>

<main class="page">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header class="hero" use:revealOnScroll={{ y: 60, duration: 0.9 }}>
		<p class="eyebrow">Lesson 7.12 · Mini-build</p>
		<h1>Marketing page with a single reusable reveal action</h1>
		<p class="lead">
			Scroll down. Every block below fades in the first time it enters the viewport. Cleanup is
			automatic because the action's <code>destroy</code> disconnects the observer.
		</p>
	</header>

	<section class="feature" use:revealOnScroll={{ y: 40 }}>
		<h2>Cheap observation</h2>
		<p>
			IntersectionObserver only fires when visibility thresholds are crossed. For a one-shot
			fade-in, it is an order of magnitude cheaper than ScrollTrigger.
		</p>
	</section>

	<section class="feature" use:revealOnScroll={{ y: 40, delay: 0.1 }}>
		<h2>Per-element parameters</h2>
		<p>Every call to <code>use:revealOnScroll</code> can pass its own distance, duration, and delay.</p>
	</section>

	<section class="feature" use:revealOnScroll={{ y: 40, delay: 0.2 }}>
		<h2>Navigation-safe</h2>
		<p>No global caches, no refresh needed. Each element owns its own observer and cleans up on unmount.</p>
	</section>

	<section class="testimonial" use:revealOnScroll={{ y: 40 }}>
		<blockquote>
			"We replaced twenty ScrollTrigger instances with one revealOnScroll action and the scroll felt lighter immediately."
		</blockquote>
		<cite>— Imaginary Designer</cite>
	</section>

	<section class="cta" use:revealOnScroll={{ y: 50, duration: 0.8 }}>
		<h2>Ready to try?</h2>
		<p>Use this action across your PE7 pages. It is free, it is fast, and it respects reduced motion.</p>
		<a class="cta__button" href="/modules/07-gsap">Back to Module 7</a>
	</section>
</main>

<style>
	.page {
		--color-brand: oklch(60% 0.1 140);
		max-inline-size: 56rem;
		margin-inline: auto;
		padding: var(--space-lg) var(--space-md);
	}

	.crumbs {
		margin-block-end: var(--space-lg);
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
		font-size: var(--text-lg);
	}

	.hero,
	.feature,
	.testimonial,
	.cta {
		margin-block: var(--space-2xl);
		padding: var(--space-xl);
		background: var(--color-surface-2);
		border-radius: var(--radius-xl);
	}

	.hero {
		background: linear-gradient(135deg, var(--color-brand), oklch(45% 0.08 140));
		color: var(--color-surface);
	}

	.hero .eyebrow,
	.hero .lead {
		color: oklch(95% 0.02 140);
	}

	.feature h2,
	.cta h2 {
		color: var(--color-brand);
		margin-block-end: var(--space-sm);
	}

	.testimonial blockquote {
		font-size: var(--text-xl);
		font-style: italic;
		margin: 0 0 var(--space-sm);
	}

	.testimonial cite {
		color: var(--color-text-muted);
	}

	.cta {
		text-align: center;
	}

	.cta__button {
		display: inline-block;
		padding: var(--space-md) var(--space-xl);
		background: var(--color-brand);
		color: var(--color-surface);
		border-radius: var(--radius-full);
		text-decoration: none;
		font-weight: 600;
		min-block-size: 2.75rem;
		margin-block-start: var(--space-md);
	}
</style>
