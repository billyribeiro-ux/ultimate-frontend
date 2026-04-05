<!--
	Lesson 6.15 — svelte/motion Spring for physics-based motion
	A cursor-follower dot with live-tunable stiffness and damping.
-->
<script lang="ts">
	import { Spring, prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);

	const stiffness: { value: number } = $state({ value: 0.15 });
	const damping: { value: number } = $state({ value: 0.65 });

	const pos = new Spring({ x: 0, y: 0 }, { stiffness: 0.15, damping: 0.65 });

	$effect(() => {
		pos.stiffness = stiffness.value;
		pos.damping = damping.value;
	});

	function onPointerMove(event: PointerEvent): void {
		pos.set(
			{ x: event.clientX, y: event.clientY },
			{ instant: reduced }
		);
	}
</script>

<svelte:window onpointermove={onPointerMove} />

<svelte:head>
	<title>Lesson 6.15 · Spring · Ultimate Frontend</title>
	<meta name="description" content="A physics-based cursor-follower with live-tunable stiffness and damping." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.15 · Mini-build</p>
		<h1>Spring-driven cursor follower</h1>
		<p class="lead">
			Move your pointer anywhere on the page. The dot chases it using a Spring from <code>svelte/motion</code>.
			Tune the stiffness and damping below to feel the difference.
		</p>
	</header>

	<div class="sliders">
		<label>
			<span>Stiffness <code>{stiffness.value.toFixed(2)}</code></span>
			<input type="range" min="0.02" max="0.5" step="0.01" bind:value={stiffness.value} />
		</label>
		<label>
			<span>Damping <code>{damping.value.toFixed(2)}</code></span>
			<input type="range" min="0.05" max="1" step="0.01" bind:value={damping.value} />
		</label>
	</div>

	<p class="status">Reduced motion: {reduced ? 'on (spring bypassed)' : 'off'}</p>
</section>

<div
	class="follower"
	aria-hidden="true"
	style:transform="translate({pos.current.x}px, {pos.current.y}px)"
></div>

<style>
	section {
		--color-brand: oklch(72% 0.2 350);
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

	.sliders {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.sliders label {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		min-block-size: 2.75rem;
	}

	.status {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.follower {
		position: fixed;
		top: -18px;
		left: -18px;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		background: radial-gradient(
			circle at 30% 30%,
			var(--color-brand),
			oklch(50% 0.15 350)
		);
		box-shadow: 0 8px 24px oklch(72% 0.2 350 / 0.5);
		pointer-events: none;
		z-index: 100;
	}
</style>
