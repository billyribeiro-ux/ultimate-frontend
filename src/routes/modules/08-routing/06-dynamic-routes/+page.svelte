<!--
	Lesson 8.6 — Dynamic routes — index page with links to the [slug] child.
-->
<script lang="ts">
	interface Demo {
		id: string;
		slug: string;
		label: string;
	}

	const demos: Demo[] = [
		{ id: 'd1', slug: 'svelte-5', label: 'svelte-5' },
		{ id: 'd2', slug: 'sveltekit-routing', label: 'sveltekit-routing' },
		{ id: 'd3', slug: 'type-safe-params', label: 'type-safe-params' }
	];
</script>

<svelte:head>
	<title>Lesson 8.6 · Dynamic routes · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 8.6 mini-build — dynamic routes using [slug] and reading params from $app/state."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing">← Module 8</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 8.6 · Mini-build</p>
		<h1>One folder, many URLs</h1>
		<p class="lede">
			Pick a slug. The same <code>[slug]/+page.svelte</code> file handles all of them, reading
			<code>page.params.slug</code> from <code>$app/state</code>.
		</p>
	</header>

	<ul class="demos" aria-label="Demo slugs">
		{#each demos as demo (demo.id)}
			<li>
				<a class="demo" href="/modules/08-routing/06-dynamic-routes/{demo.slug}">
					<code>/modules/08-routing/06-dynamic-routes/{demo.slug}</code>
					<span class="demo__label">{demo.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.18 55);
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

	.demos {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.demo {
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
		transition: transform var(--dur-fast) var(--ease-out);

		&:hover {
			transform: translateX(2px);
		}
	}

	.demo code {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		background: transparent;
		padding: 0;
	}

	.demo__label {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-brand);
	}
</style>
