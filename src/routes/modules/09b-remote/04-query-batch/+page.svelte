<script lang="ts">
	import { listCities, getWeather } from './weather.remote';

	function icon(condition: string): string {
		switch (condition) {
			case 'sun':
				return '☀';
			case 'rain':
				return '☂';
			case 'snow':
				return '❄';
			case 'cloud':
				return '☁';
			default:
				return '?';
		}
	}
</script>

<svelte:head>
	<title>Lesson 9B.4 · query.batch · Ultimate Frontend</title>
	<meta
		name="description"
		content="Collapse N+1 network waterfalls with query.batch — one request, many answers."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09b-remote">← Module 9B</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9B.4 · Batching</p>
		<h1><code>query.batch()</code> — one request, many answers</h1>
		<p class="lede">
			Each card fires a per-city query. SvelteKit collapses them into a single
			round trip.
		</p>
	</header>

	{#await listCities()}
		<p class="muted">Loading city list…</p>
	{:then ids}
		<ul class="grid">
			{#each ids as id (id)}
				<li>
					{#await getWeather(id)}
						<article class="card card--loading">Loading {id}…</article>
					{:then w}
						<article class="card" style="--t: {w.tempC}">
							<p class="card__icon" aria-hidden="true">{icon(w.condition)}</p>
							<h2>{w.city}</h2>
							<p class="card__temp">{w.tempC}°C</p>
							<p class="card__cond">{w.condition}</p>
						</article>
					{/await}
				</li>
			{/each}
		</ul>
	{/await}

	<aside class="explain">
		<h2>Open the Network tab</h2>
		<p>
			Despite rendering {6} cards, there is exactly <strong>one</strong> request
			to <code>getWeather</code>. That is batching.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.18 50);
	}
	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: var(--text-sm);
		min-block-size: 44px;
		display: inline-flex;
		align-items: center;
	}
	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.lede {
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		max-inline-size: var(--prose-max);
	}
	.muted {
		color: var(--color-text-muted);
	}
	.grid {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);

		@media (min-width: 480px) {
			grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		}
	}
	.card {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-block-end: 4px solid
			color-mix(in oklch, var(--color-brand) calc((var(--t) + 10) * 3%), var(--color-surface));
		border-radius: var(--radius-lg);
		min-block-size: 10rem;
		display: grid;
		gap: var(--space-xs);
	}
	.card__icon {
		font-size: var(--text-2xl);
		margin: 0;
	}
	.card h2 {
		font-size: var(--text-lg);
		margin: 0;
	}
	.card__temp {
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--color-brand);
		margin: 0;
	}
	.card__cond {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		text-transform: capitalize;
		margin: 0;
	}
	.card--loading {
		color: var(--color-text-muted);
	}
	.explain {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);

		& h2 {
			font-size: var(--text-lg);
			margin-block-end: var(--space-sm);
		}
	}
</style>
