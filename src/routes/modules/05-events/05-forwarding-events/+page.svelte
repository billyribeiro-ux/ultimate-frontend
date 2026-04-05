<!--
    Lesson 5.5 — Forwarding events with callback props.
-->
<script lang="ts">
	import FancyButton from './FancyButton.svelte';

	let count: number = $state(0);
	let lastLabel: string = $state('(none)');

	function handlePress(event: MouseEvent, label: string): void {
		count += 1;
		lastLabel = label;
		console.log('pressed', label, 'at', event.clientX);
	}

	function reset(): void {
		count = 0;
		lastLabel = '(none)';
	}
</script>

<svelte:head>
	<title>Lesson 5.5 · Forwarding events · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 5.5: a reusable FancyButton that forwards its click to the parent through a callback prop."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/05-events">← Module 5</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 5.5 · Mini-build</p>
		<h1>The callback prop pattern</h1>
		<p class="lede">
			A child component tells its parent "something happened" by calling a function the parent
			passed in. No dispatcher, no magic.
		</p>
	</header>

	<article class="demo">
		<p class="demo__stat">Pressed <strong>{count}</strong> times</p>
		<p class="demo__stat demo__stat--muted">Last: <code>{lastLabel}</code></p>

		<div class="demo__actions">
			<FancyButton label="Save" onPress={(e) => handlePress(e, 'Save')} />
			<FancyButton label="Publish" onPress={(e) => handlePress(e, 'Publish')} />
			<FancyButton label="Reset" variant="ghost" onPress={reset} />
		</div>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.2 320);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
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

	.demo {
		display: grid;
		gap: var(--space-sm);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border-radius: var(--radius-lg);
	}

	.demo__stat {
		margin: 0;
		font-size: var(--text-lg);
	}

	.demo__stat--muted {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.demo__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}
</style>
