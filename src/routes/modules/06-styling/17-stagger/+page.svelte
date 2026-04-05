<!--
	Lesson 6.17 — Transition parameters, easing, and stagger patterns
-->
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { DUR } from '$lib/motion';

	type Feature = {
		id: number;
		title: string;
		blurb: string;
		icon: string;
	};

	const features: Feature[] = [
		{ id: 1, icon: '●', title: 'Fluid typography', blurb: 'Clamp-based scales that adapt smoothly from phone to desktop.' },
		{ id: 2, icon: '◐', title: 'OKLCH colour', blurb: 'Perceptually uniform palettes that look consistent across surfaces.' },
		{ id: 3, icon: '◆', title: 'Motion tokens', blurb: 'Durations and easings live in exactly one file.' },
		{ id: 4, icon: '◇', title: 'Container queries', blurb: 'Components that respond to their parent, not the viewport.' },
		{ id: 5, icon: '▲', title: 'Layered cascade', blurb: '@layer guarantees resets, components, and animations stay predictable.' },
		{ id: 6, icon: '▽', title: 'Logical properties', blurb: 'RTL-ready styles without a single `left` or `right`.' }
	];

	const reduced = $derived(prefersReducedMotion.current);

	let mounted: boolean = $state(false);

	$effect(() => {
		// Flip to true on first render so the transitions fire.
		mounted = true;
	});

	function replay(): void {
		mounted = false;
		queueMicrotask(() => (mounted = true));
	}
</script>

<svelte:head>
	<title>Lesson 6.17 · Stagger · Ultimate Frontend</title>
	<meta name="description" content="Six feature tiles cascading in with a bounded stagger." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.17 · Mini-build</p>
		<h1>First-paint stagger</h1>
		<p class="lead">
			Six tiles fly in with a 60ms gap, capped at 600ms total. Click Replay to toggle the mount flag.
		</p>
	</header>

	<button class="primary" type="button" onclick={replay}>Replay</button>

	{#if mounted}
		<ul class="grid" role="list">
			{#each features as feature, i (feature.id)}
				<li
					class="tile"
					in:fly={{
						y: reduced ? 0 : 24,
						duration: reduced ? 0 : DUR.slow,
						delay: reduced ? 0 : Math.min(i * 60, 600),
						easing: cubicOut
					}}
				>
					<span class="tile__icon" aria-hidden="true">{feature.icon}</span>
					<strong class="tile__title">{feature.title}</strong>
					<p class="tile__blurb">{feature.blurb}</p>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(72% 0.14 220);
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
		grid-template-columns: 1fr;
		gap: var(--space-md);

		@media (min-width: 480px) {
			grid-template-columns: repeat(2, 1fr);
		}

		@media (min-width: 768px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.tile {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.tile__icon {
		font-size: var(--text-2xl);
		color: var(--color-brand);
	}

	.tile__title {
		font-size: var(--text-lg);
	}

	.tile__blurb {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: 0;
	}
</style>
