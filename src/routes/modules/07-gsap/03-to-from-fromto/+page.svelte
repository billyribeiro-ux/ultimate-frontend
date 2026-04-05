<!--
	Lesson 7.3 — gsap.to(), gsap.from(), gsap.fromTo()
	Three rows demonstrating each method.
-->
<script lang="ts">
	import { gsap } from 'gsap';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);

	let boxA: HTMLElement | undefined = $state();
	let boxB: HTMLElement | undefined = $state();
	let boxC: HTMLElement | undefined = $state();

	function runTo(): void {
		if (!boxA) return;
		if (reduced) {
			gsap.set(boxA, { x: 0 });
			return;
		}
		// Toggle: animate to 200 then back
		const current = gsap.getProperty(boxA, 'x') as number;
		gsap.to(boxA, {
			x: current > 0 ? 0 : 200,
			duration: 0.8,
			ease: 'power2.out'
		});
	}

	function runFrom(): void {
		if (!boxB) return;
		if (reduced) {
			gsap.set(boxB, { y: 0, opacity: 1 });
			return;
		}
		gsap.from(boxB, {
			y: -60,
			opacity: 0,
			duration: 0.8,
			ease: 'power2.out'
		});
	}

	function runFromTo(): void {
		if (!boxC) return;
		if (reduced) {
			gsap.set(boxC, { scale: 1, rotation: 0 });
			return;
		}
		gsap.fromTo(
			boxC,
			{ scale: 0, rotation: 0 },
			{ scale: 1, rotation: 360, duration: 1, ease: 'back.out(1.4)' }
		);
	}
</script>

<svelte:head>
	<title>Lesson 7.3 · to/from/fromTo · Ultimate Frontend</title>
	<meta name="description" content="Three GSAP methods side by side: to, from, fromTo." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 7.3 · Mini-build</p>
		<h1>Three GSAP methods, side by side</h1>
		<p class="lead">
			Click each Run button to fire a different GSAP call. Each row explains when to reach for it.
		</p>
	</header>

	<article class="row">
		<div class="row__info">
			<h2>gsap.to</h2>
			<p>From the element's current state to the values you provide.</p>
		</div>
		<div class="row__stage">
			<div class="box" bind:this={boxA}></div>
		</div>
		<button type="button" class="primary" onclick={runTo}>Run</button>
	</article>

	<article class="row">
		<div class="row__info">
			<h2>gsap.from</h2>
			<p>From the values you provide back to the element's current state — reveal animations.</p>
		</div>
		<div class="row__stage">
			<div class="box box--b" bind:this={boxB}></div>
		</div>
		<button type="button" class="primary" onclick={runFrom}>Run</button>
	</article>

	<article class="row">
		<div class="row__info">
			<h2>gsap.fromTo</h2>
			<p>Explicit start and end states — neither matches the natural position.</p>
		</div>
		<div class="row__stage">
			<div class="box box--c" bind:this={boxC}></div>
		</div>
		<button type="button" class="primary" onclick={runFromTo}>Run</button>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 15);
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

	.row {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);

		@media (min-width: 640px) {
			grid-template-columns: 1fr 2fr auto;
			align-items: center;
		}
	}

	.row__info h2 {
		margin: 0 0 var(--space-xs);
	}

	.row__info p {
		color: var(--color-text-muted);
		margin: 0;
		font-size: var(--text-sm);
	}

	.row__stage {
		position: relative;
		min-block-size: 80px;
		display: flex;
		align-items: center;
	}

	.box {
		width: 64px;
		height: 64px;
		border-radius: var(--radius-md);
		background: var(--color-brand);
		box-shadow: var(--shadow-md);
	}

	.box--b {
		background: oklch(65% 0.2 15);
	}

	.box--c {
		background: oklch(75% 0.17 15);
	}

	.primary {
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: var(--color-surface);
		font-weight: 600;
		min-block-size: 2.75rem;
		min-inline-size: 2.75rem;
	}
</style>
