<!--
    Lesson 6.9 — Per-page color personalities.
    Mini-build: three identical cards, each wrapped in a section that
    overrides --color-brand to a different hue.
-->
<script lang="ts">
	let liveHue: number = $state(140);

	function onHue(event: Event): void {
		liveHue = Number((event.target as HTMLInputElement).value);
	}
</script>

<svelte:head>
	<title>Lesson 6.9 · Per-page personalities · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 6.9: three identical cards wearing three different personalities via --color-brand override."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.9 · Mini-build</p>
		<h1>One component, three personalities</h1>
		<p class="lede">
			Every card below is the same HTML. Each sits inside a section that overrides exactly one
			token: <code>--color-brand</code>.
		</p>
	</header>

	<div class="row">
		<section class="card-host card-host--coral" aria-label="Coral personality">
			<article class="card">
				<h2>Coral</h2>
				<p>oklch(68% 0.2 20)</p>
				<button type="button" class="btn">Action</button>
			</article>
		</section>

		<section class="card-host card-host--lime" aria-label="Lime personality">
			<article class="card">
				<h2>Lime</h2>
				<p>oklch(68% 0.2 140)</p>
				<button type="button" class="btn">Action</button>
			</article>
		</section>

		<section class="card-host card-host--violet" aria-label="Violet personality">
			<article class="card">
				<h2>Violet</h2>
				<p>oklch(68% 0.2 280)</p>
				<button type="button" class="btn">Action</button>
			</article>
		</section>
	</div>

	<section class="live" aria-label="Live hue slider">
		<h2>Drag to change one card's personality</h2>
		<label class="field">
			<span>Hue: {liveHue}°</span>
			<input type="range" min="0" max="360" step="1" value={liveHue} oninput={onHue} />
		</label>
		<div class="card-host" style:--color-brand="oklch(68% 0.2 {liveHue})">
			<article class="card">
				<h2>Live card</h2>
				<p>Hue = {liveHue}°</p>
				<button type="button" class="btn">Action</button>
			</article>
		</div>
	</section>
</section>

<style>
	section.page {
		--color-brand: oklch(68% 0.18 250);
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

	.row {
		display: grid;
		gap: var(--space-md);
		grid-template-columns: 1fr;

		@media (min-width: 768px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.card-host--coral {
		--color-brand: oklch(68% 0.2 20);
	}

	.card-host--lime {
		--color-brand: oklch(68% 0.2 140);
	}

	.card-host--violet {
		--color-brand: oklch(68% 0.2 280);
	}

	.card {
		padding: var(--space-lg);
		background: linear-gradient(
			135deg,
			var(--color-surface-2),
			oklch(from var(--color-brand) 94% 0.05 h)
		);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);

		& h2 {
			margin: 0 0 var(--space-xs);
			color: var(--color-brand);
		}

		& p {
			margin: 0 0 var(--space-sm);
			color: var(--color-text-muted);
			font-family: ui-monospace, monospace;
		}
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: oklch(from var(--color-brand) 15% 0.02 h);
		font-weight: 600;
		transition: background var(--dur-fast) var(--ease-out);
	}

	.btn:hover {
		background: oklch(from var(--color-brand) calc(l - 0.08) c h);
	}

	.live {
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);

		& h2 {
			font-size: var(--text-lg);
			margin-block-end: var(--space-sm);
		}
	}

	.field {
		display: grid;
		gap: var(--space-xs);
		margin-block-end: var(--space-md);

		& span {
			font-size: var(--text-sm);
			color: var(--color-text-muted);
		}

		& input {
			min-block-size: 44px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.btn {
			transition: none;
		}
	}
</style>
