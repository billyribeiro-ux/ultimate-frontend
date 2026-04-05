<!--
	Lesson 8.11 — hub page with two links. Navigating to either one should
	trigger a view transition crossfade thanks to the sibling +layout.svelte.
-->
<script lang="ts">
	interface Scene {
		id: string;
		slug: string;
		title: string;
		description: string;
		color: string;
	}

	const scenes: Scene[] = [
		{
			id: 's1',
			slug: 'sunrise',
			title: 'Sunrise',
			description: 'A warm page that fades in over the old one.',
			color: 'oklch(75% 0.16 55)'
		},
		{
			id: 's2',
			slug: 'nightfall',
			title: 'Nightfall',
			description: 'A cool page on the other side of the transition.',
			color: 'oklch(60% 0.18 260)'
		}
	];
</script>

<svelte:head>
	<title>Lesson 8.11 · Page transitions · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 8.11 mini-build — page transitions using the View Transitions API and onNavigate."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing">← Module 8</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 8.11 · Mini-build</p>
		<h1>Pick a scene</h1>
		<p class="lede">
			Click a card. The browser should crossfade from this page to the destination thanks to the
			View Transitions API wired up in the sibling layout.
		</p>
	</header>

	<div class="grid">
		{#each scenes as scene (scene.id)}
			<a class="card" href="/modules/08-routing/11-page-transitions/{scene.slug}" style="--card-color: {scene.color}">
				<h2>{scene.title}</h2>
				<p>{scene.description}</p>
			</a>
		{/each}
	</div>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 180);
	}

	.crumbs a {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-decoration: none;
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

	.grid {
		display: grid;
		gap: var(--space-md);

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.card {
		display: block;
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--card-color);
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: inherit;
		min-block-size: 44px;
		transition: transform var(--dur-fast) var(--ease-out);

		&:hover {
			transform: translateY(-2px);
		}

		& h2 {
			font-size: var(--text-lg);
			color: var(--card-color);
			margin-block-end: var(--space-xs);
		}

		& p {
			font-size: var(--text-sm);
			color: var(--color-text-muted);
			margin: 0;
		}
	}
</style>
