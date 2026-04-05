<!--
	Lesson 9A.10 — prerendered page. In dev the timestamp changes on reload;
	in a production build it is frozen at build time.
-->
<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Lesson 9A.10 · SSG · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 9A.10 mini-build — a prerenderable route using export const prerender = true."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09a-load">← Module 9A</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9A.10 · Mini-build</p>
		<h1>Static at build time</h1>
		<p class="lede">{data.note}</p>
	</header>

	<article class="panel">
		<p class="panel__label">Built at</p>
		<p class="panel__value">
			<time datetime={data.builtAt}>{data.builtAt}</time>
		</p>
	</article>

	<aside class="hint">
		<p>
			Run <code>pnpm build</code> and look for
			<code>.svelte-kit/output/prerendered/pages/modules/09a-load/10-ssg-prerender.html</code>.
			That file is the baked output — no server code is involved at request time.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.15 170);
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

	.panel {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}

	.panel__label {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		margin-block-end: var(--space-xs);
	}

	.panel__value {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-lg);
		color: var(--color-brand);
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
