<!--
	Lesson 7.1 — What GSAP is and when to reach for it
	A four-layer decision table. Uses only Svelte's built-in transition:fly
	to demonstrate the principle: only reach for GSAP when you actually need it.
-->
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { DUR } from '$lib/motion';

	type Layer = {
		id: number;
		name: string;
		cost: string;
		useWhen: readonly string[];
		example: string;
	};

	const layers: readonly Layer[] = [
		{
			id: 1,
			name: 'CSS transitions',
			cost: '0KB — pure CSS',
			useWhen: ['Hover, focus, press', 'Class toggles on persistent elements'],
			example: 'A card lifts on hover.'
		},
		{
			id: 2,
			name: 'Svelte transitions',
			cost: 'Built into Svelte',
			useWhen: ['{#if} mount / unmount', '{#each} keyed add / remove'],
			example: 'Toast notifications fading in and out.'
		},
		{
			id: 3,
			name: 'svelte/motion',
			cost: 'Built into Svelte',
			useWhen: ['Interpolating a single value', 'Cursor followers and dragged values'],
			example: 'A progress ring filling smoothly.'
		},
		{
			id: 4,
			name: 'GSAP',
			cost: '~50KB gzipped',
			useWhen: [
				'Complex multi-step timelines',
				'Scroll-triggered reveals and scrub',
				'2D grid staggers',
				'SVG path drawing and morphing'
			],
			example: 'A scroll-driven marketing page with pinned sections.'
		}
	];

	const reduced = $derived(prefersReducedMotion.current);

	let mounted: boolean = $state(false);
	$effect(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>Lesson 7.1 · What is GSAP · Ultimate Frontend</title>
	<meta
		name="description"
		content="The four layers of animation in a modern Svelte app, and how to pick between them."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 7.1 · Mini-build</p>
		<h1>Four layers of animation. One decision.</h1>
		<p class="lead">
			Before you install GSAP, understand where each of the four animation layers shines.
			Most interactions on a real site never need GSAP at all — and that is a good thing.
		</p>
	</header>

	{#if mounted}
		<ul class="grid" role="list">
			{#each layers as layer, i (layer.id)}
				<li
					class="card"
					in:fly={{
						y: reduced ? 0 : 20,
						duration: reduced ? 0 : DUR.base,
						delay: reduced ? 0 : i * 80,
						easing: cubicOut
					}}
				>
					<p class="card__num">Layer {layer.id}</p>
					<h2 class="card__title">{layer.name}</h2>
					<p class="card__cost">Cost: <strong>{layer.cost}</strong></p>
					<p class="card__heading">Use when</p>
					<ul class="card__list">
						{#each layer.useWhen as reason (reason)}
							<li>{reason}</li>
						{/each}
					</ul>
					<p class="card__example"><em>{layer.example}</em></p>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(78% 0.17 85);
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
	}

	.card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}

	.card__num {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin: 0;
	}

	.card__title {
		margin: 0 0 var(--space-sm);
	}

	.card__cost,
	.card__heading {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0 0 var(--space-xs);
	}

	.card__list {
		margin: 0 0 var(--space-md);
		padding-inline-start: 1.2em;
	}

	.card__example {
		color: var(--color-text-muted);
		margin: 0;
	}
</style>
