<!--
	Lesson 8.11 — Nightfall destination page. Cool OKLCH palette.
-->
<svelte:head>
	<title>Lesson 8.11 · Nightfall · Ultimate Frontend</title>
	<meta name="description" content="Nightfall transition target." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing/11-page-transitions">← Back to hub</a>
	</nav>

	<header>
		<p class="eyebrow">Scene 2</p>
		<h1>Nightfall</h1>
		<p class="lede">
			Use the back link to trigger the reverse transition. Each navigation re-runs the layout's
			<code>onNavigate</code> hook and starts a new view transition.
		</p>
	</header>
</section>

<style>
	section {
		--color-brand: oklch(60% 0.18 260);
		--color-surface: oklch(22% 0.04 270);
		--color-surface-2: oklch(28% 0.05 270);
		--color-text: oklch(94% 0.02 270);
		--color-text-muted: oklch(74% 0.03 270);
	}

	.crumbs a {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	h1 {
		color: var(--color-brand);
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}
</style>
