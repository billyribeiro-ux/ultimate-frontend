<!--
	Lesson 11.1 — The prop drilling problem
	Mini-build: a diagram that flips between a drilled tree and a fixed tree so
	the student can see the smell before they learn the fix.
-->
<script lang="ts">
	type NodeId = 'App' | 'Layout' | 'Page' | 'Section' | 'Button';

	interface TreeNode {
		id: NodeId;
		label: string;
		role: string;
	}

	const tree: TreeNode[] = [
		{ id: 'App', label: 'App', role: 'owns currentUserId' },
		{ id: 'Layout', label: 'Layout', role: 'never reads it' },
		{ id: 'Page', label: 'Page', role: 'never reads it' },
		{ id: 'Section', label: 'Section', role: 'never reads it' },
		{ id: 'Button', label: 'Button', role: 'needs currentUserId' }
	];

	let mode = $state<'drilled' | 'fixed'>('drilled');

	const drilledCarriers = $derived<ReadonlySet<NodeId>>(
		mode === 'drilled'
			? new Set<NodeId>(['App', 'Layout', 'Page', 'Section', 'Button'])
			: new Set<NodeId>(['App', 'Button'])
	);
</script>

<svelte:head>
	<title>Lesson 11.1 · The prop drilling problem · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 11.1 mini-build: a diagram of a drilled component tree next to a fixed one, so you can see the smell before you learn the fix."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/11-state">← Module 11</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 11.1 · Mini-build</p>
		<h1>The prop drilling problem, visualised</h1>
		<p class="lede">
			Click the toggle to see the difference between forwarding a prop through every
			intermediate component and delivering it through a context tunnel.
		</p>
	</header>

	<div class="controls" role="group" aria-label="Tree mode">
		<button
			type="button"
			class:active={mode === 'drilled'}
			onclick={() => (mode = 'drilled')}
		>
			Drilled
		</button>
		<button
			type="button"
			class:active={mode === 'fixed'}
			onclick={() => (mode = 'fixed')}
		>
			Fixed
		</button>
	</div>

	<ol class="tree" aria-label="Component tree">
		{#each tree as node, index (node.id)}
			{@const hasId = drilledCarriers.has(node.id)}
			<li
				class="node"
				class:carries={hasId}
				style:--depth={index}
				data-has-id={hasId ? 'true' : 'false'}
			>
				<article>
					<p class="node__label">{node.label}</p>
					<p class="node__role">{node.role}</p>
					{#if hasId}
						<span class="node__tag">currentUserId</span>
					{/if}
				</article>
			</li>
		{/each}
	</ol>

	<aside class="explain">
		<h2>What to look for</h2>
		<p>
			In <strong>drilled</strong> mode, every node carries the
			<code>currentUserId</code> tag — even the three intermediate components that have no
			reason to know the value exists. In <strong>fixed</strong> mode, only the owner and the
			leaf carry the tag; the intermediates are clean. Lesson 11.2 shows how to build the
			"fixed" version with a typed context.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 25);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;

			&:hover {
				color: var(--color-brand);
			}
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

	.controls {
		display: flex;
		gap: var(--space-sm);
	}

	.controls button {
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-weight: 600;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.controls button.active {
		border-color: var(--color-brand);
		color: var(--color-brand);
	}

	.tree {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.node {
		padding-inline-start: calc(var(--depth) * var(--space-md));
	}

	.node article {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.node.carries article {
		border-color: var(--color-brand);
	}

	.node__label {
		font-weight: 700;
		margin: 0;
	}

	.node__role {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	.node__tag {
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
		padding: 0.2em 0.6em;
		background: oklch(from var(--color-brand) 92% 0.05 h);
		color: var(--color-brand);
		border-radius: var(--radius-full);
		grid-column: 1 / -1;
		justify-self: start;
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

	@media (prefers-reduced-motion: reduce) {
		.node article,
		.controls button {
			transition: none;
		}
	}
</style>
