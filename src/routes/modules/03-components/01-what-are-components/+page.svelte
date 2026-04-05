<!--
	Lesson 3.1 mini-build — Two info cards, one component.
	Prove that extraction removes duplication: same compiled hash on both <article>s,
	same source file in Sources tab, same styles travelling with the component.
-->
<script lang="ts">
	import InfoCard from '$lib/components/InfoCard.svelte';
</script>

<svelte:head>
	<title>Lesson 3.1 · What components are · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 3.1 mini-build: extract duplicated markup into a shared InfoCard component and prove the result with DevTools."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/03-components">← Module 3</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 3.1 · Mini-build</p>
		<h1>Two cards, one component</h1>
		<p class="lede">
			Both cards below are rendered from the same <code>InfoCard.svelte</code> file. Open
			DevTools and confirm the compiled class hash is identical on each
			<code>&lt;article&gt;</code>.
		</p>
	</header>

	<div class="grid">
		<InfoCard />
		<InfoCard />
	</div>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 30);
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

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
