<!--
	Lesson 6.13 — animate:flip list reordering
-->
<script lang="ts">
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { DUR } from '$lib/motion';

	type Task = {
		id: number;
		title: string;
		hint: string;
	};

	let tasks: Task[] = $state([
		{ id: 1, title: 'Write the product brief', hint: 'Priority: high' },
		{ id: 2, title: 'Review dark-mode tokens', hint: 'Priority: medium' },
		{ id: 3, title: 'Schedule onboarding call', hint: 'Priority: medium' },
		{ id: 4, title: 'Refresh hero illustrations', hint: 'Priority: low' }
	]);

	const reduced = $derived(prefersReducedMotion.current);

	function moveUp(index: number): void {
		if (index <= 0) return;
		const next = [...tasks];
		const [item] = next.splice(index, 1);
		next.splice(index - 1, 0, item);
		tasks = next;
	}

	function moveDown(index: number): void {
		if (index >= tasks.length - 1) return;
		const next = [...tasks];
		const [item] = next.splice(index, 1);
		next.splice(index + 1, 0, item);
		tasks = next;
	}

	function shuffle(): void {
		tasks = [...tasks].sort(() => Math.random() - 0.5);
	}
</script>

<svelte:head>
	<title>Lesson 6.13 · animate:flip · Ultimate Frontend</title>
	<meta
		name="description"
		content="List reordering animated with animate:flip on a keyed each block."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.13 · Mini-build</p>
		<h1>Reorderable task list</h1>
		<p class="lead">
			Click Up or Down to move a task within the list. FLIP animates the position change smoothly.
			Try Shuffle to see many items move at once.
		</p>
	</header>

	<button class="shuffle" type="button" onclick={shuffle}>Shuffle</button>

	<ul class="tasks" role="list">
		{#each tasks as task, i (task.id)}
			<li
				class="task"
				animate:flip={{ duration: reduced ? 0 : DUR.base, easing: cubicOut }}
			>
				<div class="task__body">
					<strong>{task.title}</strong>
					<span>{task.hint}</span>
				</div>
				<div class="task__actions">
					<button
						type="button"
						aria-label="Move up"
						onclick={() => moveUp(i)}
						disabled={i === 0}
					>↑</button>
					<button
						type="button"
						aria-label="Move down"
						onclick={() => moveDown(i)}
						disabled={i === tasks.length - 1}
					>↓</button>
				</div>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.16 145);
	}

	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lead {
		color: var(--color-text-muted);
		max-inline-size: 56ch;
	}

	.shuffle {
		align-self: flex-start;
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: var(--color-surface);
		font-weight: 600;
		min-block-size: 2.75rem;
	}

	.tasks {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.task {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
	}

	.task__body {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.task__body span {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.task__actions {
		display: flex;
		gap: var(--space-xs);
	}

	.task__actions button {
		min-block-size: 2.75rem;
		min-inline-size: 2.75rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	.task__actions button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
