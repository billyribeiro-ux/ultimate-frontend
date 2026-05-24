<script lang="ts">
	type DeploymentStrategy = 'direct' | 'blue-green' | 'canary';

	interface TimelineEntry {
		id: string;
		version: string;
		timestamp: number;
		strategy: DeploymentStrategy;
		status: 'success' | 'failed' | 'rolled-back';
		isLive: boolean;
	}

	let timeline: TimelineEntry[] = $state([]);
	let versionMajor: number = $state(1);
	let versionMinor: number = $state(0);
	let selectedStrategy: DeploymentStrategy = $state('direct');

	let currentLive: TimelineEntry | undefined = $derived(
		timeline.find((e: TimelineEntry) => e.isLive)
	);

	function deployNewVersion(): void {
		versionMinor += 1;
		const newEntry: TimelineEntry = {
			id: crypto.randomUUID(),
			version: `v${versionMajor}.${versionMinor}.0`,
			timestamp: Date.now(),
			strategy: selectedStrategy,
			status: 'success',
			isLive: true
		};

		// Mark previous live as no longer live
		timeline = timeline.map((e: TimelineEntry) => ({ ...e, isLive: false }));
		timeline = [newEntry, ...timeline];
	}

	function simulateFailure(): void {
		if (timeline.length === 0) return;
		const latest: TimelineEntry = timeline[0];
		if (latest.status !== 'success') return;
		timeline = timeline.map((e: TimelineEntry, i: number) =>
			i === 0 ? { ...e, status: 'failed' as const, isLive: false } : e
		);
	}

	function rollbackTo(targetId: string): void {
		timeline = timeline.map((e: TimelineEntry) => {
			if (e.id === targetId) {
				return { ...e, isLive: true, status: 'success' as const };
			}
			if (e.isLive) {
				return { ...e, isLive: false, status: 'rolled-back' as const };
			}
			return e;
		});
	}

	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString();
	}

	function strategyLabel(strategy: DeploymentStrategy): string {
		switch (strategy) {
			case 'direct': return 'Direct';
			case 'blue-green': return 'Blue-Green';
			case 'canary': return 'Canary';
		}
	}
</script>

