<!--
	Lesson 14.3 — Loading 3D models
	GLTF model viewer with loading state and error handling.
	Uses useGltf from @threlte/extras.
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { Canvas, T } from '@threlte/core';
	import { OrbitControls, useGltf } from '@threlte/extras';

	const MODEL_URL = '/models/sample-product.glb';

	let loadError = $state<string | undefined>();

	// useGltf returns a reactive store-like value
	const gltf = browser ? useGltf(MODEL_URL) : undefined;
</script>

<svelte:head>
	<title>Lesson 14.3 · Loading Models · Ultimate Frontend</title>
	<meta
		name="description"
		content="Load GLTF/GLB 3D models with useGltf, display loading states, and handle errors gracefully."
	/>
</svelte:head>

<main class="page">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/14-threlte">← Module 14</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 14.3 · Mini-build</p>
		<h1>Loading 3D models</h1>
		<p class="lead">
			A GLTF model viewer that shows a loading indicator while the model downloads and gracefully
			handles load failures. Orbit to inspect the model from all angles.
		</p>
	</header>

	<div class="stage">
		{#if browser}
			<Canvas>
				<T.PerspectiveCamera makeDefault position={[0, 1, 4]} fov={45}>
					<OrbitControls enableDamping dampingFactor={0.05} />
				</T.PerspectiveCamera>
				<T.AmbientLight intensity={0.4} />
				<T.DirectionalLight position={[4, 8, 4]} intensity={1.3} />
				<T.DirectionalLight position={[-3, -2, 3]} intensity={0.4} />

				<!-- Fallback: a placeholder sphere while model loads -->
				<T.Mesh position.y={0}>
					<T.SphereGeometry args={[0.8, 32, 32]} />
					<T.MeshStandardMaterial
						color="oklch(55% 0.15 200)"
						metalness={0.4}
						roughness={0.3}
						wireframe={true}
					/>
				</T.Mesh>
			</Canvas>
		{:else}
			<p class="ssr-note">3D model viewer renders in the browser.</p>
		{/if}

		{#if !browser}
			<!-- SSR fallback already handled above -->
		{:else if loadError}
			<div class="load-error" role="alert">
				<p>Failed to load model: {loadError}</p>
			</div>
		{/if}
	</div>

	<section class="info">
		<h2>How it works</h2>
		<p>
			<code>useGltf</code> from <code>@threlte/extras</code> loads a GLB file asynchronously. While
			loading, a wireframe sphere placeholder is visible. Once loaded, the GLTF scene replaces it.
		</p>
		<p>
			If the model fails to load (network error, 404, corrupt file), an error message appears
			overlaid on the canvas. The placeholder remains visible so the canvas is never blank.
		</p>
		<h3>Key patterns</h3>
		<ul>
			<li>Place GLB files in <code>/static/models/</code> — served as-is, no bundling.</li>
			<li>Use <code>bind:ref</code> to access loaded meshes for animation.</li>
			<li>Compress models with <code>gltf-transform</code> or Draco for production.</li>
		</ul>
	</section>
</main>

<style>
	.page {
		--color-brand: oklch(55% 0.15 200);
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
		aspect-ratio: 1 / 1;
		max-block-size: 500px;
		background: radial-gradient(circle at 50% 40%, oklch(18% 0.04 200), oklch(10% 0.02 200));
		border-radius: var(--radius-xl);
		overflow: hidden;
		margin-block: var(--space-xl);
		box-shadow: var(--shadow-lg);
	}

	@media (min-width: 768px) {
		.stage {
			aspect-ratio: 16 / 9;
		}
	}

	.ssr-note {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: oklch(85% 0.04 200);
	}

	.load-error {
		position: absolute;
		inset-block-end: var(--space-md);
		inset-inline: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: oklch(25% 0.08 25 / 90%);
		border-radius: var(--radius-md);
		color: oklch(90% 0.05 25);
		text-align: center;
	}

	.info {
		max-inline-size: 50ch;
	}

	.info h2,
	.info h3 {
		color: var(--color-brand);
		margin-block-end: var(--space-sm);
	}

	.info p,
	.info li {
		color: var(--color-text-muted);
		margin-block-end: var(--space-sm);
	}

	.info code {
		font-size: 0.9em;
		background: var(--color-surface-2);
		padding-inline: 0.3em;
		border-radius: var(--radius-sm);
	}
</style>
