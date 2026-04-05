<!--
	Lesson 3.10 mini-build — The same MediaCard in three differently-sized containers.
	Each instance uses a container query on its own root to pick between compact,
	stacked, and wide layouts. No JavaScript, no ResizeObserver.
-->
<script lang="ts">
	import MediaCard from '$lib/components/MediaCard.svelte';
</script>

<svelte:head>
	<title>Lesson 3.10 · Container queries · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 3.10 mini-build: a single MediaCard component reshapes in three different container widths via @container queries."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/03-components">← Module 3</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 3.10 · Mini-build</p>
		<h1>Three widths, one component</h1>
		<p class="lede">
			The same <code>MediaCard.svelte</code> is rendered inside a narrow sidebar column, a
			medium main column, and a wide hero. Each instance reshapes based on its own width,
			not the viewport.
		</p>
	</header>

	<div class="layout">
		<aside class="narrow">
			<MediaCard
				title="Narrow column"
				description="This card is in a 260px sidebar, so its body stacks vertically."
			/>
		</aside>

		<main class="main">
			<MediaCard
				title="Medium column"
				description="Around 480px — wide enough for a horizontal layout with the thumbnail on the left."
			/>
		</main>
	</div>

	<div class="hero">
		<MediaCard
			title="Hero width"
			description="Above 640px the card uses the largest padding and typography knobs."
		/>
	</div>
</section>

<style>
	section {
		--color-brand: oklch(66% 0.2 200);
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
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);

		@media (min-width: 768px) {
			grid-template-columns: 260px 1fr;
		}
	}

	.narrow,
	.main {
		display: flex;
	}

	.hero {
		inline-size: 100%;
	}
</style>
