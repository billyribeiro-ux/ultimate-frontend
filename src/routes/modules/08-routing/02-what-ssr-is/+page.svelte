<!--
	Lesson 8.2 — What SSR actually is.
	Mini-build: a page that is SSR-rendered so that "View Source" shows the
	full HTML, not an empty <div id="app"></div>. Typed constants only.
-->
<script lang="ts">
	const renderedAt: string = new Date().toISOString();
	const message: string =
		'This paragraph was rendered on the server. View Source proves it — no JavaScript required.';
</script>

<svelte:head>
	<title>Lesson 8.2 · What SSR is · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 8.2 mini-build — see the difference between View Source (pre-JS HTML) and Inspect (post-JS DOM)."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing">← Module 8</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 8.2 · Mini-build</p>
		<h1>View Source vs Inspect</h1>
		<p class="lede">
			Right-click this page and choose <strong>View Page Source</strong>. Then right-click again
			and choose <strong>Inspect</strong>. Compare the two. They should look almost identical —
			that is SSR.
		</p>
	</header>

	<article class="card">
		<p>{message}</p>
		<p class="timestamp">Rendered at: <time datetime={renderedAt}>{renderedAt}</time></p>
	</article>

	<aside class="explain">
		<h2>Why this matters</h2>
		<p>
			If you build the same page with a pure client-side framework, "View Source" shows an empty
			shell and the real content only appears after JavaScript executes. Search engines, social
			scrapers and users on slow connections see that empty shell first. SSR ships the final HTML
			on the very first byte.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 150);
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

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.timestamp {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-family: ui-monospace, monospace;
	}

	.explain {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}

	.explain h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}
</style>
