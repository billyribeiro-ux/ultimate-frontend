<!--
	Lesson 12.7 — Error boundaries with <svelte:boundary>
	Mini-build: three dashboard cards, middle one wrapped in a boundary that
	catches render errors from a toggleable "explode" component.
-->
<script lang="ts">
	import Risky from './Risky.svelte';

	let shouldThrow = $state<boolean>(false);
	let key = $state<number>(0);

	function trigger(): void {
		shouldThrow = true;
		key += 1;
	}
</script>

<svelte:head>
	<title>Lesson 12.7 · Error boundaries · Ultimate Frontend</title>
	<meta
		name="description"
		content="A boundary that catches a render error from a single card without taking down the rest of the page."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/12-performance">← Module 12</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 12.7 · Mini-build</p>
		<h1>One card fails, the dashboard keeps working</h1>
		<p class="lede">
			Click the "throw" button. The middle card renders a fallback; the other two cards are
			untouched. Click "reset" to retry the risky card.
		</p>
	</header>

	<div class="cards">
		<article class="card">
			<h2>Card A</h2>
			<p>Healthy. Rendering normally.</p>
		</article>

		<svelte:boundary onerror={(error) => console.error('Boundary caught:', error)}>
			{#key key}
				<article class="card">
					<h2>Risky card</h2>
					<Risky shouldThrow={shouldThrow} />
					<button type="button" onclick={trigger}>Throw error</button>
				</article>
			{/key}

			{#snippet failed(error: unknown, reset: () => void)}
				<article class="card error">
					<h2>Risky card (failed)</h2>
					<p>
						This card crashed: {error instanceof Error ? error.message : 'Unknown error'}
					</p>
					<button
						type="button"
						onclick={() => {
							shouldThrow = false;
							reset();
						}}
					>
						Reset
					</button>
				</article>
			{/snippet}
		</svelte:boundary>

		<article class="card">
			<h2>Card C</h2>
			<p>Healthy. Rendering normally.</p>
		</article>
	</div>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 80);
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
		display: grid;
		gap: var(--space-md);
		grid-template-columns: 1fr;

		@media (min-width: 768px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.card {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-sm);
	}

	.card.error {
		background: oklch(from var(--color-brand) 96% 0.03 h);
		border-color: var(--color-brand);
	}

	.card h2 {
		font-size: var(--text-lg);
		margin: 0;
	}

	button {
		justify-self: start;
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: var(--color-brand);
		color: oklch(15% 0.02 80);
		border-radius: var(--radius-md);
		font-weight: 700;
	}

	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
	}
</style>