<svelte:head>
	<title>22.8 — Rollback & Incident Response · DevOps & Edge Deployment</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 22.8 · Mini-build</p>
		<h1>Deployment History Timeline</h1>
		<p class="lede">
			Deploy versions, simulate failures, and practice rolling back. Each
			action appears in the timeline below.
		</p>
	</header>

	<div class="controls">
		<label class="strategy-select">
			<span>Strategy:</span>
			<select bind:value={selectedStrategy}>
				<option value="direct">Direct</option>
				<option value="blue-green">Blue-Green</option>
				<option value="canary">Canary</option>
			</select>
		</label>
		<div class="control-actions">
			<button type="button" class="btn btn--primary" onclick={deployNewVersion}>
				Deploy New Version
			</button>
			<button
				type="button"
				class="btn btn--danger"
				onclick={simulateFailure}
				disabled={timeline.length === 0 || timeline[0].status !== 'success'}
			>
				Simulate Failure
			</button>
		</div>
	</div>

	{#if currentLive}
		<div class="live-banner">
			Currently live: <strong>{currentLive.version}</strong>
			({strategyLabel(currentLive.strategy)})
		</div>
	{/if}

	<div class="timeline" role="list">
		{#each timeline as entry (entry.id)}
			<div
				class="timeline-entry"
				class:timeline-entry--success={entry.status === 'success'}
				class:timeline-entry--failed={entry.status === 'failed'}
				class:timeline-entry--rolled-back={entry.status === 'rolled-back'}
				class:timeline-entry--live={entry.isLive}
				role="listitem"
			>
				<div class="timeline-entry__connector" aria-hidden="true">
					<span class="timeline-entry__dot"></span>
					<span class="timeline-entry__line"></span>
				</div>
				<div class="timeline-entry__content">
					<div class="timeline-entry__header">
						<span class="timeline-entry__version">{entry.version}</span>
						<span class="timeline-entry__status">{entry.status.toUpperCase()}</span>
						{#if entry.isLive}
							<span class="live-badge">LIVE</span>
						{/if}
					</div>
					<div class="timeline-entry__meta">
						<span>{strategyLabel(entry.strategy)}</span>
						<time>{formatTime(entry.timestamp)}</time>
					</div>
					{#if entry.status === 'success' && !entry.isLive}
						<button
							type="button"
							class="btn btn--rollback"
							onclick={() => rollbackTo(entry.id)}
						>
							Rollback to {entry.version}
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	{#if timeline.length === 0}
		<p class="empty-message">No deployments yet. Click "Deploy New Version" to begin.</p>
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

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-md);
	}

	.strategy-select {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.strategy-select select {
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-block-size: 44px;
	}

	.control-actions {
		display: flex;
		gap: var(--space-sm);
	}

	.btn {
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-md);
		font-weight: 600;
		font-size: var(--text-sm);
		min-block-size: 44px;
		transition: background var(--dur-fast) var(--ease-out);
	}

	.btn--primary { background: var(--color-brand); color: oklch(100% 0 0); }
	.btn--primary:hover { background: var(--color-brand-dim); }
	.btn--danger { background: var(--color-error); color: oklch(100% 0 0); }
	.btn--rollback {
		background: var(--color-surface);
		border: 1px solid var(--color-brand);
		color: var(--color-brand);
		margin-block-start: var(--space-xs);
	}
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.live-banner {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--color-success);
	}

	.timeline {
		position: relative;
		display: grid;
		gap: 0;
	}

	.timeline-entry {
		display: flex;
		gap: var(--space-md);
		padding-block: var(--space-sm);
	}

	.timeline-entry__connector {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-inline-size: 20px;
	}

	.timeline-entry__dot {
		display: block;
		inline-size: 14px;
		block-size: 14px;
		border-radius: var(--radius-full);
		background: var(--color-border);
		flex-shrink: 0;
	}

	.timeline-entry--success .timeline-entry__dot { background: var(--color-success); }
	.timeline-entry--failed .timeline-entry__dot { background: var(--color-error); }
	.timeline-entry--rolled-back .timeline-entry__dot { background: var(--color-warning); }
	.timeline-entry--live .timeline-entry__dot {
		box-shadow: 0 0 8px var(--color-success);
	}

	.timeline-entry__line {
		flex: 1;
		inline-size: 2px;
		background: var(--color-border);
		min-block-size: 20px;
	}

	.timeline-entry:last-child .timeline-entry__line {
		display: none;
	}

	.timeline-entry__content {
		flex: 1;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}

	.timeline-entry--live .timeline-entry__content {
		border: 1px solid var(--color-success);
	}

	.timeline-entry--failed .timeline-entry__content {
		border: 1px solid var(--color-error);
	}

	.timeline-entry__header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.timeline-entry__version {
		font-weight: 700;
		font-size: var(--text-base);
	}

	.timeline-entry__status {
		font-size: var(--text-xs);
		font-weight: 600;
		letter-spacing: 0.05em;
	}

	.timeline-entry--success .timeline-entry__status { color: var(--color-success); }
	.timeline-entry--failed .timeline-entry__status { color: var(--color-error); }
	.timeline-entry--rolled-back .timeline-entry__status { color: var(--color-warning); }

	.live-badge {
		padding: 2px var(--space-xs);
		background: var(--color-success);
		color: oklch(100% 0 0);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: 700;
	}

	.timeline-entry__meta {
		display: flex;
		gap: var(--space-sm);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-block-start: var(--space-xs);
	}

	.empty-message {
		text-align: center;
		color: var(--color-text-muted);
		padding: var(--space-xl);
	}
</style>
