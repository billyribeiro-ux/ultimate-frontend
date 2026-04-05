<!--
	Lesson 4.4 mini-build — Keyed each with visible focus preservation.
	Type into an input, then click Rotate. The typed text follows the item.
-->
<script lang="ts">
	interface Task {
		id: string;
		title: string;
	}

	let tasks: Task[] = $state([
		{ id: 't1', title: 'Buy milk' },
		{ id: 't2', title: 'Call mom' },
		{ id: 't3', title: 'Write docs' },
		{ id: 't4', title: 'Pay rent' }
	]);

	function rotate(): void {
		const [first, ...rest] = tasks;
		tasks = [...rest, first];
	}

	function shuffle(): void {
		const shuffled: Task[] = [...tasks];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j: number = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		tasks = shuffled;
	}
</script>

<svelte:head>
	<title>Lesson 4.4 · each keys · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 4.4 mini-build: a keyed #each block keeps typed input text and focus attached to the right task when the list reorders."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/04-control-flow">← Module 4</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 4.4 · Mini-build</p>
		<h1>Keys keep identity</h1>
		<p class="lede">
			Type into one of the inputs, then click <strong>Rotate</strong>. The typed text follows
			its task because the <code>#each</code> block is keyed by <code>task.id</code>.
		</p>
	</header>

	<div class="controls">
		<button type="button" class="btn" onclick={rotate}>Rotate</button>
		<button type="button" class="btn btn--ghost" onclick={shuffle}>Shuffle</button>
	</div>

	<ul class="list">
		{#each tasks as task (task.id)}
			<li class="row">
				<span class="id">{task.id}</span>
				<input class="input" bind:value={task.title} aria-label="Task title" />
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(66% 0.2 300);
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
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.controls {
		display: flex;
		gap: var(--space-sm);
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: oklch(99% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.btn--ghost {
		background: transparent;
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
		min-block-size: 44px;
	}

	.id {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		min-inline-size: 3ch;
	}

	.input {
		flex: 1;
		min-block-size: 44px;
		padding-inline: var(--space-sm);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);

		&:focus-visible {
			outline: 2px solid var(--color-brand);
			outline-offset: 1px;
			border-color: var(--color-brand);
		}
	}
</style>
