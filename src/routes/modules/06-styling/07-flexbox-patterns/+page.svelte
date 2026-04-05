<!--
    Lesson 6.7 — Flexbox patterns.
-->
<script lang="ts">
	const tags: readonly string[] = [
		'svelte',
		'typescript',
		'css',
		'oklch',
		'grid',
		'flexbox',
		'accessibility',
		'container-queries',
		'animations',
		'pe7'
	];

	let navDirection: 'row' | 'column' = $state('row');

	function toggleNav(): void {
		navDirection = navDirection === 'row' ? 'column' : 'row';
	}
</script>

<svelte:head>
	<title>Lesson 6.7 · Flexbox · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 6.7: tag chip row, holy grail layout, and a togglable nav direction."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.7 · Mini-build</p>
		<h1>Flexbox for one-dimensional layouts</h1>
	</header>

	<section aria-labelledby="chips-heading">
		<h2 id="chips-heading">Wrap-friendly chip row</h2>
		<ul class="chips">
			{#each tags as tag (tag)}
				<li class="chip">#{tag}</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="nav-heading">
		<h2 id="nav-heading">Togglable nav direction</h2>
		<button type="button" class="btn" onclick={toggleNav}>
			Direction: <strong>{navDirection}</strong>
		</button>
		<nav class="nav" data-dir={navDirection} aria-label="Demo nav">
			<a href="#home">Home</a>
			<a href="#docs">Docs</a>
			<a href="#about">About</a>
			<a href="#contact">Contact</a>
		</nav>
	</section>

	<section aria-labelledby="grail-heading">
		<h2 id="grail-heading">Holy grail (flex column)</h2>
		<div class="grail">
			<div class="grail__head">Header</div>
			<div class="grail__body">Body — this block grows to push the footer down.</div>
			<div class="grail__foot">Footer</div>
		</div>
	</section>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.18 290);
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

	h2 {
		font-size: var(--text-xl);
		margin-block: var(--space-md) var(--space-sm);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.chip {
		flex: 0 0 auto;
		padding-inline: var(--space-sm);
		padding-block: var(--space-xs);
		background: oklch(from var(--color-brand) 92% 0.05 h);
		color: oklch(from var(--color-brand) 30% 0.1 h);
		border-radius: var(--radius-full);
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: oklch(98% 0.01 290);
		font-weight: 600;
		margin-block-end: var(--space-sm);
	}

	.nav {
		display: flex;
		gap: var(--space-sm);
		flex-direction: column;
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.nav[data-dir='row'] {
		flex-direction: row;
		flex-wrap: wrap;
	}

	.nav a {
		flex: 0 0 auto;
		min-block-size: 44px;
		padding-inline: var(--space-sm);
		padding-block: var(--space-sm);
		border-radius: var(--radius-sm);
		text-decoration: none;
		color: var(--color-text);
	}

	.nav a:hover {
		background: oklch(from var(--color-brand) 92% 0.05 h);
	}

	.grail {
		display: flex;
		flex-direction: column;
		min-block-size: 20rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.grail__head,
	.grail__foot {
		flex: 0 0 auto;
		padding: var(--space-md);
		background: oklch(from var(--color-brand) 94% 0.04 h);
	}

	.grail__body {
		flex: 1 1 auto;
		padding: var(--space-md);
	}
</style>
