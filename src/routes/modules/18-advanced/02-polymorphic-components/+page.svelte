<script lang="ts">
	import As from '$lib/components/advanced/As.svelte';

	let clickCount: number = $state(0);

	function handleClick(): void {
		clickCount++;
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}
</script>

<svelte:head>
	<title>18.2 — Polymorphic Components · Advanced Patterns</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 18.2 · Mini-build</p>
		<h1>Polymorphic Components</h1>
		<p class="lede">
			One component, many HTML elements. The as prop changes semantics
			without duplicating styles.
		</p>
	</header>

	<section class="demo" aria-labelledby="demo-heading">
		<h2 id="demo-heading">The Same Visual, Three Elements</h2>

		<div class="button-grid">
			<div class="button-example">
				<p class="label">as="button"</p>
				<As as="button" class="btn" onclick={handleClick}>
					Clicked {clickCount} times
				</As>
				<p class="note">Native button. Submits forms, responds to Enter/Space.</p>
			</div>

			<div class="button-example">
				<p class="label">as="a"</p>
				<As as="a" class="btn" href="#polymorphic-demo">
					Navigate (link)
				</As>
				<p class="note">Native anchor. Navigates on click, shows URL on hover.</p>
			</div>

			<div class="button-example">
				<p class="label">as="span"</p>
				<As
					as="span"
					class="btn"
					role="button"
					tabindex={0}
					onclick={handleClick}
					onkeydown={handleKeydown}
				>
					Span Button ({clickCount})
				</As>
				<p class="note">Span with role="button". Needs tabindex and key handlers.</p>
			</div>
		</div>
	</section>

	<section class="demo" aria-labelledby="cards-heading" id="polymorphic-demo">
		<h2 id="cards-heading">Polymorphic Cards</h2>

		<div class="card-grid">
			<As as="article" class="card">
				<h3>Article Card</h3>
				<p>Renders as an article element for blog posts and standalone content.</p>
			</As>

			<As as="section" class="card">
				<h3>Section Card</h3>
				<p>Renders as a section element for thematic grouping within a page.</p>
			</As>

			<As as="li" class="card">
				<h3>List Item Card</h3>
				<p>Renders as a li element when used inside an ordered or unordered list.</p>
			</As>
		</div>
	</section>

	<section class="demo" aria-labelledby="inspect-heading">
		<h2 id="inspect-heading">DevTools Verification</h2>
		<p>
			Open DevTools and inspect each element above. Despite identical styling,
			the underlying HTML elements differ. The scoped class hash is the same
			across all variants, proving styles come from a single source.
		</p>
	</section>
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

	.demo {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.button-grid {
		display: grid;
		gap: var(--space-lg);
		margin-block-start: var(--space-md);
	}

	@media (min-width: 768px) {
		.button-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.button-example {
		display: grid;
		gap: var(--space-sm);
		align-content: start;
	}

	.label {
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--color-brand);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
	}

	.note {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.card-grid {
		display: grid;
		gap: var(--space-md);
		margin-block-start: var(--space-md);
	}

	@media (min-width: 768px) {
		.card-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	:global(.btn) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		min-inline-size: 44px;
		background: var(--color-brand);
		color: var(--color-surface);
		font-weight: 600;
		font-size: var(--text-sm);
		border-radius: var(--radius-md);
		text-decoration: none;
		cursor: pointer;
		transition: background var(--dur-fast) var(--ease-out);
	}

	:global(.btn:hover) {
		background: var(--color-brand-dim);
	}

	:global(.card) {
		padding: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	:global(.card h3) {
		font-size: var(--text-base);
		font-weight: 600;
		margin-block-end: var(--space-xs);
	}

	:global(.card p) {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
