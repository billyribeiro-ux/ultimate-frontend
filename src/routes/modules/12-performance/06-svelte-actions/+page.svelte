<!--
	Lesson 12.6 — Reusable Svelte actions
	Mini-build: three actions in action — click-outside dropdown, tooltip on hover/focus,
	and fade-in on intersect.
-->
<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside.svelte';
	import { intersect } from '$lib/actions/intersect.svelte';

	let menuOpen = $state<boolean>(false);
	let revealed = $state<boolean>(false);

	let tooltipVisible = $state<boolean>(false);
	let tooltipFocused = $state<boolean>(false);
</script>

<svelte:head>
	<title>Lesson 12.6 · Svelte actions · Ultimate Frontend</title>
	<meta
		name="description"
		content="Three production Svelte actions: clickOutside, a tooltip with keyboard support, and intersect-backed reveal."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/12-performance">← Module 12</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 12.6 · Mini-build</p>
		<h1>Three actions, three behaviours</h1>
		<p class="lede">
			Each demo uses a reusable <code>use:</code> action. No component lifecycle code — just
			a named, typed function attached to the element.
		</p>
	</header>

	<article class="demo">
		<h2>1. Click outside to close</h2>
		<div
			class="dropdown"
			use:clickOutside={{ onOutside: () => (menuOpen = false) }}
		>
			<button type="button" onclick={() => (menuOpen = !menuOpen)} aria-expanded={menuOpen}>
				{menuOpen ? 'Close menu' : 'Open menu'}
			</button>
			{#if menuOpen}
				<ul class="menu" role="menu">
					<li role="menuitem">Profile</li>
					<li role="menuitem">Settings</li>
					<li role="menuitem">Sign out</li>
				</ul>
			{/if}
		</div>
		<p class="hint">Click anywhere outside the menu — it closes.</p>
	</article>

	<article class="demo">
		<h2>2. Accessible tooltip (hover or focus)</h2>
		<div class="tooltip-host">
			<button
				type="button"
				onmouseenter={() => (tooltipVisible = true)}
				onmouseleave={() => (tooltipVisible = false)}
				onfocus={() => (tooltipFocused = true)}
				onblur={() => (tooltipFocused = false)}
				aria-describedby="tip-1"
			>
				Hover or focus me
			</button>
			{#if tooltipVisible || tooltipFocused}
				<span id="tip-1" role="tooltip" class="tooltip">
					Tooltips must respond to focus, not only hover.
				</span>
			{/if}
		</div>
	</article>

	<article class="demo">
		<h2>3. Reveal on scroll (IntersectionObserver)</h2>
		<p class="hint">Scroll down until the card below enters the viewport.</p>
		<div class="spacer">Scroll…</div>
		<div
			class="reveal"
			class:visible={revealed}
			use:intersect={{ onEnter: () => (revealed = true), once: true, threshold: 0.2 }}
		>
			I was hidden until I entered the viewport.
		</div>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.18 220);
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

	.demo {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-sm);
	}

	.demo h2 {
		font-size: var(--text-lg);
		margin: 0;
	}

	button {
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: var(--color-brand);
		color: oklch(15% 0.02 220);
		border-radius: var(--radius-md);
		font-weight: 700;
		justify-self: start;
	}

	.dropdown {
		position: relative;
		justify-self: start;
	}

	.menu {
		list-style: none;
		padding: var(--space-xs);
		margin: var(--space-xs) 0 0 0;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		position: absolute;
		inset-block-start: 100%;
		inset-inline-start: 0;
		display: grid;
		gap: var(--space-xs);
		inline-size: 12rem;
	}

	.menu li {
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		cursor: pointer;
	}

	.menu li:hover {
		background: var(--color-surface-2);
	}

	.tooltip-host {
		position: relative;
		justify-self: start;
	}

	.tooltip {
		position: absolute;
		inset-block-start: calc(100% + var(--space-xs));
		inset-inline-start: 0;
		padding: var(--space-xs) var(--space-sm);
		background: oklch(20% 0.02 220);
		color: oklch(96% 0 0);
		font-size: var(--text-sm);
		border-radius: var(--radius-md);
		white-space: nowrap;
	}

	.hint {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: 0;
	}

	.spacer {
		block-size: 50vh;
		display: grid;
		place-items: center;
		color: var(--color-text-muted);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
	}

	.reveal {
		padding: var(--space-lg);
		background: var(--color-brand);
		color: oklch(15% 0.02 220);
		border-radius: var(--radius-lg);
		font-weight: 700;
		text-align: center;
		opacity: 0;
		transform: translateY(16px);
		transition:
			opacity var(--dur-base) var(--ease-out),
			transform var(--dur-base) var(--ease-out);
	}

	.reveal.visible {
		opacity: 1;
		transform: translateY(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal {
			transition: none;
			transform: none;
			opacity: 1;
		}
	}
</style>
