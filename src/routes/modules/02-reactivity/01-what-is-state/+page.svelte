<script lang="ts">
	// Deliberately broken demo. `clock` is a plain object — not a $state rune.
	// The interval mutates clock.seconds in memory, but nothing re-renders.
	// Lesson 2.2 will fix this with a single $state() wrap.
	const clock: { seconds: number } = { seconds: 0 };

	if (typeof window !== 'undefined') {
		setInterval(() => {
			clock.seconds = clock.seconds + 1;
			console.log('clock.seconds in memory:', clock.seconds);
		}, 1000);
	}
</script>

<svelte:head>
	<title>Lesson 2.1 · What state is · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 2.1 mini-build: a deliberately broken counter that motivates why reactivity exists."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/02-reactivity">← Module 2</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 2.1 · Mini-build</p>
		<h1>The counter that won't count</h1>
		<p class="lede">
			A plain <code>let</code> changes in memory but the DOM never finds out. Open the
			console — you will see <code>secondsOpen</code> counting up — then look at the card.
		</p>
	</header>

	<article class="broken">
		<p class="broken__label">This page has been open for</p>
		<p class="broken__value">{clock.seconds}s</p>
		<p class="broken__note">
			(This number is stuck at 0. Lesson 2.2 will fix it with one edit.)
		</p>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 40);
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

	.broken {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 2px dashed var(--color-brand);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	.broken__label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0;
	}

	.broken__value {
		font-size: var(--text-hero);
		font-weight: 700;
		color: var(--color-brand);
		margin: var(--space-sm) 0;
	}

	.broken__note {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-style: italic;
		margin: 0;
	}
</style>
