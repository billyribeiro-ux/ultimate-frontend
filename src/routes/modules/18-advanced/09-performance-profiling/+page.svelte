<script lang="ts">
	interface PerfMetric {
		name: string;
		value: number;
		budget: number;
		unit: string;
	}

	let metrics: PerfMetric[] = $state.raw([
		{ name: 'LCP', value: 1.8, budget: 2.5, unit: 's' },
		{ name: 'INP', value: 120, budget: 200, unit: 'ms' },
		{ name: 'CLS', value: 0.05, budget: 0.1, unit: '' },
		{ name: 'Bundle Size', value: 98, budget: 150, unit: 'KB' },
		{ name: 'Memory', value: 12, budget: 50, unit: 'MB' }
	]);

	function getStatus(metric: PerfMetric): 'good' | 'warning' | 'bad' {
		const ratio: number = metric.value / metric.budget;
		if (ratio <= 0.6) return 'good';
		if (ratio <= 0.9) return 'warning';
		return 'bad';
	}

	function getBarWidth(metric: PerfMetric): number {
		return Math.min((metric.value / metric.budget) * 100, 100);
	}

	function simulateMeasurement(): void {
		metrics = metrics.map((m) => ({
			...m,
			value: +(m.budget * (0.2 + Math.random() * 1.1)).toFixed(
				m.unit === '' ? 3 : m.unit === 's' ? 1 : 0
			)
		}));
	}

	function resetMetrics(): void {
		metrics = [
			{ name: 'LCP', value: 1.8, budget: 2.5, unit: 's' },
			{ name: 'INP', value: 120, budget: 200, unit: 'ms' },
			{ name: 'CLS', value: 0.05, budget: 0.1, unit: '' },
			{ name: 'Bundle Size', value: 98, budget: 150, unit: 'KB' },
			{ name: 'Memory', value: 12, budget: 50, unit: 'MB' }
		];
	}

	let passingCount: number = $derived(
		metrics.filter((m) => getStatus(m) !== 'bad').length
	);
	let totalCount: number = $derived(metrics.length);
</script>

<svelte:head>
	<title>18.9 — Performance Profiling · Advanced Patterns</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 18.9 · Mini-build</p>
		<h1>Performance Profiling &amp; Optimization</h1>
		<p class="lede">
			Measure before you optimize. A performance budget dashboard that tracks
			Core Web Vitals and resource metrics against hard thresholds.
		</p>
	</header>

	<section class="dashboard" aria-labelledby="metrics-heading">
		<div class="dashboard__header">
			<h2 id="metrics-heading">Performance Budget</h2>
			<p class="dashboard__summary">
				{passingCount}/{totalCount} metrics within budget
			</p>
		</div>

		<ul class="metric-list">
			{#each metrics as metric (metric.name)}
				{@const status = getStatus(metric)}
				{@const width = getBarWidth(metric)}
				<li class="metric">
					<div class="metric__header">
						<span class="metric__name">{metric.name}</span>
						<span
							class="metric__value"
							class:metric__value--good={status === 'good'}
							class:metric__value--warning={status === 'warning'}
							class:metric__value--bad={status === 'bad'}
						>
							{metric.value}{metric.unit}
						</span>
						<span class="metric__budget">/ {metric.budget}{metric.unit}</span>
					</div>
					<div class="metric__bar-track">
						<div
							class="metric__bar-fill"
							class:metric__bar-fill--good={status === 'good'}
							class:metric__bar-fill--warning={status === 'warning'}
							class:metric__bar-fill--bad={status === 'bad'}
							style="inline-size: {width}%"
							role="progressbar"
							aria-valuenow={metric.value}
							aria-valuemin={0}
							aria-valuemax={metric.budget}
							aria-label="{metric.name}: {metric.value}{metric.unit} of {metric.budget}{metric.unit} budget"
						></div>
					</div>
				</li>
			{/each}
		</ul>

		<div class="actions">
			<button class="btn btn--primary" onclick={simulateMeasurement}>
				Simulate Measurement
			</button>
			<button class="btn" onclick={resetMetrics}>Reset</button>
		</div>
	</section>

	<section class="explanation" aria-labelledby="how-heading">
		<h2 id="how-heading">Profiling Workflow</h2>
		<ol class="steps">
			<li><strong>Record</strong> — capture a Performance trace during the slow interaction</li>
			<li><strong>Identify</strong> — find long tasks (&gt;50ms) in the flame chart</li>
			<li><strong>Hypothesize</strong> — determine whether the cause is reactivity, layout thrash, or network</li>
			<li><strong>Fix</strong> — apply $state.raw(), batch reads/writes, or parallelize fetches</li>
			<li><strong>Re-record</strong> — verify the fix actually improved the metric</li>
		</ol>
	</section>
</section>

<style>
	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 50ch;
	}

	.dashboard {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.dashboard__header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-block-end: var(--space-lg);
	}

	.dashboard__summary {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.metric-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-md);
		margin-block-end: var(--space-lg);
	}

	.metric__header {
		display: flex;
		align-items: baseline;
		gap: var(--space-xs);
		margin-block-end: var(--space-xs);
	}

	.metric__name {
		font-weight: 600;
		font-size: var(--text-sm);
		min-inline-size: 6rem;
	}

	.metric__value {
		font-variant-numeric: tabular-nums;
		font-weight: 700;
		font-size: var(--text-base);
	}

	.metric__value--good { color: var(--color-success); }
	.metric__value--warning { color: var(--color-warning); }
	.metric__value--bad { color: var(--color-error); }

	.metric__budget {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.metric__bar-track {
		block-size: 0.5rem;
		background: var(--color-surface);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.metric__bar-fill {
		block-size: 100%;
		border-radius: var(--radius-full);
		transition: inline-size var(--dur-base) var(--ease-out);
	}

	.metric__bar-fill--good { background: var(--color-success); }
	.metric__bar-fill--warning { background: var(--color-warning); }
	.metric__bar-fill--bad { background: var(--color-error); }

	.actions {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.btn {
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.btn:hover {
		border-color: var(--color-brand);
	}

	.btn--primary {
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-color: var(--color-brand);
	}

	.btn--primary:hover {
		background: var(--color-brand-dim);
	}

	.explanation {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.steps {
		padding-inline-start: var(--space-md);
		display: grid;
		gap: var(--space-sm);
		font-size: var(--text-sm);
	}
</style>
