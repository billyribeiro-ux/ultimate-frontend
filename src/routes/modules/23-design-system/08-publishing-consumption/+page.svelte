<script lang="ts">
	interface ExportEntry {
		path: string;
		conditions: Record<string, string>;
		treeShakeable: boolean;
		sizeKb: number;
	}

	interface PackageConfig {
		name: string;
		version: string;
		type: string;
		svelte: string;
		types: string;
		exports: ExportEntry[];
		peerDeps: Record<string, string>;
		files: string[];
	}

	const packageConfig: PackageConfig = {
		name: '@org/ui',
		version: '1.0.0',
		type: 'module',
		svelte: './dist/index.js',
		types: './dist/index.d.ts',
		exports: [
			{
				path: '.',
				conditions: {
					types: './dist/index.d.ts',
					svelte: './dist/index.js',
					default: './dist/index.js'
				},
				treeShakeable: true,
				sizeKb: 0.2
			},
			{
				path: './Button.svelte',
				conditions: {
					types: './dist/Button.svelte.d.ts',
					svelte: './dist/Button.svelte',
					default: './dist/Button.svelte'
				},
				treeShakeable: true,
				sizeKb: 1.8
			},
			{
				path: './Input.svelte',
				conditions: {
					types: './dist/Input.svelte.d.ts',
					svelte: './dist/Input.svelte',
					default: './dist/Input.svelte'
				},
				treeShakeable: true,
				sizeKb: 2.1
			},
			{
				path: './Card.svelte',
				conditions: {
					types: './dist/Card.svelte.d.ts',
					svelte: './dist/Card.svelte',
					default: './dist/Card.svelte'
				},
				treeShakeable: true,
				sizeKb: 1.4
			},
			{
				path: './Modal.svelte',
				conditions: {
					types: './dist/Modal.svelte.d.ts',
					svelte: './dist/Modal.svelte',
					default: './dist/Modal.svelte'
				},
				treeShakeable: true,
				sizeKb: 3.2
			},
			{
				path: './styles/themes.css',
				conditions: {
					default: './dist/styles/themes.css'
				},
				treeShakeable: false,
				sizeKb: 4.5
			}
		],
		peerDeps: { svelte: '^5.0.0' },
		files: ['dist']
	};

	interface BundleComponent {
		name: string;
		included: boolean;
		sizeKb: number;
	}

	let bundleComponents: BundleComponent[] = $state([
		{ name: 'Button', included: true, sizeKb: 1.8 },
		{ name: 'Input', included: true, sizeKb: 2.1 },
		{ name: 'Card', included: false, sizeKb: 1.4 },
		{ name: 'Modal', included: false, sizeKb: 3.2 },
		{ name: 'Themes CSS', included: true, sizeKb: 4.5 }
	]);

	let totalBundleKb: number = $derived(
		bundleComponents
			.filter((c: BundleComponent) => c.included)
			.reduce((sum: number, c: BundleComponent) => sum + c.sizeKb, 0)
	);

	let fullBundleKb: number = $derived(
		bundleComponents.reduce((sum: number, c: BundleComponent) => sum + c.sizeKb, 0)
	);

	let treeSavingsPercent: number = $derived(
		fullBundleKb > 0
			? Math.round((1 - totalBundleKb / fullBundleKb) * 100)
			: 0
	);

	let selectedExportIdx: number = $state(0);
	let selectedExport: ExportEntry = $derived(packageConfig.exports[selectedExportIdx]);

	let packageJsonPreview: string = $derived.by(() => {
		const obj: Record<string, unknown> = {
			name: packageConfig.name,
			version: packageConfig.version,
			type: packageConfig.type,
			svelte: packageConfig.svelte,
			types: packageConfig.types,
			exports: {} as Record<string, unknown>,
			files: packageConfig.files,
			peerDependencies: packageConfig.peerDeps
		};

		const exports: Record<string, unknown> = {};
		for (const exp of packageConfig.exports) {
			exports[exp.path] = exp.conditions;
		}
		obj.exports = exports;

		return JSON.stringify(obj, null, 2);
	});

	function toggleComponent(idx: number): void {
		bundleComponents[idx].included = !bundleComponents[idx].included;
	}
</script>

