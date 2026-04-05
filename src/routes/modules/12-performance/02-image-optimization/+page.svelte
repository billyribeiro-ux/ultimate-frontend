<!--
	Lesson 12.2 — Image optimization
	Mini-build: a "CLS-safe vs not" demo with a toggle. Uses inline SVGs
	to avoid shipping real hero art.
-->
<script lang="ts">
	let withDims = $state<boolean>(true);
	let reloadKey = $state<number>(0);

	function reload(): void {
		reloadKey += 1;
	}
</script>

<svelte:head>
	<title>Lesson 12.2 · Image optimization · Ultimate Frontend</title>
	<meta
		name="description"
		content="Demo of CLS-safe image loading: width and height attributes reserve the box before the image arrives."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/12-performance">← Module 12</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 12.2 · Mini-build</p>
		<h1>Images that do not jump the page</h1>
		<p class="lede">
			Toggle <code>width</code>/<code>height</code> on the image below and reload. Watch the
			rest of the content shift on the broken variant and stay put on the fixed one.
		</p>
	</header>

	<div class="controls">
		<label class="switch">
			<input type="checkbox" bind:checked={withDims} />
			<span>Use width/height (CLS safe)</span>
		</label>
		<button type="button" onclick={reload}>Reload image</button>
	</div>

	{#key reloadKey}
		{#if withDims}
			<img
				class="hero"
				src="/placeholder-16x9.svg?v={reloadKey}"
				alt="Placeholder hero artwork"
				width="1600"
				height="900"
				fetchpriority="high"
				loading="eager"
			/>
		{:else}
			<img
				class="hero"
				src="/placeholder-16x9.svg?v={reloadKey}"
				alt="Placeholder hero artwork"
				loading="eager"
			/>
		{/if}
	{/key}

	<div class="caption">
		<h2>After the hero</h2>
		<p>
			This paragraph should stay in the same place regardless of whether the image is still
			loading. If it jumps when the image arrives, that is a layout shift and it counts toward
			CLS. If the image element declared its intrinsic <code>width</code> and
			<code>height</code>, the box was already reserved and this text never moved.
		</p>
	</div>

	<aside class="decision">
		<h2>The six-attribute decision flow</h2>
		<ol>
			<li>Always set <code>width</code> and <code>height</code>.</li>
			<li>Above the fold → <code>loading="eager"</code>, LCP candidate also gets
				<code>fetchpriority="high"</code>.</li>
			<li>Below the fold → <code>loading="lazy"</code>.</li>
			<li>Photograph or complex art → wrap in <code>&lt;picture&gt;</code> with AVIF → WebP → JPEG.</li>
			<li>Responsive display size → add <code>srcset</code> and <code>sizes</code>.</li>
			<li>Accessibility first → always write descriptive <code>alt</code> text.</li>
		</ol>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 210);
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

	.controls {
		display: flex;
		gap: var(--space-md);
		align-items: center;
		flex-wrap: wrap;
	}

	.switch {
		display: flex;
		gap: var(--space-sm);
		align-items: center;
		min-block-size: 44px;
	}

	.switch input {
		inline-size: 20px;
		block-size: 20px;
	}

	.controls button {
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: var(--color-brand);
		color: oklch(15% 0.02 210);
		border-radius: var(--radius-md);
		font-weight: 700;
	}

	.hero {
		inline-size: 100%;
		background: linear-gradient(135deg, var(--color-brand), oklch(from var(--color-brand) 50% 0.1 h));
		border-radius: var(--radius-lg);
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}

	.caption {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.caption h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}

	.decision {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}

	.decision h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}

	.decision ol {
		margin: 0;
		padding-inline-start: var(--space-md);
		display: grid;
		gap: var(--space-xs);
	}
</style>
