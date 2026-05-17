<script lang="ts">
	interface DataSource {
		name: string;
		type: 'json' | 'yaml' | 'csv' | 'markdown';
		path: string;
		recordCount: number;
	}

	interface BuildOutput {
		source: string;
		generatedModule: string;
		sizeKb: number;
		buildTimeMs: number;
	}

	let sources: DataSource[] = $state([
		{ name: 'Team members', type: 'json', path: 'data/team.json', recordCount: 12 },
		{ name: 'Blog posts', type: 'markdown', path: 'content/posts/*.md', recordCount: 47 },
		{ name: 'Pricing tiers', type: 'yaml', path: 'data/pricing.yaml', recordCount: 3 },
		{ name: 'Changelog', type: 'csv', path: 'data/changelog.csv', recordCount: 156 }
	]);

	let outputs: BuildOutput[] = $state([]);
	let isBuilding: boolean = $state(false);

	function simulateBuild(): void {
		isBuilding = true;
		outputs = [];

		let delay: number = 0;
		for (const source of sources) {
			delay += 300;
			const s = source;
			setTimeout(() => {
				outputs = [...outputs, {
					source: s.name,
					generatedModule: `$lib/generated/${s.name.toLowerCase().replace(/\s+/g, '-')}.ts`,
					sizeKb: Math.round(s.recordCount * 0.8 + Math.random() * 5),
					buildTimeMs: Math.round(50 + Math.random() * 200)
				}];
			}, delay);
		}

		setTimeout(() => {
			isBuilding = false;
		}, delay + 100);
	}

	let totalSize: number = $derived(outputs.reduce((sum, o) => sum + o.sizeKb, 0));
	let totalTime: number = $derived(outputs.reduce((sum, o) => sum + o.buildTimeMs, 0));

	function addSource(): void {
		const types: Array<'json' | 'yaml' | 'csv' | 'markdown'> = ['json', 'yaml', 'csv', 'markdown'];
		const names: string[] = ['Products', 'FAQ entries', 'Testimonials', 'Config values', 'Routes'];
		const name: string = names[sources.length % names.length];
		sources = [...sources, {
			name,
			type: types[Math.floor(Math.random() * types.length)],
			path: `data/${name.toLowerCase().replace(/\s+/g, '-')}.${types[Math.floor(Math.random() * types.length)]}`,
			recordCount: Math.floor(Math.random() * 100) + 5
		}];
	}
</script>

<svelte:head>
	<title>18.7 — Build-time Data with Vite Plugins · Advanced Patterns</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 18.7 · Mini-build</p>
		<h1>Build-time Data with Vite Plugins</h1>
		<p class="lede">
			Transform static data files into type-safe TypeScript modules at build time.
			Zero runtime cost, full type safety.
		</p>
	</header>

	<section class="demo" aria-labelledby="sources-heading">
		<h2 id="sources-heading">Data Sources</h2>
		<ul class="source-list">
			{#each sources as source (source.name)}
				<li class="source-card">
					<span class="source-card__type">{source.type}</span>
					<span class="source-card__name">{source.name}</span>
					<span class="source-card__path">{source.path}</span>
					<span class="source-card__count">{source.recordCount} records</span>
				</li>
			{/each}
		</ul>
		<div class="actions">
			<button class="btn" onclick={addSource}>Add Source</button>
			<button class="btn btn--primary" onclick={simulateBuild} disabled={isBuilding}>
				{isBuilding ? 'Building...' : 'Simulate Build'}
			</button>
		</div>
	</section>

	{#if outputs.length > 0}
		<section class="demo" aria-labelledby="output-heading">
			<h2 id="output-heading">Generated Modules</h2>
			<ul class="output-list">
				{#each outputs as output (output.source)}
					<li class="output-card">
						<span class="output-card__source">{output.source}</span>
						<code class="output-card__module">{output.generatedModule}</code>
						<span class="output-card__stats">
							{output.sizeKb} KB · {output.buildTimeMs}ms
						</span>
					</li>
				{/each}
			</ul>
			{#if !isBuilding}
				<p class="totals">
					Total: {totalSize} KB generated in {totalTime}ms
				</p>
			{/if}
		</section>
	{/if}

	<section class="explanation" aria-labelledby="how-heading">
		<h2 id="how-heading">How a Vite Plugin Generates Modules</h2>
		<ol class="steps">
			<li>The plugin registers a virtual module ID (e.g., <code>virtual:team-data</code>)</li>
			<li>At build time, it reads the source file (JSON, YAML, CSV, Markdown)</li>
			<li>It transforms the data into a TypeScript module with typed exports</li>
			<li>Vite resolves imports from the virtual ID to the generated code</li>
			<li>The result is tree-shakeable, fully typed, and has zero runtime file I/O</li>
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

	.demo {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.source-list, .output-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
		margin-block-end: var(--space-md);
	}

	.source-card, .output-card {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.source-card__type {
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: var(--color-surface-2);
		padding: var(--space-xs);
		border-radius: var(--radius-sm);
		min-inline-size: 4rem;
		text-align: center;
	}

	.source-card__name {
		font-weight: 600;
	}

	.source-card__path {
		display: none;
	}

	.source-card__count {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.output-card__source {
		font-weight: 600;
		font-size: var(--text-sm);
	}

	.output-card__module {
		font-size: var(--text-xs);
	}

	.output-card__stats {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

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

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.totals {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-success);
		margin-block-start: var(--space-sm);
		font-variant-numeric: tabular-nums;
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
