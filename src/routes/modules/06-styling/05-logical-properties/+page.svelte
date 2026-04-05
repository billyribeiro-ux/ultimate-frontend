<!--
    Lesson 6.5 — Logical properties.
    Mini-build: toggle direction LTR/RTL and watch a card flip using only
    logical properties.
-->
<script lang="ts">
	let direction: 'ltr' | 'rtl' = $state('ltr');

	function toggle(): void {
		direction = direction === 'ltr' ? 'rtl' : 'ltr';
	}
</script>

<svelte:head>
	<title>Lesson 6.5 · Logical properties · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 6.5: a card laid out with logical properties that flips cleanly between LTR and RTL."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.5 · Mini-build</p>
		<h1>Direction-agnostic layout</h1>
		<p class="lede">
			Every spacing, border, and inset below uses <code>inline-start</code>,
			<code>inline-end</code>, <code>block-start</code>, or <code>block-end</code>. Toggle
			direction and watch the whole layout flip without a single rule change.
		</p>
	</header>

	<div class="toolbar">
		<button type="button" class="btn" onclick={toggle}>
			Direction is <strong>{direction}</strong> — click to flip
		</button>
	</div>

	<article class="demo" dir={direction}>
		<div class="avatar" aria-hidden="true">A</div>
		<div class="demo__body">
			<h2>A card with logical properties</h2>
			<p>The avatar sits on the inline-start side. The arrow sits on the inline-end side. Both follow the reading direction.</p>
		</div>
		<span class="arrow" aria-hidden="true">→</span>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 60);
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

	.toolbar {
		display: flex;
		justify-content: flex-start;
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: oklch(15% 0.02 60);
		font-weight: 600;
	}

	.demo {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding-inline: var(--space-md);
		padding-block: var(--space-md);
		background: var(--color-surface-2);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
	}

	.avatar {
		flex: 0 0 auto;
		inline-size: 3rem;
		block-size: 3rem;
		border-radius: var(--radius-full);
		background: var(--color-brand);
		color: oklch(98% 0.01 60);
		display: grid;
		place-items: center;
		font-weight: 700;
		font-size: var(--text-lg);
		margin-inline-end: var(--space-sm);
	}

	.demo__body {
		flex: 1 1 auto;

		& h2 {
			margin: 0 0 var(--space-xs);
			font-size: var(--text-lg);
			color: var(--color-brand);
		}

		& p {
			margin: 0;
			color: var(--color-text-muted);
		}
	}

	.arrow {
		flex: 0 0 auto;
		font-size: var(--text-xl);
		color: var(--color-brand);
		padding-inline-start: var(--space-sm);
	}
</style>
