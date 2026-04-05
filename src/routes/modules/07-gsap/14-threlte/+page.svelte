<!--
	Lesson 7.14 — Introducing Threlte — 3D in Svelte
	A PE7-coloured torus that rotates in sync with the user's scroll position,
	driven by GSAP ScrollTrigger. SSR-safe via {#if browser}.
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { Canvas, T } from '@threlte/core';
	import * as THREE from 'three';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { afterNavigate } from '$app/navigation';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);

	let stage: HTMLElement | undefined = $state();
	let torusRef: THREE.Mesh | undefined = $state();

	afterNavigate(() => {
		ScrollTrigger.refresh();
	});

	// The brand colour comes from the PE7 token via a browser-side conversion.
	// Default fallback ensures the material is never null before conversion.
	let brandColor: THREE.Color = $state(new THREE.Color(0x4a7bd4));

	function oklchToThreeColor(oklch: string): THREE.Color {
		const el = document.createElement('div');
		el.style.color = oklch;
		document.body.appendChild(el);
		const computed = getComputedStyle(el).color;
		document.body.removeChild(el);
		const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
		if (!match) return new THREE.Color(0x4a7bd4);
		return new THREE.Color(
			Number(match[1]) / 255,
			Number(match[2]) / 255,
			Number(match[3]) / 255
		);
	}

	$effect(() => {
		if (!browser) return;
		brandColor = oklchToThreeColor('oklch(58% 0.2 250)');
	});

	$effect(() => {
		if (!browser || !stage || !torusRef) return;

		gsap.registerPlugin(ScrollTrigger);

		const mesh = torusRef;

		const ctx = gsap.context(() => {
			if (reduced) {
				mesh.rotation.set(0.4, 0, 0);
				return;
			}

			// Idle spin so the torus is alive even before scrolling.
			gsap.to(mesh.rotation, {
				y: Math.PI * 2,
				duration: 12,
				ease: 'none',
				repeat: -1
			});

			// Scroll drives the x-axis tilt — one full rotation from top to bottom.
			gsap.to(mesh.rotation, {
				x: Math.PI * 2,
				ease: 'none',
				scrollTrigger: {
					trigger: stage,
					start: 'top top',
					end: 'bottom top',
					scrub: 0.5
				}
			});
		}, stage);

		return () => ctx.revert();
	});
</script>

<svelte:head>
	<title>Lesson 7.14 · Threlte · Ultimate Frontend</title>
	<meta
		name="description"
		content="A PE7-coloured torus rendered by Threlte and rotated by GSAP ScrollTrigger."
	/>
</svelte:head>

<main class="page">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 7.14 · Mini-build</p>
		<h1>Scroll-rotating Threlte torus</h1>
		<p class="lead">
			Scroll the page. The torus rotates in sync with your scroll position through GSAP
			ScrollTrigger. The torus material colour is converted from a PE7 OKLCH token.
		</p>
	</header>

	<div class="stage" bind:this={stage}>
		{#if browser}
			<Canvas>
				<T.PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
				<T.AmbientLight intensity={0.4} />
				<T.DirectionalLight position={[5, 10, 5]} intensity={1.4} />
				<T.DirectionalLight position={[-4, -6, 4]} intensity={0.5} />
				<T.Mesh bind:ref={torusRef}>
					<T.TorusGeometry args={[1.1, 0.42, 32, 200]} />
					<T.MeshStandardMaterial color={brandColor} metalness={0.3} roughness={0.28} />
				</T.Mesh>
			</Canvas>
		{:else}
			<p class="ssr-note">Scene renders in the browser.</p>
		{/if}
	</div>

	<section class="spacer">
		<h2>Keep scrolling</h2>
		<p>
			Every pixel you scroll advances the torus rotation on its X axis. A subtle idle spin on the
			Y axis runs continuously so the shape is alive even at the top of the page.
		</p>
	</section>

	<section class="spacer">
		<h2>OKLCH to RGB</h2>
		<p>
			Three.js's <code>THREE.Color</code> does not accept <code>oklch()</code>. The component
			creates a throwaway element, assigns the OKLCH token to its <code>color</code> style, reads
			back the computed RGB, and constructs a <code>THREE.Color</code> from the channels.
		</p>
	</section>

	<section class="spacer">
		<h2>SSR safety</h2>
		<p>
			The <code>&lt;Canvas&gt;</code> is wrapped in <code>&#123;#if browser&#125;</code> so SvelteKit's
			server render skips the WebGL context entirely. Client-side hydration mounts the scene.
		</p>
	</section>

	<section class="spacer">
		<h2>Cleanup</h2>
		<p>
			Every ScrollTrigger lives inside a <code>gsap.context</code> that reverts on unmount. No
			leaked tweens, no cross-navigation ghosts. This is the last lesson of Module 7.
		</p>
	</section>
</main>

<style>
	.page {
		--color-brand: oklch(58% 0.2 250);
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

	.stage {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		min-block-size: 320px;
		background: radial-gradient(
			circle at 30% 30%,
			oklch(22% 0.06 250),
			oklch(14% 0.04 250)
		);
		border-radius: var(--radius-xl);
		overflow: hidden;
		margin-block: var(--space-xl);
		box-shadow: var(--shadow-lg);
	}

	.ssr-note {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: oklch(85% 0.04 250);
	}

	.spacer {
		min-block-size: 80vh;
		padding-block: var(--space-2xl);
		max-inline-size: 44rem;
	}

	.spacer h2 {
		color: var(--color-brand);
		margin-block-end: var(--space-md);
	}
</style>
