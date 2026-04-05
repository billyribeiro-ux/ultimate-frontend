<script lang="ts">
	let count: number = $state(0);
	let justReset: boolean = $state(false);
	let resetTimeout: ReturnType<typeof setTimeout> | null = null;

	function increment(): void {
		count = count + 1;
	}

	function decrement(): void {
		count = count - 1;
	}

	function reset(): void {
		count = 0;
		justReset = true;
		if (resetTimeout) clearTimeout(resetTimeout);
		resetTimeout = setTimeout(() => {
			justReset = false;
		}, 1200);
	}
</script>

<svelte:head>
	<title>Lesson 2.2 · $state primitives · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 2.2 mini-build: a working counter powered by $state with primitive types."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/02-reactivity">← Module 2</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 2.2 · Mini-build</p>
		<h1>The counter that finally counts</h1>
		<p class="lede">
			One rune and the DOM comes alive. Each button triggers an ordinary reassignment —
			Svelte's compiler rewrites it into a signal update behind the scenes.
		</p>
	</header>

	<article class="counter">
		<p class="counter__number" aria-live="polite">{count}</p>

		<div class="counter__controls">
			<button type="button" onclick={decrement} aria-label="Decrement">−1</button>
			<button type="button" onclick={reset}>Reset</button>
			<button type="button" onclick={increment} aria-label="Increment">+1</button>
		</div>

		{#if justReset}
			<p class="counter__note">Reset done.</p>
		{/if}
	</article>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 260);
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

	.counter {
		padding: var(--space-xl);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		text-align: center;
	}

	.counter__number {
		font-size: var(--text-hero);
		font-weight: 800;
		color: var(--color-brand);
		font-variant-numeric: tabular-nums;
		margin: 0 0 var(--space-md) 0;
		transition: color var(--dur-base) var(--ease-out);
	}

	.counter__controls {
		display: flex;
		gap: var(--space-sm);
		justify-content: center;
		flex-wrap: wrap;
	}

	.counter__controls button {
		min-inline-size: 44px;
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: var(--color-surface);
		border-radius: var(--radius-md);
		font-weight: 600;
		transition: transform var(--dur-fast) var(--ease-out);
	}

	.counter__controls button:hover {
		transform: translateY(-1px);
	}

	.counter__note {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: var(--space-md) 0 0 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.counter__number,
		.counter__controls button {
			transition: none;
		}

		.counter__controls button:hover {
			transform: none;
		}
	}
</style>
