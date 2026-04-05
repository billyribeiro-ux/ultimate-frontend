<!--
	Lesson 8.1 — What SvelteKit adds to Svelte.
	Mini-build: a "feature map" showing which parts of your stack are Svelte
	(component language) and which are SvelteKit (framework on top). No routing
	features are used yet — that starts in 8.4 — so we keep the page to typed
	constants and a scoped stylesheet, exactly like Module 1.
-->
<script lang="ts">
	interface StackLayer {
		id: string;
		name: string;
		owner: 'Svelte' | 'SvelteKit';
		summary: string;
	}

	const layers: StackLayer[] = [
		{
			id: 'components',
			name: 'Components (.svelte files)',
			owner: 'Svelte',
			summary: 'The compiler that turns markup, script and style into JS + CSS.'
		},
		{
			id: 'runes',
			name: 'Reactivity (runes)',
			owner: 'Svelte',
			summary: '$state, $derived, $effect — Svelte-level, nothing to do with the server.'
		},
		{
			id: 'routing',
			name: 'File-based routing',
			owner: 'SvelteKit',
			summary: '+page.svelte / +layout.svelte / +error.svelte map URLs to components.'
		},
		{
			id: 'ssr',
			name: 'Server-side rendering',
			owner: 'SvelteKit',
			summary: 'Renders your components to HTML on the server so the first paint is instant.'
		},
		{
			id: 'load',
			name: 'Data loading (load functions)',
			owner: 'SvelteKit',
			summary: '+page.ts / +page.server.ts return typed data your component reads.'
		},
		{
			id: 'hooks',
			name: 'Server hooks (hooks.server.ts)',
			owner: 'SvelteKit',
			summary: 'One file that sees every incoming request — auth, locals, logging.'
		},
		{
			id: 'adapters',
			name: 'Deployment adapters',
			owner: 'SvelteKit',
			summary: 'Ship the same app to Node, Vercel, Cloudflare, Netlify or static.'
		}
	];
</script>

<svelte:head>
	<title>Lesson 8.1 · What SvelteKit adds · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 8.1 mini-build — see which parts of the stack belong to Svelte and which belong to SvelteKit."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/08-routing">← Module 8</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 8.1 · Mini-build</p>
		<h1>Svelte vs SvelteKit — a feature map</h1>
		<p class="lede">
			Svelte is the component language. SvelteKit is the application framework on top. This table
			lists the pieces so you never have to wonder again which docs to open when something breaks.
		</p>
	</header>

	<ul class="layers" aria-label="Stack layers">
		{#each layers as layer (layer.id)}
			<li class="layer layer--{layer.owner.toLowerCase()}">
				<p class="layer__owner">{layer.owner}</p>
				<p class="layer__name">{layer.name}</p>
				<p class="layer__summary">{layer.summary}</p>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 230);
	}

	.crumbs a {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-decoration: none;

		&:hover {
			color: var(--color-brand);
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

	.layers {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.layer {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		border-inline-start: 4px solid var(--color-brand);
		min-block-size: 44px;
	}

	.layer--svelte {
		border-inline-start-color: oklch(70% 0.2 25);
	}

	.layer__owner {
		font-size: var(--text-xs);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin: 0;
	}

	.layer--svelte .layer__owner {
		color: oklch(60% 0.2 25);
	}

	.layer__name {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}

	.layer__summary {
		font-size: var(--text-base);
		color: var(--color-text-muted);
		margin-block-start: var(--space-xs);
	}
</style>
