<!--
	Lesson 7.8 — Stagger animations
	Twelve cards rippling in from the centre of the grid.
-->
<script lang="ts">
	import { gsap } from 'gsap';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);

	const cards = Array.from({ length: 12 }, (_, i) => ({
		id: i + 1,
		label: String(i + 1).padStart(2, '0')
	}));

	let grid: HTMLElement | undefined = $state();

	function run(): void {
		if (!grid) return;
		const items = gsap.utils.toArray<HTMLElement>('.stagger-card', grid);
		if (reduced) {
			gsap.set(items, { scale: 1, opacity: 1, y: 0 });
			return;
		}
		gsap.fromTo(
			items,
			{ scale: 0.8, opacity: 0, y: 20 },
			{
				scale: 1,
				opacity: 1,
				y: 0,
				duration: 0.5,
				ease: 'power2.out',
				stagger: { amount: 1, from: 'center', grid: 'auto' }
			}
		);
	}

	$effect(() => {
		if (!grid) return;
		const ctx = gsap.context(() => {
			run();
		}, grid);
		return () => ctx.revert();
	});
</script>

<svelte:head>
	<title>Lesson 7.8 · Stagger · Ultimate Frontend</title>
	<meta name="description" content="A 12-card gallery rippling in from the centre with a bounded total duration." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 7.8 · Mini-build</p>
		<h1>Ripple gallery</h1>
		<p class="lead">
			Twelve cards ripple in from the centre of the grid using
			<code>stagger: &#123; amount: 1, from: 'center', grid: 'auto' &#125;</code>.
			Total animation always takes one second regardless of count.
		</p>
	</header>

	<button type="button" class="primary" onclick={run}>Replay</button>

	<ul class="grid" role="list" bind:this={grid}>
		{#each cards as card (card.id)}
			<li class="stagger-card">
				<span>{card.label}</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.15 155);
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

	.primary {
		align-self: flex-start;
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: var(--color-surface);
		font-weight: 600;
		min-block-size: 2.75rem;
	}

	.grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-md);

		@media (min-width: 480px) {
			grid-template-columns: repeat(3, 1fr);
		}

		@media (min-width: 768px) {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.stagger-card {
		aspect-ratio: 1 / 1;
		display: grid;
		place-items: center;
		background: linear-gradient(135deg, var(--color-brand), oklch(55% 0.13 155));
		color: var(--color-surface);
		font-size: var(--text-2xl);
		font-weight: 700;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}
</style>
