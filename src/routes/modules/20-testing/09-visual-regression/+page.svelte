<script lang="ts">
	let bgColor: string = $state('var(--color-brand)');
	let borderRadius: string = $state('var(--radius-md)');
	let padding: string = $state('var(--space-md)');
	let fontSize: string = $state('var(--text-base)');
	let threshold: number = $state(0.01);

	const baselineStyles = { bg: 'var(--color-brand)', radius: 'var(--radius-md)', padding: 'var(--space-md)', fontSize: 'var(--text-base)' };

	let hasDiff: boolean = $derived(
		bgColor !== baselineStyles.bg ||
		borderRadius !== baselineStyles.radius ||
		padding !== baselineStyles.padding ||
		fontSize !== baselineStyles.fontSize
	);

	let diffCount: number = $derived(
		[bgColor !== baselineStyles.bg, borderRadius !== baselineStyles.radius, padding !== baselineStyles.padding, fontSize !== baselineStyles.fontSize].filter(Boolean).length
	);

	function resetToBaseline(): void {
		bgColor = baselineStyles.bg;
		borderRadius = baselineStyles.radius;
		padding = baselineStyles.padding;
		fontSize = baselineStyles.fontSize;
	}
</script>

<svelte:head>
	<title>20.9 — Visual Regression · Testing Deep Dive</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 20.9 · Mini-build</p>
		<h1>Visual Diff Simulator</h1>
		<p class="lede">
			Modify CSS properties and see how visual regression testing
			detects the difference from the baseline.
		</p>
	</header>

	<section class="controls" aria-labelledby="controls-heading">
		<h2 id="controls-heading" class="sr-only">Style Controls</h2>
		<label class="field">
			<span class="field__label">Background</span>
			<select class="field__input" bind:value={bgColor}>
				<option value="var(--color-brand)">Brand</option>
				<option value="var(--color-success)">Success</option>
				<option value="var(--color-error)">Error</option>
				<option value="var(--color-warning)">Warning</option>
			</select>
		</label>
		<label class="field">
			<span class="field__label">Border Radius</span>
			<select class="field__input" bind:value={borderRadius}>
				<option value="var(--radius-sm)">Small</option>
				<option value="var(--radius-md)">Medium</option>
				<option value="var(--radius-lg)">Large</option>
				<option value="var(--radius-full)">Full</option>
			</select>
		</label>
		<label class="field">
			<span class="field__label">Padding</span>
			<select class="field__input" bind:value={padding}>
				<option value="var(--space-xs)">XS</option>
				<option value="var(--space-sm)">SM</option>
				<option value="var(--space-md)">MD</option>
				<option value="var(--space-lg)">LG</option>
			</select>
		</label>
		<button class="btn" onclick={resetToBaseline}>Reset to Baseline</button>
	</section>

	<div class="comparison">
		<section class="compare-panel" aria-labelledby="baseline-heading">
			<h2 id="baseline-heading" class="compare-title">Baseline</h2>
			<div class="preview-component" style="background: var(--color-brand); border-radius: var(--radius-md); padding: var(--space-md); font-size: var(--text-base);">
				<span style="color: oklch(100% 0 0); font-weight: 600;">Submit</span>
			</div>
		</section>

		<section class="compare-panel" aria-labelledby="actual-heading">
			<h2 id="actual-heading" class="compare-title">Actual</h2>
			<div class="preview-component" style="background: {bgColor}; border-radius: {borderRadius}; padding: {padding}; font-size: {fontSize};">
				<span style="color: oklch(100% 0 0); font-weight: 600;">Submit</span>
			</div>
		</section>

		<section class="compare-panel" aria-labelledby="diff-heading">
			<h2 id="diff-heading" class="compare-title">Diff</h2>
			<div class="diff-result" class:diff-result--changed={hasDiff} class:diff-result--same={!hasDiff}>
				{#if hasDiff}
					<p class="diff-status">FAIL: {diffCount} propert{diffCount === 1 ? 'y' : 'ies'} changed</p>
				{:else}
					<p class="diff-status">PASS: No visual differences</p>
				{/if}
			</div>
		</section>
	</div>

	<section class="code-section" aria-labelledby="code-heading">
		<h2 id="code-heading">Playwright Screenshot Test</h2>
		<pre class="code-block"><code>{`test('button matches visual baseline', async ({ page }) => {
  await page.goto('/components/button');
  const button = page.getByRole('button', { name: 'Submit' });

  await expect(button).toHaveScreenshot('button-submit.png', {
    maxDiffPixelRatio: ${threshold}
  });
});`}</code></pre>
	</section>
</section>

<style>
	.eyebrow { font-size: var(--text-sm); color: var(--color-brand); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
	.lede { font-size: var(--text-lg); color: var(--color-text-muted); max-inline-size: 50ch; }
	.controls { display: flex; gap: var(--space-md); flex-wrap: wrap; align-items: end; }
	.field { display: grid; gap: var(--space-xs); min-inline-size: 8rem; }
	.field__label { font-size: var(--text-xs); font-weight: 600; color: var(--color-text-muted); }
	.field__input { padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); font-size: var(--text-sm); min-block-size: 44px; }
	.btn { padding: var(--space-xs) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600; min-block-size: 44px; transition: border-color var(--dur-fast) var(--ease-out); }
	.btn:hover { border-color: var(--color-brand); }
	.comparison { display: grid; gap: var(--space-md); grid-template-columns: 1fr 1fr 1fr; }
	@media (max-width: 767px) { .comparison { grid-template-columns: 1fr; } }
	.compare-panel { padding: var(--space-md); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); text-align: center; }
	.compare-title { font-size: var(--text-xs); font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-block-end: var(--space-md); }
	.preview-component { display: inline-block; min-inline-size: 6rem; text-align: center; }
	.diff-result { padding: var(--space-lg); border-radius: var(--radius-md); display: grid; place-items: center; min-block-size: 4rem; }
	.diff-result--same { background: oklch(90% 0.05 145 / 0.2); }
	.diff-result--changed { background: oklch(90% 0.05 25 / 0.2); }
	.diff-status { font-size: var(--text-sm); font-weight: 700; }
	.diff-result--same .diff-status { color: var(--color-success); }
	.diff-result--changed .diff-status { color: var(--color-error); }
	.code-section { padding: var(--space-lg); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
	.code-block { background: var(--color-surface); padding: var(--space-md); border-radius: var(--radius-md); overflow-x: auto; font-size: var(--text-xs); line-height: 1.6; white-space: pre; margin-block-start: var(--space-md); }
	.sr-only { position: absolute; inline-size: 1px; block-size: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
</style>
