<!--
	Lesson 9A.4 — weather card displaying a live Open-Meteo temperature
	fetched by the universal load through SvelteKit's enhanced fetch.
-->
<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// $derived so these recompute when `data` changes on client-side navigation.
	const temperature: string = $derived(data.forecast.current.temperature_2m.toFixed(1));
	const units: string = $derived(data.forecast.current_units.temperature_2m);
	const at: string = $derived(data.forecast.current.time);
</script>

<svelte:head>
	<title>Lesson 9A.4 · Enhanced fetch · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 9A.4 mini-build — a live weather card fetched with SvelteKit's enhanced fetch from Open-Meteo."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09a-load">← Module 9A</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9A.4 · Mini-build</p>
		<h1>Live forecast · {data.city}</h1>
		<p class="lede">
			This value was fetched by the colocated <code>+page.ts</code> using SvelteKit's enhanced
			fetch. On the initial request the fetch ran on the server and the JSON was inlined into the
			HTML, so View Source already contains the temperature.
		</p>
	</header>

	<article class="card">
		<p class="card__label">Current temperature</p>
		<p class="card__value">{temperature} {units}</p>
		<p class="card__meta">
			Observed at <time datetime={at}>{at}</time> · source:
			<a href="https://open-meteo.com" rel="noreferrer">open-meteo.com</a>
		</p>
	</article>
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

	.card {
		padding: var(--space-xl);
		background: linear-gradient(
			135deg,
			var(--color-surface-2),
			oklch(from var(--color-brand) 95% 0.05 h)
		);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.card__label {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
	}

	.card__value {
		font-size: var(--text-hero);
		font-weight: 700;
		color: var(--color-brand);
		margin-block: var(--space-xs);
	}

	.card__meta {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
