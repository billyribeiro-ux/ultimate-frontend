<script lang="ts">
	let temperature: number = $state(20);

	const fillPercent: number = $derived(
		Math.min(100, Math.max(0, (temperature / 40) * 100))
	);

	const hue: number = $derived(240 - (temperature / 40) * 240);

	const bucket: 'cold' | 'warm' | 'hot' = $derived(
		temperature < 10 ? 'cold' : temperature < 30 ? 'warm' : 'hot'
	);

	const bucketLabel: string = $derived(
		bucket === 'cold' ? 'Cold' : bucket === 'warm' ? 'Warm' : 'Hot'
	);
</script>

<svelte:head>
	<title>Lesson 2.12 · Reactive CSS · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 2.12 mini-build: a reactive thermometer driven by class:, style:, and style:-- directives."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/02-reactivity">← Module 2</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 2.12 · Mini-build</p>
		<h1>Reactive thermometer</h1>
		<p class="lede">
			Drag the slider. One <code>temperature</code> state drives a class, a custom property,
			and a derived hue in OKLCH.
		</p>
	</header>

	<article
		class="thermo"
		class:thermo--cold={bucket === 'cold'}
		class:thermo--warm={bucket === 'warm'}
		class:thermo--hot={bucket === 'hot'}
		style:--fill={fillPercent}
		style:--hue={hue}
	>
		<div class="thermo__bar">
			<div class="thermo__fill"></div>
		</div>
		<p class="thermo__value">{temperature}°C · {bucketLabel}</p>
	</article>

	<label class="slider">
		<span>Temperature</span>
		<input type="range" min="0" max="40" step="1" bind:value={temperature} />
	</label>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 200);
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

	.thermo {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: border-color var(--dur-base) var(--ease-out);
	}

	.thermo--cold {
		border-color: oklch(70% 0.2 240);
	}

	.thermo--warm {
		border-color: oklch(75% 0.18 90);
	}

	.thermo--hot {
		border-color: oklch(65% 0.22 20);
	}

	.thermo__bar {
		block-size: 2rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.thermo__fill {
		block-size: 100%;
		inline-size: calc(var(--fill) * 1%);
		background: linear-gradient(
			90deg,
			oklch(70% 0.2 240),
			oklch(70% 0.22 var(--hue))
		);
		transition: inline-size var(--dur-base) var(--ease-out);
	}

	.thermo__value {
		margin-block-start: var(--space-sm);
		font-size: var(--text-lg);
		font-weight: 700;
		color: oklch(60% 0.22 var(--hue));
	}

	.slider {
		display: grid;
		gap: var(--space-xs);
	}

	.slider span {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.slider input[type='range'] {
		inline-size: 100%;
		min-block-size: 44px;
	}

	@media (prefers-reduced-motion: reduce) {
		.thermo,
		.thermo__fill {
			transition: none;
		}
	}
</style>
