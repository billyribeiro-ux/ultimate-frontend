<!--
	Lesson 8.5 — Nested layouts.
	Page content is wrapped by the sibling +layout.svelte. Inspect the DOM
	and you will see the lesson shell surrounding this <section>.
-->
<script lang="ts">
	interface ChainStep {
		id: string;
		level: number;
		name: string;
		note: string;
	}

	const chain: ChainStep[] = [
		{ id: 's1', level: 0, name: 'src/routes/+layout.svelte', note: 'Root layout — site-wide shell' },
		{ id: 's2', level: 1, name: '05-nested-layouts/+layout.svelte', note: 'Lesson layout — pink dashed box' },
		{ id: 's3', level: 2, name: '05-nested-layouts/+page.svelte', note: 'The page you are reading now' }
	];
</script>

<svelte:head>
	<title>Lesson 8.5 · Nested layouts · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 8.5 mini-build — a visible nested layout chain using +layout.svelte and a page that renders inside it."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing">← Module 8</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 8.5 · Mini-build</p>
		<h1>The layout chain</h1>
		<p class="lede">
			Everything outside the dashed pink box comes from the root layout. The dashed pink box is
			this lesson's <code>+layout.svelte</code>. The content below is the <code>+page.svelte</code>
			rendered inside both of them.
		</p>
	</header>

	<ol class="chain">
		{#each chain as step (step.id)}
			<li class="chain__step" style="--level: {step.level}">
				<p class="chain__name">{step.name}</p>
				<p class="chain__note">{step.note}</p>
			</li>
		{/each}
	</ol>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.18 340);
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

	.chain {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.chain__step {
		padding: var(--space-md);
		padding-inline-start: calc(var(--space-md) + var(--level) * var(--space-md));
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
		min-block-size: 44px;
	}

	.chain__name {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-sm);
		font-weight: 600;
		margin: 0;
	}

	.chain__note {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-start: var(--space-xs);
	}
</style>
