<script lang="ts">
	interface CounterResponse {
		count: number;
		edge: string;
		latencyMs: number;
	}

	const edgeLocations: string[] = [
		'Tokyo (NRT)', 'London (LHR)', 'San Francisco (SFO)',
		'Sydney (SYD)', 'Frankfurt (FRA)', 'Sao Paulo (GRU)',
		'Singapore (SIN)', 'Toronto (YYZ)', 'Mumbai (BOM)'
	];

	let count: number = $state(0);
	let currentEdge: string = $state('—');
	let currentLatency: number = $state(0);
	let requesting: boolean = $state(false);
	let history: CounterResponse[] = $state([]);

	async function increment(): Promise<void> {
		requesting = true;
		const startTime: number = performance.now();

		// Simulate edge KV latency (2-15ms at the edge)
		const simulatedLatency: number = Math.floor(Math.random() * 13) + 2;
		await new Promise<void>((resolve) => setTimeout(resolve, simulatedLatency));

		const edge: string = edgeLocations[Math.floor(Math.random() * edgeLocations.length)];
		const elapsed: number = Math.round(performance.now() - startTime);

		count += 1;

		const response: CounterResponse = {
			count,
			edge,
			latencyMs: elapsed
		};

		currentEdge = edge;
		currentLatency = elapsed;
		history = [response, ...history].slice(0, 10);
		requesting = false;
	}
</script>

<svelte:head>
	<title>22.2 — Cloudflare Workers & Pages · DevOps & Edge Deployment</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 22.2 · Mini-build</p>
		<h1>Edge Counter with Simulated KV</h1>
		<p class="lede">
			Each click simulates a KV read-increment-write at a random edge
			location, demonstrating the Cloudflare Workers request pattern.
		</p>
	</header>

	<div class="counter-display">
		<span class="counter-display__value">{count}</span>
		<span class="counter-display__label">visits stored in KV</span>
	</div>

	<button
		type="button"
		class="increment-btn"
		onclick={increment}
		disabled={requesting}
	>
		{requesting ? 'Writing to KV...' : 'Increment Counter'}
	</button>

	<div class="edge-info" aria-live="polite">
		<dl>
			<dt>Edge Location</dt>
			<dd>{currentEdge}</dd>
			<dt>Latency</dt>
			<dd>{currentLatency}ms</dd>
		</dl>
	</div>

	{#if history.length > 0}
		<section class="history">
			<h2>Request History</h2>
			<ol class="history-list">
				{#each history as entry (entry.count)}
					<li class="history-item">
						<span class="history-item__count">#{entry.count}</span>
						<span class="history-item__edge">{entry.edge}</span>
						<span class="history-item__latency">{entry.latencyMs}ms</span>
					</li>
				{/each}
			</ol>
		</section>
	{/if}
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

	.counter-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-2xl);
		background: var(--color-surface-2);
		border-radius: var(--radius-xl);
	}

	.counter-display__value {
		font-size: var(--text-hero);
		font-weight: 700;
		color: var(--color-brand);
		line-height: 1;
	}

	.counter-display__label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.increment-btn {
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
		font-size: var(--text-base);
		min-block-size: 44px;
		transition: background var(--dur-fast) var(--ease-out);
	}

	.increment-btn:hover:not(:disabled) {
		background: var(--color-brand-dim);
	}

	.increment-btn:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.edge-info {
		background: var(--color-surface-2);
		padding: var(--space-md);
		border-radius: var(--radius-md);
	}

	.edge-info dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		margin: 0;
	}

	.edge-info dt {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.edge-info dd {
		margin: 0;
		font-size: var(--text-base);
	}

	.history-list {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.history-item {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
	}

	.history-item__count {
		font-weight: 700;
		color: var(--color-brand);
		min-inline-size: 3rem;
	}

	.history-item__edge {
		flex: 1;
	}

	.history-item__latency {
		font-family: ui-monospace, monospace;
		color: var(--color-text-muted);
	}
</style>
