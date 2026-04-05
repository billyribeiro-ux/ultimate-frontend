<!--
	Lesson 6.18 — prefers-reduced-motion accessible animation
	A live banner showing the current preference, plus a card that demonstrates
	both CSS (reset-covered) and Svelte transition (manually-handled) motion.
-->
<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { DUR } from '$lib/motion';

	const reduced = $derived(prefersReducedMotion.current);

	let expanded: boolean = $state(false);

	function toggle(): void {
		expanded = !expanded;
	}
</script>

<svelte:head>
	<title>Lesson 6.18 · Reduced motion · Ultimate Frontend</title>
	<meta name="description" content="A live motion-preference viewer demonstrating CSS-reset and JS-motion handling." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.18 · Mini-build</p>
		<h1>Motion preference viewer</h1>
		<p class="lead">
			The banner below reflects your current <code>prefers-reduced-motion</code> setting live.
			Toggle the preference in DevTools Rendering panel and watch it change without a reload.
		</p>
	</header>

	<p class="banner" data-reduced={reduced}>
		Reduced motion: <strong>{reduced ? 'on' : 'off'}</strong>
	</p>

	<article class="card">
		<h2>Hover me (CSS)</h2>
		<p>
			This card uses a pure CSS transition on hover. The PE7 global reset in <code>app.css</code>
			collapses the transition duration when reduced motion is preferred. No extra JavaScript required.
		</p>
	</article>

	<div class="reveal-demo">
		<button class="primary" type="button" onclick={toggle}>
			{expanded ? 'Collapse' : 'Expand'}
		</button>

		{#if expanded}
			<div
				class="revealed"
				transition:slide={{
					duration: reduced ? 0 : DUR.slow,
					easing: cubicOut
				}}
			>
				<h3>This panel uses <code>transition:slide</code></h3>
				<p>
					Svelte transitions are JavaScript-driven. The CSS reset does not reach them, so we pass
					<code>duration: 0</code> when <code>prefersReducedMotion.current</code> is true.
				</p>
			</div>
		{/if}
	</div>

	<dl class="tiers">
		<div>
			<dt>CSS transition duration</dt>
			<dd>{reduced ? '0.01ms (reset)' : '300ms (var(--dur-base))'}</dd>
		</div>
		<div>
			<dt>Svelte slide duration</dt>
			<dd>{reduced ? '0ms (manual)' : `${DUR.slow}ms`}</dd>
		</div>
	</dl>
</section>

<style>
	section {
		--color-brand: oklch(62% 0.22 25);
	}

	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lead {
		color: var(--color-text-muted);
		max-inline-size: 56ch;
	}

	.banner {
		padding: var(--space-md) var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
		font-size: var(--text-lg);
	}

	.banner[data-reduced='true'] {
		border-inline-start-color: var(--color-success);
	}

	.card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition:
			transform var(--dur-base) var(--ease-out),
			box-shadow var(--dur-base) var(--ease-out);
	}

	.card:hover,
	.card:focus-within {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.reveal-demo {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.primary {
		align-self: flex-start;
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: var(--color-surface);
		font-weight: 600;
		min-block-size: 2.75rem;
	}

	.revealed {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.tiers {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border-radius: var(--radius-lg);

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.tiers div {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.tiers dt {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.tiers dd {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		margin: 0;
	}
</style>
