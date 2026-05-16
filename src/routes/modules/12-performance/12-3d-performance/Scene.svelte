<!--
	Lesson 12.12 — 3D scene component.
	Loaded ONLY via dynamic import from the hero page, guarded by an
	IntersectionObserver and a prefers-reduced-motion check.

	This file is client-only. It is never imported statically anywhere,
	which keeps Threlte out of the initial bundle AND out of the SSR
	module graph.
-->
<script lang="ts">
	import { T, Canvas } from '@threlte/core';

	let rotation = $state<number>(0);
	let raf: number | null = null;

	$effect(() => {
		function tick(): void {
			rotation += 0.01;
			raf = requestAnimationFrame(tick);
		}
		raf = requestAnimationFrame(tick);
		return () => {
			if (raf !== null) cancelAnimationFrame(raf);
		};
	});
</script>

<div class="canvas-wrap">
	<Canvas dpr={[1, 2]}>
		<T.PerspectiveCamera makeDefault position={[0, 0, 5]} fov={60} />
		<T.AmbientLight intensity={0.4} />
		<T.DirectionalLight position={[3, 3, 3]} intensity={1.2} />
		<T.Mesh rotation.x={rotation * 0.6} rotation.y={rotation}>
			<T.TorusGeometry args={[1, 0.4, 24, 48]} />
			<T.MeshStandardMaterial color="#6a7bff" roughness={0.3} metalness={0.4} />
		</T.Mesh>
	</Canvas>
</div>

<style>
	.canvas-wrap {
		inline-size: 100%;
		aspect-ratio: 16 / 9;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: linear-gradient(135deg, oklch(30% 0.08 260), oklch(18% 0.05 280));
	}
</style>
