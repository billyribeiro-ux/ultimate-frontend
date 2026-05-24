<script lang="ts">
	type ComparisonMode = 'side-by-side' | 'overlay' | 'diff';

	interface ScreenshotPair {
		id: string;
		name: string;
		baseline: string[][];
		current: string[][];
		threshold: number;
	}

	const GRID_SIZE: number = 8;

	function generateGrid(seed: number, variation: number): string[][] {
		const rows: string[][] = [];
		for (let r: number = 0; r < GRID_SIZE; r++) {
			const row: string[] = [];
			for (let c: number = 0; c < GRID_SIZE; c++) {
				const hash: number = ((seed * 31 + r * 17 + c * 13 + variation) % 360);
				const lightness: number = 40 + (hash % 50);
				row.push(`oklch(${lightness}% 0.15 ${hash})`);
			}
			rows.push(row);
		}
		return rows;
	}

	function generateDiffGrid(seed: number): string[][] {
		const base: string[][] = generateGrid(seed, 0);
		const modified: string[][] = base.map((row: string[]) => [...row]);
		modified[2][3] = 'oklch(60% 0.25 25)';
		modified[2][4] = 'oklch(55% 0.22 30)';
		modified[5][1] = 'oklch(65% 0.20 15)';
		modified[5][2] = 'oklch(58% 0.18 20)';
		modified[6][6] = 'oklch(70% 0.22 35)';
		return modified;
	}

	const screenshots: ScreenshotPair[] = [
		{
			id: 'button-primary',
			name: 'Button — Primary',
			baseline: generateGrid(42, 0),
			current: generateGrid(42, 0),
			threshold: 0.01
		},
		{
			id: 'button-hover',
			name: 'Button — Hover',
			baseline: generateGrid(73, 0),
			current: generateDiffGrid(73),
			threshold: 0.01
		},
		{
			id: 'card-elevated',
			name: 'Card — Elevated',
			baseline: generateGrid(99, 0),
			current: generateGrid(99, 0),
			threshold: 0.02
		},
		{
			id: 'input-error',
			name: 'Input — Error',
			baseline: generateGrid(55, 0),
			current: generateDiffGrid(55),
			threshold: 0.01
		}
	];

	let comparisonMode: ComparisonMode = $state('side-by-side');
	let selectedPairIdx: number = $state(1);
	let overlayOpacity: number = $state(50);

	let selectedPair: ScreenshotPair = $derived(screenshots[selectedPairIdx]);

	function computeDiffPercent(baseline: string[][], current: string[][]): number {
		let diffCount: number = 0;
		const total: number = GRID_SIZE * GRID_SIZE;
		for (let r: number = 0; r < GRID_SIZE; r++) {
			for (let c: number = 0; c < GRID_SIZE; c++) {
				if (baseline[r][c] !== current[r][c]) {
					diffCount += 1;
				}
			}
		}
		return Math.round((diffCount / total) * 10000) / 100;
	}

	let diffPercent: number = $derived(
		computeDiffPercent(selectedPair.baseline, selectedPair.current)
	);

	let testPassed: boolean = $derived(diffPercent / 100 <= selectedPair.threshold);

	const modes: ComparisonMode[] = ['side-by-side', 'overlay', 'diff'];
</script>

