<!--
	Lesson 9A.9 — streamed data with a skeleton placeholder.
	The fast data is rendered immediately; the slow promise resolves after
	~1.2 seconds and replaces the skeleton.
-->
<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Lesson 9A.9 · Streaming · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 9A.9 mini-build — server load returning a promise that streams in progressively."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09a-load">← Module 9A</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9A.9 · Mini-build</p>
		<h1>Fast now, slow later</h1>
		<p class="lede">
			The header below rendered immediately. The analytics card is a promise that streams in
			about a second after the initial response.
		</p>
	</header>

	<article class="fast">
		<p class="fast__label">fast.message</p>
		<p class="fast__value">{data.fast.message}</p>
		<p class="fast__meta">at <time datetime={data.fast.at}>{data.fast.at}</time></p>
	</article>

	<article class="slow">
		<p class="slow__label">slow (streamed promise)</p>
		{#await data.slow}
			<div class="skeleton" aria-hidden="true"></div>
			<p class="slow__note">Streaming in…</p>
		{:then value}
			<p class="slow__value">{value.computed}</p>
			<p class="slow__meta">after {value.sleptMs} ms of simulated work</p>
		{:catch error}
			<p class="slow__error">Failed: {error.message}</p>
		{/await}
	</article>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.16 180);
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

	.fast,
	.slow {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}

	.fast__label,
	.slow__label {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		margin-block-end: var(--space-xs);
	}

	.fast__value {
		font-size: var(--text-lg);
		color: var(--color-text);
	}

	.fast__meta,
	.slow__meta,
	.slow__note {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
	}

	.slow__value {
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--color-brand);
	}

	.slow__error {
		color: var(--color-error);
	}

	.skeleton {
		block-size: 3rem;
		border-radius: var(--radius-md);
		background: linear-gradient(
			90deg,
			var(--color-surface-2),
			oklch(from var(--color-brand) 90% 0.04 h),
			var(--color-surface-2)
		);
		background-size: 200% 100%;
		animation: shimmer 1400ms var(--ease-in-out) infinite;
	}

	@keyframes shimmer {
		0% {
			background-position: 100% 0;
		}
		100% {
			background-position: -100% 0;
		}
	}
</style>
