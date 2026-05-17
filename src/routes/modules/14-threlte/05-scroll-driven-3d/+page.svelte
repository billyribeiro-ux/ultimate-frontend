<!--
	Lesson 14.5 — Scroll-driven 3D scenes
	A mesh that rotates based on scroll position via GSAP ScrollTrigger.
	Camera pulls back as user scrolls for dramatic reveal.
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { Canvas, T } from '@threlte/core';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { afterNavigate } from '$app/navigation';
	import { prefersReducedMotion } from 'svelte/motion';
	import * as THREE from 'three';

	const reduced = $derived(prefersReducedMotion.current);

	let stage: HTMLElement | undefined = $state();
	let meshRef: THREE.Mesh | undefined = $state();
	let cameraRef: THREE.PerspectiveCamera | undefined = $state();

	afterNavigate(() => {
		ScrollTrigger.refresh();
	});

	$effect(() => {
		if (!browser || !stage || !meshRef || !cameraRef) return;

		gsap.registerPlugin(ScrollTrigger);

		if (reduced) {
			meshRef.rotation.set(0.3, Math.PI * 0.75, 0);
			cameraRef.position.set(0, 1.5, 7);
			return;
		}

		const ctx = gsap.context(() => {
			// Scroll drives mesh rotation
			gsap.to(meshRef!.rotation, {
				y: Math.PI * 2,
				x: 0.4,
				ease: 'none',
				scrollTrigger: {
					trigger: stage,
					start: 'top top',
					end: 'bottom bottom',
					scrub: 0.5
				}
			});

			// Camera pulls back on scroll
			gsap.to(cameraRef!.position, {
				z: 8,
				y: 2,
				ease: 'none',
				scrollTrigger: {
					trigger: stage,
					start: 'top top',
					end: '60% top',
					scrub: 0.5
				}
			});
		}, stage);

		return () => ctx.revert();
	});
</script>

<svelte:head>
	<title>Lesson 14.5 · Scroll-driven 3D · Ultimate Frontend</title>
	<meta
		name="description"
		content="GSAP ScrollTrigger drives 3D mesh rotation and camera position based on scroll."
	/>
</svelte:head>

<main class="scroll-page" bind:this={stage}>
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/14-threlte">← Module 14</a>
	</nav>

	<header class="hero">
		<p class="eyebrow">Lesson 14.5 · Mini-build</p>
		<h1>Scroll-driven 3D</h1>
		<p class="lead">
			Scroll down. The torus knot rotates in sync with your scroll position. The camera
			gradually pulls back for a dramatic wide reveal.
		</p>
	</header>

	<div class="canvas-sticky">
		{#if browser}
			<Canvas>
				<T.PerspectiveCamera makeDefault position={[0, 1, 5]} fov={50} bind:ref={cameraRef} />
				<T.AmbientLight intensity={0.35} />
				<T.DirectionalLight position={[5, 10, 5]} intensity={1.4} />
				<T.DirectionalLight position={[-4, -3, 4]} intensity={0.4} />
				<T.Mesh bind:ref={meshRef}>
					<T.TorusKnotGeometry args={[1, 0.35, 128, 32]} />
					<T.MeshStandardMaterial
						color="oklch(62% 0.22 300)"
						metalness={0.5}
						roughness={0.25}
					/>
				</T.Mesh>
			</Canvas>
		{:else}
			<p class="ssr-note">Scroll-driven 3D scene renders in the browser.</p>
		{/if}
	</div>

	<section class="scroll-section">
		<h2>Phase 1 — Rotation begins</h2>
		<p>
			As you scroll past this section, the torus knot begins rotating on its Y axis. GSAP
			ScrollTrigger maps scroll position (0% to 100%) to rotation (0 to 2PI).
		</p>
	</section>

	<section class="scroll-section">
		<h2>Phase 2 — Camera pulls back</h2>
		<p>
			The camera's Z position animates from 5 to 8, revealing more of the scene. Combined with
			the rotation, this creates a cinematic "reveal" effect common on product pages.
		</p>
	</section>

	<section class="scroll-section">
		<h2>Phase 3 — Full rotation</h2>
		<p>
			By the time you reach the bottom, the mesh has completed a full 360-degree rotation. The
			<code>scrub: 0.5</code> setting adds 0.5 seconds of smooth catch-up so the motion feels
			fluid rather than jerky.
		</p>
	</section>

	<section class="scroll-section">
		<h2>Cleanup on navigation</h2>
		<p>
			All ScrollTriggers live inside a <code>gsap.context()</code> that reverts in the
			<code>$effect</code> cleanup. Navigate away and back — no duplicate animations, no leaks.
		</p>
	</section>
</main>

<style>
	.scroll-page {
		--color-brand: oklch(62% 0.22 300);
		position: relative;
	}

	.crumbs {
		position: fixed;
		inset-block-start: var(--space-md);
		inset-inline-start: var(--space-md);
		z-index: 10;
	}

	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
		background: var(--color-surface-2);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.hero {
		padding: var(--space-2xl) var(--space-md);
		max-inline-size: 40ch;
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

	.canvas-sticky {
		position: sticky;
		inset-block-start: 0;
		width: 100%;
		height: 100vh;
		z-index: -1;
		background: radial-gradient(circle at 50% 40%, oklch(16% 0.05 300), oklch(8% 0.03 300));
	}

	.ssr-note {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: oklch(85% 0.04 300);
	}

	.scroll-section {
		min-block-size: 80vh;
		padding: var(--space-2xl) var(--space-md);
		max-inline-size: 44ch;
		display: grid;
		align-content: center;
	}

	.scroll-section h2 {
		color: var(--color-brand);
		margin-block-end: var(--space-sm);
	}

	.scroll-section p {
		color: var(--color-text-muted);
	}

	.scroll-section code {
		font-size: 0.9em;
		background: var(--color-surface-2);
		padding-inline: 0.3em;
		border-radius: var(--radius-sm);
	}
</style>
