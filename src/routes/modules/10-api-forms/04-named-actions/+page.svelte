<script lang="ts">
	interface Note {
		id: string;
		title: string;
		body: string;
		createdAt: Date;
	}

	type FormResult =
		| { which: 'create'; ok?: true; title?: string; body?: string; error?: string }
		| { which: 'remove'; ok?: true; id?: string; error?: string }
		| null;

	let { data, form }: { data: { notes: Note[] }; form: FormResult } = $props();
</script>

<svelte:head>
	<title>Lesson 10.4 · Named actions · Ultimate Frontend</title>
	<meta
		name="description"
		content="Multiple forms on one page via named actions — create and delete notes with SvelteKit actions."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/10-api-forms">← Module 10</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 10.4 · Named actions</p>
		<h1>Two forms, one page</h1>
		<p class="lede">
			The Notes app, part 2: add a delete button to every note using a second
			named action.
		</p>
	</header>

	<div class="grid">
		<form method="POST" action="?/create" class="composer">
			<div class="field">
				<label for="title">Title</label>
				<input
					id="title"
					name="title"
					value={form?.which === 'create' ? (form.title ?? '') : ''}
					aria-invalid={form?.which === 'create' && !!form.error}
				/>
			</div>
			<div class="field">
				<label for="body">Body</label>
				<textarea id="body" name="body" rows="3"
					>{form?.which === 'create' ? (form.body ?? '') : ''}</textarea
				>
			</div>
			{#if form?.which === 'create' && form.error}
				<p class="err">{form.error}</p>
			{/if}
			<button type="submit">Create note</button>
		</form>

		<ul class="notes">
			{#each data.notes as n (n.id)}
				<li class="note">
					<div class="note__content">
						<h2>{n.title}</h2>
						<p>{n.body}</p>
						<time>{new Date(n.createdAt).toLocaleString()}</time>
					</div>
					<form method="POST" action="?/remove" class="note__del">
						<input type="hidden" name="id" value={n.id} />
						<button type="submit" aria-label="Delete note">×</button>
					</form>
				</li>
			{/each}
		</ul>
	</div>

	{#if form?.which === 'create' && form.ok}
		<p class="ok" role="status">Created "{form.title}".</p>
	{/if}
	{#if form?.which === 'remove' && form.ok}
		<p class="ok" role="status">Note deleted.</p>
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(60% 0.18 150);
	}
	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: var(--text-sm);
		min-block-size: 44px;
		display: inline-flex;
		align-items: center;
	}
	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.lede {
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		max-inline-size: var(--prose-max);
	}
	.grid {
		display: grid;
		gap: var(--space-md);
		grid-template-columns: 1fr;

		@media (min-width: 768px) {
			grid-template-columns: 1fr 1fr;
		}
	}
	.composer {
		display: grid;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
		align-self: start;
	}
	.field {
		display: grid;
		gap: var(--space-xs);
	}
	.field label {
		font-weight: 600;
	}
	.field input,
	.field textarea {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		font: inherit;
	}
	[aria-invalid='true'] {
		border-color: var(--color-error);
	}
	.composer button {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(20% 0.02 150);
		border-radius: var(--radius-md);
		font-weight: 700;
		justify-self: start;
	}
	.notes {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-sm);
	}
	.note {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
	}
	.note__content h2 {
		font-size: var(--text-lg);
		margin: 0;
	}
	.note__content p {
		margin: var(--space-xs) 0;
	}
	.note__content time {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
	.note__del button {
		min-block-size: 44px;
		min-inline-size: 44px;
		font-size: var(--text-lg);
		color: var(--color-error);
		border-radius: var(--radius-md);
	}
	.err {
		color: var(--color-error);
		font-size: var(--text-sm);
		margin: 0;
	}
	.ok {
		color: var(--color-success);
		padding: var(--space-md);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-md);
	}
</style>
