<!--
	Lesson 6.10 — CSS transitions with motion tokens
	Three cards, three easings, zero JavaScript state. Hover (and focus-visible)
	lifts the card using a transform + opacity CSS transition built entirely
	from PE7 --dur-* and --ease-* tokens. The global prefers-reduced-motion
	reset in src/app.css collapses every transition duration automatically.
-->
<script lang="ts">
	type EasingToken = 'ease-out' | 'ease-in-out' | 'ease-expressive';

	type LiftCard = {
		id: string;
		title: string;
		blurb: string;
		easing: EasingToken;
	};

	const cards: LiftCard[] = [
		{
			id: 'ease-out',
			title: 'Ease Out',
			blurb: 'Fast start, graceful finish. Feels responsive as elements enter attention.',
			easing: 'ease-out'
		},
		{
			id: 'ease-in-out',
			title: 'Ease In Out',
			blurb: 'Symmetric. For reversible toggles — tab switches, panels, theme changes.',
			easing: 'ease-in-out'
		},
		{
			id: 'ease-expressive',
			title: 'Expressive',
			blurb: 'A slight overshoot then settle. Use sparingly for delightful moments.',
			easing: 'ease-expressive'
		}
	];
</script>

<svelte:head>
	<title>Lesson 6.10 · CSS transitions with motion tokens · Ultimate Frontend</title>
	<meta
		name="description"
		content="Three cards demonstrating PE7 --dur-* and --ease-* motion tokens driving pure CSS hover transitions."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.10 · Mini-build</p>
		<h1>Hover the cards. Feel the easing.</h1>
		<p class="lead">
			All three cards use the same <code>--dur-base</code> duration and the same transform.
			Only the easing token differs. Reduced-motion is respected by the global PE7 reset.
		</p>
	</header>

	<ul class="grid" role="list">
		{#each cards as card (card.id)}
			<li class="card ease-{card.easing}">
				<a href="#{card.id}" class="card__link">
					<p class="card__eyebrow">--ease-{card.easing}</p>
					<h2 class="card__title">{card.title}</h2>
					<p class="card__blurb">{card.blurb}</p>
					<span class="card__cta">View details →</span>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 40);
	}

	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.crumbs a:hover {
		color: var(--color-brand);
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
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.card {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);

		/* Two composited properties, one duration token, different easing per card. */
		transition:
			transform var(--dur-base) var(--ease-out),
			box-shadow var(--dur-base) var(--ease-out);
	}

	.card.ease-ease-in-out {
		transition:
			transform var(--dur-base) var(--ease-in-out),
			box-shadow var(--dur-base) var(--ease-in-out);
	}

	.card.ease-ease-expressive {
		transition:
			transform var(--dur-base) var(--ease-expressive),
			box-shadow var(--dur-base) var(--ease-expressive);
	}

	.card:hover,
	.card:focus-within {
		transform: translateY(-4px) scale(1.01);
		box-shadow: var(--shadow-lg);
	}

	.card__link {
		display: block;
		padding: var(--space-lg);
		text-decoration: none;
		color: var(--color-text);
		min-block-size: 2.75rem;
	}

	.card__eyebrow {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		margin: 0 0 var(--space-xs);
	}

	.card__title {
		font-size: var(--text-lg);
		margin: 0 0 var(--space-sm);
	}

	.card__blurb {
		color: var(--color-text-muted);
		margin: 0 0 var(--space-md);
	}

	.card__cta {
		color: var(--color-brand);
		font-weight: 600;
	}
</style>
