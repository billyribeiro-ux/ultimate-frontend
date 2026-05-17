<script lang="ts">
	import type { WSServerMessage, ChatMessagePayload, CursorUpdatePayload, PresenceListPayload, ErrorPayload } from '$lib/realtime/types.js';

	interface LogEntry {
		readonly id: string;
		readonly timestamp: string;
		readonly message: WSServerMessage;
		readonly summary: string;
	}

	let log: LogEntry[] = $state([]);
	let running: boolean = $state(false);

	const USERNAMES: string[] = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eve'];
	const CHAT_MESSAGES: string[] = [
		'Hey everyone!',
		'Working on the header component',
		'Can someone review my PR?',
		'Just pushed a fix',
		'Taking a break, brb'
	];

	function randomFrom<T>(arr: readonly T[]): T {
		return arr[Math.floor(Math.random() * arr.length)]!;
	}

	function generateMessage(): WSServerMessage {
		const roll = Math.random();

		if (roll < 0.35) {
			const payload: ChatMessagePayload = {
				id: crypto.randomUUID(),
				userId: crypto.randomUUID().slice(0, 8),
				username: randomFrom(USERNAMES),
				text: randomFrom(CHAT_MESSAGES),
				timestamp: new Date().toISOString()
			};
			return { type: 'chat:message', payload };
		} else if (roll < 0.6) {
			const payload: CursorUpdatePayload = {
				userId: crypto.randomUUID().slice(0, 8),
				username: randomFrom(USERNAMES),
				x: Math.round(Math.random() * 1200),
				y: Math.round(Math.random() * 800),
				color: `oklch(65% 0.2 ${Math.round(Math.random() * 360)})`
			};
			return { type: 'cursor:update', payload };
		} else if (roll < 0.85) {
			const payload: PresenceListPayload = {
				users: USERNAMES.slice(0, 2 + Math.floor(Math.random() * 3)).map((u) => ({
					userId: crypto.randomUUID().slice(0, 8),
					username: u
				}))
			};
			return { type: 'presence:list', payload };
		} else {
			const payload: ErrorPayload = {
				code: 'RATE_LIMITED',
				message: 'Too many messages. Slow down.'
			};
			return { type: 'error', payload };
		}
	}

	function summariseMessage(msg: WSServerMessage): string {
		switch (msg.type) {
			case 'chat:message':
				return `${msg.payload.username}: "${msg.payload.text}"`;
			case 'cursor:update':
				return `${msg.payload.username} moved to (${msg.payload.x}, ${msg.payload.y})`;
			case 'presence:list':
				return `${msg.payload.users.length} users online: ${msg.payload.users.map((u) => u.username).join(', ')}`;
			case 'presence:joined':
				return `${msg.payload.username} joined`;
			case 'presence:left':
				return `${msg.payload.username} left`;
			case 'error':
				return `Error [${msg.payload.code}]: ${msg.payload.message}`;
			default: {
				const _exhaustive: never = msg;
				return `Unknown message: ${JSON.stringify(_exhaustive)}`;
			}
		}
	}

	function getTypeColor(type: string): string {
		switch (type) {
			case 'chat:message': return 'oklch(65% 0.15 230)';
			case 'cursor:update': return 'oklch(65% 0.18 145)';
			case 'presence:list': return 'oklch(60% 0.18 300)';
			case 'presence:joined': return 'oklch(60% 0.18 300)';
			case 'presence:left': return 'oklch(60% 0.18 300)';
			case 'error': return 'oklch(60% 0.22 25)';
			default: return 'oklch(50% 0.02 270)';
		}
	}

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function startSimulation(): void {
		if (running) return;
		running = true;
		log = [];

		function emitMessage(): void {
			const message = generateMessage();
			const entry: LogEntry = {
				id: crypto.randomUUID(),
				timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }),
				message,
				summary: summariseMessage(message)
			};
			log = [...log.slice(-19), entry]; // Keep max 20 entries
		}

		emitMessage(); // First message immediately
		intervalId = setInterval(() => {
			emitMessage();
		}, 1000 + Math.random() * 2000);
	}

	function stopSimulation(): void {
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
		running = false;
	}

	$effect(() => {
		return () => {
			if (intervalId !== null) {
				clearInterval(intervalId);
			}
		};
	});
</script>

<svelte:head>
	<title>Lesson 17.5 · WebSocket Fundamentals · Ultimate Frontend</title>
	<meta
		name="description"
		content="Simulated WebSocket message inspector demonstrating discriminated unions and exhaustive type handling."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 17.5 · Mini-build</p>
		<h1>WebSocket Message Inspector</h1>
		<p class="description">
			Simulated WebSocket messages processed through an exhaustive type handler.
			No real server required — this demonstrates the client-side pattern.
		</p>
	</header>

	<div class="controls">
		<button class="btn" onclick={startSimulation} disabled={running}>Start</button>
		<button class="btn btn--secondary" onclick={stopSimulation} disabled={!running}>Stop</button>
		<span class="controls__status">
			{running ? 'Receiving messages...' : log.length > 0 ? 'Stopped' : 'Press Start'}
		</span>
	</div>

	<div class="inspector" role="log" aria-live="polite" aria-label="Message log">
		{#if log.length === 0}
			<p class="inspector__empty">No messages yet. Start the simulation above.</p>
		{:else}
			{#each log as entry (entry.id)}
				<div class="inspector__entry">
					<span class="inspector__time">{entry.timestamp}</span>
					<span class="inspector__type" style="color: {getTypeColor(entry.message.type)}">[{entry.message.type}]</span>
					<span class="inspector__summary">{entry.summary}</span>
				</div>
			{/each}
		{/if}
	</div>
</section>

<style>
	section.page {
		--color-brand: oklch(60% 0.18 280);
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

	.controls {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.btn {
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
		min-block-size: 44px;
		min-inline-size: 44px;
		transition: opacity var(--dur-fast) var(--ease-out);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn--secondary {
		background: var(--color-surface-2);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.controls__status {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.inspector {
		padding: var(--space-md);
		background: oklch(15% 0.01 270);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		min-height: 20rem;
		max-height: 30rem;
		overflow-y: auto;
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-sm);
	}

	.inspector__empty {
		color: oklch(60% 0.02 270);
		text-align: center;
		padding: var(--space-xl);
	}

	.inspector__entry {
		display: flex;
		gap: var(--space-sm);
		padding: var(--space-xs) 0;
		border-bottom: 1px solid oklch(25% 0.01 270);
		flex-wrap: wrap;
	}

	.inspector__entry:last-child {
		border-bottom: none;
	}

	.inspector__time {
		color: oklch(55% 0.02 270);
		flex-shrink: 0;
	}

	.inspector__type {
		font-weight: 600;
		flex-shrink: 0;
	}

	.inspector__summary {
		color: oklch(85% 0.01 270);
	}

	@media (prefers-reduced-motion: reduce) {
		.btn {
			transition: none;
		}
	}
</style>
