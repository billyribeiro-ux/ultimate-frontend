<script lang="ts">
	/**
	 * Connection health monitor demonstrating:
	 * 1. Exponential backoff reconnection
	 * 2. Heartbeat ping/pong
	 * 3. BroadcastChannel multi-tab coordination
	 */

	type ConnectionPhase = 'connected' | 'disconnected' | 'backing-off' | 'reconnecting';

	interface BackoffEvent {
		readonly id: string;
		readonly attempt: number;
		readonly delay: number;
		readonly timestamp: string;
	}

	interface HeartbeatEvent {
		readonly id: string;
		readonly type: 'ping' | 'pong';
		readonly timestamp: string;
	}

	// --- Exponential backoff state ---
	let phase: ConnectionPhase = $state('connected');
	let attempt: number = $state(0);
	let countdown: number = $state(0);
	let backoffLog: BackoffEvent[] = $state([]);

	// --- Heartbeat state ---
	let heartbeatLog: HeartbeatEvent[] = $state([]);
	let lastPingTime: number = $state(0);
	let latency: number = $state(0);

	// --- BroadcastChannel state ---
	let isLeader: boolean = $state(false);
	let tabId: string = $state(crypto.randomUUID().slice(0, 8));
	let tabMessages: string[] = $state([]);

	function calculateBackoff(att: number): number {
		const baseMs = 1000;
		const maxMs = 30000;
		const exponential = Math.min(baseMs * 2 ** att, maxMs);
		return Math.round(exponential * (0.5 + Math.random() * 0.5));
	}

	// --- Backoff simulation ---
	let disconnectTimer: ReturnType<typeof setTimeout> | null = null;
	let countdownTimer: ReturnType<typeof setInterval> | null = null;
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

	function simulateDisconnect(): void {
		phase = 'disconnected';
		const delay = calculateBackoff(attempt);

		backoffLog = [...backoffLog.slice(-4), {
			id: crypto.randomUUID(),
			attempt,
			delay,
			timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
		}];

		countdown = Math.ceil(delay / 1000);
		phase = 'backing-off';

		countdownTimer = setInterval(() => {
			countdown--;
			if (countdown <= 0 && countdownTimer) {
				clearInterval(countdownTimer);
				countdownTimer = null;
			}
		}, 1000);

		reconnectTimer = setTimeout(() => {
			phase = 'reconnecting';
			// Simulate reconnection taking 500ms
			setTimeout(() => {
				phase = 'connected';
				attempt++;
				scheduleNextDisconnect();
			}, 500);
		}, delay);
	}

	function scheduleNextDisconnect(): void {
		disconnectTimer = setTimeout(simulateDisconnect, 8000 + Math.random() * 4000);
	}

	// --- Heartbeat simulation ---
	let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

	function startHeartbeat(): void {
		heartbeatInterval = setInterval(() => {
			if (phase !== 'connected') return;

			lastPingTime = performance.now();
			heartbeatLog = [...heartbeatLog.slice(-5), {
				id: crypto.randomUUID(),
				type: 'ping',
				timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
			}];

			// Simulate pong response after 20-80ms
			setTimeout(() => {
				latency = Math.round(performance.now() - lastPingTime);
				heartbeatLog = [...heartbeatLog.slice(-5), {
					id: crypto.randomUUID(),
					type: 'pong',
					timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
				}];
			}, 20 + Math.random() * 60);
		}, 3000);
	}

	// --- BroadcastChannel ---
	let channel: BroadcastChannel | null = null;

	function initBroadcastChannel(): void {
		channel = new BroadcastChannel('module-17-scaling');

		// Claim leadership immediately (simple strategy: first tab wins)
		channel.postMessage({ type: 'leader-claim', tabId });
		isLeader = true;

		channel.addEventListener('message', (event: MessageEvent) => {
			const data = event.data;
			if (data.type === 'leader-claim' && data.tabId !== tabId) {
				// Another tab claimed leadership — we become follower
				// (In production, use timestamps or election logic)
				tabMessages = [...tabMessages.slice(-4), `Tab ${data.tabId} claimed leadership`];
			} else if (data.type === 'data-forward') {
				tabMessages = [...tabMessages.slice(-4), `Received: ${data.payload}`];
			}
		});

		// Periodically broadcast data if leader
		setInterval(() => {
			if (isLeader && channel) {
				channel.postMessage({ type: 'data-forward', tabId, payload: `heartbeat from ${tabId}` });
			}
		}, 5000);
	}

	// --- Lifecycle ---
	$effect(() => {
		scheduleNextDisconnect();
		startHeartbeat();
		initBroadcastChannel();

		return () => {
			if (disconnectTimer) clearTimeout(disconnectTimer);
			if (countdownTimer) clearInterval(countdownTimer);
			if (reconnectTimer) clearTimeout(reconnectTimer);
			if (heartbeatInterval) clearInterval(heartbeatInterval);
			if (channel) channel.close();
		};
	});

	const phaseLabels: Record<ConnectionPhase, string> = {
		connected: 'Connected',
		disconnected: 'Disconnected',
		'backing-off': 'Backing off...',
		reconnecting: 'Reconnecting...'
	};