<svelte:head>
	<title>23.8 — Publishing & Consumption · Design System Engineering</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 23.8 · Mini-build</p>
		<h1>Package Explorer</h1>
		<p class="lede">
			Explore a published Svelte component library's package.json exports,
			and simulate tree-shaking by toggling which components consumers import.
		</p>
	</header>

	<div class="explorer-layout">
		<div class="exports-panel">
			<h2>Package Exports</h2>
			<div class="export-list">
				{#each packageConfig.exports as exp, idx (exp.path)}
					<button
						type="button"
						class="export-item"
						class:export-item--active={idx === selectedExportIdx}
						onclick={() => { selectedExportIdx = idx; }}
					>
						<code class="export-path">{exp.path}</code>
						<span class="export-size">{exp.sizeKb} KB</span>
						{#if exp.treeShakeable}
							<span class="export-badge export-badge--shakeable">Tree-shakeable</span>
						{:else}
							<span class="export-badge export-badge--fixed">Fixed</span>
						{/if}
					</button>
				{/each}
			</div>

			<div class="export-detail">
				<h3>Conditions for <code>{selectedExport.path}</code></h3>
				<div class="condition-list">
					{#each Object.entries(selectedExport.conditions) as [condition, target] (condition)}
						<div class="condition-row">
							<code class="condition-key">{condition}</code>
							<code class="condition-value">{target}</code>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="bundle-panel">
			<h2>Tree-Shaking Simulator</h2>
			<p class="bundle-desc">
				Toggle components to simulate what a consumer imports. Unused
				components are eliminated from the bundle.
			</p>

			<div class="component-toggles">
				{#each bundleComponents as comp, idx (comp.name)}
					<label class="toggle-label">
						<input
							type="checkbox"
							checked={comp.included}
							onchange={() => toggleComponent(idx)}
						/>
						<span class="toggle-name">{comp.name}</span>
						<span class="toggle-size">{comp.sizeKb} KB</span>
					</label>
				{/each}
			</div>

			<div class="bundle-result">
				<div class="bundle-bar-container">
					<div
						class="bundle-bar"
						style:inline-size="{(totalBundleKb / fullBundleKb) * 100}%"
					></div>
				</div>
				<div class="bundle-stats">
					<span class="bundle-total">{totalBundleKb.toFixed(1)} KB</span>
					<span class="bundle-full">/ {fullBundleKb.toFixed(1)} KB total</span>
					<span class="bundle-savings">{treeSavingsPercent}% eliminated</span>
				</div>
			</div>
		</div>
	</div>

	<div class="package-json-section">
		<h2>package.json</h2>
		<pre class="package-json-output"><code>{packageJsonPreview}</code></pre>
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

	.explorer-layout {
		display: grid;
		gap: var(--space-lg);
	}

	@media (min-width: 768px) {
		.explorer-layout {
			grid-template-columns: 1fr 1fr;
		}
	}

	.exports-panel,
	.bundle-panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
	}

	.export-list {
		display: grid;
		gap: var(--space-xs);
		margin-block-end: var(--space-md);
	}

	.export-item {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm);
		background: var(--color-surface-2);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		text-align: start;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.export-item:hover {
		border-color: var(--color-brand);
	}

	.export-item--active {
		border-color: var(--color-brand);
	}

	.export-path {
		font-size: var(--text-sm);
		color: var(--color-brand);
	}

	.export-size {
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.export-badge {
		font-size: var(--text-xs);
		font-weight: 700;
		padding: 0.15em 0.5em;
		border-radius: var(--radius-full);
		text-transform: uppercase;
	}

	.export-badge--shakeable {
		background: oklch(85% 0.1 145);
		color: oklch(30% 0.1 145);
	}

	.export-badge--fixed {
		background: oklch(85% 0.08 60);
		color: oklch(35% 0.08 60);
	}

	.export-detail {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}

	.condition-list {
		display: grid;
		gap: var(--space-xs);
	}

	.condition-row {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-md);
		font-size: var(--text-xs);
	}

	.condition-key {
		color: var(--color-brand);
		font-weight: 600;
	}

	.condition-value {
		color: var(--color-text-muted);
	}

	.bundle-desc {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-end: var(--space-md);
	}

	.component-toggles {
		display: grid;
		gap: var(--space-xs);
		margin-block-end: var(--space-md);
	}

	.toggle-label {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.toggle-size {
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.bundle-result {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}

	.bundle-bar-container {
		block-size: 1.5rem;
		background: var(--color-border);
		border-radius: var(--radius-sm);
		overflow: hidden;
		margin-block-end: var(--space-sm);
	}

	.bundle-bar {
		block-size: 100%;
		background: var(--color-brand);
		border-radius: var(--radius-sm);
		transition: inline-size var(--dur-base) var(--ease-out);
	}

	.bundle-stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		align-items: baseline;
	}

	.bundle-total {
		font-size: var(--text-lg);
		font-weight: 700;
	}

	.bundle-full {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.bundle-savings {
		font-size: var(--text-xs);
		font-weight: 700;
		color: oklch(45% 0.15 145);
		background: oklch(90% 0.08 145);
		padding: 0.15em 0.5em;
		border-radius: var(--radius-full);
	}

	.package-json-section {
		margin-block-start: var(--space-lg);
	}

	.package-json-output {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-block-start: 3px solid var(--color-brand);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		line-height: 1.6;
		overflow-x: auto;
	}

	h2 {
		margin-block-end: var(--space-sm);
	}

	h3 {
		margin-block: var(--space-md) var(--space-sm);
		font-size: var(--text-base);
	}
</style>
