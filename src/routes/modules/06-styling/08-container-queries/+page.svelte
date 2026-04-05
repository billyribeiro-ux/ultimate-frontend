<!--
    Lesson 6.8 — Container queries.
    Mini-build: same card component in two containers of different widths.
-->
<script lang="ts">
	let split: number = $state(60);

	function onSplit(event: Event): void {
		split = Number((event.target as HTMLInputElement).value);
	}
</script>

<svelte:head>
	<title>Lesson 6.8 · Container queries · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 6.8: one card, two containers, automatic layout switching."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.8 · Mini-build</p>
		<h1>Same card, two containers</h1>
		<p class="lede">
			No media queries. The card's layout is decided by the width of its nearest container
			ancestor. Drag the slider to see it flip.
		</p>
	</header>

	<label class="field">
		<span>Wide column share ({split}%)</span>
		<input type="range" min="20" max="80" step="1" value={split} oninput={onSplit} />
	</label>

	<div class="splitpane" style:--left="{split}%">
		<div class="host host--wide">
			<p class="host__label">Wide container ({split}%)</p>
			<article class="card">
				<div class="card__media">IMG</div>
				<div class="card__body">
					<h3 class="card__title">Beautiful product</h3>
					<p class="card__desc">A product with a longer description that wraps into the available inline space.</p>
					<button type="button" class="card__btn">Buy</button>
				</div>
			</article>
		</div>
		<div class="host host--narrow">
			<p class="host__label">Narrow container ({100 - split}%)</p>
			<article class="card">
				<div class="card__media">IMG</div>
				<div class="card__body">
					<h3 class="card__title">Beautiful product</h3>
					<p class="card__desc">Same component, narrower container.</p>
					<button type="button" class="card__btn">Buy</button>
				</div>
			</article>
		</div>
	</div>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 340);
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

	.field {
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

	.splitpane {
		display: grid;
		grid-template-columns: var(--left) 1fr;
		gap: var(--space-sm);
		min-block-size: 18rem;
	}

	.host {
		container-type: inline-size;
		padding: var(--space-sm);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.host__label {
		margin: 0 0 var(--space-sm);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.card {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);

		@container (min-width: 28rem) {
			grid-template-columns: 8rem 1fr;
			align-items: center;
		}
	}

	.card__media {
		display: grid;
		place-items: center;
		min-block-size: 6rem;
		background: var(--color-brand);
		color: oklch(98% 0.01 340);
		border-radius: var(--radius-sm);
		font-weight: 700;
	}

	.card__title {
		margin: 0;
		font-size: clamp(1rem, 4cqi, 1.5rem);
	}

	.card__desc {
		margin: var(--space-xs) 0 var(--space-sm);
		color: var(--color-text-muted);
	}

	.card__btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: oklch(98% 0.01 340);
		font-weight: 600;
	}
</style>
