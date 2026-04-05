<!--
    Lesson 6.4 — Native CSS nesting.
    Mini-build: a single card whose every state, attribute, and media query
    lives nested inside one rule block.
-->
<script lang="ts">
	let expanded: boolean = $state(false);

	function toggle(): void {
		expanded = !expanded;
	}

	function onKey(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggle();
		}
	}
</script>

<svelte:head>
	<title>Lesson 6.4 · CSS nesting · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 6.4: a card whose every state lives inside a single nested rule."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.4 · Mini-build</p>
		<h1>One rule, every state</h1>
		<p class="lede">
			Hover, focus, <code>aria-expanded</code>, a nested media query, and a nested pseudo-element
			— all in the same selector block.
		</p>
	</header>

	<button
		type="button"
		class="card"
		aria-expanded={expanded}
		onclick={toggle}
		onkeydown={onKey}
	>
		<h2 class="card__title">A nested card</h2>
		<p class="card__hint">Click or press Enter to toggle</p>
		{#if expanded}
			<p class="card__body">
				Every rule you see in this card is nested inside one block. Open DevTools and compare.
			</p>
		{/if}
	</button>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 100);
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

	.card {
		display: block;
		inline-size: 100%;
		text-align: start;
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		min-block-size: 44px;
		cursor: pointer;
		transition: border-color var(--dur-fast) var(--ease-out);
		position: relative;

		&::after {
			content: '▸';
			position: absolute;
			inset-block-start: var(--space-md);
			inset-inline-end: var(--space-md);
			transition: transform var(--dur-base) var(--ease-out);
		}

		&:hover {
			border-color: var(--color-brand);
		}

		&:focus-visible {
			outline: 2px solid var(--color-brand);
			outline-offset: 2px;
		}

		&[aria-expanded='true'] {
			border-color: var(--color-brand);
			background: oklch(from var(--color-brand) 96% 0.03 h);

			&::after {
				transform: rotate(90deg);
			}
		}

		& .card__title {
			margin: 0 0 var(--space-xs);
			font-size: var(--text-lg);
			color: var(--color-brand);
		}

		& .card__hint {
			margin: 0;
			font-size: var(--text-sm);
			color: var(--color-text-muted);
		}

		& .card__body {
			margin-block-start: var(--space-sm);
		}

		@media (min-width: 768px) {
			padding: var(--space-lg);

			& .card__title {
				font-size: var(--text-xl);
			}
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card,
		.card::after {
			transition: none;
		}
	}
</style>
