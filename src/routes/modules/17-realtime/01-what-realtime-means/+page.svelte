<script lang="ts">
	type TransportType = 'polling' | 'long-polling' | 'sse' | 'websocket';

	interface TransportConfig {
		readonly type: TransportType;
		readonly label: string;
		readonly color: string;
	}

	interface TimelineEvent {
		readonly transportType: TransportType;
		readonly arrivedAt: number;
	}

	const transports: TransportConfig[] = [
		{ type: 'polling', label: 'Polling (2s interval)', color: 'oklch(60% 0.02 270)' },
		{ type: 'long-polling', label: 'Long-polling', color: 'oklch(70% 0.15 85)' },
		{ type: 'sse', label: 'Server-Sent Events', color: 'oklch(65% 0.18 145)' },
		{ type: 'websocket', label: 'WebSocket', color: 'oklch(65% 0.2 200)' }
	];

	// Server events happen at these times (seconds into the simulation)
	const SERVER_EVENTS: number[] = [1.2, 3.7, 5.1, 7.4, 9.0];
	const DURATION_S = 10;
	const POLL_INTERVAL_S = 2;

	let events: TimelineEvent[] = $state([]);
	let elapsed: number = $state(0);
	let running: boolean = $state(false);

	function computeArrivalTime(transport: TransportType, eventTime: number): number {
		switch (transport) {
			case 'polling': {
				// Next poll after event time
				const nextPoll = Math.ceil(eventTime / POLL_INTERVAL_S) * POLL_INTERVAL_S;
				return nextPoll;
			}
			case 'long-polling': {
				// Arrives almost instantly but with a small reconnect gap (100ms)
				const reconnectGap = 0.1;
				return eventTime + reconnectGap;
			}
			case 'sse':
				return eventTime;
			case 'websocket':
				return eventTime;
		}
	}

	function startSimulation(): void {
		events = [];
		elapsed = 0;
		running = true;

		const startTime = performance.now();
		const allArrivals: Array<{ transport: TransportType; time: number }> = [];

		for (const transport of transports) {
			for (const eventTime of SERVER_EVENTS) {
				allArrivals.push({
					transport: transport.type,
					time: computeArrivalTime(transport.type, eventTime)
				});
			}
		}

		allArrivals.sort((a, b) => a.time - b.time);

		let arrivalIndex = 0;

		function tick(): void {
			const now = (performance.now() - startTime) / 1000;
			elapsed = Math.min(now, DURATION_S);

			while (arrivalIndex < allArrivals.length && allArrivals[arrivalIndex]!.time <= now) {
				const arrival = allArrivals[arrivalIndex]!;
				events = [...events, { transportType: arrival.transport, arrivedAt: arrival.time }];
				arrivalIndex++;
			}

			if (now < DURATION_S) {
				requestAnimationFrame(tick);
			} else {
				running = false;
			}
		}

		requestAnimationFrame(tick);
	}

	function getDotsForTransport(transportType: TransportType): TimelineEvent[] {
		return events.filter((e) => e.transportType === transportType);
	}
</script>

<svelte:head>
	<title>Lesson 17.1 · What "real-time" means · Ultimate Frontend</title>
	<meta
		name="description"
		content="Compare polling, long-polling, SSE, and WebSocket transports with a live timeline visualisation."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 17.1 · Mini-build</p>
		<h1>Real-Time Transport Visualiser</h1>
		<p class="description">
			Watch how each transport delivers the same five server events over 10 seconds.
			Dots appear on each lane the moment data reaches the client.
		</p>
	</header>

	<div class="controls">
		<button class="btn-start" onclick={startSimulation} disabled={running}>
			{running ? 'Running...' : 'Start simulation'}
		</button>
		<p class="timer">Elapsed: {elapsed.toFixed(1)}s / {DURATION_S}s</p>
	</div>

	<div class="timeline-container" role="img" aria-label="Timeline comparing four real-time transports">
		{#each transports as transport (transport.type)}
			<div class="lane">
				<span class="lane__label" style="color: {transport.color}">{transport.label}</span>
				<div class="lane__track">
					<!-- Server event markers -->
					{#each SERVER_EVENTS as eventTime (eventTime)}
						<div
							class="lane__marker"
							style="left: {(eventTime / DURATION_S) * 100}%"
							aria-hidden="true"
						></div>
					{/each}
					<!-- Arrival dots -->
					{#each getDotsForTransport(transport.type) as dot (dot.arrivedAt)}
						<div
							class="lane__dot"
							style="left: {(dot.arrivedAt / DURATION_S) * 100}%; background: {transport.color}"
							aria-label="Data arrived at {dot.arrivedAt.toFixed(1)}s"
						></div>
					{/each}
					<!-- Progress indicator -->
					<div class="lane__progress" style="width: {(elapsed / DURATION_S) * 100}%"></div>
				</div>
			</div>
		{/each}
	</div>

	<footer class="legend">
		<p><span class="legend__marker"></span> = server event time</p>
		<p><span class="legend__dot"></span> = data received by client</p>
	</footer>
</section>

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

	.controls {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.btn-start {
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
		min-block-size: 44px;
		min-inline-size: 44px;
		transition: opacity var(--dur-fast) var(--ease-out);
	}

	.btn-start:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.timer {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.timeline-container {
		display: grid;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.lane {
		display: grid;
		gap: var(--space-xs);
	}

	.lane__label {
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.lane__track {
		position: relative;
		height: 2rem;
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.lane__progress {
		position: absolute;
		inset-block: 0;
		inset-inline-start: 0;
		background: oklch(50% 0.01 270 / 0.05);
		transition: width 100ms linear;
	}

	.lane__marker {
		position: absolute;
		top: 0;
		width: 1px;
		height: 100%;
		background: var(--color-border);
	}

	.lane__dot {
		position: absolute;
		top: 50%;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: var(--radius-full);
		transform: translate(-50%, -50%);
		animation: dot-appear var(--dur-fast) var(--ease-spring);
	}

	@keyframes dot-appear {
		from {
			scale: 0;
			opacity: 0;
		}
		to {
			scale: 1;
			opacity: 1;
		}
	}

	.legend {
		display: flex;
		gap: var(--space-lg);
		flex-wrap: wrap;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.legend p {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.legend__marker {
		display: inline-block;
		width: 1px;
		height: 1rem;
		background: var(--color-border);
	}

	.legend__dot {
		display: inline-block;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: var(--radius-full);
		background: var(--color-brand);
	}

	@media (prefers-reduced-motion: reduce) {
		.lane__dot {
			animation: none;
		}

		.lane__progress {
			transition: none;
		}
	}
</style>
