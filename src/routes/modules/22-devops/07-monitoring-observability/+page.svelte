<script lang="ts">
	type LogLevel = 'info' | 'warn' | 'error';
	type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

	interface DashboardLogEntry {
		id: string;
		timestamp: string;
		level: LogLevel;
		message: string;
		module: string;
	}

	let logEntries: DashboardLogEntry[] = $state([]);
	let healthStatus: HealthStatus = $state('healthy');
	let uptimeSeconds: number = $state(0);
	let filterLevel: LogLevel | 'all' = $state('all');
	let isSimulatingFailure: boolean = $state(false);

	const modules: string[] = ['auth', 'checkout', 'products', 'search', 'api'];
	const infoMessages: string[] = [
		'Request processed successfully',
		'User session validated',
		'Cache hit for product listing',
		'Search query completed in 12ms',
		'API response served from cache'
	];
	const warnMessages: string[] = [
		'Retry attempt 2/3 for payment API',
		'Deprecated endpoint called: /api/v1/users',
		'Rate limit approaching: 80% of quota used'
	];
	const errorMessages: string[] = [
		'Payment API returned 500: Internal Server Error',
		'Database connection pool exhausted',
		'Unhandled exception in checkout module'
	];

	function generateLogEntry(): DashboardLogEntry {
		const level: LogLevel = isSimulatingFailure
			? (Math.random() > 0.4 ? 'error' : Math.random() > 0.5 ? 'warn' : 'info')
			: (Math.random() > 0.9 ? 'error' : Math.random() > 0.7 ? 'warn' : 'info');

		const messages: string[] = level === 'error' ? errorMessages : level === 'warn' ? warnMessages : infoMessages;

		return {
			id: crypto.randomUUID(),
			timestamp: new Date().toISOString(),
			level,
			message: messages[Math.floor(Math.random() * messages.length)],
			module: modules[Math.floor(Math.random() * modules.length)]
		};
	}

	let filteredEntries: DashboardLogEntry[] = $derived(
		filterLevel === 'all'
			? logEntries
			: logEntries.filter((e: DashboardLogEntry) => e.level === filterLevel)
	);

	let errorCount: number = $derived(
		logEntries.filter((e: DashboardLogEntry) => e.level === 'error').length
	);

	let warnCount: number = $derived(
		logEntries.filter((e: DashboardLogEntry) => e.level === 'warn').length
	);

	function simulateFailure(): void {
		isSimulatingFailure = true;
		healthStatus = 'degraded';
		setTimeout(() => {
			healthStatus = 'unhealthy';
		}, 2000);
	}

	function recoverSystem(): void {
		isSimulatingFailure = false;
		healthStatus = 'healthy';
	}

	$effect(() => {
		const logInterval: ReturnType<typeof setInterval> = setInterval(() => {
			const entry: DashboardLogEntry = generateLogEntry();
			logEntries = [entry, ...logEntries].slice(0, 50);
		}, 1500);

		const uptimeInterval: ReturnType<typeof setInterval> = setInterval(() => {
			uptimeSeconds += 1;
		}, 1000);

		return () => {
			clearInterval(logInterval);
			clearInterval(uptimeInterval);
		};
	});

	function formatUptime(seconds: number): string {
		const mins: number = Math.floor(seconds / 60);
		const secs: number = seconds % 60;
		return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}

	let statusColor: string = $derived(
		healthStatus === 'healthy' ? 'var(--color-success)' :
		healthStatus === 'degraded' ? 'var(--color-warning)' :
		'var(--color-error)'
	);
</script>

