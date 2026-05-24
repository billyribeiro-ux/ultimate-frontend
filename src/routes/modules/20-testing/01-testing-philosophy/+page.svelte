<script lang="ts">
	interface TestCase {
		id: string;
		description: string;
		level: 'unit' | 'integration' | 'e2e';
		risk: 'low' | 'medium' | 'high';
		estimatedMs: number;
	}

	let testCases: TestCase[] = $state([
		{ id: '1', description: 'formatCurrency returns correct value', level: 'unit', risk: 'medium', estimatedMs: 5 },
		{ id: '2', description: 'Counter renders initial count', level: 'integration', risk: 'low', estimatedMs: 50 },
		{ id: '3', description: 'Login redirects to dashboard', level: 'e2e', risk: 'high', estimatedMs: 3000 },
		{ id: '4', description: 'TodoStore.add appends item', level: 'unit', risk: 'medium', estimatedMs: 3 },
		{ id: '5', description: 'Form action validates email', level: 'integration', risk: 'high', estimatedMs: 20 },
		{ id: '6', description: 'CRUD flow creates and deletes', level: 'e2e', risk: 'high', estimatedMs: 8000 }
	]);

	let newDescription: string = $state('');
	let newLevel: TestCase['level'] = $state('unit');

	function addTest(): void {
		if (!newDescription.trim()) return;
		const estimatedMs: number = newLevel === 'unit' ? 5 : newLevel === 'integration' ? 50 : 5000;
		testCases = [...testCases, {
			id: String(Date.now()),
			description: newDescription.trim(),
			level: newLevel,
			risk: 'medium',
			estimatedMs
		}];
		newDescription = '';
	}

	interface PyramidLevel {
		level: string;
		count: number;
		totalMs: number;
		color: string;
	}

	let pyramid: PyramidLevel[] = $derived([
		{
			level: 'E2E',
			count: testCases.filter(t => t.level === 'e2e').length,
			totalMs: testCases.filter(t => t.level === 'e2e').reduce((s, t) => s + t.estimatedMs, 0),
			color: 'var(--color-error)'
		},
		{
			level: 'Integration',
			count: testCases.filter(t => t.level === 'integration').length,
			totalMs: testCases.filter(t => t.level === 'integration').reduce((s, t) => s + t.estimatedMs, 0),
			color: 'var(--color-warning)'
		},
		{
			level: 'Unit',
			count: testCases.filter(t => t.level === 'unit').length,
			totalMs: testCases.filter(t => t.level === 'unit').reduce((s, t) => s + t.estimatedMs, 0),
			color: 'var(--color-success)'
		}
	]);

	let isInverted: boolean = $derived(
		(testCases.filter(t => t.level === 'e2e').length) >
		(testCases.filter(t => t.level === 'unit').length)
	);
</script>

<svelte:head>
	<title>20.1 — Testing Philosophy · Testing Deep Dive</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 20.1 · Mini-build</p>
		<h1>Testing Strategy Planner</h1>
		<p class="lede">
			Add test cases, assign levels, and watch the testing pyramid update.
			A healthy pyramid has many unit tests and few E2E tests.
		</p>
	</header>

	<div class="planner-layout">
		<section class="pyramid-section" aria-labelledby="pyramid-heading">
			<h2 id="pyramid-heading">Testing Pyramid</h2>
			{#if isInverted}
				<p class="warning">Warning: pyramid is inverted! More E2E tests than unit tests.</p>
			{/if}
			<div class="pyramid">
				{#each pyramid as level (level.level)}
					<div class="pyramid__level">
						<div
							class="pyramid__bar"
							style="inline-size: {level.level === 'Unit' ? '100%' : level.level === 'Integration' ? '66%' : '33%'}; background: {level.color}"
						>
							<span class="pyramid__label">{level.level}</span>
							<span class="pyramid__count">{level.count} tests</span>
							<span class="pyramid__time">{level.totalMs < 1000 ? `${level.totalMs}ms` : `${(level.totalMs / 1000).toFixed(1)}s`}</span>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="tests-section" aria-labelledby="tests-heading">
			<h2 id="tests-heading">Test Cases</h2>
			<ul class="test-list">
				{#each testCases as tc (tc.id)}
					<li class="test-item">
						<span class="test-item__level" class:test-item__level--unit={tc.level === 'unit'} class:test-item__level--integration={tc.level === 'integration'} class:test-item__level--e2e={tc.level === 'e2e'}>
							{tc.level}
						</span>
						<span class="test-item__desc">{tc.description}</span>
					</li>
				{/each}
			</ul>
			<form class="add-form" onsubmit={(e) => { e.preventDefault(); addTest(); }}>
				<input type="text" class="add-form__input" bind:value={newDescription} placeholder="Test description" />
				<select class="add-form__select" bind:value={newLevel}>
					<option value="unit">Unit</option>
					<option value="integration">Integration</option>
					<option value="e2e">E2E</option>
				</select>
				<button type="submit" class="btn">Add</button>
			</form>
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

	.planner-layout {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.planner-layout {
			grid-template-columns: 1fr 1fr;
		}
	}

	.pyramid-section, .tests-section {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.warning {
		font-size: var(--text-sm);
		color: var(--color-error);
		font-weight: 600;
		margin-block: var(--space-sm);
	}

	.pyramid {
		display: grid;
		gap: var(--space-sm);
		margin-block-start: var(--space-md);
	}

	.pyramid__level {
		display: flex;
		justify-content: center;
	}

	.pyramid__bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		color: oklch(100% 0 0);
		font-size: var(--text-xs);
		font-weight: 600;
		min-block-size: 2.5rem;
	}

	.pyramid__label {
		min-inline-size: 5rem;
	}

	.pyramid__count {
		font-variant-numeric: tabular-nums;
	}

	.pyramid__time {
		font-variant-numeric: tabular-nums;
		opacity: 0.8;
	}

	.test-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
		margin-block: var(--space-md);
		max-block-size: 20rem;
		overflow-y: auto;
	}

	.test-item {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
	}

	.test-item__level {
		font-size: var(--text-xs);
		font-weight: 700;
		text-transform: uppercase;
		min-inline-size: 5rem;
		text-align: center;
		padding: 0.1em 0.4em;
		border-radius: var(--radius-sm);
	}

	.test-item__level--unit { color: var(--color-success); }
	.test-item__level--integration { color: var(--color-warning); }
	.test-item__level--e2e { color: var(--color-error); }

	.test-item__desc {
		font-size: var(--text-sm);
	}

	.add-form {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	.add-form__input {
		flex: 1;
		min-inline-size: 10rem;
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		font-size: var(--text-sm);
		min-block-size: 44px;
	}

	.add-form__select {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		font-size: var(--text-sm);
		min-block-size: 44px;
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
</style>
