<!--
	Lesson 8.11 — Sunrise destination page. Warm OKLCH palette.
-->
<svelte:head>
	<title>Lesson 8.11 · Sunrise · Ultimate Frontend</title>
	<meta name="description" content="Sunrise transition target." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing/11-page-transitions">← Back to hub</a>
	</nav>

	<header>
		<p class="eyebrow">Scene 1</p>
		<h1>Sunrise</h1>
		<p class="lede">
			The browser crossfaded between the hub and this page using the View Transitions API. If your
			browser does not support the API, you just got a normal instant navigation — which is the
			correct fallback.
		</p>
	</header>
</section>

<style>
	section {
		--color-brand: oklch(75% 0.16 55);
		--color-surface: oklch(97% 0.04 65);
		--color-surface-2: oklch(94% 0.06 60);
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
