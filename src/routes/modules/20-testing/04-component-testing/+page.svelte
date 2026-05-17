<script lang="ts">
	let count: number = $state(0);
	let testCode: string = $derived(`import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Counter from '$lib/components/Counter.svelte';

it('displays the current count', () => {
  render(Counter, { props: { initial: ${count} } });
  expect(screen.getByText('${count}')).toBeInTheDocument();
});

it('count is ${count > 0 ? 'greater than zero' : 'zero'}', () => {
  render(Counter, { props: { initial: ${count} } });
  const display = screen.getByRole('status');
  expect(display).toHaveTextContent('${count}');
});`);
</script>

<svelte:head>
	<title>20.4 — Component Testing · Testing Deep Dive</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 20.4 · Mini-build</p>
		<h1>Component Test Demonstrator</h1>
		<p class="lede">
			Interact with a component and see the corresponding test code update
			to match the current state.
		</p>
	</header>

	<div class="demo-layout">
		<section class="component-panel" aria-labelledby="component-heading">
			<h2 id="component-heading">Live Component</h2>
			<div class="counter-demo">
				<div class="counter-display" role="status">{count}</div>
				<div class="counter-actions">
					<button class="btn" onclick={() => count = Math.max(0, count - 1)}>Decrement</button>
					<button class="btn btn--primary" onclick={() => count += 1}>Increment</button>
					<button class="btn" onclick={() => count = 0}>Reset</button>
				</div>
			</div>
		</section>

		<section class="test-panel" aria-labelledby="test-heading">
			<h2 id="test-heading">Generated Test Code</h2>
			<pre class="test-code"><code>{testCode}</code></pre>
		</section>
	</div>

	<section class="patterns" aria-labelledby="patterns-heading">
		<h2 id="patterns-heading">Query Priority (Best to Worst)</h2>
		<ol class="pattern-list">
			<li><code>getByRole</code> — accessible role + name (buttons, inputs, headings)</li>
			<li><code>getByLabelText</code> — form inputs via their label</li>
			<li><code>getByText</code> — visible text content</li>
			<li><code>getByPlaceholderText</code> — input placeholders</li>
			<li><code>getByTestId</code> — last resort via data-testid attribute</li>
		</ol>
	</section>
</section>

<style>
	.eyebrow { font-size: var(--text-sm); color: var(--color-brand); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
	.lede { font-size: var(--text-lg); color: var(--color-text-muted); max-inline-size: 50ch; }
	.demo-layout { display: grid; gap: var(--space-md); }
	@media (min-width: 768px) { .demo-layout { grid-template-columns: 1fr 1fr; } }
	.component-panel, .test-panel, .patterns { padding: var(--space-lg); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
	.test-panel { border-color: var(--color-brand); }
	.counter-demo { text-align: center; }
	.counter-display { font-size: var(--text-2xl); font-weight: 700; padding: var(--space-lg); }
	.counter-actions { display: flex; gap: var(--space-xs); justify-content: center; }
	.btn { padding: var(--space-xs) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600; min-block-size: 44px; transition: border-color var(--dur-fast) var(--ease-out); }
	.btn:hover { border-color: var(--color-brand); }
	.btn--primary { background: var(--color-brand); color: oklch(100% 0 0); border-color: var(--color-brand); }
	.btn--primary:hover { background: var(--color-brand-dim); }
	.test-code { background: var(--color-surface); padding: var(--space-md); border-radius: var(--radius-md); overflow-x: auto; font-size: var(--text-xs); line-height: 1.6; white-space: pre; margin-block-start: var(--space-md); }
	.pattern-list { padding-inline-start: var(--space-md); display: grid; gap: var(--space-sm); font-size: var(--text-sm); }
</style>
