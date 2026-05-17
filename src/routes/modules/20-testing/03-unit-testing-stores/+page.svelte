<script lang="ts">
	class SimulatedCounterStore {
		count: number = $state(0);
		doubled: number = $derived(this.count * 2);
		increment(): void { this.count += 1; }
		decrement(): void { this.count = Math.max(0, this.count - 1); }
		reset(): void { this.count = 0; }
	}

	let store = $state(new SimulatedCounterStore());

	interface TestResult { name: string; passed: boolean; message: string; }
	let results: TestResult[] = $state([]);
	let hasRun: boolean = $state(false);

	function runTests(): void {
		const s = new SimulatedCounterStore();
		const r: TestResult[] = [];
		r.push({ name: 'starts at zero', passed: s.count === 0, message: `Expected 0, got ${s.count}` });
		s.increment();
		r.push({ name: 'increments to 1', passed: s.count === 1, message: `Expected 1, got ${s.count}` });
		s.increment();
		r.push({ name: 'doubled is correct', passed: s.doubled === 4, message: `Expected 4, got ${s.doubled}` });
		const s2 = new SimulatedCounterStore();
		s2.decrement();
		r.push({ name: 'does not go below zero', passed: s2.count === 0, message: `Expected 0, got ${s2.count}` });
		s.reset();
		r.push({ name: 'reset sets count to zero', passed: s.count === 0, message: `Expected 0, got ${s.count}` });
		results = r;
		hasRun = true;
	}

	let passCount: number = $derived(results.filter(r => r.passed).length);
</script>

<svelte:head>
	<title>20.3 — Unit Testing Stores · Testing Deep Dive</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 20.3 · Mini-build</p>
		<h1>Store Test Runner</h1>
		<p class="lede">
			Interact with a reactive store and see how unit tests verify
			its behavior after each method call.
		</p>
	</header>

	<div class="runner-layout">
		<section class="store-panel" aria-labelledby="store-heading">
			<h2 id="store-heading">CounterStore</h2>
			<div class="store-display">
				<span class="store-value">{store.count}</span>
				<span class="store-derived">doubled: {store.doubled}</span>
			</div>
			<div class="store-actions">
				<button class="btn" onclick={() => store.increment()}>increment()</button>
				<button class="btn" onclick={() => store.decrement()}>decrement()</button>
				<button class="btn" onclick={() => store.reset()}>reset()</button>
			</div>
		</section>

		<section class="test-panel" aria-labelledby="test-heading">
			<h2 id="test-heading">Test Suite</h2>
			<button class="btn btn--primary" onclick={runTests}>Run Tests</button>
			{#if hasRun}
				<p class="test-summary">{passCount}/{results.length} tests passed</p>
				<ul class="test-results">
					{#each results as result (result.name)}
						<li class="test-result" class:test-result--pass={result.passed} class:test-result--fail={!result.passed}>
							<span class="test-result__icon">{result.passed ? 'PASS' : 'FAIL'}</span>
							<span class="test-result__name">{result.name}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>

	<section class="code-section" aria-labelledby="code-heading">
		<h2 id="code-heading">Test Code Pattern</h2>
		<pre class="code-block"><code>{`import { describe, it, expect } from 'vitest';
import { CounterStore } from '$lib/stores/counter.svelte';

describe('CounterStore', () => {
  it('starts at zero', () => {
    const store = new CounterStore();
    expect(store.count).toBe(0);
  });

  it('increments the count', () => {
    const store = new CounterStore();
    store.increment();
    expect(store.count).toBe(1);
  });

  it('computes doubled correctly', () => {
    const store = new CounterStore();
    store.increment();
    store.increment();
    expect(store.doubled).toBe(4);
  });
});`}</code></pre>
	</section>
</section>

<style>
	.eyebrow { font-size: var(--text-sm); color: var(--color-brand); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
	.lede { font-size: var(--text-lg); color: var(--color-text-muted); max-inline-size: 50ch; }
	.runner-layout { display: grid; gap: var(--space-md); }
	@media (min-width: 768px) { .runner-layout { grid-template-columns: 1fr 1fr; } }
	.store-panel, .test-panel, .code-section { padding: var(--space-lg); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
	.store-display { text-align: center; padding: var(--space-lg); }
	.store-value { font-size: var(--text-2xl); font-weight: 700; display: block; }
	.store-derived { font-size: var(--text-sm); color: var(--color-text-muted); }
	.store-actions { display: flex; gap: var(--space-xs); flex-wrap: wrap; justify-content: center; margin-block-start: var(--space-md); }
	.btn { padding: var(--space-xs) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600; min-block-size: 44px; font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; transition: border-color var(--dur-fast) var(--ease-out); }
	.btn:hover { border-color: var(--color-brand); }
	.btn--primary { background: var(--color-brand); color: oklch(100% 0 0); border-color: var(--color-brand); font-family: inherit; }
	.btn--primary:hover { background: var(--color-brand-dim); }
	.test-summary { font-size: var(--text-sm); font-weight: 600; margin-block: var(--space-sm); }
	.test-results { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-xs); }
	.test-result { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); font-size: var(--text-sm); }
	.test-result--pass { background: oklch(90% 0.05 145 / 0.2); }
	.test-result--fail { background: oklch(90% 0.05 25 / 0.2); }
	.test-result__icon { font-size: var(--text-xs); font-weight: 700; min-inline-size: 3rem; }
	.test-result--pass .test-result__icon { color: var(--color-success); }
	.test-result--fail .test-result__icon { color: var(--color-error); }
	.code-block { background: var(--color-surface); padding: var(--space-md); border-radius: var(--radius-md); overflow-x: auto; font-size: var(--text-xs); line-height: 1.6; white-space: pre; margin-block-start: var(--space-md); }
</style>
