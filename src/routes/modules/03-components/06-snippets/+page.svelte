<!--
	Lesson 3.6 mini-build — Snippets: three cards, one Card component.
	Demonstrates the `children` snippet (default content) plus named `header`/`footer` snippets.
-->
<script lang="ts">
	import Card from '$lib/components/Card.svelte';
</script>

<svelte:head>
	<title>Lesson 3.6 · Snippets · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 3.6 mini-build: use snippet and render to let a parent fill the header, body, and footer of a reusable Card component."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/03-components">← Module 3</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 3.6 · Mini-build</p>
		<h1>Snippets fill the holes</h1>
		<p class="lede">
			Three different cards. One <code>Card.svelte</code> file. The parent uses snippets to
			fill in the header, body, and footer of each card.
		</p>
	</header>

	<div class="grid">
		<Card>
			{#snippet header()}
				<h2>Revenue</h2>
			{/snippet}

			<p class="metric">$41,200</p>
			<p class="delta">+12% vs last week</p>

			{#snippet footer()}
				<small>Updated 5 minutes ago</small>
			{/snippet}
		</Card>

		<Card>
			{#snippet header()}
				<h2>Sessions</h2>
			{/snippet}

			<p class="metric">7,102</p>
			<p class="delta">+3% vs last week</p>
		</Card>

		<Card>
			<p>A bare card with only a body — no header, no footer.</p>
		</Card>
	</div>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 60);
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

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);

		@media (min-width: 768px) {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}

	.metric {
		font-size: var(--text-2xl);
		font-weight: 700;
		margin: 0;
	}

	.delta {
		color: var(--color-success);
		font-size: var(--text-sm);
		margin: 0;
	}
</style>
