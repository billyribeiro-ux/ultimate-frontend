<script lang="ts">
	interface PluginHook {
		id: string;
		name: string;
		description: string;
		input: string;
		output: string;
		phase: 'resolve' | 'load' | 'transform';
	}

	const hooks: PluginHook[] = [
		{
			id: 'resolveId',
			name: 'resolveId',
			description: 'Maps an import specifier to a resolved file path or virtual ID',
			input: '"virtual:build-info"',
			output: '"\\0virtual:build-info"',
			phase: 'resolve'
		},
		{
			id: 'load',
			name: 'load',
			description: 'Returns the module source code for a resolved ID',
			input: '"\\0virtual:build-info"',
			output: 'export const gitHash = "a1b2c3d";',
			phase: 'load'
		},
		{
			id: 'transform',
			name: 'transform',
			description: 'Modifies the loaded source code before it reaches the browser',
			input: 'export const gitHash = "a1b2c3d";',
			output: 'const gitHash = "a1b2c3d"; export { gitHash };',
			phase: 'transform'
		}
	];

	let activeHookIndex: number = $state(0);
	let isAnimating: boolean = $state(false);

	interface BuildMetadata {
		gitHash: string;
		buildTime: string;
		nodeVersion: string;
		viteVersion: string;
	}

	const simulatedMetadata: BuildMetadata = {
		gitHash: 'a1b2c3d',
		buildTime: new Date().toISOString(),
		nodeVersion: 'v22.4.0',
		viteVersion: '8.0.0'
	};

	function runPipeline(): void {
		isAnimating = true;
		activeHookIndex = 0;

		const advanceStep = (step: number): void => {
			setTimeout(() => {
				activeHookIndex = step;
				if (step >= hooks.length - 1) {
					setTimeout(() => {
						isAnimating = false;
					}, 800);
				} else {
					advanceStep(step + 1);
				}
			}, 800);
		};

		advanceStep(0);
	}

	function selectHook(index: number): void {
		if (!isAnimating) {
			activeHookIndex = index;
		}
	}
</script>

<svelte:head>
	<title>21.4 — The Plugin System · Vite, Vitest & The Svelte Playground</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 21.4 · Mini-build</p>
		<h1>Plugin Lifecycle Visualizer</h1>
		<p class="lede">
			See how a virtual module import flows through Vite's plugin hooks:
			resolveId, load, and transform.
		</p>
	</header>

	<button
		type="button"
		class="run-btn"
		onclick={runPipeline}
		disabled={isAnimating}
	>
		{isAnimating ? 'Running...' : 'Run Plugin Pipeline'}
	</button>

	<div class="hook-pipeline">
		{#each hooks as hook, index (hook.id)}
			<button
				type="button"
				class="hook-card"
				class:hook-card--active={index === activeHookIndex}
				class:hook-card--completed={index < activeHookIndex}
				onclick={() => selectHook(index)}
				disabled={isAnimating}
			>
				<span class="hook-card__phase">{hook.phase}</span>
				<code class="hook-card__name">{hook.name}()</code>
				<span class="hook-card__desc">{hook.description}</span>
			</button>
			{#if index < hooks.length - 1}
				<div class="pipe-arrow" aria-hidden="true"></div>
			{/if}
		{/each}
	</div>

	<div class="io-panel">
		<article class="io-card" aria-live="polite">
			<h2 class="io-card__title">
				<code>{hooks[activeHookIndex].name}()</code>
			</h2>
			<dl class="io-card__details">
				<dt>Input</dt>
				<dd><code>{hooks[activeHookIndex].input}</code></dd>
				<dt>Output</dt>
				<dd><code>{hooks[activeHookIndex].output}</code></dd>
			</dl>
		</article>
	</div>

	<footer class="build-footer">
		<h2 class="build-footer__heading">Simulated Build Info (from virtual:build-info)</h2>
		<dl class="build-footer__meta">
			<dt>Commit</dt>
			<dd><code>{simulatedMetadata.gitHash}</code></dd>
			<dt>Built</dt>
			<dd>{simulatedMetadata.buildTime}</dd>
			<dt>Node</dt>
			<dd>{simulatedMetadata.nodeVersion}</dd>
			<dt>Vite</dt>
			<dd>{simulatedMetadata.viteVersion}</dd>
		</dl>
	</footer>
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

	.run-btn {
		padding: var(--space-sm) var(--space-lg);
		border: 2px solid var(--color-brand);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--color-brand);
		min-block-size: 44px;
		transition: background var(--dur-fast) var(--ease-out);
		align-self: start;
	}

	.run-btn:hover:not(:disabled) {
		background: var(--color-surface-2);
	}

	.run-btn:disabled {
		opacity: 0.6;
	}

	.hook-pipeline {
		display: grid;
		gap: var(--space-xs);
	}

	@media (min-width: 768px) {
		.hook-pipeline {
			grid-template-columns: 1fr auto 1fr auto 1fr;
			align-items: center;
		}
	}

	.hook-card {
		display: grid;
		gap: var(--space-xs);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: start;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out);
	}

	.hook-card--active {
		border-color: var(--color-brand);
		box-shadow: var(--shadow-md);
	}

	.hook-card--completed {
		border-color: var(--color-success);
	}

	.hook-card__phase {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.hook-card__name {
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--color-brand);
	}

	.hook-card__desc {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.pipe-arrow {
		block-size: 2px;
		inline-size: 1.5rem;
		background: var(--color-text-muted);
		border-radius: var(--radius-full);
		justify-self: center;
	}

	@media (max-width: 767px) {
		.pipe-arrow {
			inline-size: 2px;
			block-size: 1rem;
		}
	}

	.io-panel {
		margin-block-start: var(--space-sm);
	}

	.io-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.io-card__title {
		font-size: var(--text-lg);
		margin-block-end: var(--space-md);
	}

	.io-card__details {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		font-size: var(--text-sm);
	}

	.io-card__details dt {
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.io-card__details dd code {
		word-break: break-all;
	}

	.build-footer {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border-block-start: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.build-footer__heading {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-end: var(--space-sm);
	}

	.build-footer__meta {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		font-size: var(--text-xs);
	}

	.build-footer__meta dt {
		font-weight: 600;
		color: var(--color-text-muted);
	}
</style>
