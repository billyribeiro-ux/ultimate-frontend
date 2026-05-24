<script lang="ts">
	interface MockCall {
		id: string;
		args: string[];
		returnValue: string;
		timestamp: number;
	}

	interface MockFunction {
		name: string;
		calls: MockCall[];
		implementation: string;
	}

	let mocks: MockFunction[] = $state([
		{
			name: 'fetchUser',
			calls: [],
			implementation: 'mockResolvedValue({ id: "1", name: "Ada" })'
		},
		{
			name: 'goto',
			calls: [],
			implementation: 'vi.fn()'
		},
		{
			name: 'formatDate',
			calls: [],
			implementation: 'mockReturnValue("Jan 1, 2026")'
		}
	]);

	let selectedMockIndex: number = $state(0);
	let callArg: string = $state('');

	let selectedMock: MockFunction = $derived(mocks[selectedMockIndex]);

	let totalCalls: number = $derived(
		mocks.reduce((sum: number, m: MockFunction) => sum + m.calls.length, 0)
	);

	function callMock(): void {
		const argValue: string = callArg.trim() || '(no args)';
		const returnValues: Record<string, string> = {
			fetchUser: '{ id: "1", name: "Ada" }',
			goto: 'undefined',
			formatDate: '"Jan 1, 2026"'
		};

		const updatedMocks: MockFunction[] = [...mocks];
		updatedMocks[selectedMockIndex] = {
			...updatedMocks[selectedMockIndex],
			calls: [
				...updatedMocks[selectedMockIndex].calls,
				{
					id: String(Date.now()),
					args: [argValue],
					returnValue: returnValues[updatedMocks[selectedMockIndex].name] ?? 'undefined',
					timestamp: Date.now()
				}
			]
		};
		mocks = updatedMocks;
		callArg = '';
	}

	function clearCalls(): void {
		const updatedMocks: MockFunction[] = [...mocks];
		updatedMocks[selectedMockIndex] = {
			...updatedMocks[selectedMockIndex],
			calls: []
		};
		mocks = updatedMocks;
	}

	function clearAllMocks(): void {
		mocks = mocks.map((m: MockFunction) => ({ ...m, calls: [] }));
	}
</script>

<svelte:head>
	<title>21.8 — Mocking and Spying · Vite, Vitest & The Svelte Playground</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 21.8 · Mini-build</p>
		<h1>Mock Explorer</h1>
		<p class="lede">
			Call mock functions with custom arguments and see the recorded call
			history, return values, and call counts update in real time.
		</p>
	</header>

	<div class="mock-layout">
		<section class="mock-selector" aria-labelledby="mocks-heading">
			<h2 id="mocks-heading">Mock Functions</h2>
			<ul class="mock-list">
				{#each mocks as mock, index (mock.name)}
					<li>
						<button
							type="button"
							class="mock-btn"
							class:mock-btn--active={index === selectedMockIndex}
							onclick={() => { selectedMockIndex = index; }}
						>
							<code class="mock-btn__name">{mock.name}()</code>
							<span class="mock-btn__count">{mock.calls.length} calls</span>
						</button>
					</li>
				{/each}
			</ul>
			<p class="total-calls">Total calls across all mocks: {totalCalls}</p>
			<button type="button" class="clear-all-btn" onclick={clearAllMocks}>
				vi.restoreAllMocks()
			</button>
		</section>

		<section class="call-section" aria-labelledby="call-heading">
			<h2 id="call-heading">
				Call <code>{selectedMock.name}()</code>
			</h2>
			<p class="impl-label">
				Implementation: <code>{selectedMock.implementation}</code>
			</p>

			<form class="call-form" onsubmit={(e) => { e.preventDefault(); callMock(); }}>
				<input
					type="text"
					class="call-input"
					placeholder="Argument (e.g., '/login')"
					bind:value={callArg}
				/>
				<button type="submit" class="btn btn--primary">Call</button>
				<button type="button" class="btn" onclick={clearCalls}>
					mockClear()
				</button>
			</form>

			<div class="call-history">
				<h3>Call History ({selectedMock.calls.length})</h3>
				{#if selectedMock.calls.length === 0}
					<p class="no-calls">No calls recorded yet.</p>
				{:else}
					<ul class="call-list">
						{#each selectedMock.calls as call, callIndex (call.id)}
							<li class="call-card">
								<span class="call-card__index">Call {callIndex + 1}</span>
								<dl class="call-card__details">
									<dt>Args</dt>
									<dd><code>{call.args.join(', ')}</code></dd>
									<dt>Return</dt>
									<dd><code>{call.returnValue}</code></dd>
								</dl>
							</li>
						{/each}
					</ul>
				{/if}
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

	.mock-layout {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.mock-layout {
			grid-template-columns: 1fr 2fr;
		}
	}

	.mock-selector {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.mock-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
		margin-block: var(--space-sm);
	}

	.mock-btn {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		inline-size: 100%;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.mock-btn--active {
		border-color: var(--color-brand);
	}

	.mock-btn__name {
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.mock-btn__count {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.total-calls {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-block: var(--space-sm);
	}

	.clear-all-btn {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--color-error);
		min-block-size: 44px;
	}

	.call-section {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.impl-label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-block: var(--space-xs);
	}

	.call-form {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
		margin-block: var(--space-sm);
	}

	.call-input {
		flex: 1;
		min-inline-size: 10rem;
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

	.btn--primary {
		border-color: var(--color-brand);
		color: var(--color-brand);
	}

	.call-history h3 {
		font-size: var(--text-sm);
		margin-block-end: var(--space-sm);
	}

	.no-calls {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.call-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
		max-block-size: 20rem;
		overflow-y: auto;
	}

	.call-card {
		padding: var(--space-sm);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		display: grid;
		gap: var(--space-xs);
	}

	.call-card__index {
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--color-brand);
	}

	.call-card__details {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-sm);
		font-size: var(--text-xs);
	}

	.call-card__details dt {
		font-weight: 600;
		color: var(--color-text-muted);
	}
</style>
