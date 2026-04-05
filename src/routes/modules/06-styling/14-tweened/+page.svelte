<!--
	Lesson 6.14 — svelte/motion Tween for value interpolation
	Two progress rings: the left uses the Tween class (Svelte 5.8+), the right uses
	the legacy tweened() function. Both animate identically.
-->
<script lang="ts">
	import { Tween, tweened, prefersReducedMotion } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { DUR } from '$lib/motion';

	const reduced = $derived(prefersReducedMotion.current);

	// Class API (Svelte 5.8+)
	const progressA = new Tween(0, {
		duration: DUR.slow,
		easing: cubicOut
	});

	// Function API (legacy, still supported)
	const progressB = tweened<number>(0, {
		duration: DUR.slow,
		easing: cubicOut
	});

	function advanceA(): void {
		const next = Math.min(100, progressA.target + 10);
		progressA.set(next, { duration: reduced ? 0 : DUR.slow });
	}

	function resetA(): void {
		progressA.set(0, { duration: reduced ? 0 : DUR.slow });
	}

	function advanceB(): void {
		progressB.update((v) => Math.min(100, v + 10), { duration: reduced ? 0 : DUR.slow });
	}

	function resetB(): void {
		progressB.set(0, { duration: reduced ? 0 : DUR.slow });
	}

	// SVG ring geometry
	const RADIUS = 80;
	const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

	const dashOffsetA = $derived(CIRCUMFERENCE * (1 - progressA.current / 100));
	const dashOffsetB = $derived(CIRCUMFERENCE * (1 - $progressB / 100));
</script>

<svelte:head>
	<title>Lesson 6.14 · Tween · Ultimate Frontend</title>
	<meta name="description" content="Two progress rings driven by the Tween class and the legacy tweened() function." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.14 · Mini-build</p>
		<h1>Tweened progress rings</h1>
		<p class="lead">
			Left ring: the Svelte 5.8+ <code>Tween</code> class API. Right ring: the legacy <code>tweened()</code> function
			that returns a store. Both interpolate smoothly between values with identical configuration.
		</p>
	</header>

	<div class="rings">
		<figure class="ring">
			<svg viewBox="0 0 200 200" aria-hidden="true">
				<circle cx="100" cy="100" r={RADIUS} class="ring__track" />
				<circle
					cx="100"
					cy="100"
					r={RADIUS}
					class="ring__fill"
					stroke-dasharray={CIRCUMFERENCE}
					stroke-dashoffset={dashOffsetA}
				/>
				<text x="100" y="110" text-anchor="middle" class="ring__text">
					{progressA.current.toFixed(0)}%
				</text>
			</svg>
			<figcaption>
				<strong>Tween class</strong>
				<code>new Tween(0, ...)</code>
			</figcaption>
			<div class="ring__controls">
				<button type="button" onclick={advanceA}>Advance +10</button>
				<button type="button" onclick={resetA}>Reset</button>
			</div>
		</figure>

		<figure class="ring">
			<svg viewBox="0 0 200 200" aria-hidden="true">
				<circle cx="100" cy="100" r={RADIUS} class="ring__track" />
				<circle
					cx="100"
					cy="100"
					r={RADIUS}
					class="ring__fill"
					stroke-dasharray={CIRCUMFERENCE}
					stroke-dashoffset={dashOffsetB}
				/>
				<text x="100" y="110" text-anchor="middle" class="ring__text">
					{$progressB.toFixed(0)}%
				</text>
			</svg>
			<figcaption>
				<strong>tweened() function</strong>
				<code>tweened(0, ...)</code>
			</figcaption>
			<div class="ring__controls">
				<button type="button" onclick={advanceB}>Advance +10</button>
				<button type="button" onclick={resetB}>Reset</button>
			</div>
		</figure>
	</div>
</section>

<style>
	section {
		--color-brand: oklch(65% 0.22 295);
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

	.rings {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.ring {
		margin: 0;
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
	}

	.ring svg {
		width: 100%;
		max-width: 14rem;
		height: auto;
	}

	.ring__track {
		fill: none;
		stroke: var(--color-border);
		stroke-width: 14;
	}

	.ring__fill {
		fill: none;
		stroke: var(--color-brand);
		stroke-width: 14;
		stroke-linecap: round;
		transform: rotate(-90deg);
		transform-origin: 100px 100px;
	}

	.ring__text {
		font-size: 2rem;
		font-weight: 700;
		fill: var(--color-text);
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
	}

	figcaption {
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.ring__controls {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
		justify-content: center;
	}

	.ring__controls button {
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: var(--color-surface);
		font-weight: 600;
		min-block-size: 2.75rem;
	}

	.ring__controls button + button {
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}
</style>
