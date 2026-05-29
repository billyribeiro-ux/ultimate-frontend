<!--
	Lesson 8.10 — simulated trace viewer.
	Displays the load function's server-measured duration as the only "span"
	in a fake trace. A real project would replace this with an OTel tracer.
-->
<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	interface Span {
		id: string;
		name: string;
		duration: number;
		depth: number;
	}

	// $derived so the trace rebuilds when `data` changes on client-side navigation.
	const spans: Span[] = $derived([
		{ id: 's1', name: `GET ${data.timestamp}`, duration: data.loadDuration, depth: 0 },
		{ id: 's2', name: '  load() in +page.server.ts', duration: data.loadDuration, depth: 1 },
		{ id: 's3', name: '    simulatedWork (setTimeout)', duration: data.simulatedWork, depth: 2 }
	]);

	function formatMs(value: number): string {
		return `${value.toFixed(1)} ms`;
	}
</script>

<svelte:head>
	<title>Lesson 8.10 · instrumentation · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 8.10 mini-build — a simulated trace view for SvelteKit's instrumentation.server.ts file."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing">← Module 8</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 8.10 · Mini-build</p>
		<h1>Simulated trace</h1>
		<p class="lede">
			In a real project this panel would come from an OpenTelemetry exporter wired up in
			<code>instrumentation.server.ts</code>. Here we measure the load function on the server and
			display the span tree directly.
		</p>
	</header>

	<ol class="trace" aria-label="Simulated trace">
		{#each spans as span (span.id)}
			<li class="span" style="--depth: {span.depth}">
				<span class="span__name">{span.name}</span>
				<span class="span__duration">{formatMs(span.duration)}</span>
			</li>
		{/each}
	</ol>

	<aside class="hint">
		<p>
			Reload a few times. The durations wobble because the server-side
			<code>setTimeout</code> is randomised — exactly like real request latency.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(55% 0.2 300);
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

	.trace {
		list-style: none;
		padding: 0;
		margin: 0;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.span {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-sm);
		padding-block: var(--space-sm);
		padding-inline: var(--space-md);
		padding-inline-start: calc(var(--space-md) + var(--depth) * var(--space-md));
		border-block-end: 1px solid var(--color-border);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-sm);
		min-block-size: 44px;
		align-items: center;
	}

	.span:last-child {
		border-block-end: 0;
	}

	.span__name {
		color: var(--color-text);
		white-space: pre;
	}

	.span__duration {
		color: var(--color-brand);
		font-weight: 600;
	}

	.hint {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
