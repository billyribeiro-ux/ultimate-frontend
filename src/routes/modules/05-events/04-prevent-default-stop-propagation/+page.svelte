<!--
    Lesson 5.4 — preventDefault and stopPropagation.
    Mini-build: card with nested delete button (stopPropagation) plus a
    form that would reload the page without preventDefault.
-->
<script lang="ts">
	interface Task {
		id: number;
		title: string;
		body: string;
		expanded: boolean;
	}

	let tasks: Task[] = $state([
		{ id: 1, title: 'Read the lesson', body: 'preventDefault and stopPropagation are independent.', expanded: false },
		{ id: 2, title: 'Click the red ×', body: 'Without stopPropagation, the card would also expand.', expanded: false },
		{ id: 3, title: 'Submit the form below', body: 'Without preventDefault, the whole page would reload.', expanded: false }
	]);

	let submittedText: string = $state('(nothing yet)');
	let formInput: string = $state('');

	function toggle(id: number): void {
		tasks = tasks.map((t) => (t.id === id ? { ...t, expanded: !t.expanded } : t));
	}

	function onCardKey(event: KeyboardEvent, id: number): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggle(id);
		}
	}

	function remove(event: MouseEvent, id: number): void {
		event.stopPropagation();
		tasks = tasks.filter((t) => t.id !== id);
	}

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		submittedText = formInput || '(empty)';
		formInput = '';
	}

	function onFormInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		formInput = target.value;
	}
</script>

<svelte:head>
	<title>Lesson 5.4 · preventDefault & stopPropagation · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 5.4: stopPropagation in a nested button and preventDefault in a form."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/05-events">← Module 5</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 5.4 · Mini-build</p>
		<h1>Two methods every form depends on</h1>
	</header>

	<section aria-labelledby="cards-heading" class="stack">
		<h2 id="cards-heading">stopPropagation in action</h2>
		{#if tasks.length === 0}
			<p>All tasks removed. Reload the page to reset.</p>
		{:else}
			<ul class="cards">
				{#each tasks as task (task.id)}
					<li class="card">
						<div
							class="card__inner"
							role="button"
							tabindex="0"
							aria-expanded={task.expanded}
							onclick={() => toggle(task.id)}
							onkeydown={(e) => onCardKey(e, task.id)}
						>
							<span class="card__title">{task.title}</span>
							{#if task.expanded}
								<p class="card__body">{task.body}</p>
							{/if}
						</div>
						<button
							type="button"
							class="card__delete"
							aria-label="Delete {task.title}"
							onclick={(e) => remove(e, task.id)}
						>
							×
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section aria-labelledby="form-heading" class="stack">
		<h2 id="form-heading">preventDefault in action</h2>
		<form class="demo-form" onsubmit={handleSubmit}>
			<label class="field">
				<span>Your message</span>
				<input
					type="text"
					placeholder="type and press submit"
					value={formInput}
					oninput={onFormInput}
				/>
			</label>
			<button type="submit" class="btn">Submit</button>
		</form>
		<p>Last submission: <code>{submittedText}</code></p>
	</section>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 140);
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

	.cards {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.card {
		display: flex;
		align-items: stretch;
		gap: var(--space-sm);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.card__inner {
		flex: 1 1 auto;
		padding: var(--space-md);
		min-block-size: 44px;
		cursor: pointer;
	}

	.card__inner:focus-visible {
		outline: 2px solid var(--color-brand);
		outline-offset: -2px;
	}

	.card__title {
		font-weight: 600;
	}

	.card__body {
		margin-block-start: var(--space-sm);
		color: var(--color-text-muted);
	}

	.card__delete {
		flex: 0 0 auto;
		min-inline-size: 44px;
		min-block-size: 44px;
		background: var(--color-error);
		color: oklch(98% 0.01 25);
		font-size: var(--text-lg);
		font-weight: 700;
	}

	.card__delete:focus-visible {
		outline: 2px solid var(--color-brand);
		outline-offset: -2px;
	}

	.demo-form {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		align-items: end;
	}

	.field {
		display: grid;
		gap: var(--space-xs);
		flex: 1 1 14rem;

		& span {
			font-size: var(--text-sm);
			color: var(--color-text-muted);
		}

		& input {
			min-block-size: 44px;
			padding-inline: var(--space-sm);
			border: 1px solid var(--color-border);
			border-radius: var(--radius-md);
			background: var(--color-surface);
			color: var(--color-text);
		}

		& input:focus-visible {
			outline: 2px solid var(--color-brand);
			outline-offset: 2px;
		}
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: oklch(15% 0.02 140);
		font-weight: 600;
	}
</style>
