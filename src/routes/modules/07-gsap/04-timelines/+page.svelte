<!--
	Lesson 7.4 — GSAP Timelines
	A hero reveal with seven animated elements choreographed into a single timeline.
-->
<script lang="ts">
	import { gsap } from 'gsap';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);

	let root: HTMLElement | undefined = $state();
	let tl: gsap.core.Timeline | undefined;

	let progress: number = $state(0);
	let playing: boolean = $state(false);

	$effect(() => {
		if (!root) return;

		const ctx = gsap.context(() => {
			tl = gsap.timeline({
				paused: true,
				defaults: {
					duration: reduced ? 0 : 0.6,
					ease: 'power2.out'
				},
				onUpdate: () => {
					if (tl) progress = tl.progress();
				},
				onComplete: () => {
					playing = false;
				}
			});

			tl.from('.hero__logo', { scale: 0, opacity: 0 })
				.from('.hero__headline', { y: -30, opacity: 0 }, '-=0.3')
				.from('.hero__sub', { y: 20, opacity: 0 }, '-=0.4')
				.from('.hero__cta', { scale: 0.9, opacity: 0 }, '-=0.3')
				.from('.feature', {
					y: 40,
					opacity: 0,
					stagger: reduced ? 0 : { amount: 0.5, from: 'start' }
				}, '-=0.2');
		}, root);

		return () => ctx.revert();
	});

	function play(): void {
		if (!tl) return;
		tl.restart();
		playing = true;
	}

	function reverse(): void {
		if (!tl) return;
		tl.reverse();
	}

	function onScrub(event: Event): void {
		const target = event.currentTarget as HTMLInputElement;
		const value = Number(target.value) / 100;
		progress = value;
		if (tl) tl.progress(value).pause();
		playing = false;
	}
</script>

<svelte:head>
	<title>Lesson 7.4 · Timelines · Ultimate Frontend</title>
	<meta name="description" content="A GSAP timeline sequencing seven hero reveal animations with a scrubbable playhead." />
</svelte:head>

<section class="page stack" bind:this={root}>
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 7.4 · Mini-build</p>
		<h1>Hero reveal driven by a timeline</h1>
		<p class="lead">
			Seven elements, one timeline. Scrub the slider to feel the entire sequence as a single playable object.
		</p>
	</header>

	<div class="controls">
		<button type="button" class="primary" onclick={play}>Play</button>
		<button type="button" class="ghost" onclick={reverse}>Reverse</button>
		<label class="scrub">
			<span>Scrub</span>
			<input
				type="range"
				min="0"
				max="100"
				step="1"
				value={progress * 100}
				oninput={onScrub}
				aria-label="Timeline progress"
			/>
		</label>
		<span class="playing">{playing ? 'Playing' : 'Paused'}</span>
	</div>

	<article class="hero">
		<div class="hero__logo" aria-hidden="true">◆</div>
		<h2 class="hero__headline">Ship motion without chaos</h2>
		<p class="hero__sub">
			One timeline, seven elements, zero <code>setTimeout</code> calls.
		</p>
		<a href="#demo" class="hero__cta">Learn more</a>
	</article>

	<ul class="features" role="list">
		<li class="feature">
			<h3>Tokens</h3>
			<p>Durations and easings from one file.</p>
		</li>
		<li class="feature">
			<h3>Runes</h3>
			<p>State and effects that track dependencies.</p>
		</li>
		<li class="feature">
			<h3>Cleanup</h3>
			<p>Every timeline lives inside a context.</p>
		</li>
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.14 230);
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

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.primary,
	.ghost {
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		min-block-size: 2.75rem;
		min-inline-size: 2.75rem;
		font-weight: 600;
	}

	.primary {
		background: var(--color-brand);
		color: var(--color-surface);
	}

	.ghost {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
	}

	.scrub {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		min-inline-size: 12rem;
	}

	.scrub span {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.playing {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		color: var(--color-text-muted);
	}

	.hero {
		padding: var(--space-2xl) var(--space-lg);
		text-align: center;
		background: linear-gradient(
			135deg,
			oklch(68% 0.14 230),
			oklch(55% 0.2 260)
		);
		color: var(--color-surface);
		border-radius: var(--radius-xl);
	}

	.hero__logo {
		font-size: 3rem;
		display: inline-block;
	}

	.hero__headline {
		margin: var(--space-sm) 0;
		font-size: var(--text-2xl);
	}

	.hero__sub {
		color: oklch(96% 0.01 230);
		margin: 0 auto var(--space-lg);
	}

	.hero__cta {
		display: inline-block;
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-surface);
		color: var(--color-text);
		border-radius: var(--radius-full);
		text-decoration: none;
		font-weight: 600;
		min-block-size: 2.75rem;
	}

	.features {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);

		@media (min-width: 480px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.feature {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.feature h3 {
		margin: 0 0 var(--space-xs);
	}

	.feature p {
		color: var(--color-text-muted);
		margin: 0;
	}
</style>
