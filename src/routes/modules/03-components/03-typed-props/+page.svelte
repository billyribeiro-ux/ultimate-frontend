<!--
	Lesson 3.3 mini-build — Four tone-variant cards driven by a strict Props interface
	with a string-literal union type for `tone`.
-->
<script lang="ts">
	import TonedMetricCard from '$lib/components/TonedMetricCard.svelte';
</script>

<svelte:head>
	<title>Lesson 3.3 · Typed props · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 3.3 mini-build: add a strict TypeScript interface to a Svelte component's props, including a string-literal union for tone."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/03-components">← Module 3</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 3.3 · Mini-build</p>
		<h1>Typed metric cards</h1>
		<p class="lede">
			A strict <code>interface Props</code> locks down the four cards below. Try changing one
			of the tones to an invalid string and watch TypeScript refuse.
		</p>
	</header>

	<div class="grid">
		<TonedMetricCard label="Uptime" value="99.98 %" tone="success" />
		<TonedMetricCard label="Latency" value="92 ms" tone="brand" />
		<TonedMetricCard label="Warnings" value="12" tone="warning" />
		<TonedMetricCard label="Errors" value="4" tone="error" />
	</div>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.18 240);
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
