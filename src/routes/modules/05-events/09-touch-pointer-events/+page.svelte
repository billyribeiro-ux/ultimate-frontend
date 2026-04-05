<!--
    Lesson 5.9 — Touch events and pointer events.
    Mini-build: a swipe-to-dismiss card list using unified PointerEvents.
-->
<script lang="ts">
	interface Card {
		id: number;
		title: string;
		x: number;
		startX: number;
		dragging: boolean;
	}

	let cards: Card[] = $state([
		{ id: 1, title: 'Swipe me left or right', x: 0, startX: 0, dragging: false },
		{ id: 2, title: 'Past 100 pixels = dismiss', x: 0, startX: 0, dragging: false },
		{ id: 3, title: 'Works with mouse, touch, pen', x: 0, startX: 0, dragging: false }
	]);

	const threshold: number = 100;

	function onDown(event: PointerEvent, id: number): void {
		const target = event.currentTarget as HTMLElement;
		target.setPointerCapture(event.pointerId);
		cards = cards.map((c) =>
			c.id === id ? { ...c, startX: event.clientX - c.x, dragging: true } : c
		);
	}

	function onMove(event: PointerEvent, id: number): void {
		const card = cards.find((c) => c.id === id);
		if (card === undefined || !card.dragging) return;
		cards = cards.map((c) =>
			c.id === id ? { ...c, x: event.clientX - c.startX } : c
		);
	}

	function onUp(event: PointerEvent, id: number): void {
		const card = cards.find((c) => c.id === id);
		if (card === undefined) return;
		if (Math.abs(card.x) > threshold) {
			cards = cards.filter((c) => c.id !== id);
		} else {
			cards = cards.map((c) => (c.id === id ? { ...c, x: 0, dragging: false } : c));
		}
	}

	function reset(): void {
		cards = [
			{ id: 1, title: 'Swipe me left or right', x: 0, startX: 0, dragging: false },
			{ id: 2, title: 'Past 100 pixels = dismiss', x: 0, startX: 0, dragging: false },
			{ id: 3, title: 'Works with mouse, touch, pen', x: 0, startX: 0, dragging: false }
		];
	}
</script>

<svelte:head>
	<title>Lesson 5.9 · Pointer events · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 5.9: swipe-to-dismiss cards built with unified PointerEvents."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/05-events">← Module 5</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 5.9 · Mini-build</p>
		<h1>Swipe to dismiss</h1>
		<p class="lede">
			One handler set, three input types. Works with mouse, touch, and pen without branching.
		</p>
	</header>

	{#if cards.length === 0}
		<p>All cards dismissed. <button type="button" class="btn" onclick={reset}>Reset</button></p>
	{:else}
		<ul class="cards">
			{#each cards as card (card.id)}
				<li>
					<div
						class="card"
						class:card--dragging={card.dragging}
						style:transform="translateX({card.x}px)"
						style:opacity={1 - Math.min(Math.abs(card.x) / 200, 0.6)}
						role="presentation"
						onpointerdown={(e) => onDown(e, card.id)}
						onpointermove={(e) => onMove(e, card.id)}
						onpointerup={(e) => onUp(e, card.id)}
						onpointercancel={(e) => onUp(e, card.id)}
					>
						<span class="card__title">{card.title}</span>
						<span class="card__delta" aria-hidden="true">{Math.round(card.x)}px</span>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 30);
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

	.cards {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-md);
		min-block-size: 64px;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		touch-action: none;
		user-select: none;
		cursor: grab;
		transition: transform var(--dur-base) var(--ease-out);
	}

	.card--dragging {
		cursor: grabbing;
		box-shadow: var(--shadow-lg);
		transition: none;
	}

	.card__title {
		font-weight: 600;
	}

	.card__delta {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: oklch(15% 0.02 30);
		font-weight: 600;
	}

	@media (hover: hover) {
		.card:hover {
			border-color: var(--color-brand);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: none;
		}
	}
</style>
