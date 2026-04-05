<!--
	Lesson 8.4 — File-based routing.
	Mini-build: a route tree visualiser. Each row is either a folder or a
	+file; files show the URL they produce.
-->
<script lang="ts">
	interface RouteNode {
		id: string;
		name: string;
		url: string | null;
		depth: number;
		kind: 'file' | 'folder';
	}

	const tree: RouteNode[] = [
		{ id: 'r1', name: 'src/routes/', url: null, depth: 0, kind: 'folder' },
		{ id: 'r2', name: '+page.svelte', url: '/', depth: 1, kind: 'file' },
		{ id: 'r3', name: 'about/', url: null, depth: 1, kind: 'folder' },
		{ id: 'r4', name: '+page.svelte', url: '/about', depth: 2, kind: 'file' },
		{ id: 'r5', name: 'blog/', url: null, depth: 1, kind: 'folder' },
		{ id: 'r6', name: '+page.svelte', url: '/blog', depth: 2, kind: 'file' },
		{ id: 'r7', name: '[slug]/', url: null, depth: 2, kind: 'folder' },
		{ id: 'r8', name: '+page.svelte', url: '/blog/:slug', depth: 3, kind: 'file' },
		{ id: 'r9', name: '+page.server.ts', url: null, depth: 3, kind: 'file' },
		{ id: 'r10', name: '+error.svelte', url: null, depth: 3, kind: 'file' }
	];
</script>

<svelte:head>
	<title>Lesson 8.4 · File-based routing · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 8.4 mini-build — a folder tree visualiser that maps src/routes entries to their URLs."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing">← Module 8</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 8.4 · Mini-build</p>
		<h1>Files become URLs</h1>
		<p class="lede">
			Every folder in <code>src/routes</code> is a URL segment. Every <code>+page.svelte</code>
			marks an endpoint. No router config — the folder tree is the route tree.
		</p>
	</header>

	<ul class="tree" aria-label="Route tree">
		{#each tree as node (node.id)}
			<li class="tree__row tree__row--{node.kind}" style="--depth: {node.depth}">
				<span class="tree__name">{node.name}</span>
				<span class="tree__url">{node.url ?? '—'}</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.16 190);
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

	.tree {
		list-style: none;
		padding: 0;
		margin: 0;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.tree__row {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-sm);
		padding-block: var(--space-sm);
		padding-inline-start: calc(var(--space-md) + var(--depth) * var(--space-md));
		padding-inline-end: var(--space-md);
		border-block-end: 1px solid var(--color-border);
		min-block-size: 44px;
		align-items: center;
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-sm);
	}

	.tree__row:last-child {
		border-block-end: 0;
	}

	.tree__row--folder .tree__name {
		color: var(--color-brand);
		font-weight: 600;
	}

	.tree__url {
		color: var(--color-text-muted);
	}
</style>
