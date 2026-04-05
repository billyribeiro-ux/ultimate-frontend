<!--
	Lesson 9A.6 — three-city weather dashboard, all fetched in parallel.
-->
<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Lesson 9A.6 · Parallel loading · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 9A.6 mini-build — three Open-Meteo requests fired in parallel with Promise.all."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09a-load">← Module 9A</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9A.6 · Mini-build</p>
		<h1>Three cities, one await</h1>
		<p class="lede">
			All three forecasts were fetched in parallel with <code>Promise.all</code>. The total
			wall-clock time below is approximately the slowest of the three, not the sum.
		</p>
	</header>

	<p class="timing">
		Total load time: <strong>{data.elapsedMs.toFixed(1)} ms</strong>
	</p>

	<div class="grid">
		{#each data.cities as city (city.name)}
			<article class="card">
				<p class="card__name">{city.name}</p>
				<p class="card__temp">{city.forecast.current.temperature_2m.toFixed(1)} {city.forecast.current_units.temperature_2m}</p>
				<p class="card__time">
					<time datetime={city.forecast.current.time}>{city.forecast.current.time}</time>
				</p>
			</article>
		{/each}
	</div>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.16 210);
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

	.timing {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.grid {
		display: grid;
		gap: var(--space-md);

		@media (min-width: 480px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		min-block-size: 44px;
	}

	.card__name {
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		margin: 0;
	}

	.card__temp {
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--color-brand);
		margin-block: var(--space-xs);
	}

	.card__time {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
	}
</style>