<svelte:head>
	<title>22.7 — Monitoring & Observability · DevOps & Edge Deployment</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 22.7 · Mini-build</p>
		<h1>Health Dashboard</h1>
		<p class="lede">
			Watch a simulated health monitor with live log stream, status indicator,
			and failure simulation.
		</p>
	</header>

	<div class="status-bar">
		<div class="status-indicator" style="--indicator-color: {statusColor}">
			<span class="status-indicator__dot"></span>
			<span class="status-indicator__label">{healthStatus.toUpperCase()}</span>
		</div>
		<div class="uptime">
			<span class="uptime__label">Uptime</span>
			<span class="uptime__value">{formatUptime(uptimeSeconds)}</span>
		</div>
		<div class="counts">
			<span class="counts__item counts__item--warn">{warnCount} warnings</span>
			<span class="counts__item counts__item--error">{errorCount} errors</span>
		</div>
	</div>

	<div class="actions">
		<button type="button" class="btn btn--danger" onclick={simulateFailure} disabled={isSimulatingFailure}>
			Simulate Failure
		</button>
		<button type="button" class="btn btn--success" onclick={recoverSystem} disabled={!isSimulatingFailure}>
			Recover System
		</button>
	</div>

	<section class="log-section">
		<div class="log-header">
			<h2>Log Stream</h2>
			<div class="log-filters">
				{#each ['all', 'info', 'warn', 'error'] as level (level)}
					<button
						type="button"
						class="filter-btn"
						class:filter-btn--active={filterLevel === level}
						onclick={() => { filterLevel = level as LogLevel | 'all'; }}
					>
						{level}
					</button>
				{/each}
			</div>
		</div>
		<div class="log-list" aria-live="polite">
			{#each filteredEntries as entry (entry.id)}
				<div class="log-entry log-entry--{entry.level}">
					<span class="log-entry__level">{entry.level.toUpperCase()}</span>
					<span class="log-entry__module">{entry.module}</span>
					<span class="log-entry__message">{entry.message}</span>
					<time class="log-entry__time">{entry.timestamp.split('T')[1]?.split('.')[0]}</time>
				</div>
			{/each}
		</div>
	</section>
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

	.status-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border-radius: var(--radius-lg);
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.status-indicator__dot {
		display: block;
		inline-size: 16px;
		block-size: 16px;
		border-radius: var(--radius-full);
		background: var(--indicator-color);
		box-shadow: 0 0 8px var(--indicator-color);
	}

	.status-indicator__label {
		font-weight: 700;
		font-size: var(--text-sm);
		letter-spacing: 0.05em;
	}

	.uptime {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.uptime__label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.uptime__value {
		font-family: ui-monospace, monospace;
		font-size: var(--text-xl);
		font-weight: 700;
	}

	.counts {
		display: flex;
		gap: var(--space-sm);
		margin-inline-start: auto;
	}

	.counts__item {
		font-size: var(--text-xs);
		padding: 2px var(--space-xs);
		border-radius: var(--radius-sm);
	}

	.counts__item--warn { color: var(--color-warning); }
	.counts__item--error { color: var(--color-error); }

	.actions {
		display: flex;
		gap: var(--space-sm);
	}

	.btn {
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-md);
		font-weight: 600;
		font-size: var(--text-sm);
		min-block-size: 44px;
	}

	.btn--danger { background: var(--color-error); color: oklch(100% 0 0); }
	.btn--success { background: var(--color-success); color: oklch(100% 0 0); }
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.log-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.log-filters {
		display: flex;
		gap: var(--space-xs);
	}

	.filter-btn {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-xs);
		text-transform: uppercase;
		min-block-size: 32px;
	}

	.filter-btn--active {
		border-color: var(--color-brand);
		color: var(--color-brand);
		font-weight: 700;
	}

	.log-list {
		max-block-size: 400px;
		overflow-y: auto;
		display: grid;
		gap: 2px;
		margin-block-start: var(--space-sm);
	}

	.log-entry {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface-2);
		border-inline-start: 3px solid var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.log-entry--warn { border-inline-start-color: var(--color-warning); }
	.log-entry--error { border-inline-start-color: var(--color-error); }

	.log-entry__level {
		font-weight: 700;
		font-size: var(--text-xs);
		min-inline-size: 5ch;
	}

	.log-entry--warn .log-entry__level { color: var(--color-warning); }
	.log-entry--error .log-entry__level { color: var(--color-error); }

	.log-entry__module {
		font-size: var(--text-xs);
		color: var(--color-brand);
		min-inline-size: 8ch;
	}

	.log-entry__message {
		flex: 1;
	}

	.log-entry__time {
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
</style>
