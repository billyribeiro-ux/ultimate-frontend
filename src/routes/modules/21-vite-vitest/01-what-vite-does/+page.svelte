<script lang="ts">
	type PipelineMode = 'dev' | 'prod';

	interface PipelineStage {
		id: string;
		label: string;
		tool: string;
		description: string;
		timeEstimate: string;
	}

	let activeMode: PipelineMode = $state('dev');
	let activeStageIndex: number = $state(0);

	const devStages: PipelineStage[] = [
		{
			id: 'source',
			label: 'Source Files',
			tool: 'Your editor',
			description: '.svelte, .ts, .css files saved to disk',
			timeEstimate: '0ms'
		},
		{
			id: 'scan',
			label: 'Dependency Scan',
			tool: 'esbuild',
			description: 'Pre-bundles node_modules into single ESM files',
			timeEstimate: '~200ms (first run only)'
		},
		{
			id: 'transform',
			label: 'On-Demand Transform',
			tool: 'Vite + Svelte plugin',
			description: 'Compiles .svelte, strips TypeScript, resolves imports',
			timeEstimate: '~5-20ms per file'
		},
		{
			id: 'serve',
			label: 'Dev Server',
			tool: 'Vite HTTP server',
			description: 'Serves individual ES modules to the browser',
			timeEstimate: '<1ms per request'
		},
		{
			id: 'browser',
			label: 'Browser (Native ESM)',
			tool: 'Browser module loader',
			description: 'Loads modules individually via import statements',
			timeEstimate: 'Instant'
		}
	];

	const prodStages: PipelineStage[] = [
		{
			id: 'source',
			label: 'Source Files',
			tool: 'Your editor',
			description: '.svelte, .ts, .css files on disk',
			timeEstimate: '0ms'
		},
		{
			id: 'resolve',
			label: 'Resolve & Transform',
			tool: 'Rolldown + Svelte plugin',
			description: 'Resolves all imports, compiles Svelte, strips TypeScript',
			timeEstimate: '~500ms'
		},
		{
			id: 'treeshake',
			label: 'Tree-Shaking',
			tool: 'Rolldown',
			description: 'Removes unused exports and dead code paths',
			timeEstimate: '~200ms'
		},
		{
			id: 'chunk',
			label: 'Code Splitting & Minification',
			tool: 'Rolldown + Terser',
			description: 'Creates per-route chunks, minifies JS and CSS',
			timeEstimate: '~1-3s'
		},
		{
			id: 'output',
			label: 'Static Output',
			tool: 'Filesystem',
			description: 'Fingerprinted .js and .css files in build/',
			timeEstimate: 'Written to disk'
		}
	];

	let currentStages: PipelineStage[] = $derived(
		activeMode === 'dev' ? devStages : prodStages
	);

	function toggleMode(): void {
		activeMode = activeMode === 'dev' ? 'prod' : 'dev';
		activeStageIndex = 0;
	}

	function selectStage(index: number): void {
		activeStageIndex = index;
	}
</script>

<svelte:head>
	<title>21.1 — What Vite Actually Does · Vite, Vitest & The Svelte Playground</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 21.1 · Mini-build</p>
		<h1>Vite Pipeline Visualizer</h1>
		<p class="lede">
			Toggle between dev and production modes to see how Vite processes your
			source files through completely different pipelines.
		</p>
	</header>

	<div class="mode-toggle">
		<button
			type="button"
			class="toggle-btn"
			class:toggle-btn--active={activeMode === 'dev'}
			onclick={() => { activeMode = 'dev'; activeStageIndex = 0; }}
		>
			Dev Server
		</button>
		<button
			type="button"
			class="toggle-btn"
			class:toggle-btn--active={activeMode === 'prod'}
			onclick={() => { activeMode = 'prod'; activeStageIndex = 0; }}
		>
			Production Build
		</button>
	</div>

	<div class="pipeline">
		{#each currentStages as stage, index (stage.id)}
			<button
				type="button"
				class="stage-card"
				class:stage-card--active={index === activeStageIndex}
				onclick={() => selectStage(index)}
			>
				<span class="stage-card__number">{index + 1}</span>
				<span class="stage-card__label">{stage.label}</span>
				<span class="stage-card__tool">{stage.tool}</span>
			</button>
			{#if index < currentStages.length - 1}
				<div class="arrow" aria-hidden="true">
					<span class="arrow__line"></span>
				</div>
			{/if}
		{/each}
	</div>

	<article class="detail-card" aria-live="polite">
		<h2 class="detail-card__title">
			{currentStages[activeStageIndex].label}
		</h2>
		<dl class="detail-card__info">
			<dt>Tool</dt>
			<dd>{currentStages[activeStageIndex].tool}</dd>
			<dt>What happens</dt>
			<dd>{currentStages[activeStageIndex].description}</dd>
			<dt>Time</dt>
			<dd>{currentStages[activeStageIndex].timeEstimate}</dd>
		</dl>
		<p class="detail-card__mode">
			Mode: <strong>{activeMode === 'dev' ? 'Development' : 'Production'}</strong>
		</p>
	</article>
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

	.mode-toggle {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	.toggle-btn {
		padding: var(--space-xs) var(--space-md);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out),
			background var(--dur-fast) var(--ease-out);
	}

	.toggle-btn--active {
		border-color: var(--color-brand);
		background: var(--color-surface-2);
	}

	.pipeline {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--space-xs);
	}

	@media (min-width: 768px) {
		.pipeline {
			flex-direction: row;
			align-items: center;
		}
	}

	.stage-card {
		display: grid;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: start;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out);
		flex: 1;
	}

	.stage-card--active {
		border-color: var(--color-brand);
		box-shadow: var(--shadow-md);
	}

	.stage-card__number {
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--color-brand);
	}

	.stage-card__label {
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.stage-card__tool {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.arrow {
		display: flex;
		align-items: center;
		justify-content: center;
		min-block-size: 1.5rem;
		min-inline-size: 1.5rem;
	}

	.arrow__line {
		display: block;
		inline-size: 2px;
		block-size: 1rem;
		background: var(--color-text-muted);
		border-radius: var(--radius-full);
	}

	@media (min-width: 768px) {
		.arrow__line {
			inline-size: 1.5rem;
			block-size: 2px;
		}
	}

	.detail-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.detail-card__title {
		font-size: var(--text-xl);
		margin-block-end: var(--space-md);
	}

	.detail-card__info {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		font-size: var(--text-sm);
	}

	.detail-card__info dt {
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.detail-card__mode {
		margin-block-start: var(--space-md);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