</script>

<svelte:head>
	<title>Lesson 17.8 · Scaling Patterns · Ultimate Frontend</title>
	<meta
		name="description"
		content="Connection health monitor demonstrating exponential backoff, heartbeat, and BroadcastChannel multi-tab coordination."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 17.8 · Mini-build</p>
		<h1>Connection Health Monitor</h1>
		<p class="description">
			Three production patterns in one dashboard: exponential backoff, heartbeat ping/pong,
			and BroadcastChannel multi-tab. Open a second tab to see tab coordination.
		</p>
	</header>

	<div class="panels">
		<!-- Backoff Panel -->
		<article class="panel">
			<h2 class="panel__title">Exponential Backoff</h2>
			<div class="panel__status">
				<span class="phase-dot phase-dot--{phase}"></span>
				<span class="phase-label">{phaseLabels[phase]}</span>
				{#if phase === 'backing-off'}
					<span class="countdown">{countdown}s</span>
				{/if}
			</div>
			<p class="panel__detail">Attempt: {attempt} | Next delay: ~{calculateBackoff(attempt)}ms</p>
			<div class="log">
				{#each backoffLog as entry (entry.id)}
					<p class="log__entry">
						<span class="log__time">{entry.timestamp}</span>
						Attempt {entry.attempt}: wait {entry.delay}ms
					</p>
				{/each}
			</div>
		</article>

		<!-- Heartbeat Panel -->
		<article class="panel">
			<h2 class="panel__title">Heartbeat Ping/Pong</h2>
			<div class="panel__status">
				<span class="phase-dot phase-dot--connected"></span>
				<span class="phase-label">Latency: {latency}ms</span>
			</div>
			<p class="panel__detail">Interval: 3s | Timeout: 5s</p>
			<div class="log">
				{#each heartbeatLog as entry (entry.id)}
					<p class="log__entry">
						<span class="log__time">{entry.timestamp}</span>
						<span class="log__type log__type--{entry.type}">{entry.type}</span>
					</p>
				{/each}
			</div>
		</article>

		<!-- BroadcastChannel Panel -->
		<article class="panel">
			<h2 class="panel__title">BroadcastChannel</h2>
			<div class="panel__status">
				<span class="phase-dot" class:phase-dot--connected={isLeader} class:phase-dot--backing-off={!isLeader}></span>
				<span class="phase-label">{isLeader ? 'Leader' : 'Follower'}</span>
			</div>
			<p class="panel__detail">Tab ID: {tabId}</p>
			<div class="log">
				{#each tabMessages as msg, i (i)}
					<p class="log__entry">{msg}</p>
				{/each}
				{#if tabMessages.length === 0}
					<p class="log__empty">Open another tab to see messages</p>
				{/if}
			</div>
		</article>
	</div>
</section>

<style>
	section.page {
		--color-brand: oklch(60% 0.15 170);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.description {
		color: var(--color-text-muted);
		max-inline-size: 55ch;
	}

	.panels {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.panels {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.panel {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-md);
		display: grid;
		gap: var(--space-sm);
		align-content: start;
	}

	.panel__title {
		font-size: var(--text-base);
		font-weight: 600;
	}

	.panel__status {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.panel__detail {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-family: ui-monospace, monospace;
	}

	.phase-dot {
		width: 0.625rem;
		height: 0.625rem;
		border-radius: var(--radius-full);
		background: var(--color-text-muted);
		flex-shrink: 0;
	}

	.phase-dot--connected {
		background: var(--color-success);
	}

	.phase-dot--disconnected {
		background: var(--color-error);
	}

	.phase-dot--backing-off {
		background: var(--color-warning);
		animation: pulse-dot 1s var(--ease-in-out) infinite;
	}

	.phase-dot--reconnecting {
		background: var(--color-brand);
		animation: pulse-dot 0.5s var(--ease-in-out) infinite;
	}

	.phase-label {
		font-size: var(--text-sm);
		font-weight: 500;
	}

	.countdown {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		color: var(--color-warning);
		font-weight: 600;
	}

	.log {
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		padding: var(--space-sm);
		min-height: 6rem;
		max-height: 10rem;
		overflow-y: auto;
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
	}

	.log__entry {
		padding: 0.125rem 0;
		color: var(--color-text-muted);
	}

	.log__time {
		color: oklch(55% 0.02 270);
		margin-inline-end: var(--space-xs);
	}

	.log__type {
		font-weight: 600;
	}

	.log__type--ping {
		color: var(--color-brand);
	}

	.log__type--pong {
		color: var(--color-success);
	}

	.log__empty {
		color: oklch(55% 0.02 270);
		text-align: center;
		padding: var(--space-md);
	}

	@keyframes pulse-dot {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.3; }
	}

	@media (prefers-reduced-motion: reduce) {
		.phase-dot--backing-off,
		.phase-dot--reconnecting {
			animation: none;
		}
	}
</style>
