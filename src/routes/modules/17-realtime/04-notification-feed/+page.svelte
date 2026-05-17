<script lang="ts">
	import { fly } from 'svelte/transition';
	import { SvelteMap } from 'svelte/reactivity';
	import type { NotificationData, NotificationType } from '$lib/realtime/types.js';

	type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

	const MAX_VISIBLE = 5;
	const DISMISS_DELAYS: Record<NotificationType, number> = {
		info: 6000,
		success: 6000,
		warning: 8000,
		error: 12000
	};

	let notifications: NotificationData[] = $state([]);
	let status: ConnectionStatus = $state('connecting');
	let totalReceived: number = $state(0);

	const timers = new SvelteMap<string, ReturnType<typeof setTimeout>>();

	function addNotification(notification: NotificationData): void {
		notifications = [...notifications, notification].slice(-MAX_VISIBLE);
		totalReceived++;

		const delay = DISMISS_DELAYS[notification.type];
		const timer = setTimeout(() => {
			dismissNotification(notification.id);
		}, delay);
		timers.set(notification.id, timer);
	}

	function dismissNotification(id: string): void {
		const timer = timers.get(id);
		if (timer) {
			clearTimeout(timer);
			timers.delete(id);
		}
		notifications = notifications.filter((n) => n.id !== id);
	}

	function getTypeIcon(type: NotificationType): string {
		switch (type) {
			case 'info': return 'i';
			case 'success': return '✓';
			case 'warning': return '!';
			case 'error': return '✗';
		}
	}

	$effect(() => {
		const source = new EventSource('/modules/17-realtime/04-notification-feed/api/notifications');

		source.addEventListener('open', () => {
			status = 'connected';
		});

		source.addEventListener('error', () => {
			status = source.readyState === EventSource.CLOSED ? 'disconnected' : 'connecting';
		});

		source.addEventListener('notification', (event: MessageEvent<string>) => {
			try {
				const data: NotificationData = JSON.parse(event.data);
				addNotification(data);
			} catch {
				// Malformed event — skip
			}
		});

		return () => {
			source.close();
			status = 'disconnected';
			for (const timer of timers.values()) {
				clearTimeout(timer);
			}
			timers.clear();
		};
	});

	let reducedMotion: boolean = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mq.matches;

		function handleChange(e: MediaQueryListEvent): void {
			reducedMotion = e.matches;
		}

		mq.addEventListener('change', handleChange);
		return () => mq.removeEventListener('change', handleChange);
	});
</script>

<svelte:head>
	<title>Lesson 17.4 · Notification Feed · Ultimate Frontend</title>
	<meta
		name="description"
		content="A live notification feed using SSE with animated dismissable toasts and Svelte transitions."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 17.4 · Mini-build</p>
		<h1>Live Notification Feed</h1>
		<p class="description">
			Notifications stream from the server every 3-6 seconds. Each toast auto-dismisses
			after a type-dependent delay, or click the X to dismiss immediately.
		</p>
	</header>

	<div class="stats">
		<div class="stats__item">
			<span class="stats__label">Status</span>
			<span class="stats__value">
				<span
					class="status-dot"
					class:status-dot--connected={status === 'connected'}
					class:status-dot--connecting={status === 'connecting'}
				></span>
				{status}
			</span>
		</div>
		<div class="stats__item">
			<span class="stats__label">Total received</span>
			<span class="stats__value">{totalReceived}</span>
		</div>
		<div class="stats__item">
			<span class="stats__label">Visible</span>
			<span class="stats__value">{notifications.length} / {MAX_VISIBLE}</span>
		</div>
	</div>
</section>

<div class="toast-container" role="status" aria-live="polite" aria-relevant="additions removals">
	{#each notifications as notification (notification.id)}
		<div
			class="toast toast--{notification.type}"
			role={notification.type === 'error' ? 'alert' : 'status'}
			transition:fly={{ y: 20, duration: reducedMotion ? 0 : 300 }}
		>
			<span class="toast__icon toast__icon--{notification.type}">{getTypeIcon(notification.type)}</span>
			<div class="toast__content">
				<p class="toast__title">{notification.title}</p>
				<p class="toast__body">{notification.body}</p>
				<time class="toast__time">{new Date(notification.timestamp).toLocaleTimeString()}</time>
			</div>
			<button
				class="toast__dismiss"
				onclick={() => dismissNotification(notification.id)}
				aria-label="Dismiss notification"
			>
				&times;
			</button>
		</div>
	{/each}
</div>

<style>
	section.page {
		--color-brand: oklch(65% 0.15 200);
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

	.stats {
		display: flex;
		gap: var(--space-lg);
		flex-wrap: wrap;
	}

	.stats__item {
		display: grid;
		gap: var(--space-xs);
	}

	.stats__label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stats__value {
		font-size: var(--text-lg);
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.status-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: var(--radius-full);
		background: var(--color-error);
	}

	.status-dot--connected {
		background: var(--color-success);
	}

	.status-dot--connecting {
		background: var(--color-warning);
		animation: blink 1s var(--ease-in-out) infinite;
	}

	/* Toast container — fixed at bottom */
	.toast-container {
		position: fixed;
		inset-block-end: var(--space-md);
		inset-inline-end: var(--space-md);
		inset-inline-start: var(--space-md);
		display: grid;
		gap: var(--space-sm);
		pointer-events: none;
		z-index: 1000;
	}

	@media (min-width: 480px) {
		.toast-container {
			inset-inline-start: auto;
			max-inline-size: 24rem;
		}
	}

	/* Individual toast */
	.toast {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: start;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		pointer-events: auto;
	}

	.toast--info {
		border-inline-start-color: var(--color-brand);
	}

	.toast--success {
		border-inline-start-color: var(--color-success);
	}

	.toast--warning {
		border-inline-start-color: var(--color-warning);
	}

	.toast--error {
		border-inline-start-color: var(--color-error);
	}

	.toast__icon {
		display: grid;
		place-items: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: 700;
	}

	.toast__icon--info {
		background: oklch(65% 0.15 200 / 0.15);
		color: oklch(65% 0.15 200);
	}

	.toast__icon--success {
		background: oklch(65% 0.18 145 / 0.15);
		color: var(--color-success);
	}

	.toast__icon--warning {
		background: oklch(75% 0.18 85 / 0.15);
		color: var(--color-warning);
	}

	.toast__icon--error {
		background: oklch(60% 0.22 25 / 0.15);
		color: var(--color-error);
	}

	.toast__content {
		display: grid;
		gap: 0.125rem;
	}

	.toast__title {
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.toast__body {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.toast__time {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-family: ui-monospace, monospace;
	}

	.toast__dismiss {
		display: grid;
		place-items: center;
		min-width: 44px;
		min-height: 44px;
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		border-radius: var(--radius-sm);
		transition: color var(--dur-fast) var(--ease-out);
	}

	.toast__dismiss:hover {
		color: var(--color-text);
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.3; }
	}

	@media (prefers-reduced-motion: reduce) {
		.status-dot--connecting {
			animation: none;
		}

		.toast__dismiss {
			transition: none;
		}
	}
</style>
