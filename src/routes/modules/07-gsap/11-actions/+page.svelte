<!--
	Lesson 7.11 — Svelte use: actions and the attachment pattern
-->
<script lang="ts">
	import { lift } from '$lib/actions/lift';

	type Card = { id: number; title: string; distance: number };

	const cards: readonly Card[] = [
		{ id: 1, title: 'Subtle', distance: -3 },
		{ id: 2, title: 'Default', distance: -6 },
		{ id: 3, title: 'Bold', distance: -10 },
		{ id: 4, title: 'Subtle', distance: -3 },
		{ id: 5, title: 'Default', distance: -6 },
		{ id: 6, title: 'Bold', distance: -10 }
	];
</script>

<svelte:head>
	<title>Lesson 7.11 · Actions · Ultimate Frontend</title>
	<meta name="description" content="Six cards sharing a single use:lift action with parameterised distance." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 7.11 · Mini-build</p>
		<h1>One action, six cards</h1>
		<p class="lead">
			Each card applies <code>use:lift</code> with a different distance. Hover or keyboard-focus
			to see the lift. The action's cleanup kills listeners and GSAP tweens on unmount.
		</p>
	</header>

	<ul class="grid" role="list">
		{#each cards as card (card.id)}
			<li>
				<button class="card" type="button" use:lift={{ distance: card.distance }}>
					<strong>{card.title}</strong>
					<span>Lift: {card.distance}px</span>
				</button>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(66% 0.18 250);
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

		@media (min-width: 768px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.grid > li {
		display: flex;
	}

	.card {
		flex: 1;
		padding: var(--space-xl);
		background: linear-gradient(135deg, var(--color-brand), oklch(48% 0.17 250));
		color: var(--color-surface);
		border-radius: var(--radius-lg);
		text-align: start;
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		min-block-size: 2.75rem;
	}

	.card strong {
		font-size: var(--text-lg);
	}

	.card span {
		font-size: var(--text-sm);
		opacity: 0.85;
	}
</style>
