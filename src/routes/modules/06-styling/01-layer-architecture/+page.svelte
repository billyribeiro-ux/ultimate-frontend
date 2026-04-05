<!--
    Lesson 6.1 — PE7 @layer architecture in full depth.
    Mini-build: shows the six-layer stack with a live cascade inspector.
-->
<script lang="ts">
	interface LayerRow {
		name: string;
		role: string;
	}

	const layers: LayerRow[] = [
		{ name: 'reset', role: 'Modern minimal reset. Lowest priority.' },
		{ name: 'tokens', role: 'OKLCH colours, fluid type, spacing, motion, radii.' },
		{ name: 'base', role: 'Document defaults — h1-h4, body, code, p.' },
		{ name: 'layout', role: '.page, .stack, .cluster — layout primitives.' },
		{ name: 'components', role: '.btn, .card, .toast — UI patterns.' },
		{ name: 'animations', role: 'prefers-reduced-motion override. Highest priority.' }
	];
</script>

<svelte:head>
	<title>Lesson 6.1 · @layer architecture · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 6.1: the PE7 six-layer cascade stack explained with a live example."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.1 · Mini-build</p>
		<h1>Six layers, one cascade</h1>
		<p class="lede">
			Every stylesheet in this course is organised into explicit cascade layers. Later layers
			beat earlier layers no matter the specificity.
		</p>
	</header>

	<article class="diagram" aria-label="PE7 layer stack">
		{#each layers as layer, i (layer.name)}
			<div class="diagram__row" style:--rank={i}>
				<span class="diagram__num">{i + 1}</span>
				<div>
					<p class="diagram__name">@layer {layer.name}</p>
					<p class="diagram__role">{layer.role}</p>
				</div>
			</div>
		{/each}
	</article>

	<aside class="note">
		<h2>The rule in one sentence</h2>
		<p>
			A rule in <code>components</code> beats a rule in <code>base</code> with higher specificity,
			because layer order beats specificity. Component <code>&lt;style&gt;</code> blocks are
			unlayered, so they beat every global layer.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(65% 0.22 280);
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

	.diagram {
		display: grid;
		gap: var(--space-xs);
	}

	.diagram__row {
		display: grid;
		grid-template-columns: 2.5rem 1fr;
		gap: var(--space-md);
		align-items: center;
		padding: var(--space-md);
		background: oklch(from var(--color-brand) calc(96% - var(--rank) * 8%) calc(0.03 + var(--rank) * 0.02) h);
		color: oklch(from var(--color-brand) calc(20% + var(--rank) * 6%) 0.1 h);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.diagram__num {
		display: grid;
		place-items: center;
		inline-size: 2.5rem;
		block-size: 2.5rem;
		background: var(--color-brand);
		color: oklch(98% 0.01 280);
		border-radius: var(--radius-full);
		font-weight: 700;
		font-family: ui-monospace, monospace;
	}

	.diagram__name {
		margin: 0;
		font-weight: 700;
		font-family: ui-monospace, monospace;
	}

	.diagram__role {
		margin: 0;
		font-size: var(--text-sm);
		opacity: 0.85;
	}

	.note {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);

		& h2 {
			font-size: var(--text-lg);
			margin-block-end: var(--space-sm);
		}
	}
</style>
