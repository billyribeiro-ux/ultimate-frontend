<script lang="ts">
	type AsyncState = 'pending' | 'resolved' | 'rejected';
	let state: AsyncState = $state('pending');
	let data: string = $state('');

	function resolve(): void { state = 'resolved'; data = 'Ada Lovelace'; }
	function reject(): void { state = 'rejected'; data = 'Network error'; }
	function reset(): void { state = 'pending'; data = ''; }

	let assertions: Array<{ text: string; passes: boolean }> = $derived([
		{ text: 'Loading indicator visible', passes: state === 'pending' },
		{ text: 'User name displayed', passes: state === 'resolved' },
		{ text: 'Error message shown', passes: state === 'rejected' },
		{ text: 'Loading hidden after resolve', passes: state !== 'pending' }
	]);
</script>

<svelte:head>
	<title>20.5 — Testing Async Components · Testing Deep Dive</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 20.5 · Mini-build</p>
		<h1>Async Component Test Simulator</h1>
		<p class="lede">
			Control a promise lifecycle and see how each state maps to
			test assertions for loading, success, and error.
		</p>
	</header>

	<div class="demo-layout">
		<section class="component-panel" aria-labelledby="component-heading">
			<h2 id="component-heading">Async Component</h2>
			<div class="async-preview">
				{#if state === 'pending'}
					<div class="loading">Loading...</div>
				{:else if state === 'resolved'}
					<div class="success">
						<h3>User Profile</h3>
						<p>{data}</p>
					</div>
				{:else}
					<div class="error">
						<h3>Error</h3>
						<p>{data}</p>
					</div>
				{/if}
			</div>
			<div class="controls">
				<button class="btn" onclick={reset}>Pending</button>
				<button class="btn btn--success" onclick={resolve}>Resolve</button>
				<button class="btn btn--error" onclick={reject}>Reject</button>
			</div>
		</section>

		<section class="assertions-panel" aria-labelledby="assertions-heading">
			<h2 id="assertions-heading">Test Assertions</h2>
			<ul class="assertion-list">
				{#each assertions as assertion}
					<li class="assertion" class:assertion--pass={assertion.passes} class:assertion--fail={!assertion.passes}>
						<span class="assertion__icon">{assertion.passes ? 'PASS' : 'FAIL'}</span>
						<span>{assertion.text}</span>
					</li>
				{/each}
			</ul>
		</section>
	</div>

	<section class="code-section" aria-labelledby="code-heading">
		<h2 id="code-heading">Test Pattern</h2>
		<pre class="code-block"><code>{`it('shows loading, then user name', async () => {
  global.fetch = vi.fn().mockResolvedValueOnce(
    new Response(JSON.stringify({ name: 'Ada Lovelace' }))
  );
  render(UserProfile, { props: { userId: '1' } });

  // Loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // Wait for data
  expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();

  // Loading gone
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});`}</code></pre>
	</section>
</section>

<style>
	.eyebrow { font-size: var(--text-sm); color: var(--color-brand); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
	.lede { font-size: var(--text-lg); color: var(--color-text-muted); max-inline-size: 50ch; }
	.demo-layout { display: grid; gap: var(--space-md); }
	@media (min-width: 768px) { .demo-layout { grid-template-columns: 1fr 1fr; } }
	.component-panel, .assertions-panel, .code-section { padding: var(--space-lg); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
	.async-preview { min-block-size: 8rem; display: grid; place-items: center; background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-md); margin-block-end: var(--space-md); }
	.loading { color: var(--color-brand); font-weight: 600; }
	.success h3 { color: var(--color-success); }
	.error h3 { color: var(--color-error); }
	.controls { display: flex; gap: var(--space-xs); justify-content: center; }
	.btn { padding: var(--space-xs) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600; min-block-size: 44px; transition: border-color var(--dur-fast) var(--ease-out); }
	.btn:hover { border-color: var(--color-brand); }
	.btn--success { border-color: var(--color-success); color: var(--color-success); }
	.btn--error { border-color: var(--color-error); color: var(--color-error); }
	.assertion-list { list-style: none; padding: 0; margin: var(--space-md) 0 0; display: grid; gap: var(--space-xs); }
	.assertion { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); font-size: var(--text-sm); }
	.assertion--pass { background: oklch(90% 0.05 145 / 0.2); }
	.assertion--fail { background: oklch(90% 0.05 25 / 0.1); }
	.assertion__icon { font-size: var(--text-xs); font-weight: 700; min-inline-size: 3rem; }
	.assertion--pass .assertion__icon { color: var(--color-success); }
	.assertion--fail .assertion__icon { color: var(--color-error); }
	.code-block { background: var(--color-surface); padding: var(--space-md); border-radius: var(--radius-md); overflow-x: auto; font-size: var(--text-xs); line-height: 1.6; white-space: pre; margin-block-start: var(--space-md); }
</style>
