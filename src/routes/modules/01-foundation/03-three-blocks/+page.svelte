<script lang="ts">
	interface Block {
		name: string;
		language: string;
		summary: string;
		hue: number;
	}

	const blocks: Block[] = [
		{
			name: 'script',
			language: 'TypeScript',
			summary: 'Logic lives here. Variables, types, functions, runes, imports.',
			hue: 270
		},
		{
			name: 'markup',
			language: 'HTML + expressions',
			summary: 'Structure lives here. Elements, attributes, {expression} interpolation.',
			hue: 150
		},
		{
			name: 'style',
			language: 'Scoped CSS',
			summary: 'Presentation lives here. Selectors, properties, media queries, nesting.',
			hue: 40
		}
	];

	const lessonNumber: number = 1.3;
</script>

<svelte:head>
	<title>Lesson 1.3 · The three blocks · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 1.3 mini-build: a self-describing diagram of a Svelte file's three blocks — script, markup, and style."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/01-foundation">← Module 1</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson {lessonNumber} · Mini-build</p>
		<h1>Every .svelte file has three blocks</h1>
		<p class="lede">
			One file, three languages, zero drift. Each card below describes one of the blocks and
			is itself built using all three.
		</p>
	</header>

	<div class="blocks">
		{#each blocks as block (block.name)}
			<article class="block" style:--hue={block.hue}>
				<p class="block__tag">&lt;{block.name}&gt;</p>
				<h2 class="block__name">{block.language}</h2>
				<p class="block__summary">{block.summary}</p>
			</article>
		{/each}
	</div>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 310);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;

			&:hover {
				color: var(--color-brand);
			}
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

	.blocks {
		display: grid;
		gap: var(--space-md);
		grid-template-columns: 1fr;

		@media (min-width: 768px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.block {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid oklch(65% 0.2 var(--hue));
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.block__tag {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		color: oklch(55% 0.2 var(--hue));
		margin: 0;
	}

	.block__name {
		font-size: var(--text-lg);
		margin-block: var(--space-xs) var(--space-sm);
	}

	.block__summary {
		font-size: var(--text-base);
		color: var(--color-text-muted);
		margin: 0;
	}
</style>
