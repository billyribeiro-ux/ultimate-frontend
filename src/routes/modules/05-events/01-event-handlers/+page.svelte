<!--
    Lesson 5.1 — Event handlers in Svelte 5 (lowercase onclick)
    Mini-build: a typed counter button proving that handlers are function
    references, not calls. Per-page color personality: warm pink.
-->
<script lang="ts">
	let clicks: number = $state(0);

	function increment(event: MouseEvent): void {
		clicks += 1;
		// Demonstrate that we have a real MouseEvent in scope.
		console.log('clicked at', event.clientX, event.clientY);
	}

	function reset(): void {
		clicks = 0;
	}
</script>

<svelte:head>
	<title>Lesson 5.1 · Event handlers · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 5.1: a typed counter button using Svelte 5's lowercase onclick attribute."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/05-events">← Module 5</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 5.1 · Mini-build</p>
		<h1>A button that actually listens</h1>
		<p class="lede">
			The lowercase <code>onclick</code> attribute is the May 2026 way. No colon, no directive,
			no framework lore.
		</p>
	</header>

	<article class="counter">
		<p class="counter__label">Clicks so far</p>
		<p class="counter__value" aria-live="polite">{clicks}</p>

		<div class="counter__actions">
			<button type="button" class="btn btn--primary" onclick={increment}>Add one</button>
			<button type="button" class="btn btn--ghost" onclick={reset}>Reset</button>
		</div>
	</article>

	<aside class="explain">
		<h2>Why the parentheses matter</h2>
		<p>
			We pass <code>increment</code> (a reference) to <code>onclick</code>. If we wrote
			<code>increment()</code> with parentheses, the function would run during render, mutate
			<code>$state</code>, and loop. The whole rule of Svelte 5 handlers is: pass a reference,
			never a call.
		</p>
	</aside>
</section>

<style>
	/* Per-page personality — warm pink for Module 5 lesson 1. */
	section {
		--color-brand: oklch(68% 0.2 5);
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
		display: grid;
		gap: var(--space-sm);
		padding: var(--space-lg);
		background: linear-gradient(
			135deg,
			var(--color-surface-2),
			oklch(from var(--color-brand) 95% 0.04 h)
		);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.counter__label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0;
	}

	.counter__value {
		font-size: var(--text-hero);
		font-weight: 700;
		color: var(--color-brand);
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.counter__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.btn {
		min-block-size: 44px;
		min-inline-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		font-weight: 600;
		transition:
			background var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out),
			transform var(--dur-fast) var(--ease-out);
	}

	.btn--primary {
		background: var(--color-brand);
		color: oklch(15% 0.02 270);
	}

	.btn--primary:hover {
		background: oklch(from var(--color-brand) calc(l - 0.05) c h);
	}

	.btn--ghost {
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.btn--ghost:hover {
		border-color: var(--color-brand);
	}

	.explain {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);

		& h2 {
			font-size: var(--text-lg);
			margin-block-end: var(--space-sm);
		}
	}

	@media (hover: hover) {
		.btn--primary:active {
			transform: translateY(1px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.btn {
			transition: none;
		}
	}
</style>
