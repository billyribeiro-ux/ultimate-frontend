<!--
	Lesson 11.2 — Svelte context API
	Mini-build: three dashboard cards each with their own theme context,
	proving that context is scoped per-subtree, not global.
-->
<script lang="ts">
	import { setContext, getContext } from 'svelte';

	interface CardTheme {
		accent: string;
		label: string;
	}

	const CARD_THEME_KEY: symbol = Symbol('card-theme');

	function setCardTheme(theme: CardTheme): CardTheme {
		return setContext<CardTheme>(CARD_THEME_KEY, theme);
	}

	function getCardTheme(): CardTheme {
		const value = getContext<CardTheme | undefined>(CARD_THEME_KEY);
		if (!value) throw new Error('getCardTheme() requires a provider');
		return value;
	}

	// Three independent cards, each with its own reactive theme.
	const cardA: CardTheme = $state({ accent: 'oklch(72% 0.2 85)', label: 'Amber' });
	const cardB: CardTheme = $state({ accent: 'oklch(68% 0.2 200)', label: 'Cyan' });
	const cardC: CardTheme = $state({ accent: 'oklch(70% 0.2 320)', label: 'Magenta' });

	const palette: string[] = [
		'oklch(72% 0.2 85)',
		'oklch(68% 0.2 200)',
		'oklch(70% 0.2 320)',
		'oklch(70% 0.18 150)',
		'oklch(65% 0.22 25)'
	];

	function cycle(theme: CardTheme, label: string): void {
		const index = palette.indexOf(theme.accent);
		theme.accent = palette[(index + 1) % palette.length];
		theme.label = label;
	}
</script>

<svelte:head>
	<title>Lesson 11.2 · Context API · Ultimate Frontend</title>
	<meta
		name="description"
		content="Three dashboard cards sharing theme through Svelte's typed setContext and getContext API, each scoped to its own subtree."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/11-state">← Module 11</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 11.2 · Mini-build</p>
		<h1>Three cards, three themes, one API</h1>
		<p class="lede">
			Each card calls <code>setContext</code> with its own theme object. The deeply nested
			badge inside each card calls <code>getContext</code> and receives only its own card's
			theme — never the neighbours'.
		</p>
	</header>

	<div class="cards">
		{#each [{ theme: cardA, label: 'Card A' }, { theme: cardB, label: 'Card B' }, { theme: cardC, label: 'Card C' }] as card (card.label)}
			{@const _ = setCardTheme(card.theme)}
			<article class="card" style:--card-accent={card.theme.accent}>
				<header>
					<h2>{card.label}</h2>
					<p class="muted">Accent: {card.theme.label}</p>
				</header>

				<!-- Deeply nested subtree — still reads the same context. -->
				<div class="wrap-1">
					<div class="wrap-2">
						<div class="wrap-3">
							{@const nested = getCardTheme()}
							<span class="badge" style:background={nested.accent}>
								{nested.label}
							</span>
						</div>
					</div>
				</div>

				<button
					type="button"
					onclick={() => cycle(card.theme, card.label)}
				>
					Cycle accent
				</button>
			</article>
		{/each}
	</div>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.2 200);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
		}
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.cards {
		display: grid;
		gap: var(--space-md);
		grid-template-columns: 1fr;

		@media (min-width: 768px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.card {
		display: grid;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-top: 4px solid var(--card-accent);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.card h2 {
		font-size: var(--text-lg);
		color: var(--card-accent);
		margin: 0;
	}

	.muted {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: 0;
	}

	.wrap-1,
	.wrap-2,
	.wrap-3 {
		padding: var(--space-xs);
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-sm);
	}

	.badge {
		display: inline-block;
		padding: var(--space-xs) var(--space-sm);
		color: oklch(15% 0.02 270);
		border-radius: var(--radius-full);
		font-weight: 700;
		font-size: var(--text-sm);
	}

	.card button {
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: var(--color-surface);
		border: 1px solid var(--card-accent);
		border-radius: var(--radius-md);
		color: var(--card-accent);
		font-weight: 600;
		transition: background var(--dur-fast) var(--ease-out);
	}

	.card button:hover {
		background: oklch(from var(--card-accent) 96% 0.03 h);
	}

	@media (prefers-reduced-motion: reduce) {
		.card button {
			transition: none;
		}
	}
</style>
