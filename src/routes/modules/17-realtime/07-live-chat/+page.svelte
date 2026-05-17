<script lang="ts">
	/**
	 * SIMULATED live chat with presence.
	 *
	 * A real implementation would use `new WebSocket('ws://...')` instead of
	 * setInterval-based bot simulation. The UI patterns (optimistic send,
	 * auto-scroll, presence tracking) are identical regardless of transport.
	 */

	interface ChatMessage {
		readonly id: string;
		readonly userId: string;
		readonly username: string;
		readonly text: string;
		readonly timestamp: string;
		readonly status: 'sending' | 'sent' | 'failed';
	}

	interface OnlineUser {
		readonly userId: string;
		readonly username: string;
		readonly color: string;
	}

	const CURRENT_USER: OnlineUser = { userId: 'me', username: 'You', color: 'oklch(60% 0.18 280)' };

	const BOTS: OnlineUser[] = [
		{ userId: 'alice', username: 'Alice', color: 'oklch(65% 0.18 145)' },
		{ userId: 'bob', username: 'Bob', color: 'oklch(65% 0.2 200)' },
		{ userId: 'charlie', username: 'Charlie', color: 'oklch(70% 0.18 50)' }
	];

	const BOT_MESSAGES: string[] = [
		'Hey! How is everyone doing?',
		'Just finished the component refactor.',
		'Anyone free for a code review?',
		'The tests are passing now!',
		'Working on the responsive layout next.',
		'Nice work on that PR!',
		'Taking a short break.',
		'Back! What did I miss?',
		'The deploy looks good.',
		'Let me check the staging environment.'
	];

	let messages: ChatMessage[] = $state([]);
	let onlineUsers: OnlineUser[] = $state([CURRENT_USER, ...BOTS]);
	let inputText: string = $state('');
	let shouldAutoScroll: boolean = $state(true);
	let messageListEl: HTMLElement | undefined = $state(undefined);
	let connected: boolean = $state(true);

	let botInterval: ReturnType<typeof setInterval> | null = null;

	function sendMessage(): void {
		const text = inputText.trim();
		if (!text || !connected) return;

		const msg: ChatMessage = {
			id: crypto.randomUUID(),
			userId: CURRENT_USER.userId,
			username: CURRENT_USER.username,
			text,
			timestamp: new Date().toISOString(),
			status: 'sending'
		};

		messages = [...messages, msg];
		inputText = '';

		// Simulate server confirmation
		setTimeout(() => {
			messages = messages.map((m) =>
				m.id === msg.id ? { ...m, status: 'sent' as const } : m
			);
		}, 300 + Math.random() * 200);
	}

	function handleScroll(): void {
		if (!messageListEl) return;
		const { scrollTop, scrollHeight, clientHeight } = messageListEl;
		shouldAutoScroll = scrollHeight - scrollTop - clientHeight < 50;
	}

	// Auto-scroll when new messages arrive (if near bottom)
	$effect(() => {
		const _ = messages.length;
		if (shouldAutoScroll && messageListEl) {
			// Use microtask to ensure DOM has updated
			queueMicrotask(() => {
				if (messageListEl) {
					messageListEl.scrollTop = messageListEl.scrollHeight;
				}
			});
		}
	});

	// Bot message simulation
	$effect(() => {
		function emitBotMessage(): void {
			const bot = BOTS[Math.floor(Math.random() * BOTS.length)]!;
			const text = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)]!;
			const msg: ChatMessage = {
				id: crypto.randomUUID(),
				userId: bot.userId,
				username: bot.username,
				text,
				timestamp: new Date().toISOString(),
				status: 'sent'
			};
			messages = [...messages.slice(-99), msg]; // Keep last 100
		}

		botInterval = setInterval(emitBotMessage, 2000 + Math.random() * 3000);

		return () => {
			if (botInterval !== null) {
				clearInterval(botInterval);
			}
		};
	});

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function getUserColor(userId: string): string {
		if (userId === CURRENT_USER.userId) return CURRENT_USER.color;
		const bot = BOTS.find((b) => b.userId === userId);
		return bot?.color ?? 'oklch(50% 0.02 270)';
	}
</script>

<svelte:head>
	<title>Lesson 17.7 · Live Chat · Ultimate Frontend</title>
	<meta
		name="description"
		content="Simulated live chat with optimistic send, auto-scroll, and user presence indicators."
	/>
</svelte:head>

