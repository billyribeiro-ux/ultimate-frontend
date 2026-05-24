<script lang="ts">
	interface TestResult {
		id: string;
		name: string;
		suite: string;
		passed: boolean;
		duration: number;
		error: string | null;
	}

	let testResults: TestResult[] = $state([
		{ id: '1', name: 'adds two numbers', suite: 'math utils', passed: true, duration: 2, error: null },
		{ id: '2', name: 'subtracts two numbers', suite: 'math utils', passed: true, duration: 1, error: null },
		{ id: '3', name: 'divides by zero returns Infinity', suite: 'math utils', passed: true, duration: 1, error: null },
		{ id: '4', name: 'formats currency with locale', suite: 'format utils', passed: true, duration: 3, error: null },
		{ id: '5', name: 'formats empty string gracefully', suite: 'format utils', passed: false, duration: 5, error: 'Expected "" but received undefined' },
		{ id: '6', name: 'renders greeting with name', suite: 'Greeting component', passed: true, duration: 45, error: null },
		{ id: '7', name: 'handles missing name prop', suite: 'Greeting component', passed: true, duration: 38, error: null },
		{ id: '8', name: 'validates email format', suite: 'validation', passed: true, duration: 2, error: null },
		{ id: '9', name: 'rejects empty email', suite: 'validation', passed: false, duration: 1, error: 'Expected toThrow but function did not throw' }
	]);

	let newTestName: string = $state('');
	let newTestSuite: string = $state('custom tests');

	let passedCount: number = $derived(
		testResults.filter((t: TestResult) => t.passed).length
	);

	let failedCount: number = $derived(
		testResults.filter((t: TestResult) => !t.passed).length
	);

	let totalDuration: number = $derived(
		testResults.reduce((sum: number, t: TestResult) => sum + t.duration, 0)
	);

	let suites: string[] = $derived(
		[...new Set(testResults.map((t: TestResult) => t.suite))]
	);

	let filterSuite: string = $state('all');

	let filteredResults: TestResult[] = $derived(
		filterSuite === 'all'
			? testResults
			: testResults.filter((t: TestResult) => t.suite === filterSuite)
	);

	function addTest(): void {
		if (!newTestName.trim()) return;
		const passed: boolean = Math.random() > 0.3;
		testResults = [...testResults, {
			id: String(Date.now()),
			name: newTestName.trim(),
			suite: newTestSuite,
			passed,
			duration: Math.floor(Math.random() * 50) + 1,
			error: passed ? null : 'Assertion failed: expected values to match'
		}];
		newTestName = '';
	}

	function rerunTests(): void {
		testResults = testResults.map((t: TestResult) => ({
			...t,
			passed: Math.random() > 0.2,
			duration: Math.floor(Math.random() * 50) + 1,
			error: Math.random() > 0.2 ? null : 'Assertion failed'
		}));
	}
</script>

<svelte:head>
	<title>21.7 — Vitest Fundamentals · Vite, Vitest & The Svelte Playground</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 21.7 · Mini-build</p>
		<h1>Test Results Dashboard</h1>
		<p class="lede">
			View test results with pass/fail indicators, durations, and error
			details. Add custom tests and re-run the simulated suite.
		</p>
	</header>

	<div class="summary">
		<div class="summary__stat summary__stat--pass">
			<span class="summary__value">{passedCount}</span>
			<span class="summary__label">Passed</span>
		</div>
		<div class="summary__stat summary__stat--fail">
			<span class="summary__value">{failedCount}</span>
			<span class="summary__label">Failed</span>
		</div>
		<div class="summary__stat">
			<span class="summary__value">{totalDuration}ms</span>
			<span class="summary__label">Duration</span>
		</div>
		<button type="button" class="rerun-btn" onclick={rerunTests}>
			Re-run Suite
		</button>
	</div>

	<div class="suite-filters">
		<button
			type="button"
			class="filter-btn"
			class:filter-btn--active={filterSuite === 'all'}
			onclick={() => { filterSuite = 'all'; }}
		>
			All
		</button>
		{#each suites as suite (suite)}
			<button
				type="button"
				class="filter-btn"
				class:filter-btn--active={filterSuite === suite}
				onclick={() => { filterSuite = suite; }}
			>
				{suite}
			</button>
		{/each}
	</div>

	<ul class="test-list">
		{#each filteredResults as result (result.id)}
			<li class="test-card" class:test-card--fail={!result.passed}>
				<span
					class="test-card__status"
					class:test-card__status--pass={result.passed}
					class:test-card__status--fail={!result.passed}
				>
					{result.passed ? 'PASS' : 'FAIL'}
				</span>
				<div class="test-card__info">
					<span class="test-card__name">{result.name}</span>
					<span class="test-card__suite">{result.suite}</span>
					{#if result.error}
						<span class="test-card__error">{result.error}</span>
					{/if}
				</div>
				<span class="test-card__duration">{result.duration}ms</span>
			</li>
		{/each}
	</ul>

	<form class="add-form" onsubmit={(e) => { e.preventDefault(); addTest(); }}>
		<input
			type="text"
			class="add-form__input"
			placeholder="Test description"
			bind:value={newTestName}
		/>
		<input
			type="text"
			class="add-form__input add-form__input--short"
			placeholder="Suite name"
			bind:value={newTestSuite}
		/>
		<button type="submit" class="btn">Add Test</button>
	</form>
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

	.summary {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
		align-items: center;
	}

	.summary__stat {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		display: grid;
		gap: var(--space-xs);
		text-align: center;
	}

	.summary__stat--pass {
		border-color: var(--color-success);
	}

	.summary__stat--fail {
		border-color: var(--color-error);
	}

	.summary__value {
		font-size: var(--text-lg);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.summary__label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
	}

	.rerun-btn {
		padding: var(--space-xs) var(--space-md);
		border: 2px solid var(--color-brand);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-brand);
		min-block-size: 44px;
		transition: background var(--dur-fast) var(--ease-out);
	}

	.rerun-btn:hover {
		background: var(--color-surface-2);
	}

	.suite-filters {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	.filter-btn {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: 600;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.filter-btn--active {
		border-color: var(--color-brand);
		color: var(--color-brand);
	}

	.test-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.test-card {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: var(--space-sm);
		align-items: start;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.test-card--fail {
		border-inline-start: 3px solid var(--color-error);
	}

	.test-card__status {
		font-size: var(--text-xs);
		font-weight: 700;
		padding: 0.1em 0.4em;
		border-radius: var(--radius-sm);
		text-transform: uppercase;
	}

	.test-card__status--pass { color: var(--color-success); }
	.test-card__status--fail { color: var(--color-error); }

	.test-card__info {
		display: grid;
		gap: var(--space-xs);
	}

	.test-card__name {
		font-size: var(--text-sm);
		font-weight: 500;
	}

	.test-card__suite {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.test-card__error {
		font-size: var(--text-xs);
		color: var(--color-error);
		font-family: ui-monospace, monospace;
	}

	.test-card__duration {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
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

	.add-form__input--short {
		max-inline-size: 10rem;
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
