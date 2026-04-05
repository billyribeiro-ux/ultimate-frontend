<!--
	Lesson 4.6 mini-build — {#key} forces a subtree to rebuild.
	A coloured tile fades in every time `index` changes, because {#key index}
	wraps the tile and Svelte destroys/recreates the element on every key change.
-->
<script lang="ts">
	interface Palette {
		id: string;
		label: string;
		hue: number;
	}

	const palettes: Palette[] = [
		{ id: 'violet', label: 'Violet', hue: 280 },
		{ id: 'teal', label: 'Teal', hue: 180 },
		{ id: 'amber', label: 'Amber', hue: 60 },
		{ id: 'rose', label: 'Rose', hue: 10 }
	];

	let index: number = $state(0);
	const current = $derived(palettes[index]);

	function next(): void {
		index = (index + 1) % palettes.length;
	}
</script>

<svelte:head>
	<title>Lesson 4.6 · key block · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 4.6 mini-build: use Svelte's #key block to force a subtree to rebuild so a CSS animation can replay."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/04-control-flow">← Module 4</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 4.6 · Mini-build</p>
		<h1>Replay on demand</h1>
		<p class="lede">
			The tile below is wrapped in <code>#key current.id</code>. Every click destroys the
			old tile and creates a new one, so the CSS <code>fade-in</code> animation restarts.
		</p>
	</header>

	<button type="button" class="btn" onclick={next}>Next palette</button>

	{#key current.id}
		<div
			class="tile"
			style:--hue={current.hue}
			role="img"
			aria-label="{current.label} palette"
		>
			<span class="tile__label">{current.label}</span>
		</div>
	{/key}
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 270);
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
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.btn {
		align-self: flex-start;
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: oklch(99% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.tile {
		display: flex;
		align-items: flex-end;
		block-size: 12rem;
		padding: var(--space-lg);
		background: linear-gradient(
			135deg,
			oklch(70% 0.2 var(--hue, 270)),
			oklch(55% 0.18 var(--hue, 270))
		);
		color: oklch(99% 0 0);
		border-radius: var(--radius-lg);
		animation: fade-in var(--dur-base) var(--ease-out);
	}

	.tile__label {
		font-size: var(--text-xl);
		font-weight: 700;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: scale(0.96);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tile {
			animation: none;
		}
	}
</style>
