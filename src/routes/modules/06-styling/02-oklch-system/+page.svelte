<!--
    Lesson 6.2 — OKLCH colour system.
    Mini-build: three sliders (L, C, H), a live preview, and six synced swatches.
-->
<script lang="ts">
	let l: number = $state(72);
	let c: number = $state(0.2);
	let h: number = $state(200);

	const cssString = $derived(`oklch(${l}% ${c.toFixed(3)} ${h})`);

	const offsets: readonly number[] = [0, 60, 120, 180, 240, 300];

	function onL(event: Event): void {
		l = Number((event.target as HTMLInputElement).value);
	}
	function onC(event: Event): void {
		c = Number((event.target as HTMLInputElement).value);
	}
	function onH(event: Event): void {
		h = Number((event.target as HTMLInputElement).value);
	}
</script>

<svelte:head>
	<title>Lesson 6.2 · OKLCH studio · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 6.2: a live OKLCH picker demonstrating perceptual uniformity."
	/>
</svelte:head>

<section class="page stack" style:--live={cssString}>
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.2 · Mini-build</p>
		<h1>OKLCH studio</h1>
		<p class="lede">
			Move the sliders. Notice how the six swatches stay equally bright as you change L, and
			only shift hue as you change H. That is perceptual uniformity.
		</p>
	</header>

	<article class="preview">
		<div class="preview__swatch" aria-label="Current colour"></div>
		<code class="preview__code">{cssString}</code>
	</article>

	<form class="sliders">
		<label class="slider">
			<span>L — Lightness <code>{l}%</code></span>
			<input type="range" min="0" max="100" step="1" value={l} oninput={onL} />
		</label>
		<label class="slider">
			<span>C — Chroma <code>{c.toFixed(3)}</code></span>
			<input type="range" min="0" max="0.4" step="0.005" value={c} oninput={onC} />
		</label>
		<label class="slider">
			<span>H — Hue <code>{h}°</code></span>
			<input type="range" min="0" max="360" step="1" value={h} oninput={onH} />
		</label>
	</form>

	<section aria-label="Palette across six hues">
		<h2>Palette at this L/C across six hues</h2>
		<ul class="palette">
			{#each offsets as offset (offset)}
				<li
					class="palette__swatch"
					style:background="oklch({l}% {c} {(h + offset) % 360})"
					aria-label="Hue {(h + offset) % 360}"
				>
					{(h + offset) % 360}°
				</li>
			{/each}
		</ul>
	</section>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.18 200);
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

	.preview {
		display: grid;
		gap: var(--space-md);
		grid-template-columns: auto 1fr;
		align-items: center;
		padding: var(--space-md);
		background: var(--color-surface-2);
		border-radius: var(--radius-lg);
	}

	.preview__swatch {
		inline-size: 8rem;
		block-size: 8rem;
		border-radius: var(--radius-md);
		background: var(--live);
		box-shadow: var(--shadow-md);
	}

	.preview__code {
		font-family: ui-monospace, monospace;
		font-size: var(--text-base);
		padding: var(--space-sm);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
	}

	.sliders {
		display: grid;
		gap: var(--space-sm);
	}

	.slider {
		display: grid;
		gap: var(--space-xs);

		& span {
			font-size: var(--text-sm);
			color: var(--color-text-muted);
		}

		& input {
			min-block-size: 44px;
		}
	}

	.palette {
		list-style: none;
		padding: 0;
		margin: var(--space-sm) 0 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-sm);

		@media (min-width: 640px) {
			grid-template-columns: repeat(6, 1fr);
		}
	}

	.palette__swatch {
		display: grid;
		place-items: center;
		min-block-size: 5rem;
		border-radius: var(--radius-md);
		color: oklch(15% 0.02 270);
		font-family: ui-monospace, monospace;
		font-weight: 600;
	}
</style>
