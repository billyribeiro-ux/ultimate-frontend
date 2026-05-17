<script lang="ts">
	interface Lesson {
		id: string;
		number: string;
		title: string;
		href: string;
	}

	const lessons: Lesson[] = [
		{ id: '17.1', number: '17.1', title: 'What "real-time" means on the web', href: '/modules/17-realtime/01-what-realtime-means' },
		{ id: '17.2', number: '17.2', title: 'Server-Sent Events with SvelteKit', href: '/modules/17-realtime/02-sse-server' },
		{ id: '17.3', number: '17.3', title: 'Consuming SSE in Svelte 5', href: '/modules/17-realtime/03-consuming-sse' },
		{ id: '17.4', number: '17.4', title: 'Building a live notification feed', href: '/modules/17-realtime/04-notification-feed' },
		{ id: '17.5', number: '17.5', title: 'WebSocket fundamentals', href: '/modules/17-realtime/05-websocket-fundamentals' },
		{ id: '17.6', number: '17.6', title: 'WebSocket in SvelteKit', href: '/modules/17-realtime/06-websocket-sveltekit' },
		{ id: '17.7', number: '17.7', title: 'Building a live chat', href: '/modules/17-realtime/07-live-chat' },
		{ id: '17.8', number: '17.8', title: 'Scaling patterns', href: '/modules/17-realtime/08-scaling-patterns' }
	];
</script>

<svelte:head>
	<title>Module 17 · Real-Time Communication · Ultimate Frontend</title>
	<meta
		name="description"
		content="Module 17 of Ultimate Frontend: build real-time features with Server-Sent Events and WebSockets in SvelteKit."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Module 17</p>
		<h1>Real-Time Communication</h1>
		<p class="lede">
			By the end of this module you will build real-time features in SvelteKit using both
			Server-Sent Events (simpler, HTTP-based) and WebSockets (full-duplex) — typed,
			validated, auto-reconnecting, and styled with PE7 throughout.
		</p>
	</header>

	<section aria-labelledby="lessons-heading">
		<h2 id="lessons-heading">Lessons</h2>
		<ol class="lessons">
			{#each lessons as lesson (lesson.id)}
				<li>
					<a href={lesson.href}>
						<span class="lesson__num">{lesson.number}</span>
						<span class="lesson__title">{lesson.title}</span>
						<span class="lesson__state lesson__state--ready">Ready</span>
					</a>
				</li>
			{/each}
		</ol>
	</section>
</section>

<style>
	section.page {
		--color-brand: oklch(65% 0.2 200);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.lessons {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.lessons > li > a {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--color-text);
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.lessons > li > a:hover {
		border-color: var(--color-brand);
	}

	.lesson__num {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		color: var(--color-brand);
	}

	.lesson__state {
		font-size: var(--text-xs);
		padding: 0.15em 0.6em;
		border-radius: var(--radius-full);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.lesson__state--ready {
		background: var(--color-success);
		color: oklch(15% 0.02 145);
	}

	@media (prefers-reduced-motion: reduce) {
		.lessons > li > a {
			transition: none;
		}
	}
</style>
