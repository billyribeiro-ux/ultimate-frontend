<script lang="ts">
	interface ConfigOption {
		key: string;
		section: string;
		description: string;
		example: string;
		defaultValue: string;
	}

	const configOptions: ConfigOption[] = [
		{
			key: 'plugins',
			section: 'root',
			description: 'Array of Vite plugins. In SvelteKit, always starts with sveltekit().',
			example: 'plugins: [sveltekit()]',
			defaultValue: '[]'
		},
		{
			key: 'server.port',
			section: 'server',
			description: 'Port for the dev server. Falls back to next available if taken.',
			example: 'server: { port: 3000 }',
			defaultValue: '5173'
		},
		{
			key: 'server.host',
			section: 'server',
			description: 'Set to true or "0.0.0.0" to expose on local network for mobile testing.',
			example: 'server: { host: true }',
			defaultValue: '"localhost"'
		},
		{
			key: 'server.proxy',
			section: 'server',
			description: 'Routes URL patterns to another server during development. Essential for API backends.',
			example: "server: { proxy: { '/api': 'http://localhost:8080' } }",
			defaultValue: '{}'
		},
		{
			key: 'build.target',
			section: 'build',
			description: 'Browser compatibility target. Controls which JS syntax features are downleveled.',
			example: "build: { target: 'es2020' }",
			defaultValue: "'esnext'"
		},
		{
			key: 'build.sourcemap',
			section: 'build',
			description: 'Generate source maps. Use "hidden" for error tracking without exposing maps.',
			example: "build: { sourcemap: 'hidden' }",
			defaultValue: 'false'
		},
		{
			key: 'build.rolldownOptions',
			section: 'build',
			description: 'Pass options directly to Rolldown bundler. Use for manual chunks and output control.',
			example: 'build: { rolldownOptions: { output: { manualChunks: {} } } }',
			defaultValue: '{}'
		},
		{
			key: 'build.chunkSizeWarningLimit',
			section: 'build',
			description: 'Threshold in kB for oversized chunk warnings during build.',
			example: 'build: { chunkSizeWarningLimit: 600 }',
			defaultValue: '500'
		},
		{
			key: 'optimizeDeps.include',
			section: 'optimizeDeps',
			description: 'Force-include dependencies for pre-bundling that Vite scanner missed.',
			example: "optimizeDeps: { include: ['lodash-es'] }",
			defaultValue: '[]'
		},
		{
			key: 'optimizeDeps.exclude',
			section: 'optimizeDeps',
			description: 'Prevent a dependency from being pre-bundled. Rarely needed.',
			example: "optimizeDeps: { exclude: ['@sveltejs/kit'] }",
			defaultValue: '[]'
		},
		{
			key: 'resolve.alias',
			section: 'resolve',
			description: 'Create import path shortcuts. SvelteKit already provides $lib.',
			example: "resolve: { alias: { '$utils': '/src/lib/utils' } }",
			defaultValue: '{}'
		},
		{
			key: 'define',
			section: 'root',
			description: 'Replace global identifiers with compile-time constants. Enables dead-code elimination.',
			example: "define: { __APP_VERSION__: JSON.stringify('1.0') }",
			defaultValue: '{}'
		},
		{
			key: 'css.preprocessorOptions',
			section: 'css',
			description: 'Pass options to CSS preprocessors like Sass. Inject shared variables or mixins.',
			example: "css: { preprocessorOptions: { scss: { additionalData: '...' } } }",
			defaultValue: '{}'
		}
	];

	let searchQuery: string = $state('');
	let activeSection: string = $state('all');

	const sections: string[] = ['all', 'root', 'server', 'build', 'optimizeDeps', 'resolve', 'css'];

	let filteredOptions: ConfigOption[] = $derived(
		configOptions.filter((opt: ConfigOption) => {
			const matchesSection: boolean = activeSection === 'all' || opt.section === activeSection;
			const matchesSearch: boolean = searchQuery === '' ||
				opt.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
				opt.description.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesSection && matchesSearch;
		})
	);

	let selectedOption: ConfigOption | null = $state(null);

	function selectOption(option: ConfigOption): void {
		selectedOption = option;
	}
</script>

<svelte:head>
	<title>21.2 — vite.config.ts in Depth · Vite, Vitest & The Svelte Playground</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 21.2 · Mini-build</p>
		<h1>Vite Config Explorer</h1>
		<p class="lede">
			Search and browse every vite.config.ts option that matters for SvelteKit.
			Select an option to see its description, default value, and example.
		</p>
	</header>

	<div class="controls">
		<input
			type="search"
			class="search-input"
			placeholder="Search config options..."
			bind:value={searchQuery}
		/>
		<div class="section-tabs" role="tablist" aria-label="Config sections">
			{#each sections as section (section)}
				<button
					type="button"
					role="tab"
					class="tab-btn"
					class:tab-btn--active={activeSection === section}
					aria-selected={activeSection === section}
					onclick={() => { activeSection = section; }}
				>
					{section}
				</button>
			{/each}
		</div>
	</div>

	<div class="explorer-layout">
		<ul class="option-list" role="listbox" aria-label="Config options">
			{#each filteredOptions as option (option.key)}
				<li>
					<button
						type="button"
						role="option"
						class="option-card"
						class:option-card--selected={selectedOption?.key === option.key}
						aria-selected={selectedOption?.key === option.key}
						onclick={() => selectOption(option)}
					>
						<code class="option-card__key">{option.key}</code>
						<span class="option-card__section">{option.section}</span>
					</button>
				</li>
			{/each}
			{#if filteredOptions.length === 0}
				<li class="no-results">No matching options found.</li>
			{/if}
		</ul>

		<article class="detail-panel" aria-live="polite">
			{#if selectedOption}
				<h2 class="detail-panel__key"><code>{selectedOption.key}</code></h2>
				<p class="detail-panel__desc">{selectedOption.description}</p>
				<dl class="detail-panel__meta">
					<dt>Default</dt>
					<dd><code>{selectedOption.defaultValue}</code></dd>
					<dt>Section</dt>
					<dd>{selectedOption.section}</dd>
					<dt>Example</dt>
					<dd><code class="detail-panel__example">{selectedOption.example}</code></dd>
				</dl>
			{:else}
				<p class="detail-panel__placeholder">Select an option to see details.</p>
			{/if}
		</article>
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

	.controls {
		display: grid;
		gap: var(--space-sm);
	}

	.search-input {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		font-size: var(--text-sm);
		min-block-size: 44px;
		inline-size: 100%;
	}

	.section-tabs {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	.tab-btn {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: 600;
		min-block-size: 44px;
		text-transform: capitalize;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.tab-btn--active {
		border-color: var(--color-brand);
		color: var(--color-brand);
	}

	.explorer-layout {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.explorer-layout {
			grid-template-columns: 1fr 1fr;
		}
	}

	.option-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
		max-block-size: 30rem;
		overflow-y: auto;
	}

	.option-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-align: start;
		inline-size: 100%;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.option-card--selected {
		border-color: var(--color-brand);
		border-inline-start-width: 3px;
	}

	.option-card__key {
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.option-card__section {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.no-results {
		padding: var(--space-md);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.detail-panel {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.detail-panel__key {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}

	.detail-panel__desc {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-end: var(--space-md);
	}

	.detail-panel__meta {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		font-size: var(--text-sm);
	}

	.detail-panel__meta dt {
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.detail-panel__example {
		word-break: break-all;
	}

	.detail-panel__placeholder {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
