<!--
	Lesson 12.3 — Code splitting and lazy loading
	Mini-build: a button that triggers a dynamic import of a heavy widget.
-->
<script lang="ts">
	let showWidget = $state<boolean>(false);
</script>

<svelte:head>
	<title>Lesson 12.3 · Code splitting · Ultimate Frontend</title>
	<meta
		name="description"
		content="A button that triggers a dynamic import, loading a heavy component only when the user asks for it."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/12-performance">← Module 12</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 12.3 · Mini-build</p>
		<h1>Ship less, run more</h1>
		<p class="lede">
			The heavy widget below is not in the initial JavaScript bundle. Click the button, watch
			the Network tab, and see a new chunk arrive on demand.
		</p>
	</header>

	<button type="button" class="reveal" onclick={() => (showWidget = true)} disabled={showWidget}>
		{showWidget ? 'Widget loaded' : 'Show heavy widget'}
	</button>

	{#if showWidget}
		{#await import('./HeavyWidget.svelte')}
			<p class="loading">Loading chunk…</p>
		{:then { default: HeavyWidget }}
			<HeavyWidget />
		{:catch error}
			<p class="error">Failed to load the widget: {error.message}</p>
		{/await}
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 60);
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

	.reveal {
		justify-self: start;
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: var(--color-brand);
		color: oklch(15% 0.02 60);
		border-radius: var(--radius-md);
		font-weight: 700;
		transition: transform var(--dur-fast) var(--ease-out);
	}

	.reveal:disabled {
		opacity: 0.6;
		cursor: default;
	}

	.loading {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.error {
		color: var(--color-error);
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal {
			transition: none;
		}
	}
</style>
