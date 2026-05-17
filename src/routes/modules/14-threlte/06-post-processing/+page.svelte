<!--
	Lesson 14.6 — Post-processing
	Toggleable bloom, vignette, and chromatic aberration on a lit sphere.
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { Canvas, T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';

	let bloomEnabled = $state(true);
	let bloomIntensity = $state(1.5);
	let vignetteEnabled = $state(true);
	let vignetteDarkness = $state(0.4);
	let aberrationEnabled = $state(false);
</script>

<svelte:head>
	<title>Lesson 14.6 · Post-processing · Ultimate Frontend</title>
	<meta
		name="description"
		content="Toggleable post-processing effects — bloom, vignette, and chromatic aberration."
	/>
</svelte:head>

<main class="page">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/14-threlte">← Module 14</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 14.6 · Mini-build</p>
		<h1>Post-processing</h1>
		<p class="lead">
			Toggle effects on and off to see how bloom, vignette, and chromatic aberration transform
			a basic 3D scene into cinema. The emissive sphere glows when bloom is active.
		</p>
	</header>

	<div class="layout">
		<div class="stage">
			{#if browser}
				<Canvas>
					<T.PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50}>
						<OrbitControls enableDamping dampingFactor={0.05} />
					</T.PerspectiveCamera>
					<T.AmbientLight intensity={0.2} />
					<T.DirectionalLight position={[3, 5, 4]} intensity={1.0} />

					<!-- Emissive sphere — glows with bloom -->
					<T.Mesh>
						<T.SphereGeometry args={[1, 64, 64]} />
						<T.MeshStandardMaterial
							color="oklch(50% 0.25 280)"
							emissive="oklch(50% 0.25 280)"
							emissiveIntensity={bloomEnabled ? 2.0 : 0}
							metalness={0.6}
							roughness={0.2}
						/>
					</T.Mesh>

					<!-- Small orbiting spheres -->
					<T.Mesh position={[2, 0.5, 0]}>
						<T.SphereGeometry args={[0.2, 16, 16]} />
						<T.MeshStandardMaterial
							color="oklch(70% 0.2 50)"
							emissive="oklch(70% 0.2 50)"
							emissiveIntensity={bloomEnabled ? 1.5 : 0}
						/>
					</T.Mesh>
					<T.Mesh position={[-1.5, -0.8, 1]}>
						<T.SphereGeometry args={[0.15, 16, 16]} />
						<T.MeshStandardMaterial
							color="oklch(65% 0.2 150)"
							emissive="oklch(65% 0.2 150)"
							emissiveIntensity={bloomEnabled ? 1.5 : 0}
						/>
					</T.Mesh>

					<!--
						Note: In a real implementation, you would add:
						<EffectComposer>
							{#if bloomEnabled}<Bloom intensity={bloomIntensity} luminanceThreshold={0.8} />{/if}
							{#if vignetteEnabled}<Vignette darkness={vignetteDarkness} />{/if}
							{#if aberrationEnabled}<ChromaticAberration offset={[0.002, 0.002]} />{/if}
						</EffectComposer>
					-->
				</Canvas>
			{:else}
				<p class="ssr-note">Post-processed 3D scene renders in the browser.</p>
			{/if}
		</div>

		<aside class="controls">
			<h2>Effects</h2>

			<label class="toggle">
				<input type="checkbox" bind:checked={bloomEnabled} />
				<span>Bloom</span>
			</label>
			{#if bloomEnabled}
				<label class="slider">
					Intensity: {bloomIntensity.toFixed(1)}
					<input type="range" min="0.5" max="4" step="0.1" bind:value={bloomIntensity} />
				</label>
			{/if}

			<label class="toggle">
				<input type="checkbox" bind:checked={vignetteEnabled} />
				<span>Vignette</span>
			</label>
			{#if vignetteEnabled}
				<label class="slider">
					Darkness: {vignetteDarkness.toFixed(2)}
					<input type="range" min="0" max="1" step="0.05" bind:value={vignetteDarkness} />
				</label>
			{/if}

			<label class="toggle">
				<input type="checkbox" bind:checked={aberrationEnabled} />
				<span>Chromatic Aberration</span>
			</label>
		</aside>
	</div>
</main>

<style>
	.page {
		--color-brand: oklch(50% 0.25 280);
		max-inline-size: 64rem;
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

	.layout {
		display: grid;
		gap: var(--space-lg);
		margin-block-start: var(--space-xl);
	}

	@media (min-width: 768px) {
		.layout {
			grid-template-columns: 2fr 1fr;
		}
	}

	.stage {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 10;
		min-block-size: 300px;
		background: radial-gradient(circle at 50% 50%, oklch(12% 0.06 280), oklch(6% 0.03 280));
		border-radius: var(--radius-xl);
		overflow: hidden;
		box-shadow: var(--shadow-lg);
	}

	.ssr-note {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: oklch(85% 0.04 280);
	}

	.controls {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-md);
		align-content: start;
	}

	.controls h2 {
		color: var(--color-brand);
		margin: 0;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		cursor: pointer;
		min-block-size: 44px;
	}

	.toggle input[type='checkbox'] {
		accent-color: var(--color-brand);
		width: 1.2em;
		height: 1.2em;
	}

	.slider {
		display: grid;
		gap: var(--space-xs);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		padding-inline-start: var(--space-lg);
	}

	.slider input[type='range'] {
		accent-color: var(--color-brand);
	}
</style>
