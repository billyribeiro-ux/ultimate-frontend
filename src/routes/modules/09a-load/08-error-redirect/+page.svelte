<!--
	Lesson 9A.8 — index page with links to three [slug] targets.
	Two succeed; one throws error(404) from the server load.
-->
<script lang="ts">
	interface SlugLink {
		id: string;
		slug: string;
		outcome: 'found' | 'missing';
	}

	const links: SlugLink[] = [
		{ id: 'a', slug: 'hello', outcome: 'found' },
		{ id: 'b', slug: 'about', outcome: 'found' },
		{ id: 'c', slug: 'missing', outcome: 'missing' }
	];
</script>

<svelte:head>
	<title>Lesson 9A.8 · Error handling · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 9A.8 mini-build — click a slug to see a success page or a 404 rendered by +error.svelte."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09a-load">← Module 9A</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9A.8 · Mini-build</p>
		<h1>Try a slug — some exist, one does not</h1>
		<p class="lede">
			Click the <strong>missing</strong> link to trigger a typed 404 thrown from the server load.
			The nearest <code>+error.svelte</code> renders the friendly error page.
		</p>
	</header>

	<ul class="links">
		{#each links as link (link.id)}
			<li>
				<a
					class="link link--{link.outcome}"
					href="/modules/09a-load/08-error-redirect/{link.slug}"
				>
					<span class="link__slug">/{link.slug}</span>
					<span class="link__outcome">{link.outcome === 'found' ? 'post exists' : 'throws error(404)'}</span>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.18 260);
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

	.links {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.link {
		display: grid;
		gap: var(--space-xs);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		min-block-size: 44px;
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
	}

	.link--missing {
		border-inline-start-color: var(--color-error);
	}

	.link__slug {
		font-weight: 600;
		color: var(--color-brand);
	}

	.link--missing .link__slug {
		color: var(--color-error);
	}

	.link__outcome {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
</style>
