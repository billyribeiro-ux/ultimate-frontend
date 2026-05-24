<script lang="ts">
	interface ConfigOption {
		key: string;
		label: string;
		value: string;
		options: string[];
	}

	let configOptions: ConfigOption[] = $state([
		{ key: 'environment', label: 'Test Environment', value: 'jsdom', options: ['jsdom', 'happy-dom', 'node'] },
		{ key: 'globals', label: 'Global APIs', value: 'true', options: ['true', 'false'] },
		{ key: 'coverage', label: 'Coverage Provider', value: 'v8', options: ['v8', 'istanbul'] },
		{ key: 'threshold', label: 'Coverage Threshold', value: '80', options: ['50', '60', '70', '80', '90', '95'] }
	]);

	let generatedConfig: string = $derived.by(() => {
		const env = configOptions.find(o => o.key === 'environment')?.value ?? 'jsdom';
		const globals = configOptions.find(o => o.key === 'globals')?.value ?? 'true';
		const cov = configOptions.find(o => o.key === 'coverage')?.value ?? 'v8';
		const thresh = configOptions.find(o => o.key === 'threshold')?.value ?? '80';

		return `import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    globals: ${globals},
    environment: '${env}',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    alias: {
      '$lib': '/src/lib',
      '$app/navigation': '/tests/mocks/navigation.ts',
      '$app/state': '/tests/mocks/state.ts'
    },
    coverage: {
      provider: '${cov}',
      include: ['src/lib/**/*.ts', 'src/lib/**/*.svelte.ts'],
      thresholds: {
        lines: ${thresh},
        branches: ${Number(thresh) - 5},
        functions: ${thresh},
        statements: ${thresh}
      }
    }
  }
});`;
	});

	let setupSteps: Array<{ text: string; done: boolean }> = $state([
		{ text: 'Install vitest, @testing-library/svelte, jsdom', done: true },
		{ text: 'Create vitest.config.ts with Svelte plugin', done: true },
		{ text: 'Create tests/setup.ts with jest-dom matchers', done: false },
		{ text: 'Add $lib and $app aliases', done: false },
		{ text: 'Configure coverage thresholds', done: false },
		{ text: 'Run first test to verify setup', done: false }
	]);
</script>

<svelte:head>
	<title>20.2 — Vitest Configuration · Testing Deep Dive</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 20.2 · Mini-build</p>
		<h1>Vitest Configuration Builder</h1>
		<p class="lede">
			Configure Vitest for SvelteKit with the right environment,
			coverage provider, and path aliases.
		</p>
	</header>

	<div class="builder-layout">
		<section class="options-panel" aria-labelledby="options-heading">
			<h2 id="options-heading">Configuration Options</h2>
			{#each configOptions as option (option.key)}
				<label class="option">
					<span class="option__label">{option.label}</span>
					<select class="option__select" bind:value={option.value}>
						{#each option.options as opt (opt)}
							<option value={opt}>{opt}</option>
						{/each}
					</select>
				</label>
			{/each}
		</section>

		<section class="config-panel" aria-labelledby="config-heading">
			<h2 id="config-heading">vitest.config.ts</h2>
			<pre class="config-code"><code>{generatedConfig}</code></pre>
		</section>
	</div>

	<section class="checklist" aria-labelledby="setup-heading">
		<h2 id="setup-heading">Setup Checklist</h2>
		<ul class="step-list">
			{#each setupSteps as step, i (step.text)}
				<li class="step-item">
					<label class="step-label">
						<input type="checkbox" bind:checked={step.done} />
						<span class:step-done={step.done}>{step.text}</span>
					</label>
				</li>
			{/each}
		</ul>
	</section>
</section>

<style>
	.eyebrow { font-size: var(--text-sm); color: var(--color-brand); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
	.lede { font-size: var(--text-lg); color: var(--color-text-muted); max-inline-size: 50ch; }
	.builder-layout { display: grid; gap: var(--space-md); }
	@media (min-width: 768px) { .builder-layout { grid-template-columns: 1fr 2fr; } }
	.options-panel, .config-panel, .checklist { padding: var(--space-lg); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
	.config-panel { border-color: var(--color-brand); }
	.option { display: grid; gap: var(--space-xs); margin-block-end: var(--space-md); }
	.option__label { font-size: var(--text-xs); font-weight: 600; color: var(--color-text-muted); }
	.option__select { padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); font-size: var(--text-sm); min-block-size: 44px; }
	.config-code { background: var(--color-surface); padding: var(--space-md); border-radius: var(--radius-md); overflow-x: auto; font-size: var(--text-xs); line-height: 1.6; white-space: pre; margin-block-start: var(--space-md); }
	.step-list { list-style: none; padding: 0; margin: var(--space-md) 0 0; display: grid; gap: var(--space-xs); }
	.step-item { padding: var(--space-xs) var(--space-sm); background: var(--color-surface); border-radius: var(--radius-sm); }
	.step-label { display: flex; align-items: center; gap: var(--space-sm); font-size: var(--text-sm); cursor: pointer; }
	.step-done { text-decoration: line-through; color: var(--color-text-muted); }
</style>
