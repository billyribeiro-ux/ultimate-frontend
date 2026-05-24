<!--
	Lesson 14.8 — Production 3D
	Lazy-loaded canvas with poster fallback, DPR clamping, frameloop="demand",
	SSR safety, and prefers-reduced-motion handling.
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { Canvas, T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);

	let containerRef: HTMLElement | undefined = $state();
	let shouldLoadCanvas = $state(false);

	// Lazy loading via IntersectionObserver
	$effect(() => {
		if (!browser || !containerRef || reduced) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					shouldLoadCanvas = true;
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(containerRef);
		return () => observer.disconnect();
	});

	// DPR clamping
	const clampedDpr = $derived(browser ? Math.min(window.devicePixelRatio, 2) : 1);
</script>

<svelte:head>
	<title>Lesson 14.8 · Production 3D · Ultimate Frontend</title>
	<meta
		name="description"
		content="Production-ready 3D — lazy loading, DPR clamping, demand-based rendering, and accessibility."
	/>
</svelte:head>

<main class="page">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/14-threlte">← Module 14</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 14.8 · Mini-build</p>
		<h1>Production 3D</h1>
		<p class="lead">
			This scene loads lazily when scrolled into view, clamps DPR to 2, uses
			<code>frameloop="demand"</code> for idle efficiency, and falls back to a poster image
			for reduced-motion users. Scroll down to trigger the load.
		</p>
	</header>

	<div class="spacer">
		<p>Scroll down to see the lazy-loaded 3D scene...</p>
	</div>

	<div class="stage" bind:this={containerRef}>
		{#if reduced}
			<img
				class="poster"
				src="/hero-poster.webp"
				alt="Product showcase — 3D scene disabled due to reduced motion preference"
				width="800"
				height="450"
			/>
			<p class="poster-note">Reduced motion enabled — showing static image.</p>
		{:else if browser && shouldLoadCanvas}
			<Canvas autoRender={false} dpr={clampedDpr}>
				<T.PerspectiveCamera makeDefault position={[0, 1, 5]} fov={45}>
					<OrbitControls enableDamping dampingFactor={0.05} />
				</T.PerspectiveCamera>
				<T.AmbientLight intensity={0.4} />
				<T.DirectionalLight position={[4, 8, 4]} intensity={1.3} />
				<T.DirectionalLight position={[-3, 2, -2]} intensity={0.3} />

				<!-- Product-like shape -->
				<T.Mesh position.y={0.2}>
					<T.TorusGeometry args={[1, 0.4, 32, 100]} />
					<T.MeshStandardMaterial
						color="oklch(58% 0.18 220)"
						metalness={0.5}
						roughness={0.25}
					/>
				</T.Mesh>

				<!-- Ground reference -->
				<T.Mesh rotation.x={-Math.PI / 2} position.y={-0.8}>
					<T.CircleGeometry args={[3, 64]} />
					<T.MeshStandardMaterial color="oklch(18% 0.02 220)" />
				</T.Mesh>
			</Canvas>
		{:else if browser}
			<!-- Placeholder before intersection -->
			<div class="placeholder">
				<div class="placeholder__pulse"></div>
				<p>Loading 3D scene...</p>
			</div>
		{:else}
			<img
				class="poster"
				src="/hero-poster.webp"
				alt="Product showcase"
				width="800"
				height="450"
			/>
		{/if}
	</div>

	<section class="checklist">
		<h2>Production checklist applied</h2>
		<ul>
			<li><strong>Lazy loaded</strong> — Canvas mounts only when scrolled into view (IntersectionObserver).</li>
			<li><strong>DPR clamped</strong> — <code>Math.min(devicePixelRatio, 2)</code> prevents GPU overload on 3x screens.</li>
			<li><strong>frameloop="demand"</strong> — renders only when props change or user interacts (OrbitControls).</li>
			<li><strong>Reduced motion</strong> — shows a static poster image instead of the canvas.</li>
			<li><strong>SSR safe</strong> — server renders the poster image; client hydrates into 3D.</li>
			<li><strong>Dispose</strong> — Threlte auto-disposes geometries and materials on unmount.</li>
		</ul>
	</section>
</main>

<style>
	.page {
		--color-brand: oklch(58% 0.18 220);
		max-inline-size: 56rem;
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

	.lead code {
		font-size: 0.9em;
		background: var(--color-surface-2);
		padding-inline: 0.3em;
		border-radius: var(--radius-sm);
	}

	.spacer {
		min-block-size: 60vh;
		display: grid;
		place-items: center;
		color: var(--color-text-muted);
	}

	.stage {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		min-block-size: 300px;
		background: radial-gradient(circle at 50% 40%, oklch(16% 0.04 220), oklch(8% 0.02 220));
		border-radius: var(--radius-xl);
		overflow: hidden;
		margin-block: var(--space-xl);
		box-shadow: var(--shadow-lg);
	}

	.poster {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.poster-note {
		position: absolute;
		inset-block-end: var(--space-md);
		inset-inline: var(--space-md);
		text-align: center;
		font-size: var(--text-sm);
		color: oklch(80% 0.03 220);
	}

	.placeholder {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		gap: var(--space-md);
	}

	.placeholder p {
		color: oklch(80% 0.04 220);
		font-size: var(--text-sm);
	}

	.placeholder__pulse {
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: var(--color-brand);
		opacity: 0.6;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); opacity: 0.6; }
		50% { transform: scale(1.3); opacity: 0.3; }
	}

	@media (prefers-reduced-motion: reduce) {
		.placeholder__pulse {
			animation: none;
		}
	}

	.checklist {
		max-inline-size: 50ch;
	}

	.checklist h2 {
		color: var(--color-brand);
		margin-block-end: var(--space-md);
	}

	.checklist li {
		color: var(--color-text-muted);
		margin-block-end: var(--space-sm);
	}

	.checklist code {
		font-size: 0.85em;
		background: var(--color-surface-2);
		padding-inline: 0.3em;
		border-radius: var(--radius-sm);
	}
</style>
