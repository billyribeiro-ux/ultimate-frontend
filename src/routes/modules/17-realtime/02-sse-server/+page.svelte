<script lang="ts">
	import type { TimeTickData } from '$lib/realtime/types.js';

	let currentTime: string = $state('--:--:--');
	let currentDate: string = $state('Waiting for connection...');
	let connected: boolean = $state(false);
	let eventCount: number = $state(0);

	$effect(() => {
		const source = new EventSource('/modules/17-realtime/02-sse-server/api/time');

		source.addEventListener('time', (event: MessageEvent<string>) => {
			const data: TimeTickData = JSON.parse(event.data);
			const date = new Date(data.iso);
			currentTime = date.toLocaleTimeString('en-GB', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			});
			currentDate = date.toLocaleDateString('en-GB', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
			eventCount++;
		});

		source.addEventListener('open', () => {
			connected = true;
		});

		source.addEventListener('error', () => {
			connected = false;
		});

		return () => {
			source.close();
		};
	});
</script>

<svelte:head>
	<title>Lesson 17.2 · SSE Server · Ultimate Frontend</title>
	<meta
		name="description"
		content="A live server clock streamed via Server-Sent Events from a SvelteKit +server.ts endpoint."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 17.2 · Mini-build</p>
		<h1>Live Server Clock (SSE)</h1>
		<p class="description">
			The time below is streamed from the server every second via Server-Sent Events.
			Open DevTools Network tab and look for the <code>api/time</code> request.
		</p>
	</header>

	<article class="clock-card">
		<p class="clock-card__time">{currentTime}</p>
		<p class="clock-card__date">{currentDate}</p>
		<div class="clock-card__status">
			<span class="status-dot" class:status-dot--connected={connected}></span>
			<span class="status-label">{connected ? 'Connected' : 'Disconnected'}</span>
		</div>
		<p class="clock-card__counter">Events received: {eventCount}</p>
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

	.clock-card {
		display: grid;
		justify-items: center;
		gap: var(--space-sm);
		padding: var(--space-xl);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	.clock-card__time {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-hero);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.02em;
		color: var(--color-brand);
	}

	.clock-card__date {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
	}

	.clock-card__status {
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
		animation: pulse 2s var(--ease-in-out) infinite;
	}

	.status-label {
		font-size: var(--text-sm);
		font-weight: 500;
	}

	.clock-card__counter {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	@media (prefers-reduced-motion: reduce) {
		.status-dot--connected {
			animation: none;
		}

		.status-dot {
			transition: none;
		}
	}
</style>
