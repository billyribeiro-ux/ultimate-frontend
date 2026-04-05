<!--
	Lesson 9A.8 — error boundary for the [slug] route. Reads page.status and
	page.error.message from $app/state.
-->
<script lang="ts">
	import { page } from '$app/state';

	const status: number = $derived(page.status);
	const message: string = $derived(page.error?.message ?? 'Unknown error');
</script>

<svelte:head>
	<title>Lesson 9A.8 · Error {status} · Ultimate Frontend</title>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09a-load/08-error-redirect">← Back to lesson</a>
	</nav>

	<header>
		<p class="eyebrow">Error boundary</p>
		<h1>{status}</h1>
	</header>

	<article class="panel">
		<p class="message">{message}</p>
		<p class="hint">
			This page was rendered by the route's <code>+error.svelte</code>. The load function threw
			<code>error({status}, '{message}')</code>, and SvelteKit stopped rendering the success page
			and rendered this one instead.
		</p>
	</article>
</section>

<style>
	section {
		--color-brand: var(--color-error);
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

	h1 {
		font-size: var(--text-hero);
		color: var(--color-brand);
	}

	.panel {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}

	.message {
		font-size: var(--text-lg);
		color: var(--color-brand);
		margin-block-end: var(--space-sm);
	}

	.hint {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
