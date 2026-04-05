<script lang="ts">
	interface Todo {
		id: string;
		text: string;
		done: boolean;
	}

	const todos: Todo[] = $state([
		{ id: 'seed-1', text: 'Learn $state with arrays', done: false },
		{ id: 'seed-2', text: 'Try mutating push/splice', done: false }
	]);

	let draft: string = $state('');

	function addTodo(): void {
		const text = draft.trim();
		if (text.length === 0) return;
		todos.push({
			id: crypto.randomUUID(),
			text,
			done: false
		});
		draft = '';
	}

	function toggle(id: string): void {
		const item = todos.find((t) => t.id === id);
		if (item) item.done = !item.done;
	}

	function remove(id: string): void {
		const index = todos.findIndex((t) => t.id === id);
		if (index !== -1) todos.splice(index, 1);
	}

	function clearCompleted(): void {
		for (let i = todos.length - 1; i >= 0; i--) {
			if (todos[i].done) todos.splice(i, 1);
		}
	}

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		addTodo();
	}
</script>

<svelte:head>
	<title>Lesson 2.4 · $state arrays · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 2.4 mini-build: a typed todo list driven by reactive array state."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/02-reactivity">← Module 2</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 2.4 · Mini-build</p>
		<h1>A reactive todo list</h1>
		<p class="lede">
			Every push, splice, and index assignment is reactive. No spreads, no reassignment —
			plain JavaScript array methods are enough.
		</p>
	</header>

	<form class="composer" onsubmit={handleSubmit}>
		<label class="visually-hidden" for="todo-input">New todo</label>
		<input
			id="todo-input"
			type="text"
			bind:value={draft}
			placeholder="What needs doing?"
		/>
		<button type="submit">Add</button>
	</form>

	<ul class="todos">
		{#each todos as todo (todo.id)}
			<li class="todo" class:todo--done={todo.done}>
				<label class="todo__check">
					<input type="checkbox" checked={todo.done} onchange={() => toggle(todo.id)} />
					<span>{todo.text}</span>
				</label>
				<button type="button" onclick={() => remove(todo.id)} aria-label="Delete">
					×
				</button>
			</li>
		{/each}
	</ul>

	<footer class="footer">
		<span>{todos.filter((t) => !t.done).length} left</span>
		<button type="button" onclick={clearCompleted}>Clear completed</button>
	</footer>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 130);
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

	.visually-hidden {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}

	.composer {
		display: flex;
		gap: var(--space-sm);
	}

	.composer input {
		flex: 1;
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.composer button {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: var(--color-surface);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.todos {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.todo {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-block-size: 44px;
		transition: opacity var(--dur-fast) var(--ease-out);
	}

	.todo--done {
		opacity: 0.55;
	}

	.todo--done .todo__check span {
		text-decoration: line-through;
	}

	.todo__check {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.todo__check input {
		inline-size: 1.25rem;
		block-size: 1.25rem;
	}

	.todo button {
		min-inline-size: 44px;
		min-block-size: 44px;
		color: var(--color-error);
		font-size: var(--text-lg);
	}

	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.footer button {
		color: var(--color-brand);
		font-weight: 600;
		min-block-size: 44px;
	}

	@media (prefers-reduced-motion: reduce) {
		.todo {
			transition: none;
		}
	}
</style>
