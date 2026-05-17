<script lang="ts">
	/**
	 * SIMULATED WebSocket connection panel.
	 *
	 * A real WebSocket requires adapter-node + the `ws` package on the server.
	 * This mini-build simulates the connection lifecycle with setTimeout/setInterval
	 * so the UI patterns (state management, message display, send queue) can be
	 * demonstrated without extra server infrastructure.
	 *
	 * See lesson-17.6-websocket-sveltekit.md for the real server setup.
	 */
	type ReadyState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

	interface DisplayMessage {
		readonly id: string;
		readonly direction: 'sent' | 'received';
		readonly type: string;
		readonly text: string;
		readonly timestamp: string;
	}

	let readyState: ReadyState = $state('CLOSED');
	let messages: DisplayMessage[] = $state([]);
	let inputText: string = $state('');
	let messageCount: number = $state(0);

	let simulationInterval: ReturnType<typeof setInterval> | null = null;

	function connect(): void {
		if (readyState !== 'CLOSED') return;
		readyState = 'CONNECTING';

		// Simulate handshake delay
		setTimeout(() => {
			readyState = 'OPEN';
			addMessage('received', 'presence:list', 'Connected. 3 users online: Alice, Bob, Charlie');
			startIncomingSimulation();
		}, 800);
	}

	function disconnect(): void {
		if (readyState !== 'OPEN') return;
		readyState = 'CLOSING';
		stopIncomingSimulation();

		setTimeout(() => {
			readyState = 'CLOSED';
			addMessage('received', 'system', 'Connection closed.');
		}, 300);
	}

	function sendMessage(): void {
		if (readyState !== 'OPEN' || !inputText.trim()) return;

		const text = inputText.trim();
		inputText = '';

		// Show sent message immediately (optimistic)
		addMessage('sent', 'chat:send', text);

		// Simulate server echo after short delay
		setTimeout(() => {
			if (readyState === 'OPEN') {
				addMessage('received', 'chat:message', `Echo: "${text}"`);
			}
		}, 500);
	}

	function addMessage(direction: 'sent' | 'received', type: string, text: string): void {
		const msg: DisplayMessage = {
			id: crypto.randomUUID(),
			direction,
			type,
			text,
			timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
		};
		messages = [...messages.slice(-29), msg]; // Keep last 30
		messageCount++;
	}

	function startIncomingSimulation(): void {
		const serverMessages: Array<{ type: string; text: string }> = [
			{ type: 'cursor:update', text: 'Alice moved cursor to (420, 280)' },
			{ type: 'chat:message', text: 'Bob: "Anyone working on the nav?"' },
			{ type: 'presence:joined', text: 'Dana joined the room' },
			{ type: 'cursor:update', text: 'Charlie moved cursor to (100, 500)' },
			{ type: 'chat:message', text: 'Alice: "I just finished the footer"' }
		];

		let index = 0;
		simulationInterval = setInterval(() => {
			if (readyState !== 'OPEN') return;
			const msg = serverMessages[index % serverMessages.length]!;
			addMessage('received', msg.type, msg.text);
			index++;
		}, 3000);
	}

	function stopIncomingSimulation(): void {
		if (simulationInterval !== null) {
			clearInterval(simulationInterval);
			simulationInterval = null;
		}
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	$effect(() => {
		return () => {
			stopIncomingSimulation();
		};
	});
</script>

<svelte:head>
	<title>Lesson 17.6 · WebSocket in SvelteKit · Ultimate Frontend</title>
	<meta
		name="description"
		content="Simulated WebSocket connection panel demonstrating state management and message display patterns."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 17.6 · Mini-build</p>
		<h1>WebSocket Connection Panel</h1>
		<p class="description">
			Simulated WebSocket lifecycle. Connect to see incoming messages and send your own.
			A real server requires adapter-node — see the lesson text for setup.
		</p>
	</header>

	<div class="connection-bar">
		<div class="connection-bar__info">
			<span class="connection-bar__url">ws://localhost:5173/ws</span>
			<span class="connection-bar__state connection-bar__state--{readyState.toLowerCase()}">{readyState}</span>
		</div>
		<div class="connection-bar__actions">
			{#if readyState === 'CLOSED'}
				<button class="btn" onclick={connect}>Connect</button>
			{:else if readyState === 'OPEN'}
				<button class="btn btn--secondary" onclick={disconnect}>Disconnect</button>
			{:else}
				<button class="btn" disabled>...</button>
			{/if}
		</div>
	</div>

	<div class="message-panel">
		<div class="message-list" role="log" aria-label="WebSocket messages">
			{#if messages.length === 0}
				<p class="message-list__empty">No messages. Click Connect to start.</p>
			{:else}
				{#each messages as msg (msg.id)}
					<div class="message message--{msg.direction}">
						<span class="message__meta">
							<span class="message__time">{msg.timestamp}</span>
							<span class="message__type">[{msg.type}]</span>
						</span>
						<span class="message__text">{msg.text}</span>
					</div>
				{/each}
			{/if}
		</div>

		<form class="send-form" onsubmit={(e) => { e.preventDefault(); sendMessage(); }}>
			<input
				class="send-form__input"
				type="text"
				placeholder={readyState === 'OPEN' ? 'Type a message...' : 'Connect first...'}
				disabled={readyState !== 'OPEN'}
				bind:value={inputText}
				onkeydown={handleKeydown}
			/>
			<button class="send-form__btn" type="submit" disabled={readyState !== 'OPEN' || !inputText.trim()}>
				Send
			</button>
		</form>
	</div>

	<p class="message-counter">Total messages: {messageCount}</p>
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

	.connection-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		flex-wrap: wrap;
	}

	.connection-bar__info {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.connection-bar__url {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.connection-bar__state {
		font-size: var(--text-xs);
		padding: 0.15em 0.6em;
		border-radius: var(--radius-full);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	.connection-bar__state--open {
		background: oklch(65% 0.18 145 / 0.15);
		color: var(--color-success);
	}

	.connection-bar__state--connecting {
		background: oklch(75% 0.18 85 / 0.15);
		color: var(--color-warning);
	}

	.connection-bar__state--closing {
		background: oklch(60% 0.22 25 / 0.15);
		color: var(--color-error);
	}

	.connection-bar__state--closed {
		background: oklch(50% 0.02 270 / 0.15);
		color: var(--color-text-muted);
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
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.message-panel {
		display: grid;
		grid-template-rows: 1fr auto;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		min-height: 20rem;
		max-height: 28rem;
	}

	.message-list {
		padding: var(--space-md);
		overflow-y: auto;
		display: grid;
		align-content: start;
		gap: var(--space-xs);
	}

	.message-list__empty {
		color: var(--color-text-muted);
		text-align: center;
		padding: var(--space-xl);
	}

	.message {
		display: grid;
		gap: 0.125rem;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		max-inline-size: 80%;
	}

	.message--sent {
		justify-self: end;
		background: oklch(60% 0.18 280 / 0.1);
		border: 1px solid oklch(60% 0.18 280 / 0.2);
	}

	.message--received {
		justify-self: start;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
	}

	.message__meta {
		display: flex;
		gap: var(--space-xs);
		font-size: var(--text-xs);
	}

	.message__time {
		color: var(--color-text-muted);
		font-family: ui-monospace, monospace;
	}

	.message__type {
		color: var(--color-brand);
		font-weight: 500;
	}

	.message__text {
		font-size: var(--text-sm);
	}

	.send-form {
		display: grid;
		grid-template-columns: 1fr auto;
		border-block-start: 1px solid var(--color-border);
	}

	.send-form__input {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border: none;
		min-block-size: 44px;
	}

	.send-form__input:disabled {
		opacity: 0.5;
	}

	.send-form__btn {
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		font-weight: 600;
		min-block-size: 44px;
		min-inline-size: 44px;
		transition: opacity var(--dur-fast) var(--ease-out);
	}

	.send-form__btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.message-counter {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.btn,
		.send-form__btn {
			transition: none;
		}
	}
</style>
