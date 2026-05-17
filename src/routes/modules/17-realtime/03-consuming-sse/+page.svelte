<script lang="ts">
	import type { CounterData } from '$lib/realtime/types.js';

	type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

	let count: number = $state(0);
	let startedAt: string = $state('');
	let status: ConnectionStatus = $state('connecting');
	let lastEventId: string = $state('');

	$effect(() => {
		const source = new EventSource('/modules/17-realtime/03-consuming-sse/api/counter');

		source.addEventListener('open', () => {
			status = 'connected';
		});

		source.addEventListener('error', () => {
			if (source.readyState === EventSource.CLOSED) {
				status = 'disconnected';
			} else {
				status = 'connecting';
			}
		});

		source.addEventListener('counter', (event: MessageEvent<string>) => {
			try {
				const data: CounterData = JSON.parse(event.data);
				count = data.count;
				startedAt = data.startedAt;
				if (event.lastEventId) {
					lastEventId = event.lastEventId;
				}
			} catch {
				// Malformed JSON — ignore gracefully
			}
		});

		return () => {
			source.close();
			status = 'disconnected';
		};
	});

	const statusLabel: Record<ConnectionStatus, string> = {
		connecting: 'Reconnecting...',
		connected: 'Connected',
		disconnected: 'Disconnected'
	};
</script>

<svelte:head>
	<title>Lesson 17.3 · Consuming SSE · Ultimate Frontend</title>
	<meta
		name="description"
		content="Consume a Server-Sent Events stream in Svelte 5 with $state and $effect, demonstrating typed events and cleanup."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 17.3 · Mini-build</p>
		<h1>Live Counter (SSE Consumer)</h1>
		<p class="description">
			This counter increments every 2 seconds via SSE. Navigate away and back to
			verify cleanup — only one connection should be active.
		</p>
	</header>

	<article class="counter-card">
		<p class="counter-card__value">{count}</p>
		<p class="counter-card__label">events received</p>

		<div class="counter-card__meta">
			<p>Stream started: {startedAt ? new Date(startedAt).toLocaleTimeString() : '...'}</p>
			<p>Last event ID: {lastEventId || 'none'}</p>
		</div>

		<div class="counter-card__status">
			<span
				class="status-dot"
				class:status-dot--connected={status === 'connected'}
				class:status-dot--connecting={status === 'connecting'}
			></span>
			<span class="status-label">{statusLabel[status]}</span>
		</div>
	</article>
</section>

<style>
	section.page {
		--color-brand: oklch(65% 0.15 230);
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

	.counter-card {
		display: grid;
		justify-items: center;
		gap: var(--space-sm);
		padding: var(--space-xl);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	.counter-card__value {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-hero);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--color-brand);
	}

	.counter-card__label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.counter-card__meta {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.counter-card__status {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-full);
		background: var(--color-surface);
	}

	.status-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: var(--radius-full);
		background: var(--color-error);
		transition: background var(--dur-fast) var(--ease-out);
	}

	.status-dot--connected {
		background: var(--color-success);
	}

	.status-dot--connecting {
		background: var(--color-warning);
		animation: blink 1s var(--ease-in-out) infinite;
	}

	.status-label {
		font-size: var(--text-sm);
		font-weight: 500;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.3; }
	}

	@media (prefers-reduced-motion: reduce) {
		.status-dot--connecting {
			animation: none;
		}

		.status-dot {
			transition: none;
		}
	}
</style>
