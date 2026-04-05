<script lang="ts">
	let seconds: number = $state(0);
	let running: boolean = $state(true);

	$effect(() => {
		if (!running) return;

		const id = setInterval(() => {
			seconds = seconds + 1;
		}, 1000);

		return () => {
			clearInterval(id);
		};
	});

	function toggle(): void {
		running = !running;
	}

	function reset(): void {
		seconds = 0;
	}

	function fmt(total: number): string {
		const m = Math.floor(total / 60);
		const s = total % 60;
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}
</script>

<svelte:head>
	<title>Lesson 2.11 · Effect cleanup · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 2.11 mini-build: a stopwatch whose interval is cleaned up automatically on re-run and on destroy."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/02-reactivity">← Module 2</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 2.11 · Mini-build</p>
		<h1>Stopwatch, leak-free</h1>
		<p class="lede">
			Pausing re-runs the effect, which first calls cleanup to clear the old interval.
			Resuming starts a fresh one.
		</p>
	</header>

	<article class="clock">
		<p class="clock__value">{fmt(seconds)}</p>
		<div class="clock__controls">
			<button type="button" onclick={toggle}>
				{running ? 'Pause' : 'Resume'}
			</button>
			<button type="button" onclick={reset}>Reset</button>
		</div>
		<p class="clock__note">
			State: <strong>{running ? 'running' : 'paused'}</strong>
		</p>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.22 10);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;

			&:hover {
				color: var(--color-brand);
			}
		}
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

	.clock {
		padding: var(--space-xl);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	.clock__value {
		font-size: var(--text-hero);
		font-weight: 800;
		color: var(--color-brand);
		font-variant-numeric: tabular-nums;
		margin: 0 0 var(--space-md) 0;
	}

	.clock__controls {
		display: flex;
		gap: var(--space-sm);
		justify-content: center;
		flex-wrap: wrap;
	}

	.clock__controls button {
		min-inline-size: 44px;
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: var(--color-surface);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.clock__note {
		margin-block-start: var(--space-md);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