<svelte:head>
	<title>23.5 — Visual Regression in CI · Design System Engineering</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 23.5 · Mini-build</p>
		<h1>Visual Regression Viewer</h1>
		<p class="lede">
			Compare baseline and current screenshots pixel-by-pixel.
			Switch between side-by-side, overlay, and diff views.
		</p>
	</header>

	<div class="test-list">
		{#each screenshots as pair, idx (pair.id)}
			{@const pctDiff = computeDiffPercent(pair.baseline, pair.current)}
			{@const passed = pctDiff / 100 <= pair.threshold}
			<button
				type="button"
				class="test-item"
				class:test-item--active={idx === selectedPairIdx}
				class:test-item--pass={passed}
				class:test-item--fail={!passed}
				onclick={() => { selectedPairIdx = idx; }}
			>
				<span class="test-status">{passed ? 'PASS' : 'FAIL'}</span>
				<span class="test-name">{pair.name}</span>
				<span class="test-diff">{pctDiff}%</span>
			</button>
		{/each}
	</div>

	<div class="viewer-controls">
		<div class="mode-switcher" role="radiogroup" aria-label="Comparison mode">
			{#each modes as mode (mode)}
				<label class="mode-label">
					<input
						type="radio"
						name="comparison-mode"
						value={mode}
						checked={comparisonMode === mode}
						onchange={() => { comparisonMode = mode; }}
					/>
					{mode}
				</label>
			{/each}
		</div>

		<div class="test-result" class:test-result--pass={testPassed} class:test-result--fail={!testPassed}>
			{testPassed ? 'PASS' : 'FAIL'} — {diffPercent}% diff (threshold: {selectedPair.threshold * 100}%)
		</div>
	</div>

	{#if comparisonMode === 'overlay'}
		<div class="overlay-control">
			<label class="slider-label">
				Opacity: {overlayOpacity}%
				<input
					type="range"
					min="0"
					max="100"
					bind:value={overlayOpacity}
				/>
			</label>
		</div>
	{/if}

	<div class="viewer" class:viewer--side-by-side={comparisonMode === 'side-by-side'}>
		{#if comparisonMode === 'side-by-side'}
			<div class="screenshot-panel">
				<h3>Baseline</h3>
				<div class="pixel-grid" role="img" aria-label="Baseline screenshot">
					{#each selectedPair.baseline as row, rIdx (rIdx)}
						{#each row as pixel, cIdx (cIdx)}
							<div class="pixel" style:background={pixel}></div>
						{/each}
					{/each}
				</div>
			</div>
			<div class="screenshot-panel">
				<h3>Current</h3>
				<div class="pixel-grid" role="img" aria-label="Current screenshot">
					{#each selectedPair.current as row, rIdx (rIdx)}
						{#each row as pixel, cIdx (cIdx)}
							<div class="pixel" style:background={pixel}></div>
						{/each}
					{/each}
				</div>
			</div>

		{:else if comparisonMode === 'overlay'}
			<div class="screenshot-panel overlay-panel">
				<h3>Overlay</h3>
				<div class="overlay-container">
					<div class="pixel-grid" role="img" aria-label="Baseline layer">
						{#each selectedPair.baseline as row, rIdx (rIdx)}
							{#each row as pixel, cIdx (cIdx)}
								<div class="pixel" style:background={pixel}></div>
							{/each}
						{/each}
					</div>
					<div
						class="pixel-grid overlay-layer"
						style:opacity={overlayOpacity / 100}
						role="img"
						aria-label="Current layer"
					>
						{#each selectedPair.current as row, rIdx (rIdx)}
							{#each row as pixel, cIdx (cIdx)}
								<div class="pixel" style:background={pixel}></div>
							{/each}
						{/each}
					</div>
				</div>
			</div>

		{:else}
			<div class="screenshot-panel">
				<h3>Diff</h3>
				<div class="pixel-grid" role="img" aria-label="Difference view">
					{#each selectedPair.baseline as row, rIdx (rIdx)}
						{#each row as pixel, cIdx (cIdx)}
							{@const isDiff = pixel !== selectedPair.current[rIdx][cIdx]}
							<div
								class="pixel"
								class:pixel--diff={isDiff}
								style:background={isDiff ? 'oklch(65% 0.28 25)' : 'oklch(92% 0.01 270)'}
							></div>
						{/each}
					{/each}
				</div>
			</div>
		{/if}
	</div>
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

	.test-list {
		display: grid;
		gap: var(--space-xs);
	}

	@media (min-width: 768px) {
		.test-list {
			grid-template-columns: 1fr 1fr;
		}
	}

	.test-item {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		text-align: start;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.test-item--active {
		border-color: var(--color-brand);
	}

	.test-status {
		font-family: ui-monospace, monospace;
		font-weight: 700;
		font-size: var(--text-xs);
		padding: 0.15em 0.5em;
		border-radius: var(--radius-sm);
	}

	.test-item--pass .test-status {
		background: oklch(85% 0.1 145);
		color: oklch(30% 0.1 145);
	}

	.test-item--fail .test-status {
		background: oklch(85% 0.1 25);
		color: oklch(30% 0.1 25);
	}

	.test-diff {
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.viewer-controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-md);
	}

	.mode-switcher {
		display: flex;
		gap: var(--space-sm);
	}

	.mode-label {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.test-result {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		font-weight: 700;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.test-result--pass {
		background: oklch(85% 0.1 145);
		color: oklch(30% 0.1 145);
	}

	.test-result--fail {
		background: oklch(85% 0.1 25);
		color: oklch(30% 0.1 25);
	}

	.overlay-control {
		max-inline-size: 20rem;
	}

	.slider-label {
		display: grid;
		gap: var(--space-xs);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.viewer {
		display: grid;
		gap: var(--space-lg);
	}

	.viewer--side-by-side {
		grid-template-columns: 1fr;
	}

	@media (min-width: 768px) {
		.viewer--side-by-side {
			grid-template-columns: 1fr 1fr;
		}
	}

	.screenshot-panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-md);
	}

	.pixel-grid {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 2px;
		aspect-ratio: 1;
	}

	.pixel {
		border-radius: 2px;
		aspect-ratio: 1;
	}

	.pixel--diff {
		animation: pulse-diff 1s ease-in-out infinite alternate;
	}

	@keyframes pulse-diff {
		from { opacity: 0.7; }
		to { opacity: 1; }
	}

	.overlay-container {
		position: relative;
	}

	.overlay-layer {
		position: absolute;
		inset: 0;
	}

	h3 {
		margin-block-end: var(--space-sm);
		font-size: var(--text-base);
	}

	@media (prefers-reduced-motion: reduce) {
		.pixel--diff {
			animation: none;
		}
	}
</style>
