<!--
	Lesson 7.6 — $effect as the bridge — triggering GSAP from reactive state
-->
<script lang="ts">
	import { gsap } from 'gsap';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);

	type Slide = { id: number; title: string; body: string };

	const slides: readonly Slide[] = [
		{ id: 1, title: 'One', body: 'Svelte state flows into GSAP via $effect.' },
		{ id: 2, title: 'Two', body: 'Dependencies are tracked automatically.' },
		{ id: 3, title: 'Three', body: 'No manual dependency arrays, ever.' }
	];

	let step: number = $state(0);
	let runs: number = $state(0);
	let track: HTMLElement | undefined = $state();

	$effect(() => {
		if (!track) return;
		runs += 1;
		const width = track.offsetWidth / slides.length;
		gsap.to(track, {
			x: -step * width,
			duration: reduced ? 0 : 0.5,
			ease: 'power2.out'
		});
	});

	function prev(): void {
		step = Math.max(0, step - 1);
	}

	function next(): void {
		step = Math.min(slides.length - 1, step + 1);
	}

	// A separate state that the effect does NOT read — demonstrates selective
	// reactivity. Clicking its button does not rerun the GSAP effect.
	let unrelated: number = $state(0);
	function bumpUnrelated(): void {
		unrelated += 1;
	}
</script>

<svelte:head>
	<title>Lesson 7.6 · $effect bridge · Ultimate Frontend</title>
	<meta name="description" content="Reactive state flowing into GSAP through Svelte's $effect rune." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 7.6 · Mini-build</p>
		<h1>State-driven carousel via $effect</h1>
		<p class="lead">
			Prev/Next update <code>step</code>. The effect reads <code>step</code> and animates the
			track. The counter shows how many times the effect ran.
		</p>
	</header>

	<div class="viewport">
		<div class="track" bind:this={track} style:width="{slides.length * 100}%">
			{#each slides as slide (slide.id)}
				<article class="slide">
					<p class="slide__num">{slide.title}</p>
					<p class="slide__body">{slide.body}</p>
				</article>
			{/each}
		</div>
	</div>

	<div class="controls">
		<button type="button" class="ghost" onclick={prev} disabled={step === 0}>Prev</button>
		<button type="button" class="ghost" onclick={next} disabled={step === slides.length - 1}>
			Next
		</button>
		<button type="button" class="ghost" onclick={bumpUnrelated}>
			Bump unrelated ({unrelated})
		</button>
		<span class="runs">Effect runs: {runs}</span>
	</div>
</section>

<style>
	section {
		--color-brand: oklch(64% 0.22 310);
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

	.viewport {
		overflow: hidden;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		background: var(--color-surface-2);
	}

	.track {
		display: flex;
	}

	.slide {
		flex: 0 0 calc(100% / 3);
		padding: var(--space-2xl);
		box-sizing: border-box;
	}

	.slide__num {
		font-size: var(--text-2xl);
		color: var(--color-brand);
		margin: 0 0 var(--space-sm);
	}

	.slide__body {
		color: var(--color-text-muted);
		margin: 0;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-md);
	}

	.ghost {
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		min-block-size: 2.75rem;
	}

	.ghost:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.runs {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		color: var(--color-text-muted);
	}
</style>
