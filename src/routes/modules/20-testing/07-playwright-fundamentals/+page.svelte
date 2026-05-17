<script lang="ts">
	interface PageElement { id: string; tag: string; role: string; text: string; label?: string; testId?: string; }

	let elements: PageElement[] = $state([
		{ id: '1', tag: 'h1', role: 'heading', text: 'Dashboard' },
		{ id: '2', tag: 'button', role: 'button', text: 'Create Note', testId: 'create-btn' },
		{ id: '3', tag: 'input', role: 'textbox', text: '', label: 'Search notes' },
		{ id: '4', tag: 'a', role: 'link', text: 'Settings' },
		{ id: '5', tag: 'button', role: 'button', text: 'Sign Out' },
		{ id: '6', tag: 'nav', role: 'navigation', text: 'Main Navigation', label: 'Main' }
	]);

	let strategy: string = $state('role');
	let query: string = $state('button');

	let matches: PageElement[] = $derived.by(() => {
		const q = query.toLowerCase();
		switch (strategy) {
			case 'role': return elements.filter(e => e.role.toLowerCase().includes(q));
			case 'text': return elements.filter(e => e.text.toLowerCase().includes(q));
			case 'label': return elements.filter(e => e.label?.toLowerCase().includes(q));
			case 'testid': return elements.filter(e => e.testId?.toLowerCase().includes(q));
			default: return [];
		}
	});

	let locatorCode: string = $derived.by(() => {
		switch (strategy) {
			case 'role': return `page.getByRole('${query}')`;
			case 'text': return `page.getByText('${query}')`;
			case 'label': return `page.getByLabel('${query}')`;
			case 'testid': return `page.getByTestId('${query}')`;
			default: return '';
		}
	});
</script>

<svelte:head>
	<title>20.7 — Playwright Fundamentals · Testing Deep Dive</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 20.7 · Mini-build</p>
		<h1>Playwright Locator Explorer</h1>
		<p class="lede">
			Select a locator strategy and query to see which elements on the
			simulated page match.
		</p>
	</header>

	<section class="controls" aria-labelledby="controls-heading">
		<h2 id="controls-heading" class="sr-only">Locator Controls</h2>
		<label class="field">
			<span class="field__label">Strategy</span>
			<select class="field__input" bind:value={strategy}>
				<option value="role">getByRole</option>
				<option value="text">getByText</option>
				<option value="label">getByLabel</option>
				<option value="testid">getByTestId</option>
			</select>
		</label>
		<label class="field">
			<span class="field__label">Query</span>
			<input type="text" class="field__input" bind:value={query} />
		</label>
		<div class="locator-output">
			<code>{locatorCode}</code>
			<span class="match-count">{matches.length} match{matches.length === 1 ? '' : 'es'}</span>
		</div>
	</section>

	<section class="page-sim" aria-labelledby="page-heading">
		<h2 id="page-heading">Simulated Page</h2>
		<div class="sim-elements">
			{#each elements as el (el.id)}
				<div class="sim-element" class:sim-element--matched={matches.some(m => m.id === el.id)}>
					<span class="sim-element__tag">&lt;{el.tag}&gt;</span>
					<span class="sim-element__role">role="{el.role}"</span>
					{#if el.text}<span class="sim-element__text">"{el.text}"</span>{/if}
					{#if el.label}<span class="sim-element__label">label="{el.label}"</span>{/if}
					{#if el.testId}<span class="sim-element__testid">data-testid="{el.testId}"</span>{/if}
				</div>
			{/each}
		</div>
	</section>

	<section class="explanation" aria-labelledby="auto-heading">
		<h2 id="auto-heading">Playwright Auto-waiting</h2>
		<ol class="steps">
			<li>Waits for element to be <strong>attached</strong> to the DOM</li>
			<li>Waits for element to be <strong>visible</strong></li>
			<li>Waits for element to be <strong>stable</strong> (not animating)</li>
			<li>Waits for element to be <strong>enabled</strong></li>
			<li>Waits for element to be <strong>unobscured</strong></li>
		</ol>
	</section>
</section>

<style>
	.eyebrow { font-size: var(--text-sm); color: var(--color-brand); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
	.lede { font-size: var(--text-lg); color: var(--color-text-muted); max-inline-size: 50ch; }
	.controls { display: flex; gap: var(--space-md); flex-wrap: wrap; align-items: end; }
	.field { display: grid; gap: var(--space-xs); min-inline-size: 8rem; }
	.field__label { font-size: var(--text-xs); font-weight: 600; color: var(--color-text-muted); }
	.field__input { padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); font-size: var(--text-sm); min-block-size: 44px; }
	.locator-output { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-xs) var(--space-md); background: var(--color-surface-2); border: 1px solid var(--color-brand); border-radius: var(--radius-md); }
	.match-count { font-size: var(--text-xs); color: var(--color-brand); font-weight: 700; }
	.page-sim { padding: var(--space-lg); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
	.sim-elements { display: grid; gap: var(--space-sm); margin-block-start: var(--space-md); }
	.sim-element { display: flex; flex-wrap: wrap; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: var(--color-surface); border: 2px solid transparent; border-radius: var(--radius-md); font-size: var(--text-sm); transition: border-color var(--dur-fast) var(--ease-out); }
	.sim-element--matched { border-color: var(--color-brand); background: oklch(65% 0.22 270 / 0.05); }
	.sim-element__tag { font-weight: 700; color: var(--color-brand); font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; }
	.sim-element__role { color: var(--color-success); font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-size: var(--text-xs); }
	.sim-element__text { color: var(--color-text); }
	.sim-element__label { color: var(--color-warning); font-size: var(--text-xs); }
	.sim-element__testid { color: var(--color-text-muted); font-size: var(--text-xs); }
	.explanation { padding: var(--space-lg); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
	.steps { padding-inline-start: var(--space-md); display: grid; gap: var(--space-sm); font-size: var(--text-sm); }
	.sr-only { position: absolute; inline-size: 1px; block-size: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
</style>
