<script lang="ts">
	type SystemLayer = 'tokens' | 'components' | 'patterns' | 'documentation';

	interface LayerInfo {
		id: SystemLayer;
		label: string;
		description: string;
		examples: string[];
		connectsTo: SystemLayer[];
	}

	const layers: LayerInfo[] = [
		{
			id: 'tokens',
			label: 'Design Tokens',
			description: 'The atomic values that define the visual language. Colors, typography, spacing, motion, radii, shadows.',
			examples: ['--color-brand: oklch(65% 0.22 270)', '--space-md: clamp(1rem, 3vw, 1.5rem)', '--text-lg: clamp(1.125rem, 3vw, 1.5rem)', '--dur-base: 300ms', '--radius-md: 0.5rem'],
			connectsTo: ['components']
		},
		{
			id: 'components',
			label: 'Components',
			description: 'Reusable UI elements built from tokens. Each has a defined API with typed props, variants, and sizes.',
			examples: ['Button (primary, secondary, ghost, danger)', 'Input (default, error, success)', 'Card (elevated, outlined, flat)', 'Modal (focus trap, escape close)', 'Tabs (keyboard navigation, ARIA)'],
			connectsTo: ['tokens', 'patterns']
		},
		{
			id: 'patterns',
			label: 'Patterns',
			description: 'Recurring solutions to common problems. Compositions of components that follow consistent conventions.',
			examples: ['Form with inline validation', 'Loading state with skeleton', 'Empty state with action', 'Error boundary with retry', 'Data table with sorting'],
			connectsTo: ['components', 'documentation']
		},
		{
			id: 'documentation',
			label: 'Documentation',
			description: 'The living reference that teaches teams how to use tokens, components, and patterns correctly.',
			examples: ['Live component previews', 'Prop tables with types', 'Usage guidelines (do/don\'t)', 'Accessibility requirements', 'Code examples'],
			connectsTo: ['tokens', 'components', 'patterns']
		}
	];

	let activeLayerId: SystemLayer = $state('tokens');

	let activeLayer: LayerInfo = $derived(
		layers.find((l: LayerInfo) => l.id === activeLayerId) ?? layers[0]
	);

	let connectedLayers: SystemLayer[] = $derived(activeLayer.connectsTo);
</script>

<svelte:head>
	<title>23.1 — What a Design System Is · Design System Engineering</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 23.1 · Mini-build</p>
		<h1>Design System Overview Map</h1>
		<p class="lede">
			Click each layer to explore its role and see how it connects to
			the rest of the design system.
		</p>
	</header>

	<div class="layer-grid">
		{#each layers as layer (layer.id)}
			<button
				type="button"
				class="layer-card"
				class:layer-card--active={layer.id === activeLayerId}
				class:layer-card--connected={connectedLayers.includes(layer.id)}
				onclick={() => { activeLayerId = layer.id; }}
			>
				<span class="layer-card__label">{layer.label}</span>
				<span class="layer-card__count">{layer.examples.length} items</span>
			</button>
		{/each}
	</div>

	<article class="detail-panel" aria-live="polite">
		<h2>{activeLayer.label}</h2>
		<p class="detail-panel__desc">{activeLayer.description}</p>

		<h3>Examples from PE7</h3>
		<ul class="example-list">
			{#each activeLayer.examples as example (example)}
				<li class="example-item">
					{#if activeLayerId === 'tokens'}
						<code>{example}</code>
					{:else}
						{example}
					{/if}
				</li>
			{/each}
		</ul>

		<div class="connections">
			<h3>Connects to</h3>
			<div class="connection-tags">
				{#each connectedLayers as connected (connected)}
					<button
						type="button"
						class="connection-tag"
						onclick={() => { activeLayerId = connected; }}
					>
						{layers.find((l: LayerInfo) => l.id === connected)?.label}
					</button>
				{/each}
			</div>
		</div>
	</article>
</section>

<style>
	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 50ch;
	}

	.layer-grid {
		display: grid;
		gap: var(--space-sm);
		grid-template-columns: 1fr;
	}

	@media (min-width: 768px) {
		.layer-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.layer-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: start;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out),
		            box-shadow var(--dur-fast) var(--ease-out);
	}

	.layer-card:hover {
		border-color: var(--color-brand);
	}

	.layer-card--active {
		border-color: var(--color-brand);
		box-shadow: var(--shadow-md);
	}

	.layer-card--connected:not(.layer-card--active) {
		border-color: var(--color-text-muted);
		border-style: dashed;
	}

	.layer-card__label {
		font-size: var(--text-lg);
		font-weight: 600;
	}

	.layer-card__count {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.detail-panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
	}

	.detail-panel__desc {
		color: var(--color-text-muted);
		font-size: var(--text-base);
	}

	.example-list {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.example-item {
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
	}

	.connections {
		margin-block-start: var(--space-md);
	}

	.connection-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.connection-tag {
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface-2);
		border: 1px solid var(--color-brand);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--color-brand);
		min-block-size: 32px;
		transition: background var(--dur-fast) var(--ease-out);
	}

	.connection-tag:hover {
		background: var(--color-brand);
		color: oklch(100% 0 0);
	}

	h3 {
		margin-block: var(--space-md) var(--space-sm);
		font-size: var(--text-base);
	}
</style>
