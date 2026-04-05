<!--
	Lesson 7.7 — GSAP cleanup in $effect return functions
	A dashboard with several looping tweens and a toggle that mounts/unmounts it.
	A live counter displays GSAP's active tween count to prove cleanup is working.
-->
<script lang="ts">
	import { gsap } from 'gsap';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);

	let visible: boolean = $state(true);
	let tweenCount: number = $state(0);

	let dashboardRoot: HTMLElement | undefined = $state();

	$effect(() => {
		if (!dashboardRoot) return;

		const ctx = gsap.context(() => {
			if (reduced) {
				gsap.set('.widget__pulse', { scale: 1 });
				gsap.set('.widget__bar', { x: 0 });
				gsap.set('.widget__icon', { rotation: 0 });
				return;
			}
			gsap.to('.widget__pulse', {
				scale: 1.2,
				duration: 0.8,
				ease: 'sine.inOut',
				repeat: -1,
				yoyo: true
			});
			gsap.to('.widget__bar', {
				x: '100%',
				duration: 1.5,
				ease: 'sine.inOut',
				repeat: -1,
				yoyo: true
			});
			gsap.to('.widget__counter', {
				innerText: 9999,
				duration: 4,
				snap: { innerText: 1 },
				repeat: -1
			});
			gsap.to('.widget__icon', {
				rotation: 360,
				duration: 2,
				ease: 'none',
				repeat: -1
			});
		}, dashboardRoot);

		tweenCount = gsap.globalTimeline.getChildren().length;

		return () => {
			ctx.revert();
			tweenCount = gsap.globalTimeline.getChildren().length;
		};
	});

	function toggleDashboard(): void {
		visible = !visible;
		queueMicrotask(() => {
			tweenCount = gsap.globalTimeline.getChildren().length;
		});
	}
</script>

<svelte:head>
	<title>Lesson 7.7 · GSAP cleanup · Ultimate Frontend</title>
	<meta
		name="description"
		content="Prove GSAP context cleanup by toggling a dashboard and watching the active tween count."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 7.7 · Mini-build</p>
		<h1>Context revert keeps tweens honest</h1>
		<p class="lead">
			Toggle the dashboard on and off. The counter shows GSAP's active tween count — it stays
			bounded because every tween lives inside a <code>gsap.context</code> that reverts on cleanup.
		</p>
	</header>

	<div class="controls">
		<button type="button" class="primary" onclick={toggleDashboard}>
			{visible ? 'Hide dashboard' : 'Show dashboard'}
		</button>
		<span class="count">Active tweens: <strong>{tweenCount}</strong></span>
	</div>

	{#if visible}
		<div class="dashboard" bind:this={dashboardRoot}>
			<article class="widget">
				<h2>Pulse</h2>
				<div class="widget__pulse" aria-hidden="true"></div>
			</article>
			<article class="widget">
				<h2>Shimmer</h2>
				<div class="widget__track">
					<div class="widget__bar"></div>
				</div>
			</article>
			<article class="widget">
				<h2>Counter</h2>
				<div class="widget__counter">0</div>
			</article>
			<article class="widget">
				<h2>Refresh</h2>
				<div class="widget__icon" aria-hidden="true">◉</div>
			</article>
		</div>
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(55% 0.15 155);
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

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-md);
	}

	.primary {
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: var(--color-surface);
		font-weight: 600;
		min-block-size: 2.75rem;
	}

	.count {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		color: var(--color-text-muted);
	}

	.dashboard {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);

		@media (min-width: 480px) {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.widget {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
	}

	.widget h2 {
		margin: 0;
		font-size: var(--text-base);
		color: var(--color-text-muted);
	}

	.widget__pulse {
		width: 64px;
		height: 64px;
		border-radius: var(--radius-full);
		background: radial-gradient(circle, var(--color-brand), oklch(40% 0.14 155));
	}

	.widget__track {
		width: 100%;
		height: 20px;
		border-radius: var(--radius-full);
		background: var(--color-border);
		overflow: hidden;
	}

	.widget__bar {
		width: 30%;
		height: 100%;
		background: var(--color-brand);
		border-radius: var(--radius-full);
	}

	.widget__counter {
		font-size: var(--text-2xl);
		font-weight: 700;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		color: var(--color-brand);
	}

	.widget__icon {
		font-size: 3rem;
		color: var(--color-brand);
	}
</style>
