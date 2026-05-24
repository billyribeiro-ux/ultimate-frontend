<script lang="ts">
	let count: number = $state(0);
	let editHint: string = $state('Try editing this heading text and saving the file');

	interface HmrLogEntry {
		id: string;
		timestamp: string;
		moduleUrl: string;
		updateType: 'hot-update' | 'full-reload' | 'css-update';
	}

	let hmrLog: HmrLogEntry[] = $state([
		{
			id: '1',
			timestamp: new Date().toLocaleTimeString(),
			moduleUrl: '/src/routes/.../+page.svelte',
			updateType: 'hot-update'
		},
		{
			id: '2',
			timestamp: new Date(Date.now() - 5000).toLocaleTimeString(),
			moduleUrl: '/src/app.css',
			updateType: 'css-update'
		},
		{
			id: '3',
			timestamp: new Date(Date.now() - 15000).toLocaleTimeString(),
			moduleUrl: '/src/lib/utils/format.ts',
			updateType: 'full-reload'
		}
	]);

	function increment(): void {
		count += 1;
	}

	function decrement(): void {
		count -= 1;
	}

	function resetCounter(): void {
		count = 0;
	}

	function addSimulatedEvent(updateType: HmrLogEntry['updateType']): void {
		const moduleMap: Record<HmrLogEntry['updateType'], string> = {
			'hot-update': '/src/routes/.../+page.svelte',
			'css-update': '/src/app.css',
			'full-reload': '/src/lib/config.ts'
		};
		hmrLog = [{
			id: String(Date.now()),
			timestamp: new Date().toLocaleTimeString(),
			moduleUrl: moduleMap[updateType],
			updateType
		}, ...hmrLog].slice(0, 10);
	}
</script>

<svelte:head>
	<title>21.5 — HMR and the Dev Experience · Vite, Vitest & The Svelte Playground</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 21.5 · Mini-build</p>
		<h1>HMR State Preservation</h1>
		<p class="lede">
			{editHint}. The counter value survives because Svelte's HMR
			transfers $state values to the new component instance.
		</p>
	</header>

	<div class="demo-layout">
		<section class="counter-section" aria-labelledby="counter-heading">
			<h2 id="counter-heading">Persistent Counter</h2>
			<p class="counter-hint">
				Increment this counter, then edit and save this file.
				The count survives HMR updates.
			</p>
			<p class="counter-value" aria-live="polite">{count}</p>
			<div class="counter-controls">
				<button type="button" class="btn" onclick={decrement}>-1</button>
				<button type="button" class="btn" onclick={increment}>+1</button>
				<button type="button" class="btn btn--subtle" onclick={resetCounter}>Reset</button>
			</div>
		</section>

		<section class="log-section" aria-labelledby="log-heading">
			<h2 id="log-heading">HMR Event Log</h2>
			<div class="log-controls">
				<button
					type="button"
					class="sim-btn sim-btn--hot"
					onclick={() => addSimulatedEvent('hot-update')}
				>
					Simulate Hot Update
				</button>
				<button
					type="button"
					class="sim-btn sim-btn--css"
					onclick={() => addSimulatedEvent('css-update')}
				>
					Simulate CSS Update
				</button>
				<button
					type="button"
					class="sim-btn sim-btn--reload"
					onclick={() => addSimulatedEvent('full-reload')}
				>
					Simulate Full Reload
				</button>
			</div>
			<ul class="log-list">
				{#each hmrLog as entry (entry.id)}
					<li class="log-entry">
						<span
							class="log-entry__type"
							class:log-entry__type--hot={entry.updateType === 'hot-update'}
							class:log-entry__type--css={entry.updateType === 'css-update'}
							class:log-entry__type--reload={entry.updateType === 'full-reload'}
						>
							{entry.updateType}
						</span>
						<code class="log-entry__module">{entry.moduleUrl}</code>
						<span class="log-entry__time">{entry.timestamp}</span>
					</li>
				{/each}
			</ul>
		</section>
	</div>

	<article class="info-card">
		<h2>How HMR Preserves State</h2>
		<ol class="info-card__steps">
			<li>You save a file change</li>
			<li>Vite re-compiles the module</li>
			<li>WebSocket sends update to browser</li>
			<li>Old component's $state values are captured</li>
			<li>New component replaces old in the DOM</li>
			<li>Captured $state values are transferred to the new instance</li>
		</ol>
	</article>
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

	.demo-layout {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.demo-layout {
			grid-template-columns: 1fr 1fr;
		}
	}

	.counter-section, .log-section {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.counter-hint {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block: var(--space-sm);
	}

	.counter-value {
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--color-brand);
		font-variant-numeric: tabular-nums;
		text-align: center;
		padding-block: var(--space-md);
	}

	.counter-controls {
		display: flex;
		gap: var(--space-xs);
		justify-content: center;
	}

	.btn {
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		min-block-size: 44px;
		min-inline-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.btn:hover {
		border-color: var(--color-brand);
	}

	.btn--subtle {
		color: var(--color-text-muted);
	}

	.log-controls {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
		margin-block: var(--space-sm);
	}

	.sim-btn {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: 600;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.sim-btn--hot:hover { border-color: var(--color-success); }
	.sim-btn--css:hover { border-color: var(--color-brand); }
	.sim-btn--reload:hover { border-color: var(--color-error); }

	.log-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
		max-block-size: 15rem;
		overflow-y: auto;
	}

	.log-entry {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: var(--space-xs);
		align-items: center;
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
	}

	.log-entry__type {
		font-weight: 700;
		text-transform: uppercase;
		padding: 0.1em 0.4em;
		border-radius: var(--radius-sm);
	}

	.log-entry__type--hot { color: var(--color-success); }
	.log-entry__type--css { color: var(--color-brand); }
	.log-entry__type--reload { color: var(--color-error); }

	.log-entry__module {
		font-size: var(--text-xs);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.log-entry__time {
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.info-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.info-card__steps {
		padding-inline-start: var(--space-md);
		display: grid;
		gap: var(--space-xs);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-start: var(--space-sm);
	}
</style>
