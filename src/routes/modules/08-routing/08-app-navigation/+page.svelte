<!--
	Lesson 8.8 — $app/navigation control panel.
	Buttons call goto, invalidateAll, preloadData, and a beforeNavigate guard.
-->
<script lang="ts">
	import { goto, invalidateAll, preloadData, beforeNavigate } from '$app/navigation';

	let log: string = $state('idle');
	let guardEnabled: boolean = $state(false);

	beforeNavigate(({ cancel, to }) => {
		if (guardEnabled && to) {
			cancel();
			log = `beforeNavigate cancelled → ${to.url.pathname}`;
		}
	});

	async function handleGoto(): Promise<void> {
		log = 'goto(/modules/08-routing/07-app-state) …';
		await goto('/modules/08-routing/07-app-state');
	}

	async function handleReplace(): Promise<void> {
		log = 'goto(..., { replaceState: true }) …';
		await goto('/modules/08-routing/07-app-state', { replaceState: true });
	}

	async function handleInvalidateAll(): Promise<void> {
		log = 'invalidateAll() …';
		await invalidateAll();
		log = 'invalidateAll() done';
	}

	async function handlePreload(): Promise<void> {
		log = 'preloadData(/modules/08-routing/07-app-state) …';
		await preloadData('/modules/08-routing/07-app-state');
		log = 'preloadData done — next click to 8.7 will feel instant';
	}
</script>

<svelte:head>
	<title>Lesson 8.8 · $app/navigation · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 8.8 mini-build — a control panel for the $app/navigation helpers goto, invalidateAll, preloadData and beforeNavigate."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing">← Module 8</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 8.8 · Mini-build</p>
		<h1>Navigation control panel</h1>
		<p class="lede">
			Every button calls a function from <code>$app/navigation</code>. The log below shows which
			helper fired.
		</p>
	</header>

	<div class="grid">
		<button class="btn" type="button" onclick={handleGoto}>goto(/07-app-state)</button>
		<button class="btn" type="button" onclick={handleReplace}>goto (replaceState)</button>
		<button class="btn" type="button" onclick={handleInvalidateAll}>invalidateAll()</button>
		<button class="btn" type="button" onclick={handlePreload}>preloadData(/07-app-state)</button>
	</div>

	<label class="toggle">
		<input type="checkbox" bind:checked={guardEnabled} />
		<span>Enable <code>beforeNavigate</code> guard (blocks all navigation)</span>
	</label>

	<output class="log" aria-live="polite">{log}</output>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 15);
	}

	.crumbs a {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-decoration: none;
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

	.grid {
		display: grid;
		gap: var(--space-sm);

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.btn {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(98% 0.01 15);
		border-radius: var(--radius-md);
		font-weight: 600;
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-sm);
		transition: transform var(--dur-fast) var(--ease-out);

		&:hover {
			transform: translateY(-1px);
		}
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-block-size: 44px;
		padding: var(--space-sm);
		color: var(--color-text);
	}

	.toggle input {
		inline-size: 1.25rem;
		block-size: 1.25rem;
	}

	.log {
		display: block;
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-sm);
		color: var(--color-brand);
	}
</style>
