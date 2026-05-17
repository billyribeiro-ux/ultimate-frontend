---
chunk: error-boundaries
level: 3
penalty: high
---

# <svelte:boundary> Error Boundaries — Level 3 Code Reveal

**`src/lib/components/ErrorBoundary.svelte`**

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		fallback
	}: {
		children: Snippet;
		fallback?: Snippet<[{ error: unknown; reset: () => void }]>;
	} = $props();
</script>

<svelte:boundary>
	{#snippet failed(error, reset)}
		{#if fallback}
			{@render fallback({ error, reset })}
		{:else}
			{@const message = error instanceof Error ? error.message : 'An unexpected error occurred'}
			<div class="error-fallback" role="alert" tabindex="-1">
				<h3>Something went wrong</h3>
				<p>{message}</p>
				<button onclick={reset}>Try again</button>
			</div>
		{/if}
	{/snippet}

	{@render children()}
</svelte:boundary>

<style>
	.error-fallback {
		padding: var(--space-lg);
		border: 1px solid oklch(65% 0.2 25);
		border-radius: var(--radius-md);
		background: var(--color-surface-2);
		text-align: center;
	}

	.error-fallback h3 {
		color: oklch(65% 0.2 25);
		margin-block-end: var(--space-sm);
	}

	.error-fallback p {
		color: var(--color-text-muted);
		margin-block-end: var(--space-md);
	}

	.error-fallback button {
		background: var(--color-brand);
		color: oklch(98% 0.01 0);
		border: none;
		border-radius: var(--radius-md);
		padding: var(--space-sm) var(--space-md);
		font-weight: 600;
		cursor: pointer;
		min-block-size: 44px;
		min-inline-size: 44px;
	}
</style>
```

**`src/routes/dashboard/+page.svelte`** (boundary around the table widget)

```svelte
<script lang="ts">
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
	import DashboardTable from '$lib/components/DashboardTable.svelte';

	let { data } = $props();
</script>

<ErrorBoundary>
	<DashboardTable rows={data.rows} />
</ErrorBoundary>
```

**`src/routes/+page.svelte`** (canvas boundary with image fallback)

```svelte
<script lang="ts">
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
	import { browser } from '$app/environment';
</script>

<ErrorBoundary>
	{#snippet fallback({ error, reset })}
		<div class="canvas-fallback" role="alert">
			<img src="/hero-poster.webp" alt="Product showcase" width="800" height="450" />
			<p>3D scene unavailable. <button onclick={reset}>Retry</button></p>
		</div>
	{/snippet}

	{#if browser}
		<!-- Threlte Canvas from gsap-timeline / scroll-trigger chunks -->
		<div class="stage">
			<!-- Canvas content here -->
		</div>
	{/if}
</ErrorBoundary>
```

**`src/routes/+layout.svelte`** (top-level safety-net boundary)

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:boundary>
	{#snippet failed(error, reset)}
		{@const message = error instanceof Error ? error.message : 'An unexpected error occurred'}
		<main class="crash-screen" role="alert" tabindex="-1">
			<h1>Something went wrong</h1>
			<p>{message}</p>
			<button onclick={reset}>Reload section</button>
			<a href="/">Return to home page</a>
		</main>
	{/snippet}

	{@render children()}
</svelte:boundary>
```
