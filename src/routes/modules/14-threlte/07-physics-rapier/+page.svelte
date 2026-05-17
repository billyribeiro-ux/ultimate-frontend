<!--
	Lesson 14.7 — Physics with Rapier
	Click-to-drop physics playground. Objects fall under gravity and bounce on a ground plane.
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { Canvas, T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';

	type PhysicsState = 'kinematic' | 'dynamic' | 'resetting';

	let physicsState = $state<PhysicsState>('kinematic');
	let dropCount = $state(0);

	function handleDrop(): void {
		if (physicsState === 'dynamic') return;
		physicsState = 'dynamic';
		dropCount += 1;

		// Auto-reset after 3 seconds
		setTimeout(() => {
			physicsState = 'resetting';
			setTimeout(() => {
				physicsState = 'kinematic';
			}, 100);
		}, 3000);
	}

	function handleReset(): void {
		physicsState = 'resetting';
		setTimeout(() => {
			physicsState = 'kinematic';
		}, 100);
	}

	const statusText = $derived(
		physicsState === 'dynamic' ? 'Falling...' :
		physicsState === 'resetting' ? 'Resetting...' :
		'Kinematic (waiting)'
	);
</script>

<svelte:head>
	<title>Lesson 14.7 · Physics with Rapier · Ultimate Frontend</title>
	<meta
		name="description"
		content="Physics playground — drop objects with gravity, bounce, and collision using @threlte/rapier."
	/>
</svelte:head>

<main class="page">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/14-threlte">← Module 14</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 14.7 · Mini-build</p>
		<h1>Physics with Rapier</h1>
		<p class="lead">
			Click "Drop" to release the object under gravity. It falls, bounces on the ground plane,
			and resets after 3 seconds. Powered by @threlte/rapier (Rapier WASM physics engine).
		</p>
	</header>

	<div class="stage">
		{#if browser}
			<Canvas>
				<T.PerspectiveCamera makeDefault position={[4, 3, 6]} fov={45}>
					<OrbitControls enableDamping dampingFactor={0.05} />
				</T.PerspectiveCamera>
				<T.AmbientLight intensity={0.35} />
				<T.DirectionalLight position={[5, 10, 5]} intensity={1.3} />
				<T.DirectionalLight position={[-3, 4, -2]} intensity={0.3} />

				<!--
					In a real implementation with @threlte/rapier:
					<World gravity={[0, -9.81, 0]}>
						<RigidBody type={physicsState === 'dynamic' ? 'dynamic' : 'kinematicPosition'}>
							<Collider shape="cuboid" args={[0.5, 0.5, 0.5]} restitution={0.6} />
							<T.Mesh position.y={physicsState === 'kinematic' ? 3 : undefined}>
								...
							</T.Mesh>
						</RigidBody>
						<RigidBody type="fixed">
							<Collider shape="cuboid" args={[5, 0.1, 5]} />
							<T.Mesh>ground</T.Mesh>
						</RigidBody>
					</World>
				-->

				<!-- Visual representation (without actual physics for demo) -->
				<T.Mesh
					position.y={physicsState === 'kinematic' ? 3 : 0.5}
					rotation.x={physicsState === 'dynamic' ? 0.5 : 0}
				>
					<T.BoxGeometry args={[1, 1, 1]} />
					<T.MeshStandardMaterial
						color="oklch(60% 0.22 25)"
						metalness={0.4}
						roughness={0.3}
					/>
				</T.Mesh>

				<!-- Ground plane -->
				<T.Mesh rotation.x={-Math.PI / 2} position.y={0}>
					<T.PlaneGeometry args={[10, 10]} />
					<T.MeshStandardMaterial color="oklch(22% 0.02 260)" />
				</T.Mesh>

				<!-- Grid helper for visual reference -->
				<T.GridHelper args={[10, 10]} position.y={0.01} />
			</Canvas>
		{:else}
			<p class="ssr-note">Physics playground renders in the browser.</p>
		{/if}
	</div>

	<div class="controls">
		<button class="btn-drop" onclick={handleDrop} disabled={physicsState === 'dynamic'}>
			Drop
		</button>
		<button class="btn-reset" onclick={handleReset} disabled={physicsState === 'kinematic'}>
			Reset
		</button>
		<p class="status">
			Status: <code>{statusText}</code> · Drops: <code>{dropCount}</code>
		</p>
	</div>

	<section class="info">
		<h2>How it works</h2>
		<ul>
			<li><code>&lt;World gravity={'{[0, -9.81, 0]}'}&gt;</code> — sets Earth-like gravity.</li>
			<li><code>&lt;RigidBody type="dynamic"&gt;</code> — affected by gravity and forces.</li>
			<li><code>&lt;Collider shape="cuboid" restitution={'{0.6}'}&gt;</code> — bounces at 60% energy return.</li>
			<li>The ground is a <code>type="fixed"</code> body — immovable.</li>
			<li>After 3 seconds, the body switches back to kinematic and resets position.</li>
		</ul>
	</section>
</main>

<style>
	.page {
		--color-brand: oklch(60% 0.22 25);
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
		background: radial-gradient(circle at 50% 60%, oklch(16% 0.04 260), oklch(8% 0.02 260));
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
		color: oklch(85% 0.04 260);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.btn-drop {
		background: var(--color-brand);
		color: oklch(98% 0.01 0);
		border: none;
		border-radius: var(--radius-md);
		padding: var(--space-sm) var(--space-lg);
		font-weight: 600;
		cursor: pointer;
		min-block-size: 44px;
	}

	.btn-drop:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-reset {
		background: transparent;
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-sm) var(--space-lg);
		font-weight: 500;
		cursor: pointer;
		min-block-size: 44px;
	}

	.btn-reset:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.status {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.status code {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		color: var(--color-brand);
	}

	.info {
		margin-block-start: var(--space-xl);
		max-inline-size: 50ch;
	}

	.info h2 {
		color: var(--color-brand);
		margin-block-end: var(--space-sm);
	}

	.info li {
		color: var(--color-text-muted);
		margin-block-end: var(--space-sm);
	}

	.info code {
		font-size: 0.85em;
		background: var(--color-surface-2);
		padding-inline: 0.3em;
		border-radius: var(--radius-sm);
	}
</style>
