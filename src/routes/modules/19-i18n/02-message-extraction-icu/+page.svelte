<script lang="ts">
	interface Variable {
		name: string;
		value: string;
		type: 'string' | 'number';
	}

	interface Preset {
		name: string;
		pattern: string;
		variables: Variable[];
	}

	const presets: Preset[] = [
		{
			name: 'Simple variable',
			pattern: 'Hello, {name}! Welcome to {place}.',
			variables: [
				{ name: 'name', value: 'Ada', type: 'string' },
				{ name: 'place', value: 'SvelteKit', type: 'string' }
			]
		},
		{
			name: 'Plural',
			pattern: '{count, plural, =0 {No items in your cart} one {# item in your cart} other {# items in your cart}}',
			variables: [{ name: 'count', value: '3', type: 'number' }]
		},
		{
			name: 'Select (gender)',
			pattern: '{gender, select, female {{name} updated her profile} male {{name} updated his profile} other {{name} updated their profile}}',
			variables: [
				{ name: 'gender', value: 'female', type: 'string' },
				{ name: 'name', value: 'Ada', type: 'string' }
			]
		},
		{
			name: 'Nested plural + select',
			pattern: '{gender, select, female {{count, plural, one {{name} has # new message} other {{name} has # new messages}}} male {{count, plural, one {{name} has # new message} other {{name} has # new messages}}} other {{count, plural, one {{name} has # new message} other {{name} has # new messages}}}}',
			variables: [
				{ name: 'gender', value: 'female', type: 'string' },
				{ name: 'name', value: 'Ada', type: 'string' },
				{ name: 'count', value: '5', type: 'number' }
			]
		}
	];

	let pattern: string = $state(presets[0].pattern);
	let variables: Variable[] = $state([...presets[0].variables]);

	function loadPreset(preset: Preset): void {
		pattern = preset.pattern;
		variables = preset.variables.map((v) => ({ ...v }));
	}

	function evaluateSimplePattern(pat: string, vars: Variable[]): string {
		let result: string = pat;
		const varMap = new Map<string, string | number>();
		for (const v of vars) {
			varMap.set(v.name, v.type === 'number' ? Number(v.value) : v.value);
		}

		const pluralRegex = /\{(\w+),\s*plural,\s*((?:[^{}]|\{[^{}]*\})*)\}/;
		const selectRegex = /\{(\w+),\s*select,\s*((?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*)\}/;

		let safetyCounter: number = 0;
		while (safetyCounter < 20) {
			safetyCounter++;
			const selectMatch = result.match(selectRegex);
			if (selectMatch) {
				const varName: string = selectMatch[1];
				const branches: string = selectMatch[2];
				const val: string = String(varMap.get(varName) ?? 'other');
				const branchRegex = new RegExp(`${val}\\s*\\{((?:[^{}]|\\{(?:[^{}]|\\{[^{}]*\\})*\\})*)\\}`);
				const otherRegex = /other\s*\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}/;
				const branchMatch = branches.match(branchRegex);
				const otherMatch = branches.match(otherRegex);
				const chosen: string = branchMatch ? branchMatch[1] : (otherMatch ? otherMatch[1] : '');
				result = result.replace(selectMatch[0], chosen);
				continue;
			}

			const pluralMatch = result.match(pluralRegex);
			if (pluralMatch) {
				const varName: string = pluralMatch[1];
				const branches: string = pluralMatch[2];
				const num: number = Number(varMap.get(varName) ?? 0);
				const exactRegex = new RegExp(`=${num}\\s*\\{([^}]*)\\}`);
				const exactMatch = branches.match(exactRegex);
				if (exactMatch) {
					result = result.replace(pluralMatch[0], exactMatch[1].replace(/#/g, String(num)));
					continue;
				}
				const category: string = num === 1 ? 'one' : 'other';
				const catRegex = new RegExp(`${category}\\s*\\{([^}]*)\\}`);
				const catMatch = branches.match(catRegex);
				const otherRegex2 = /other\s*\{([^}]*)\}/;
				const otherMatch2 = branches.match(otherRegex2);
				const chosen: string = catMatch ? catMatch[1] : (otherMatch2 ? otherMatch2[1] : '');
				result = result.replace(pluralMatch[0], chosen.replace(/#/g, String(num)));
				continue;
			}
			break;
		}

		for (const [name, value] of varMap) {
			result = result.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
		}

		return result;
	}

	let result: string = $derived.by(() => {
		try {
			return evaluateSimplePattern(pattern, variables);
		} catch (e) {
			return `Error: ${(e as Error).message}`;
		}
	});

	let isError: boolean = $derived(result.startsWith('Error:'));
</script>

<svelte:head>
	<title>19.2 — ICU MessageFormat · Internationalization</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 19.2 · Mini-build</p>
		<h1>ICU MessageFormat Playground</h1>
		<p class="lede">
			Type ICU patterns with variables, plurals, and selectors.
			See the evaluated result update live.
		</p>
	</header>

	<section class="presets" aria-label="Preset examples">
		<h2 class="sr-only">Presets</h2>
		<div class="preset-buttons">
			{#each presets as preset}
				<button class="preset-btn" onclick={() => loadPreset(preset)}>
					{preset.name}
				</button>
			{/each}
		</div>
	</section>

	<div class="panels">
		<section class="panel" aria-labelledby="pattern-heading">
			<h2 id="pattern-heading" class="panel__title">Message Pattern</h2>
			<label class="sr-only" for="pattern-input">ICU message pattern</label>
			<textarea
				id="pattern-input"
				class="panel__textarea"
				bind:value={pattern}
				rows={5}
				spellcheck={false}
			></textarea>

			<h3 class="panel__subtitle">Variables</h3>
			<div class="var-list">
				{#each variables as variable, i}
					<div class="var-row">
						<span class="var-row__name">{variable.name}</span>
						<input
							type={variable.type === 'number' ? 'number' : 'text'}
							class="var-row__input"
							bind:value={variable.value}
						/>
						<span class="var-row__type">{variable.type}</span>
					</div>
				{/each}
			</div>
		</section>

		<section class="panel panel--output" aria-labelledby="result-heading">
			<h2 id="result-heading" class="panel__title">Result</h2>
			<div class="result" class:result--error={isError}>
				<p class="result__text">{result}</p>
			</div>
		</section>
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

	.presets {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.preset-btn {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-xs);
		font-weight: 600;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.preset-btn:hover {
		border-color: var(--color-brand);
	}

	.panels {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.panels {
			grid-template-columns: 1fr 1fr;
		}
	}

	.panel {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.panel--output {
		border-color: var(--color-brand);
	}

	.panel__title {
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-block-end: var(--space-sm);
	}

	.panel__subtitle {
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--color-text-muted);
		margin-block-start: var(--space-md);
		margin-block-end: var(--space-sm);
	}

	.panel__textarea {
		inline-size: 100%;
		padding: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-sm);
		line-height: 1.6;
		color: var(--color-text);
		resize: vertical;
	}

	.var-list {
		display: grid;
		gap: var(--space-xs);
	}

	.var-row {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-sm);
	}

	.var-row__name {
		font-size: var(--text-sm);
		font-weight: 600;
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		min-inline-size: 4rem;
	}

	.var-row__input {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		font-size: var(--text-sm);
		min-block-size: 36px;
	}

	.var-row__type {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.result {
		padding: var(--space-lg);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-block-size: 6rem;
		display: grid;
		place-items: center;
	}

	.result--error {
		border-color: var(--color-error);
	}

	.result__text {
		font-size: var(--text-lg);
		text-align: center;
	}

	.result--error .result__text {
		color: var(--color-error);
		font-size: var(--text-sm);
	}

	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
