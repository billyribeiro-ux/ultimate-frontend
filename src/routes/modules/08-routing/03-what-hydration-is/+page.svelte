<!--
	Lesson 8.3 — What Hydration actually is.
	Mini-build: renders a server timestamp (frozen at SSR) and a client
	timestamp (updated in onMount after hydration). A counter button proves
	that interactivity is only alive after hydration finishes.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	// Runs on server AND client. Used as a display-only reference for the
	// SSR render time. We bake it into the HTML and never update it again.
	const serverTime: string = new Date().toISOString();

	// Starts as the same placeholder on server and client so hydration
	// matches, then onMount replaces it on the client only.
	let clientTime: string = $state('hydrating…');
	let count: number = $state(0);

	onMount(() => {
		clientTime = new Date().toISOString();
	});
</script>

<svelte:head>
	<title>Lesson 8.3 · What Hydration is · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 8.3 mini-build — visualise hydration by comparing a server timestamp to a client timestamp updated in onMount."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing">← Module 8</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 8.3 · Mini-build</p>
		<h1>Hydration visualiser</h1>
		<p class="lede">
			The left timestamp was written into the HTML by the server. The right timestamp was written
			by the client, in <code>onMount</code>, after hydration completed. The gap between the two is
			roughly how long hydration took in your browser.
		</p>
	</header>

	<article class="panel">
		<div class="panel__row">
			<p class="panel__label">Server render time</p>
			<p class="panel__value panel__value--muted">
				<time datetime={serverTime}>{serverTime}</time>
			</p>
		</div>
		<div class="panel__row">
			<p class="panel__label">Client mount time</p>
			<p class="panel__value">
				<time datetime={clientTime}>{clientTime}</time>
			</p>
		</div>
	</article>

	<article class="panel">
		<p class="panel__label">Interactivity probe</p>
		<button class="probe" type="button" onclick={() => count++}>
			Clicked {count} time{count === 1 ? '' : 's'}
		</button>
		<p class="hint">
			Disable JavaScript in DevTools and reload. The server time still renders, but this button
			does nothing and the mount time never updates. That is the pre-hydration state, frozen.
		</p>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(75% 0.18 85);
	}

	.crumbs a {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-decoration: none;

		&:hover {
			color: var(--color-brand);
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

	.panel {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-sm);
	}

	.panel__row {
		display: grid;
		gap: var(--space-xs);

		@media (min-width: 480px) {
			grid-template-columns: 14rem 1fr;
			align-items: baseline;
		}
	}

	.panel__label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin: 0;
	}

	.panel__value {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-base);
		color: var(--color-brand);
		margin: 0;
	}

	.panel__value--muted {
		color: var(--color-text-muted);
	}

	.probe {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: oklch(20% 0.02 270);
		border-radius: var(--radius-md);
		font-weight: 600;
		transition: transform var(--dur-fast) var(--ease-out);

		&:hover {
			transform: translateY(-1px);
		}
	}

	.hint {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}
</style>
