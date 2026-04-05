<!--
	Lesson 8.12 — rendering modes cheat sheet. Typed union for the mode name
	prevents typos. Pure static content; no state.
-->
<script lang="ts">
	interface Mode {
		id: string;
		name: 'SSR' | 'SSG' | 'CSR' | 'Hybrid';
		when: string;
		flags: string;
		accent: string;
	}

	const modes: Mode[] = [
		{
			id: 'm1',
			name: 'SSR',
			when: 'Per-user, per-request dynamic content (dashboards, search).',
			flags: 'ssr: true, csr: true  (default)',
			accent: 'oklch(68% 0.18 250)'
		},
		{
			id: 'm2',
			name: 'SSG',
			when: 'Content that rarely changes (marketing, blog, docs).',
			flags: 'prerender: true',
			accent: 'oklch(70% 0.18 150)'
		},
		{
			id: 'm3',
			name: 'CSR',
			when: 'Highly interactive, SEO-irrelevant (editors, games, 3D).',
			flags: 'ssr: false, csr: true',
			accent: 'oklch(70% 0.2 15)'
		},
		{
			id: 'm4',
			name: 'Hybrid',
			when: 'Most real apps — mix SSG, SSR and CSR per route.',
			flags: 'configured per route',
			accent: 'oklch(72% 0.18 340)'
		}
	];
</script>

<svelte:head>
	<title>Lesson 8.12 · Rendering modes · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 8.12 mini-build — a cheat sheet of SvelteKit's four rendering modes and the page options that enable each."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing">← Module 8</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 8.12 · Mini-build</p>
		<h1>Four rendering modes</h1>
		<p class="lede">
			SvelteKit lets you pick a rendering mode per route. This cheat sheet shows the four modes,
			when to use each, and the page options that enable them.
		</p>
	</header>

	<ul class="modes">
		{#each modes as mode (mode.id)}
			<li class="mode" style="--accent: {mode.accent}">
				<p class="mode__name">{mode.name}</p>
				<p class="mode__when">{mode.when}</p>
				<code class="mode__flags">{mode.flags}</code>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.1 200);
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

	.modes {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-md);

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.mode {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--accent);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-sm);
		min-block-size: 44px;
	}

	.mode__name {
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--accent);
		margin: 0;
	}

	.mode__when {
		font-size: var(--text-base);
		color: var(--color-text);
		margin: 0;
	}

	.mode__flags {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		background: transparent;
		padding: 0;
	}
</style>
