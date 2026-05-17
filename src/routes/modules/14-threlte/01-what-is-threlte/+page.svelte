<!--
	Lesson 14.1 — What Threlte is
	A minimal scene with a rotating cube to prove the <Canvas> + <T.*> pattern works.
	SSR-safe via {#if browser}.
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { Canvas, T, useTask } from '@threlte/core';

	let rotation = $state(0);

	function Cube() {
		useTask((delta) => {
			rotation += delta * 0.5;
		});
	}
</script>

<svelte:head>
	<title>Lesson 14.1 · What Threlte is · Ultimate Frontend</title>
	<meta
		name="description"
		content="A minimal Threlte scene — a PE7-colored rotating cube proving the declarative 3D pattern."
	/>
</svelte:head>

<main class="page">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/14-threlte">← Module 14</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 14.1 · Mini-build</p>
		<h1>What Threlte is</h1>
		<p class="lead">
			A minimal Threlte scene: one rotating cube rendered declaratively with Svelte 5 components.
			No imperative Three.js setup — just components, props, and reactive state.
		</p>
	</header>

	<div class="stage">
		{#if browser}
			<Canvas>
				<T.PerspectiveCamera makeDefault position={[3, 2, 5]} fov={50} />
				<T.AmbientLight intensity={0.4} />
				<T.DirectionalLight position={[5, 8, 5]} intensity={1.2} />
				<T.Mesh rotation.y={rotation} rotation.x={rotation * 0.3}>
					<T.BoxGeometry args={[1.5, 1.5, 1.5]} />
					<T.MeshStandardMaterial color="oklch(58% 0.2 250)" metalness={0.3} roughness={0.4} />
				</T.Mesh>
			</Canvas>
		{:else}
			<p class="ssr-note">3D scene renders in the browser.</p>
		{/if}
	</div>

	<section class="info">
		<h2>What you're seeing</h2>
		<p>
			A single <code>&lt;Canvas&gt;</code> component with a <code>&lt;T.Mesh&gt;</code> child. The
			mesh contains a <code>&lt;T.BoxGeometry&gt;</code> and a
			<code>&lt;T.MeshStandardMaterial&gt;</code>. Rotation is driven by Threlte's
			<code>useTask</code> which runs each frame.
		</p>
		<p>
			The entire scene is wrapped in <code>&#123;#if browser&#125;</code> for SSR safety. The
			server renders the fallback text; the client hydrates into the live 3D scene.
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
		min-block-size: 300px;
		background: radial-gradient(circle at 30% 30%, oklch(20% 0.04 250), oklch(12% 0.02 250));
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

	.info {
		max-inline-size: 50ch;
	}

	.info h2 {
		color: var(--color-brand);
		margin-block-end: var(--space-sm);
	}

	.info p {
		margin-block-end: var(--space-md);
		color: var(--color-text-muted);
	}

	.info code {
		font-size: 0.9em;
		background: var(--color-surface-2);
		padding-inline: 0.3em;
		border-radius: var(--radius-sm);
	}
</style>
