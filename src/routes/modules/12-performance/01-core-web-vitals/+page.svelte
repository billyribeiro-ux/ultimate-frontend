<!--
	Lesson 12.1 — Core Web Vitals dashboard
	Mini-build: three cards with mock LCP, CLS, INP values and a toggle to
	switch between "simulate fast" and "simulate slow" presets.
-->
<script lang="ts">
	type Status = 'good' | 'needs-work' | 'poor';

	interface Metric {
		id: 'LCP' | 'CLS' | 'INP';
		name: string;
		unit: string;
		thresholds: { good: number; needsWork: number };
		value: number;
		description: string;
	}

	const fast: Record<Metric['id'], number> = { LCP: 1.8, CLS: 0.03, INP: 120 };
	const slow: Record<Metric['id'], number> = { LCP: 4.8, CLS: 0.31, INP: 620 };

	let mode = $state<'fast' | 'slow'>('fast');

	const metrics = $derived<Metric[]>([
		{
			id: 'LCP',
			name: 'Largest Contentful Paint',
			unit: 's',
			thresholds: { good: 2.5, needsWork: 4.0 },
			value: mode === 'fast' ? fast.LCP : slow.LCP,
			description: 'When the biggest visible element finishes rendering.'
		},
		{
			id: 'CLS',
			name: 'Cumulative Layout Shift',
			unit: '',
			thresholds: { good: 0.1, needsWork: 0.25 },
			value: mode === 'fast' ? fast.CLS : slow.CLS,
			description: 'How much the page jumps around while it loads.'
		},
		{
			id: 'INP',
			name: 'Interaction to Next Paint',
			unit: 'ms',
			thresholds: { good: 200, needsWork: 500 },
			value: mode === 'fast' ? fast.INP : slow.INP,
			description: 'How fast the page responds to a click, tap, or key.'
		}
	]);

	function status(metric: Metric): Status {
		if (metric.value <= metric.thresholds.good) return 'good';
		if (metric.value <= metric.thresholds.needsWork) return 'needs-work';
		return 'poor';
	}

	function label(s: Status): string {
		if (s === 'good') return 'Good';
		if (s === 'needs-work') return 'Needs work';
		return 'Poor';
	}
</script>

<svelte:head>
	<title>Lesson 12.1 · Core Web Vitals · Ultimate Frontend</title>
	<meta
		name="description"
		content="A dashboard showing LCP, CLS, and INP against their thresholds with live-toggleable fast and slow presets."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/12-performance">← Module 12</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 12.1 · Mini-build</p>
		<h1>Three numbers that decide your ranking</h1>
		<p class="lede">
			Core Web Vitals are measured at the 75th percentile of real users. Flip the preset
			below to see what "good" and "poor" look like for each one.
		</p>
	</header>

	<div class="controls" role="group" aria-label="Preset selector">
		<button type="button" class:active={mode === 'fast'} onclick={() => (mode = 'fast')}>
			Simulate fast
		</button>
		<button type="button" class:active={mode === 'slow'} onclick={() => (mode = 'slow')}>
			Simulate slow
		</button>
	</div>

	<div class="cards">
		{#each metrics as metric (metric.id)}
			{@const s = status(metric)}
			<article class="card" data-status={s}>
				<header>
					<p class="card__id">{metric.id}</p>
					<p class="card__name">{metric.name}</p>
				</header>
				<p class="card__value">
					{metric.value}{metric.unit}
				</p>
				<p class="card__pill">{label(s)}</p>
				<p class="card__desc">{metric.description}</p>
				<dl class="card__thresholds">
					<dt>Good</dt>
					<dd>≤ {metric.thresholds.good}{metric.unit}</dd>
					<dt>Needs work</dt>
					<dd>≤ {metric.thresholds.needsWork}{metric.unit}</dd>
				</dl>
			</article>
		{/each}
	</div>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 140);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
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

	.controls {
		display: flex;
		gap: var(--space-sm);
	}

	.controls button {
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.controls button.active {
		border-color: var(--color-brand);
		color: var(--color-brand);
	}

	.cards {
		display: grid;
		gap: var(--space-md);
		grid-template-columns: 1fr;

		@media (min-width: 768px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-sm);
	}

	.card[data-status='good'] {
		border-top: 4px solid var(--color-success);
	}
	.card[data-status='needs-work'] {
		border-top: 4px solid var(--color-warning);
	}
	.card[data-status='poor'] {
		border-top: 4px solid var(--color-error);
	}

	.card__id {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		margin: 0;
	}

	.card__name {
		font-size: var(--text-lg);
		font-weight: 700;
		margin: 0;
	}

	.card__value {
		font-size: var(--text-2xl);
		font-family: ui-monospace, monospace;
		font-weight: 700;
		margin: 0;
	}

	.card__pill {
		justify-self: start;
		padding: 0.2em 0.8em;
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0;
	}

	.card[data-status='good'] .card__pill {
		background: oklch(from var(--color-success) 95% 0.04 h);
		color: var(--color-success);
	}
	.card[data-status='needs-work'] .card__pill {
		background: oklch(from var(--color-warning) 95% 0.04 h);
		color: oklch(40% 0.18 85);
	}
	.card[data-status='poor'] .card__pill {
		background: oklch(from var(--color-error) 95% 0.04 h);
		color: var(--color-error);
	}

	.card__desc {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: 0;
	}

	.card__thresholds {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-xs) var(--space-md);
		margin: 0;
		padding-block-start: var(--space-sm);
		border-block-start: 1px solid var(--color-border);
	}

	.card__thresholds dt {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.card__thresholds dd {
		margin: 0;
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
	}
</style>
