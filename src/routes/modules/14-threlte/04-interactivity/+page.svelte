<!--
	Lesson 14.4 — Interactivity
	Clickable meshes with hover effects, cursor changes, and an info panel.
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { Canvas, T } from '@threlte/core';
	import { interactivity, OrbitControls } from '@threlte/extras';

	interface ShapeInfo {
		id: string;
		name: string;
		description: string;
		color: string;
		position: [number, number, number];
	}

	const shapes: ShapeInfo[] = [
		{ id: 'cube', name: 'Cube', description: 'Six faces, twelve edges. The fundamental building block.', color: 'oklch(58% 0.2 250)', position: [-2, 0, 0] },
		{ id: 'sphere', name: 'Sphere', description: 'Every point equidistant from center. Perfect symmetry.', color: 'oklch(65% 0.2 150)', position: [0, 0, 0] },
		{ id: 'cone', name: 'Cone', description: 'A single apex converging from a circular base.', color: 'oklch(70% 0.2 50)', position: [2, 0, 0] }
	];

	let selectedId = $state<string | undefined>();
	let hoveredId = $state<string | undefined>();

	const selectedShape = $derived(shapes.find((s) => s.id === selectedId));

	function handlePointerEnter(id: string): void {
		hoveredId = id;
		if (browser) document.body.style.cursor = 'pointer';
	}

	function handlePointerLeave(): void {
		hoveredId = undefined;
		if (browser) document.body.style.cursor = 'auto';
	}

	function handleClick(id: string): void {
		selectedId = selectedId === id ? undefined : id;
	}

	// Enable interactivity plugin
	if (browser) {
		// Plugin is enabled inside the Canvas via the component below
	}
</script>

<svelte:head>
	<title>Lesson 14.4 · Interactivity · Ultimate Frontend</title>
	<meta
		name="description"
		content="Click and hover on 3D objects — raycasting-powered interactivity with Threlte."
	/>
</svelte:head>

<main class="page">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/14-threlte">← Module 14</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 14.4 · Mini-build</p>
		<h1>Interactivity</h1>
		<p class="lead">
			Hover over the shapes to see cursor changes. Click to select and view details. The
			interactivity plugin handles raycasting automatically.
		</p>
	</header>

	<div class="layout">
		<div class="stage">
			{#if browser}
				<Canvas>
					<T.PerspectiveCamera makeDefault position={[0, 2, 6]} fov={45}>
						<OrbitControls enableDamping dampingFactor={0.05} />
					</T.PerspectiveCamera>
					<T.AmbientLight intensity={0.4} />
					<T.DirectionalLight position={[5, 8, 5]} intensity={1.2} />

					<!-- Cube -->
					<T.Mesh
						position={shapes[0].position}
						onclick={() => handleClick('cube')}
						onpointerenter={() => handlePointerEnter('cube')}
						onpointerleave={handlePointerLeave}
						scale={hoveredId === 'cube' ? 1.1 : 1}
					>
						<T.BoxGeometry args={[1, 1, 1]} />
						<T.MeshStandardMaterial
							color={shapes[0].color}
							emissive={selectedId === 'cube' ? shapes[0].color : 'black'}
							emissiveIntensity={selectedId === 'cube' ? 0.3 : 0}
							metalness={0.3}
							roughness={0.4}
						/>
					</T.Mesh>

					<!-- Sphere -->
					<T.Mesh
						position={shapes[1].position}
						onclick={() => handleClick('sphere')}
						onpointerenter={() => handlePointerEnter('sphere')}
						onpointerleave={handlePointerLeave}
						scale={hoveredId === 'sphere' ? 1.1 : 1}
					>
						<T.SphereGeometry args={[0.7, 32, 32]} />
						<T.MeshStandardMaterial
							color={shapes[1].color}
							emissive={selectedId === 'sphere' ? shapes[1].color : 'black'}
							emissiveIntensity={selectedId === 'sphere' ? 0.3 : 0}
							metalness={0.3}
							roughness={0.4}
						/>
					</T.Mesh>

					<!-- Cone -->
					<T.Mesh
						position={shapes[2].position}
						onclick={() => handleClick('cone')}
						onpointerenter={() => handlePointerEnter('cone')}
						onpointerleave={handlePointerLeave}
						scale={hoveredId === 'cone' ? 1.1 : 1}
					>
						<T.ConeGeometry args={[0.6, 1.2, 32]} />
						<T.MeshStandardMaterial
							color={shapes[2].color}
							emissive={selectedId === 'cone' ? shapes[2].color : 'black'}
							emissiveIntensity={selectedId === 'cone' ? 0.3 : 0}
							metalness={0.3}
							roughness={0.4}
						/>
					</T.Mesh>
				</Canvas>
			{:else}
				<p class="ssr-note">Interactive 3D scene renders in the browser.</p>
			{/if}
		</div>

		<aside class="panel" class:panel--active={!!selectedShape}>
			{#if selectedShape}
				<h2>{selectedShape.name}</h2>
				<p>{selectedShape.description}</p>
				<button onclick={() => { selectedId = undefined; }}>Deselect</button>
			{:else}
				<p class="panel__hint">Click a shape to see its details.</p>
			{/if}
		</aside>
	</div>
</main>

<style>
	.page {
		--color-brand: oklch(62% 0.18 200);
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
		min-block-size: 280px;
		background: radial-gradient(circle at 50% 40%, oklch(18% 0.03 220), oklch(10% 0.02 220));
		border-radius: var(--radius-xl);
		overflow: hidden;
		box-shadow: var(--shadow-lg);
	}

	.ssr-note {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: oklch(85% 0.04 220);
	}

	.panel {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.panel--active {
		border-color: var(--color-brand);
	}

	.panel h2 {
		color: var(--color-brand);
		margin-block-end: var(--space-sm);
	}

	.panel p {
		color: var(--color-text-muted);
		margin-block-end: var(--space-md);
	}

	.panel__hint {
		font-style: italic;
	}

	.panel button {
		background: var(--color-brand);
		color: oklch(98% 0.01 0);
		border: none;
		border-radius: var(--radius-md);
		padding: var(--space-sm) var(--space-md);
		cursor: pointer;
		min-block-size: 44px;
		font-weight: 600;
	}
</style>
