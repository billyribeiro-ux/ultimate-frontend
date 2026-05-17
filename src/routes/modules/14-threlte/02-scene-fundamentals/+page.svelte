<!--
	Lesson 14.2 — Scene fundamentals
	Interactive material explorer: sliders control metalness, roughness, and light intensity
	on a sphere with OrbitControls.
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { Canvas, T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';

	let metalness = $state(0.3);
	let roughness = $state(0.4);
	let lightIntensity = $state(1.2);
</script>

<svelte:head>
	<title>Lesson 14.2 · Scene Fundamentals · Ultimate Frontend</title>
	<meta
		name="description"
		content="Interactive material explorer — adjust metalness, roughness, and lighting in real-time."
	/>
</svelte:head>

<main class="page">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/14-threlte">← Module 14</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 14.2 · Mini-build</p>
		<h1>Scene fundamentals</h1>
		<p class="lead">
			Drag to orbit. Adjust the sliders to see how metalness, roughness, and light intensity
			change the appearance of a PBR material in real time.
		</p>
	</header>

	<div class="stage">
		{#if browser}
			<Canvas>
				<T.PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={45}>
					<OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 1.8} />
				</T.PerspectiveCamera>
				<T.AmbientLight intensity={0.35} />
				<T.DirectionalLight position={[5, 8, 4]} intensity={lightIntensity} />
				<T.DirectionalLight position={[-3, -4, 3]} intensity={lightIntensity * 0.3} />
				<T.Mesh position.y={0.5}>
					<T.SphereGeometry args={[1, 64, 64]} />
					<T.MeshStandardMaterial
						color="oklch(65% 0.18 270)"
						{metalness}
						{roughness}
					/>
				</T.Mesh>
				<!-- Ground plane -->
				<T.Mesh rotation.x={-Math.PI / 2} position.y={-0.5}>
					<T.PlaneGeometry args={[10, 10]} />
					<T.MeshStandardMaterial color="oklch(25% 0.02 260)" />
				</T.Mesh>
			</Canvas>
		{:else}
			<p class="ssr-note">3D scene renders in the browser.</p>
		{/if}
	</div>

	<div class="controls">
		<label>
			Metalness: {metalness.toFixed(2)}
			<input type="range" min="0" max="1" step="0.01" bind:value={metalness} />
		</label>
		<label>
			Roughness: {roughness.toFixed(2)}
			<input type="range" min="0" max="1" step="0.01" bind:value={roughness} />
		</label>
		<label>
			Light intensity: {lightIntensity.toFixed(1)}
			<input type="range" min="0" max="3" step="0.1" bind:value={lightIntensity} />
		</label>
	</div>
</main>

<style>
	.page {
		--color-brand: oklch(65% 0.18 270);
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
		min-block-size: 300px;
		background: radial-gradient(circle at 40% 40%, oklch(20% 0.03 270), oklch(10% 0.02 270));
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
		color: oklch(85% 0.04 270);
	}

	.controls {
		display: grid;
		gap: var(--space-md);
		max-inline-size: 24rem;
	}

	@media (min-width: 768px) {
		.controls {
			grid-template-columns: 1fr 1fr;
			max-inline-size: 100%;
		}
	}

	label {
		display: grid;
		gap: var(--space-xs);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	input[type='range'] {
		accent-color: var(--color-brand);
		min-block-size: 44px;
	}
</style>
