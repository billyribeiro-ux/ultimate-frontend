<script lang="ts">
	interface ScopedCard {
		id: string;
		title: string;
		body: string;
	}

	const cards: ScopedCard[] = [
		{
			id: 'a',
			title: 'Scoped by default',
			body: 'This .card class only matches elements in this file, thanks to the hash Svelte adds at compile time.'
		},
		{
			id: 'b',
			title: 'No BEM required',
			body: 'You can write short, unprefixed class names because the compiler guarantees uniqueness across files.'
		},
		{
			id: 'c',
			title: 'Zero runtime',
			body: 'The browser sees ordinary classes on ordinary elements. No JavaScript style injection, no shadow DOM.'
		}
	];
</script>

<svelte:head>
	<title>Lesson 1.7 · Scoped styles · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 1.7 mini-build: three scoped cards plus a deliberately global note, to visualise Svelte's CSS scoping."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/01-foundation">← Module 1</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 1.7 · Mini-build</p>
		<h1>Scoped by the compiler</h1>
		<p class="lede">
			Open DevTools and inspect any card. The compiled class attribute has a hash suffix.
			The global note below does not.
		</p>
	</header>

	<div class="cards">
		{#each cards as card (card.id)}
			<article class="card">
				<h2>{card.title}</h2>
				<p>{card.body}</p>
			</article>
		{/each}
	</div>

	<p class="global-note">
		I am styled via <code>:global(.global-note)</code>. My class attribute has no hash.
	</p>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 80);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;

			&:hover {
				color: var(--color-brand);
			}
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

		@media (min-width: 768px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);

		& h2 {
			font-size: var(--text-lg);
			margin-block-end: var(--space-sm);
			color: var(--color-brand);
		}

		& p {
			margin: 0;
			color: var(--color-text-muted);
		}
	}

	:global(.global-note) {
		padding: var(--space-md);
		background: oklch(95% 0.05 80);
		border-inline-start: 4px solid oklch(70% 0.2 80);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
	}
</style>