<section class="page">
	<header class="chat-header">
		<div>
			<p class="eyebrow">Lesson 17.7 · Mini-build</p>
			<h1>Live Chat</h1>
		</div>
		<span class="online-count">{onlineUsers.length} online</span>
	</header>

	<div class="chat-layout">
		<div class="chat-main">
			<div
				class="message-list"
				role="log"
				aria-label="Chat messages"
				bind:this={messageListEl}
				onscroll={handleScroll}
			>
				{#each messages as msg (msg.id)}
					<div class="msg" class:msg--mine={msg.userId === CURRENT_USER.userId}>
						<div class="msg__bubble" class:msg__bubble--mine={msg.userId === CURRENT_USER.userId}>
							{#if msg.userId !== CURRENT_USER.userId}
								<span class="msg__author" style="color: {getUserColor(msg.userId)}">{msg.username}</span>
							{/if}
							<p class="msg__text">{msg.text}</p>
							<span class="msg__meta">
								<time>{new Date(msg.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</time>
								{#if msg.userId === CURRENT_USER.userId}
									<span class="msg__status msg__status--{msg.status}">
										{msg.status === 'sending' ? '...' : msg.status === 'sent' ? '✓' : '✗'}
									</span>
								{/if}
							</span>
						</div>
					</div>
				{/each}
			</div>

			<form class="send-form" onsubmit={(e) => { e.preventDefault(); sendMessage(); }}>
				<input
					class="send-form__input"
					type="text"
					placeholder="Type a message..."
					bind:value={inputText}
					onkeydown={handleKeydown}
					maxlength={500}
				/>
				<button class="send-form__btn" type="submit" disabled={!inputText.trim()}>
					Send
				</button>
			</form>
		</div>

		<aside class="presence-sidebar" aria-label="Online users">
			<h2 class="presence-sidebar__title">Online</h2>
			<ul class="presence-list">
				{#each onlineUsers as user (user.userId)}
					<li class="presence-item">
						<span class="presence-item__dot" style="background: {user.color}"></span>
						<span class="presence-item__name">{user.username}</span>
					</li>
				{/each}
			</ul>
		</aside>
	</div>
</section>

<style>
	section.page {
		--color-brand: oklch(60% 0.18 280);
		display: grid;
		grid-template-rows: auto 1fr;
		min-height: 100dvb;
		max-inline-size: var(--content-max);
		margin-inline: auto;
		padding-inline: var(--space-md);
		padding-block: var(--space-md);
		gap: var(--space-md);
	}

	.chat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	h1 {
		font-size: var(--text-xl);
	}

	.online-count {
		font-size: var(--text-sm);
		color: var(--color-success);
		font-weight: 500;
	}

	.chat-layout {
		display: grid;
		gap: var(--space-md);
		min-height: 0;
	}

	@media (min-width: 768px) {
		.chat-layout {
			grid-template-columns: 1fr 12rem;
		}
	}

	.chat-main {
		display: grid;
		grid-template-rows: 1fr auto;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		min-height: 24rem;
		max-height: 70dvb;
	}

	.message-list {
		padding: var(--space-md);
		overflow-y: auto;
		display: grid;
		align-content: start;
		gap: var(--space-sm);
	}

	.msg {
		display: grid;
	}

	.msg--mine {
		justify-items: end;
	}

	.msg__bubble {
		max-inline-size: 75%;
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		display: grid;
		gap: 0.125rem;
	}

	.msg__bubble--mine {
		background: oklch(60% 0.18 280 / 0.1);
		border-color: oklch(60% 0.18 280 / 0.25);
	}

	.msg__author {
		font-size: var(--text-xs);
		font-weight: 600;
	}

	.msg__text {
		font-size: var(--text-sm);
		word-break: break-word;
	}

	.msg__meta {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-xs);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.msg__status--sending {
		color: var(--color-warning);
	}

	.msg__status--sent {
		color: var(--color-success);
	}

	.msg__status--failed {
		color: var(--color-error);
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

	.presence-sidebar {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-md);
		display: none;
	}

	@media (min-width: 768px) {
		.presence-sidebar {
			display: block;
		}
	}

	.presence-sidebar__title {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-block-end: var(--space-sm);
	}

	.presence-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.presence-item {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--text-sm);
	}

	.presence-item__dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: var(--radius-full);
		flex-shrink: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.send-form__btn {
			transition: none;
		}
	}
</style>
