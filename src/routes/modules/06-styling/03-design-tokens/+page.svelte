<!--
    Lesson 6.3 — Design token showcase.
    Mini-build: a reference page displaying every PE7 token with a live sample.
-->
<script lang="ts">
	const colorTokens: readonly string[] = [
		'brand',
		'brand-dim',
		'surface',
		'surface-2',
		'text',
		'text-muted',
		'border',
		'error',
		'success',
		'warning'
	];
	const spaceTokens: readonly string[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
	const textTokens: readonly string[] = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', 'hero'];
	const radiusTokens: readonly string[] = ['sm', 'md', 'lg', 'xl', 'full'];
	const shadowTokens: readonly string[] = ['sm', 'md', 'lg'];
	const durTokens: readonly string[] = ['instant', 'fast', 'base', 'slow', 'slower'];
</script>

<svelte:head>
	<title>Lesson 6.3 · Design tokens · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 6.3: a live reference of every PE7 design token."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.3 · Mini-build</p>
		<h1>The PE7 token reference</h1>
		<p class="lede">
			Every design decision in the course lives here. Bookmark this page.
		</p>
	</header>

	<section aria-labelledby="colors-heading">
		<h2 id="colors-heading">Colour</h2>
		<ul class="swatches">
			{#each colorTokens as name (name)}
				<li>
					<div class="swatch" style:background="var(--color-{name})"></div>
					<code>--color-{name}</code>
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="spaces-heading">
		<h2 id="spaces-heading">Spacing (fluid)</h2>
		<ul class="bars">
			{#each spaceTokens as name (name)}
				<li>
					<code>--space-{name}</code>
					<div class="bar" style:block-size="var(--space-{name})"></div>
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="type-heading">
		<h2 id="type-heading">Typography (fluid)</h2>
		<ul class="type-list">
			{#each textTokens as name (name)}
				<li style:font-size="var(--text-{name})">
					<code>--text-{name}</code> — Typography is a conversation.
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="radii-heading">
		<h2 id="radii-heading">Radii</h2>
		<ul class="radii">
			{#each radiusTokens as name (name)}
				<li>
					<div class="radius-sample" style:border-radius="var(--radius-{name})"></div>
					<code>--radius-{name}</code>
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="shadows-heading">
		<h2 id="shadows-heading">Shadows</h2>
		<ul class="shadows">
			{#each shadowTokens as name (name)}
				<li>
					<div class="shadow-sample" style:box-shadow="var(--shadow-{name})"></div>
					<code>--shadow-{name}</code>
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="motion-heading">
		<h2 id="motion-heading">Motion durations</h2>
		<ul class="motion-list">
			{#each durTokens as name (name)}
				<li>
					<code>--dur-{name}</code>
					<span class="dot" style:--dur="var(--dur-{name})"></span>
				</li>
			{/each}
		</ul>
	</section>
</section>

<style>
	section.page {
		--color-brand: oklch(68% 0.2 160);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
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

	h2 {
		font-size: var(--text-xl);
		margin-block: var(--space-md) var(--space-sm);
	}

	.swatches {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
		gap: var(--space-sm);
	}

	.swatch {
		block-size: 4rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.bars {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.bars li {
		display: grid;
		grid-template-columns: 8rem 1fr;
		align-items: center;
		gap: var(--space-sm);
	}

	.bar {
		background: var(--color-brand);
		border-radius: var(--radius-sm);
		inline-size: 100%;
	}

	.type-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.radii {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
		gap: var(--space-sm);
	}

	.radius-sample {
		block-size: 5rem;
		background: var(--color-brand);
	}

	.shadows {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		gap: var(--space-lg);
		padding: var(--space-md);
	}

	.shadow-sample {
		block-size: 5rem;
		background: var(--color-surface);
		border-radius: var(--radius-md);
	}

	.motion-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.motion-list li {
		display: grid;
		grid-template-columns: 8rem 1fr;
		align-items: center;
		gap: var(--space-sm);
	}

	.dot {
		inline-size: 1rem;
		block-size: 1rem;
		border-radius: var(--radius-full);
		background: var(--color-brand);
		animation: pulse var(--dur) var(--ease-in-out) infinite alternate;
	}

	@keyframes pulse {
		to {
			transform: translateX(60%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dot {
			animation: none;
		}
	}

	code {
		font-size: var(--text-sm);
	}
</style>
