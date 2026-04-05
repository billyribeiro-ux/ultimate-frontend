<script lang="ts">
	let count: number = $state(0);

	$effect(() => {
		document.title = `Count: ${count} · Ultimate Frontend`;
		console.log(`[effect] title set to "Count: ${count}"`);
	});
</script>

<svelte:head>
	<title>Lesson 2.9 · $effect · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 2.9 mini-build: a counter whose value is mirrored into document.title via $effect."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/02-reactivity">← Module 2</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 2.9 · Mini-build</p>
		<h1>An effect that talks to the browser</h1>
		<p class="lede">
			Click the button and watch the browser tab's title update. The effect reads
			<code>count</code>, writes <code>document.title</code>, and re-runs on every change.
		</p>
	</header>

	<article class="card">
		<p class="card__count">{count}</p>
		<div class="card__controls">
			<button type="button" onclick={() => count--}>−1</button>
			<button type="button" onclick={() => (count = 0)}>Reset</button>
			<button type="button" onclick={() => count++}>+1</button>
		</div>
	</article>

	<aside class="note">
		<p>
			Open the browser's tab title and the DevTools console. Every click writes to both.
		</p>
	</aside>
</section>

<style>
	section.page {
		--color-brand: oklch(68% 0.2 60);
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

	.card {
		padding: var(--space-xl);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	.card__count {
		font-size: var(--text-hero);
		font-weight: 800;
		color: var(--color-brand);
		font-variant-numeric: tabular-nums;
		margin: 0 0 var(--space-md) 0;
	}

	.card__controls {
		display: flex;
		gap: var(--space-sm);
		justify-content: center;
		flex-wrap: wrap;
	}

	.card__controls button {
		min-inline-size: 44px;
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: var(--color-surface);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.note {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
